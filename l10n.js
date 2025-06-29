const { join } = require('path');
const { readdirSync, readFileSync } = require('fs');

class L10nManager {
  constructor() {
    this.locales = new Map();
    this.loadDefaultLocales();
  }

  loadDefaultLocales() {
    const localesDir = join(__dirname, 'locales');

    try {
      const localeFiles = readdirSync(localesDir);

      for (const file of localeFiles) {
        if (!file.endsWith('.json')) continue;

        const locale = file.replace('.json', '');
        const localeData = JSON.parse(readFileSync(join(localesDir, file), 'utf8'));
        this.locales.set(locale, localeData);
      }
    } catch {
      // Fallback to English if locales directory doesn't exist
      this.locales.set('en', {
        units: {
          millisecond: { singular: 'millisecond', plural: 'milliseconds', short: 'ms', medium: 'ms' },
          second: { singular: 'second', plural: 'seconds', short: 's', medium: 'sec' },
          minute: { singular: 'minute', plural: 'minutes', short: 'm', medium: 'min' },
          hour: { singular: 'hour', plural: 'hours', short: 'h', medium: 'hr' },
          day: { singular: 'day', plural: 'days', short: 'd', medium: 'day' },
        },
      });
    }
  }

  getUnitName(unit, count, format, locale = 'en') {
    const localeData = this.locales.get(locale) || this.locales.get('en');
    const unitData = localeData.units[unit];

    if (!unitData) throw new Error(`Unit '${unit}' not found in locale '${locale}'`);

    switch (format) {
      case 'short':
        return unitData.short;
      case 'medium':
        // For units that already end with 's' or are abbreviations, don't add 's'
        if (unit === 'millisecond' || unitData.medium.endsWith('s')) return unitData.medium;
        return count === 1 ? unitData.medium : `${unitData.medium}s`;
      case 'long':
        return count === 1 ? unitData.singular : unitData.plural;
      default:
        return count === 1 ? unitData.singular : unitData.plural;
    }
  }

  getSupportedLocales() {
    return Array.from(this.locales.keys());
  }

  isSupported(locale) {
    return this.locales.has(locale);
  }
}

module.exports = new L10nManager();
