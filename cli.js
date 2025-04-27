#!/usr/bin/env node

const argParser = require('yargs-parser');
const Duration = require('./index');

const usage = `Usage: duration [options] <milliseconds...>

Options:
-s,             Display duration in short format.
-m,             Display duration in medium format.
-l,             Display duration in long format.
-u, --unit      Reads duration values in the specified unit.
-v, --version   Show version number.
-h, --help      Show this help message.

Examples:
1. display durations in short format:
$ duration 3600 54000

2. display duration in medium format:
$ duration -m 3600

3. display duration read in seconds in short format:
$ duration -s --unit=s 3600

Visit https://www.npmjs.com/package/@udlearn/duration for more info.`;

const command = argParser(process.argv.slice(2), {
  alias: { u: 'unit', h: 'help', v: 'version' },
  boolean: ['s', 'm', 'l'],
});

if (command.help) {
  console.log(usage);
} else if (command.version) {
  const pkg = require('./package.json');
  console.log(pkg.version);
} else {
  const { _: values, ...options } = command;
  if (values.length === 0) {
    console.error('Error: Please provide a duration value as an argument \n');
    console.log(usage);
    process.exit(1);
  }

  const formats = [];
  if (options.s) formats.push('short');
  if (options.m) formats.push('medium');
  if (options.l) formats.push('long');
  if (formats.length === 0) formats.push('short');

  for (const value of values) {
    const duration = Duration.from(value, options.unit);
    formats.forEach((format) => console.log(duration.format(format)));
  }
}

process.exit(0);
