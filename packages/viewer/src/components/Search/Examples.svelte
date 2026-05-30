<script lang="ts">
  import { _ } from 'svelte-i18n'

  export let select: (search: string) => void

  const examples = [
    {
      labelKey: 'examples.allNonMetricContinua',
      search: 'compact + connected + t_2 + ~metrizable',
    },
    {
      labelKey: 'examples.aCommonNonTheorem',
      search: 'first countable + separable + ~second countable',
    },
  ]
</script>

<p><b>{$_('examples.notSure')}</b> {$_('examples.tryOneOf')}</p>
{#each examples as { labelKey, search } (labelKey)}
  <article>
    <h5>{$_(labelKey)}</h5>
    <a
      href={`?q=${encodeURIComponent(search)}`}
      on:click={() => select(search)}
      class="example"
    >
      {search}
    </a>
  </article>
{/each}
