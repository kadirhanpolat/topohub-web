import { derived } from 'svelte/store'
import { locale } from 'svelte-i18n'
import tr from './space-names/tr.json'

const dictionaries: Record<string, Record<string, string>> = {
  tr,
}

function pad(id: number): string {
  return 'S' + String(id).padStart(6, '0')
}

export const spaceName = derived(locale, $locale => {
  return (id: number, fallback: string): string => {
    if (!$locale) return fallback
    const dict = dictionaries[$locale]
    if (!dict) return fallback
    return dict[pad(id)] ?? fallback
  }
})
