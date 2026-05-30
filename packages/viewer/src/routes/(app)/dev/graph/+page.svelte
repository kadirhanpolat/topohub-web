<script lang="ts">
  import Title from '@/components/Shared/Title.svelte'
  import { GraphViz } from '@/components/GraphViz'
  let dot = 'digraph  {a -> b}'
</script>

<Title tkey="page.graphviz" />

<input type="text" bind:value={dot} />

<GraphViz {dot} />
