@php
    $assetPackage = 'kukux/modern-file-upload';
@endphp

<x-dynamic-component
    :component="$getFieldWrapperView()"
    :field="$field"
>
    <div
        x-data="{
            state: $wire.entangle(@js($getStatePath())),
            mount() {
                if (! window.mountReactFileUpload) {
                    window.setTimeout(() => this.mount(), 50)

                    return
                }

                window.mountReactFileUpload(this.$refs.uploader, {
                    wire: $wire,
                    name: @js($getStatePath()),
                    state: this.state,
                    setState: (value) => this.state = value,
                    multiple: @js($getIsMultiple()),
                    accept: @js($getAccept() ?? '*/*'),
                    fileAction: @js($getFileAction()),
                    initialFiles: @js($getFilesForJs()),
                })
            },
            init() {
                this.$nextTick(() => this.mount())

                this.$watch('state', (value) => {
                    this.$refs.uploader.dispatchEvent(
                        new CustomEvent('modern-file-upload:set-state', {
                            detail: value,
                        }),
                    )
                })
            },
        }"
        x-load-js="[@js(\Filament\Support\Facades\FilamentAsset::getScriptSrc('modern-file-uploader', package: $assetPackage))]"
        {{ $getExtraAttributeBag() }}
    >
        <div
            x-ref="uploader"
            wire:ignore
        ></div>
    </div>
</x-dynamic-component>
