<script lang="ts">
  import { _ } from 'svelte-i18n'
  import Title from '@/components/Shared/Title.svelte'
  import { List } from '@/components/Theorems'
  import type { PageData } from './$types'

  export let data: PageData
</script>

<Title tkey="page.theorems" />

<h1>{$_('page.theorems')}</h1>

<List theorems={data.theorems} />
