<script lang="ts">
  import { _ } from 'svelte-i18n'
  import Title from '@/components/Shared/Title.svelte'
  import { List } from '@/components/Spaces'
  import type { PageData } from './$types'

  export let data: PageData
</script>

<Title tkey="page.spaces" />

<h1>{$_('page.spaces')}</h1>

<List spaces={data.spaces} />
