import { isDebugging } from "../config.js";

export function log(result: any) {
  console.log(JSON.stringify(result));
}

export function debugPrint(...result: any) {
  if (isDebugging()) {
    console.log(...result);
  }
}
