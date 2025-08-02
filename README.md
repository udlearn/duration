# Duration

Interpret, parse, and format time durations in days, hours, minutes, seconds and milliseconds.

This utility gives you the ability to quickly interpret a span of time (duration) in a
human-readable format (and vice-versa). For instance, `7200` seconds are equivalent to `2` hours,
which is way more friendly, right? So, this utility can and will help you achieve this fast.

## Installation

```bash
npm i @udlearn/duration
```

## Usage

Using **CLI**:

```bash
$ duration 3600
> 3s 600ms
$ duration -m --unit=sec 3660
> 1 hr 1 min
```

> You may use `DURATION_UNIT` as environment variable to avoid setting the `--unit` (or `-u`)
> option every time.

Using **Node.js**:

```js
> const Duration = require('@udlearn/duration');
> const duration = new Duration({ hours: 1.5 });
> duration.short
'1h 30m'
> duration.medium
'1 hr 30 mins'
> duration.long
'1 hour 30 minutes'
> duration.minutes
30
> duration.inMinutes
90
> duration.format('%h hour(s) %m minute(s) ago')
'1 hour(s) 30 minute(s) ago'
> Duration.parse('1.5h').medium
'1 hr 30 mins'
```

## Features

### Creating Duration

When creating a new `Duration`, you can specify time values in different units.
All fields are optional:

- `days`: Number of days
- `hours`: Number of hours
- `minutes`: Number of minutes
- `seconds`: Number of seconds
- `milliseconds`: Number of milliseconds

```js
const duration = new Duration({ hours: 1.5, minutes: 10, seconds: 120 }); // 1h 42 mins
// or
const duration = Duration.from(6120, 'sec'); // 1h 42 mins
// or
const duration = Duration.fromDate(Date.now()); // 0ms
```

### Formatting Duration

You can use the `format()` method to customize how the duration is displayed.
The method accepts a pattern string with the following placeholders:

- `%d`: Number of days
- `%h`: Number of hours
- `%m`: Number of minutes
- `%s`: Number of seconds
- `%l`: Number of milliseconds

Or use one of the predefined formats:

- `'short'`: Compact format (e.g. '1h 30m')
- `'medium'`: Medium format (e.g. '1 hr 30 mins')
- `'long'`: Full format (e.g. '1 hour 30 minutes')

For example:

```js
> const duration = Duration.from(5_400_000)
> duration.format('%h hr %m min ago')
'1 hr 30 min ago'
```

### Parsing Duration

You can also create `Duration` objects by parsing English duration strings using the `parse()` method.
It supports various formats:

- Short format: `'1d 2h 3m 4s 5ms'`
- Medium format: `'1 day 2 hrs 3 mins 4 secs 5 ms'`
- Long format: `'1 day 2 hours 3 minutes 4 seconds 5 milliseconds'`
- Mixed formats: `'1 day 2h 30 minutes'`
- Single units: `'30 seconds'`, `'1 hour'`
- Decimal values: `'1.5 hours'`, `'2.5 days'`
- Plain numbers: `'1000'` (defaults to milliseconds)

This makes it perfect for round-trip conversion:

```js
> const original = new Duration({ hours: 2, minutes: 30 });
> const formatted = original.medium; // '2 hrs 30 mins'
> const parsed = Duration.parse(formatted);
> parsed.inMinutes === original.inMinutes; // true
```

> Note that this utility does **not** currently support **locales**. All
> output formats are in English only. If you need localized duration strings,
> you'll need to implement that separately in your application.

## Contributing

Please follow the [Contributing](CONTRIBUTING.md) guidelines if you wish to collaborate
or share some feedback on how to make this utility better.

## License

[MIT](LICENSE).
