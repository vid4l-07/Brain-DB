export function pathToRoot(slug: string): string {
  let rootPath = slug
    .split("/")
    .filter((x) => x !== "")
    .slice(0, -1)
    .map(() => "..")
    .join("/")
  if (rootPath.length === 0) rootPath = "."
  return rootPath
}

export function resolveRelative(current: string, target: string): string {
  const currentDir = pathToRoot(current)
  const targetSlug = target.replace(/^\/+/, "")
  return `${currentDir}/${targetSlug}`.replace(/\/+/g, "/")
}
