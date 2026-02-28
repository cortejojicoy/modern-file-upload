<?php

namespace Kukux\ModernFileUpload;

use Filament\Support\Assets\Css;
use Filament\Support\Assets\Js;
use Filament\Support\Facades\FilamentAsset;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

class ModernFileUploadServiceProvider extends PackageServiceProvider
{
    public static string $name = 'modern-file-upload';

    public function configurePackage(Package $package): void
    {
        $package
            ->name(static::$name)
            ->hasViews('modern-file-upload');
    }

    public function packageBooted(): void
    {
        FilamentAsset::register([
            Js::make(
                'modern-file-uploader',
                __DIR__ . '/../resources/dist/file-uploader.js'
            )->loadedOnRequest(),

        ], package: 'kukux/modern-file-upload');
    }
}