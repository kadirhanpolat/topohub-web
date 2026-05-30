<script lang="ts">
  import { _, locale } from 'svelte-i18n'
  import context from '@/context'
  import { contributingUrl, mainBranch, helpUrl } from '@/constants'
  import { setLocale } from '@/i18n'
  import Branch from './Shared/Icons/Branch.svelte'

  const { showDev, source } = context()

  $: onMain = $source.branch === mainBranch
  $: bg = onMain ? 'light' : 'dark'
</script>

<nav class="navbar navbar-expand-lg navbar-{bg} bg-{bg}">
  <div class="container">
    <a class="navbar-brand" href="/">TopoHub</a>

    <div class="navbar-nav mr-auto">
      <a class="nav-link" href="/spaces">{$_('nav.explore')}</a>
      <a class="nav-link" href="/spaces/all">{$_('nav.spaces')}</a>
      <a class="nav-link" href="/properties">{$_('nav.properties')}</a>
      <a class="nav-link" href="/theorems">{$_('nav.theorems')}</a>
      <a class="nav-link" href="/questions">{$_('nav.questions')}</a>
    </div>

    <div class="navbar-nav align-items-center">
      <a class="nav-link" href="/dev">
        {#if showDev || !onMain}
          <Branch /> {$source.branch}
        {:else}
          {$_('nav.advanced')}
        {/if}
      </a>
      <a class="nav-link" href={contributingUrl}>{$_('nav.contribute')}</a>
      <a class="nav-link" href={helpUrl}>{$_('nav.help')}</a>

      <div class="lang-switch">
        <button
          type="button"
          class="lang-btn"
          class:active={$locale === 'tr'}
          on:click={() => setLocale('tr')}>TR</button
        >
        <span class="lang-sep">|</span>
        <button
          type="button"
          class="lang-btn"
          class:active={$locale === 'en'}
          on:click={() => setLocale('en')}>EN</button
        >
      </div>
    </div>
  </div>
</nav>

<style>
  .lang-switch {
    margin-left: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .lang-btn {
    background: none;
    border: none;
    padding: 0 0.35rem;
    font-size: 0.85rem;
    color: inherit;
    opacity: 0.55;
    cursor: pointer;
  }
  .lang-btn:hover {
    opacity: 0.85;
  }
  .lang-btn.active {
    opacity: 1;
    font-weight: 700;
  }
  .lang-sep {
    opacity: 0.4;
  }
</style>
