'use strict';

const yardMaterialLoader = new THREE.TextureLoader();

async function applyYardMaterial(material, name, repeat, tint, normalStrength) {
 const maps = await Promise.allSettled(['color','normal','roughness'].map(kind =>
  yardMaterialLoader.loadAsync(`assets/yard/${name}-${kind}.webp`)));
 if (maps.some(map => map.status === 'rejected')) {
  for (const map of maps) if (map.status === 'fulfilled') map.value.dispose();
  console.warn(`Could not load the ${name} material. Using the built-in finish.`);
  return;
 }
 const [color, normal, roughness] = maps.map(map => map.value);
 color.colorSpace = THREE.SRGBColorSpace;
 for (const texture of [color,normal,roughness]) {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat,repeat);
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
 }
 const fallback = material.map;
 material.map = color;
 material.normalMap = normal;
 material.normalScale.set(normalStrength,normalStrength);
 material.roughnessMap = roughness;
 material.roughness = 1;
 material.color.setHex(tint);
 material.needsUpdate = true;
 fallback?.dispose();
}
