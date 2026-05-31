<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { _ } from 'svelte-i18n'
  import { browser } from '$app/environment'
  import { page } from '$app/stores'
  import { goto, beforeNavigate } from '$app/navigation'
  import context from '@/context'
  import { Id } from '@/models'

  const { spaces, properties, theorems } = context()

  let active = false

  function syncFromUrl(search: string) {
    active = new URLSearchParams(search).get('present') === '1'
    if (browser) {
      document.body.classList.toggle('present-mode', active)
    }
  }

  function exit() {
    active = false
    if (browser) document.body.classList.remove('present-mode')
    const url = new URL(window.location.href)
    url.searchParams.delete('present')
    goto(url.pathname + url.search, { replaceState: true, noScroll: true })
  }

  type Kind = 'spaces' | 'properties' | 'theorems'
  const prefixes: Record<Kind, 'S' | 'P' | 'T'> = {
    spaces: 'S',
    properties: 'P',
    theorems: 'T',
  }

  function currentDetail(): {
    kind: Kind
    items: { id: number }[]
    index: number
  } | null {
    const match = $page.url.pathname.match(
      /^\/(spaces|properties|theorems)\/([SPT]\d+)(\/.*)?$/,
    )
    if (!match) return null
    const kind = match[1] as Kind
    const currentId = Id.toInt(match[2])
    const store =
      kind === 'spaces'
        ? $spaces
        : kind === 'properties'
        ? $properties
        : $theorems
    const items = store.all
    const index = items.findIndex(item => item.id === currentId)
    if (index === -1) return null
    return { kind, items, index }
  }

  function navigate(direction: 1 | -1) {
    const detail = currentDetail()
    if (!detail) return
    const nextIndex = detail.index + direction
    if (nextIndex < 0 || nextIndex >= detail.items.length) return
    const next = detail.items[nextIndex]
    const nextId = Id.format(prefixes[detail.kind], next.id)
    goto(`/${detail.kind}/${nextId}?present=1`, { noScroll: true })
  }

  $: detail = active && $page ? currentDetail() : null

  function handleKey(e: KeyboardEvent) {
    if (!active) return
    if (e.key === 'Escape') {
      e.preventDefault()
      exit()
      return
    }
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return
    }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault()
      navigate(-1)
    } else if (
      e.key === 'ArrowRight' ||
      e.key === 'PageDown' ||
      e.key === ' '
    ) {
      e.preventDefault()
      navigate(1)
    }
  }

  $: if (browser && $page) syncFromUrl($page.url.search)

  beforeNavigate(navigation => {
    if (!active || !navigation.to) return
    if (navigation.to.url.searchParams.has('present')) return
    navigation.cancel()
    const next = new URL(navigation.to.url)
    next.searchParams.set('present', '1')
    goto(next.pathname + next.search, { noScroll: true })
  })

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
  {#if detail}
    <div class="present-counter">
      {detail.index + 1} / {detail.items.length}
    </div>
  {/if}
  <button type="button" class="present-exit-btn" on:click={exit} title="ESC">
    <span class="present-dot" aria-hidden="true" />
    {$_('present.active')} · {$_('present.exit')}
  </button>
{/if}

<style>
  .present-counter {
    position: fixed;
    top: 12px;
    left: 16px;
    z-index: 2000;
    background: rgba(0, 0, 0, 0.65);
    color: #fff;
    padding: 6px 12px;
    font-size: 0.85rem;
    border-radius: 6px;
    font-variant-numeric: tabular-nums;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
</style>
