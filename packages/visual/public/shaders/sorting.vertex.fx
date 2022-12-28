precision highp float;

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// Uniforms
uniform mat4 world;
uniform mat4 worldViewProjection;
uniform sampler2D audioSampler;
uniform float time;

// Varying
varying vec3 vPositionW;
varying vec3 vNormalW;
varying vec2 vUV;

void main(void) {
  float fft = texture2D(audioSampler, vec2(uv.x * 0.25, 0)).r;

  vec3 v = position;

  v.x += sin( 2. * position.y + (time * 0.001)) * 0.1 * fft;
  v.y += cos( 2. * position.x + (time * 0.001)) * 0.1 * fft;
  v.z += sin((pow(v.x, 2.) + pow(v.y, 2.)) * (time * 0.001)) * fft;

  vec4 outPosition = worldViewProjection * vec4(v, 1.0);
  gl_Position = outPosition;

  vPositionW = vec3(world * vec4(v, 1.0));
  vNormalW = normalize(vec3(world * vec4(normal, 0.0)));
  vUV = uv;
}
