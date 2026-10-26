// Задание 7: сравнение последовательного ожидания и Promise.all.
// Два запроса к /debug/delay по 300 мс. Нужен запущенный API (npm start).
import { createApiClient } from "../src/api-client.js";

const baseUrl = process.env.API_URL ?? "http://127.0.0.1:5505/api";
const client = createApiClient({ baseUrl, timeoutMs: 3000 });
const delay = { query: { ms: 300 } };

async function sequential() {
  const start = performance.now();
  await client.requestJson("/debug/delay", delay);
  await client.requestJson("/debug/delay", delay); // второй стартует только после первого
  return performance.now() - start;
}

async function parallel() {
  const start = performance.now();
  // оба запроса созданы до await
  await Promise.all([
    client.requestJson("/debug/delay", delay),
    client.requestJson("/debug/delay", delay),
  ]);
  return performance.now() - start;
}

for (let i = 1; i <= 3; i += 1) {
  const seq = await sequential();
  const par = await parallel();
  console.log(`Замер ${i}: последовательно ${seq.toFixed(0)} мс, Promise.all ${par.toFixed(0)} мс`);
}
