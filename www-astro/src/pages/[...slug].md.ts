const markdownFiles = import.meta.glob('../../docs/**/*.md', {
  query: '?raw',
  import: 'default',
})

export async function getStaticPaths() {
  return Object.keys(markdownFiles).map((filePath) => {
    const slug = filePath.split('/docs/')[1].replace(/\.md$/, '')

    return {
      params: { slug: `docs/${slug}` },
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
