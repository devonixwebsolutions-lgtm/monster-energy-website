import {PRODUCTS,changePack,packCount,sanitizePack,wrapIndex,clamp,heroStage,heroKinematics} from './state.mjs';

const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const gsap=window.gsap;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile=matchMedia('(max-width:700px)').matches;
const STORAGE_KEY='monster-flavor-pack-v1';
let pack={};let carouselIndex=0;let selectedProduct=PRODUCTS[0];let heroProgress=0;let canExperience=null;let toastTimer;
try{pack=sanitizePack(JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'));}catch{pack={};}

function notify(message){
  const node=$('#toast');const host=$('dialog[open]')||document.body;host.append(node);node.textContent=message;node.classList.add('visible');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('visible'),2600);
}
function savePack(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(pack));}catch{}renderPack();}
function addToPack(id){
  const old=pack[id]||0;pack=changePack(pack,id,1);savePack();
  const p=PRODUCTS.find(p=>p.id===id);
  if(pack[id]===old){notify('Your pack already has 48 of this flavor.');return;}
  notify(`${p.name} added to your pack.`);
}
function renderPack(){
  const total=packCount(pack);$('#bag-count').textContent=total;$('#bag-total').textContent=total;
  $('#bag-button').setAttribute('aria-label',`Open my pack, ${total} ${total===1?'can':'cans'}`);
  const parent=$('#bag-items');parent.replaceChildren();
  if(total===0){
    const empty=document.createElement('div');empty.className='bag-empty';
    empty.innerHTML='<span aria-hidden="true">✳</span><p>Your pack is waiting.<br>Explore the flavors and add your favorites.</p><button class="pill-button" id="empty-explore">EXPLORE FLAVORS <span>↗</span></button>';
    parent.append(empty);$('#empty-explore').addEventListener('click',()=>{closeDialog($('#bag-dialog'));$('#flavors').scrollIntoView({behavior:reducedMotion?'instant':'smooth'});});
  }else{
    for(const p of PRODUCTS){
      if(!pack[p.id])continue;
      const row=document.createElement('div');row.className='bag-row';
      row.innerHTML=`<img src="${p.image}" alt="${p.name} can" width="250" height="625"><div class="bag-row-main"><h3>${p.name.toUpperCase()}</h3><p>16 FL OZ / ${p.caffeine} MG CAFFEINE</p><div class="qty-stepper"><button data-qty="-1" data-id="${p.id}" aria-label="Remove one ${p.name} can">−</button><span>${pack[p.id]}</span><button data-qty="1" data-id="${p.id}" aria-label="Add one ${p.name} can">+</button></div></div>`;
      parent.append(row);
    }
  }
  $('#clear-pack').hidden=total===0;
}
function openDialog(dialog){
  if(dialog.open)return;
  for(const other of $$('dialog[open]'))closeDialog(other);
  document.body.classList.add('dialog-open');dialog.showModal();
}
function closeDialog(dialog){const toast=$('#toast',dialog);if(toast)document.body.append(toast);dialog.close();document.body.classList.remove('dialog-open');}
for(const dialog of $$('dialog')){
  dialog.addEventListener('close',()=>{const toast=$('#toast',dialog);if(toast)document.body.append(toast);if(!$$('dialog[open]').length)document.body.classList.remove('dialog-open');});
  dialog.addEventListener('click',e=>{
    if(e.target!==dialog)return;
    const r=dialog.getBoundingClientRect();
    if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(dialog);
  });
}
for(const button of $$('[data-close]'))button.addEventListener('click',()=>closeDialog(document.getElementById(button.dataset.close)));
$('#menu-button').addEventListener('click',()=>openDialog($('#menu-dialog')));
$('#bag-button').addEventListener('click',()=>{renderPack();openDialog($('#bag-dialog'));});
for(const link of $$('.menu-nav a'))link.addEventListener('click',()=>closeDialog($('#menu-dialog')));
$('#bag-items').addEventListener('click',event=>{
  const button=event.target.closest('[data-qty]');if(!button)return;
  const id=button.dataset.id;const delta=Number(button.dataset.qty);
  const old=pack[id];pack=changePack(pack,id,delta);savePack();
  if(delta>0&&pack[id]===old)notify('Your pack already has 48 of this flavor.');
  const nextButton=$(`[data-id="${id}"][data-qty="${delta}"]`,$('#bag-items'));nextButton?.focus();
});
$('#clear-pack').addEventListener('click',()=>{pack={};savePack();notify('Your pack has been cleared.');});

function openProduct(id){
  const p=PRODUCTS.find(p=>p.id===id);if(!p)return;selectedProduct=p;
  $('#product-title').textContent=p.name.toUpperCase();$('#product-description').textContent=p.description;
  $('#product-image').src=p.image;$('#product-image').alt=`Monster ${p.name} can`;
  $('#product-category').textContent=p.category;$('#product-short').textContent=p.short;
  $('#product-caffeine').textContent=`${p.caffeine} MG`;$('#product-calories').textContent=p.calories;
  $('#product-flavor').textContent=p.flavor;$('#official-product').href=p.url;
  openDialog($('#product-dialog'));
}
for(const button of $$('[data-product]'))button.addEventListener('click',()=>openProduct(button.dataset.product));
$('#add-product').addEventListener('click',()=>addToPack(selectedProduct.id));

function showSlide(index){
  carouselIndex=wrapIndex(index);const p=PRODUCTS[carouselIndex];
  const image=$('#carousel-can');
  if(gsap&&!reducedMotion){gsap.killTweensOf(image);gsap.fromTo(image,{opacity:0,x:20,rotation:5},{opacity:1,x:0,rotation:-9,duration:.55,ease:'power3.out'});}
  image.src=p.image;image.alt=`Monster ${p.name} can`;
  $('#carousel-title').textContent=p.name.toUpperCase();$('#carousel-category').textContent=p.category;
  $('#carousel-number').textContent=`0${carouselIndex+1} / 03`;$('#carousel-word').textContent=p.short;
  for(const button of $$('[data-slide]')){const active=Number(button.dataset.slide)===carouselIndex;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));}
}
$('#prev-product').addEventListener('click',()=>showSlide(carouselIndex-1));
$('#next-product').addEventListener('click',()=>showSlide(carouselIndex+1));
for(const button of $$('[data-slide]'))button.addEventListener('click',()=>showSlide(Number(button.dataset.slide)));
$('#add-carousel').addEventListener('click',()=>addToPack(PRODUCTS[carouselIndex].id));
$('.pack-carousel').addEventListener('keydown',e=>{if(e.key==='ArrowRight'){showSlide(carouselIndex+1);e.preventDefault();}if(e.key==='ArrowLeft'){showSlide(carouselIndex-1);e.preventDefault();}});
let touchStart=null;
$('.carousel-stage').addEventListener('touchstart',e=>{touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
$('.carousel-stage').addEventListener('touchend',e=>{if(!touchStart)return;const dx=e.changedTouches[0].clientX-touchStart.x;const dy=e.changedTouches[0].clientY-touchStart.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)showSlide(carouselIndex+(dx<0?1:-1));touchStart=null;},{passive:true});
renderPack();

const hero=$('#origin');const fallback=$('#can-fallback');
function updateHeroProgress(progress){
  heroProgress=clamp(progress);const stage=heroStage(heroProgress);
  $('#stage-label').textContent=stage.label;$('#stage-number').textContent=stage.number;
  $('#stage-fill').style.transform=`scaleX(${.08+.92*heroProgress})`;
  canExperience?.setProgress(heroProgress);
  if(!canExperience){
    const state=heroKinematics(heroProgress);
    const scale=state.scale/1.12;
    fallback.style.transform=`translate(-50%,-50%) translateX(${state.x*($('#can-stage').clientHeight/5.1)}px) rotate(${state.rz*180/Math.PI}deg) scale(${scale})`;
  }
}

function setupMotion(){
  gsap.registerPlugin(window.ScrollTrigger);
  const tl=gsap.timeline({defaults:{ease:'none'},onUpdate(){updateHeroProgress(this.progress());},scrollTrigger:{trigger:hero,start:'top top',end:'bottom bottom',scrub:.65,invalidateOnRefresh:true}});
  tl.to({value:0},{value:1,duration:100},0);
  tl.to('.hero-title-left,.hero-title-right',{yPercent:-155,opacity:0,duration:13},6);
  tl.to('.hero-eyebrow,.hero-description,.intro-annotation,.beast-stamp,.hero-scratch',{y:-55,opacity:0,duration:12},7);
  tl.fromTo('.coin-caffeine',{scale:.45,autoAlpha:0,y:-130,rotation:-42},{scale:1,autoAlpha:1,y:0,rotation:-18,duration:9},20);
  tl.fromTo('.coin-size',{scale:.45,autoAlpha:0,x:190,rotation:50},{scale:1,autoAlpha:1,x:0,rotation:17,duration:10},25);
  tl.fromTo('.coin-original',{scale:.45,autoAlpha:0,y:150,rotation:-36},{scale:1,autoAlpha:1,y:0,rotation:8,duration:10},31);
  tl.to('.fact-coin',{autoAlpha:0,scale:.35,y:-100,rotation:45,duration:9,stagger:2.5},48);
  tl.to('.hero-product',{autoAlpha:1,duration:7},67);
  tl.fromTo('.hero-product-copy',{y:50},{y:0,duration:9},67);
  tl.fromTo('.product-side-note',{y:45},{y:0,duration:8},69);
  tl.to('.hero-product',{autoAlpha:0,y:-65,duration:7},87);
  tl.fromTo('.keep-going',{y:50,autoAlpha:0},{y:0,autoAlpha:1,duration:7},88);
  tl.to('.keep-going',{y:-80,autoAlpha:0,duration:5},95);
  tl.to('.can-shadow',{scaleX:.6,opacity:.3,duration:22},20);
  tl.to('.can-shadow',{scaleX:1,opacity:.75,duration:22},55);

  gsap.fromTo('.manifesto-title .line-mask>span',{yPercent:115},{yPercent:0,stagger:.12,ease:'power2.out',scrollTrigger:{trigger:'.manifesto-title',start:'top 88%',end:'top 28%',scrub:.8}});
  gsap.to('.manifesto-coin',{rotation:45,ease:'none',scrollTrigger:{trigger:'.manifesto',start:'top bottom',end:'bottom top',scrub:1}});
  gsap.to('.can-doodle-left',{y:-75,rotation:-18,ease:'none',scrollTrigger:{trigger:'.manifesto',start:'top bottom',end:'bottom top',scrub:1}});
  gsap.to('.can-doodle-right',{y:65,rotation:46,ease:'none',scrollTrigger:{trigger:'.manifesto',start:'top bottom',end:'bottom top',scrub:1}});
  gsap.to('.collection-star',{rotation:360,ease:'none',scrollTrigger:{trigger:'#flavors',start:'top bottom',end:'bottom top',scrub:1}});
  gsap.fromTo('.flavor-card',{y:100,rotationX:8,opacity:.4,transformPerspective:1000},{y:0,rotationX:0,opacity:1,stagger:.12,ease:'power2.out',scrollTrigger:{trigger:'.flavor-grid',start:'top 92%',end:'top 34%',scrub:.65}});

  const world=gsap.timeline({scrollTrigger:{trigger:'#world',start:'top top',end:'bottom bottom',scrub:.8,invalidateOnRefresh:true},defaults:{ease:'none'}});
  world.to('.world-title',{y:()=>-innerHeight*.27,opacity:.18,duration:1.7},0);
  world.fromTo('.photo-one',{y:()=>innerHeight*.4,rotation:-19},{y:()=>-innerHeight*.65,rotation:-8,duration:1.8},0);
  world.fromTo('.photo-two',{y:()=>innerHeight*.42,rotation:14},{y:()=>-innerHeight*.60,rotation:3,duration:1.8},.15);
  world.fromTo('.photo-three',{y:()=>innerHeight*.5,rotation:22},{y:()=>-innerHeight*.64,rotation:12,duration:1.8},.3);
  world.fromTo('.world-copy,.world-stamp',{opacity:0,y:30},{opacity:1,y:0,duration:.7},.4);

  for(const node of $$('.reveal'))gsap.fromTo(node,{y:65,opacity:.3},{y:0,opacity:1,ease:'power2.out',scrollTrigger:{trigger:node,start:'top 94%',end:'top 66%',scrub:.65}});
  gsap.fromTo('.footer-word',{yPercent:40},{yPercent:0,ease:'none',scrollTrigger:{trigger:'.site-footer',start:'top 80%',end:'bottom bottom',scrub:.6}});
  window.ScrollTrigger.refresh();
}

let scrollQueued=false;
function updateScroll(){
  scrollQueued=false;
  const green=$('#flavors').getBoundingClientRect();const footer=$('.site-footer').getBoundingClientRect();
  $('#header').classList.toggle('on-green',(green.top<75&&green.bottom>75)||(footer.top<75&&footer.bottom>75));
  if(!gsap || !window.ScrollTrigger){
    const rect=hero.getBoundingClientRect();const p=clamp(-rect.top/(hero.offsetHeight-innerHeight));updateHeroProgress(p);
    if(!reducedMotion){
      $('.hero-intro').style.opacity=1-clamp((p-.06)/.13);
      const facts=$$('.fact-coin');for(let i=0;i<facts.length;i++)facts[i].style.opacity=(p>.2+i*.05&&p<.55)?'1':'0';
      $('.hero-product').style.opacity=(p>.66&&p<.88)?'1':'0';
      $('.hero-product').style.visibility=(p>.66&&p<.88)?'visible':'hidden';
      $('.keep-going').style.opacity=(p>.89&&p<.98)?'1':'0';
    }
  }
}
window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateScroll);}},{passive:true});
window.addEventListener('resize',updateScroll,{passive:true});
if(gsap&&window.ScrollTrigger&&!reducedMotion)setupMotion();
updateScroll();

async function initializeModel(){
  if(reducedMotion||(navigator.deviceMemory&&navigator.deviceMemory<3))return;
  try{
    const {createCanExperience}=await import('./can.mjs');
    canExperience=await createCanExperience($('#can-stage'),hero,{mobile});
    canExperience.setProgress(heroProgress);
  }catch(error){
    // The authentic can image remains visible when WebGL or its module is unavailable.
    console.info('Using the product-image presentation.');
  }
}
initializeModel();

async function finishLoading(){
  const delay=new Promise(resolve=>setTimeout(resolve,900));
  const ready=Promise.allSettled([document.fonts.ready,fallback.decode?.()||Promise.resolve()]);
  await Promise.all([delay,Promise.race([ready,new Promise(resolve=>setTimeout(resolve,1900))])]);
  const loader=$('#loader');if(!loader)return;
  if(gsap&&!reducedMotion)gsap.to(loader,{yPercent:-100,duration:.65,ease:'power3.inOut',onComplete:()=>loader.remove()});else loader.remove();
  window.ScrollTrigger?.refresh();
}
finishLoading();
window.addEventListener('pageshow',e=>{if(e.persisted){window.ScrollTrigger?.refresh();updateScroll();}});
