#ifdef GL_ES
  precision highp float;
#endif

// Samplers (built-in)
varying vec2 vUV;
uniform sampler2D textureSampler;

// Samplers (user)
uniform sampler2D displayVideoSampler;

// attributes
uniform float blendingLayerAlpha;
uniform float mixAlpha;

float hardLight(float s, float d)
{
	return (s < 0.5) ? 2.0 * s * d : 1.0 - 2.0 * (1.0 - s) * (1.0 - d);
}

vec3 hardLight(vec3 s, vec3 d)
{
	vec3 c;
	c.x = hardLight(s.x, d.x);
	c.y = hardLight(s.y, d.y);
	c.z = hardLight(s.z, d.z);
	return c;
}

void main(void)
{
  vec4 baseColor = texture2D(textureSampler, vUV);
  vec4 displayVideoColor = texture2D(displayVideoSampler, vUV);

  vec4 blend = vec4(hardLight(baseColor.xyz, displayVideoColor.xyz), blendingLayerAlpha); // 1.0

  gl_FragColor = mix(baseColor, blend, mixAlpha); // 0.4
}
