// Общий контрольный набор. Для своего варианта ниже предусмотрен отдельный массив.
// Идентификатор задачи не совпадает с её индексом в массиве.
export const demoTasks = [
  { id: 1, title: "Изучить функции", completed: true, priority: "medium" },
  { id: 4, title: "Подготовить модель задач", completed: false, priority: "high" },
  { id: 7, title: "Проверить методы массивов", completed: false, priority: "low" },
  { id: 10, title: "Оформить README", completed: true, priority: "medium" },
];

// Вариант 7: подготовка учебного релиза.
// K = 6 — изначально выполнены все шесть задач.
export const variantNumber = 7;
export const variantTasks = [
  { id: 11, title: "Зафиксировать список изменений", completed: true, priority: "high" },
  { id: 23, title: "Обновить номер версии", completed: true, priority: "low" },
  { id: 37, title: "Прогнать все проверки", completed: true, priority: "high" },
  { id: 41, title: "Собрать релизную сборку", completed: true, priority: "medium" },
  { id: 58, title: "Написать заметки к релизу", completed: true, priority: "medium" },
  { id: 64, title: "Опубликовать релиз", completed: true, priority: "low" },
];
