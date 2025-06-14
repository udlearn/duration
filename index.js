class Duration {
  _duration; // time in milliseconds.

  static millisecondsPerSecond = 1000;
  static secondsPerMinute = 60;
  static minutesPerHour = 60;
  static hoursPerDay = 24;
  static millisecondsPerMinute = Duration.millisecondsPerSecond * Duration.secondsPerMinute;
  static millisecondsPerHour = Duration.minutesPerHour * Duration.millisecondsPerMinute;
  static millisecondsPerDay = Duration.hoursPerDay * Duration.millisecondsPerHour;
  static zero = new Duration({ milliseconds: 0 });

  constructor({ days = 0, hours = 0, minutes = 0, seconds = 0, milliseconds = 0 } = {}) {
    this._duration =
      milliseconds +
      Duration.millisecondsPerSecond * seconds +
      Duration.millisecondsPerMinute * minutes +
      Duration.millisecondsPerHour * hours +
      Duration.millisecondsPerDay * days;
  }

  static from(value, unit = 'ms') {
    for (const [key, aliases] of Object.entries(ALIASES)) {
      if (aliases.includes(String(unit).toLowerCase())) {
        unit = key;
        break;
      }
    }
    // when unit is not found, default to milliseconds
    unit = Object.keys(ALIASES).includes(unit) ? unit : 'milliseconds';

    return new Duration({ [unit]: value });
  }

  static fromDate(date, now = new Date()) {
    now = now instanceof Date ? now : new Date(now);
    date = date instanceof Date ? date : new Date(date);
    return new Duration({ milliseconds: now.getTime() - date.getTime() });
  }

  get inMilliseconds() {
    return this._duration;
  }

  get inSeconds() {
    return this._duration / Duration.millisecondsPerSecond;
  }

  get inMinutes() {
    return this._duration / Duration.millisecondsPerMinute;
  }

  get inHours() {
    return this._duration / Duration.millisecondsPerHour;
  }

  get inDays() {
    return this._duration / Duration.millisecondsPerDay;
  }

  get milliseconds() {
    // accounting for microseconds too (e.g., 3.24 ms, not just 3 ms)
    return this._duration % Duration.millisecondsPerSecond;
  }

  get seconds() {
    return Math.floor(this.inSeconds % Duration.secondsPerMinute);
  }

  get minutes() {
    return Math.floor(this.inMinutes % Duration.minutesPerHour);
  }

  get hours() {
    return Math.floor(this.inHours % Duration.hoursPerDay);
  }

  get days() {
    return Math.floor(this.inDays);
  }

  get isNegative() {
    return this._duration < 0;
  }

  get isZero() {
    return this._duration === 0;
  }

  get isPositive() {
    return this._duration > 0;
  }

  get short() {
    const { milliseconds, seconds, minutes, hours, days } = this;

    let duration = milliseconds > 0 ? `${milliseconds}ms` : '';
    if (seconds > 0) duration = `${seconds}s ${duration}`;
    if (minutes > 0) duration = `${minutes}m ${duration}`;
    if (hours > 0) duration = `${hours}h ${duration}`;
    if (days > 0) duration = `${days}d ${duration}`;

    return duration.trim();
  }

  get medium() {
    const { milliseconds, seconds, minutes, hours, days } = this;

    let duration = milliseconds > 0 ? `${milliseconds} ms` : '';
    if (seconds > 0) duration = `${seconds} ${pluralize(seconds, 'sec')} ${duration}`;
    if (minutes > 0) duration = `${minutes} ${pluralize(minutes, 'min')} ${duration}`;
    if (hours > 0) duration = `${hours} ${pluralize(hours, 'hr')} ${duration}`;
    if (days > 0) duration = `${days} ${pluralize(days, 'day')} ${duration}`;

    return duration.trim();
  }

  get long() {
    const { milliseconds, seconds, minutes, hours, days } = this;

    let duration = milliseconds > 0 ? `${milliseconds} ${pluralize(milliseconds, 'millisecond')}` : '';
    if (seconds > 0) duration = `${seconds} ${pluralize(seconds, 'second')} ${duration}`;
    if (minutes > 0) duration = `${minutes} ${pluralize(minutes, 'minute')} ${duration}`;
    if (hours > 0) duration = `${hours} ${pluralize(hours, 'hour')} ${duration}`;
    if (days > 0) duration = `${days} ${pluralize(days, 'day')} ${duration}`;

    return duration.trim();
  }

  format(pattern = 'short' /* 'short' | 'medium' | 'long' | pattern */) {
    if (typeof pattern !== 'string') pattern = 'short';
    pattern = pattern.toLowerCase();

    if (pattern === 'short') return this.short;
    if (pattern === 'medium') return this.medium;
    if (pattern === 'long') return this.long;

    return pattern.replace(/%d|%h|%m|%s|%l/gu, (match) => {
      switch (match) {
        case '%d':
          return this.days;
        case '%h':
          return this.hours;
        case '%m':
          return this.minutes;
        case '%s':
          return this.seconds;
        case '%l':
          return this.milliseconds;
      }
    });
  }

  add(duration) {
    const milliseconds = (duration instanceof Duration ? duration : new Duration(duration)).inMilliseconds;
    return new Duration({ milliseconds: this.inMilliseconds + milliseconds });
  }

  subtract(duration) {
    const milliseconds = (duration instanceof Duration ? duration : new Duration(duration)).inMilliseconds;
    return new Duration({ milliseconds: this.inMilliseconds - milliseconds });
  }

  multiply(multiplier) {
    return new Duration({ milliseconds: this.inMilliseconds * multiplier });
  }

  divide(divisor) {
    if (divisor === 0) throw new Error('Division by zero is not allowed');
    return new Duration({ milliseconds: this.inMilliseconds / divisor });
  }

  negate() {
    return this.multiply(-1);
  }

  compareTo(duration) {
    const diff = this.inMilliseconds - duration.inMilliseconds;
    return diff === 0 ? 0 : diff > 0 ? 1 : -1;
  }

  toJson() {
    return {
      milliseconds: this.inMilliseconds,
      seconds: this.inSeconds,
      minutes: this.inMinutes,
      hours: this.inHours,
      days: this.inDays,
    };
  }

  toString() {
    return `Duration in milliseconds: ${this.inMilliseconds}`;
  }
}

const pluralize = (value, unit) => (value > 1 ? `${unit}s` : unit);

const ALIASES = {
  milliseconds: ['ms', 'milli', 'millis', 'millisecond', 'milliseconds'],
  seconds: ['s', 'sec', 'secs', 'second', 'seconds'],
  minutes: ['m', 'min', 'mins', 'minute', 'minutes'],
  hours: ['h', 'hr', 'hrs', 'hour', 'hours'],
  days: ['d', 'day', 'days'],
};

module.exports = Duration;
module.exports.default = Duration;
