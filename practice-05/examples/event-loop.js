const log = (label) => console.log(label);

log("A: синхронный код");

setTimeout(() => {
  log("F: задача таймера");
}, 0);

Promise.resolve().then(() => {
  log("D: обработчик Promise");
});

async function demonstrateAwait() {
  log("B: начало async-функции");
  await null;
  log("E: продолжение после await");
}

demonstrateAwait();
log("C: конец синхронного кода");

// Мой обработчик (задание 2): прогноз — после E, но до F
Promise.resolve().then(() => {
  log("G: мой обработчик Promise");
});

// До запуска записать прогноз порядка A–F в отчёт, затем объяснить результат.
