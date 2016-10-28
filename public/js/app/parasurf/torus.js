define(function(require, exports, module) {
	var ps = require('app/parasurf-calc');

	return function() {
	    var PI = Math.PI,
	        cos = Math.cos,
	        sin = Math.sin;
	    return {
	        calc: function(ur, vr, p, t, ff) {
	            function func(_u, _v) {
	                var u = ur.off + _u * ur.scale,
	                    v = vr.off + _v * vr.scale,
	                    R = p[0],
	                    r = p[1],
	                    x = cos(u) * (R + r * cos(v)),
	                    y = sin(u) * (R + r * cos(v)),
	                    z = r * sin(v);
                    return {xyz: [x,y,z], uv0: [u,v,0]};
	            }
	            return ps.calcParametricGeometry(func, ur, vr, t, ff);
	        },
	        domain: [
	            {name:'u', min:-PI, max:PI, steps:60, pi:true},
	            {name:'v', min:-PI, max:PI, steps:60, pi:true},
	        ],
	        param: [
	            {name:'R', min:0, max:4, step:0.1, init:2},
	            {name:'r', min:0, max:4, step:0.1, init:1},
	        ],
	    };
	}
});
