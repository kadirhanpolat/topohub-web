import { addMessages, init, locale, getLocaleFromNavigator } from 'svelte-i18n'
import { browser } from '$app/environment'

import en from './locales/en.json'
import tr from './locales/tr.json'

export const supportedLocales = ['tr', 'en'] as const
export type SupportedLocale = (typeof supportedLocales)[number]

const STORAGE_KEY = 'topohub.locale'
const FALLBACK: SupportedLocale = 'en'

addMessages('en', en)
addMessages('tr', tr)

function pickInitialLocale(): SupportedLocale {
  if (!browser) return FALLBACK
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && (supportedLocales as readonly string[]).includes(stored)) {
    return stored as SupportedLocale
  }
  const nav = getLocaleFromNavigator() ?? ''
  return nav.toLowerCase().startsWith('tr') ? 'tr' : 'en'
}

init({
  fallbackLocale: FALLBACK,
  initialLocale: pickInitialLocale(),
})

export function setLocale(next: SupportedLocale) {
  locale.set(next)
  if (browser) localStorage.setItem(STORAGE_KEY, next)
}
