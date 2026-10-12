import { demoTasks, variantNumber, variantTasks } from "./data.js";
import {
  createTask,
  findTaskById,
  getPendingTasks,
  getTaskTitles,
  getTaskStats,
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
} from "./task-service.js";
import { getPrioritySummary } from "./task-extra.js";

// Вспомогательные функции вывода. Расчёты выполняются в task-service.js.

function printStats(label, tasks) {
  const { total, completed, pending, progress } = getTaskStats(tasks);

  console.log(`\n[${label}]`);
  console.log(`Всего: ${total}; выполнено: ${completed}; осталось: ${pending}`);
  if (total === 0) {
    console.log("Задач пока нет");
  } else {
    console.log(`Прогресс: ${progress.toFixed(1)}%`);
  }
}

function printIds(label, tasks) {
  const ids = tasks.map((task) => task.id);
  console.log(`${label}: [${ids.join(", ")}]`);
}

// Выполняет операцию: при успехе возвращает новый список, при ошибке — прежний.
function applyStep(label, currentTasks, result) {
  if (result.ok) {
    printStats(label, result.tasks);
    return result.tasks;
  }

  console.log(`\n[${label}]`);
  console.error(`Ошибка: ${result.error}`);
  console.log("Состояние не изменено.");
  return currentTasks;
}

// Снимок полей для проверки, что исходный набор не изменился.
function snapshot(tasks) {
  return JSON.stringify(tasks);
}

// ---------- Общий сценарий ----------

console.log("========== ПР2. Общий сценарий ==========");

const demoSnapshot = snapshot(demoTasks);
let currentTasks = demoTasks;

console.log("\nИсходные задачи:");
console.table(currentTasks);
console.log("Названия:", getTaskTitles(currentTasks));
printIds("Невыполненные", getPendingTasks(currentTasks));
printStats("Исходный набор", currentTasks);

const foundTask = findTaskById(currentTasks, 4);
console.log(`\nПоиск id = 4: ${foundTask === undefined ? "не найдено" : foundTask.title}`);
console.log(`Поиск id = 777: ${findTaskById(currentTasks, 777)}`);

currentTasks = applyStep(
  "Добавление id 20",
  currentTasks,
  addTask(currentTasks, 20, "Добавить проверку", "high"),
);
currentTasks = applyStep(
  "Выполнение id 4",
  currentTasks,
  setTaskCompleted(currentTasks, 4, true),
);
currentTasks = applyStep(
  "Переименование id 10",
  currentTasks,
  renameTask(currentTasks, 10, "Подготовить инструкцию запуска"),
);
currentTasks = applyStep(
  "Удаление id 7",
  currentTasks,
  removeTask(currentTasks, 7),
);

// Обработка отказов: состояние после них не меняется.
currentTasks = applyStep(
  "Ошибка: повторное добавление id 20",
  currentTasks,
  addTask(currentTasks, 20, "Дубликат", "low"),
);
currentTasks = applyStep(
  'Ошибка: статус задан строкой "false"',
  currentTasks,
  setTaskCompleted(currentTasks, 1, "false"),
);
currentTasks = applyStep(
  "Ошибка: удаление отсутствующей задачи id 999",
  currentTasks,
  removeTask(currentTasks, 999),
);

console.log("\nИтоговый список:");
console.table(currentTasks);
printIds("Идентификаторы итогового списка", currentTasks);
printIds("Невыполненные", getPendingTasks(currentTasks));
printStats("Итог общего сценария", currentTasks);

console.log(
  `\ndemoTasks не изменился: ${snapshot(demoTasks) === demoSnapshot ? "да" : "НЕТ"}`,
);
console.log(`demoTasks: ${demoTasks.length} записи, id 4 completed = ${findTaskById(demoTasks, 4).completed}`);

// Пример createTask: результат — данные, а не вывод.
const createdResult = createTask(99, "  Проверить  данные  ");
if (createdResult.ok) {
  console.log("\ncreateTask(99, '  Проверить  данные  '):", createdResult.task);
}

// ---------- Индивидуальный вариант ----------

console.log(`\n========== Вариант ${variantNumber}: подготовка учебного релиза ==========`);

const variantSnapshot = snapshot(variantTasks);
let variantCurrent = variantTasks;

console.log("\nИсходные задачи варианта:");
console.table(variantCurrent);
printStats("Исходный набор варианта", variantCurrent);

variantCurrent = applyStep(
  "Добавление id 80",
  variantCurrent,
  addTask(variantCurrent, 80, "Отправить релиз на проверку", "high"),
);
variantCurrent = applyStep(
  "Выполнение id 11",
  variantCurrent,
  setTaskCompleted(variantCurrent, 11, true),
);
variantCurrent = applyStep(
  "Переименование id 23",
  variantCurrent,
  renameTask(variantCurrent, 23, "Обновить номер версии до 1.0.0"),
);
variantCurrent = applyStep(
  "Удаление id 37",
  variantCurrent,
  removeTask(variantCurrent, 37),
);
variantCurrent = applyStep(
  "Ошибка: повторное добавление id 80",
  variantCurrent,
  addTask(variantCurrent, 80, "Повтор", "high"),
);

console.log("\nИтоговые задачи варианта:");
console.table(variantCurrent);
printIds("Идентификаторы", variantCurrent);
printStats("Итог варианта", variantCurrent);

console.log(
  `\nvariantTasks не изменился: ${snapshot(variantTasks) === variantSnapshot ? "да" : "НЕТ"}`,
);

// ---------- Расширение (вариант Б) ----------

console.log("\n========== Расширение: сводка по приоритетам ==========");
console.log("demoTasks:");
console.table(getPrioritySummary(demoTasks));
console.log("Итог варианта:");
console.table(getPrioritySummary(variantCurrent));
