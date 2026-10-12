// ПР2. Функции для работы со списком задач.
// Правила: функции ничего не выводят и не меняют переданный массив —
// они возвращают НОВЫЙ массив. Ошибка возвращается объектом { ok: false, error: "текст" }.

const priorities = ["low", "medium", "high"];

// id должен быть целым положительным числом. Возвращает текст ошибки или null.
function checkId(id) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    return "Идентификатор должен быть положительным целым числом";
  }
  return null;
}

// Название — непустая строка не длиннее 100 символов (пробелы по краям не считаются).
function checkTitle(title) {
  if (typeof title !== "string" || title.trim() === "") {
    return "Название должно быть непустой строкой";
  }
  if (title.trim().length > 100) {
    return "Название не должно быть длиннее 100 символов";
  }
  return null;
}

export function createTask(id, title, priority = "medium") {
  const idError = checkId(id);
  if (idError) return { ok: false, error: idError };

  const titleError = checkTitle(title);
  if (titleError) return { ok: false, error: titleError };

  if (!priorities.includes(priority)) {
    return { ok: false, error: "Приоритет должен быть low, medium или high" };
  }

  return { ok: true, task: { id, title: title.trim(), completed: false, priority } };
}

// find возвращает найденную задачу или undefined.
export function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);
}

// filter возвращает новый массив только с невыполненными задачами.
export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
}

// map возвращает новый массив из названий.
export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;
  const progress = total === 0 ? 0 : (completed / total) * 100; // при 0 задач не делим на 0
  return { total, completed, pending, progress };
}

export function addTask(tasks, id, title, priority = "medium") {
  const created = createTask(id, title, priority);
  if (!created.ok) return created;

  if (findTaskById(tasks, id)) {
    return { ok: false, error: `Задача с id ${id} уже существует` };
  }

  return { ok: true, tasks: [...tasks, created.task] }; // [...tasks] — копия массива
}

export function setTaskCompleted(tasks, id, completed) {
  const idError = checkId(id);
  if (idError) return { ok: false, error: idError };

  if (typeof completed !== "boolean") {
    return { ok: false, error: "Статус должен быть true или false" };
  }
  if (!findTaskById(tasks, id)) {
    return { ok: false, error: `Задача с id ${id} не найдена` };
  }

  // Новый массив: у нужной задачи новый объект с другим completed, остальные — как были.
  const newTasks = tasks.map((task) => (task.id === id ? { ...task, completed } : task));
  return { ok: true, tasks: newTasks };
}

export function renameTask(tasks, id, title) {
  const idError = checkId(id);
  if (idError) return { ok: false, error: idError };

  const titleError = checkTitle(title);
  if (titleError) return { ok: false, error: titleError };

  if (!findTaskById(tasks, id)) {
    return { ok: false, error: `Задача с id ${id} не найдена` };
  }

  const newTasks = tasks.map((task) => (task.id === id ? { ...task, title: title.trim() } : task));
  return { ok: true, tasks: newTasks };
}

export function removeTask(tasks, id) {
  const idError = checkId(id);
  if (idError) return { ok: false, error: idError };

  if (!findTaskById(tasks, id)) {
    return { ok: false, error: `Задача с id ${id} не найдена` };
  }

  return { ok: true, tasks: tasks.filter((task) => task.id !== id) }; // все, кроме удаляемой
}
