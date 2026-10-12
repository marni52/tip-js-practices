// КР1, задание 2: проверочные вызовы getPendingTasks из ПР2.
import { demoTasks } from "../practice-02/src/data.js";
import { getPendingTasks } from "../practice-02/src/task-service.js";

console.log("getPendingTasks(demoTasks) → id:", getPendingTasks(demoTasks).map((task) => task.id));
console.log("getPendingTasks([]) →", getPendingTasks([]));
