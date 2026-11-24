import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { classNames } from "../util/lang"
import { pathToRoot, resolveRelative } from "../util/path"
import style from "./styles/topFolders.scss"

type TopFolder = {
  slug: string
  label: string
}

function isHiddenSegment(segment: string): boolean {
  return segment.startsWith(".") || segment === "tags" || segment === "attachments"
}

function getTopFolders(allFiles: QuartzComponentProps["allFiles"]): TopFolder[] {
  const folders = new Map<string, string>()

  for (const file of allFiles) {
    const slug = file.slug as string | undefined
    if (!slug || slug === "index" || slug.startsWith("tags/")) continue

    const [first] = slug.split("/")
    if (!first || isHiddenSegment(first)) continue

    const isTopLevelFolder =
      slug === `${first}/index` || (slug.startsWith(`${first}/`) && slug.split("/").length >= 2)
    if (!isTopLevelFolder) continue

    if (!folders.has(first)) {
      const folderPage = allFiles.find((f) => f.slug === `${first}/index`)
      const label =
        (folderPage?.frontmatter?.title as string | undefined) ??
        (slug === `${first}/index`
          ? ((file.frontmatter?.title as string | undefined) ?? first)
          : first)
      folders.set(first, label)
    }
  }

  return Array.from(folders.entries())
    .map(([segment, label]) => ({ slug: `${segment}/index`, label }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }))
}

export default (() => {
  const TopFolders: QuartzComponent = ({ allFiles, fileData, cfg, displayClass }: QuartzComponentProps) => {
    const currentSlug = (fileData.slug as string | undefined) ?? "index"
    const baseDir = pathToRoot(currentSlug)
    const folders = getTopFolders(allFiles)
    const title = cfg.pageTitle ?? "Home"

    return (
      <div class={classNames(displayClass, "top-folders")}>
        <h2 class="top-folders-title">
          <a href={baseDir}>{title}</a>
        </h2>
        <nav class="top-folders-nav" aria-label="Top folders">
          {folders.map((folder) => {
            const segment = folder.slug.replace(/\/index$/, "")
            const isActive = currentSlug === folder.slug || currentSlug.startsWith(`${segment}/`)
            return (
              <a
                href={resolveRelative(currentSlug, folder.slug)}
                class={classNames("top-folders-link", isActive && "is-active")}
              >
                {folder.label}
              </a>
            )
          })}
        </nav>
      </div>
    )
  }

  TopFolders.css = style
  return TopFolders
}) satisfies QuartzComponentConstructor
