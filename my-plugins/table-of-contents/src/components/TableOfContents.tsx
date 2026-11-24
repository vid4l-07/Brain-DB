import type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzComponentConstructor,
} from "@quartz-community/types";
import { classNames } from "../util/lang";
import { i18n } from "../i18n";
import legacyStyle from "./styles/legacyToc.scss";
import modernStyle from "./styles/toc.scss";
// @ts-expect-error - inline script imported as string by esbuild loader
import script from "./scripts/toc.inline.ts";
import OverflowListFactory from "./OverflowList";
import { concatenateResources } from "../util/resources";

interface Options {
  layout: "modern" | "legacy";
}

const defaultOptions: Options = {
  layout: "modern",
};

let numTocs = 0;
export default ((opts?: Partial<Options>) => {
  const layout = opts?.layout ?? defaultOptions.layout;
  const { OverflowList, overflowListAfterDOMLoaded } = OverflowListFactory();
  const TableOfContents: QuartzComponent = (props: QuartzComponentProps) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { fileData, cfg } = props as any;
    if (!fileData?.toc) {
      return null;
    }

    const id = `toc-${numTocs++}`;
    return (
      <div class={classNames("toc")}>
        <OverflowList
          id={id}
          class={fileData.collapseToc ? "collapsed toc-content" : "toc-content"}
        >
          {fileData.toc.map((tocEntry: Record<string, unknown>) => {
            const slug = String(tocEntry.slug);
            const depth = String(tocEntry.depth);
            const text = String(tocEntry.text);
            return (
              <li key={slug} class={`depth-${depth}`}>
                <a href={`#${slug}`} data-for={slug}>
                  {text}
                </a>
              </li>
            );
          })}
        </OverflowList>
      </div>
    );
  };

  TableOfContents.css = modernStyle;
  TableOfContents.afterDOMLoaded = concatenateResources(
    script,
    overflowListAfterDOMLoaded,
  ) as string;

  const LegacyTableOfContents: QuartzComponent = (props: QuartzComponentProps) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { fileData, cfg } = props as any;
    if (!fileData?.toc) {
      return null;
    }
    return (
      <details class="toc" open={!fileData.collapseToc}>
        <summary>
          <h3>{i18n(cfg.locale).components.tableOfContents.title}</h3>
        </summary>
        <ul>
          {fileData.toc.map((tocEntry: Record<string, unknown>) => {
            const slug = String(tocEntry.slug);
            const depth = String(tocEntry.depth);
            const text = String(tocEntry.text);
            return (
              <li key={slug} class={`depth-${depth}`}>
                <a href={`#${slug}`} data-for={slug}>
                  {text}
                </a>
              </li>
            );
          })}
        </ul>
      </details>
    );
  };
  LegacyTableOfContents.css = legacyStyle;

  return layout === "modern" ? TableOfContents : LegacyTableOfContents;
}) satisfies QuartzComponentConstructor<Partial<Options>>;
