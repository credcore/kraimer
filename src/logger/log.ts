import { isDebugging } from "../config.js";

export function log(result: any) {
  console.log(JSON.stringify(result));
}

export function debugPrint(...result: any) {
  if (isDebugging()) {
    if (result.length === 1 && typeof result !== "string") {
      try {
        console.log(JSON.stringify(result[0]));
      } catch (ex: any) {
        console.log(...result);
      }
    } else {
      console.log(...result);
    }
  }
}
