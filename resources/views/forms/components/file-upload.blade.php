@php
    $assetPackage = 'kukux/modern-file-upload';
    $assetSrc = \Filament\Support\Facades\FilamentAsset::getScriptSrc('modern-file-uploader', package: $assetPackage);
@endphp

<x-dynamic-component
    :component="$getFieldWrapperView()"
    :field="$field"
>
    <div
        x-data="{
            state: $wire.entangle(@js($getStatePath())),
            assetSrc: @js($assetSrc),
            ensureScript() {
                const existing = document.querySelector(`script[data-modern-file-upload='true'][src='${this.assetSrc}']`)

                if (existing) {
                    return Promise.resolve()
                }

                return new Promise((resolve, reject) => {
                    const script = document.createElement('script')
                    script.src = this.assetSrc
                    script.type = 'module'
                    script.dataset.modernFileUpload = 'true'
                    script.onload = () => resolve()
                    script.onerror = () => reject(new Error(`Failed to load asset: ${this.assetSrc}`))
                    document.head.appendChild(script)
                })
            },
            mount() {
                this.ensureScript().then(() => {
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
                }).catch((error) => {
                    console.error(error)
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
        {{ $getExtraAttributeBag() }}
    >
        <div
            x-ref="uploader"
            wire:ignore
        ></div>
    </div>
</x-dynamic-component>
