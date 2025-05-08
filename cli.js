#!/usr/bin/env node

const argParser = require('yargs-parser');
const Duration = require('./index');

const usage = `Usage: duration [options] <milliseconds...>

Options:
-s              Display duration in short format (e.g., 1h 30m).
-m              Display duration in medium format (e.g., 1 hr 30 min).
-l              Display duration in long format (e.g., 1 hour 30 minutes).
--json          Display duration in JSON format.
-u, --unit      Read duration values in the specified unit
                (default: milliseconds; e.g., ms, s, m, h, d).
-v, --version   Show version number.
-h, --help      Show this help message.

Examples:
1. display durations in short format:
$ duration 3600 54000
> 3s 600ms
> 54s

2. display duration in medium format:
$ duration -m 3600
> 3 secs 600ms

3. display duration read in seconds in long format:
$ duration -l --unit=s 3600
> 1 hour

Visit https://www.npmjs.com/package/@udlearn/duration for more info.`;

const command = argParser(process.argv.slice(2), {
  alias: { u: 'unit', h: 'help', v: 'version' },
  boolean: ['s', 'm', 'l', 'json'],
});

if (command.help) {
  console.log(usage);
} else if (command.version) {
  const pkg = require('./package.json');
  console.log(pkg.version);
} else {
  const { _: values, ...options } = command;
  if (values.length === 0) {
    console.error('Error: provide a duration value as an argument.\n');
    console.log('Usage: duration [options] <milliseconds...>');
    process.exit(1);
  }

  const formats = [];
  if (options.s) formats.push('short');
  if (options.m) formats.push('medium');
  if (options.l) formats.push('long');
  if (formats.length === 0 && !options.json) formats.push('short');

  for (const value of values) {
    const duration = Duration.from(value, options.unit);
    formats.forEach((format) => console.log(duration.format(format)));
    if (options.json) console.log(JSON.stringify(duration.toJson(), undefined, 2));
  }
}

process.exit(0);
