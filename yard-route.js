'use strict';

let yardRouteMarkers;
let lastYardRouteKey;
let junctionMarker;
let yardLandingGuide;

function showLandingGuide(waypoints,target) {
 const point = waypoints.at(-1);
 if (!point || waypoints.length > 10) {
  if (yardLandingGuide) yardLandingGuide.visible = false;
  return;
 }
 if (!yardLandingGuide) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 144;
  const context = canvas.getContext('2d');
  context.fillStyle = '#1d2629';
  context.fillRect(0,0,512,144);
  context.strokeStyle = '#e7c88c';
  context.lineWidth = 6;
  context.strokeRect(8,8,496,128);
  context.fillStyle = '#f3d994';
  context.font = 'bold 70px sans-serif';
  context.fillText('↑',25,98);
  context.font = 'bold 49px monospace';
  context.fillText('FACE PANEL',123,94,355);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const geometry = new THREE.PlaneGeometry(1.35,.38);
  geometry.rotateX(-Math.PI/2);
  yardLandingGuide = new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({map:texture}));
  yardLandingGuide.name = 'Face panel landing guide';
  scene.add(yardLandingGuide);
 }
 const yaw = Math.atan2(point[0]-target.x,point[1]-target.z);
 yardLandingGuide.visible = true;
 // Sit inside the stand zone instead of under the player when they reach it.
 yardLandingGuide.position.set(point[0]-.67*Math.sin(yaw),.034,point[1]-.67*Math.cos(yaw));
 yardLandingGuide.rotation.y = yaw;
 yardLandingGuide.userData.target = target.id;
}

function createJunctionMarker() {
 const canvas = document.createElement('canvas');
 canvas.width = 512;
 canvas.height = 116;
 const context = canvas.getContext('2d');
 const texture = new THREE.CanvasTexture(canvas);
 texture.colorSpace = THREE.SRGBColorSpace;
 const sign = new THREE.Group();
 const backing = new THREE.Mesh(new THREE.BoxGeometry(1.08,.25,.028),
  new THREE.MeshStandardMaterial({color:0x343634,roughness:.7,metalness:.3}));
 backing.position.y = .58;
 sign.add(backing);
 const face = new THREE.Mesh(new THREE.PlaneGeometry(1.06,.235),
  new THREE.MeshBasicMaterial({map:texture}));
 face.position.set(0,.581,.015);
 sign.add(face);
 for (const x of [-.41,.41]) {
  const leg = new THREE.Mesh(new THREE.BoxGeometry(.055,.49,.055),backing.material);
  leg.position.set(x,.245,0);
  sign.add(leg);
 }
 scene.add(sign);
 return {
  sign,
  write(label,direction) {
   context.fillStyle = '#182329';
   context.fillRect(0,0,512,116);
   context.strokeStyle = '#decca0';
   context.lineWidth = 6;
   context.strokeRect(7,7,498,102);
   context.fillStyle = '#f0d79f';
   context.font = 'bold 64px sans-serif';
   context.fillText(direction === 'left' ? '←' : '→',23,80);
   context.font = 'bold 35px monospace';
   context.fillText(label,111,72,375);
   texture.needsUpdate = true;
  }
 };
}

function showNextJunction(waypoints,target) {
 const corner = waypoints.findIndex(([x,z],index)=>{
  if (index === 0 || index > 8 || index+1 === waypoints.length) return false;
  const previous = waypoints[index-1];
  const next = waypoints[index+1];
  return x-previous[0] !== next[0]-x || z-previous[1] !== next[1]-z;
 });
 if (corner < 0) {
  if (junctionMarker) junctionMarker.sign.visible = false;
  return;
 }
 junctionMarker ??= createJunctionMarker();
 const [x,z] = waypoints[corner];
 const [fromX,fromZ] = waypoints[corner-1];
 const [nextX,nextZ] = waypoints[corner+1];
 const rightX = fromZ-z;
 const rightZ = x-fromX;
 const turnsRight = (nextX-x)*rightX+(nextZ-z)*rightZ > 0;
 const offset = turnsRight ? -.69 : .69;
 let signX = x+offset*rightX, signZ = z+offset*rightZ;
 if (blocked(signX,signZ)) {
  signX = x-offset*rightX;
  signZ = z-offset*rightZ;
 }
 if (blocked(signX,signZ)) {
  junctionMarker.sign.visible = false;
  return;
 }
 junctionMarker.sign.visible = true;
 junctionMarker.sign.position.set(signX,0,signZ);
 junctionMarker.sign.rotation.y = Math.atan2(fromX-x,fromZ-z);
 junctionMarker.write(yardDestinationLabel[target.id],turnsRight ? 'right' : 'left');
}


function showYardRoute(target) {
 const active = running && !paused && !finished && startup.ready && step > 0 && !job;
 const x = Math.round(position.x), z = Math.round(position.z);
 const key = active ? `${target.id}:${x}:${z}` : 'hidden';
 if (key === lastYardRouteKey) return;
 lastYardRouteKey = key;

 if (!yardRouteMarkers) {
  if (!active) return;
  const arrow = new THREE.Shape();
  arrow.moveTo(-.35,.17);
  arrow.lineTo(0,-.23);
  arrow.lineTo(.35,.17);
  arrow.lineTo(.25,.17);
  arrow.lineTo(0,-.10);
  arrow.lineTo(-.25,.17);
  arrow.closePath();
  const geometry = new THREE.ShapeGeometry(arrow);
  geometry.rotateX(Math.PI/2);
  const material = new THREE.MeshBasicMaterial({color:0xe7c88c,side:THREE.DoubleSide});
  yardRouteMarkers = Array.from({length:9}, () => {
   const marker = new THREE.Mesh(geometry,material);
   scene.add(marker);
   return marker;
  });
 }
 const waypoints = active ? findStationRoute([x,z],target) : [];
 showNextJunction(waypoints,target);
 showLandingGuide(waypoints,target);
 for (const [index, marker] of yardRouteMarkers.entries()) {
  const start = waypoints[index];
  const end = waypoints[index+1];
  marker.visible = Boolean(start && end);
  if (!marker.visible) continue;
  const [fromX,fromZ] = start;
  const [toX,toZ] = end;
  marker.position.set((fromX+toX)/2,.031,(fromZ+toZ)/2);
  marker.rotation.y = Math.atan2(fromX-toX,fromZ-toZ);
 }
}

// The outer signs face diagonally into their aisles so both directions
// can read them before reaching the crossing. Arrows mark the first leg.
function addFixedYardSigns() {
 const signs = [
  {name:'West aisle', x:-7.4, z:-13, yaw:Math.PI/4,
   left:'COMMAND QUEUE', right:'ROOT PORT'},
  {name:'Central crossing', x:0, z:-11.65, yaw:0,
   left:'COMMAND QUEUE', right:'EP0 DISPATCH'},
  {name:'East aisle', x:7.4, z:-13, yaw:-Math.PI/4,
   left:'CONTEXT BENCH', right:'EP0 DISPATCH'}
 ];
 const frame = new THREE.MeshStandardMaterial({color:0x414642,roughness:.76,metalness:.28});
 const fasteners = new THREE.MeshStandardMaterial({color:0x766f59,roughness:.55,metalness:.52});
 const backing = new THREE.BoxGeometry(1.52,.47,.06);
 const face = new THREE.PlaneGeometry(1.48,.43);
 const post = new THREE.BoxGeometry(.057,.68,.057);
 const foot = new THREE.BoxGeometry(.18,.045,.21);
 const bolt = new THREE.BoxGeometry(.034,.02,.034);

 for (const {name,x,z,yaw,left,right} of signs) {
  const sign = new THREE.Group();
  sign.name = 'Fixed route sign / '+name;
  sign.position.set(x,0,z);
  sign.rotation.y = yaw;

  function mount(geometry,material,x,y,z) {
   const mesh = new THREE.Mesh(geometry,material);
   mesh.position.set(x,y,z);
   mesh.castShadow = mesh.receiveShadow = true;
   sign.add(mesh);
   return mesh;
  }

  mount(backing,frame,0,.78,0);
  for (const x of [-.61,.61]) {
   mount(post,frame,x,.34,0);
   mount(foot,frame,x,.026,0);
   for (const z of [-.072,.072]) mount(bolt,fasteners,x,.054,z);
  }
  for (const side of [1,-1]) {
   const material = fixedYardSignFace(side === 1 ? left : right, side === 1 ? right : left);
   const panel = mount(face,material,0,.78,side*.031);
   if (side === -1) panel.rotation.y = Math.PI;
   panel.castShadow = false;
  }
  scene.add(sign);
 }
}

function fixedYardSignFace(left,right) {
 const canvas = document.createElement('canvas');
 canvas.width = 768;
 canvas.height = 224;
 const ink = canvas.getContext('2d');
 ink.fillStyle = '#232f31';
 ink.fillRect(0,0,768,224);
 ink.strokeStyle = '#87928a';
 ink.lineWidth = 4;
 ink.strokeRect(10,10,748,204);
 ink.fillStyle = '#586966';
 ink.fillRect(33,109,702,3);
 // Small chips near the mounting corners leave the lettering clear.
 ink.fillStyle = '#a18e6b';
 for (const [x,y,w,h] of [[14,17,22,4],[23,25,9,3],[743,18,9,5],[15,203,13,4],[729,204,23,3]]) {
  ink.fillRect(x,y,w,h);
 }
 ink.fillStyle = '#fff0c0';
 ink.font = 'bold 52px monospace';
 ink.fillText('←',35,87);
 ink.fillText('→',35,180);
 ink.font = 'bold 48px monospace';
 ink.fillText(left,118,85,613);
 ink.fillText(right,118,178,613);
 const texture = new THREE.CanvasTexture(canvas);
 texture.colorSpace = THREE.SRGBColorSpace;
 return new THREE.MeshStandardMaterial({
  map:texture,roughness:.68,metalness:.08,
  emissiveMap:texture,emissive:0xffffff,emissiveIntensity:.19
 });
}
