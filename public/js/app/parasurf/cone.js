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
                        x = u * cos(v),
                        y = u * sin(v),
                        z = u;
                    return {xyz: [x,y,z], uv0: [u,v,0]};
                }
                return ps.calcParametricGeometry(func, ur, vr, t, ff);
            },
            domain: [
                {name:'u', min:-2, max:2, steps:12},
                {name:'v', min:-PI, max:PI, steps:60, pi:true},
            ],
        };
    }
});
