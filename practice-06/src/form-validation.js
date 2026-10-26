const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

// Возвращает { valid, value, errors }.
// value содержит нормализованные title, priority и числовой categoryId.
export function validateTaskDraft(draft, categories) {
  const errors = {};

  const title = typeof draft?.title === "string" ? draft.title.trim() : "";
  if (title.length < 1 || title.length > 100) {
    errors.title = "Название должно содержать от 1 до 100 символов.";
  }

  const priority = draft?.priority;
  if (!ALLOWED_PRIORITIES.has(priority)) {
    errors.priority = "Выберите приоритет.";
  }

  // из select приходит строка, переводим в число
  const rawCategory = draft?.categoryId;
  const categoryId = rawCategory === "" || rawCategory === null || rawCategory === undefined
    ? NaN
    : Number(rawCategory);
  const known = Array.isArray(categories) && categories.some((category) => category.id === categoryId);
  if (!Number.isSafeInteger(categoryId) || !known) {
    errors.categoryId = "Выберите категорию из списка.";
  }

  const valid = Object.keys(errors).length === 0;
  return {
    valid,
    value: valid ? { title, priority, categoryId } : null,
    errors,
  };
}
