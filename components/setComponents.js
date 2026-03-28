import { footer } from './footer.js'
import { header } from './header.js'

const components = {
  '#header': header,
  '.footer': footer,
}

export function setComponents() {
  for (const [queryString, getHTML] of Object.entries(components)) {
    const el = document.querySelector(queryString)
    if (el) el.innerHTML = getHTML()
  }
}
