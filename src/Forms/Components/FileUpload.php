<?php

namespace Kukux\ModernFileUpload\Forms\Components;

use Filament\Forms\Components\Field;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

class FileUpload extends Field
{
    protected string $view = 'modern-file-upload::forms.components.file-upload';

    protected string $disk = 'public';

    protected ?string $accept = null;

    protected ?string $directory = null;

    protected bool $isMultiple = true;

    protected ?\Closure $fileActionCallback = null;

    protected function setUp(): void
    {
        parent::setUp();

        $this->afterStateHydrated(function (self $component, mixed $state): void {
            $normalizedState = $component->normalizeStateForMode($state);

            if ($component->isMultiple() && blank($normalizedState)) {
                $component->state([]);

                return;
            }

            if ($normalizedState !== $state) {
                $component->state($normalizedState);
            }
        });

        $this->dehydrateStateUsing(function (self $component, mixed $state): mixed {
            return $component->storeUploadedFiles(
                $component->normalizeStateForMode($state),
            );
        });
    }

    public function disk(string $disk): static
    {
        $this->disk = $disk;

        return $this;
    }

    public function directory(?string $directory): static
    {
        $this->directory = $directory;

        return $this;
    }

    public function multiple(bool $condition = true): static
    {
        $this->isMultiple = $condition;

        return $this;
    }

    public function accept(?string $types): static
    {
        $this->accept = $types;

        return $this;
    }

    public function fileAction(\Closure $callback): static
    {
        $this->fileActionCallback = $callback;

        return $this;
    }

    public function getFileAction(): ?array
    {
        if (! $this->fileActionCallback) {
            return null;
        }

        $result = $this->evaluate($this->fileActionCallback, [
            'record' => $this->getRecord(),
        ]);

        return [
            'method' => is_array($result) ? ($result['method'] ?? null) : null,
        ];
    }

    public function getFilesForJs(): array
    {
        $state = $this->normalizeStateForMode($this->getState());

        if (blank($state)) {
            return [];
        }

        return collect($this->wrapState($state))
            ->filter(fn (mixed $file): bool => filled($file))
            ->map(fn (mixed $file): ?array => $this->mapFileForJs($file))
            ->filter()
            ->values()
            ->all();
    }

    public function getDirectory(): ?string
    {
        return $this->directory;
    }

    public function getDisk(): string
    {
        return $this->disk;
    }

    public function getAccept(): ?string
    {
        return $this->accept;
    }

    public function getIsMultiple(): bool
    {
        return $this->isMultiple;
    }

    public function isMultiple(): bool
    {
        return $this->isMultiple;
    }

    protected function storeUploadedFiles(mixed $state): mixed
    {
        $state = $this->normalizeStateForMode($state);

        if ($this->isMultiple()) {
            return collect($this->wrapState($state))
                ->filter(fn (mixed $file): bool => filled($file))
                ->map(fn (mixed $file): mixed => $this->storeUploadedFile($file))
                ->values()
                ->all();
        }

        if (blank($state)) {
            return null;
        }

        return $this->storeUploadedFile($state);
    }

    protected function normalizeStateForMode(mixed $state): mixed
    {
        if ($this->isMultiple()) {
            return blank($state)
                ? []
                : $this->wrapState($state);
        }

        if (blank($state)) {
            return null;
        }

        if (is_array($state)) {
            return collect($state)
                ->filter(fn (mixed $file): bool => filled($file))
                ->first();
        }

        return $state;
    }

    protected function storeUploadedFile(mixed $file): mixed
    {
        if ($file instanceof TemporaryUploadedFile) {
            return $file->store($this->getDirectory() ?? '', $this->getDisk());
        }

        return $file;
    }

    protected function mapFileForJs(mixed $file): ?array
    {
        if ($file instanceof TemporaryUploadedFile) {
            return [
                'name' => $file->getClientOriginalName(),
                'path' => $file->getFilename(),
                'stateValue' => $file->getFilename(),
                'size' => $file->getSize(),
                'type' => $file->getMimeType(),
                'url' => $this->getTemporaryFileUrl($file),
                'isTemp' => true,
            ];
        }

        if (! is_string($file) || $file === '') {
            return null;
        }

        return [
            'name' => basename($file),
            'path' => $file,
            'stateValue' => $file,
            'size' => $this->getStoredFileSize($file),
            'type' => $this->getStoredFileMimeType($file),
            'url' => Storage::disk($this->getDisk())->url($file),
            'isTemp' => false,
        ];
    }

    protected function wrapState(mixed $state): array
    {
        if (blank($state)) {
            return [];
        }

        return Arr::wrap($state);
    }

    protected function getTemporaryFileUrl(TemporaryUploadedFile $file): ?string
    {
        try {
            return $file->temporaryUrl();
        } catch (\Throwable) {
            return null;
        }
    }

    protected function getStoredFileMimeType(string $path): ?string
    {
        try {
            return Storage::disk($this->getDisk())->mimeType($path) ?: $this->guessMimeTypeFromPath($path);
        } catch (\Throwable) {
            return $this->guessMimeTypeFromPath($path);
        }
    }

    protected function getStoredFileSize(string $path): ?int
    {
        try {
            return Storage::disk($this->getDisk())->size($path);
        } catch (\Throwable) {
            return null;
        }
    }

    protected function guessMimeTypeFromPath(string $path): string
    {
        return Str::endsWith(strtolower($path), '.pdf')
            ? 'application/pdf'
            : (Str::startsWith(Str::lower(Str::afterLast($path, '.')), ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'])
                ? 'image/*'
                : 'application/octet-stream');
    }
}
