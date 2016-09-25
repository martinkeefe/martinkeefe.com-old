define(function(require, exports, module) {
    var ps = require('app/parasurf');

    return function() {
        var PI = Math.PI,
            cos = Math.cos,
            sin = Math.sin;
        return {
            calc: function(ur, vr, p, t, ff) {
                function func(_u, _v) {
                    var u = ur.off + _u * ur.scale,
                        v = vr.off + _v * vr.scale,
                        r = p[0],
                        x = r * cos(u) * cos(v),
                        y = r * sin(u) * cos(v),
                        z = r * sin(v);
                    return {xyz: [x,y,z], uv0: [u,v,0]};
                }
                return ps.calcParametricGeometry(func, ur, vr, t, ff);
            },
            domain: [
                {name:'u', min:-PI, max:PI, steps:60, pi:true},
                {name:'v', min:-PI/2, max:PI/2, steps:60, pi:true},
            ],
            param: [
                {name:'r', min:0, max:4, step:0.1, init:3},
            ],
        };
    }
});

// cos(u)sin(v), sin(u)sin(v), cos(v)