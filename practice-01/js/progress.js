"use strict";

// ПР1, задание 3. Сводка выполнения задач. Вариант 7.
const totalTasks = 10;
const completedTasks = 7;

// Шаг 1. Проверяем данные. При ошибке выводим одно сообщение и больше ничего.
if (typeof totalTasks !== "number" || typeof completedTasks !== "number") {
  console.log("Ошибка: количество задач должно быть числом, а не строкой");
} else if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)) {
  console.log("Ошибка: количество задач должно быть целым числом (не дробь и не NaN)");
} else if (totalTasks < 0 || totalTasks > 1000) {
  console.log("Ошибка: всего задач должно быть от 0 до 1000");
} else if (completedTasks < 0 || completedTasks > totalTasks) {
  console.log("Ошибка: выполненных задач должно быть от 0 до общего количества");
} else if (totalTasks === 0) {
  // Шаг 2. Задач нет — процент не считаем, иначе было бы деление на ноль.
  console.log("Задач пока нет");
} else {
  // Шаг 3. Считаем остаток, процент и статус.
  const remainingTasks = totalTasks - completedTasks;
  const percent = (completedTasks / totalTasks) * 100;

  let status = "В работе";
  if (completedTasks === 0) {
    status = "Не начато";
  } else if (completedTasks === totalTasks) {
    status = "Завершено";
  }

  console.log(`Всего задач: ${totalTasks}`);
  console.log(`Выполнено: ${completedTasks}`);
  console.log(`Осталось: ${remainingTasks}`);
  console.log(`Прогресс: ${percent.toFixed(1)}%`);
  console.log(`Статус: ${status}`);
}
