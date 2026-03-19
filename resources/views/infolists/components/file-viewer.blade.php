<div class="space-y-3">
    @forelse ($getFiles() as $file)
        <div class="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-xs font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                @if ($file['is_image'])
                    <img
                        src="{{ $file['url'] }}"
                        alt="{{ $file['name'] }}"
                        class="h-full w-full object-cover"
                    >
                @elseif ($file['is_pdf'] && $arePdfThumbnailsVisible())
                    PDF
                @else
                    FILE
                @endif
            </div>

            <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-gray-950 dark:text-white">
                    {{ $file['name'] }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ $file['type'] }}
                </p>
            </div>

            @if ($isDownloadVisible())
                <a
                    href="{{ $file['url'] }}"
                    target="_blank"
                    rel="noreferrer"
                    class="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                    Open
                </a>
            @endif
        </div>
    @empty
        <div class="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            No files available.
        </div>
    @endforelse
</div>
