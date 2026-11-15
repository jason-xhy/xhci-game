'use strict';

let yardRouteMarkers;
let lastYardRouteKey;
let junctionMarker;

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
