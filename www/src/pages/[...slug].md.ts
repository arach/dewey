const markdownFiles = import.meta.glob('../../docs/**/*.md', { as: 'raw' })
const excludePatterns = ['/docs/agent/', '.agent.md', '/docs/AGENTS.md']

export async function getStaticPaths() {
  return Object.keys(markdownFiles)
    .filter((filePath) => !excludePatterns.some((pattern) => filePath.includes(pattern)))
    .map((filePath) => {
      const relative = filePath.split('/docs/')[1].replace(/\.md$/, '')
      const slug = `docs/${relative}`

      return {
        params: { slug },
        props: { filePath },
      }
    })
}

export async function GET({ props }) {
  const loader = markdownFiles[props.filePath]
  const content = loader ? await loader() : ''

  return new Response(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  })
}
