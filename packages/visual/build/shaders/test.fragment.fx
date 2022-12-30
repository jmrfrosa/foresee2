#ifdef GL_ES
  precision highp float;
#endif

// Samplers (built-in)
varying vec2 vUV;
uniform sampler2D textureSampler;

// Samplers (user)
uniform sampler2D displayVideoSampler;

// Parameters
uniform vec2 screenSize;
uniform float threshold;
uniform float time;

// Fractal: https://www.shadertoy.com/view/llB3W1
// const int iters = 150;

// int fractal(vec2 p, vec2 point) {
// 	vec2 so = (-1.0 + 2.0 * point) * 0.4;
// 	vec2 seed = vec2(0.098386255 + so.x, 0.6387662 + so.y);

// 	for (int i = 0; i < iters; i++) {
// 		if (length(p) > 2.0) {
// 			return i;
// 		}
// 		vec2 r = p;
// 		p = vec2(p.x * p.x - p.y * p.y, 2.0* p.x * p.y);
// 		p = vec2(p.x * r.x - p.y * r.y + seed.x, r.x * p.y + p.x * r.y + seed.y);
// 	}

// 	return 0;
// }

// vec3 color(int i) {
// 	float f = float(i)/float(iters) * 2.0;
// 	f=f*f*2.;
// 	return vec3((sin(f*2.0)), (sin(f*3.0)), abs(sin(f*7.0)));
// }

void main(void)
{
  // vec2 texelSize = vec2(1.0 / screenSize.x, 1.0 / screenSize.y);
  vec4 baseColor = texture2D(textureSampler, vUV);
  vec4 displayVideoColor = texture2D(displayVideoSampler, vUV);

  float mixAlpha = 0.5;
  if (displayVideoColor.xyz == vec3(0.0)) {
    mixAlpha = 1.0;
  }

  // vec2 position = 3. * (-0.5 + gl_FragCoord.xy / screenSize.xy );

  /*
  if (baseColor.r < threshold) {
    gl_FragColor = baseColor;
  } else {
    gl_FragColor = vec4(0);
  }
  */

  // vec3 a = color(fractal(position/1.6,vec2(0.6+cos(time/2.+0.5)/2.0,1.)));
  // vec3 c = color(fractal(position, vec2(10.1 + sin(time/3.) / 12.0, 1.)));
  // vec4 c4 = vec4(c, sin(time));

  // vec4 oo = c4 + vec4(a, 0.3);

  // gl_FragColor = vec4(baseColor.r, pow(sin(time * baseColor.g), 2.), baseColor.b, baseColor.a);

  // gl_FragColor = mix(oo, baseColor, 0.9);
   gl_FragColor = mix(displayVideoColor, baseColor, mixAlpha);
}
