import * as THREE from './assets/three.module.js';
import {heroKinematics} from './state.mjs';

function loadImage(src){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=src;});}

function makeLabel(image){
  const size=2048;const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#10100f';ctx.fillRect(0,0,size,size);
  // Map the photographic front to a half-cylinder; the back is a designed label continuation.
  const sy=image.height*.12;const sh=image.height*.81;
  for(let x=size*.25;x<size*.75;x++){
    const angle=((x/size)-.5)*Math.PI*2;
    const sourceX=image.width/2+Math.sin(angle)*(image.width*.47);
    ctx.drawImage(image,Math.max(0,Math.min(image.width-1,sourceX)),sy,1,sh,x,0,1,size);
  }
  ctx.fillStyle='#bfc3b7';ctx.font='22px Arial';
  for(let i=0;i<26;i++){
    const y=250+i*38;ctx.fillText(i===0?'MONSTER ENERGY':i%4===0?'THE ORIGINAL. UNLEASH THE BEAST.':'MONSTER ENERGY · ORIGINAL GREEN',38,y);
    if(i<20)ctx.fillRect(1610,y,320-i%3*24,2);
  }
  ctx.save();ctx.translate(1890,1420);ctx.rotate(-Math.PI/2);ctx.fillStyle='#9bdf32';ctx.font='bold 66px Arial';ctx.fillText('MONSTER ENERGY',0,0);ctx.restore();
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
  return texture;
}

function buildCan(texture){
  const group=new THREE.Group();const body=new THREE.Group();group.add(body);
  const metal=new THREE.MeshStandardMaterial({color:0xd3d6cf,metalness:.78,roughness:.29});
  const darkMetal=new THREE.MeshStandardMaterial({color:0x292d25,metalness:.73,roughness:.32});
  const labelMaterial=new THREE.MeshStandardMaterial({map:texture,metalness:.12,roughness:.4});
  const radius=.60;const h=2.82;
  const labelGeometry=new THREE.CylinderGeometry(radius,radius,h,96,1,true);labelGeometry.rotateY(Math.PI);
  const label=new THREE.Mesh(labelGeometry,labelMaterial);body.add(label);
  const shoulder=new THREE.Mesh(new THREE.CylinderGeometry(.52,.60,.17,96,1,true),darkMetal);shoulder.position.y=1.495;body.add(shoulder);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.60,.53,.14,96,1,true),metal);base.position.y=-1.48;body.add(base);
  const foot=new THREE.Mesh(new THREE.CylinderGeometry(.535,.535,.027,96),metal);foot.position.y=-1.555;body.add(foot);
  function ring(r,t,y,material,parent){const mesh=new THREE.Mesh(new THREE.TorusGeometry(r,t,8,96),material);mesh.rotation.x=Math.PI/2;mesh.position.y=y;parent.add(mesh);return mesh;}
  ring(.535,.025,-1.55,metal,body);ring(.585,.014,-1.42,metal,body);ring(.52,.024,1.587,metal,body);
  const inner=new THREE.Mesh(new THREE.CylinderGeometry(.49,.49,.12,72,1,false),new THREE.MeshStandardMaterial({color:0x24340c,metalness:.15,roughness:.6}));inner.position.y=1.50;body.add(inner);
  const liquid=new THREE.Mesh(new THREE.CircleGeometry(.485,72),new THREE.MeshStandardMaterial({color:0x9aad35,metalness:.3,roughness:.16}));liquid.rotation.x=-Math.PI/2;liquid.position.y=1.515;body.add(liquid);
  const cap=new THREE.Group();cap.position.y=1.588;group.add(cap);
  const lid=new THREE.Mesh(new THREE.CylinderGeometry(.513,.513,.026,96),metal);cap.add(lid);
  ring(.502,.018,.018,metal,cap);ring(.438,.008,.02,darkMetal,cap);ring(.461,.006,.023,metal,cap);
  const opening=new THREE.Mesh(new THREE.CircleGeometry(.13,40),darkMetal);opening.rotation.x=-Math.PI/2;opening.position.set(0,.022,-.22);opening.scale.set(1,1.5,1);cap.add(opening);
  const tabMaterial=new THREE.MeshStandardMaterial({color:0x7eae23,metalness:.55,roughness:.25});
  const tab=new THREE.Mesh(new THREE.TorusGeometry(.105,.036,8,40),tabMaterial);tab.rotation.x=Math.PI/2;tab.position.set(0,.071,.09);tab.scale.set(1,1,1.6);cap.add(tab);
  const bridge=new THREE.Mesh(new THREE.BoxGeometry(.125,.025,.13),tabMaterial);bridge.position.set(0,.064,-.03);cap.add(bridge);
  const rivet=new THREE.Mesh(new THREE.SphereGeometry(.034,16,8),metal);rivet.scale.y=.4;rivet.position.set(0,.065,-.067);cap.add(rivet);
  // Condensation catches the studio light without an expensive transmission material.
  const waterMaterial=new THREE.MeshPhysicalMaterial({color:0xc1d3ab,metalness:.2,roughness:.05,transparent:true,opacity:.22,clearcoat:1});
  const droplets=new THREE.InstancedMesh(new THREE.SphereGeometry(1,6,5),waterMaterial,72);
  const dummy=new THREE.Object3D();
  for(let i=0;i<72;i++){
    const a=i*2.3999632297;const y=((i*.61803398875)%1)*2.55-1.28;const r=.008+(i%7)*.0015;
    dummy.position.set(Math.sin(a)*.608,y,Math.cos(a)*.608);dummy.scale.set(r,r*1.45,r*.65);dummy.rotation.y=a;dummy.updateMatrix();droplets.setMatrixAt(i,dummy.matrix);
  }
  body.add(droplets);
  return {group,cap};
}

export async function createCanExperience(container,hero,{mobile=false}={}){
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.4:1.75));
  renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
  const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(30,1,.1,100);camera.position.set(0,.08,9.5);
  scene.add(new THREE.AmbientLight(0xffffff,1.9));
  const key=new THREE.DirectionalLight(0xf2f5e5,3.4);key.position.set(-3,5,6);scene.add(key);
  const fill=new THREE.DirectionalLight(0xb5d58f,1.9);fill.position.set(5,1,3);scene.add(fill);
  const rim=new THREE.DirectionalLight(0x85e532,4);rim.position.set(-2,3,-3);scene.add(rim);
  const soft=new THREE.DirectionalLight(0xffffff,1.7);soft.position.set(0,-3,5);scene.add(soft);
  const image=await loadImage('assets/original.png');const label=makeLabel(image);label.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  const can=buildCan(label);scene.add(can.group);container.append(renderer.domElement);
  let progress=0;let active=false;let raf=0;let pointerX=0;let pointerY=0;let lastTime=0;
  const current=heroKinematics(0);const target=heroKinematics(0);
  const resize=()=>{const width=container.clientWidth,height=container.clientHeight;if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();};
  resize();const resizer=new ResizeObserver(resize);resizer.observe(container);
  function frame(time){
    if(!active || document.hidden){raf=0;return;}
    const delta=Math.min(.06,Math.max(.001,(time-lastTime)/1000||.016));lastTime=time;
    const factor=1-Math.exp(-10*delta);
    for(const key of Object.keys(current))current[key]+=(target[key]-current[key])*factor;
    const float=Math.sin(time*.001)*.022;
    can.group.rotation.set(current.rx+pointerY*.035,current.ry+pointerX*.075,current.rz);
    can.group.position.set(current.x,current.y+float,0);
    can.group.scale.setScalar(current.scale*(mobile ? .82 : 1));
    can.cap.position.y=1.588+current.lidLift;can.cap.rotation.set(current.lidTilt,0,current.lidLift*.15);
    renderer.render(scene,camera);raf=requestAnimationFrame(frame);
  }
  function start(){if(active&&!raf&&!document.hidden){lastTime=performance.now();raf=requestAnimationFrame(frame);}}
  const visibility=new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(active)start();else if(raf){cancelAnimationFrame(raf);raf=0;}},{rootMargin:'100px'});visibility.observe(hero);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else start();});
  hero.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;pointerX=(e.clientX/innerWidth-.5)*2;pointerY=(e.clientY/innerHeight-.5)*2;},{passive:true});
  hero.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;});
  Object.assign(target,heroKinematics(progress));
  can.group.rotation.set(current.rx,current.ry,current.rz);can.group.scale.setScalar(current.scale*(mobile ? .82 : 1));
  renderer.render(scene,camera);container.classList.add('model-ready');
  return {setProgress(p){progress=p;Object.assign(target,heroKinematics(progress));},dispose(){active=false;cancelAnimationFrame(raf);visibility.disconnect();resizer.disconnect();scene.traverse(node=>{node.geometry?.dispose();if(node.material){for(const material of Array.isArray(node.material)?node.material:[node.material])material.dispose();}});label.dispose();renderer.dispose();renderer.domElement.remove();container.classList.remove('model-ready');}};
}
