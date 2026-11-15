'use strict';

const yardHoists = [];
const reducedYardMotion = matchMedia('(prefers-reduced-motion: reduce)');

function updateFreightYard(time) {
 if (reducedYardMotion.matches) return;
 for (const [index, hoist] of yardHoists.entries()) hoist.position.x = Math.sin(time * .23 + index) * 2.7;
}

function buildFreightYard() {
 const sky = new THREE.Color(0x9a8c77);
 scene.background = sky;
 scene.fog = new THREE.FogExp2(sky, .012);
 sun.position.set(-26, 19, -38);
 sun.color.set(0xffc990);
 sun.intensity = 2.15;
 const asphalt = new THREE.MeshStandardMaterial({
  color:0x8c8c83, map:surface('#343d3e'), roughness:.84, metalness:.05
 });
 const wet = new THREE.MeshStandardMaterial({
  color:0x262e2b, roughness:.72, metalness:.04
 });
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
 for (let n=0; n<32; n++){
  const x=(n*13%49)-24, z=(n*17%57)-28;
  const puddle = new THREE.Mesh(new THREE.CircleGeometry(1, 15), wet);
  puddle.rotation.x=-Math.PI/2;
  puddle.receiveShadow = true;
  puddle.position.set(x,.011+n*.00003,z);
  puddle.scale.set(.45+(n%4)*.35,.35+(n%5)*.44,1);
  scene.add(puddle);
 }
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
 sign('HOST CONTROLLER / BAY 04',0,4.65,-25.31,'#d7c19b',7.4);
}
