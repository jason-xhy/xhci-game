'use strict';

const yardHoists = [];
const reducedYardMotion = matchMedia('(prefers-reduced-motion: reduce)');

function updateFreightYard(time) {
 if (reducedYardMotion.matches) return;
 for (const [index, hoist] of yardHoists.entries()) hoist.position.x = Math.sin(time * .23 + index) * 2.7;
}

function wetEdgeMask(seed) {
 const canvas = document.createElement('canvas');
 canvas.width = canvas.height = 96;
 const context = canvas.getContext('2d');
 const mask = context.createImageData(96,96);
 for (let row = 0; row < 96; row++) {
  for (let column = 0; column < 96; column++) {
   const x = (column-48)/47;
   const y = (row-48)/47;
   const angle = Math.atan2(y,x);
   const shore = .80+.10*Math.sin(3*angle+seed)+.066*Math.cos(7*angle-seed)+.036*Math.sin(12*angle+seed);
   const feather = .098+.038*Math.cos(5*angle+seed);
   const coverage = Math.min(1,Math.max(0,(shore-Math.hypot(x,y))/feather));
   const offset = (row*96+column)*4;
   const value = 255*coverage*coverage*(3-2*coverage);
   mask.data.set([value,value,value,255],offset);
  }
 }
 context.putImageData(mask,0,0);
 return new THREE.CanvasTexture(canvas);
}

function buildYardWetAreas() {
 // Some patches spread along slab joints, others occupy depressions beside the aisle.
 const puddles = [
  [-11.5,-18.4,2.0,.57,.10],[-7.25,-16.9,1.03,.68,-.28],[-5.2,-21,.58,2.04,.08],
  [-13.2,-6.0,2.95,.55,-.05],[-6.5,-6.3,2.3,.65,.06],[-3.2,-13.5,1.72,.76,-.34],
  [2.3,-18.5,2.14,.46,.10],[5.2,-12,.68,2.18,.08],[10.7,-9.7,.97,1.70,-.15],
  [6.9,-4.8,1.3,.98,-.36],[-8.1,5.9,2.28,.70,-.02],[-4.8,3.0,.94,1.86,.12],
  [2.3,6.0,2.57,.48,.13],[5.3,10.1,.66,2.22,.08],[-3.1,19.5,1.84,.72,.13],
  [-13.8,17.6,2.1,.51,-.17],[13.6,15.7,1.68,1.40,.30],[9.0,23.7,2.60,.51,-.03]
 ];
 const geometry = new THREE.PlaneGeometry(2,2);
 geometry.rotateX(-Math.PI/2);
 const pose = new THREE.Object3D();
 for (let variant = 0; variant < 3; variant++) {
  const group = puddles.filter((_,index)=>index%3 === variant);
  const water = new THREE.MeshStandardMaterial({
   color:0x272e2c, alphaMap:wetEdgeMask(1+variant*2), transparent:true,
   opacity:.71, depthWrite:false, roughness:.46, metalness:.025
  });
  const patches = new THREE.InstancedMesh(geometry,water,group.length);
  patches.receiveShadow = true;
  patches.renderOrder = 2;
  for (const [index,[x,z,width,depth,yaw]] of group.entries()) {
   pose.position.set(x,.008+variant*.00025,z);
   pose.rotation.set(0,yaw,0);
   pose.scale.set(width,1,depth);
   pose.updateMatrix();
   patches.setMatrixAt(index,pose.matrix);
  }
  patches.computeBoundingSphere();
  scene.add(patches);
 }
}

function buildYardWear() {
 const canvas = document.createElement('canvas');
 canvas.width = canvas.height = 1024;
 const context = canvas.getContext('2d');
 const pixel = coordinate => (coordinate+34)*1024/68;

 function strip(center, reach, horizontal, tint, from=0, to=1024) {
  const gradient = horizontal
   ? context.createLinearGradient(0,center-reach,0,center+reach)
   : context.createLinearGradient(center-reach,0,center+reach,0);
  gradient.addColorStop(0,tint+'00');
  gradient.addColorStop(.48,tint+'30');
  gradient.addColorStop(1,tint+'00');
  context.fillStyle = gradient;
  if (horizontal)context.fillRect(from,center-reach,to-from,2*reach);
  else context.fillRect(center-reach,from,2*reach,to-from);
 }

 for (let x=-30; x<=30; x+=5)strip(pixel(x),3.5,false,'#322b24');
 for (let z=-30; z<=30; z+=6)strip(pixel(z),4.3,true,'#302d26');
 for (const x of [-2.12,2.12,-9.2,-8.2])strip(pixel(x),10,false,'#36322c',pixel(-26),pixel(25));
 // Use one decal and preserve the weathered asphalt as its visible base.
 const overlay = new THREE.Mesh(new THREE.PlaneGeometry(68,68),
  new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,
   depthWrite:false,roughness:.72,metalness:0}));
 overlay.material.map.colorSpace = THREE.SRGBColorSpace;
 overlay.rotation.x = -Math.PI/2;
 overlay.position.y = .003;
 overlay.receiveShadow = true;
 overlay.renderOrder = 1;
 scene.add(overlay);
}

function buildFreightYard() {
 const sky = new THREE.Color(0x929d9d);
 scene.background = sky;
 scene.fog = new THREE.FogExp2(sky, .017);
 sun.position.set(-26, 19, -38);
 sun.color.set(0xffc990);
 sun.intensity = 2.45;
 const asphalt = new THREE.MeshStandardMaterial({
  color:0x8c8c83, map:surface('#343d3e'), roughness:.84, metalness:.05
 });
 applyYardMaterial(asphalt, 'asphalt_01', 26, 0xeee9e1, .68);
 const tar = mat(0x212a2b);
 const paint = mat(0x937447);
 const beam = mat(0x344347, .61);
 const joints = mat(0x342c29, .45);
 const containerColors = [0x42555c, 0x794b3b, 0x586359, 0x777364];
 const shells = containerColors.map(color => mat(color, .32));
 const ribs = containerColors.map(color => mat(new THREE.Color(color).multiplyScalar(.76), .36));

 box(0,-.19,0,68,.38,68,asphalt);
 for (let x=-30; x<=30; x+=5) box(x,.004,0,.035,.006,63,tar);
 for (let z=-30; z<=30; z+=6) box(0,.007,z,63,.006,.042,tar);
 buildYardWear();
 buildYardWetAreas();
 for (let z=-26;z<=26;z+=4)for(const x of [-4.4,4.4]){
  box(x,.016,z,.09,.014,2.8,paint);
 }

 const ribsByColor = ribs.map(material => {
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(.045,2.16,.085), material, 900);
  mesh.count=0;
  scene.add(mesh);
  return mesh;
 });
 const transform = new THREE.Matrix4();
 function container(x,z,y,style,label){
  const width=2.44, height=2.59, length=6.06;
  box(x,y+height/2,z,width,height,length,shells[style],y===0);
  const corrugation=ribsByColor[style];
  for(const side of [-1,1])for(let i=0;i<24;i++){
   transform.makeTranslation(x+side*(width/2+.016),y+height/2,z-2.79+i*.242);
   corrugation.setMatrixAt(corrugation.count++,transform);
  }
  for(const side of [-1,1]){
   for(const railY of [.065,height-.065])box(x+side*1.24,y+railY,z,.08,.13,length+.04,joints);
   box(x+side*.57,y+height/2,z+3.05,1.1,height-.28,.08,ribs[style]);
   for(const dx of [-.22,.22])box(x+side*.57+dx,y+1.32,z+3.12,.038,2.25,.04,beam);
   for(const end of [-1,1])box(x+side*1.21,y+1.3,z+end*3.03,.14,height+.03,.14,joints);
  }
  if(label){
   const placard=sign(label,x,y+1.9,z+3.17,'#d5c7a6',1.64);
   placard.rotation.y=0;
  }
 }
 for(const side of [-1,1])for(let i=0;i<8;i++){
  const x=side*(24.2+(i%2)*2.7), z=-25+i*7.1;
  container(x,z,0,(i+(side+1))%4,'');
  if(i%3!==1)container(x,z,2.65,(i+1)%4,'');
 }
 for(let i=0;i<6;i++)container(-18+i*7,-30,0,i%4,'');
 for(let i=0;i<4;i++)container(-16+i*10,-40,0,(i+1)%4,'');

 function gantry(x,z,span,height){
  for(const side of [-1,1]){
   const leg=x+side*span/2;
   box(leg,height/2,z,.62,height,.74,beam);
   box(leg,.24,z,1.35,.48,1.8,joints);
   for(let y=2;y<height;y+=2)box(leg,y,z,.8,.14,.97,beam);
   const brace=box(leg-side*1.32,height-2.05,z,.25,4.2,.31,beam);
   brace.rotation.z=side*-.68;
  }
  for(const y of [height-.72,height])box(x,y,z,span+.8,.37,.95,beam);
  for(let d=-span/2;d<span/2;d+=1.7) {
   const diag=box(x+d,height-.35,z,.10,1.62,.68,beam);
   diag.rotation.z=.95;
  }
  const trolley = new THREE.Group();
  const pieces = [box(x+2,height-.71,z,1.7,.8,1.4,joints)];
  for(const side of [-1,1])pieces.push(box(x+2+side*.53,height-2.5,z,.028,3.2,.028,beam));
  pieces.push(box(x+2,height-4.1,z,1.42,.16,.38,paint));
  for (const piece of pieces) piece.castShadow = false;
  trolley.add(...pieces);
  scene.add(trolley);
  yardHoists.push(trolley);
 }
 gantry(0,-19,39,11);
 gantry(2,-38,32,15);
 gantry(-5,-53,36,18);
 for(const x of [-19,19])for(const z of [-17,3,22]){
  box(x,2.8,z,.11,5.6,.11,beam);
  box(x+(x<0?.45:-.45),5.62,z,1,.11,.14,beam);
  box(x+(x<0?.85:-.85),5.53,z,.4,.15,.28,new THREE.MeshStandardMaterial({
   color:0xffdfa3, emissive:0xffb766, emissiveIntensity:2.5
  }));
 }
 box(0,2,-27,9,4,3,beam,true);
 for(let x=-3.85;x<4;x+=.55)box(x,2,-25.47,.08,3.4,.1,joints);
 sign('HOST CONTROLLER / BAY 04',0,3.38,-25.29,'#c9c9b6',3.8);
 for (const dx of [-1.67,1.67]) box(dx,3.39,-25.39,.07,.76,.06,joints);
 // Low hard stops along the container frontage establish scale without blocking the aisle.
 for (const x of [-6.35,5.4]) {
  box(x,.19,-25.01,.42,.38,1.18,joints);
  box(x,.35,-24.54,.42,.07,.10,paint);
 }
}
