'use strict';

// The yard builds its static boxes as individual meshes so their parts can be
// posed during assembly. Instance nearby parts with identical render settings.
function batchYardBoxes() {
 const groups = new Map();
 const sectorSize = 24;
 for (const mesh of scene.children) {
  if (!mesh.isMesh || mesh.isInstancedMesh || mesh.geometry.type !== 'BoxGeometry' ||
      !mesh.visible || mesh.material.transparent || mesh.children.length) continue;
  const sectorX = Math.floor(mesh.position.x / sectorSize);
  const sectorZ = Math.floor(mesh.position.z / sectorSize);
  const key = [mesh.material.id, mesh.castShadow, mesh.receiveShadow, sectorX, sectorZ].join(':');
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(mesh);
 }

 const geometry = new THREE.BoxGeometry(1,1,1);
 const scale = new THREE.Matrix4();
 const matrix = new THREE.Matrix4();
 for (const parts of groups.values()) {
  if (parts.length < 4) continue;
  const [first] = parts;
  const batch = new THREE.InstancedMesh(geometry, first.material, parts.length);
  batch.name = 'Static yard parts';
  batch.castShadow = first.castShadow;
  batch.receiveShadow = first.receiveShadow;
  parts.forEach((mesh,index) => {
   const {width,height,depth} = mesh.geometry.parameters;
   mesh.updateMatrix();
   matrix.copy(mesh.matrix).multiply(scale.makeScale(width,height,depth));
   batch.setMatrixAt(index,matrix);
   scene.remove(mesh);
   mesh.geometry.dispose();
  });
  batch.instanceMatrix.needsUpdate = true;
  batch.computeBoundingSphere();
  scene.add(batch);
 }
 sun.shadow.needsUpdate = true;
}

batchYardBoxes();
