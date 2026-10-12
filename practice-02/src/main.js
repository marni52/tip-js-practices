// ПР2. Консольный сценарий: вызываем функции из task-service.js и печатаем результат.
import { demoTasks, variantNumber, variantTasks } from "./data.js";
import {
  createTask, findTaskById, getPendingTasks, getTaskTitles, getTaskStats,
  addTask, setTaskCompleted, renameTask, removeTask,
} from "./task-service.js";
import { getPrioritySummary } from "./task-extra.js";

// Печатает сводку по списку.
function printStats(label, tasks) {
  const stats = getTaskStats(tasks);
  console.log(`\n[${label}]`);
  console.log(`Всего: ${stats.total}; выполнено: ${stats.completed}; осталось: ${stats.pending}`);
  console.log(`Прогресс: ${stats.progress.toFixed(1)}%`);
}

// Один шаг сценария: при успехе берём новый список, при ошибке оставляем старый.
function step(label, tasks, result) {
  if (!result.ok) {
    console.log(`\n[${label}]\nОшибка: ${result.error}\nСостояние не изменено.`);
    return tasks;
  }
  printStats(label, result.tasks);
  return result.tasks;
}

function ids(tasks) {
  return `[${tasks.map((task) => task.id).join(", ")}]`;
}

// ---------- Общий сценарий (demoTasks) ----------
console.log("========== ПР2. Общий сценарий ==========");
const demoBefore = JSON.stringify(demoTasks); // запомнили, чтобы потом сравнить
let tasks = demoTasks;

console.log("Названия:", getTaskTitles(tasks));
console.log("Невыполненные:", ids(getPendingTasks(tasks)));
printStats("Исходный набор", tasks);
console.log(`\nПоиск id = 4: ${findTaskById(tasks, 4).title}`);
console.log(`Поиск id = 777: ${findTaskById(tasks, 777)}`);

tasks = step("Добавление id 20", tasks, addTask(tasks, 20, "Добавить проверку", "high"));
tasks = step("Выполнение id 4", tasks, setTaskCompleted(tasks, 4, true));
tasks = step("Переименование id 10", tasks, renameTask(tasks, 10, "Подготовить инструкцию запуска"));
tasks = step("Удаление id 7", tasks, removeTask(tasks, 7));
tasks = step("Повторное добавление id 20", tasks, addTask(tasks, 20, "Дубликат", "low"));
tasks = step('Статус строкой "false"', tasks, setTaskCompleted(tasks, 1, "false"));
tasks = step("Удаление отсутствующей id 999", tasks, removeTask(tasks, 999));

console.log(`\nИтоговый список: ${ids(tasks)}; невыполненные: ${ids(getPendingTasks(tasks))}`);
printStats("Итог общего сценария", tasks);
console.log(`demoTasks не изменился: ${JSON.stringify(demoTasks) === demoBefore ? "да" : "НЕТ"}`);
console.log("createTask(99, '  Проверить данные  '):", createTask(99, "  Проверить данные  ").task);

// ---------- Индивидуальный вариант ----------
console.log(`\n========== Вариант ${variantNumber}: подготовка учебного релиза ==========`);
const variantBefore = JSON.stringify(variantTasks);
let mine = variantTasks;

printStats("Исходный набор варианта", mine);
mine = step("Добавление id 80", mine, addTask(mine, 80, "Отправить релиз на проверку", "high"));
mine = step("Выполнение id 11", mine, setTaskCompleted(mine, 11, true));
mine = step("Переименование id 23", mine, renameTask(mine, 23, "Обновить номер версии до 1.0.0"));
mine = step("Удаление id 37", mine, removeTask(mine, 37));
mine = step("Повторное добавление id 80", mine, addTask(mine, 80, "Повтор", "high"));

console.log(`\nИтоговый список варианта: ${ids(mine)}`);
printStats("Итог варианта", mine);
console.log(`variantTasks не изменился: ${JSON.stringify(variantTasks) === variantBefore ? "да" : "НЕТ"}`);

// ---------- Дополнительное задание (вариант Б): сводка по приоритетам ----------
console.log("\nСводка по приоритетам (итог варианта):");
console.table(getPrioritySummary(mine));
