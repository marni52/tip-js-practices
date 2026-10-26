import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function isTask(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.title === "string"
    && value.title.trim().length >= 1
    && value.title.trim().length <= 100
    && typeof value.completed === "boolean"
    && ALLOWED_PRIORITIES.has(value.priority)
    && isPositiveSafeInteger(value.categoryId),
  );
}

function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1
    && value.name.trim().length <= 100,
  );
}

// client — объект, созданный createApiClient.
// Контракт результата:
// getTasks(filters) -> Promise<{ tasks, meta }>
// getTaskById(id) -> Promise<task>
// getCategories() -> Promise<category[]>
// loadInitialData(filters) -> Promise<{ tasks, categories, meta }>
export function createTaskApi(client) {
  if (!client || typeof client.requestJson !== "function") {
    throw new TypeError("Нужен клиент с методом requestJson");
  }

  // Проверяем фильтры до запроса. false оставляем boolean, строкой его сделает URLSearchParams.
  function normalizeFilters(filters) {
    if (filters === null || typeof filters !== "object" || Array.isArray(filters)) {
      throw new TypeError("filters должен быть объектом");
    }
    const query = {};
    for (const [name, value] of Object.entries(filters)) {
      if (!ALLOWED_FILTERS.has(name)) {
        throw new TypeError(`Неизвестный фильтр: ${name}`);
      }
      if (value === undefined) continue;
      if (name === "completed" && typeof value !== "boolean") {
        throw new TypeError("completed должен быть true или false");
      }
      if (name === "priority" && !ALLOWED_PRIORITIES.has(value)) {
        throw new TypeError("priority должен быть low, medium или high");
      }
      if (name === "categoryId" && !isPositiveSafeInteger(value)) {
        throw new TypeError("categoryId должен быть положительным целым числом");
      }
      if (name === "q") {
        if (typeof value !== "string" || value.trim().length > 100) {
          throw new TypeError("q должен быть строкой до 100 символов");
        }
        if (value.trim() === "") continue;
        query.q = value.trim();
        continue;
      }
      query[name] = value;
    }
    return query;
  }

  function checkList(list, isItem, what) {
    if (!Array.isArray(list) || !list.every(isItem)) {
      throw invalidResponse(`Сервер вернул некорректный список: ${what}`);
    }
    if (new Set(list.map((item) => item.id)).size !== list.length) {
      throw invalidResponse(`В списке (${what}) повторяются id`);
    }
  }

  async function getTasks(filters = {}) {
    const query = normalizeFilters(filters);
    const payload = await client.requestJson("/tasks", { query });
    checkList(payload?.data, isTask, "задачи");
    if (payload.meta?.total !== payload.data.length) {
      throw invalidResponse("meta.total не совпадает с количеством задач");
    }
    return { tasks: payload.data, meta: payload.meta };
  }

  async function getTaskById(id) {
    if (!isPositiveSafeInteger(id)) {
      throw new TypeError("id должен быть положительным целым числом");
    }
    const payload = await client.requestJson(`/tasks/${id}`);
    if (!isTask(payload?.data)) {
      throw invalidResponse("Сервер вернул некорректную задачу");
    }
    return payload.data;
  }

  async function getCategories() {
    const payload = await client.requestJson("/categories");
    checkList(payload?.data, isCategory, "категории");
    return payload.data;
  }

  // Оба запроса стартуют сразу, потом ждём их вместе.
  async function loadInitialData(filters = {}) {
    const [tasksResult, categories] = await Promise.all([getTasks(filters), getCategories()]);
    return { tasks: tasksResult.tasks, categories, meta: tasksResult.meta };
  }

  return { getTasks, getTaskById, getCategories, loadInitialData };
}
