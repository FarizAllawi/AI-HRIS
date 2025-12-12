<?php

namespace App\Repositories\Media;

use App\Models\Media;
use App\Repositories\Contracts\BaseRepositoryInterface;
use Illuminate\Http\UploadedFile;

interface MediaRepositoryInterface extends BaseRepositoryInterface
{
    public function upload(UploadedFile $file, bool $isPrivate = false, string $disk = 'public' | 'local'): Media;

    public function getFile(Media $media);
    public function stream(Media $media);

    public function generateShareLink(Media $media, int $minutes = 60, ?int $maxDownloads = null): Media;

    public function findByToken(string $token): ?Media;

    public function incrementDownload(Media $media): void;

    public function revokeShareLink(Media $media): void;

    public function getUrl(Media $media): string;

    public function getTemporaryUrl(Media $media, int $minutes = 10): string;
}
