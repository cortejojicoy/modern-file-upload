# Modern File Upload for Filament

[![Latest Version on Packagist](https://img.shields.io/packagist/v/cortejojicoy/modern-file-upload.svg?style=flat-square)](https://packagist.org/packages/cortejojicoy/modern-file-upload)
[![Total Downloads](https://img.shields.io/packagist/dt/cortejojicoy/modern-file-upload.svg?style=flat-square)](https://packagist.org/packages/cortejojicoy/modern-file-upload)
[![License](https://img.shields.io/github/license/cortejojicoy/modern-file-upload?style=flat-square)](LICENSE.md)

A modern, React-powered file upload and file viewer plugin for [Filament](https://filamentphp.com). Supports image previews, PDF thumbnails, gallery and list views, dark mode, and an optional document action system (verify/return) — all as a drop-in Filament form field and infolist entry.

---

## Features

- **Custom file upload field** with drag & drop, progress tracking, and multi-file support
- **PDF thumbnail rendering** using `pdfjs-dist`
- **Image & file viewer** with zoom, pan, and page navigation
- **Dark mode** support out of the box
- **Gallery and list view** modes
- **Optional file actions** — attach verify/return controls per file (e.g. for document approval workflows)
- Assets loaded **on demand** — JS only loads on pages that use the components

---

## Requirements

- PHP `^8.2`
- Laravel `^11.0`
- Filament `^4.0` or `^5.0`
- Node.js (only needed if contributing or publishing changes)

---

## Installation

Install via Composer:

```bash
composer require cortejojicoy/modern-file-upload
```

> [!IMPORTANT]
> This plugin ships pre-built JS assets. You do **not** need to run `npm install` or `npm run build` in your app for it to work.

### 1. Register the Plugin

In your Filament Panel provider:

```php
use Kukux\ModernFileUpload\ModernFileUploadPlugin;

public function panel(Panel $panel): Panel
{
    return $panel
        ->plugin(ModernFileUploadPlugin::make());
}
```
### 2. Add Plugin Views to Your Tailwind Config

If you are using a custom Filament theme (recommended), add the plugin's source paths so Tailwind includes its utility classes:

```js
// tailwind.config.js
export default {
    darkMode: 'class',
    content: [
        // ... your existing paths
        './vendor/kukux/modern-file-upload/resources/views/**/*.blade.php',
        './vendor/kukux/modern-file-upload/resources/js/**/*.jsx',
    ],
}
```

Then rebuild your theme:

```bash
npm run build
```

> [!NOTE]
> If you are **not** using a custom theme, the plugin will still work — but dark mode styles may not apply correctly since Filament requires `darkMode: 'class'` in your Tailwind config.

---

## Usage

### File Upload Field (Form)

```php
use Kukux\ModernFileUpload\Forms\Components\FileUpload;

public static function form(Form $form): Form
{
    return $form->schema([
        FileUpload::make('attachment')
            ->label('Upload File')
            ->disk('public')
            ->directory('uploads/attachments')
            ->accept('application/pdf')     // MIME type or wildcard
            ->multiple()                    // allow multiple files
            ->listView(),                   // or ->galleryView() (default)
    ]);
}
```

### File Viewer Entry (Infolist)

```php
use Kukux\ModernFileUpload\Infolists\Components\FileViewer;

public static function infolist(Infolist $infolist): Infolist
{
    return $infolist->schema([
        FileViewer::make('attachment')
            ->label('Attached File')
            ->showDownload()
            ->showPdfThumbnails(),
    ]);
}
```

---

## Optional: File Actions (Verify / Return)

For document approval workflows, you can attach per-file action controls (verify and return buttons) to any upload field. These only appear on **already saved** files — not on fresh temporary uploads.

### 1. Add a Livewire method to your resource or page

```php
public function updateAction(int $fileId, string $action, ?string $remarks = null): void
{
    $file = Attachment::findOrFail($fileId);

    $file->update([
        'status'  => $action,
        'remarks' => $remarks,
    ]);
}
```

### 2. Attach the action to your field

```php
FileUpload::make('attachment')
    ->disk('public')
    ->directory('uploads/attachments')
    ->accept('application/pdf')
    ->fileAction(function ($record) {
        return [
            'method' => 'updateAction',     // your Livewire method name
            'fileId' => $record?->id,
            'status' => $record?->status,   // "verified" | "returned" | null
        ];
    })
```

The verify/return buttons will appear on each saved PDF thumbnail. A confirmation modal is shown before any action is taken. Returned documents require a remarks/reason field before confirming.

---

## Available Methods

### `FileUpload`

| Method | Description |
|---|---|
| `->disk(string $disk)` | Storage disk (default: `public`) |
| `->directory(string $path)` | Upload directory |
| `->accept(string $mime)` | Accepted MIME types (e.g. `application/pdf`, `image/*`) |
| `->multiple(bool $condition)` | Allow multiple file uploads |
| `->galleryView()` | Display files in a grid (default) |
| `->listView()` | Display files in a list |
| `->fileAction(\Closure $callback)` | Attach verify/return action controls |

### `FileViewer`

| Method | Description |
|---|---|
| `->showDownload(bool $condition)` | Show download button (default: `true`) |
| `->showPdfThumbnails(bool $condition)` | Render PDF first-page thumbnails (default: `true`) |

---

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for what has changed in each release.


## Contributing

Contributions are welcome! Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.


## Security

If you discover a security vulnerability, please review our [Security Policy](.github/SECURITY.md).


## Credits

- [cortejojicoy](https://github.com/cortejojicoy)
- [All Contributors](../../contributors)

---

## License

The MIT License (MIT). Please see the [License File](LICENSE.md) for more information.