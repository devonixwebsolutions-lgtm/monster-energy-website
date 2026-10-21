import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {PRODUCTS,changePack,sanitizePack,packCount,wrapIndex,heroKinematics,heroStage} from '../state.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=root;
const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const css=fs.readFileSync(path.join(dist,'styles.css'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,'IDs must be unique');
let assets=0;
for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  const value=match[1];
  if(value.startsWith('#'))assert(ids.includes(value.slice(1)),`Missing anchor ${value}`);
  else if(!/^[a-z]+:/.test(value)){assert(fs.existsSync(path.join(dist,value)),`Missing local asset ${value}`);assets++;}
}
const assetCss=css.replace(/url\("data:[^"]*"\)/g,'');
for(const match of assetCss.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)){
  if(match[1].startsWith('data:'))continue;
  assert(fs.existsSync(path.join(dist,match[1])),`Missing CSS asset ${match[1]}`);assets++;
}
for(const product of PRODUCTS){
  assert(fs.existsSync(path.join(dist,product.image)));
  assert(html.includes(`data-product="${product.id}"`));
  assert(product.url.startsWith('https://www.monsterenergy.com/en-us/'));
}
assert(css.includes('prefers-reduced-motion:reduce'));
assert(css.includes('@media(max-width:700px)'));
assert(!html.includes('/store-locator/'),'Retailer links must use the verified URL');
assert(html.includes('INDEPENDENT DESIGN CONCEPT BY DEVONIX'));

// Reloaded or corrupted browser storage cannot create invalid products or counts.
assert.deepEqual(sanitizePack(null),{});
assert.deepEqual(sanitizePack({original:-5,zero:'2',ultra:999,unknown:7}),{zero:2,ultra:48});
assert.deepEqual(sanitizePack(['original']),{});
let pack={};pack=changePack(pack,'original',1);pack=changePack(pack,'zero',2);
assert.equal(packCount(pack),3);
assert.deepEqual(sanitizePack(JSON.parse(JSON.stringify(pack))),pack);
const prior={...pack};pack=changePack(pack,'original',-1);assert.equal(packCount(pack),2);
assert.equal(prior.original,1,'Changing a pack must not mutate the previous state');
pack=changePack(pack,'zero',-2);assert.deepEqual(pack,{});
for(let i=0;i<60;i++)pack=changePack(pack,'ultra',1);
assert.equal(pack.ultra,48);assert.equal(packCount(pack),48);
assert.deepEqual(changePack(pack,'unknown',1),pack);
assert.equal(wrapIndex(-1),2);assert.equal(wrapIndex(3),0);

// The can opens during the fact scene, closes for the product reveal, and remains reversible.
assert(heroKinematics(.4).lidLift>.8);
assert.equal(heroKinematics(.8).lidLift,0);
assert.equal(heroKinematics(1).lidLift,0);
assert(heroKinematics(1).ry>Math.PI*5);
let previous=heroKinematics(0);
for(let i=1;i<=1000;i++){
  const forward=heroKinematics(i/1000);const reverse=heroKinematics(i/1000);
  assert.deepEqual(forward,reverse);
  for(const [key,value] of Object.entries(forward)){
    assert(Number.isFinite(value),`Invalid can transform ${key}`);
    assert(Math.abs(value-previous[key])<.15,`Discontinuous can transform ${key}`);
  }
  previous=forward;
}
assert.equal(heroStage(0).number,'001');assert.equal(heroStage(1).number,'005');
const model=await import('../can.mjs');assert.equal(typeof model.createCanExperience,'function');
console.log(`Passed: ${assets} local asset references, navigation anchors, product data, pack lifecycle, carousel wrapping, reversible can motion, and the Three.js module graph.`);
