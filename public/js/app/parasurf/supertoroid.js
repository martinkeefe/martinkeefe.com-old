define(function(require, exports, module) {
    var ps = require('app/parasurf');

    return function() {
        var PI = Math.PI,
            cos = Math.cos,
            sin = Math.sin,
            sgn = function (x) { return x < 0 ? -1 : (x > 0 ? 1 : 0); },
            pow = function (f,p) {
                if (Math.abs(f) < 0.00001) return 0;
                return sgn(f) * Math.pow(Math.abs(f), p);
            };
        return {
            calc: function(ur, vr, p, t, ff) {
                function func(_u, _v) {
                    var u = ur.off + _u * ur.scale,
                        v = vr.off + _v * vr.scale,
                        R = p[0],
                        r = p[1],
                        a = p[2],
                        b = p[3],
                        x = pow(cos(u),a) * (R + r * pow(cos(v),b)),
                        y = pow(sin(u),a) * (R + r * pow(cos(v),b)),
                        z = r * pow(sin(v),b);
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
                {name:'α', min:0, max:4, step:0.1, init:2},
                {name:'β' , min:0, max:4, step:0.1, init:2},
            ],
        };
    }
});
