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
  assert(duration.inHours === 2);
  assert(duration.inMinutes === 120);
  assert(duration.inSeconds === 7200);
  assert(duration.inMilliseconds === 7200000);
});

test('Duration', () => {
  const duration = new Duration({ hours: 2.5 });
  assert(duration.inHours === 2.5);
  assert(duration.inMinutes === 150);
  assert(duration.inSeconds === 9000);
  assert(duration.inMilliseconds === 9000000);
});

test('Duration.from()', () => {
  const duration = Duration.from(86400000);
  assert(duration.inDays === 1);
  assert(duration.inHours === 24);
  assert(duration.inMinutes === 1440);
  assert(duration.inSeconds === 86400);
  assert(duration.inMilliseconds === 86400000);
});

test('Duration.short', () => {
  const duration = new Duration({ hours: 1.5, minutes: 30 });
  assert(duration.short === '2h');
});

test('Duration.medium', () => {
  const duration = new Duration({ hours: 1, minutes: 30, seconds: 15.25 });
  assert(duration.medium === '1 hr 30 mins 15 secs 250ms');
});

test('Duration.long', () => {
  const duration = new Duration({ days: 3, hours: 2, minutes: 30, seconds: 45.5 });
  assert(duration.long === '3 days 2 hours 30 minutes 45 seconds 500 milliseconds');
});

test('Duration.format', () => {
  const duration = new Duration({ hours: 2.5 });
  assert(duration.format('%hhrs %mmins ago') === '2hrs 30mins ago');
});

test('Duration.add', () => {
  const duration = new Duration({ hours: 2 });
  let total = duration.add(new Duration({ hours: 3 }));
  assert(total.inHours === 5);

  total = duration.add({ hours: 1 });
  assert(total.inHours === 3);

  total = duration.add({ hours: 1, minutes: 30 });
  assert(total.inHours === 3.5);
});

test('Duration.subtract', () => {
  const duration = new Duration({ hours: 2 });
  const total = duration.subtract(new Duration({ hours: 3 }));
  assert(total.inHours === -1);
  assert(total.isNegative === true);
  assert(total.isZero === false);
  assert(total.isPositive === false);
});

test('Duration.multiply', () => {
  const duration = new Duration({ hours: 2 });
  const total = duration.multiply(2);
  assert(total.inHours === 4);
});

test('Duration.divide', () => {
  const duration = new Duration({ hours: 2 });
  const total = duration.divide(2);
  assert(total.inHours === 1);
  assert.throws(() => duration.divide(0), Error);
});

test('Duration.compareTo', () => {
  const duration1 = new Duration({ hours: 2 });
  const duration2 = new Duration({ hours: 3 });
  const result = duration1.compareTo(duration2);
  assert(result === -1);
});

test('Duration.toString', () => {
  const duration = new Duration({ hours: 2 });
  assert(duration.toString() === 'Duration in milliseconds: 7200000');
});

test('Duration.toJson', () => {
  const duration = new Duration({ days: 1 });
  const json = duration.toJson();
  assert(json.days === 1);
  assert(json.hours === 24);
  assert(json.minutes === 1440);
  assert(json.seconds === 86400);
  assert(json.milliseconds === 86400000);
});
