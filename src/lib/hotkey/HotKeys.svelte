<script lang="ts">    
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    
    import HotKey from '$lib/hotkey/HotKey.svelte';
    export let keys: string[] = ['cmd', 'k'];
    export let value: boolean = false;
    export let debug: boolean = false;
    export let hidden: boolean = false;

    type KeyPressedMap = {
        [key: string]: boolean
    }
    let HotKeyPressedMap: KeyPressedMap = {};
    let KeyPressedMapCount = 0;

    const reset = () => {
        HotKeyPressedMap = {};
        KeyPressedMapCount = 0;
    }

    const hot = (key:string) => {
        if (debug) console.debug('HotKeys <hot>\t', {key, KeyPressedMapCount, HotKeyPressedMap})
        HotKeyPressedMap[key] = true;
        KeyPressedMapCount++;
        KeyPressedMapCount = Math.min(keys.length, KeyPressedMapCount);

        const readyToFire = isComboPressed();
        if (readyToFire) {
            if (debug) console.debug('combo', keys)
            if (debug) console.debug('HotKeys <combo>\t', keys)
            dispatch('hot', key)
            value = true
        }
    }

    const not = (key:string) => {
        if (debug) console.debug('HotKeys <hot>\t', key)
        HotKeyPressedMap[key] = false;
        KeyPressedMapCount--;
        KeyPressedMapCount = Math.max(0, KeyPressedMapCount);
        dispatch('not', key)
        value = false
        reset()
    }

    const isComboPressed = () => {
        const correctNumberOfKeys = KeyPressedMapCount === keys.length;
        const allKeysPressed = keys.every(pressed => HotKeyPressedMap[pressed] === true);
        if (debug) console.debug('isComboPressed\t', {keys, KeyPressedMapCount, HotKeyPressedMap, correctNumberOfKeys, allKeysPressed})
        return correctNumberOfKeys && allKeysPressed;
    }
    let keyhidden = hidden;
    if($$slots.default) {
        keyhidden = true;
    }
</script>
<div class="inline-flex {$$props.class}">
{#if hidden==false}
<slot></slot>
{/if}
{#each keys as key, i}
    <HotKey 
        hidden={keyhidden}
        key={key} 
        class="{i > 0 ? 'ml-0.5' : ''}"
        on:hot={() => hot(key)}
        on:not={() => not(key)}
        {debug}
    ></HotKey>
{/each}
</div>
