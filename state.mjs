export const PRODUCTS = Object.freeze([
  {id:'original',name:'Original Green',short:'OG',category:'THE ORIGINAL',image:'assets/original.png',caffeine:160,calories:230,flavor:'Sweet and salty. Classic Monster flavor.',description:'The familiar black can and green claw. Original Green brings the classic sweet and salty Monster taste that started it all.',url:'https://www.monsterenergy.com/en-us/energy-drinks/monster-energy/original-green/'},
  {id:'zero',name:'Zero Sugar',short:'ZERO',category:'ALL MONSTER. ZERO SUGAR.',image:'assets/zero-sugar.png',caffeine:160,calories:10,flavor:'Sweet and salty, with zero sugar.',description:'The original Monster flavor, with zero sugar. An unmistakable black and green can with a green lid makes this icon easy to spot.',url:'https://www.monsterenergy.com/en-us/energy-drinks/monster-energy/zero-sugar/'},
  {id:'ultra',name:'Ultra Paradise',short:'ULTRA',category:'A DIFFERENT KIND OF WILD',image:'assets/ultra-paradise.png',caffeine:150,calories:10,flavor:'Kiwi and apple, with hints of cucumber and lime.',description:'A green can with a different personality. Ultra Paradise combines kiwi and apple flavors with refreshing cucumber and lime notes, all with zero sugar.',url:'https://www.monsterenergy.com/en-us/energy-drinks/zero-sugar/ultra-paradise/'}
]);
export const clamp=(n,min=0,max=1)=>Math.min(max,Math.max(min,Number.isFinite(n)?n:min));
export const wrapIndex=(n)=>((n%PRODUCTS.length)+PRODUCTS.length)%PRODUCTS.length;
export function sanitizePack(value){
  const output={};
  if(!value || typeof value!=='object' || Array.isArray(value))return output;
  for(const p of PRODUCTS){const n=Number(value[p.id]);if(Number.isFinite(n)&&n>=1)output[p.id]=Math.floor(clamp(n,0,48));}
  return output;
}
export function changePack(pack,id,delta){
  const next=sanitizePack(pack);
  if(!PRODUCTS.some(p=>p.id===id))return next;
  const count=Math.floor(clamp((next[id]||0)+delta,0,48));
  if(count>0)next[id]=count;else delete next[id];
  return next;
}
export const packCount=(pack)=>Object.values(sanitizePack(pack)).reduce((a,b)=>a+b,0);
const KEYFRAMES=[
  [0,[-.12,0,-.16,0,-.04,1.12,0,0]],
  [.15,[-.2,1.1,.14,0,.03,1.08,0,0]],
  [.28,[.54,Math.PI*2,-.07,0,-.18,.93,.84,-.48]],
  [.42,[.76,Math.PI*2+.6,-.12,0,-.15,.91,.96,-.6]],
  [.56,[.1,Math.PI*3,.14,0,0,1.04,.03,0]],
  [.68,[-.1,Math.PI*4,-.08,.36,0,1.13,0,0]],
  [.83,[.08,Math.PI*4+.12,-.1,.45,.03,1.13,0,0]],
  [.95,[-.1,Math.PI*5+.65,.11,.02,.05,1,0,0]],
  [1,[-.16,Math.PI*6,-.17,0,.08,.95,0,0]]
];
export function heroKinematics(progress){
  const p=clamp(progress);let first=KEYFRAMES[0],second=KEYFRAMES[1];
  for(let i=1;i<KEYFRAMES.length;i++){second=KEYFRAMES[i];first=KEYFRAMES[i-1];if(p<=second[0])break;}
  const t=clamp((p-first[0])/(second[0]-first[0]));const eased=t*t*(3-2*t);
  const values=first[1].map((v,i)=>v+(second[1][i]-v)*eased);
  const [rx,ry,rz,x,y,scale,lidLift,lidTilt]=values;
  return {rx,ry,rz,x,y,scale,lidLift,lidTilt};
}
export function heroStage(progress){
  const p=clamp(progress);
  if(p<.17)return {number:'001',label:'THE ORIGINAL'};
  if(p<.45)return {number:'002',label:'CRACK IT OPEN'};
  if(p<.65)return {number:'003',label:'UNLEASHED'};
  if(p<.88)return {number:'004',label:'ORIGINAL GREEN'};
  return {number:'005',label:'KEEP GOING'};
}
