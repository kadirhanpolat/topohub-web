<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { _ } from 'svelte-i18n'
  import { browser } from '$app/environment'
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'

  let active = false

  function syncFromUrl(search: string) {
    active = new URLSearchParams(search).get('present') === '1'
    if (browser) {
      document.body.classList.toggle('present-mode', active)
    }
  }

  function exit() {
    const url = new URL(window.location.href)
    url.searchParams.delete('present')
    goto(url.pathname + url.search, { replaceState: true, noScroll: true })
  }

  function handleKey(e: KeyboardEvent) {
    if (active && e.key === 'Escape') {
      e.preventDefault()
      exit()
    }
  }

  $: if (browser && $page) syncFromUrl($page.url.search)

  onMount(() => {
    window.addEventListener('keydown', handleKey)
  })

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('keydown', handleKey)
      document.body.classList.remove('present-mode')
    }
  })
</script>

{#if active}
  <button type="button" class="present-exit-btn" on:click={exit} title="ESC">
    <span class="present-dot" aria-hidden="true" />
    {$_('present.active')} · {$_('present.exit')}
  </button>
{/if}
