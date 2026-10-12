"use strict";

// Вариант 7
const totalTasks = 10;
const completedTasks = 7;
const dailyLimit = 3;

const maxTasks = 1000;
const maxDailyLimit = 1000;

// Проверки количества задач — как в задании 3, затем проверка дневной нормы.
if (typeof totalTasks !== "number" || typeof completedTasks !== "number") {
  console.log("Ошибка: количество задач должно быть числом, а не строкой или другим типом");
} else if (!Number.isFinite(totalTasks) || !Number.isFinite(completedTasks)) {
  console.log("Ошибка: недопустимое числовое значение (NaN или Infinity)");
} else if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)) {
  console.log("Ошибка: количество задач должно быть целым числом");
} else if (totalTasks < 0 || completedTasks < 0) {
  console.log("Ошибка: количество задач не может быть отрицательным");
} else if (totalTasks > maxTasks) {
  console.log(`Ошибка: общее количество задач не может превышать ${maxTasks}`);
} else if (completedTasks > totalTasks) {
  console.log("Ошибка: выполнено больше задач, чем существует");
} else if (typeof dailyLimit !== "number") {
  console.log("Ошибка: дневная норма должна быть числом, а не строкой или другим типом");
} else if (!Number.isInteger(dailyLimit)) {
  console.log("Ошибка: дневная норма должна быть целым числом");
} else if (dailyLimit < 1 || dailyLimit > maxDailyLimit) {
  console.log(`Ошибка: дневная норма должна быть от 1 до ${maxDailyLimit}`);
} else {
  let remainingTasks = totalTasks - completedTasks;

  if (remainingTasks === 0) {
    console.log("Все задачи уже выполнены");
    console.log("Потребуется дней: 0");
  } else {
    console.log(`Осталось задач: ${remainingTasks}`);

    let day = 0;
    while (remainingTasks > 0) {
      day += 1;
      // В последний день выполняем не больше, чем осталось.
      const tasksToday = Math.min(dailyLimit, remainingTasks);
      remainingTasks -= tasksToday;
      console.log(`День ${day}: выполнено ${tasksToday}, осталось ${remainingTasks}`);
    }

    console.log(`Потребуется дней: ${day}`);
  }
}
