<script lang="ts">
  import Typeset from '@/components/Shared/Typeset.svelte'
  import { Id } from '@/models'
  import { spaceName } from '@/i18n/spaceNames'

  export let space: { id: number; name: string }
  export let content: 'id' | 'idLong' | 'name' = 'name'

  $: localized = $spaceName(space.id, space.name)
</script>

<a href="/spaces/{Id.format('S', space.id)}">
  <slot>
    {#if content === 'name'}
      <Typeset body={localized} />
    {:else if content === 'id'}
      S{space.id}
    {:else}
      {Id.format('S', space.id)}
    {/if}
  </slot>
</a>
