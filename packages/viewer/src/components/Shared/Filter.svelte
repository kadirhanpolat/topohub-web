<script lang="ts">
  import type { Writable } from 'svelte/store'
  import { _ } from 'svelte-i18n'
  import urlSearchParam from '@/stores/urlSearchParam'

  import { Search } from './Icons'

  export let filter: Writable<string>

  urlSearchParam('filter', filter)
</script>

<div class="input-group">
  <div class="input-group-prepend">
    <span class="input-group-text">
      <Search />
    </span>
  </div>
  <input
    placeholder={$_('filter.placeholder')}
    class="form-control"
    bind:value={$filter}
  />
</div>
