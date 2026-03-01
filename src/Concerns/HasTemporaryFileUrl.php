<?php

namespace Kukux\ModernFileUpload\Concerns;

use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

trait HasTemporaryFileUrl
{
    public function getTempFileUrl(string $path): string
    {
        return (new TemporaryUploadedFile(
            $path,
            config('livewire.temporary_file_upload.disk')
        ))->temporaryUrl();
    }
}