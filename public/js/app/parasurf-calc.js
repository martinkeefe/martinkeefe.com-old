define(function(require, exports, module) {
    var $ = require('zepto');
    var THREE = require('three');

	function lerp(a, b, t) {
		return t * b + (1-t) * a;
	}

	function vlerp(v1, v2, t) {
		return [
			lerp(v1[0], v2[0], t),
			lerp(v1[1], v2[1], t),
			lerp(v1[2], v2[2], t),
		];
	}

	function calcParametricWireGeometry( func, u_dom, v_dom, t ) {
		var MULT = 1,
			slices = u_dom.num * MULT,
			stacks = v_dom.num * MULT;
		var body_geometry = new THREE.Geometry();

		var verts = body_geometry.vertices;
		var uvs = body_geometry.faceVertexUvs[ 0 ];

		var i, il, j, p;
		var u, v, pt;

		var stackCount = stacks + 1;
		var sliceCount = slices + 1;

		var wire_geometry = new THREE.Geometry();

		for ( i = 0; i <= stacks; i ++ ) {
			v = i / stacks;
			for ( j = 0; j <= slices; j ++ ) {
				u = j / slices;
				p = func( u, v, j, i );
				if (p) {
					if (t < 1) {
						//p = vlerp([(u*u_dom.scale) + u_dom.off, (v*v_dom.scale) + v_dom.off, 0], p, t);
						pt = vlerp(p.uv0, p.xyz, t);
					} else {
						pt = p.xyz;
					}
					verts.push( new THREE.Vector3(pt[0], pt[1], pt[2]) );
				}
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

				var va = verts[a] ? verts[a].clone() : null,
					vb = verts[b] ? verts[b].clone() : null,
					vc = verts[c] ? verts[c].clone() : null,
					vd = verts[d] ? verts[d].clone() : null;

				if (va && vb && i % MULT == 0)
					wire_geometry.vertices.push( va,vb );
				if (va && vd && j % MULT == 0)
					wire_geometry.vertices.push( va,vd );

				if (vc && vd && i === stacks - 1)
					wire_geometry.vertices.push( vc,vd );
				if (vb && vc && j === slices - 1)
					wire_geometry.vertices.push( vb,vc);
			}
		}

		wire_geometry.computeLineDistances();

		return wire_geometry;
	};

	function calcParametricGeometry( func, u_dom, v_dom, t, facefn ) {
		var MULT = 1,
			slices = u_dom.num * MULT,
			stacks = v_dom.num * MULT;
		var body_geometry = new THREE.Geometry();

		var verts = body_geometry.vertices;
		var faces = body_geometry.faces;
		var uvs = body_geometry.faceVertexUvs[ 0 ];

		var i, il, j, p;
		var u, v, pt;

		var stackCount = stacks + 1;
		var sliceCount = slices + 1;

		var wire_geometry = new THREE.Geometry();

		for ( i = 0; i <= stacks; i ++ ) {
			v = i / stacks;
			for ( j = 0; j <= slices; j ++ ) {
				u = j / slices;
				p = func( u, v, j, i );
				if (p) {
					if (t < 1) {
						//p = vlerp([(u*u_dom.scale) + u_dom.off, (v*v_dom.scale) + v_dom.off, 0], p, t);
						pt = vlerp(p.uv0, p.xyz, t);
					} else {
						pt = p.xyz;
					}
					verts.push( new THREE.Vector3(pt[0], pt[1], pt[2]) );
				}
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
					show = facefn(i, j, u_dom, v_dom, uva[0], uva[1]);

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

    exports.calcParametricWireGeometry = calcParametricWireGeometry;
	exports.calcParametricGeometry = calcParametricGeometry;
});
