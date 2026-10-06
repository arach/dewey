import { createRoot } from 'react-dom/client'
import { FreshDocs, type RendererData } from './renderer'

const element = document.getElementById('dewey-root')
const payload = document.getElementById('dewey-data')
if (!element || !payload?.textContent) throw new Error('Missing Dewey site bootstrap')
const data: RendererData = JSON.parse(payload.textContent)
// Static DocsApp HTML works without JS. Mount the same app with persisted browser preferences.
// A client mount avoids light/dark hydration mismatches in the library provider.
createRoot(element).render(<FreshDocs data={data} />)
