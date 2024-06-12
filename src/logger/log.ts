export function log(result: any) {
  console.log(typeof result === "string" ? result : JSON.stringify(result));
}

export function debugPrint(...result: any) {
  console.log(...result);
}
