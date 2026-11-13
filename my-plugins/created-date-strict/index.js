export default function CreatedDateStrict() {
  return {
    name: "CreatedDateStrict",
    markdownPlugins() {
      return [
        () => (_tree, file) => {
          const data = file.data
          if (!data.frontmatter?.created && data.dates) {
            data.dates.created = undefined
          }
        },
      ]
    },
  }
}
