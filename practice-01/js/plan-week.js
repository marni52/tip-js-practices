"use strict";

// ПР1, дополнительное задание (вариант Б): план с выходными.
// День 1 — понедельник; суббота и воскресенье — выходные.
const totalTasks = 6;
const completedTasks = 0;
const dailyLimit = 1;

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
  let remainingTasks = totalTasks - completedTasks;
  let day = 0;       // календарные дни
  let workDays = 0;  // рабочие дни

  console.log(`Осталось задач: ${remainingTasks}`);

  // Цикл заканчивается сразу после последней задачи — лишние выходные не добавляются.
  while (remainingTasks > 0) {
    day += 1;
    const weekDay = (day - 1) % 7; // 0 — понедельник ... 5 — суббота, 6 — воскресенье

    if (weekDay >= 5) {
      console.log(`День ${day}: выходной, осталось ${remainingTasks}`);
    } else {
      workDays += 1;
      const tasksToday = Math.min(dailyLimit, remainingTasks);
      remainingTasks -= tasksToday;
      console.log(`День ${day}: выполнено ${tasksToday}, осталось ${remainingTasks}`);
    }
  }

  console.log(`Рабочих дней: ${workDays}`);
  console.log(`Календарных дней: ${day}`);
}
