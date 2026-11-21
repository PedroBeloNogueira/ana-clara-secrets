import type { Product } from '../types'
// DADOS DEMONSTRATIVOS — substituir pelo catálogo real (tabela products no Supabase).
const p=(i:number,name:string,family:Product['family'],intensity:Product['intensity'],price:number,extra:Partial<Product>={}):Product=>({
 id:`demo-${i}`,slug:`demo-${i}`,name,isDemo:true,price,image:'/images/rosa-'+i+'.jpg',
 description:'',category:'Perfumes',family,intensity,
 occasions:['dia a dia','encontros'],available:true,...extra})
export const DEMO_PRODUCTS:Product[]=[
 p(1,'Rosa Noturna','floral','marcante',129.9,{description:'Um floral intenso, com a doçura de pétalas de rosa em destaque.',collections:['Perfumes femininos'],bestSeller:true}),
 p(2,'Baunilha Doce','doce','moderada',99.9,{description:'A baunilha traz uma doçura cremosa, de intensidade moderada.',promoPrice:84.9,bestSeller:true}),
 p(3,'Brisa Cítrica','citrica','suave',79.9,{description:'Um aroma leve que lembra a casca de frutas cítricas recém-abertas.',isNew:true,category:'Body Splashes'}),
 p(4,'Madeira Fina','amadeirada','marcante',149.9,{description:'Uma fragrância marcante, com o aroma seco e quente da madeira.',collections:['Perfumes masculinos'],occasions:['festas','ocasiões especiais']}),
 p(5,'Jardim Fresco','fresca','suave',69.9,{description:'Um perfume suave com frescor verde, como folhas depois da chuva.',isNew:true,available:false}),
]