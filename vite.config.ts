import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { BRAND_NAME } from './src/data/brand'
export default defineConfig({ plugins: [react(), {
  name:'store-brand', transformIndexHtml: html => html.replaceAll('__BRAND_NAME__', BRAND_NAME)
}] })