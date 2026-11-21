import { useEffect } from 'react'
import { BRAND_NAME } from '../data/brand'

export default function PageMeta({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    document.title = title + ' | ' + BRAND_NAME
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
  }, [title, description])
  return null
}
