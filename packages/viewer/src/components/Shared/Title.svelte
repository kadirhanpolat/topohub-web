<script lang="ts">
  import { _ } from 'svelte-i18n'

  export let title: string = ''
  export let tkey: string = ''

  $: resolved = tkey ? $_(tkey) : title
</script>

<svelte:head>
  {#key resolved}
    {#if resolved}
      <title>{resolved} | TopoHub</title>
    {:else}
      <title>TopoHub</title>
    {/if}
  {/key}
</svelte:head>
