<x-dynamic-component
    :component="$getFieldWrapperView()"
    :field="$field"
>
    <div
        x-data="{ state: $wire.entangle(@js($getStatePath())) }"
        {{ $getExtraAttributeBag() }}
    >
        {{-- React mount point --}}
        <div 
            id="react-file-upload"
            data-state-path="{{ $getStatePath() }}"
            data-name="{{ $getName() }}"
            data-base-url="{{ $getUrl() }}"
            wire:ignore
            x-init="
                $nextTick(() => {

                    if (window.mountReactFileUpload) {
                        window.mountReactFileUpload(
                            $el, 
                            state, 
                            $wire, 
                            {
                                multiple: @js($getIsMultiple()),
                                accept: @js($getAccept() ?? '*/*'),
                                disk: @js($getDisk()),     // 
                                baseUrl: $el.dataset.baseUrl,
                                name: @js($getStatePath()),
                                fileAction: @js($getFileAction())
                            }
                        );
                    }
                })
            "
        ></div>

        {{-- Hidden input keeps Livewire state in sync --}}
        <input type="hidden" x-model="state">
    </div>
</x-dynamic-component>