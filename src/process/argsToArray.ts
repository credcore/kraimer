export function argsToArray(obj: Record<string, unknown>) {
  return Object.keys(obj).reduce(
    (acc, key) =>
      key.includes("-") || key === "_" || key === "$0"
        ? acc
        : acc.concat(`--${key}`).concat((obj[key] as any).toString()),
    [] as string[]
  );
}
