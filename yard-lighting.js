'use strict';

async function loadYardEnvironment() {
 // The procedural sky and shadow-casting sun are ready before this fill.
 if (!renderer.capabilities.isWebGL2) return;
 const width = 256, height = 128;
 try {
  const response = await fetch('assets/yard/lighting/freight-station-fill.bin');
  if (!response.ok) throw new Error(`environment HTTP ${response.status}`);
  const pixels = await response.arrayBuffer();
  if (pixels.byteLength !== width * height * 4 * 2) throw new Error('invalid environment size');
  const halfFloats = new Uint16Array(pixels);
  if (halfFloats.some(value => (value & 0x8000) || (value & 0x7c00) === 0x7c00)) {
   throw new Error('environment contains invalid radiance');
  }
  const environment = new THREE.DataTexture(halfFloats,width,height,
   THREE.RGBAFormat,THREE.HalfFloatType);
  environment.name = 'Freight Station HDR fill';
  environment.mapping = THREE.EquirectangularReflectionMapping;
  environment.colorSpace = THREE.LinearSRGBColorSpace;
  environment.minFilter = environment.magFilter = THREE.LinearFilter;
  environment.needsUpdate = true;
  scene.environment = environment;
 } catch (error) {
  console.warn(`Yard environment unavailable. Keeping procedural lighting (${error.message}).`);
 }
}

loadYardEnvironment();
