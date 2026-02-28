<?php 

namespace Kukux\ModernFileUpload\Forms\Components;

use Filament\Forms\Components\Field;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

class FileUpload extends Field
{
    protected string $view = 'modern-file-upload::forms.components.file-upload';
    
    protected string $disk = 'public';
    
    protected ?string $accept = null;
    
    protected ?string $directory = null;
    
    protected bool $isMultiple = true;

    protected ?\Closure $fileActionCallback = null;
    
    public static function make(?string $name = null): static
    {
        return parent::make($name);
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
        if (!$this->fileActionCallback)
            return null;

        // Call with null to extract only the method name safely
        // fileId and status must come from each file object in JS
        $result = ($this->fileActionCallback)(null);

        return [
            'method' => $result['method'] ?? null,
        ];
    }

    public function getUrl(mixed $state = null): ?string
    {
        $state = $state ?? $this->getState();

        if (!$state) {
            return null;
        }

        if ($state instanceof TemporaryUploadedFile) {
            // For S3 / MinIO this ensures credentials + signed URL
            return $state->temporaryUrl();
        }

        if (is_string($state)) {
            return Storage::disk($this->getDisk())->url($state);
        }

        return null;
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

} 