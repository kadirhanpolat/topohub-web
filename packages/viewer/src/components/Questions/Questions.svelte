<script lang="ts">
  import { _, locale } from 'svelte-i18n'
  import type { Space, Property, Trait } from '@/types'
  import { Dice } from '../Shared/Icons'
  import Typeset from '../Shared/Typeset.svelte'
  import context from '@/context'
  const { spaces, traits } = context()
  let openQuestion:
    | { space: Space; property: Property; trait: Trait | undefined }
    | undefined = undefined
  const rollOpenQuestion = () => {
    openQuestion = undefined
    const ss = $spaces.all
    if (ss.length === 0) return
    const MAX_ATTEMPTS = 500
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const randomSpace = ss[Math.floor(Math.random() * ss.length)]
      const openQuestions = $traits
        .forSpaceAll(randomSpace)
        .map(([p, t]) => ({
          space: randomSpace,
          property: p,
          trait: t,
        }))
        .filter(question => question.trait === undefined)
      if (openQuestions.length > 0) {
        openQuestion =
          openQuestions[Math.floor(Math.random() * openQuestions.length)]
        return
      }
    }
  }
  rollOpenQuestion()
  $: bodyMain = openQuestion
    ? $locale === 'tr'
      ? `{S${openQuestion.space.id}} uzayı {P${openQuestion.property.id}} özelliğini sağlıyor mu?`
      : `Does {S${openQuestion.space.id}} satisfy {P${openQuestion.property.id}}?`
    : ''
  $: bodySecondary = openQuestion
    ? `${$_('questions.traitLink')} {S${openQuestion.space.id}|P${
        openQuestion.property.id
      }}`
    : ''
</script>

<div class="text-center my-3">
  <div class="mb-3">
    <button
      type="button"
      class="btn btn-outline-secondary"
      on:click={() => rollOpenQuestion()}
    >
      <Dice />
      {$_('questions.reroll')}
    </button>
  </div>
  {#if openQuestion}
    <div class="lead mb-3" style="font-size:2em">
      <Typeset body={bodyMain} />
    </div>
    <div class="mb-3">
      <Typeset body={bodySecondary} />
    </div>
  {/if}
  <p>
    <small>{$_('questions.disclaimer')}</small>
  </p>
</div>
