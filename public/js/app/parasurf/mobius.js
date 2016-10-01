define(function(require, exports, module) {
    var THREE = require('three');
    var ps = require('app/parasurf');

    return function() {
        var PI = Math.PI,
            SQRT2 = Math.SQRT2,
            cos = Math.cos,
            sin = Math.sin;
        return [
            {
                calc: function(u_dom, v_dom, p, t) {
                    function func(_u, _v) {
                        var r = p[0],
                            w = p[1],
                            u = u_dom.off + _u * u_dom.scale,
                            v = v_dom.off + _v * v_dom.scale,
                            x = (1 + w*v*cos(u/2)) * cos(u) * r,
                            y = (1 + w*v*cos(u/2)) * sin(u) * r,
                            z = w*v*sin(u/2);
                        return {xyz: [x, y, z], uv0: [u,v,0]};
                    }
                    return ps.calcParametricGeometry(func, u_dom, v_dom, t);
                },
                domain: [
                    {name:'u', min:-PI, max:PI, steps:60, pi:true},
                    {name:'v', min:-1/2, max:1/2, steps:12},
                ],
                param: [
                    {name:'r', min:0, max:4, step:0.1, init:2},
                    {name:'w', min:0, max:4, step:0.1, init:1},
                ],
                view: {
                    distance: 5,
                },
            },
            {
                name: "Centre circle",
                calc: function(u_dom, v_dom, p, t) {
                    function func(_u, _v, i, j) {
                        if (j === 0) {
                            var r = p[0];
                            //var w = p[1];
                            var u = u_dom.off + _u * u_dom.scale;
                            var x = cos(u) * r;
                            var y = sin(u) * r;
                            var z = 0;
                        return {xyz: [x,y,z], uv0: [u,0,0]};
                        }
                    }
                    return {wire: ps.calcParametricWireGeometry(func, u_dom, v_dom, t)};
                },
                is_surface: false,
                show: true
            },
            {
                name: "Boundary",
                calc: function(u_dom, v_dom, p, t) {
                    function func1(_u, _v, i, j) {
                        if (j === 0) {
                            var r = p[0];
                            var w = p[1];
                            var u = u_dom.off + _u * u_dom.scale;
                            var v = v_dom.off + _v * v_dom.scale;
                            x = (1 + w*v*cos(u/2)) * cos(u) * r,
                            y = (1 + w*v*cos(u/2)) * sin(u) * r,
                            z = w*v*sin(u/2);
                        return {xyz: [x,y,z], uv0: [u,v,0]};
                        }
                    }
                    var wire1 = ps.calcParametricWireGeometry(func1, u_dom, v_dom, t);
                    function func2(_u, _v, i, j) {
                        if (j === v_dom.num) {
                            var r = p[0];
                            var w = p[1];
                            var u = u_dom.off + _u * u_dom.scale;
                            var v = v_dom.off + _v * v_dom.scale;
                            x = (1 + w*v*cos(u/2)) * cos(u) * r,
                            y = (1 + w*v*cos(u/2)) * sin(u) * r,
                            z = w*v*sin(u/2);
                        return {xyz: [x,y,z], uv0: [u,v,0]};
                        }
                    }
                    var wire2 = ps.calcParametricWireGeometry(func2, u_dom, v_dom, t);
                    return [wire1,wire2];
                },
                is_surface: false,
                show: true
            },
        ];
    }
});
