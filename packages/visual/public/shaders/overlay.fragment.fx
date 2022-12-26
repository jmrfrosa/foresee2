#ifdef GL_ES
  precision highp float;
#endif

// Samplers (built-in)
varying vec2 vUV;
uniform sampler2D textureSampler;

// Samplers (user)
uniform sampler2D displayVideoSampler;

void main(void)
{
  vec4 baseColor = texture2D(textureSampler, vUV);
  vec4 displayVideoColor = texture2D(displayVideoSampler, vUV);

  float mixAlpha = 0.5;
  if (displayVideoColor.xyz == vec3(0.0)) {
    mixAlpha = 1.0;
  }

   gl_FragColor = mix(displayVideoColor, baseColor, mixAlpha);
}
