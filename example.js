const Duration = require('./index');

const duration = new Duration({ hours: 1.5 });
console.log(duration.short);
console.log(duration.medium);
console.log(duration.long);
console.log(duration.minutes);
console.log(duration.inMinutes);
console.log(duration.format('%h hour(s) %m minute(s) ago'));
console.log(duration.setLocale('es').long);
