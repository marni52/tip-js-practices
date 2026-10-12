"use strict";

// ПР1, задание 4. План выполнения задач по дням. Вариант 7.
const totalTasks = 10;
const completedTasks = 7;
const dailyLimit = 3;

// Шаг 1. Проверяем данные — так же, как в progress.js, плюс дневную норму.
if (typeof totalTasks !== "number" || typeof completedTasks !== "number") {
  console.log("Ошибка: количество задач должно быть числом, а не строкой");
} else if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)) {
  console.log("Ошибка: количество задач должно быть целым числом (не дробь и не NaN)");
} else if (totalTasks < 0 || totalTasks > 1000) {
  console.log("Ошибка: всего задач должно быть от 0 до 1000");
} else if (completedTasks < 0 || completedTasks > totalTasks) {
  console.log("Ошибка: выполненных задач должно быть от 0 до общего количества");
} else if (typeof dailyLimit !== "number" || !Number.isInteger(dailyLimit)) {
  console.log("Ошибка: дневная норма должна быть целым числом, а не строкой или дробью");
} else if (dailyLimit < 1 || dailyLimit > 1000) {
  console.log("Ошибка: дневная норма должна быть от 1 до 1000");
} else {
  // Шаг 2. Каждый день делаем не больше нормы и не больше, чем осталось.
  let remainingTasks = totalTasks - completedTasks;
  let day = 0;

  if (remainingTasks === 0) {
    console.log("Все задачи уже выполнены");
  } else {
    console.log(`Осталось задач: ${remainingTasks}`);
  }

  while (remainingTasks > 0) {
    day += 1;
    const tasksToday = Math.min(dailyLimit, remainingTasks);
    remainingTasks -= tasksToday;
    console.log(`День ${day}: выполнено ${tasksToday}, осталось ${remainingTasks}`);
  }

  console.log(`Потребуется дней: ${day}`);
}
