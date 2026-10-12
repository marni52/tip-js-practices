// Собственные проверки (дополняют готовый checks.js) и проверки расширения.
import assert from "node:assert/strict";
import {
  getTaskStats, addTask, setTaskCompleted, renameTask, removeTask,
} from "./src/task-service.js";
import { getPrioritySummary } from "./src/task-extra.js";

let passed = 0;
let failed = 0;

function check(name, action) {
  try {
    action();
    passed += 1;
    console.log(`OK: ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL: ${name}`);
    console.error(error.message);
  }
}

function fixture() {
  return [
    { id: 1, title: "Изучить функции", completed: true, priority: "medium" },
    { id: 4, title: "Подготовить модель задач", completed: false, priority: "high" },
    { id: 7, title: "Проверить методы массивов", completed: false, priority: "low" },
    { id: 10, title: "Оформить README", completed: true, priority: "medium" },
  ];
}

check("С1. Удаление, затем добавление с тем же id", () => {
  const tasks = fixture();
  const removed = removeTask(tasks, 7);
  assert.equal(removed.ok, true);
  const added = addTask(removed.tasks, 7, "Новая задача 7", "high");
  assert.equal(added.ok, true);
  assert.deepEqual(added.tasks.map((t) => t.id), [1, 4, 10, 7]);
  assert.equal(added.tasks[3].title, "Новая задача 7");
  assert.deepEqual(tasks, fixture());
});

check("С2. Изменение первой и последней записи", () => {
  const tasks = fixture();
  const first = setTaskCompleted(tasks, 1, false);
  const last = renameTask(first.tasks, 10, "  Финальный README  ");
  assert.equal(last.ok, true);
  assert.equal(last.tasks[0].completed, false);
  assert.equal(last.tasks[3].title, "Финальный README");
  assert.equal(last.tasks[3].completed, true);
  // Средние записи не менялись и используются повторно.
  assert.equal(last.tasks[1], tasks[1]);
  assert.equal(last.tasks[2], tasks[2]);
  assert.deepEqual(tasks, fixture());
});

check("С3. Последовательное выполнение всех задач даёт 100%", () => {
  let current = fixture();
  for (const id of [4, 7]) {
    const result = setTaskCompleted(current, id, true);
    assert.equal(result.ok, true);
    current = result.tasks;
  }
  assert.deepEqual(getTaskStats(current), { total: 4, completed: 4, pending: 0, progress: 100 });
});

check("С4. Удаление всех задач по одной даёт пустую сводку", () => {
  let current = fixture();
  for (const id of [10, 1, 7, 4]) {
    current = removeTask(current, id).tasks;
  }
  assert.deepEqual(current, []);
  assert.deepEqual(getTaskStats(current), { total: 0, completed: 0, pending: 0, progress: 0 });
  assert.equal(removeTask(current, 1).ok, false);
});

check("С5. Ошибка в середине цепочки не портит состояние", () => {
  const tasks = fixture();
  const step1 = addTask(tasks, 20, "Задача 20");
  const failedStep = renameTask(step1.tasks, 20, "   ");
  assert.equal(failedStep.ok, false);
  const step2 = setTaskCompleted(step1.tasks, 20, true);
  assert.equal(step2.ok, true);
  assert.equal(step2.tasks[4].title, "Задача 20");
  assert.equal(step1.tasks[4].completed, false);
});

check("Р1. Сводка по приоритетам: смешанный набор (demoTasks)", () => {
  const tasks = fixture();
  assert.deepEqual(getPrioritySummary(tasks), {
    low: { total: 1, pending: 1 },
    medium: { total: 2, pending: 0 },
    high: { total: 1, pending: 1 },
  });
  assert.deepEqual(tasks, fixture());
});

check("Р2. Сводка по приоритетам: пустой список", () => {
  assert.deepEqual(getPrioritySummary([]), {
    low: { total: 0, pending: 0 },
    medium: { total: 0, pending: 0 },
    high: { total: 0, pending: 0 },
  });
});

check("Р3. Сводка по приоритетам: один приоритет", () => {
  const tasks = [
    { id: 2, title: "A", completed: false, priority: "low" },
    { id: 3, title: "B", completed: true, priority: "low" },
  ];
  assert.deepEqual(getPrioritySummary(tasks), {
    low: { total: 2, pending: 1 },
    medium: { total: 0, pending: 0 },
    high: { total: 0, pending: 0 },
  });
});

console.log(`\nПроверок пройдено: ${passed}; не пройдено: ${failed}.`);
if (failed > 0) {
  process.exitCode = 1;
}
