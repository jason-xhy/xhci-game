'use strict';

// Each crate keeps the original .54 × .32 × .36 metre transport envelope.
const trbCargoPalette = {
 cmd:0xd6a558, transfer:0x62b9c1, event:0x74b88e
};
const trbCargoShapes = {
 command:[
  [-.048,.034,-.038,.277,.156,.185,'ring'], [.175,.068,-.047,.070,.082,.166,'dark']
 ],
 setup:[
  [-.088,.040,-.030,.195,.180,.193,'ring'], [.086,.022,-.050,.111,.124,.140,'dark'],
  [.144,.065,-.053,.056,.054,.095,'bare']
 ],
 data:[
  [-.100,.035,-.052,.124,.174,.162,'ring'], [.100,.035,-.052,.124,.174,.162,'ring'],
  [-.100,.078,.031,.076,.055,.022,'bare'], [.100,.078,.031,.076,.055,.022,'bare']
 ],
 status:[
  [0,.029,-.088,.327,.148,.100,'ring'], [0,.027,-.002,.228,.116,.084,'dark'],
  [0,.062,-.005,.186,.045,.032,'bare']
 ],
 event:[
  [0,.028,-.050,.360,.158,.183,'ring'], [0,.109,-.048,.267,.022,.093,'dark'],
  [-.177,.068,-.050,.035,.061,.147,'bare'], [.177,.068,-.050,.035,.061,.147,'bare']
 ]
};
const trbCargoStates = {
 waiting:[0x8c7757,.05], moving:[0x7cd7df,.27], held:[0xff6a42,.63],
 repaired:[0xd2f8ff,.74], posted:[0xb7cb88,.28], ready:[0xa5f4aa,.80],
 'error-posted':[0xee7257,.20], 'error-ready':[0xff765e,.80]
};
const trbCargoCache = new Map();
let trbCargoBodyMaterial;
let trbCargoLampGeometry;

function trbCargoGeometry(parts, ring) {
 const positions = [], normals = [], colors = [];
 const palette = {ring:trbCargoPalette[ring], dark:0x283337, bare:0xb2ada3, base:0x4b5557};
 for (const [x,y,z,w,h,d,finish] of parts) {
  const box = new THREE.BoxGeometry(w,h,d);
  const triangles = box.toNonIndexed();
  box.dispose();
  triangles.translate(x,y,z);
  const tint = new THREE.Color(palette[finish]);
  positions.push(...triangles.attributes.position.array);
  normals.push(...triangles.attributes.normal.array);
  for (let point=0; point<triangles.attributes.position.count; point++) colors.push(tint.r,tint.g,tint.b);
  triangles.dispose();
 }
 const mesh = new THREE.BufferGeometry();
 mesh.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 mesh.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
 mesh.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
 mesh.computeBoundingSphere();
 return mesh;
}

function trbCargoType(ring, type) {
 if (ring === 'cmd') return 'command';
 if (ring === 'event') return 'event';
 // These prefixes come from the existing Transfer Ring stage names.
 return type.split(' ',1)[0].toLowerCase();
}

function trbCargoTag(text, ink, width) {
 const canvas = document.createElement('canvas');
 canvas.width = 512;
 canvas.height = 128;
 const ctx = canvas.getContext('2d');
 ctx.fillStyle = '#1c292b';
 ctx.fillRect(0,0,512,128);
 ctx.strokeStyle = ink;
 ctx.lineWidth = 6;
 ctx.strokeRect(6,6,500,116);
 ctx.fillStyle = ink;
 ctx.textAlign = 'center';
 ctx.font = 'bold 72px monospace';
 ctx.fillText(text,256,89,480);
 const map = new THREE.CanvasTexture(canvas);
 map.colorSpace = THREE.SRGBColorSpace;
 return new THREE.Mesh(new THREE.PlaneGeometry(width,width/4),
  new THREE.MeshBasicMaterial({map}));
}

function createTRBCargo(ring, trb) {
 const type = trbCargoType(ring,trb.type);
 const key = ring + '/' + type;
 if (!trbCargoCache.has(key)) {
  const base = [[0,-.126,0,.52,.068,.348,'base'],
   [-.232,-.075,0,.043,.044,.340,'bare'], [.232,-.075,0,.043,.044,.340,'bare'],
   [0,-.036,.100,.394,.056,.095,'dark'],
   [-.205,-.085,-.153,.075,.052,.034,'ring'], [.205,-.085,-.153,.075,.052,.034,'ring']];
  trbCargoCache.set(key,trbCargoGeometry([...base,...trbCargoShapes[type]],ring));
 }
 trbCargoBodyMaterial ??= new THREE.MeshStandardMaterial({vertexColors:true,roughness:.57,metalness:.37});
 trbCargoLampGeometry ??= new THREE.BoxGeometry(.16,.018,.034);
 const body = new THREE.Group();
 body.name = `TRB cargo · ${type}`;
 const hull = new THREE.Mesh(trbCargoCache.get(key),trbCargoBodyMaterial);
 hull.receiveShadow = true;
 body.add(hull);
 const lampMaterial = new THREE.MeshStandardMaterial({roughness:.48,metalness:.1});
 const head = new THREE.Mesh(trbCargoLampGeometry,lampMaterial);
 head.position.set(0,.138,-.052);
 const lip = new THREE.Mesh(trbCargoLampGeometry,lampMaterial);
 lip.position.set(0,.002,.118);
 body.add(head,lip);
 const ink = '#' + trbCargoPalette[ring].toString(16);
 const transferText = type.toUpperCase();
 const eventText = `${trb.type==='Command Completion'?'CMD CCE':'XFER EVENT'} · ${trb.completionCode==='Success'?'OK':'ERROR'}`;
 const title = ring==='transfer' ? transferText : ring==='cmd' ? trb.type.split(' · ')[0].toUpperCase() : eventText;
 const label = trbCargoTag(`#${trb.id} ${title}`,ink,ring==='event'?.94:.87);
 const plaque = trbCargoTag(ring==='transfer'?transferText:ring==='cmd'?'CMD':'EVENT',ink,.31);
 plaque.rotation.x = -Math.PI/2;
 plaque.position.set(0,-.006,.103);
 body.add(plaque);

 return {
  body,label,
  setState(state) {
   if (body.userData.state===state) return;
   body.userData.state = state;
   const [color,intensity] = trbCargoStates[state];
   lampMaterial.color.setHex(color);
   lampMaterial.emissive.setHex(color);
   lampMaterial.emissiveIntensity = intensity;
  },
  dispose() {
   lampMaterial.dispose();
   for (const tag of [label,plaque]) {
    tag.geometry.dispose();
    tag.material.map.dispose();
    tag.material.dispose();
   }
  }
 };
}
