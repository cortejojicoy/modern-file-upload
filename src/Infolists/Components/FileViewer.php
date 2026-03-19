<?php

namespace Kukux\ModernFileUpload\Infolists\Components;

use Filament\Infolists\Components\Entry;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;

class FileViewer extends Entry
{
    protected string $view = 'modern-file-upload::infolists.components.file-viewer';

    protected string $disk = 'public';

    protected bool $isDownloadVisible = true;

    protected bool $arePdfThumbnailsVisible = true;

    public function disk(string $disk): static
    {
        $this->disk = $disk;

        return $this;
    }

    public function showDownload(bool $condition = true): static
    {
        $this->isDownloadVisible = $condition;

        return $this;
    }

    public function showPdfThumbnails(bool $condition = true): static
    {
        $this->arePdfThumbnailsVisible = $condition;

        return $this;
    }

    public function getFiles(): array
    {
        return collect(Arr::wrap($this->getState()))
            ->filter(fn (mixed $path): bool => filled($path) && is_string($path))
            ->map(function (string $path): array {
                try {
                    $mimeType = Storage::disk($this->disk)->mimeType($path) ?: 'application/octet-stream';
                    $url = Storage::disk($this->disk)->url($path);
                } catch (\Throwable) {
                    $mimeType = 'application/octet-stream';
                    $url = $path;
                }

                return [
                    'name' => basename($path),
                    'path' => $path,
                    'url' => $url,
                    'type' => $mimeType,
                    'is_image' => str_starts_with($mimeType, 'image/'),
                    'is_pdf' => $mimeType === 'application/pdf',
                ];
            })
            ->values()
            ->all();
    }

    public function isDownloadVisible(): bool
    {
        return $this->isDownloadVisible;
    }

    public function arePdfThumbnailsVisible(): bool
    {
        return $this->arePdfThumbnailsVisible;
    }
}
