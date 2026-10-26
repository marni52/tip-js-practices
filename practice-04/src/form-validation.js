const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

// Чистая проверка данных формы. DOM и показ сообщений выполняются в main.js.
// draft: { id, title, priority }; editingId: null либо id редактируемой задачи.
export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  let id;

  if (editingId === null) {
    // Создание: id приходит из формы строкой. Пустую строку отсекаем сразу,
    // иначе Number("") превратит её в 0.
    const rawId = typeof draft.id === "string" ? draft.id.trim() : draft.id;
    id = rawId === "" || rawId === null || rawId === undefined ? NaN : Number(rawId);
    if (!Number.isSafeInteger(id) || id <= 0) {
      errors.id = "Введите целое положительное число";
    } else if (tasks.some((task) => task.id === id)) {
      errors.id = `Задача с id ${id} уже есть в списке`;
    }
  } else {
    // Редактирование: поле id заблокировано, берём editingId.
    id = editingId;
    if (!Number.isSafeInteger(id) || id <= 0 || !tasks.some((task) => task.id === id)) {
      errors.id = "Редактируемая задача не найдена";
    }
  }

  const title = typeof draft.title === "string" ? draft.title.trim() : "";
  if (typeof draft.title !== "string" || title === "") {
    errors.title = "Название не может быть пустым";
  } else if (title.length > 100) {
    errors.title = "Название не должно быть длиннее 100 символов";
  }

  if (!ALLOWED_PRIORITIES.has(draft.priority)) {
    errors.priority = "Выберите приоритет: low, medium или high";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value: { id, title, priority: draft.priority } };
}
