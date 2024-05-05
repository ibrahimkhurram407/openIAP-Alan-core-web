<script>
    import { scale } from 'svelte/transition'
    import { bounceInOut, sineInOut,  } from 'svelte/easing'
    export let fillColor = "currentColor";

    let easing = undefined;
    let duration = 0;
    if(fillColor !== "currentColor") {
        easing = sineInOut;
        duration = 2000;
    }
</script>
<style>
    .color-transition {
        transition: fill 2s ease; /* Smooth transition for color change */
    }
</style>
<svg
    version="1.0"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 226.000000 88.000000"
    preserveAspectRatio="xMidYMid meet"
    {...$$props}
>
    <g
        transform="translate(0.000000,88.000000) scale(0.100000,-0.100000)"
        stroke="none"
        class="color-transition"
        transition:scale={{duration, easing}}
        fill={fillColor}

    >
        <path
            d="M1620 814 c-58 -109 -143 -169 -256 -181 -63 -7 -156 19 -283 79
      -217 101 -349 138 -494 138 -204 0 -425 -107 -546 -264 -24 -31 -41 -59 -38
      -62 3 -3 27 6 54 19 181 92 399 90 548 -4 28 -17 120 -100 205 -183 196 -192
      285 -256 430 -309 177 -64 434 -63 630 3 118 39 262 122 355 205 l40 35 -298
      295 c-164 162 -302 295 -305 295 -4 0 -23 -30 -42 -66z m-913 -84 c73 -20 171
      -65 343 -157 139 -75 220 -97 334 -91 80 4 103 10 167 41 41 20 88 49 106 65
      l31 29 157 -157 157 -157 -94 -46 c-137 -69 -226 -90 -383 -91 -235 -2 -387
      62 -599 250 -136 121 -176 152 -245 191 -168 96 -369 97 -549 4 -66 -34 -72
      -36 -45 -13 81 69 216 130 334 151 74 14 200 5 286 -19z"
        />
    </g>
</svg>
