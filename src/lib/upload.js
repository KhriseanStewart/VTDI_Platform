import { supabase } from './supabase'

function extension(file) {
  const fromName = file.name?.split('.').pop()?.toLowerCase()
  if (fromName && fromName.length <= 5) return fromName
  const type = file.type?.split('/')[1]
  return type || 'jpg'
}

/**
 * Upload a file to the public `media` storage bucket.
 * @returns {Promise<string>} public URL
 */
export async function uploadMedia(file, pathPrefix = 'places') {
  if (!file) throw new Error('No file selected')
  const safePrefix = String(pathPrefix || 'places').replace(/[^a-z0-9/_-]/gi, '')
  const path = `${safePrefix}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension(file)}`

  const { error } = await supabase.storage.from('media').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  })
  if (error) throw error

  const { data } = supabase.storage.from('media').getPublicUrl(path)
  if (!data?.publicUrl) throw new Error('Could not get public URL for upload')
  return data.publicUrl
}
