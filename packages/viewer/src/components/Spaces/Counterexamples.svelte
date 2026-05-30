<script lang="ts">
  import { locale } from 'svelte-i18n'
  import context from '@/context'
  import type { Space } from '@/models'
  import { Typeset } from '../Shared'
  import { spaceName } from '@/i18n/spaceNames'
  import { Table } from '../Theorems'

  export let space: Space

  const { theorems, traits } = context()

  $: results = $theorems.all.filter(t =>
    $traits.isCounterexample(t.converse, space),
  )
  $: localized = $spaceName(space.id, space.name)
</script>

{#if $locale === 'tr'}
  <Typeset body={localized} />
  uzayı, {results.length} teoremin tersinin karşı örneğidir
{:else}
  <Typeset body={localized} />
  is a counterexample to the converse of {results.length} theorems
{/if}

{#if results.length > 0}
  <Table theorems={results} />
{/if}
