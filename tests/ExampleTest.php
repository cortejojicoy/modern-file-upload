<?php

use Kukux\ModernFileUpload\Forms\Components\FileUpload;

it('maps accept and multiple configuration to the field instance', function () {
    $field = FileUpload::make('attachment')
        ->accept('application/pdf')
        ->multiple(false);

    expect($field->getAccept())->toBe('application/pdf')
        ->and($field->getIsMultiple())->toBeFalse();
});
