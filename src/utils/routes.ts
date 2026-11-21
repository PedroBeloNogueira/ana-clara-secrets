export const productPath = (slug: string) => '/produto/' + encodeURIComponent(slug)
export const buyNowPath = (slug: string) => '/checkout?produto=' + encodeURIComponent(slug)
