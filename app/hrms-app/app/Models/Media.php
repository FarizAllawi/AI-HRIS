<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Media extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'name',
        'file_path',
        'mime_type',
        'size',
        'disk',
        'is_private',
        'share_token',
        'share_expires_at',
        'max_downloads',
        'download_count',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    protected $casts = [
        'is_private' => 'boolean',
        'share_expires_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function getUrlAttribute(): ?string
    {
        if ($this->is_private) {
            return null;
        }
        return asset('storage/' . $this->file_path);
    }

    public function isShareLinkValid(): bool
    {
        $notExpired = $this->share_expires_at && now()->lessThanOrEqualTo($this->share_expires_at);
        $notExceeded = is_null($this->max_downloads) || $this->download_count < $this->max_downloads;
        return $this->share_token && $notExpired && $notExceeded;
    }
}
