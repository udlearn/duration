# Duration

Interpret and format time durations in days, hours, minutes, seconds and milliseconds.

This utility gives you the ability to quickly interpret a span of time (duration) in a
human-readable format. For instance, `7200` seconds are equivalent to `2` hours, which
is way more friendly, right? So, this utility can and will help you achieve this fast.

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
```

When creating a new Duration instance, you can specify time values in different units.
All fields are optional:

- `days`: Number of days
- `hours`: Number of hours
- `minutes`: Number of minutes
- `seconds`: Number of seconds
- `milliseconds`: Number of milliseconds

You can also use the `format()` method to customize how the duration is displayed.
The method accepts a pattern string with the following placeholders:

- `%d`: Number of days
- `%h`: Number of hours
- `%m`: Number of minutes
- `%s`: Number of seconds
- `%l`: Number of milliseconds

Or use one of the predefined formats:

- `'short'`: Compact format (e.g. "1h 30m")
- `'medium'`: Medium format (e.g. "1 hr 30 mins")
- `'long'`: Full format (e.g. "1 hour 30 minutes")

For example:

```js
> const duration = Duration.from(5400000)
> duration.format('%h hr %m min ago')
'1 hr 30 min ago'
```

> Note that this utility does **not** currently support **locales**. All
> output formats are in English only. If you need localized duration strings,
> you'll need to implement that separately in your application.

## Contributing

Please follow the [Contributing](CONTRIBUTING.md) guidelines if you wish to collaborate
or share some feedback on how to make this utility better.

## License

[MIT](LICENSE).
