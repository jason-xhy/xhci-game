'use strict';

const yardDrumReflection = {value:new THREE.Vector4(0,0,0,0)};
const yardDrumEnabled = {value:1};

function registerYardDrumReflection(x,z,bounds) {
 const radius = Math.max(bounds.max.x-bounds.min.x,bounds.max.z-bounds.min.z)*.5;
 yardDrumReflection.value.set(x,z,radius,bounds.max.y);
}

// Use the scene's sky as the reflected environment. This adds a wet-surface
// highlight without rendering the whole yard a second time.
for (const mesh of scene.children) {
 const material = mesh.material;
 if (material?.name !== 'Yard wet surface') continue;

 material.onBeforeCompile = shader => {
  shader.uniforms.yardSky = {value:yardSkyTexture};
  shader.uniforms.yardDrum = yardDrumReflection;
  shader.uniforms.yardDrumEnabled = yardDrumEnabled;
  shader.vertexShader = 'varying vec3 wetWorldPosition;\n' + shader.vertexShader.replace(
   '#include <worldpos_vertex>',
   `#include <worldpos_vertex>
    vec4 wetPosition = vec4(transformed, 1.0);
    #ifdef USE_INSTANCING
     wetPosition = instanceMatrix * wetPosition;
    #endif
    wetWorldPosition = (modelMatrix * wetPosition).xyz;`);
  shader.fragmentShader = `uniform sampler2D yardSky;
// xz center, radius, height. Only the first barrel is represented here.
uniform vec4 yardDrum;
uniform float yardDrumEnabled;
varying vec3 wetWorldPosition;

vec4 reflectedDrum(vec3 groundPoint,vec3 ray) {
 vec2 offset = groundPoint.xz-yardDrum.xy;
 if (yardDrumEnabled < 0.5 || yardDrum.w <= 0.0 || dot(offset,offset)>9.0) return vec4(0.0);
 float a = dot(ray.xz,ray.xz);
 if (a<0.0001) return vec4(0.0);
 float b = dot(offset,ray.xz);
 float c = dot(offset,offset)-yardDrum.z*yardDrum.z;
 float discriminant = b*b-a*c;
 if (discriminant<=0.0) return vec4(0.0);
 float depth = (-b-sqrt(discriminant))/a;
 if (depth<=0.0) return vec4(0.0);
 float h = groundPoint.y+ray.y*depth;
 if (h<0.0 || h>yardDrum.w) return vec4(0.0);
 float relativeHeight = h/yardDrum.w;
 float bands = max(1.0-smoothstep(0.009,0.035,abs(relativeHeight-0.30)),
  1.0-smoothstep(0.009,0.035,abs(relativeHeight-0.65)));
 bands = max(bands,1.0-smoothstep(0.008,0.027,abs(relativeHeight-0.97)));
 vec2 surfaceNormal = normalize(offset + depth*ray.xz);
 float faceLight = 0.69+0.31*max(0.0,dot(surfaceNormal,normalize(vec2(-0.55,-0.84))));
 vec3 bluePaint = vec3(0.028,0.050,0.086)*faceLight;
 vec3 hoopPaint = vec3(0.076,0.101,0.129)*faceLight;
 float edge = smoothstep(0.0,0.009,sqrt(discriminant));
 return vec4(mix(bluePaint,hoopPaint,bands),edge*0.90);
}
` + shader.fragmentShader.replace(
   '#include <opaque_fragment>',
   `vec3 incident = normalize(wetWorldPosition - cameraPosition);
    vec2 ground = wetWorldPosition.xz;
    vec3 wetNormal = normalize(vec3(
      sin(ground.x * 9.0 + ground.y * 5.0) * 0.016,
      1.0,
      cos(ground.y * 11.0 - ground.x * 7.0) * 0.013
    ));
    vec3 skyRay = reflect(incident, wetNormal);
    vec2 skyUV = vec2(fract(atan(skyRay.z, -skyRay.x) * 0.1591549431),
      1.0 - acos(clamp(skyRay.y, -1.0, 1.0)) * 0.3183098862);
    vec3 reflectedSky = texture2D(yardSky, skyUV).rgb;
    vec4 localDrum = reflectedDrum(wetWorldPosition,skyRay);
    reflectedSky = mix(reflectedSky,localDrum.rgb,localDrum.a);
    float grazing = pow(1.0 - clamp(dot(-incident, wetNormal), 0.0, 1.0), 4.0);
    outgoingLight = mix(outgoingLight, reflectedSky, 0.13 + grazing * 0.57);
    #include <opaque_fragment>`);
 };
 material.needsUpdate = true;
}
