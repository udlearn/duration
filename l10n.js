const localeData = require('./locales');

class L10nManager {
  constructor() {
    this.locales = new Map();

    for (const [locale, data] of Object.entries(localeData)) {
      this.locales.set(locale, data);
    }
  }

  get supportedLocales() {
    return Array.from(this.locales.keys());
  }

  isSupported(locale) {
    return this.locales.has(locale);
  }

  getUnit(unit, count, format, locale = 'en') {
    const localeData = this.locales.get(locale) || this.locales.get('en');
    const unitData = localeData.units[unit] || {};

    if (format === 'short') return unitData.short;
    if (format === 'medium') return unitData.medium;
    return count === 1 ? unitData.singular : unitData.plural;
  }
}

module.exports = new L10nManager();
