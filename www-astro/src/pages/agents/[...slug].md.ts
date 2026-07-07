const markdownFiles = import.meta.glob('../../../docs/agent/**/*.agent.md', {
  query: '?raw',
  import: 'default',
})

export async function getStaticPaths() {
  return Object.keys(markdownFiles).map((filePath) => {
    const relative = filePath.split('/docs/agent/')[1].replace(/\.agent\.md$/, '')
    const slug = `agents/${relative}`

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
