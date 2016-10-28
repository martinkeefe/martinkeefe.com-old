define(function(require, exports, module) {
	var ps = require('app/parasurf-calc');

	return function() {
		var PI = Math.PI,
			cos = Math.cos,
			sin = Math.sin,
			B = Math.SQRT2,
			A = 2/3;
		return {
			calc: function(ur, vr, p, t) {
				function func(_u, _v) {
					var u = ur.off + _u * ur.scale,
						v = vr.off + _v * vr.scale,
						x = A*(cos(u)*cos(2*v) + B*sin(u)*cos(v)) * cos(u) /
						    (B - sin(2*u)*sin(3*v)),
						y = A*(cos(u)*sin(2*v) - B*sin(u)*sin(v)) * cos(u) /
						    (B - sin(2*u)*sin(3*v)),
						z = B*cos(u)*cos(u) /
						    (B - sin(2*u)*sin(3*v));
                    return {xyz: [x,y,z], uv0: [u,v,0]};
				}
				return ps.calcParametricGeometry(func, ur, vr, t);
			},
			domain: [
				{name:'u', min:0, max:PI, steps:60, pi:true},
				{name:'v', min:0, max:PI, steps:60, pi:true},
			],
			param: [
			],
		};
	}
});
