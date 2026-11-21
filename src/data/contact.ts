export const storeContact = {
  whatsapp: import.meta.env.VITE_WHATSAPP_FALLBACK?.replace(/\D/g, '') || '559691990583',
  instagram: instagramUrl(import.meta.env.VITE_INSTAGRAM_URL),
  hours: import.meta.env.VITE_SERVICE_HOURS?.trim(),
  delivery: import.meta.env.VITE_DELIVERY_INFO?.trim(),
}

export const contactMessage = 'Olá, Clara! Conheci a Ana Clara’s Secret pelo site e gostaria de saber mais sobre os perfumes disponíveis.'

function instagramUrl(value?: string) {
  try {
    const url = new URL(value?.trim() ?? '')
    if (url.protocol === 'https:' && ['instagram.com', 'www.instagram.com'].includes(url.hostname)
      && url.pathname.replace(/\//g, '') && !url.username && !url.password && !url.port) return url.href
  } catch {
    return undefined
  }
}
