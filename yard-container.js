'use strict';

async function addDetailedYardContainers() {
 if (!yardDetailedContainerSlots.length) return;
 const directory = 'assets/yard/container';
 async function fetchAsset(name,format) {
  const response = await fetch(`${directory}/${name}`);
  if (!response.ok) throw new Error(`${name} HTTP ${response.status}`);
  return response[format]();
 }
 const results = await Promise.allSettled([
  fetchAsset('layout.json','json'),
  fetchAsset('mesh.bin','arrayBuffer'),
  ...['color','normal','metal-rough'].map(name=>yardMaterialLoader.loadAsync(`${directory}/${name}.webp`))
 ]);
 let geometry;
 let material;
 try {
  if (results.some(result=>result.status==='rejected')) throw new Error('asset unavailable');
  const [layout,buffer,color,normal,metalRough] = results.map(result=>result.value);
  if (buffer.byteLength!==layout.byteLength) throw new Error('geometry length did not match the layout');
  function read(name,arrayType,type) {
   const {offset,count,type:declared} = layout[name];
   if (declared!==type || !Number.isSafeInteger(offset) || !Number.isSafeInteger(count) ||
       offset<0 || count<1 || offset+count*arrayType.BYTES_PER_ELEMENT>buffer.byteLength) {
    throw new Error(`invalid ${name} attribute`);
   }
   return new arrayType(buffer,offset,count);
  }
  const positions=read('position',Float32Array,'float32');
  const normals=read('normal',Float32Array,'float32');
  const coordinates=read('uv',Float32Array,'float32');
  const indices=read('index',Uint16Array,'uint16');
  const vertices=positions.length/3;
  if (!Number.isInteger(vertices) || normals.length!==positions.length ||
      coordinates.length!==vertices*2 || indices.length%3 ||
      indices.some(index=>index>=vertices)) throw new Error('geometry topology did not match the layout');

  geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3));
  geometry.setAttribute('uv',new THREE.BufferAttribute(coordinates,2));
  geometry.setIndex(new THREE.BufferAttribute(indices,1));
  geometry.computeBoundingBox();
  const bounds=geometry.boundingBox;
  const center=bounds.getCenter(new THREE.Vector3());
  const size=bounds.getSize(new THREE.Vector3());
  if ([size.x,size.y,size.z].some(value=>!Number.isFinite(value)||value<1)) throw new Error('invalid model bounds');
  const {width,height,length}=yardDetailedContainerSlots[0];
  // Source length is X, with door hardware on the positive end. Rotate it to
  // positive Z and fit the unchanged base footprint and floor height.
  geometry.translate(-center.x,-bounds.min.y,-center.z);
  geometry.rotateY(-Math.PI/2);
  geometry.scale(width/size.z,height/size.y,length/size.x);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  for (const texture of [color,normal,metalRough]) {
   texture.flipY = false;
   texture.anisotropy = Math.min(8,renderer.capabilities.getMaxAnisotropy());
  }
  color.colorSpace = THREE.SRGBColorSpace;
  material = new THREE.MeshStandardMaterial({
   map:color,normalMap:normal,roughnessMap:metalRough,metalnessMap:metalRough,
   roughness:1,metalness:1
  });
  const model = new THREE.InstancedMesh(geometry,material,yardDetailedContainerSlots.length);
  model.name = 'Detailed yard containers';
  model.castShadow = model.receiveShadow = true;
  const pose = new THREE.Matrix4();
  for (const [index,{x,z,y}] of yardDetailedContainerSlots.entries()) {
   model.setMatrixAt(index,pose.makeTranslation(x,y,z));
  }
  model.instanceMatrix.needsUpdate = true;
  model.computeBoundingSphere();
  scene.add(model);
  for (const slot of yardDetailedContainerSlots) slot.fallback.visible = false;
  sun.shadow.needsUpdate = true;
 } catch (error) {
  geometry?.dispose();
  material?.dispose();
  for (const result of results.slice(2)) if (result.status==='fulfilled') result.value.dispose();
  console.warn(`Detailed yard containers unavailable. Keeping procedural containers (${error.message}).`);
 }
}

addDetailedYardContainers();
