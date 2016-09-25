define(function(require, exports, module) {
    var ps = require('app/parasurf');

    return function() {
        var PI = Math.PI,
            cos = Math.cos,
            sin = Math.sin;
        return {
            calc: function(ur, vr, p, t, ff) {
                var c = p[0];
                function _fn(_u, _v) {
                    var u = ur.off + _u * ur.scale,
                        v = vr.off + _v * vr.scale,
                        cosv = cos(v),
                        x = (c + cosv) * cos(u),
                        y = (c + cosv) * sin(u),
                        z = sin(v) + cosv;
                    return {xyz: [x,y,z], uv0: [u,v,0]};
                }
                return ps.calcParametricGeometry(_fn, ur, vr, t, ff);
            },
            domain: [
                {name:'u', min:-PI, max:PI, steps:60, pi:true},
                {name:'v', min:-PI, max:PI, steps:60, pi:true},
            ],
            param: [
                {name:'c', min:-2, max:2, step:0.1, init:1},
            ],
        };
    }
});
