import { TaskFunction } from "just-task";
import { exec } from "just-scripts-utils";

export function tscTask(): TaskFunction {
  return function tsc() {
    exec("bun");
    return Promise.resolve();
  };
}
