import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

export function isTask(value) {
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

export function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1
    && value.name.trim().length <= 100,
  );
}

// Методы результата:
// getTasks, getTaskById, getCategories, loadInitialData, createTask, updateTask,
// setTaskCompleted, deleteTask и resetDemoData.
// Последний аргумент каждого метода данных — { signal }.
export function createTaskApi(client) {
  if (!client || typeof client.requestJson !== "function") {
    throw new TypeError("Нужен клиент с методом requestJson");
  }

  // фильтры из ПР5
  function normalizeFilters(filters) {
    if (filters === null || typeof filters !== "object" || Array.isArray(filters)) {
      throw new TypeError("filters должен быть объектом");
    }
    const query = {};
    for (const [name, value] of Object.entries(filters)) {
      if (!ALLOWED_FILTERS.has(name)) throw new TypeError(`Неизвестный фильтр: ${name}`);
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
        if (value.trim() !== "") query.q = value.trim();
        continue;
      }
      query[name] = value;
    }
    return query;
  }

  function checkId(id) {
    if (!isPositiveSafeInteger(id)) throw new TypeError("id должен быть положительным целым числом");
  }

  function checkList(list, isItem, what) {
    if (!Array.isArray(list) || !list.every(isItem)) {
      throw invalidResponse(`Сервер вернул некорректный список: ${what}`);
    }
    if (new Set(list.map((item) => item.id)).size !== list.length) {
      throw invalidResponse(`В списке (${what}) повторяются id`);
    }
  }

  function taskFrom(payload) {
    if (!isTask(payload?.data)) throw invalidResponse("Сервер вернул некорректную задачу");
    return payload.data;
  }

  async function getTasks(filters = {}, { signal } = {}) {
    const query = normalizeFilters(filters);
    const payload = await client.requestJson("/tasks", { query, signal });
    checkList(payload?.data, isTask, "задачи");
    if (payload.meta?.total !== payload.data.length) {
      throw invalidResponse("meta.total не совпадает с количеством задач");
    }
    return { tasks: payload.data, meta: payload.meta };
  }

  async function getTaskById(id, { signal } = {}) {
    checkId(id);
    return taskFrom(await client.requestJson(`/tasks/${id}`, { signal }));
  }

  async function getCategories({ signal } = {}) {
    const payload = await client.requestJson("/categories", { signal });
    checkList(payload?.data, isCategory, "категории");
    return payload.data;
  }

  async function loadInitialData(filters = {}, options = {}) {
    const [taskResult, categories] = await Promise.all([
      getTasks(filters, options),
      getCategories(options),
    ]);
    return { tasks: taskResult.tasks, categories, meta: taskResult.meta };
  }

  // id и completed при создании назначает сервер, поэтому их не отправляем
  async function createTask(draft, { signal } = {}) {
    const body = { title: draft?.title, priority: draft?.priority, categoryId: draft?.categoryId };
    return taskFrom(await client.requestJson("/tasks", { method: "POST", body, signal }));
  }

  async function updateTask(id, changes, { signal } = {}) {
    checkId(id);
    return taskFrom(await client.requestJson(`/tasks/${id}`, { method: "PATCH", body: { ...changes }, signal }));
  }

  async function setTaskCompleted(id, completed, options = {}) {
    if (typeof completed !== "boolean") throw new TypeError("completed должен быть true или false");
    return updateTask(id, { completed }, options);
  }

  async function deleteTask(id, { signal } = {}) {
    checkId(id);
    const result = await client.requestJson(`/tasks/${id}`, { method: "DELETE", signal });
    if (result !== null) throw invalidResponse("После удаления ожидался пустой ответ 204");
    return null;
  }

  async function resetDemoData({ signal } = {}) {
    const payload = await client.requestJson("/debug/reset", { method: "POST", signal });
    const data = payload?.data;
    if (data?.reset !== true || !Number.isSafeInteger(data.total)) {
      throw invalidResponse("Сервер не подтвердил восстановление данных");
    }
    return data;
  }

  return {
    getTasks,
    getTaskById,
    getCategories,
    loadInitialData,
    createTask,
    updateTask,
    setTaskCompleted,
    deleteTask,
    resetDemoData,
  };
}
