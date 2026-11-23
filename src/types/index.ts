export interface Product{id:string;slug:string;name:string;isDemo?:boolean;brand?:string;volumeMl?:number;price:number;promoPrice?:number|null;
 image:string;images?:string[];notes?:string[];description:string;category:string;collections?:string[];family?:string;
 intensity?:'suave'|'moderada'|'marcante';occasions:string[];available?:boolean;isNew?:boolean;bestSeller?:boolean;stock?:number;featured?:boolean}
export interface CartItem{productId:string;qty:number}
export type Delivery='Retirada'|'Entrega'