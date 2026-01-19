/**
 * Internationalization utilities for the OpenFinance OS website
 */

import en from './en.json';
import ar from './ar.json';

export type Locale = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

export const DEFAULT_LOCALE: Locale = 'en';
export const SUPPORTED_LOCALES: Locale[] = ['en', 'ar'];

// Type-safe translations object
const translations: Record<Locale, typeof en> = {
  en,
  ar,
};

/**
 * Flattens a nested object into dot-notation keys
 * @example { nav: { home: "Home" } } => { "nav.home": "Home" }
 */
export function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};

  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else if (typeof value === 'string') {
      result[newKey] = value;
    }
  }

  return result;
}

/**
 * Gets a nested value from an object using dot notation
 * @example getNestedValue({ nav: { home: "Home" } }, "nav.home") => "Home"
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Translates a key to the specified locale
 * Supports interpolation with {variable} syntax
 * @example t('footer.copyright', 'en', { year: '2024' }) => "© 2024 OpenFinance OS..."
 */
export function t(
  key: string,
  locale: Locale = DEFAULT_LOCALE,
  variables?: Record<string, string | number>
): string {
  const translation = translations[locale];
  if (!translation) {
    return key;
  }

  let value = getNestedValue(translation as unknown as Record<string, unknown>, key);

  if (value === undefined) {
    // Fallback to default locale if key not found
    if (locale !== DEFAULT_LOCALE) {
      value = getNestedValue(
        translations[DEFAULT_LOCALE] as unknown as Record<string, unknown>,
        key
      );
    }
    // If still not found, return the key itself
    if (value === undefined) {
      return key;
    }
  }

  // Handle variable interpolation
  if (variables) {
    for (const [varKey, varValue] of Object.entries(variables)) {
      value = value.replace(new RegExp(`\\{${varKey}\\}`, 'g'), String(varValue));
    }
  }

  return value;
}

/**
 * Gets the text direction for a locale
 */
export function getDirection(locale: Locale): Direction {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

/**
 * Checks if a locale uses RTL direction
 */
export function isRTL(locale: Locale): boolean {
  return getDirection(locale) === 'rtl';
}

/**
 * Gets the localized path for a given path and locale
 * @example getLocalizedPath('/about', 'ar') => '/ar/about'
 * @example getLocalizedPath('/about', 'en') => '/about'
 */
export function getLocalizedPath(path: string, locale: Locale): string {
  // Remove any existing locale prefix
  const cleanPath = path.replace(/^\/(en|ar)/, '');
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  // Default locale doesn't need prefix
  if (locale === DEFAULT_LOCALE) {
    return normalizedPath || '/';
  }

  return `/${locale}${normalizedPath}`;
}

/**
 * Extracts the locale from a URL path
 * @example getLocaleFromPath('/ar/about') => 'ar'
 * @example getLocaleFromPath('/about') => 'en'
 */
export function getLocaleFromPath(path: string): Locale {
  const match = path.match(/^\/(en|ar)(\/|$)/);
  if (match && SUPPORTED_LOCALES.includes(match[1] as Locale)) {
    return match[1] as Locale;
  }
  return DEFAULT_LOCALE;
}

/**
 * Removes the locale prefix from a path
 * @example removeLocaleFromPath('/ar/about') => '/about'
 */
export function removeLocaleFromPath(path: string): string {
  return path.replace(/^\/(en|ar)/, '') || '/';
}

/**
 * Gets all translation keys for a locale (flattened)
 */
export function getTranslationKeys(locale: Locale): string[] {
  const translation = translations[locale];
  if (!translation) {
    return [];
  }
  return Object.keys(flattenObject(translation as unknown as Record<string, unknown>));
}

/**
 * Checks if a translation key exists for a locale
 */
export function hasTranslation(key: string, locale: Locale): boolean {
  const translation = translations[locale];
  if (!translation) {
    return false;
  }
  return getNestedValue(translation as unknown as Record<string, unknown>, key) !== undefined;
}

/**
 * Gets the native language name for a locale
 */
export function getLanguageName(locale: Locale): string {
  return t('meta.languageNative', locale);
}

/**
 * Gets all supported locales with their display names
 */
export function getSupportedLocales(): Array<{ locale: Locale; name: string }> {
  return SUPPORTED_LOCALES.map((locale) => ({
    locale,
    name: getLanguageName(locale),
  }));
}

/**
 * Validates if a string is a valid locale
 */
export function isValidLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}
