'use strict';

function forkliftWheelContacts() {
 const canvas = document.createElement('canvas');
 canvas.width = canvas.height = 64;
 const context = canvas.getContext('2d');
 const falloff = context.createRadialGradient(32,32,4,32,32,32);
 falloff.addColorStop(0,'#f0f0f0');
 falloff.addColorStop(.44,'#a2a2a2');
 falloff.addColorStop(1,'#000');
 context.fillStyle = falloff;
 context.fillRect(0,0,64,64);
 const geometry = new THREE.PlaneGeometry(1,1);
 geometry.rotateX(-Math.PI/2);
 const material = new THREE.MeshBasicMaterial({
  color:0x201b17,alphaMap:new THREE.CanvasTexture(canvas),
  transparent:true,opacity:.37,depthWrite:false
 });
 const contacts = new THREE.InstancedMesh(geometry,material,4);
 contacts.name = 'Forklift wheel contacts';
 contacts.renderOrder = 2;
 const pose = new THREE.Object3D();
 let index = 0;
 for (const [x,z,width,length] of [
  [.50,-.185,.36,.52],
  [.432,-1.385,.30,.42]
 ]) {
  for (const side of [-1,1]) {
   pose.position.set(side*x,.009,z);
   pose.scale.set(width,1,length);
   pose.updateMatrix();
   contacts.setMatrixAt(index++,pose.matrix);
  }
 }
 contacts.computeBoundingSphere();
 return contacts;
}

function applyForkliftFinish(forklift,meshes,buffer) {
 const ranges = [];
 let offset = 0;
 for (const mesh of meshes) {
  const count = mesh.geometry.attributes.position.count * 3;
  offset = (offset+3)&~3;
  ranges.push({mesh,offset,count});
  offset += count;
 }
 if (buffer?.byteLength !== offset) {
  forklift.userData.finish = 'base';
  return;
 }
 for (const {mesh,offset,count} of ranges) {
  const colors = new Uint8Array(buffer,offset,count);
  mesh.geometry.setAttribute('color',new THREE.BufferAttribute(colors,3,true));
  mesh.material.color.setHex(0xffffff);
  mesh.material.vertexColors = true;
  mesh.material.needsUpdate = true;
 }
 forklift.userData.finish = 'worn';
}

async function loadYardForklift() {
 const directory = 'assets/yard/forklift';
 const request = async (file,format) => {
  const response = await fetch(`${directory}/${file}`);
  if (!response.ok) throw Error(`Forklift ${file} HTTP ${response.status}`);
  return response[format]();
 };
 const roughness = {orange:.54,steel:.46,black:.74,chrome:.29,rubber:.86};
 const forklift = new THREE.Group();
 forklift.name = 'Electric yard forklift';
 forklift.userData.finish = 'loading';
 const finish = request('colors.bin','arrayBuffer').catch(()=>null);

 try {
  const [layout, buffer] = await Promise.all([request('layout.json','json'),request('mesh.bin','arrayBuffer')]);
  if (buffer.byteLength!==585672 || layout.groups?.length!==Object.keys(roughness).length) {
   throw Error('Forklift asset layout does not match its mesh buffer.');
  }
  const names = new Set();
  const bounds = new THREE.Box3();
  for (const part of layout.groups) {
   const source = part.material;
   const name = source.name;
   if (!Object.hasOwn(roughness,name) || names.has(name)) throw Error('Invalid forklift material group.');
   names.add(name);
   const vertices = part.vertexCount * 3;
   const positions = new Float32Array(buffer,part.positions,vertices);
   const normals = new Float32Array(buffer,part.normals,vertices);
   const indices = new Uint16Array(buffer,part.indices,part.indexCount);
   if (!positions.length || !indices.length || indices.length%3 ||
       !positions.every(Number.isFinite) || !normals.every(Number.isFinite) ||
       !indices.every(index=>index<part.vertexCount)) throw Error('Invalid forklift mesh data.');

   const original = source.pbrMetallicRoughness;
   const material = new THREE.MeshStandardMaterial({
    color:new THREE.Color(...original.baseColorFactor.slice(0,3)),
    metalness:original.metallicFactor,roughness:roughness[name],
    side:source.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
    name:`Forklift ${name}`
   });
   const geometry = new THREE.BufferGeometry();
   geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
   geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3));
   geometry.setIndex(new THREE.BufferAttribute(indices,1));
   geometry.computeBoundingBox();
   bounds.union(geometry.boundingBox);
   const mesh = new THREE.Mesh(geometry,material);
   mesh.castShadow = mesh.receiveShadow = true;
   forklift.add(mesh);
  }

  // Park beside the existing west pallet. The baked geometry is centred
  // along its length, including the forward fork tips.
  forklift.position.set(-15.25,-bounds.min.y,-22.40);
  forklift.rotation.y = .32;
  forklift.updateMatrixWorld(true);
  const worldBounds = bounds.applyMatrix4(forklift.matrixWorld);
  const center = worldBounds.getCenter(new THREE.Vector3());
  const size = worldBounds.getSize(new THREE.Vector3());
  const playerClearance = .18;
  const meshes = [...forklift.children];
  forklift.add(forkliftWheelContacts());
  scene.add(forklift);
  solid.push({x:center.x,z:center.z,w:size.x/2+playerClearance,d:size.z/2+playerClearance});
  sun.shadow.needsUpdate = true;
  finish.then(buffer=>applyForkliftFinish(forklift,meshes,buffer));
 } catch {
  // Only the existing pallet and route remain when either resource is missing.
  for (const mesh of forklift.children) {
   mesh.geometry.dispose();
   mesh.material.dispose();
  }
 }
}

loadYardForklift();
