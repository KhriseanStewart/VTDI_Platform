function tagify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 18)
}

export function reelHandle(name) {
  const slug = tagify(name)
  return slug ? `@${slug}` : '@outyah'
}

export function reelHashtags(parts) {
  const seen = new Set()
  const tags = []
  for (const part of parts || []) {
    const tag = tagify(part)
    if (!tag || seen.has(tag)) continue
    seen.add(tag)
    tags.push(`#${tag}`)
    if (tags.length >= 4) break
  }
  return tags
}

export async function shareReel(title, path) {
  const url = `${window.location.origin}${path}`
  try {
    if (navigator.share) {
      await navigator.share({ title, url })
      return
    }
  } catch {
    return
  }
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    /* ignore */
  }
}
