const PRIORITY_LABELS = Object.freeze({
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
});

// Текст с сервера выводится только через textContent
function textElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function actionButton(action, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.action = action;
  button.append(textElement("span", "action-label", label));
  return button;
}

export function createTaskElement(task, category) {
  const card = document.createElement("li");
  card.className = "task-card";
  card.classList.toggle("is-completed", task.completed);
  card.dataset.taskId = String(task.id);

  const title = textElement("h3", "task-title", task.title);
  const meta = document.createElement("p");
  meta.className = "task-meta";
  meta.append(
    textElement("span", "task-status", task.completed ? "Выполнена" : "В работе"),
    textElement("span", "task-priority", PRIORITY_LABELS[task.priority] ?? task.priority),
    textElement("span", "task-category", category?.name ?? "Без категории"),
  );

  const toggle = actionButton("toggle", task.completed ? "Вернуть в работу" : "Выполнена");
  toggle.setAttribute("aria-pressed", String(task.completed));
  const actions = document.createElement("div");
  actions.className = "task-actions";
  actions.append(toggle, actionButton("edit", "Изменить"), actionButton("delete", "Удалить"));

  card.append(title, meta, actions);
  return card;
}

export function renderTaskList(list, tasks, categories) {
  const byId = new Map(categories.map((category) => [category.id, category]));
  list.replaceChildren(...tasks.map((task) => createTaskElement(task, byId.get(task.categoryId))));
}
