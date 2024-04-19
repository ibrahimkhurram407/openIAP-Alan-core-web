<script lang="ts">    
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    
    export let key: string = 'cmd';
    export let value: boolean = false;
    export let debug: boolean = false;
    export let hidden: boolean = false;

    type KeyMap = {
        [key: string]: string
    }
    type KeyAliasesMap = {
        [key: string]: string[]
    }

    const KeyToHotKey: KeyMap = {
        '⌘': 'Command',
        'cmd': 'Command',
        'meta': 'Meta',

        'control': 'Control',
        'ctrl': 'Control',

        'slash': '/',
    }
    
    const HotKeyAliases:KeyAliasesMap = {
        'Command': ['Command', 'Meta'],
    }

    $: hotKey = KeyToHotKey[key] || key
    $: hotKeyAliases = HotKeyAliases[hotKey] || []
    $: keysToCheck = [hotKey, ...hotKeyAliases]

    const isEventKeyHotKey = (event:KeyboardEvent) => {
        const altKey = event.altKey
        const ctrlKey = event.ctrlKey
        const metaKey = event.metaKey
        const shiftKey = event.shiftKey

        const eventKey = event.key
        const isHotKey = keysToCheck.includes(eventKey)
        if (!isHotKey) return false
        switch (hotKey) {
            case 'Alt':
                return altKey
            case 'Control':
                return ctrlKey
            case 'Meta':
                return metaKey
            case 'Shift':
                return shiftKey        
        }
        return isHotKey
    }

    const handleKeyPress = (event: KeyboardEvent) => {
        const isKeyUp = event.type === 'keyup'
        const isKeyDown = event.type === 'keydown'

        if (debug) console.debug('HotKey <handleKeyPress>\t', {key, hotKey, hotKeyAliases, keysToCheck, event})
        const isKeyPressed = isEventKeyHotKey(event)
        if (isKeyPressed) {
            event.preventDefault();
            if (isKeyDown) {
                if (debug) console.debug('HotKey <hot>\t', {key})
                dispatch('hot', {key});
                value = true
            } else {
                if (debug) console.debug('HotKey <not>\t', {key})
                dispatch('not', {key});
                value = false
            }
        }
    }

    const keydown = (event:KeyboardEvent) => {
        handleKeyPress(event)
    }
    const keyup = (event:KeyboardEvent) => {
        handleKeyPress(event)
    }

    const kbd = `
    font-spacemono
    inline-flex place-content-center 
    rounded-lg

    bg-slate-100 border-slate-900 border-2

    group-hover:text-slate-200
    group-hover:border-slate-200
    group-hover:bg-slate-600
    
    px-2 py-1 text-sm
    `
</script>

<svelte:window on:keydown={keydown} on:keyup={keyup} />
{#if hidden == false}
<kbd class="{kbd} {$$props.class}">{key}</kbd> 
{/if}

