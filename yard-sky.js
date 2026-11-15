'use strict';

// Paint an equirectangular sky once. The same solar direction lights the yard.
function createYardSky(sunDirection) {
 const width = 1024, height = 512;
 const canvas = document.createElement('canvas');
 canvas.width = width;
 canvas.height = height;
 const context = canvas.getContext('2d');
 const image = context.createImageData(width, height);
 const pixels = image.data;
 const horizon = [156, 161, 153];
 const zenith = [48, 76, 99];
 const cloudShadow = [96, 112, 126];
 const cloudEdge = [225, 195, 158];
 const sunlight = [72, 42, 12];

 function hash(x, y) {
  const bits = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  const mixed = Math.imul(bits ^ (bits >>> 13), 1274126177);
  return ((mixed ^ (mixed >>> 16)) >>> 0) / 4294967295;
 }
 function noise(x, y) {
  const i = Math.floor(x), j = Math.floor(y);
  const dx = x-i, dy = y-j;
  const u = dx*dx*(3-2*dx), v = dy*dy*(3-2*dy);
  const near = hash(i,j)*(1-u) + hash(i+1,j)*u;
  const far = hash(i,j+1)*(1-u) + hash(i+1,j+1)*u;
  return near*(1-v)+far*v;
 }
 function cloudDensity(x, z) {
  return noise(x,z)*.59 + noise(x*2.14+5,z*2.14)*.27 +
   noise(x*4.35,z*4.35-8)*.10 + noise(x*8.2-5,z*8.2)*.04;
 }
 function clamp(value) {
  return Math.max(0,Math.min(1,value));
 }
 const directions = Array.from({length:width}, (_, column) => {
  const angle = (column+.5)*Math.PI*2/width;
  return [-Math.cos(angle), Math.sin(angle)];
 });
 for (let row=0; row<height; row++) {
  const angle = (row+.5)*Math.PI/height;
  const elevation = Math.cos(angle);
  const radius = Math.sin(angle);
  const skyBlend = Math.pow(clamp(elevation),.55);
  const cloudDistance = 2.65/Math.max(elevation,.11);
  const cloudFade = clamp((elevation-.06)/.23);
  for (let column=0; column<width; column++) {
   const x = directions[column][0]*radius;
   const z = directions[column][1]*radius;
   const solar = Math.max(0,x*sunDirection.x+elevation*sunDirection.y+z*sunDirection.z);
   const glow = Math.pow(solar,8)*clamp((elevation+.11)*4);
   const disc = Math.pow(solar,1000)*.85;
   const u = x*cloudDistance+18.7, v = z*cloudDistance-4.3;
   const density = cloudFade ? cloudDensity(u,v) : 0;
   const opacity = clamp((density-.48)*3.9)*cloudFade*.87;
   // A small offset toward the sun gives raised cloud edges a warmer value.
   const lit = opacity ? clamp((density-cloudDensity(u+.18,v-.26))*6+.29+glow*.28) : 0;
   const index = (row*width+column)*4;
   for (let channel=0; channel<3; channel++) {
    const base = horizon[channel]*(1-skyBlend)+zenith[channel]*skyBlend;
    const warm = sunlight[channel]*glow;
    const cloud = cloudShadow[channel]*(1-lit)+cloudEdge[channel]*lit;
    pixels[index+channel] = (base+warm+disc*159)*(1-opacity)+cloud*opacity;
   }
   pixels[index+3] = 255;
  }
 }
 context.putImageData(image,0,0);
 const map = new THREE.CanvasTexture(canvas);
 map.colorSpace = THREE.SRGBColorSpace;
 const dome = new THREE.Mesh(new THREE.SphereGeometry(95,48,24),
  new THREE.MeshBasicMaterial({map,side:THREE.BackSide,fog:false,depthWrite:false,toneMapped:false}));
 dome.frustumCulled = false;
 dome.renderOrder = -100;
 scene.add(dome);
 scene.fog.color.setRGB(...horizon.map(channel => channel/255), THREE.SRGBColorSpace);
 return map;
}

const yardSkyTexture = createYardSky(sun.position.clone().normalize());
