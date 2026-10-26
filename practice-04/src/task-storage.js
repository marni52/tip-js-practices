export const STORAGE_VERSION = 1;

// Все функции принимают объект storage явно, чтобы их можно было проверить
// без обращения к глобальному window.localStorage.

const PRIORITIES = ["low", "medium", "high"];

function isValidTask(task) {
  return (
    task !== null &&
    typeof task === "object" &&
    Number.isSafeInteger(task.id) &&
    task.id > 0 &&
    typeof task.title === "string" &&
    task.title.trim() !== "" &&
    task.title === task.title.trim() &&
    task.title.length <= 100 &&
    typeof task.completed === "boolean" &&
    PRIORITIES.includes(task.priority)
  );
}

function copyTasks(tasks) {
  return tasks.map((task) => ({ ...task }));
}

export function isValidTaskList(value) {
  if (!Array.isArray(value)) return false;
  if (!value.every(isValidTask)) return false;
  // id не должны повторяться
  const ids = new Set(value.map((task) => task.id));
  return ids.size === value.length;
}

export function loadTasks(storage, key, fallbackTasks) {
  const fallback = copyTasks(fallbackTasks);
  try {
    const raw = storage.getItem(key);
    if (raw === null) {
      return { ok: true, source: "initial", tasks: fallback };
    }

    const data = JSON.parse(raw); // может выбросить SyntaxError
    if (data === null || typeof data !== "object" || data.version !== STORAGE_VERSION) {
      return { ok: false, source: "fallback", tasks: fallback, error: "Сохранённые данные другой версии, загружен исходный набор." };
    }
    if (!isValidTaskList(data.tasks)) {
      return { ok: false, source: "fallback", tasks: fallback, error: "Сохранённые задачи повреждены, загружен исходный набор." };
    }
    return { ok: true, source: "storage", tasks: copyTasks(data.tasks) };
  } catch (error) {
    return {
      ok: false,
      source: "fallback",
      tasks: fallback,
      error: `Не удалось прочитать сохранённые данные (${error.message}), загружен исходный набор.`,
    };
  }
}

export function saveTasks(storage, key, tasks) {
  if (!isValidTaskList(tasks)) {
    return { ok: false, error: "Список задач некорректен, сохранение отменено." };
  }
  try {
    storage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, tasks }));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Не удалось сохранить данные: ${error.message}` };
  }
}

export function removeSavedTasks(storage, key) {
  try {
    storage.removeItem(key);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Не удалось удалить сохранённые данные: ${error.message}` };
  }
}
