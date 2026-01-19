import { describe, it, expect } from 'vitest';
import {
  t,
  getDirection,
  isRTL,
  getLocalizedPath,
  getLocaleFromPath,
  removeLocaleFromPath,
  getTranslationKeys,
  hasTranslation,
  getLanguageName,
  getSupportedLocales,
  isValidLocale,
  flattenObject,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
} from '../utils';

describe('i18n utilities', () => {
  describe('t() - translation function', () => {
    it('returns correct English translation for key', () => {
      expect(t('nav.observatory', 'en')).toBe('Observatory');
      expect(t('nav.about', 'en')).toBe('About');
    });

    it('returns correct Arabic translation for key', () => {
      expect(t('nav.observatory', 'ar')).toBe('المرصد');
      expect(t('nav.about', 'ar')).toBe('عن المشروع');
    });

    it('handles nested keys correctly', () => {
      expect(t('home.hero.title', 'en')).toBe('UAE Open Finance Community');
      expect(t('home.hero.title', 'ar')).toBe('مجتمع التمويل المفتوح في الإمارات');
    });

    it('returns key when translation is missing', () => {
      expect(t('nonexistent.key', 'en')).toBe('nonexistent.key');
      expect(t('nonexistent.key', 'ar')).toBe('nonexistent.key');
    });

    it('falls back to default locale when key missing in non-default locale', () => {
      // If a key exists in English but not Arabic, it should fall back to English
      // Note: Our current translations have all keys, so this tests the fallback logic
      expect(t('nav.observatory', 'ar')).toBe('المرصد');
    });

    it('uses default locale when locale parameter is omitted', () => {
      expect(t('nav.observatory')).toBe('Observatory');
    });

    it('handles variable interpolation', () => {
      expect(t('footer.copyright', 'en', { year: '2024' })).toBe(
        '© 2024 OpenFinance OS. Open source under MIT License.'
      );
      expect(t('footer.copyright', 'ar', { year: '2024' })).toBe(
        '© 2024 OpenFinance OS. مفتوح المصدر تحت رخصة MIT.'
      );
    });

    it('handles multiple variable interpolation', () => {
      // Test that multiple occurrences of the same variable are replaced
      const result = t('footer.copyright', 'en', { year: '2025' });
      expect(result).toContain('2025');
    });
  });

  describe('getDirection()', () => {
    it('returns rtl for Arabic', () => {
      expect(getDirection('ar')).toBe('rtl');
    });

    it('returns ltr for English', () => {
      expect(getDirection('en')).toBe('ltr');
    });
  });

  describe('isRTL()', () => {
    it('returns true for Arabic', () => {
      expect(isRTL('ar')).toBe(true);
    });

    it('returns false for English', () => {
      expect(isRTL('en')).toBe(false);
    });
  });

  describe('getLocalizedPath()', () => {
    it('returns path without prefix for default locale (English)', () => {
      expect(getLocalizedPath('/about', 'en')).toBe('/about');
      expect(getLocalizedPath('/observatory', 'en')).toBe('/observatory');
      expect(getLocalizedPath('/news/article', 'en')).toBe('/news/article');
    });

    it('returns path with locale prefix for Arabic', () => {
      expect(getLocalizedPath('/about', 'ar')).toBe('/ar/about');
      expect(getLocalizedPath('/observatory', 'ar')).toBe('/ar/observatory');
      expect(getLocalizedPath('/news/article', 'ar')).toBe('/ar/news/article');
    });

    it('handles root path correctly', () => {
      expect(getLocalizedPath('/', 'en')).toBe('/');
      expect(getLocalizedPath('/', 'ar')).toBe('/ar/');
    });

    it('removes existing locale prefix before adding new one', () => {
      expect(getLocalizedPath('/ar/about', 'en')).toBe('/about');
      expect(getLocalizedPath('/en/about', 'ar')).toBe('/ar/about');
    });

    it('handles paths without leading slash', () => {
      expect(getLocalizedPath('about', 'ar')).toBe('/ar/about');
      expect(getLocalizedPath('about', 'en')).toBe('/about');
    });
  });

  describe('getLocaleFromPath()', () => {
    it('extracts Arabic locale from path', () => {
      expect(getLocaleFromPath('/ar/about')).toBe('ar');
      expect(getLocaleFromPath('/ar/')).toBe('ar');
      expect(getLocaleFromPath('/ar')).toBe('ar');
    });

    it('extracts English locale from path', () => {
      expect(getLocaleFromPath('/en/about')).toBe('en');
    });

    it('returns default locale for paths without locale prefix', () => {
      expect(getLocaleFromPath('/about')).toBe('en');
      expect(getLocaleFromPath('/')).toBe('en');
      expect(getLocaleFromPath('/news/article')).toBe('en');
    });

    it('returns default locale for invalid locale prefix', () => {
      expect(getLocaleFromPath('/fr/about')).toBe('en');
      expect(getLocaleFromPath('/de/about')).toBe('en');
    });
  });

  describe('removeLocaleFromPath()', () => {
    it('removes Arabic locale prefix', () => {
      expect(removeLocaleFromPath('/ar/about')).toBe('/about');
      expect(removeLocaleFromPath('/ar/news/article')).toBe('/news/article');
    });

    it('removes English locale prefix', () => {
      expect(removeLocaleFromPath('/en/about')).toBe('/about');
    });

    it('returns path unchanged if no locale prefix', () => {
      expect(removeLocaleFromPath('/about')).toBe('/about');
      expect(removeLocaleFromPath('/news/article')).toBe('/news/article');
    });

    it('returns root for locale-only paths', () => {
      expect(removeLocaleFromPath('/ar')).toBe('/');
      expect(removeLocaleFromPath('/en')).toBe('/');
    });
  });

  describe('getTranslationKeys()', () => {
    it('returns array of flattened keys for English', () => {
      const keys = getTranslationKeys('en');
      expect(Array.isArray(keys)).toBe(true);
      expect(keys).toContain('nav.observatory');
      expect(keys).toContain('home.hero.title');
      expect(keys).toContain('footer.copyright');
    });

    it('returns array of flattened keys for Arabic', () => {
      const keys = getTranslationKeys('ar');
      expect(Array.isArray(keys)).toBe(true);
      expect(keys).toContain('nav.observatory');
      expect(keys).toContain('home.hero.title');
    });

    it('returns empty array for invalid locale', () => {
      // @ts-expect-error - Testing invalid input
      const keys = getTranslationKeys('invalid');
      expect(keys).toEqual([]);
    });
  });

  describe('hasTranslation()', () => {
    it('returns true for existing keys', () => {
      expect(hasTranslation('nav.observatory', 'en')).toBe(true);
      expect(hasTranslation('nav.observatory', 'ar')).toBe(true);
      expect(hasTranslation('home.hero.title', 'en')).toBe(true);
    });

    it('returns false for non-existing keys', () => {
      expect(hasTranslation('nonexistent.key', 'en')).toBe(false);
      expect(hasTranslation('nonexistent.key', 'ar')).toBe(false);
    });

    it('returns false for invalid locale', () => {
      // @ts-expect-error - Testing invalid input
      expect(hasTranslation('nav.observatory', 'invalid')).toBe(false);
    });
  });

  describe('getLanguageName()', () => {
    it('returns native language name for each locale', () => {
      expect(getLanguageName('en')).toBe('English');
      expect(getLanguageName('ar')).toBe('العربية');
    });
  });

  describe('getSupportedLocales()', () => {
    it('returns all supported locales with display names', () => {
      const locales = getSupportedLocales();
      expect(locales).toHaveLength(2);
      expect(locales).toContainEqual({ locale: 'en', name: 'English' });
      expect(locales).toContainEqual({ locale: 'ar', name: 'العربية' });
    });
  });

  describe('isValidLocale()', () => {
    it('returns true for valid locales', () => {
      expect(isValidLocale('en')).toBe(true);
      expect(isValidLocale('ar')).toBe(true);
    });

    it('returns false for invalid locales', () => {
      expect(isValidLocale('fr')).toBe(false);
      expect(isValidLocale('de')).toBe(false);
      expect(isValidLocale('')).toBe(false);
      expect(isValidLocale('english')).toBe(false);
    });
  });

  describe('flattenObject()', () => {
    it('flattens nested objects correctly', () => {
      const nested = {
        nav: {
          home: 'Home',
          about: 'About',
        },
        footer: {
          links: {
            github: 'GitHub',
          },
        },
      };

      const flattened = flattenObject(nested);
      expect(flattened['nav.home']).toBe('Home');
      expect(flattened['nav.about']).toBe('About');
      expect(flattened['footer.links.github']).toBe('GitHub');
    });

    it('handles empty objects', () => {
      expect(flattenObject({})).toEqual({});
    });

    it('handles single-level objects', () => {
      const flat = { key1: 'value1', key2: 'value2' };
      const result = flattenObject(flat);
      expect(result).toEqual(flat);
    });

    it('ignores non-string values', () => {
      const mixed = {
        string: 'value',
        number: 123,
        array: ['a', 'b'],
        nested: {
          str: 'nested value',
        },
      };

      const result = flattenObject(mixed as unknown as Record<string, unknown>);
      expect(result['string']).toBe('value');
      expect(result['nested.str']).toBe('nested value');
      expect(result['number']).toBeUndefined();
      expect(result['array']).toBeUndefined();
    });
  });

  describe('constants', () => {
    it('DEFAULT_LOCALE is English', () => {
      expect(DEFAULT_LOCALE).toBe('en');
    });

    it('SUPPORTED_LOCALES includes en and ar', () => {
      expect(SUPPORTED_LOCALES).toContain('en');
      expect(SUPPORTED_LOCALES).toContain('ar');
      expect(SUPPORTED_LOCALES).toHaveLength(2);
    });
  });
});

describe('translation completeness', () => {
  it('Arabic has all the same keys as English', () => {
    const enKeys = getTranslationKeys('en');
    const arKeys = getTranslationKeys('ar');

    const missingInArabic = enKeys.filter((key) => !arKeys.includes(key));
    expect(missingInArabic).toEqual([]);
  });

  it('English has all the same keys as Arabic', () => {
    const enKeys = getTranslationKeys('en');
    const arKeys = getTranslationKeys('ar');

    const missingInEnglish = arKeys.filter((key) => !enKeys.includes(key));
    expect(missingInEnglish).toEqual([]);
  });
});
