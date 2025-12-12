<?php

namespace App\Http\Resources;

use App\Models\Media;
use App\Repositories\Media\MediaRepository;
use App\Repositories\Media\MediaRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'url' => $this->getTemporaryUrl($this->id),
            'filePath' => $this->file_path,
            'mimeType' => $this->mime_type,
            'size' => $this->size,
            'disk' => $this->disk,
            'maxDownload' => $this->max_download,
            'downloadCount' => $this->downloadCount,
            'createdAt' => $this->created_at
        ];
    }

    private function getTemporaryUrl(string $mediaId){
        $media = Media::find($mediaId);
        if ($media->disk === 'public') {
            return app(MediaRepositoryInterface::class)->getUrl($media);
        }
        return app(MediaRepositoryInterface::class)->getTemporaryUrl($media, 10);
    }
}
