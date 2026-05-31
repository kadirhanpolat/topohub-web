<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { _ } from 'svelte-i18n'
  import { browser } from '$app/environment'
  import { page } from '$app/stores'
  import { goto, beforeNavigate, afterNavigate } from '$app/navigation'
  import context from '@/context'
  import { Id } from '@/models'

  const { spaces, properties, theorems } = context()

  let showShare = false
  let copied = false
  let followConnected = false
  let isFullscreen = false
  // Allow startSharing to set hostId before the URL actually changes so
  // beforeNavigate sees the matching value.
  let hostIdOverride: string | null = null
  // Set when exit() initiates a navigation that strips present/host/follow,
  // so beforeNavigate doesn't re-add them based on the still-stale URL.
  let exiting = false

  $: search = $page?.url.search ?? ''
  $: params = new URLSearchParams(search)
  $: active = params.get('present') === '1'
  $: hostId = hostIdOverride ?? params.get('host') ?? ''
  $: followId = params.get('follow') ?? ''
  $: if (browser) document.body.classList.toggle('present-mode', active)

  function exit() {
    exiting = true
    hostIdOverride = null
    if (browser) document.body.classList.remove('present-mode')
    const url = new URL(window.location.href)
    url.searchParams.delete('present')
    url.searchParams.delete('host')
    url.searchParams.delete('follow')
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
    const url = new URL(window.location.href)
    url.pathname = `/${detail.kind}/${nextId}`
    goto(url.pathname + url.search, { noScroll: true })
  }

  $: detail = active && $page ? currentDetail() : null

  function handleKey(e: KeyboardEvent) {
    if (!active) return
    if (e.key === 'Escape') {
      e.preventDefault()
      exit()
      return
    }
    if (followId) return // student doesn't drive nav
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

  function generateSessionId(): string {
    const arr = new Uint8Array(8)
    crypto.getRandomValues(arr)
    return Array.from(arr, b => b.toString(36).padStart(2, '0'))
      .join('')
      .slice(0, 10)
  }

  function startSharing() {
    const id = generateSessionId()
    hostIdOverride = id
    const url = new URL(window.location.href)
    url.searchParams.set('host', id)
    goto(url.pathname + url.search, { replaceState: true, noScroll: true })
    showShare = true
  }

  function studentLink(): string {
    if (!browser || !hostId) return ''
    const url = new URL(window.location.href)
    url.searchParams.delete('host')
    url.searchParams.set('follow', hostId)
    return url.toString()
  }

  async function copyStudentLink() {
    const link = studentLink()
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      copied = true
      setTimeout(() => (copied = false), 2000)
    } catch {
      /* clipboard blocked */
    }
  }

  function closeShare() {
    showShare = false
  }

  async function toggleFullscreen() {
    if (!browser) return
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      /* user cancelled or browser blocked */
    }
  }

  function syncFullscreen() {
    isFullscreen = !!document.fullscreenElement
  }

  function selectAllInput(e: Event) {
    const target = e.target as HTMLInputElement | null
    target?.select()
  }

  // --- Host: push pathname + scroll to the server ---
  async function pushState(payload: { pathname?: string; scrollY?: number }) {
    if (!hostId) return
    try {
      await fetch(`/api/classroom/${hostId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch {
      /* network issue; silent for now */
    }
  }

  afterNavigate(({ to }) => {
    if (!browser || !active || !hostId || !to) return
    pushState({ pathname: to.url.pathname, scrollY: window.scrollY })
  })

  const SCROLL_THROTTLE_MS = 150
  let scrollTimer: ReturnType<typeof setTimeout> | null = null

  function handleScroll() {
    if (!active || !hostId) return
    if (scrollTimer) return
    scrollTimer = setTimeout(() => {
      scrollTimer = null
      pushState({ scrollY: window.scrollY })
    }, SCROLL_THROTTLE_MS)
  }

  // --- Student: poll the host's state (path + scroll) ---
  // Polling chosen over SSE for resilience against antivirus / proxy MITM
  // (Kaspersky, corporate firewalls) that buffer long-lived HTTP streams.
  const POLL_INTERVAL_MS = 500
  let pollTimer: ReturnType<typeof setInterval> | null = null
  let lastSeenPath = ''
  let lastSeenScroll = -1

  async function pollOnce(id: string) {
    try {
      const res = await fetch(`/api/classroom/${id}`, { cache: 'no-store' })
      if (!res.ok) {
        followConnected = false
        return
      }
      followConnected = true
      const data = (await res.json()) as { pathname?: string; scrollY?: number }
      const target = data.pathname
      if (target && target !== lastSeenPath) {
        lastSeenPath = target
        if (target !== $page.url.pathname) {
          const url = new URL(window.location.href)
          url.pathname = target
          await goto(url.pathname + url.search, { noScroll: true })
        }
      }
      if (
        typeof data.scrollY === 'number' &&
        Math.abs(data.scrollY - lastSeenScroll) > 2
      ) {
        lastSeenScroll = data.scrollY
        window.scrollTo({ top: data.scrollY, behavior: 'auto' })
      }
    } catch {
      followConnected = false
    }
  }

  function startFollowing(id: string) {
    stopFollowing()
    lastSeenPath = $page.url.pathname
    lastSeenScroll = -1
    pollOnce(id)
    pollTimer = setInterval(() => pollOnce(id), POLL_INTERVAL_MS)
  }

  function stopFollowing() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
    followConnected = false
  }

  $: if (browser && followId) startFollowing(followId)
  $: if (browser && !followId) stopFollowing()

  beforeNavigate(navigation => {
    if (exiting) {
      exiting = false
      return
    }
    if (!active || !navigation.to) return
    const target = navigation.to.url
    const targetHost = target.searchParams.get('host') ?? ''
    const targetFollow = target.searchParams.get('follow') ?? ''
    if (
      target.searchParams.has('present') &&
      targetHost === hostId &&
      targetFollow === followId
    ) {
      return
    }
    navigation.cancel()
    const next = new URL(target)
    next.searchParams.set('present', '1')
    if (hostId) next.searchParams.set('host', hostId)
    else next.searchParams.delete('host')
    if (followId) next.searchParams.set('follow', followId)
    else next.searchParams.delete('follow')
    goto(next.pathname + next.search, { noScroll: true })
  })

  onMount(() => {
    window.addEventListener('keydown', handleKey)
    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('fullscreenchange', syncFullscreen)
    syncFullscreen()
  })

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('fullscreenchange', syncFullscreen)
      document.body.classList.remove('present-mode')
    }
    stopFollowing()
    if (scrollTimer) clearTimeout(scrollTimer)
  })
</script>

{#if active}
  {#if detail}
    <div class="present-counter">
      {detail.index + 1} / {detail.items.length}
    </div>
  {/if}

  <button
    type="button"
    class="present-fullscreen-btn"
    on:click={toggleFullscreen}
    title={isFullscreen
      ? $_('present.fullscreenExit')
      : $_('present.fullscreen')}
  >
    {isFullscreen ? '🪟' : '⛶'}
    {isFullscreen ? $_('present.fullscreenExit') : $_('present.fullscreen')}
  </button>

  {#if followId}
    <div class="present-follow" class:on={followConnected}>
      <span class="present-dot" aria-hidden="true" />
      {$_('present.following')}
    </div>
  {:else if !hostId}
    <button
      type="button"
      class="present-share-btn"
      on:click={startSharing}
      title={$_('present.shareTitle')}
    >
      {$_('present.share')}
    </button>
  {:else}
    <div class="present-host">
      <span class="present-dot" aria-hidden="true" />
      {$_('present.broadcasting')} · {hostId}
      <button
        type="button"
        class="present-host-share"
        on:click={() => (showShare = true)}
      >
        {$_('present.copyLink')}
      </button>
    </div>
  {/if}

  <button type="button" class="present-exit-btn" on:click={exit} title="ESC">
    <span class="present-dot" aria-hidden="true" />
    {$_('present.active')} · {$_('present.exit')}
  </button>

  {#if showShare && hostId}
    <div class="present-share-modal" role="dialog">
      <div class="present-share-inner">
        <h3>{$_('present.shareTitle')}</h3>
        <p>{$_('present.shareHint')}</p>
        <input
          type="text"
          readonly
          value={studentLink()}
          on:focus={selectAllInput}
        />
        <div class="present-share-actions">
          <button
            type="button"
            class="btn btn-primary"
            on:click={copyStudentLink}
          >
            {copied ? $_('present.copied') : $_('present.copy')}
          </button>
          <button type="button" class="btn btn-link" on:click={closeShare}>
            {$_('present.close')}
          </button>
        </div>
      </div>
    </div>
  {/if}
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
  .present-fullscreen-btn {
    position: fixed;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2000;
    background: rgba(0, 0, 0, 0.75);
    color: #fff;
    border: none;
    padding: 6px 14px;
    font-size: 0.9rem;
    border-radius: 6px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    font-family: inherit;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .present-fullscreen-btn:hover {
    background: rgba(0, 0, 0, 0.9);
  }
  .present-share-btn,
  .present-host,
  .present-follow {
    position: fixed;
    bottom: 16px;
    right: 16px;
    z-index: 2000;
    background: rgba(0, 0, 0, 0.75);
    color: #fff;
    border: none;
    padding: 8px 14px;
    font-size: 0.85rem;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    font-family: inherit;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .present-share-btn:hover {
    background: rgba(0, 0, 0, 0.9);
  }
  .present-host {
    background: rgba(20, 60, 120, 0.85);
  }
  .present-follow {
    background: rgba(60, 60, 60, 0.85);
    cursor: default;
  }
  .present-follow.on {
    background: rgba(20, 80, 40, 0.85);
  }
  .present-host-share {
    background: rgba(255, 255, 255, 0.15);
    color: inherit;
    border: none;
    padding: 2px 8px;
    margin-left: 6px;
    border-radius: 4px;
    cursor: pointer;
  }
  .present-host-share:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  .present-share-modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 3000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }
  .present-share-inner {
    background: #fff;
    color: #222;
    border-radius: 10px;
    padding: 1.5rem;
    max-width: 540px;
    width: 100%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  }
  .present-share-inner h3 {
    margin-top: 0;
  }
  .present-share-inner input {
    width: 100%;
    padding: 8px;
    font-family: monospace;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  .present-share-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }
</style>
