const assert = require('assert');
const Duration = require('./index');

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
  assert.equal(duration.medium, '1 hr 30 mins 15 secs 250ms');
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
