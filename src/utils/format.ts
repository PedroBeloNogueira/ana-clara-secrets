export const brl=(n:number)=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
export const priceOf=(p:{price:number;promoPrice?:number|null})=>p.promoPrice!=null&&p.promoPrice<p.price?p.promoPrice:p.price
