export interface Product{id:string;slug:string;name:string;isDemo?:boolean;brand?:string;volumeMl?:number;price:number;promoPrice?:number|null;
 image:string;description:string;category:string;collections?:string[];family:'doce'|'floral'|'fresca'|'citrica'|'amadeirada';
 intensity:'suave'|'moderada'|'marcante';occasions:string[];available:boolean;isNew?:boolean;bestSeller?:boolean}
export interface CartItem{productId:string;qty:number}
export type Delivery='Retirada'|'Entrega'