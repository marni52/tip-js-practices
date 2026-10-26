// Собственные проверки ПР4: граничные случаи формы и ошибки хранилища.
// Запуск из папки practice-04: node checks/own.checks.js
import { validateTaskDraft } from "../src/form-validation.js";
import { updateTask } from "../src/task-service.js";
import { loadTasks, saveTasks } from "../src/task-storage.js";
import { demoTasks } from "../src/data.js";

let passed = 0;
let failed = 0;

function check(name, condition) {
  if (condition) {
    passed += 1;
    console.log(`OK: ${name}`);
  } else {
    failed += 1;
    console.log(`FAIL: ${name}`);
  }
}

// простая имитация localStorage
function createStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => { data[key] = String(value); },
    removeItem: (key) => { delete data[key]; },
    data,
  };
}

// С1. Форма: пустой id не превращается в 0, название ровно 100 символов проходит, 101 — нет
const empty = validateTaskDraft({ id: "", title: "a".repeat(100), priority: "low" }, demoTasks);
check("С1. Пустой id отклоняется, а 100 символов в названии допустимы",
  empty.ok === false && "id" in empty.errors && !("title" in empty.errors));
const long = validateTaskDraft({ id: "30", title: "a".repeat(101), priority: "low" }, demoTasks);
check("С1. Название из 101 символа отклоняется", long.ok === false && "title" in long.errors);

// С2. Восстановление после перезагрузки: изменённая выполненная задача читается обратно с completed: true
const storage = createStorage();
const edited = updateTask(demoTasks, 1, "Изучить функции и замыкания", "high");
saveTasks(storage, "demo", edited.tasks);
const restored = loadTasks(storage, "demo", demoTasks);
const task1 = restored.tasks.find((task) => task.id === 1);
check("С2. После «перезагрузки» задача 1 восстановлена с новым названием и completed: true",
  restored.source === "storage" && task1.title === "Изучить функции и замыкания" && task1.completed === true);

// С3. Запись другой версии схемы не используется
const otherVersion = createStorage({ demo: JSON.stringify({ version: 2, tasks: demoTasks }) });
const fromV2 = loadTasks(otherVersion, "demo", demoTasks);
check("С3. Запись с version: 2 заменяется исходным набором",
  fromV2.ok === false && fromV2.source === "fallback" && fromV2.tasks.length === 4);

// С4. setItem выбрасывает исключение (как при переполнении хранилища)
const fullStorage = createStorage();
fullStorage.setItem = () => { throw new Error("QuotaExceededError"); };
const saved = saveTasks(fullStorage, "demo", demoTasks);
check("С4. Ошибка setItem возвращается как { ok: false }, исключение не выходит наружу",
  saved.ok === false && saved.error.includes("QuotaExceededError"));

// С5. Повторяющиеся id в сохранённых данных — отклоняется весь список
const dup = createStorage({ demo: JSON.stringify({ version: 1, tasks: [demoTasks[0], demoTasks[0]] }) });
check("С5. Список с повторяющимся id не загружается", loadTasks(dup, "demo", demoTasks).source === "fallback");

console.log(`\nПроверок пройдено: ${passed}; не пройдено: ${failed}.`);
