<script lang="ts">
  import { _ } from 'svelte-i18n'
  import Title from '@/components/Shared/Title.svelte'
  import { List } from '@/components/Properties'
  import type { PageData } from './$types'

  export let data: PageData
</script>

<Title tkey="page.properties" />

<h1>{$_('page.properties')}</h1>

<List properties={data.properties} />
