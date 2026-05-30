<script lang="ts">
  import { locale } from 'svelte-i18n'
  import Cite from './Shared/Cite.svelte'

  import { contributingUrl } from '@/constants'
</script>

{#if $locale === 'tr'}
  <div class="wide jumbotron home-jumbotron">
    <div class="container">
      <h1 class="display-4">TopoHub</h1>
      <p class="lead">topolojik karşıörneklerin etkileşimli veritabanı</p>
      <div class="ml-3 mt-4">
        <p>
          ➜ İsim veya açıklamayla uzay ara:
          <a href="/spaces?text=compactification" class="text-info"
            >tıkızlaştırmalar</a
          >
        </p>
        <p>
          ➜ Özelliklere göre uzay ara:
          <a
            href="/spaces?q=compact%20%2B%20connected%20%2B%20t_2%20%2B%20~metrizable"
            class="text-info">metrik olmayan sürekliler</a
          >
        </p>
        <p class="mb-0">
          ➜ Karşıörnek bul:
          <a href="/theorems/T000040" class="text-info"
            >bağlantılı uzaylar yol-bağlantılı olmak zorunda değildir</a
          >
        </p>
      </div>
    </div>
  </div>

  <main class="container">
    <blockquote class="blockquote text-center mt-5 mb-5">
      <p class="mb-0">
        Topoloji, karşıörneklerle dolu yoğun bir ormandır. Bu ormanın kullanışlı
        bir haritası değerli bir şeydir.
      </p>
      <footer class="blockquote-footer">
        Mary Ellen Rudin'in
        <cite title="Counterexamples in Topology"
          >Counterexamples in Topology</cite
        >
        incelemesinden uyarlandı
      </footer>
    </blockquote>
    <hr />
    <h3>TopoHub Hakkında</h3>
    <p>
      <strong>TopoHub</strong>, <a href="https://github.com/pi-base">pi-Base</a>
      açık kaynak altyapısı üzerine kurulmuş bir topoloji öğretim aracıdır. Topolojik
      uzayları, özelliklerini ve teoremlerini etkileşimli olarak keşfetmenizi sağlar.
      Pi-Base verisini (CC-BY 4.0) ve yazılımını (MIT) kullanır.
    </p>
    <h3>Katkı</h3>
    <p>
      Pi-Base'in verisi ve yazılımı <a href="https://github.com/pi-base/"
        >GitHub</a
      >'da açık kaynaktır. Yeni uzaylar, özellikler ve teoremler eklemek için
      <a href={contributingUrl}>katkıda bulunma rehberine</a> bakabilirsiniz.
    </p>
    <h3>Pi-Base Topluluğu</h3>
    <p>
      Pi-Base, 2014'te <a href="https://github.com/jamesdabbs">James Dabbs</a>
      tarafından kuruldu. <a href="https://clontz.org">Steven Clontz</a> 2017'de
      baş matematiksel editör olarak katıldı.
    </p>
    <p>
      Daha fazla matematik veritabanı için
      <a href="https://mathbases.org/">Index of Mathematical DataBases</a>'a göz
      atabilirsiniz.
    </p>
  </main>
  <Cite />
{:else}
  <div class="wide jumbotron home-jumbotron">
    <div class="container">
      <h1 class="display-4">TopoHub</h1>
      <p class="lead">an interactive database of topological counterexamples</p>
      <div class="ml-3 mt-4">
        <p>
          ➜ Search spaces by name/description:
          <a href="/spaces?text=compactification" class="text-info"
            >compactifications</a
          >
        </p>
        <p>
          ➜ Search spaces by properties:
          <a
            href="/spaces?q=compact%20%2B%20connected%20%2B%20t_2%20%2B%20~metrizable"
            class="text-info">non-metric continua</a
          >
        </p>
        <p class="mb-0">
          ➜ Find counterexamples:
          <a href="/theorems/T000040" class="text-info"
            >connected spaces need not be path connected</a
          >
        </p>
      </div>
    </div>
  </div>

  <main class="container">
    <blockquote class="blockquote text-center mt-5 mb-5">
      <p class="mb-0">
        Topology is a dense forest of counterexamples. A usable map of the
        forest is a fine thing.
      </p>
      <footer class="blockquote-footer">
        Paraphrased from Mary Ellen Rudin's review of
        <cite title="Counterexamples in Topology"
          >Counterexamples in Topology</cite
        >
      </footer>
    </blockquote>
    <hr />
    <h3>About TopoHub</h3>
    <p>
      <strong>TopoHub</strong> is a topology teaching tool built on the
      <a href="https://github.com/pi-base">pi-Base</a> open-source infrastructure.
      It lets you interactively explore topological spaces, their properties, and
      theorems. It uses pi-Base data (CC-BY 4.0) and software (MIT).
    </p>
    <h3>Contributing</h3>
    <p>
      Pi-Base's data and software are open-sourced on
      <a href="https://github.com/pi-base/">GitHub</a>. To add new spaces,
      properties, or theorems see the
      <a href={contributingUrl}>contributing guide</a>.
    </p>
    <h3>Pi-Base Community</h3>
    <p>
      Pi-Base was founded in 2014 by
      <a href="https://github.com/jamesdabbs">James Dabbs</a>.
      <a href="https://clontz.org">Steven Clontz</a> joined as lead mathematical
      editor in 2017.
    </p>
    <p>
      For more mathematical databases, see the
      <a href="https://mathbases.org/">Index of Mathematical DataBases</a>.
    </p>
  </main>
  <Cite />
{/if}
