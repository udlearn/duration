class Duration {
  _duration; // duration in milliseconds.

  static millisecondsPerSecond = 1000;
  static secondsPerMinute = 60;
  static minutesPerHour = 60;
  static hoursPerDay = 24;
  static millisecondsPerMinute = Duration.millisecondsPerSecond * Duration.secondsPerMinute;
  static millisecondsPerHour = Duration.minutesPerHour * Duration.millisecondsPerMinute;
  static millisecondsPerDay = Duration.hoursPerDay * Duration.millisecondsPerHour;

  constructor({ days = 0, hours = 0, minutes = 0, seconds = 0, milliseconds = 0 } = {}) {
    this._duration =
      milliseconds +
      Duration.millisecondsPerSecond * seconds +
      Duration.millisecondsPerMinute * minutes +
      Duration.millisecondsPerHour * hours +
      Duration.millisecondsPerDay * days;
  }

  static from(milliseconds) {
    return new Duration({ milliseconds });
  }

  static zero() {
    return new Duration({ milliseconds: 0 });
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
    return this._duration % Duration.millisecondsPerSecond; // accounting for microseconds too.
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
    let duration = this.milliseconds > 0 ? `${this.milliseconds}ms` : '';
    if (this.seconds > 0) duration = `${this.seconds}s ${duration}`;
    if (this.minutes > 0) duration = `${this.minutes}m ${duration}`;
    if (this.hours > 0) duration = `${this.hours}h ${duration}`;
    if (this.days > 0) duration = `${this.days}d ${duration}`;

    return duration.trim();
  }

  get medium() {
    let duration = this.milliseconds > 0 ? `${this.milliseconds}ms` : '';
    if (this.seconds > 0) duration = `${this.seconds} ${this._pluralize(this.seconds, 'sec')} ${duration}`;
    if (this.minutes > 0) duration = `${this.minutes} ${this._pluralize(this.minutes, 'min')} ${duration}`;
    if (this.hours > 0) duration = `${this.hours} ${this._pluralize(this.hours, 'hr')} ${duration}`;
    if (this.days > 0) duration = `${this.days} ${this._pluralize(this.days, 'day')} ${duration}`;

    return duration.trim();
  }

  get long() {
    let duration =
      this.milliseconds > 0 ? `${this.milliseconds} ${this._pluralize(this.milliseconds, 'millisecond')}` : '';
    if (this.seconds > 0) duration = `${this.seconds} ${this._pluralize(this.seconds, 'second')} ${duration}`;
    if (this.minutes > 0) duration = `${this.minutes} ${this._pluralize(this.minutes, 'minute')} ${duration}`;
    if (this.hours > 0) duration = `${this.hours} ${this._pluralize(this.hours, 'hour')} ${duration}`;
    if (this.days > 0) duration = `${this.days} ${this._pluralize(this.days, 'day')} ${duration}`;

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
          return Math.floor(this.inDays);
        case '%h':
          return Math.floor(this.inHours);
        case '%m':
          return Math.floor(this.inMinutes % Duration.minutesPerHour);
        case '%s':
          return Math.floor(this.inSeconds % Duration.secondsPerMinute);
        case '%l':
          return Math.floor(this.inMilliseconds % Duration.millisecondsPerSecond);
      }
    });
  }

  add(duration) {
    if (duration instanceof Duration) {
      return new Duration({ milliseconds: this.inMilliseconds + duration.inMilliseconds });
    }

    return new Duration({ milliseconds: this.inMilliseconds + new Duration(duration).inMilliseconds });
  }

  subtract(duration) {
    if (duration instanceof Duration) {
      return new Duration({ milliseconds: this.inMilliseconds - duration.inMilliseconds });
    }

    return new Duration({ milliseconds: this.inMilliseconds - new Duration(duration).inMilliseconds });
  }

  multiply(multiplier) {
    return new Duration({ milliseconds: this.inMilliseconds * multiplier });
  }

  divide(divisor) {
    if (divisor === 0) throw new Error('Division by zero is not allowed');
    return new Duration({ milliseconds: this.inMilliseconds / divisor });
  }

  compareTo(duration) {
    const diff = this.inMilliseconds - duration.inMilliseconds;
    return diff === 0 ? 0 : diff > 0 ? 1 : -1;
  }

  toString() {
    return `Duration in milliseconds: ${this.inMilliseconds}`;
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

  _pluralize(value, unit) {
    return value > 1 ? `${unit}s` : unit;
  }
}

module.exports = Duration;
module.exports.default = Duration;
