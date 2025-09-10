const { spawnSync } = require('child_process');
const path = require('path');
const assert = require('assert');
const Duration = require('./index');
const cli = require('./cli');

function test(description, callback) {
  try {
    callback();
    console.log(`${description} - passed ✅`);
  } catch (error) {
    console.error(`${description} - failed ❌`, error);
  }
}

test('default export', () => {
  const module = require('./index');
  const duration = new module.default({ milliseconds: 7200000 });
  assert.equal(duration.inHours, 2);
  assert.equal(duration.inMinutes, 120);
  assert.equal(duration.inSeconds, 7200);
  assert.equal(duration.inMilliseconds, 7200000);
});

test('Duration', () => {
  const duration = new Duration({ hours: 2.5 });
  assert.equal(duration.inHours, 2.5);
  assert.equal(duration.inMinutes, 150);
  assert.equal(duration.inSeconds, 9000);
  assert.equal(duration.inMilliseconds, 9000000);

  assert.equal(duration.days, 0);
  assert.equal(duration.hours, 2);
  assert.equal(duration.minutes, 30);
  assert.equal(duration.seconds, 0);
  assert.equal(duration.milliseconds, 0);
});

test('Duration.from', () => {
  const duration = Duration.from(86400000);
  assert.equal(duration.inDays, 1);
  assert.equal(duration.inHours, 24);
  assert.equal(duration.inMinutes, 1440);
  assert.equal(duration.inSeconds, 86400);
  assert.equal(duration.inMilliseconds, 86400000);

  assert.equal(duration.days, 1);
  assert.equal(duration.hours, 0);
  assert.equal(duration.minutes, 0);
  assert.equal(duration.seconds, 0);
  assert.equal(duration.milliseconds, 0);

  assert.equal(Duration.from(1, 'ms').inMilliseconds, 1);
  assert.equal(Duration.from(1, 's').inSeconds, 1);
  assert.equal(Duration.from(1, 'm').inMinutes, 1);
  assert.equal(Duration.from(1, 'h').inHours, 1);
  assert.equal(Duration.from(1, 'd').inDays, 1);

  assert.equal(Duration.from(1).inMilliseconds, 1); // default to milliseconds
  assert.equal(Duration.from(1, 'wrong-unit').inMilliseconds, 1); // fallback to milliseconds
});

test('Duration.fromDate', () => {
  const duration = Duration.fromDate('2025-04-25T12:30:00Z', '2025-04-26T12:30:00Z');
  assert.equal(duration.inDays, 1);
  assert.equal(duration.inHours, 24);
  assert.equal(duration.inMinutes, 1440);
  assert.equal(duration.inSeconds, 86400);
  assert.equal(duration.inMilliseconds, 86400000);
});

test('Duration.short', () => {
  const duration = new Duration({ hours: 1.5, minutes: 30 });
  assert.equal(duration.short, '2h');
});

test('Duration.medium', () => {
  const duration = new Duration({ hours: 1, minutes: 30, seconds: 15.25 });
  assert.equal(duration.medium, '1 hr 30 mins 15 secs 250 ms');
});

test('Duration.long', () => {
  const duration = new Duration({ days: 3, hours: 2, minutes: 30, seconds: 45.5 });
  assert.equal(duration.long, '3 days 2 hours 30 minutes 45 seconds 500 milliseconds');
});

test('Duration.format', () => {
  const duration = new Duration({ hours: 2.5 });
  assert.equal(duration.format('%hhrs %mmins ago'), '2hrs 30mins ago');
});

test('Duration.add', () => {
  const duration = new Duration({ hours: 2 });
  let total = duration.add(new Duration({ hours: 3 }));
  assert.equal(total.inHours, 5);

  total = duration.add({ hours: 1 });
  assert.equal(total.inHours, 3);

  total = duration.add({ hours: 1, minutes: 30 });
  assert.equal(total.inHours, 3.5);
});

test('Duration.subtract', () => {
  const duration = new Duration({ hours: 2 });
  const total = duration.subtract(new Duration({ hours: 3 }));
  assert.equal(total.inHours, -1);
  assert.equal(total.isNegative, true);
  assert.equal(total.isZero, false);
  assert.equal(total.isPositive, false);
});

test('Duration.multiply', () => {
  const duration = new Duration({ hours: 2 });
  const total = duration.multiply(2);
  assert.equal(total.inHours, 4);
});

test('Duration.divide', () => {
  const duration = new Duration({ hours: 2 });
  const total = duration.divide(2);
  assert.equal(total.inHours, 1);
  assert.throws(() => duration.divide(0), Error);
});

test('Duration.negate', () => {
  const duration = new Duration({ hours: 2 });
  const negated = duration.negate();
  assert.equal(negated.inHours, -2);
  assert.equal(negated.isNegative, true);
  assert.equal(negated.isZero, false);
  assert.equal(negated.isPositive, false);
});

test('Duration.compareTo', () => {
  const duration1 = new Duration({ hours: 2 });
  const duration2 = new Duration({ hours: 3 });
  assert.equal(duration1.compareTo(duration2), -1);
  assert.equal(duration2.compareTo(duration1), 1);
  assert.equal(duration1.compareTo(duration1), 0);
});

test('Duration.toString', () => {
  const duration = new Duration({ hours: 2 });
  assert.equal(duration.toString(), 'Duration in milliseconds: 7200000');
});

test('Duration.toJson', () => {
  const duration = new Duration({ days: 1 });
  const json = duration.toJson();
  assert.equal(json.days, 1);
  assert.equal(json.hours, 24);
  assert.equal(json.minutes, 1440);
  assert.equal(json.seconds, 86400);
  assert.equal(json.milliseconds, 86400000);
});

test('Duration.parse - short format', () => {
  const duration = Duration.parse('1d 2h 3m 4s 5ms');
  assert.equal(duration.days, 1);
  assert.equal(duration.hours, 2);
  assert.equal(duration.minutes, 3);
  assert.equal(duration.seconds, 4);
  assert.equal(duration.milliseconds, 5);
  assert.equal(duration.inMilliseconds, 93784005);
});

test('Duration.parse - medium format', () => {
  const duration = Duration.parse('1 day 2 hrs 3 mins 4 secs 5 ms');
  assert.equal(duration.days, 1);
  assert.equal(duration.hours, 2);
  assert.equal(duration.minutes, 3);
  assert.equal(duration.seconds, 4);
  assert.equal(duration.milliseconds, 5);
  assert.equal(duration.inMilliseconds, 93784005);
});

test('Duration.parse - long format', () => {
  const duration = Duration.parse('1 day 2 hours 3 minutes 4 seconds 5 milliseconds');
  assert.equal(duration.days, 1);
  assert.equal(duration.hours, 2);
  assert.equal(duration.minutes, 3);
  assert.equal(duration.seconds, 4);
  assert.equal(duration.milliseconds, 5);
  assert.equal(duration.inMilliseconds, 93784005);
});

test('Duration.parse - mixed formats', () => {
  const duration = Duration.parse('1 day 2h 30 minutes');
  assert.equal(duration.days, 1);
  assert.equal(duration.hours, 2);
  assert.equal(duration.minutes, 30);
  assert.equal(duration.seconds, 0);
  assert.equal(duration.milliseconds, 0);
  assert.equal(duration.inMilliseconds, 95400000);
});

test('Duration.parse - single units', () => {
  assert.equal(Duration.parse('30s').inSeconds, 30);
  assert.equal(Duration.parse('100ms').inMilliseconds, 100);
  assert.equal(Duration.parse('1 hour').inHours, 1);
  assert.equal(Duration.parse('1 day').inDays, 1);
  assert.equal(Duration.parse('45 minutes').inMinutes, 45);
});

test('Duration.parse - decimal values', () => {
  const duration1 = Duration.parse('1.5 hours');
  assert.equal(duration1.inHours, 1.5);
  assert.equal(duration1.hours, 1);
  assert.equal(duration1.minutes, 30);

  const duration2 = Duration.parse('2.5 days');
  assert.equal(duration2.inDays, 2.5);
  assert.equal(duration2.days, 2);
  assert.equal(duration2.hours, 12);

  const duration3 = Duration.parse('30.25 seconds');
  assert.equal(duration3.inSeconds, 30.25);
  assert.equal(duration3.seconds, 30);
  assert.equal(duration3.milliseconds, 250);
});

test('Duration.parse - case insensitive', () => {
  const duration1 = Duration.parse('1D 2H 3M 4S 5MS');
  const duration2 = Duration.parse('1d 2h 3m 4s 5ms');
  assert.equal(duration1.inMilliseconds, duration2.inMilliseconds);

  const duration3 = Duration.parse('1 DAY 2 HOURS');
  const duration4 = Duration.parse('1 day 2 hours');
  assert.equal(duration3.inMilliseconds, duration4.inMilliseconds);
});

test('Duration.parse - flexible spacing', () => {
  const duration1 = Duration.parse('  1d   2h  3m  4s  5ms  ');
  const duration2 = Duration.parse('1d 2h 3m 4s 5ms');
  assert.equal(duration1.inMilliseconds, duration2.inMilliseconds);

  const duration3 = Duration.parse('1day2hours3minutes');
  assert.equal(duration3.days, 1);
  assert.equal(duration3.hours, 2);
  assert.equal(duration3.minutes, 3);
});

test('Duration.parse - multiple occurrences', () => {
  const duration = Duration.parse('1h 30m 2h 15m'); // should sum to: 3h 45m
  assert.equal(duration.hours, 3);
  assert.equal(duration.minutes, 45);
  assert.equal(duration.inMinutes, 225);
});

test('Duration.parse - plain number', () => {
  const duration = Duration.parse('1000');
  assert.equal(duration.inMilliseconds, 1000);
  assert.equal(duration.seconds, 1);
});

test('Duration.parse - empty and zero values', () => {
  const duration1 = Duration.parse('');
  assert.equal(duration1.inMilliseconds, 0);
  assert.equal(duration1.isZero, true);

  const duration2 = Duration.parse('0 seconds');
  assert.equal(duration2.inMilliseconds, 0);
  assert.equal(duration2.isZero, true);
});

test('Duration.parse - unit aliases', () => {
  assert.equal(Duration.parse('1 ms').inMilliseconds, 1);
  assert.equal(Duration.parse('1 milli').inMilliseconds, 1);
  assert.equal(Duration.parse('1 millis').inMilliseconds, 1);
  assert.equal(Duration.parse('1 millisecond').inMilliseconds, 1);
  assert.equal(Duration.parse('1 milliseconds').inMilliseconds, 1);

  assert.equal(Duration.parse('1 s').inSeconds, 1);
  assert.equal(Duration.parse('1 sec').inSeconds, 1);
  assert.equal(Duration.parse('1 secs').inSeconds, 1);
  assert.equal(Duration.parse('1 second').inSeconds, 1);
  assert.equal(Duration.parse('1 seconds').inSeconds, 1);

  assert.equal(Duration.parse('1 m').inMinutes, 1);
  assert.equal(Duration.parse('1 min').inMinutes, 1);
  assert.equal(Duration.parse('1 mins').inMinutes, 1);
  assert.equal(Duration.parse('1 minute').inMinutes, 1);
  assert.equal(Duration.parse('1 minutes').inMinutes, 1);

  assert.equal(Duration.parse('1 h').inHours, 1);
  assert.equal(Duration.parse('1 hr').inHours, 1);
  assert.equal(Duration.parse('1 hrs').inHours, 1);
  assert.equal(Duration.parse('1 hour').inHours, 1);
  assert.equal(Duration.parse('1 hours').inHours, 1);

  assert.equal(Duration.parse('1 d').inDays, 1);
  assert.equal(Duration.parse('1 day').inDays, 1);
  assert.equal(Duration.parse('1 days').inDays, 1);
});

test('Duration.parse - round-trip compatibility', () => {
  const original = new Duration({ days: 1, hours: 2, minutes: 3, seconds: 4, milliseconds: 5 });

  // test round-trip with all formats
  const shortParsed = Duration.parse(original.short);
  assert.equal(shortParsed.inMilliseconds, original.inMilliseconds);

  const mediumParsed = Duration.parse(original.medium);
  assert.equal(mediumParsed.inMilliseconds, original.inMilliseconds);

  const longParsed = Duration.parse(original.long);
  assert.equal(longParsed.inMilliseconds, original.inMilliseconds);
});

test('Duration.parse - error handling', () => {
  // invalid input types
  assert.throws(() => Duration.parse(null), Error, 'Input must be a string');
  assert.throws(() => Duration.parse(123), Error, 'Input must be a string');
  assert.throws(() => Duration.parse({}), Error, 'Input must be a string');
  assert.throws(() => Duration.parse([]), Error, 'Input must be a string');

  // invalid text content
  assert.throws(() => Duration.parse('invalid text'), Error, 'Unable to parse duration from: "invalid text"');
  assert.throws(() => Duration.parse('2 invalid units'), Error, 'Unable to parse duration from: "2 invalid units"');
  assert.throws(() => Duration.parse('hello world'), Error, 'Unable to parse duration from: "hello world"');
});

test('CLI.run - help flag outputs usage text', () => {
  const output = cli.run(['-h']);
  assert.match(output, /Usage: duration/);
});

test('CLI.run - version flag outputs package.json version', () => {
  const output = cli.run(['-v']);
  assert.equal(output, require('./package.json').version);
});

test('CLI.run - default short format with multiple values', () => {
  const output = cli.run(['3600', '54000']);
  assert.equal(output, '3s 600ms\n54s');
});

test('CLI.run - medium format', () => {
  const output = cli.run(['-m', '3600']);
  assert.equal(output, '3 secs 600 ms');
});

test('CLI.run - long format with unit seconds', () => {
  const output = cli.run(['-l', '--unit=s', '3600']);
  assert.equal(output, '1 hour');
});

test('CLI.run - negative durations show "ago"', () => {
  const output = cli.run(['-s', '-500']);
  assert.equal(output, '500ms ago');
});

test('CLI.run - json output', () => {
  const output = cli.run(['--json', '1000']);
  const json = JSON.parse(output);
  assert.equal(json.seconds, 1);
  assert.equal(json.milliseconds, 1000);
});

test('CLI.run - table output includes headers and values', () => {
  const output = cli.run(['--table', '1000', '2000']);
  assert.match(output, /milliseconds/);
  assert.match(output, /seconds/);
  assert.match(output, /\|\s*1000\s*\|\s*1\s*\|/);
  assert.match(output, /\|\s*2000\s*\|\s*2\s*\|/);
});

test('CLI.run - errors when no values provided', () => {
  try {
    cli.run([]);
    assert.fail('Expected an error for missing values');
  } catch (err) {
    assert.match(String(err), /provide a duration value/);
  }
});

test('CLI.run - errors when non-number argument provided', () => {
  try {
    cli.run(['abc']);
    assert.fail('Expected an error for non-number argument');
  } catch (err) {
    assert.match(String(err), /provide a number/);
  }
});

test('CLI.run - respects DURATION_UNIT environment variable', () => {
  const prev = process.env.DURATION_UNIT;
  process.env.DURATION_UNIT = 's';
  try {
    const output = cli.run(['60']);
    assert.equal(output, '1m');
  } finally {
    if (prev === undefined) delete process.env.DURATION_UNIT;
    else process.env.DURATION_UNIT = prev;
  }
});

test('CLI.process - help exits 0 and prints usage', () => {
  const cliPath = path.join(__dirname, 'cli.js');
  const { status, stdout, stderr } = spawnSync(process.execPath, [cliPath, '-h'], { encoding: 'utf8' });
  assert.equal(status, 0);
  assert.match(stdout, /Usage: duration/);
  assert.equal(stderr, '');
});

test('CLI.process - missing args exits 1 and prints error', () => {
  const cliPath = path.join(__dirname, 'cli.js');
  const { status, stdout, stderr } = spawnSync(process.execPath, [cliPath], { encoding: 'utf8' });
  assert.equal(status, 1);
  assert.equal(stdout, '');
  assert.match(stderr, /Error: provide a duration value/);
});
