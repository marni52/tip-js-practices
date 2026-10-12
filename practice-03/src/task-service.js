// Прикладная логика работы с задачами.
// Функции не выводят данные и не изменяют переданные массивы и объекты.
// Ожидаемые ошибки возвращаются как { ok: false, error: "..." }.

const allowedPriorities = ["low", "medium", "high"];
const maxTitleLength = 100;

// Внутренние проверки: возвращают текст ошибки или null, если значение корректно.

function validateId(id) {
  if (typeof id !== "number") {
    return "Идентификатор должен быть числом";
  }
  if (!Number.isSafeInteger(id) || id <= 0) {
    return "Идентификатор должен быть положительным целым числом";
  }
  return null;
}

// Возвращает { ok: true, title } с очищенным названием либо объект ошибки.
function normalizeTitle(title) {
  if (typeof title !== "string") {
    return { ok: false, error: "Название должно быть строкой" };
  }

  const cleanTitle = title.trim();
  if (cleanTitle.length === 0) {
    return { ok: false, error: "Название не должно быть пустым" };
  }
  if (cleanTitle.length > maxTitleLength) {
    return { ok: false, error: `Название не должно быть длиннее ${maxTitleLength} символов` };
  }

  return { ok: true, title: cleanTitle };
}

function validatePriority(priority) {
  if (!allowedPriorities.includes(priority)) {
    return `Приоритет должен быть одним из значений: ${allowedPriorities.join(", ")}`;
  }
  return null;
}

export function createTask(id, title, priority = "medium") {
  const idError = validateId(id);
  if (idError !== null) {
    return { ok: false, error: idError };
  }

  const titleResult = normalizeTitle(title);
  if (!titleResult.ok) {
    return titleResult;
  }

  const priorityError = validatePriority(priority);
  if (priorityError !== null) {
    return { ok: false, error: priorityError };
  }

  return {
    ok: true,
    task: {
      id,
      title: titleResult.title,
      completed: false,
      priority,
    },
  };
}

export function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);
}

export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
}

export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
  const total = tasks.length;

  let completed = 0;
  for (const task of tasks) {
    if (task.completed === true) {
      completed += 1;
    }
  }

  const pending = total - completed;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return { total, completed, pending, progress };
}

export function addTask(tasks, id, title, priority = "medium") {
  const created = createTask(id, title, priority);
  if (!created.ok) {
    return created;
  }

  if (findTaskById(tasks, id) !== undefined) {
    return { ok: false, error: `Задача с id ${id} уже существует` };
  }

  return { ok: true, tasks: [...tasks, created.task] };
}

export function setTaskCompleted(tasks, id, completed) {
  const idError = validateId(id);
  if (idError !== null) {
    return { ok: false, error: idError };
  }

  if (typeof completed !== "boolean") {
    return { ok: false, error: "Статус выполнения должен быть true или false" };
  }

  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: `Задача с id ${id} не найдена` };
  }

  // Новый объект создаётся только для выбранной задачи, остальные используются повторно.
  const updatedTasks = tasks.map((task) =>
    task.id === id ? { ...task, completed } : task,
  );

  return { ok: true, tasks: updatedTasks };
}

export function renameTask(tasks, id, title) {
  const idError = validateId(id);
  if (idError !== null) {
    return { ok: false, error: idError };
  }

  const titleResult = normalizeTitle(title);
  if (!titleResult.ok) {
    return titleResult;
  }

  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: `Задача с id ${id} не найдена` };
  }

  const updatedTasks = tasks.map((task) =>
    task.id === id ? { ...task, title: titleResult.title } : task,
  );

  return { ok: true, tasks: updatedTasks };
}

export function removeTask(tasks, id) {
  const idError = validateId(id);
  if (idError !== null) {
    return { ok: false, error: idError };
  }

  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: `Задача с id ${id} не найдена` };
  }

  return { ok: true, tasks: tasks.filter((task) => task.id !== id) };
}
