<script lang="ts">
  import { _ } from 'svelte-i18n'
  import Sync from './Dev/Sync.svelte'

  const year = new Date().getFullYear()
</script>

<footer class="text-center bg-light text-muted">
  <div class="pt-4">
    <strong>TopoHub</strong> · {$_('footer.builtOn')}
    <a class="text-dark" href="https://github.com/pi-base">pi-Base</a>
  </div>
  <div class="pt-1">
    {$_('footer.dataCredit')} © {year} Steven Clontz, James Dabbs (<a
      class="text-dark"
      href="https://github.com/pi-base/data/blob/main/LICENSE.md">CC-BY</a
    >) | {$_('footer.softwareCredit')} © {year} James Dabbs (<a
      class="text-dark"
      href="https://github.com/pi-base/web/blob/main/LICENSE.md">MIT</a
    >)
  </div>
  <div class="p-2">
    {$_('footer.dataLastSync')}
    <Sync />
  </div>
</footer>
