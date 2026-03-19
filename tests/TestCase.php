<?php

namespace Kukux\ModernFileUpload\Tests;

use Kukux\ModernFileUpload\ModernFileUploadServiceProvider;
use Orchestra\Testbench\TestCase as Orchestra;

class TestCase extends Orchestra
{
    protected function getPackageProviders($app): array
    {
        return [
            ModernFileUploadServiceProvider::class,
        ];
    }
}
