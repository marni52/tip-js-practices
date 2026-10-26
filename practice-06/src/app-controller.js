import { ApiError } from "./api-client.js";
import { validateTaskDraft } from "./form-validation.js";

export function messageForError(error) {
  if (!(error instanceof ApiError)) return "Не удалось выполнить операцию.";
  if (error.kind === "timeout") return "Сервер не ответил вовремя. Попробуйте ещё раз.";
  if (error.kind === "network") return "Нет соединения с учебным API. Проверьте, запущен ли npm start.";
  if (error.kind === "invalid-response") return "Сервер вернул ответ неожиданного формата.";
  if (error.kind === "http" && error.status === 404) return "Запись уже отсутствует на сервере. Обновите список.";
  if (error.kind === "http") return error.message || `Сервер вернул ошибку ${error.status}.`;
  return "Не удалось выполнить операцию.";
}

// view — адаптер из dom-app.js. Контроллер не должен обращаться к document.
// Обязательные методы результата:
// start, applyFilters, refresh, submit, beginEdit, cancelEdit,
// toggleTask, deleteTask, resetData и destroy.
const VIEW_METHODS = ["setListState", "setTasks", "setCategories", "setTotal", "setFormTask",
  "showFormErrors", "setMutationPending", "notify"];
const API_METHODS = ["loadInitialData", "getTasks", "createTask", "updateTask",
  "setTaskCompleted", "deleteTask", "resetDemoData"];

export function createAppController({ api, view, validateDraft = validateTaskDraft } = {}) {
  if (!api || API_METHODS.some((name) => typeof api[name] !== "function")) {
    throw new TypeError("api должен содержать методы task-api");
  }
  if (!view || VIEW_METHODS.some((name) => typeof view[name] !== "function")) {
    throw new TypeError("view должен содержать методы представления");
  }

  let tasks = [];
  let categories = [];
  let categoriesLoaded = false;
  let filters = {};
  let editingId = null;
  let loadController = null; // AbortController текущей загрузки
  let loadNumber = 0; // номер последней загрузки

  async function loadCurrentTasks() {
    loadController?.abort(); // старый запрос больше не нужен
    const controller = new AbortController();
    loadController = controller;
    loadNumber += 1;
    const myNumber = loadNumber;

    view.setListState("loading");
    try {
      // пока нет категорий, грузим всё сразу; потом только задачи
      const result = categoriesLoaded
        ? await api.getTasks(filters, { signal: controller.signal })
        : await api.loadInitialData(filters, { signal: controller.signal });

      if (myNumber !== loadNumber) return; // пришёл устаревший ответ — игнорируем

      if (!categoriesLoaded) {
        categories = result.categories;
        categoriesLoaded = true;
        view.setCategories(categories);
      }
      tasks = result.tasks;
      view.setTasks(tasks, categories);
      view.setTotal(result.meta?.total ?? tasks.length);
      view.setListState(tasks.length > 0 ? "ready" : "empty");
    } catch (error) {
      if (myNumber !== loadNumber) return;
      if (error instanceof ApiError && error.kind === "aborted") return; // отмену не показываем
      view.setListState("error", messageForError(error));
    } finally {
      if (loadController === controller) loadController = null;
    }
  }

  // общая схема для POST / PATCH / DELETE: блокировка → запрос → повторный GET
  async function mutate(action, successMessage) {
    view.setMutationPending(true);
    try {
      await action();
      view.notify(successMessage, "success");
      await loadCurrentTasks();
    } catch (error) {
      view.notify(messageForError(error), "error");
    } finally {
      view.setMutationPending(false);
    }
  }

  function findTask(id) {
    return tasks.find((task) => task.id === id);
  }

  function cancelEdit() {
    editingId = null;
    view.setFormTask(null);
    view.showFormErrors({});
  }

  return {
    start(initialFilters = {}) {
      filters = { ...initialFilters };
      return loadCurrentTasks();
    },

    applyFilters(nextFilters = {}) {
      filters = { ...nextFilters };
      return loadCurrentTasks();
    },

    refresh() {
      return loadCurrentTasks();
    },

    async submit(draft) {
      const checked = validateDraft(draft, categories);
      if (!checked.valid) {
        view.showFormErrors(checked.errors); // запрос на сервер не отправляем
        return;
      }
      view.showFormErrors({});
      const id = editingId;
      if (id === null) {
        await mutate(async () => {
          await api.createTask(checked.value);
          cancelEdit();
        }, "Задача добавлена.");
      } else {
        await mutate(async () => {
          await api.updateTask(id, checked.value);
          cancelEdit();
        }, "Изменения сохранены.");
      }
    },

    beginEdit(id) {
      const task = findTask(id);
      if (!task) {
        view.notify("Задача не найдена в текущем списке.", "error");
        return;
      }
      editingId = id;
      view.showFormErrors({});
      view.setFormTask(task);
    },

    cancelEdit,

    toggleTask(id) {
      const task = findTask(id);
      if (!task) {
        view.notify("Задача не найдена в текущем списке.", "error");
        return Promise.resolve();
      }
      return mutate(() => api.setTaskCompleted(id, !task.completed), "Статус задачи изменён.");
    },

    deleteTask(id) {
      return mutate(async () => {
        await api.deleteTask(id);
        if (editingId === id) cancelEdit();
      }, "Задача удалена.");
    },

    resetData() {
      return mutate(async () => {
        await api.resetDemoData();
        cancelEdit();
      }, "Исходные данные восстановлены.");
    },

    destroy() {
      loadController?.abort();
      loadController = null;
      loadNumber += 1;
    },
  };
}
