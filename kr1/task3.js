// КР1, задание 3: проверочные вызовы setTaskCompleted из ПР2.
import { demoTasks } from "../practice-02/src/data.js";
import { setTaskCompleted, findTaskById } from "../practice-02/src/task-service.js";

// Проверка 1: отметить id = 4 выполненной.
const result = setTaskCompleted(demoTasks, 4, true);
console.log("setTaskCompleted(demoTasks, 4, true) → ok:", result.ok);
console.log("Новая запись id 4:    completed =", findTaskById(result.tasks, 4).completed);
console.log("Исходная запись id 4: completed =", findTaskById(demoTasks, 4).completed);

// Проверка 2: задачи с id = 777 нет — ожидаем отказ.
const failed = setTaskCompleted(demoTasks, 777, true);
console.log("\nsetTaskCompleted(demoTasks, 777, true) →", failed);
console.log("demoTasks не изменился, выполнены id:", demoTasks.filter((task) => task.completed).map((task) => task.id));
