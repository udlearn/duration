#!/usr/bin/env node

const argParser = require('yargs-parser');
const Duration = require('./index');

const usage = 'Usage: duration [options] <milliseconds...>';
const help = `${usage}

Options:
-s              Display duration in short format (e.g., 1h 30m).
-m              Display duration in medium format (e.g., 1 hr 30 mins).
-l              Display duration in long format (e.g., 1 hour 30 minutes).
--json          Display duration in JSON format.
--table         Display duration in tabular format.
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

const formatAsTable = (durations) => {
  const line = (size, char = '-') => `+${char.repeat(size - 2)}+`;
  const table = [Object.keys(durations[0]), ...durations.map((d) => Object.values(d).map(String))];
  const cellSize = Math.max(...table.flat().map((v) => v.length));

  const [headers, ...rows] = table;
  const header = `| ${headers.map((v) => v.padEnd(cellSize)).join(' | ')} |`;
  const body = rows.map((row) => `| ${row.map((v) => v.padEnd(cellSize)).join(' | ')} |`).join('\n');

  const gridSize = header.length;
  return [line(gridSize), header, line(gridSize, '='), body, line(gridSize)].join('\n');
};

const run = (args) => {
  const command = argParser(args, {
    alias: { u: 'unit', h: 'help', v: 'version' },
    boolean: ['s', 'm', 'l', 'json', 'table'],
  });

  if (command.help) {
    return help;
  } else if (command.version) {
    return require('./package.json').version;
  } else {
    const { _: values, ...options } = command;

    if (!values.length) throw `Error: provide a duration value as an argument.\n\n${usage}`;
    if (values.some((v) => isNaN(v))) throw `Error: provide a number as an argument.\n\n${usage}`;

    const unit = options.unit || process.env.DURATION_UNIT;
    const durations = values.map((v) => Duration.from(v, unit));

    if (options.json) return durations.map((d) => JSON.stringify(d.toJson(), null, 2)).join('\n');
    else if (options.table) return formatAsTable(durations.map((d) => d.toJson()));
    else {
      const formats = []; // allow more than one format
      if (options.s) formats.push('short');
      if (options.m) formats.push('medium');
      if (options.l) formats.push('long');
      if (!formats.length) formats.push('short'); // default format

      const duration = formats
        .map((f) => durations.map((d) => (d.isNegative ? `${d.negate().format(f)} ago` : d.format(f))).join('\n'))
        .join('\n');
      return duration || '0';
    }
  }
};

const main = () => {
  try {
    console.log(run(process.argv.slice(2)));
  } catch (msg) {
    console.error(msg);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') main(); // skip in test environment
module.exports = { run };
