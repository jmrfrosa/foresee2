#ifdef GL_ES
  precision highp float;
#endif

// Samplers (built-in)
varying vec2 vUV;
varying vec3 vPositionW;

// Samplers (user)
uniform sampler2D bufferTexture;
uniform sampler2D webcamTexture;
uniform sampler2D audioSampler;
uniform float time;

#define MAX_OFFSET 10.

float rand(float co) {
  return fract(sin(co*(91.3458)) * 47453.5453);
}

void main(void)
{
  vec2 texel = 1. / vUV.xy;
  float modTime = time * 0.01;

  vec4 img = texture(bufferTexture, vUV);
  vec2 uv = vUV.xy;

  float fft = texture2D(audioSampler, vec2(uv.x * 0.25, 0)).r;
  vec4 fft_color = vec4(uv * pow(fft, 5.0), 0, 1);

  // float offset_modulator = (sin(sin(modTime*0.5))*2.0+1.3);
  float offset_modulator = (fft * 2.0);
  float offset_shaker = fft * 0.025 * sin(modTime);

  // you can try and comment / uncomment these three lines
  float step_y = 0.001 * texel.y * (rand(uv.x) * MAX_OFFSET) * offset_modulator;	// modulate offset
  //float step_y = texel.y*(rand(uv.x)*100.);										// offset without modulation
  step_y += rand(uv.x * uv.y * modTime) * offset_shaker;								// shake offset and modulate it
  step_y = mix(step_y, step_y * rand(uv.x * modTime) * 0.5, sin(modTime)); 					// more noisy spikes

  if ( dot(img,  vec4(0.299, 0.587, 0.114, 0.) ) > 1.2 * (fft * 0.325 + 0.50)){
    uv.y += step_y;
  } else{
    uv.y -= step_y;
  }

  img = texture(webcamTexture, uv);
  // gl_FragColor = mix(img, fft_color * -1., 0.5);
  gl_FragColor = img + fft_color;
}
