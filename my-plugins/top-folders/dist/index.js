// src/util/lang.ts
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// src/util/path.ts
function pathToRoot(slug) {
  let rootPath = slug.split("/").filter((x2) => x2 !== "").slice(0, -1).map(() => "..").join("/");
  if (rootPath.length === 0) rootPath = ".";
  return rootPath;
}
function resolveRelative(current, target) {
  const currentDir = pathToRoot(current);
  const targetSlug = target.replace(/^\/+/, "");
  return `${currentDir}/${targetSlug}`.replace(/\/+/g, "/");
}

// src/components/styles/topFolders.scss
var topFolders_default = ".top-folders {\n  display: flex;\n  flex-direction: column;\n  gap: 0.55rem;\n  min-width: 0;\n  margin-bottom: 10px;\n}\n\n.top-folders-title {\n  font-size: 1.75rem;\n  font-family: var(--titleFont);\n  margin: 0;\n}\n\n.top-folders-nav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.35rem 1rem;\n  align-items: center;\n  font-family: var(--headerFont);\n}\n\n.top-folders-link {\n  color: var(--secondary);\n  font-size: 0.95rem;\n  font-weight: 600;\n  text-decoration: none;\n  text-transform: lowercase;\n}\n\n.top-folders-link:hover,\n.top-folders-link.is-active {\n  color: var(--tertiary);\n}\n\n@media all and (max-width: 800px) {\n  .top-folders-title {\n    font-size: 1.5rem;\n  }\n  .top-folders-nav {\n    gap: 0.25rem 0.75rem;\n  }\n}";
var l;
l = { __e: function(n2, l2, u3, t2) {
  for (var i2, r2, o2; l2 = l2.__; ) if ((i2 = l2.__c) && !i2.__) try {
    if ((r2 = i2.constructor) && null != r2.getDerivedStateFromError && (i2.setState(r2.getDerivedStateFromError(n2)), o2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n2, t2 || {}), o2 = i2.__d), o2) return i2.__E = i2;
  } catch (l3) {
    n2 = l3;
  }
  throw n2;
} }, "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, Math.random().toString(8);

// node_modules/preact/jsx-runtime/dist/jsxRuntime.mjs
var f2 = 0;
function u2(e2, t2, n2, o2, i2, u3) {
  t2 || (t2 = {});
  var a2, c2, p2 = t2;
  if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
  var l2 = { type: e2, props: p2, key: n2, ref: a2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f2, __i: -1, __u: 0, __source: i2, __self: u3 };
  if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
  return l.vnode && l.vnode(l2), l2;
}

// src/components/TopFolders.tsx
function isHiddenSegment(segment) {
  return segment.startsWith(".") || segment === "tags" || segment === "attachments";
}
function getTopFolders(allFiles) {
  const folders = /* @__PURE__ */ new Map();
  for (const file of allFiles) {
    const slug = file.slug;
    if (!slug || slug === "index" || slug.startsWith("tags/")) continue;
    const [first] = slug.split("/");
    if (!first || isHiddenSegment(first)) continue;
    const isTopLevelFolder = slug === `${first}/index` || slug.startsWith(`${first}/`) && slug.split("/").length >= 2;
    if (!isTopLevelFolder) continue;
    if (!folders.has(first)) {
      const folderPage = allFiles.find((f3) => f3.slug === `${first}/index`);
      const label = folderPage?.frontmatter?.title ?? (slug === `${first}/index` ? file.frontmatter?.title ?? first : first);
      folders.set(first, label);
    }
  }
  return Array.from(folders.entries()).map(([segment, label]) => ({ slug: `${segment}/index`, label })).sort((a2, b2) => a2.label.localeCompare(b2.label, void 0, { sensitivity: "base" }));
}
var TopFolders_default = (() => {
  const TopFolders = ({ allFiles, fileData, cfg, displayClass }) => {
    const currentSlug = fileData.slug ?? "index";
    const baseDir = pathToRoot(currentSlug);
    const folders = getTopFolders(allFiles);
    const title = cfg.pageTitle ?? "Home";
    return /* @__PURE__ */ u2("div", { class: classNames(displayClass, "top-folders"), children: [
      /* @__PURE__ */ u2("h2", { class: "top-folders-title", children: /* @__PURE__ */ u2("a", { href: baseDir, children: title }) }),
      /* @__PURE__ */ u2("nav", { class: "top-folders-nav", "aria-label": "Top folders", children: folders.map((folder) => {
        const segment = folder.slug.replace(/\/index$/, "");
        const isActive = currentSlug === folder.slug || currentSlug.startsWith(`${segment}/`);
        return /* @__PURE__ */ u2(
          "a",
          {
            href: resolveRelative(currentSlug, folder.slug),
            class: classNames("top-folders-link", isActive && "is-active"),
            children: folder.label
          }
        );
      }) })
    ] });
  };
  TopFolders.css = topFolders_default;
  return TopFolders;
});

export { TopFolders_default as TopFolders };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map