// node_modules/@quartz-community/utils/dist/lang.js
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// src/i18n/locales/en-US.ts
var en_US_default = {
  components: {
    tableOfContents: {
      title: "Table of Contents"
    }
  }
};

// src/i18n/locales/en-GB.ts
var en_GB_default = {
  components: {
    tableOfContents: {
      title: "Table of Contents"
    }
  }
};

// src/i18n/locales/es-ES.ts
var es_ES_default = {
  components: {
    tableOfContents: {
      title: "Tabla de Contenidos"
    }
  }
};

// src/i18n/index.ts
var locales = {
  "en-US": en_US_default,
  "en-GB": en_GB_default,
  "es-ES": es_ES_default
};
function i18n(locale) {
  return locales[locale] || en_US_default;
}

// src/components/styles/legacyToc.scss
var legacyToc_default = "details.toc summary {\n  cursor: pointer;\n}\ndetails.toc summary::marker {\n  color: var(--dark);\n}\ndetails.toc summary > * {\n  padding-left: 0.25rem;\n  display: inline-block;\n  margin: 0;\n}\ndetails.toc ul {\n  list-style: none;\n  margin: 0.5rem 1.25rem;\n  padding: 0;\n}\ndetails.toc .depth-1 {\n  padding-left: calc(1rem * 1);\n}\ndetails.toc .depth-2 {\n  padding-left: calc(1rem * 2);\n}\ndetails.toc .depth-3 {\n  padding-left: calc(1rem * 3);\n}\ndetails.toc .depth-4 {\n  padding-left: calc(1rem * 4);\n}\ndetails.toc .depth-5 {\n  padding-left: calc(1rem * 5);\n}\ndetails.toc .depth-6 {\n  padding-left: calc(1rem * 6);\n}";

// src/components/styles/toc.scss
var toc_default = ".toc {\n  display: flex;\n  flex-direction: column;\n  overflow-y: hidden;\n  min-height: 1.4rem;\n  flex: 0 0.5 auto;\n}\n.toc:has(button.toc-header.collapsed) {\n  flex: 0 1 1.4rem;\n}\n\nbutton.toc-header {\n  background-color: transparent;\n  border: none;\n  text-align: left;\n  cursor: pointer;\n  padding: 0;\n  color: var(--dark);\n  display: flex;\n  align-items: center;\n}\nbutton.toc-header h3 {\n  font-size: 1rem;\n  display: inline-block;\n  margin: 0;\n}\nbutton.toc-header .fold {\n  margin-left: 0.5rem;\n  transition: transform 0.3s ease;\n  opacity: 0.8;\n}\nbutton.toc-header.collapsed .fold {\n  transform: rotateZ(-90deg);\n}\n\nul.toc-content.overflow {\n  list-style: none;\n  position: relative;\n  margin: 0.5rem 0;\n  padding: 0;\n  max-height: calc(100% - 2rem);\n  overscroll-behavior: contain;\n  list-style: none;\n}\nul.toc-content.overflow > li > a {\n  color: var(--dark);\n  opacity: 0.35;\n  transition: 0.5s ease opacity, 0.3s ease color;\n}\nul.toc-content.overflow > li > a.in-view {\n  opacity: 0.75;\n}\nul.toc-content.overflow .depth-0 {\n  padding-left: calc(1rem * 0);\n}\nul.toc-content.overflow .depth-1 {\n  padding-left: calc(1rem * 1);\n}\nul.toc-content.overflow .depth-2 {\n  padding-left: calc(1rem * 2);\n}\nul.toc-content.overflow .depth-3 {\n  padding-left: calc(1rem * 3);\n}\nul.toc-content.overflow .depth-4 {\n  padding-left: calc(1rem * 4);\n}\nul.toc-content.overflow .depth-5 {\n  padding-left: calc(1rem * 5);\n}\nul.toc-content.overflow .depth-6 {\n  padding-left: calc(1rem * 6);\n}\nul.toc-content.overflow li.toc-section-hidden {\n  display: none;\n}";

// src/components/scripts/toc.inline.ts
var toc_inline_default = 'var c=null,l=null;function m(n,i){if(!n||l===i)return;l=i,n.querySelectorAll("li[data-section]").forEach(t=>{let e=t.getAttribute("data-section");t.classList.contains("toc-section-header")||i&&e===i?t.classList.remove("toc-section-hidden"):t.classList.add("toc-section-hidden")})}function u(){let n=Array.from(document.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]")),i=window.innerHeight*.5,o=null;for(let e of n)e.getBoundingClientRect().top<=i&&(o=e.id);o!==c&&(c&&document.querySelectorAll(`a[data-for="${c}"]`).forEach(e=>{e.classList.remove("in-view")}),c=o,c&&document.querySelectorAll(`a[data-for="${c}"]`).forEach(e=>{e.classList.add("in-view")}));let t=document.querySelector(".toc-content");if(t&&c){let e=t.querySelector(`a[data-for="${c}"]`);if(e){let s=e.closest("li[data-section]");if(s){let h=s.getAttribute("data-section");m(t,h)}}}}var r=!1;function a(){r||(requestAnimationFrame(()=>{u(),r=!1}),r=!0)}function S(n){let i=n.querySelectorAll("li"),o="";i.forEach(t=>{let e=t.querySelector("a[data-for]");if(!e)return;t.classList.contains("depth-0")&&(o=e.getAttribute("data-for")||"",t.classList.add("toc-section-header")),o&&t.setAttribute("data-section",o)})}function d(){this.classList.toggle("collapsed"),this.setAttribute("aria-expanded",this.getAttribute("aria-expanded")==="true"?"false":"true");let n=this.nextElementSibling;n&&n.classList.toggle("collapsed")}function g(){let n=Array.from(document.getElementsByClassName("toc"));for(let i of n){let o=i.querySelector(".toc-header"),t=i.querySelector(".toc-content");if(!o||!t)return;o.addEventListener("click",d);let e=()=>o.removeEventListener("click",d);window.addCleanup&&window.addCleanup(e)}}function f(){g(),window.removeEventListener("scroll",a),c=null,l=null;let n=document.querySelector(".toc-content");n&&S(n),setTimeout(()=>{u()},100),window.addEventListener("scroll",a)}document.addEventListener("nav",f);document.addEventListener("render",f);\n';
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

// src/components/OverflowList.tsx
var OverflowList = ({
  children,
  ...props
}) => {
  return /* @__PURE__ */ u2("ul", { ...props, class: [props.class, "overflow"].filter(Boolean).join(" "), id: props.id, children: [
    children,
    /* @__PURE__ */ u2("li", { class: "overflow-end" })
  ] });
};
var numLists = 0;
var OverflowList_default = () => {
  const id = `list-${numLists++}`;
  return {
    OverflowList: (props) => /* @__PURE__ */ u2(OverflowList, { ...props, id }),
    overflowListAfterDOMLoaded: `
document.addEventListener("nav", (e) => {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const parentUl = entry.target.parentElement
      if (!parentUl) return
      if (entry.isIntersecting) {
        parentUl.classList.remove("gradient-active")
      } else {
        parentUl.classList.add("gradient-active")
      }
    }
  })

  const ul = document.getElementById("${id}")
  if (!ul) return

  const end = ul.querySelector(".overflow-end")
  if (!end) return

  observer.observe(end)
  const cleanup = () => observer.disconnect()
  if (window.addCleanup) {
    window.addCleanup(cleanup)
  }
})
`
  };
};

// src/util/resources.ts
function concatenateResources(...resources) {
  return resources.filter((resource) => resource !== void 0).flat();
}

// src/components/TableOfContents.tsx
var defaultOptions = {
  layout: "modern"
};
var numTocs = 0;
var TableOfContents_default = ((opts) => {
  const layout = opts?.layout ?? defaultOptions.layout;
  const { OverflowList: OverflowList2, overflowListAfterDOMLoaded } = OverflowList_default();
  const TableOfContents = (props) => {
    const { fileData, cfg } = props;
    if (!fileData?.toc) {
      return null;
    }
    const id = `toc-${numTocs++}`;
    return /* @__PURE__ */ u2("div", { class: classNames("toc"), children: [
      /* @__PURE__ */ u2(
        "button",
        {
          type: "button",
          class: fileData.collapseToc ? "collapsed toc-header" : "toc-header",
          "aria-controls": id,
          "aria-expanded": !fileData.collapseToc,
          children: [
            /* @__PURE__ */ u2("h3", { children: i18n(cfg.locale).components.tableOfContents.title }),
            /* @__PURE__ */ u2(
              "svg",
              {
                xmlns: "http://www.w3.org/2000/svg",
                width: "24",
                height: "24",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "2",
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
                class: "fold",
                children: /* @__PURE__ */ u2("polyline", { points: "6 9 12 15 18 9" })
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ u2(
        OverflowList2,
        {
          id,
          class: fileData.collapseToc ? "collapsed toc-content" : "toc-content",
          children: fileData.toc.map((tocEntry) => {
            const slug = String(tocEntry.slug);
            const depth = String(tocEntry.depth);
            const text = String(tocEntry.text);
            return /* @__PURE__ */ u2("li", { class: `depth-${depth}`, children: /* @__PURE__ */ u2("a", { href: `#${slug}`, "data-for": slug, children: text }) }, slug);
          })
        }
      )
    ] });
  };
  TableOfContents.css = toc_default;
  TableOfContents.afterDOMLoaded = concatenateResources(
    toc_inline_default,
    overflowListAfterDOMLoaded
  );
  const LegacyTableOfContents = (props) => {
    const { fileData, cfg } = props;
    if (!fileData?.toc) {
      return null;
    }
    return /* @__PURE__ */ u2("details", { class: "toc", open: !fileData.collapseToc, children: [
      /* @__PURE__ */ u2("summary", { children: /* @__PURE__ */ u2("h3", { children: i18n(cfg.locale).components.tableOfContents.title }) }),
      /* @__PURE__ */ u2("ul", { children: fileData.toc.map((tocEntry) => {
        const slug = String(tocEntry.slug);
        const depth = String(tocEntry.depth);
        const text = String(tocEntry.text);
        return /* @__PURE__ */ u2("li", { class: `depth-${depth}`, children: /* @__PURE__ */ u2("a", { href: `#${slug}`, "data-for": slug, children: text }) }, slug);
      }) })
    ] });
  };
  LegacyTableOfContents.css = legacyToc_default;
  return layout === "modern" ? TableOfContents : LegacyTableOfContents;
});

export { TableOfContents_default as TableOfContents };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map