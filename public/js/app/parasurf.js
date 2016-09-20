function vlerp(v1, v2, t) {
    return [
        lerp(v1[0], v2[0], t),
        lerp(v1[1], v2[1], t),
        lerp(v1[2], v2[2], t),
    ];
}

function calcParametricGeometry( func, ur, vr, t, facefn ) {
    var MULT = 1,
        slices = ur.num * MULT,
        stacks = vr.num * MULT;
    var body_geometry = new THREE.Geometry();

    var verts = body_geometry.vertices;
    var faces = body_geometry.faces;
    var uvs = body_geometry.faceVertexUvs[ 0 ];

    var i, il, j, p;
    var u, v;

    var stackCount = stacks + 1;
    var sliceCount = slices + 1;

    var wire_geometry = new THREE.Geometry();

    for ( i = 0; i <= stacks; i ++ ) {
        v = i / stacks;
        for ( j = 0; j <= slices; j ++ ) {
            u = j / slices;
            p = func( u, v );
            if (t < 1) {
                p = vlerp([(u*ur.scale) + ur.off, (v*vr.scale) + vr.off, 0], p, t);
            }
            verts.push( new THREE.Vector3(p[0], p[1], p[2]) );
        }
    }

    /*
      i ^
        | d----c
        | |    |
        | a----b
        +-------->
                 j
    */
    var a, b, c, d;
    var uva, uvb, uvc, uvd;
    var show;

    function vec2(vs) { return new THREE.Vector2(vs[0], vs[1]); }

    for ( i = 0; i < stacks; i ++ ) {
        for ( j = 0; j < slices; j ++ ) {
            a = i * sliceCount + j;
            b = i * sliceCount + j + 1;
            c = (i + 1) * sliceCount + j + 1;
            d = (i + 1) * sliceCount + j;

            uva = [j / slices, i / stacks];
            uvb = [( j + 1 ) / slices, i / stacks];
            uvc = [( j + 1 ) / slices, ( i + 1 ) / stacks];
            uvd = [j / slices, ( i + 1 ) / stacks];

            show = true;
            if (facefn)
                show = facefn(i, j, ur, vr, uva[0], uva[1]);

            if (show) {
                faces.push( new THREE.Face3( a, b, d ) );
                uvs.push( [ vec2(uva), vec2(uvb), vec2(uvd) ] );

                faces.push( new THREE.Face3( b, c, d ) );
                uvs.push( [ vec2(uvb), vec2(uvc), vec2(uvd) ] );
            }

            var va = verts[a].clone(),
                vb = verts[b].clone(),
                vc = verts[c].clone(),
                vd = verts[d].clone();

            if (i % MULT == 0)
                wire_geometry.vertices.push( va,vb );
            if (j % MULT == 0)
                wire_geometry.vertices.push( va,vd );

            if (i === stacks - 1)
                wire_geometry.vertices.push( vc,vd );
            if (j === slices - 1)
                wire_geometry.vertices.push( vb,vc);
        }
    }

    //body_geometry.computeCentroids();
    body_geometry.computeFaceNormals();
    body_geometry.computeVertexNormals();

    wire_geometry.computeLineDistances();

    return {
        body: body_geometry,
        wire: wire_geometry,
    };
};
function ubands(num, skip) {
    return function(i, j) {
        return i % (num + skip) < num;
    };
}
function vbands(num, skip) {
    return function(i, j) {
        return j % (num + skip) < num;
    };
}
function bands(num, skip) {
    return function(i, j) {
        return i % (num + skip) < num || j % (num + skip) < num;
    };
}

function domain(dom, _lo, _hi)
{
    var lo  = _lo  || 0,
        hi  = _hi  || 1,
        rng = hi - lo,
        ful = dom.max - dom.min,
        lo_ = dom.min + lo * ful,
        hi_ = dom.min + hi * ful,
        num = Math.floor(rng * dom.steps);

    return _.extend(_.clone(dom), {lo:_lo, hi:_hi, off: lo_, scale:(hi_-lo_), num:num});
}

function ennepersSurface(ur, vr, p) {
    function func(_u, _v) {
        var u = ur.off + _u * ur.scale,
            v = vr.off + _v * vr.scale,
            x = u - (u*u*u/3) + u*v*v,
            y = v - (v*v*v/3) + u*u*v,
            z = u*u - v*v;
        return new THREE.Vector3(x, y, z);
    }
    return {
        calc: function() {
            return calcParametricGeometry(func, ur.num, vr.num);
        },
        domain: [
            domain(0, 1, 40, -4, 4),
            domain(0, 1, 40, -1, 1),
        ],
        param: [],
    };
}

function parasurf(elem_id, shape_def){
    var scene,
        camera,
        renderer,
        controls;

    var body_material = new THREE.MeshNormalMaterial( { side:THREE.DoubleSide, //opacity: 0.5,
                polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 } ),
        wire_material = new THREE.LineBasicMaterial( { color: 0x000000 } ),
        body_mesh,
        wire_lines,
        axis;

    var shape = shape_def(),
        dom = [domain(shape.domain[0], 0, 1),
               domain(shape.domain[1], 0, 1)],
        param = [1,1,1],
        t = 1,
        root = new THREE.Object3D(),
        group;

    var animate = true,
        show_wires = true,
        show_faces = true,
        show_axes = true;

    function setup(canvas, width, height) {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
        renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas, stencil: false});

        renderer.setSize(width, height);
        renderer.setClearColor(0x333344); //0xECEADF); #334

        controls = new THREE.TrackballControls( camera, renderer.domElement );

        camera.position.z = 5;
        if ('view' in shape && 'distance' in shape.view)
            camera.position.z = shape.view.distance;

        var nudge = Math.PI / 8;
        root.rotation.x = 0;
        root.rotation.y = nudge;
        root.rotation.z = 0;
        scene.add( root );
    }

    function toggleView(id, name, checked) {
        var frag = $(_.template(
            '<input type="checkbox" id="<%=id%>" <%=checked%>/><label for="<%=id%>"><%=name%></label>',
            {id:id, name:name, checked:(checked?'checked ':'')}));
        //frag[0].checked = checked;
        return _.map(frag, function (x) { return x.outerHTML; }).join('');
    }
    function slideView(id, left, right, cls) {
        //console.log( param );
        return _.template(
            '<tr class="<%=cls%>"><td class="math" style="text-align: right;"><span>\\(<%= left %>\\)</span></td>' +
            '<td width="100%"><div id="<%= id %>-slide"></div></td>' +
            '<td class="math"><span id="<%= id %>-txt" style="width: 110px">\\(<%= right %>\\)</span></td></tr>',
            {id:id, left:left, right:right, cls:cls||''});
    }

    function paramView(index, param) {
        return slideView('p' + index, param.name + " =", param.init.toFixed(1), 'green');
    }
    function lerpView() {
        return slideView('t', "t =", "1.00", 'yellow');
    }
    function domainView(i, dmn) {
        return slideView(dom[i].name, dom[i].name + " \\in", domainText(i), 'violet');
    }
    function paramControl(i, name, _min, _max, _step, _init) {
        var min = _min || 0,
            max = _max || 1,
            step = _step || 0.1,
            init = _init || 1;

        param[i] = init;
        $("#p"+i+"-slide").slider({
            max: max, min: min, step: step, value: init,
            slide: function( event, ui ) {
                param[i] = ui.value;
                root.remove( group );
                group = makeShape();
                root.add( group );
                var math = MathJax.Hub.getAllJax("p"+i+"-txt")[0];
                MathJax.Hub.Queue(["Text", math, param[i].toFixed(1)]);
            }
        });
    }
    function lerpControl() {
        t = 1;
        $("#t-slide").slider({
            max: 1, min: 0, step: 0.01, value: 1,
            slide: function( event, ui ) {
                t = ui.value;
                root.remove( group );
                group = makeShape();
                root.add( group );
                var math = MathJax.Hub.getAllJax("t-txt")[0];
                MathJax.Hub.Queue(["Text", math, t.toFixed(2)]);
            }
        });
    }

    function domainText(i) {
        var pi = dom[i].pi === true ? Math.PI : 1,
            lo = dom[i].off / pi,
            hi = (dom[i].off + dom[i].scale) / pi;

        if (pi !== 1)
            return "[" + lo.toFixed(2) + "\\pi," + hi.toFixed(2) + "\\pi)";
        else
            return "[" + lo.toFixed(2) + "," + hi.toFixed(2) + ")";
    }
    function domainControl(i, dmn) {
        $("#"+dmn.name+"-slide").slider({
            range: true, min: 0, max: 1, step: 1/36, values: [0,1],
            slide: function( event, ui ) {
                var lo = ui.values[0],
                    hi = ui.values[1];
                dom[i] = domain(dmn, lo, hi);

                root.remove( group );
                group = makeShape();
                root.add( group );

                var math = MathJax.Hub.getAllJax(dmn.name+"-txt")[0];
                MathJax.Hub.Queue(["Text", math, domainText(i)]);
            }
        });
    }

    function paramsView(params) {
        var ps = imap(params, paramView);
        ps.push(domainView(0, shape.domain[0]));
        ps.push(domainView(1, shape.domain[1]));
        ps.push(lerpView());
        ps = ps.join('');

        var tmplt = _.template("<table border=0 cellpadding=0 cellspacing=2><%= ps %></table>");
        return tmplt({ps:ps});
    }

    function paramUI()
    {
        var names = _.map(shape.param, function (p) { return p.name; });
        $("#params").html(paramsView(shape.param));

        ieach(shape.param, function (i, p) {
            paramControl(i, p.name, p.min, p.max, p.step, p.init);
        });
        domainControl(0, shape.domain[0]);
        domainControl(1, shape.domain[1]);
        lerpControl();

        group = makeShape();
        root.add( group );
    }

    /*function toggleBtn(id, name, checked, onclick) {
        var btn = $(_.template(
            '<input type="checkbox" id="<%=id%>" style="margin: 4px" /><label for="<%=id%>"><%=name%></label>',
            {id:id, name:name}));
        btn[0].checked = checked;
        //btn.button().click(onclick);
        return btn;
    }*/

    function UI(elem_id) {
        var elem = $('#'+elem_id),
            canvas = $('<canvas width=' + elem.width() + ' height=' + elem.width()*0.75 + '></canvas>');

        elem.append(canvas);
        setup(canvas.get(0), canvas.width(), canvas.height());

        var html = '<table border=0 cellpadding=0 cellspacing=2 style="width: 100%;"><tr><td style="padding-right: 1em;">' +
            toggleView('ani-btn', 'Tumble', animate) +
            toggleView('wire-btn', 'Wireframe', show_wires) +
            //toggleView('face-btn', 'Faces', show_faces) +
            toggleView('axes-btn', 'Axes', show_axes) +
            "</td><td id=\"params\" width=\"100%\"></td></tr></table>";
        //console.log( html );
        canvas.after(html);

        $('#ani-btn').button().click( function() {
            //console.log( $(this)[0] );
            animate = $(this)[0].checked;
        });
        $('#wire-btn').button().click( function() {
            //console.log( $(this)[0] );
            show_wires = $(this)[0].checked;
            if (show_wires)
                group.add(wire_lines);
            else
                group.remove(wire_lines);
        });
        $('#face-btn').button().click( function() {
            //console.log( $(this)[0] );
            show_faces = $(this)[0].checked;
            if (show_faces)
                group.add(body_mesh);
            else
                group.remove(body_mesh);
        });
        $('#axes-btn').button().click( function() {
            //console.log( $(this)[0] );
            show_axes = $(this)[0].checked;
            if (show_axes)
                group.add(axis);
            else
                group.remove(axis);
        });
        paramUI();
    }

    function makeShape() {
        var geom = shape.calc(dom[0], dom[1], param, t), //, bands(1,3)),
            group = new THREE.Object3D();

        body_mesh = new THREE.Mesh( geom.body.clone(), body_material );
        wire_lines = new THREE.Line( geom.wire.clone(), wire_material, THREE.LinePieces );
        axis = new THREE.AxisHelper();

        if (show_axes)
            group.add( axis );
        if (show_faces)
            group.add( body_mesh );
        if (show_wires)
            group.add( wire_lines );

        return group;
    }

    function loop() {
        if (animate) {
            root.rotation.x += 0.005;
            root.rotation.y += 0.003;
            root.rotation.z += 0.001;
        }
        renderer.render(scene, camera);
        controls.update();
    }

    UI(elem_id);
    Animator.add( loop );
}
