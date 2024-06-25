export function argsToArray(
  positionals: string[],
  obj: Record<string, unknown>,
  exclude: string[] = []
) {
  const otherArgs = Object.keys(obj).reduce(
    (acc, key) =>
      key.includes("-") || key === "_" || key === "$0" || exclude.includes(key)
        ? acc
        : obj[key] === true
        ? acc.concat(`--${key}`)
        : acc.concat(`--${key}`).concat((obj[key] as any).toString()),
    [] as string[]
  );

  return positionals.concat(otherArgs);
}
