export const brl=(n:number)=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
export const priceOf = (p: { price: number; promoPrice?: number | null }) =>
  p.promoPrice != null && Number.isFinite(p.promoPrice) && p.promoPrice >= 0 && p.promoPrice < p.price
    ? p.promoPrice : p.price

export const onSale = (p: { price: number; promoPrice?: number | null; isDemo?: boolean }) =>
  !p.isDemo && priceOf(p) < p.price
