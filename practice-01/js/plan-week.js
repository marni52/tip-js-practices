"use strict";

// Дополнительное задание, вариант Б: план с выходными.
// Первый календарный день — понедельник; суббота и воскресенье — выходные.
const totalTasks = 6;
const completedTasks = 0;
const dailyLimit = 1;

const maxTasks = 1000;
const maxDailyLimit = 1000;
const daysInWeek = 7;
const workDaysInWeek = 5;

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
  let calendarDays = 0;
  let workDays = 0;

  console.log(`Осталось задач: ${remainingTasks}`);

  // Цикл останавливается сразу после последней выполненной задачи,
  // поэтому выходные в конце не добавляются.
  while (remainingTasks > 0) {
    calendarDays += 1;
    // 0–4 — понедельник…пятница, 5–6 — суббота и воскресенье.
    const weekDayIndex = (calendarDays - 1) % daysInWeek;

    if (weekDayIndex >= workDaysInWeek) {
      console.log(`День ${calendarDays}: выходной, осталось ${remainingTasks}`);
    } else {
      workDays += 1;
      const tasksToday = Math.min(dailyLimit, remainingTasks);
      remainingTasks -= tasksToday;
      console.log(`День ${calendarDays}: выполнено ${tasksToday}, осталось ${remainingTasks}`);
    }
  }

  console.log(`Рабочих дней: ${workDays}`);
  console.log(`Календарных дней: ${calendarDays}`);
}
