<script lang="ts">
  import { writable } from 'svelte/store'
  import { _ } from 'svelte-i18n'

  import type { Formula, Property } from '@/models'
  import urlSearchParam from '@/stores/urlSearchParam'
  import Examples from './Examples.svelte'
  import FormulaInput from '../Shared/Formula/Input'
  import Results from './Results.svelte'
  import Cite from '../Shared/Cite.svelte'

  const text = writable('')
  const rawFormula = writable('')
  const formula = writable<Formula<Property> | undefined>(undefined)

  const suggest = writable(false)
  rawFormula.subscribe(_ => ($suggest = true))
  function selectExample(example: string) {
    $rawFormula = example
    $suggest = false
  }

  urlSearchParam('text', text)
  urlSearchParam('q', rawFormula, () => ($suggest = false))

  function describe(formula: string, text: string) {
    if (formula.length > 0) {
      if (text.length > 0) {
        return `Search for \`${formula}\` matching \`${text}\``
      } else {
        return `Search for \`${formula}\``
      }
    } else {
      if (text.length > 0) {
        return `Search matching \`${text}\``
      } else {
        return 'Explore'
      }
    }
  }

  $: title = `TopoHub, ${describe($rawFormula, $text)}`
</script>

<div class="row">
  <div class="col-md-4">
    <div class="form-group">
      <label class="form-label" for="text">{$_('search.filterByText')}</label>
      <input
        class="form-control"
        name="text"
        placeholder={$_('search.placeholderText')}
        bind:value={$text}
      />
    </div>
    <div class="form-group">
      <label class="form-label" for="formula"
        >{$_('search.filterByFormula')}</label
      >
      <FormulaInput
        name="q"
        placeholder={$_('search.placeholderFormula')}
        raw={rawFormula}
        suggest={$suggest}
        {formula}
      />
    </div>
  </div>
  <div class="col-md-8">
    {#if $text || $formula}
      <Results text={$text} formula={$formula} />
    {:else}
      <Examples select={selectExample} />
    {/if}
  </div>
</div>
<div>
  <Cite {title} />
</div>
