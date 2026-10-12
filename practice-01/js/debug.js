"use strict";

const plannedText = "8";
const completedText = "3";
const additionalText = "2";

// Исправление 1: строки явно преобразуются в числа перед сложением.
const completedTotal = Number(completedText) + Number(additionalText);
const remainingTasks = Number(plannedText) - completedTotal;

console.log("Выполнено:", completedTotal);
console.log("Осталось:", remainingTasks);

let controlSum = 0;

// Исправление 2: граница цикла включает 4 (<= вместо <).
for (let taskNumber = 1; taskNumber <= 4; taskNumber += 1) {
  controlSum += taskNumber;
}

console.log("Контрольная сумма:", controlSum);
