// Собственные проверки ПР5. Сервер запускается на свободном порту, как в integration.checks.js.
// Запуск из папки practice-05: node checks/own.checks.js
import { createApiServer } from "../api/server.mjs";
import { ApiError, createApiClient } from "../src/api-client.js";
import { createTaskApi } from "../src/task-api.js";
import { variantFilters } from "../src/variant.js";

let passed = 0;
let failed = 0;

async function check(name, action) {
  try {
    await action();
    passed += 1;
    console.log(`OK: ${name}`);
  } catch (error) {
    failed += 1;
    console.log(`FAIL: ${name}\n  ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function catchError(promise) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error("ожидалась ошибка");
}

const server = createApiServer();
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}/api`;
const client = createApiClient({ baseUrl, timeoutMs: 1000 });
const api = createTaskApi(client);

try {
  // С1. Своя комбинация фильтров: невыполненные задачи категории 1 со словом «разобрать»
  await check("С1. completed=false + categoryId=1 + q=\"разобрать\" → только id 13", async () => {
    const { tasks, meta } = await api.getTasks({ completed: false, categoryId: 1, q: "разобрать" });
    assert(tasks.map((t) => t.id).join() === "13", `получено ${tasks.map((t) => t.id)}`);
    assert(meta.total === 1, "meta.total должен быть 1");
  });

  // С2. Фильтр варианта 7 проверяется отдельно: только id 7 и 16
  await check("С2. Вариант 7: q=\"провер\" → [7, 16]", async () => {
    const { tasks } = await api.getTasks(variantFilters);
    assert(tasks.map((t) => t.id).join() === "7,16", `получено ${tasks.map((t) => t.id)}`);
  });

  // С3. Дополнительная HTTP-ошибка: сервер отклоняет неверный query (400)
  await check("С3. ?completed=yes напрямую через клиент → http 400 INVALID_QUERY", async () => {
    const error = await catchError(client.requestJson("/tasks", { query: { completed: "yes" } }));
    assert(error instanceof ApiError && error.kind === "http", `kind = ${error.kind}`);
    assert(error.status === 400 && error.code === "INVALID_QUERY", `status ${error.status}, code ${error.code}`);
  });

  // С4. Отладочный 503 тоже http, а не network
  await check("С4. /debug/error → http 503 SERVICE_UNAVAILABLE", async () => {
    const error = await catchError(client.requestJson("/debug/error"));
    assert(error.kind === "http" && error.status === 503, `kind ${error.kind}, status ${error.status}`);
  });

  // С5. Граница тайм-аута: задержка меньше лимита проходит, больше — timeout
  await check("С5. delay 50 мс при лимите 300 мс проходит, delay 400 мс → timeout", async () => {
    const ok = await client.requestJson("/debug/delay", { query: { ms: 50 }, timeoutMs: 300 });
    assert(ok.data.delayedMs === 50, "ответ без задержки не получен");
    const error = await catchError(client.requestJson("/debug/delay", { query: { ms: 400 }, timeoutMs: 300 }));
    assert(error.kind === "timeout", `kind = ${error.kind}`);
  });

  // С6. Отмена до отправки: уже отменённый сигнал даёт aborted
  await check("С6. Заранее отменённый AbortSignal → aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const error = await catchError(client.requestJson("/tasks", { signal: controller.signal }));
    assert(error.kind === "aborted", `kind = ${error.kind}`);
  });

  // С7. Успешный текст вместо JSON → invalid-response
  await check("С7. /debug/text (200, text/plain) → invalid-response", async () => {
    const error = await catchError(client.requestJson("/debug/text"));
    assert(error.kind === "invalid-response", `kind = ${error.kind}`);
  });
} finally {
  await new Promise((resolve) => server.close(resolve));
}

console.log(`\nПроверок пройдено: ${passed}; не пройдено: ${failed}.`);
if (failed > 0) process.exitCode = 1;
