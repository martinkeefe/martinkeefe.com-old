define(function(require, exports, module) {
    var ps = require('app/parasurf');

    return function() {
        var PI = Math.PI,
            SQRT2 = Math.SQRT2,
            cos = Math.cos,
            sin = Math.sin;
        return {
            calc: function(ur, vr, p, t, ff) {
                function func(_u, _v) {
                    var u = ur.off + _u * ur.scale,
                        v = vr.off + _v * vr.scale,
                        x = -cos(u) / (SQRT2 + sin(v)),
                        y = sin(u) / (SQRT2 + sin(v)),
                        z = 1 / (SQRT2 + cos(v));
                    return {xyz: [x,y,z], uv0: [u,v,0]};
                }
                return ps.calcParametricGeometry(func, ur, vr, t, ff);
            },
            domain: [
                {name:'u', min:-PI, max:PI, steps:60, pi:true},
                {name:'v', min:-PI, max:PI, steps:60, pi:true},
            ],
            param: [
            ],
        };
    }
});
