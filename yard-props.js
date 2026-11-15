'use strict';

// This local pack contains the single primitive from the Barrel 03 glTF.
async function addYardBarrels() {
 const directory = 'assets/yard/barrel';
 const results = await Promise.allSettled([
  fetch(`${directory}/mesh.bin`).then(response => {
   if (!response.ok) throw new Error(`Barrel geometry HTTP ${response.status}`);
   return response.arrayBuffer();
  }),
  ...['color','normal','arm'].map(name => yardMaterialLoader.loadAsync(`${directory}/${name}.webp`))
 ]);
 if (results.some(result => result.status === 'rejected') || results[0].value.byteLength !== 44872) {
  for (const result of results.slice(1)) if (result.status === 'fulfilled') result.value.dispose();
  return;
 }
 const [buffer,color,normal,arm] = results.map(result => result.value);
 for (const texture of [color,normal,arm]) {
  texture.flipY = false;
  texture.anisotropy = Math.min(8,renderer.capabilities.getMaxAnisotropy());
 }
 color.colorSpace = THREE.SRGBColorSpace;
 const geometry = new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(buffer,0,3378),3));
 geometry.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(buffer,13512,3378),3));
 geometry.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(buffer,27024,2252),2));
 geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(buffer,36032,4419),1));

 const material = new THREE.MeshStandardMaterial({
  map:color, normalMap:normal, aoMap:arm, roughnessMap:arm, metalnessMap:arm,
  roughness:1, metalness:1, side:THREE.DoubleSide
 });
 const placements = [
  [-11.8,-18.9,.22],[-12.52,-19.24,-.35],
  [-12.8,-2.7,1.44],[11.8,-1.4,-.82]
 ];
 geometry.computeBoundingBox();
 registerYardDrumReflection(placements[0][0],placements[0][1],geometry.boundingBox);
 const barrels = new THREE.InstancedMesh(geometry,material,placements.length);
 barrels.name = 'Weathered steel drums';
 barrels.castShadow = barrels.receiveShadow = true;
 const pose = new THREE.Object3D();
 for (const [index,[x,z,yaw]] of placements.entries()) {
  pose.position.set(x,0,z);
  pose.rotation.y = yaw;
  pose.updateMatrix();
  barrels.setMatrixAt(index,pose.matrix);
  solid.push({x,z,w:.59,d:.59});
 }
 barrels.instanceMatrix.needsUpdate = true;
 barrels.computeBoundingSphere();
 scene.add(barrels);
 sun.shadow.needsUpdate = true;
}

addYardBarrels();

function addYardHandlingEquipment() {
 const deck = new THREE.MeshStandardMaterial({color:0x6d5138,
  map:surface('#a39179'),roughness:.86,metalness:0});
 const skid = new THREE.MeshStandardMaterial({color:0x3b2b20,roughness:.90});
 const steelPost = new THREE.MeshStandardMaterial({color:0x695638,roughness:.59,metalness:.42});
 const bands = new THREE.MeshStandardMaterial({color:0xc89a4e,roughness:.57,metalness:.19});
 const pose = new THREE.Object3D();
 const build = (geometry,material,transforms) => {
  const mesh = new THREE.InstancedMesh(geometry,material,transforms.length);
  mesh.castShadow = mesh.receiveShadow = true;
  for(const [index,[x,y,z,sx,sy,sz,yaw=0]] of transforms.entries()){
   pose.position.set(x,y,z);
   pose.scale.set(sx,sy,sz);
   pose.rotation.set(0,yaw,0);
   pose.updateMatrix();
   mesh.setMatrixAt(index,pose.matrix);
  }
  mesh.computeBoundingSphere();
  scene.add(mesh);
 };
 const slats = [];
 const runners = [];
 for(const [x,z] of [[-13.86,-19.28],[13.02,-1.45]]){
  for(let row=0;row<5;row++)slats.push([x,.126,z-.43+row*.212,1.17,.052,.16]);
  for(const offset of [-.45,0,.45])runners.push([x+offset,.055,z,.105,.11,1.06]);
  solid.push({x,z,w:.91,d:.85});
 }
 const block = new THREE.BoxGeometry(1,1,1);
 build(block,deck,slats);
 build(block,skid,runners);
 const bases = [];
 const posts = [];
 const safetyStripe = [];
 for(const [x,z] of [[-12.61,-1.55],[12.05,-.30],[9.65,-24.45]]){
  bases.push([x,.043,z,.25,.086,.25]);
  posts.push([x,.39,z,.083,.70,.083]);
  for (const height of [.55,.69])safetyStripe.push([x,height,z,.087,.070,.087]);
  solid.push({x,z,w:.445,d:.445});
 }
 build(block,skid,bases);
 const upright = new THREE.CylinderGeometry(1,1,1,10);
 build(upright,steelPost,posts);
 build(upright,bands,safetyStripe);
 sun.shadow.needsUpdate = true;
}

addYardHandlingEquipment();
