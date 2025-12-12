<?php

namespace App\Repositories\Media;

use App\Models\Media;
use App\Repositories\BaseRepository;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Carbon\Carbon;

class MediaRepository extends BaseRepository implements MediaRepositoryInterface
{
    public function __construct(Media $model)
    {
        parent::__construct($model);
    }

    public function upload(UploadedFile $file, bool $isPrivate = false, string $disk = 'public' | 'local'): Media
    {
        $path = $file->store('uploads/media', $disk);

        return $this->create([
            'name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
            'disk' => $disk,
            'is_private' => $isPrivate,
        ]);
    }

    public function getFile(Media $media)
    {
        return Storage::disk($media->disk)->path($media->file_path);
    }

    public function stream(Media $media)
    {
        $filePath = $this->getFile($media);
        abort_unless(file_exists($filePath), 404, 'File not found.');

        $mimeType = $media->mime_type;
        $size = filesize($filePath);

        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . $size);
        $handle = fopen($filePath, 'rb');
        fpassthru($handle);
        fclose($handle);
        exit;
    }

    public function generateShareLink(Media $media, int $minutes = 60, ?int $maxDownloads = null): Media
    {
        $token = Str::random(40);

        $media->update([
            'share_token' => $token,
            'share_expires_at' => Carbon::now()->addMinutes($minutes),
            'max_downloads' => $maxDownloads,
            'download_count' => 0,
        ]);

        return $media;
    }

    public function findByToken(string $token): ?Media
    {
        $media = $this->model->where('share_token', $token)->first();
        return ($media && $media->isShareLinkValid()) ? $media : null;
    }

    public function incrementDownload(Media $media): void
    {
        $media->increment('download_count');
        if ($media->max_downloads && $media->download_count >= $media->max_downloads) {
            $this->revokeShareLink($media);
        }
    }

    public function revokeShareLink(Media $media): void
    {
        $media->update([
            'share_token' => null,
            'share_expires_at' => null,
            'max_downloads' => null,
            'download_count' => 0,
        ]);
    }

    /**
     * Generate a temporary URL for private media.
     */
    public function getUrl(Media $media): string
    {
        $filePath = $this->getFile($media);
        abort_unless(file_exists($filePath), 404, 'File not found.');
        return Storage::url($media->file_path);
    }

    /**
     * Generate a temporary URL for private media.
     */
    public function getTemporaryUrl(Media $media, int $minutes = 10): string
    {
        $disk = Storage::disk($media->disk);

        if (method_exists($disk, 'temporaryUrl')) {
            return $disk->temporaryUrl(
                $media->file_path,
                now()->addMinutes($minutes)
            );
        }

        // fallback: generate share token instead
        $share = $this->generateShareLink($media, $minutes);
        return route('media.share', ['token' => $share->share_token]);
    }
}
