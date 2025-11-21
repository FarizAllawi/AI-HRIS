<?php

namespace App\Http\Controllers;

use App\Repositories\Media\MediaRepositoryInterface;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MediaController extends Controller
{
    public function __construct(
        protected MediaRepositoryInterface $mediaRepository
    ) {}

    public function index(Request $request)
    {
        $media = $this->mediaRepository->all([
            'search' => $request->query('search')
        ]);
        return response()->json($media);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:102400',
            'is_private' => 'boolean',
        ]);

        $media = $this->mediaRepository->upload(
            $request->file('file'),
            $request->boolean('is_private', false)
        );

        return response()->json([
            'message' => 'File uploaded successfully.',
            'data' => $media,
        ], 201);
    }

    public function generateShareLink(Request $request, string $id)
    {
        $request->validate([
            'expires_in_minutes' => 'integer|min:1|max:1440',
            'max_downloads' => 'nullable|integer|min:1',
        ]);

        $media = $this->mediaRepository->find($id);
        abort_unless($media, 404, 'Media not found.');
        abort_unless($media->is_private, 400, 'Only private media can be shared temporarily.');

        $shared = $this->mediaRepository->generateShareLink(
            $media,
            $request->input('expires_in_minutes', 60),
            $request->input('max_downloads')
        );

        $link = route('media.access', ['token' => $shared->share_token]);

        return response()->json([
            'message' => 'Temporary share link generated.',
            'url' => $link,
            'expires_at' => $shared->share_expires_at,
            'max_downloads' => $shared->max_downloads,
        ]);
    }

    public function accessViaToken(string $token)
    {
        $media = $this->mediaRepository->findByToken($token);
        abort_unless($media, 404, 'Link expired or invalid.');

        $this->mediaRepository->incrementDownload($media);

        return new StreamedResponse(function () use ($media) {
            $this->mediaRepository->stream($media);
        });
    }

    public function stream(string $id)
    {
        $media = $this->mediaRepository->find($id);
        abort_unless($media, 404, 'Media not found.');
        abort_if($media->is_private, 403, 'Access denied to private media.');

        return new StreamedResponse(function () use ($media) {
            $this->mediaRepository->stream($media);
        });
    }

    public function download(string $id)
    {
        $media = $this->mediaRepository->find($id);
        abort_unless($media, 404, 'Media not found.');
        abort_if($media->is_private, 403, 'Access denied to private media.');

        $path = $this->mediaRepository->getFile($media);
        return response()->download($path, $media->name);
    }

    public function destroy(string $id)
    {
        $deleted = $this->mediaRepo->delete($id);
        return response()->json([
            'message' => $deleted ? 'Media deleted successfully.' : 'Failed to delete media.'
        ]);
    }
}
