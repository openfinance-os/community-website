#!/usr/bin/env tsx
/**
 * Translation Validation Script
 *
 * This script validates that all translation files are complete and consistent.
 * It checks for:
 * - Missing keys between locales
 * - Empty translation values
 * - Mismatched interpolation variables
 * - Invalid JSON structure
 *
 * Usage: npx tsx scripts/validate-translations.ts
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const I18N_DIR = join(__dirname, '../src/i18n');

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

type TranslationValue = string | Record<string, unknown>;
type TranslationObject = Record<string, TranslationValue>;

/**
 * Flattens a nested object into dot-notation keys
 */
function flattenObject(
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, string> {
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
 * Extracts interpolation variables from a string (e.g., {year}, {name})
 */
function extractVariables(str: string): string[] {
  const matches = str.match(/\{(\w+)\}/g);
  return matches ? matches.map((m) => m.slice(1, -1)).sort() : [];
}

/**
 * Loads and parses a translation JSON file
 */
function loadTranslation(locale: string): TranslationObject | null {
  const filePath = join(I18N_DIR, `${locale}.json`);
  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as TranslationObject;
  } catch (error) {
    console.error(`Failed to load translation file: ${filePath}`);
    if (error instanceof Error) {
      console.error(error.message);
    }
    return null;
  }
}

/**
 * Gets all available locale files
 */
function getAvailableLocales(): string[] {
  const files = readdirSync(I18N_DIR);
  return files
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''));
}

/**
 * Validates translations for completeness and consistency
 */
function validateTranslations(): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  const locales = getAvailableLocales();

  if (locales.length === 0) {
    result.errors.push('No translation files found in ' + I18N_DIR);
    result.isValid = false;
    return result;
  }

  console.log(`Found ${locales.length} locale(s): ${locales.join(', ')}\n`);

  // Load all translations
  const translations: Record<string, Record<string, string>> = {};
  const rawTranslations: Record<string, TranslationObject> = {};

  for (const locale of locales) {
    const data = loadTranslation(locale);
    if (!data) {
      result.errors.push(`Failed to load ${locale}.json`);
      result.isValid = false;
      continue;
    }
    rawTranslations[locale] = data;
    translations[locale] = flattenObject(data as Record<string, unknown>);
  }

  // Get reference locale (English) keys
  const referenceLocale = 'en';
  const referenceKeys = translations[referenceLocale]
    ? Object.keys(translations[referenceLocale])
    : [];

  if (referenceKeys.length === 0) {
    result.errors.push('Reference locale (en) has no keys');
    result.isValid = false;
    return result;
  }

  console.log(`Reference locale (${referenceLocale}) has ${referenceKeys.length} keys\n`);

  // Check each locale against reference
  for (const locale of locales) {
    if (locale === referenceLocale) continue;

    const localeKeys = Object.keys(translations[locale] || {});
    console.log(`Checking ${locale} (${localeKeys.length} keys)...`);

    // Check for missing keys
    const missingKeys = referenceKeys.filter((key) => !localeKeys.includes(key));
    if (missingKeys.length > 0) {
      result.errors.push(
        `${locale}: Missing ${missingKeys.length} key(s):\n  - ${missingKeys.join('\n  - ')}`
      );
      result.isValid = false;
    }

    // Check for extra keys (not in reference)
    const extraKeys = localeKeys.filter((key) => !referenceKeys.includes(key));
    if (extraKeys.length > 0) {
      result.warnings.push(
        `${locale}: Has ${extraKeys.length} extra key(s) not in reference:\n  - ${extraKeys.join('\n  - ')}`
      );
    }

    // Check for empty values
    const emptyKeys = localeKeys.filter((key) => {
      const value = translations[locale][key];
      return !value || value.trim() === '';
    });
    if (emptyKeys.length > 0) {
      result.errors.push(
        `${locale}: Has ${emptyKeys.length} empty value(s):\n  - ${emptyKeys.join('\n  - ')}`
      );
      result.isValid = false;
    }

    // Check interpolation variable consistency
    for (const key of referenceKeys) {
      const refValue = translations[referenceLocale][key];
      const localeValue = translations[locale]?.[key];

      if (refValue && localeValue) {
        const refVars = extractVariables(refValue);
        const localeVars = extractVariables(localeValue);

        if (JSON.stringify(refVars) !== JSON.stringify(localeVars)) {
          result.errors.push(
            `${locale}: Key "${key}" has mismatched variables.\n` +
              `  Reference: {${refVars.join('}, {')}}\n` +
              `  ${locale}: {${localeVars.join('}, {')}}`
          );
          result.isValid = false;
        }
      }
    }
  }

  // Check for required metadata
  const requiredMetaKeys = ['meta.language', 'meta.languageNative', 'meta.direction', 'meta.locale'];
  for (const locale of locales) {
    for (const metaKey of requiredMetaKeys) {
      if (!translations[locale]?.[metaKey]) {
        result.errors.push(`${locale}: Missing required metadata key "${metaKey}"`);
        result.isValid = false;
      }
    }
  }

  return result;
}

/**
 * Main execution
 */
function main() {
  console.log('='.repeat(60));
  console.log('Translation Validation Report');
  console.log('='.repeat(60));
  console.log('');

  const result = validateTranslations();

  console.log('\n' + '='.repeat(60));

  if (result.warnings.length > 0) {
    console.log('\nWarnings:');
    result.warnings.forEach((w) => console.log(`  ⚠️  ${w}`));
  }

  if (result.errors.length > 0) {
    console.log('\nErrors:');
    result.errors.forEach((e) => console.log(`  ❌ ${e}`));
  }

  console.log('\n' + '='.repeat(60));

  if (result.isValid) {
    console.log('✅ All translations are valid!');
    process.exit(0);
  } else {
    console.log(`❌ Validation failed with ${result.errors.length} error(s)`);
    process.exit(1);
  }
}

main();
