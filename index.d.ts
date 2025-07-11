/**
 * `Duration` is a span of time, such as 27 days, 4 hours, 12 minutes, and 3 seconds.
 *
 * Despite the same name, a `Duration` object does not implement "Durations" as specified
 * by ISO-8601. In particular, a duration object does not keep track of the individually
 * provided members (such as "days" or "hours"), but only uses these arguments to compute
 * the length of the corresponding time interval.
 *
 * Properties can access that single number in different ways. For example the `inMinutes`
 * property gives the number of whole minutes in the total duration, which includes the
 * minutes that were provided as "hours" to the constructor, and can be larger than 59.
 *
 * NOTE: Partly inspired by Dart's `Duration` class (https://api.dart.dev/dart-core/Duration-class.html).
 */
declare class Duration {
  /** The number of milliseconds in a second. */
  static readonly millisecondsPerSecond: number;

  /** The number of seconds in a minute. */
  static readonly secondsPerMinute: number;

  /** The number of minutes in an hour. */
  static readonly minutesPerHour: number;

  /** The number of hours in a day. */
  static readonly hoursPerDay: number;

  /** The number of milliseconds in a minute. */
  static readonly millisecondsPerMinute: number;

  /** The number of milliseconds in an hour. */
  static readonly millisecondsPerHour: number;

  /** The number of milliseconds in a day. */
  static readonly millisecondsPerDay: number;

  /** An empty duration, representing zero time. */
  static readonly zero: Duration;

  /**
   * Creates a new `Duration` instance.
   * @param {DurationOptions} values - to initialize the duration with if any.
   *
   * The `Duration` represents a single number of milliseconds, which is
   * the sum of all the individual arguments to the constructor.
   */
  constructor(values?: DurationOptions);

  /**
   * Creates a `Duration` from a specified unit.
   * @param {number} value - value to convert to a duration.
   * @param {string} [unit] - default to 'ms', the unit of the value (e.g., 's' or 'sec' for seconds).
   * @returns A new Duration instance
   */
  static from(value: number, unit?: string): Duration;

  /**
   * Creates a `Duration` from a date.
   * @param {Date | string | number} date - `Date` object or date ISO-string or timestamp.
   * @param {Date | string | number} [now] - The current date if not provided.
   * @returns A new Duration instance
   *
   * @example
   * ```js
   * Duration.fromDate('2025-04-25T12:30:00Z');
   * Duration.fromDate(new Date(2025, 3, 25, 12, 30, 0));
   * Duration.fromDate(1745584200000);
   * ```
   */
  static fromDate(date: Date | string | number, now?: Date | string | number): Duration;

  /** Gets the whole milliseconds spanned by this Duration. */
  get inMilliseconds(): number;

  /** Gets the entire seconds spanned by this Duration. */
  get inSeconds(): number;

  /** Gets the entire minutes spanned by this Duration. */
  get inMinutes(): number;

  /** Gets the entire hours spanned by this Duration. */
  get inHours(): number;

  /** Gets the entire days spanned by this Duration. */
  get inDays(): number;

  /** Gets the number of milliseconds of the duration. */
  get milliseconds(): number;

  /** Gets the number of seconds of the duration. */
  get seconds(): number;

  /** Gets the number of minutes of the duration. */
  get minutes(): number;

  /** Gets the number of hours of the duration. */
  get hours(): number;

  /** Gets the number of days of the duration. */
  get days(): number;

  /** Gets whether the duration is negative. */
  get isNegative(): boolean;

  /** Gets whether the duration is zero. */
  get isZero(): boolean;

  /** Gets whether the duration is positive. */
  get isPositive(): boolean;

  /**
   * Gets the short format of the duration.
   * @example
   * ```js
   * console.log(Duration.from(1000).short); // "1s"
   * ```
   */
  get short(): string;

  /**
   * Gets the medium format of the duration.
   * @example
   * ```js
   * console.log(Duration.from(1000).medium); // "1 sec"
   * ```
   */
  get medium(): string;

  /**
   * Gets the long format of the duration.
   * @example
   * ```js
   * console.log(Duration.from(1000).long); // "1 second"
   * ```
   */
  get long(): string;

  /**
   * Formats the duration as a string.
   * @param pattern - The pattern to format the duration with.
   *
   * The pattern can be one of the following:
   * - `short` for the short format;
   * - `medium` for the medium format;
   * - `long` for the long format;
   * - `pattern` for a custom pattern:
   *    - `%d`: The number of days;
   *    - `%h`: The number of hours;
   *    - `%m`: The number of minutes;
   *    - `%s`: The number of seconds;
   *    - `%l`: The number of milliseconds.
   *
   * @example
   * ```js
   * const duration = Duration.from(5400000);
   * console.log(duration.format('%h hr %m min ago')); // "1 hr 30 min ago"
   * ```
   */
  format(pattern?: 'short' | 'medium' | 'long' | string): string;

  /** Adds a duration to the current duration. */
  add(duration: Duration | DurationOptions): Duration;

  /** Subtracts a duration from the current duration. */
  subtract(duration: Duration | DurationOptions): Duration;

  /** Multiplies the current duration by a multiplier. */
  multiply(multiplier: number): Duration;

  /** Divides the current duration by a divisor. */
  divide(divisor: number): Duration;

  /** Negates the current duration. */
  negate(): Duration;

  /** Compares the current duration to another duration. */
  compareTo(duration: Duration): number;

  /** Returns a JSON representation of the duration. */
  toJson(): DurationValues;

  /** Returns a string representation of the duration. */
  toString(): string;
}

interface DurationValues {
  /** The number of days. */
  days: number;

  /** The number of hours. */
  hours: number;

  /** The number of minutes. */
  minutes: number;

  /** The number of seconds. */
  seconds: number;

  /** The number of milliseconds. */
  milliseconds: number;
}

/** Optional values to initialize a `Duration`. */
export type DurationOptions = Partial<DurationValues>;

export default Duration;
