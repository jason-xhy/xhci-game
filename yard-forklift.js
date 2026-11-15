'use strict';

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
  scene.add(forklift);
  solid.push({x:center.x,z:center.z,w:size.x/2+playerClearance,d:size.z/2+playerClearance});
  sun.shadow.needsUpdate = true;
 } catch {
  // Only the existing pallet and route remain when either resource is missing.
  for (const mesh of forklift.children) {
   mesh.geometry.dispose();
   mesh.material.dispose();
  }
 }
}

loadYardForklift();
