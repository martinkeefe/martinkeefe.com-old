define(function(require, exports, module) {
    var $ = require('zepto');
    var _ = require('lodash');
    var THREE = require('three');
    require('TrackballControls');
    var ui = require('app/ui');

	var shapes = {
		'cone': require('app/parasurf/cone'),
		'sphere': require('app/parasurf/sphere'),
		'torus': require('app/parasurf/torus'),
		'elliptic-torus': require('app/parasurf/elliptic-torus'),
		'limpet-torus': require('app/parasurf/limpet-torus'),
		'supertoroid': require('app/parasurf/supertoroid'),
		'mobius': require('app/parasurf/mobius'),
		'boys-1': require('app/parasurf/boys-1'),
	};

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
//	function ubands(num, skip) {
//		return function(i, j) {
//			return i % (num + skip) < num;
//		};
//	}
//	function vbands(num, skip) {
//		return function(i, j) {
//			return j % (num + skip) < num;
//		};
//	}
//	function bands(num, skip) {
//		return function(i, j) {
//			return i % (num + skip) < num || j % (num + skip) < num;
//		};
//	}

	function domain(dom, lo, hi)
	{
		var rng = hi - lo,
			ful = dom.max - dom.min,
			lo_ = dom.min + lo * ful,
			hi_ = dom.min + hi * ful,
			num = Math.floor(rng * dom.steps);

		return _.extend(_.clone(dom), {lo:lo, hi:hi, off: lo_, scale:(hi_-lo_), num:num});
	}

//	function ennepersSurface(u_dom, v_dom, p) {
//		function func(_u, _v) {
//			var u = u_dom.off + _u * u_dom.scale,
//				v = v_dom.off + _v * v_dom.scale,
//				x = u - (u*u*u/3) + u*v*v,
//				y = v - (v*v*v/3) + u*u*v,
//				z = u*u - v*v;
//			return new THREE.Vector3(x, y, z);
//		}
//		return {
//			calc: function() {
//				return calcParametricGeometry(func, u_dom.num, v_dom.num);
//			},
//			domain: [
//				domain(0, 1, 40, -4, 4),
//				domain(0, 1, 40, -1, 1),
//			],
//			param: [],
//		};
//	}

	function parasurf(elem_id, shape_name){
		var scene;
		var camera;
		var renderer;
		var controls;

		var body_material;
		var wire_material = new THREE.LineBasicMaterial( { color: 0x000000 } );
		var extra_wire_material = [
			// No point setting a line width as it doesn't work on Windows
			new THREE.LineBasicMaterial( { color: 0x00FFFF } ),
			new THREE.LineBasicMaterial( { color: 0xFF00FF } ),
			new THREE.LineBasicMaterial( { color: 0xFFFF00 } )
		];
		var body_mesh;
		var wire_lines;
		var axes;
		var xyplane;

		var shape_def = shapes[shape_name];
		var shape = shape_def();
		var extras = [];

		if (_.isArray(shape)) {
			extras = shape.slice(1);
			shape = shape[0];
		}

		var dom = [domain(shape.domain[0], 0, 1),
				   domain(shape.domain[1], 0, 1)];
		var param = [1,1,1];
		var t = 1;
		var root = new THREE.Object3D();
		var group;

		var animate = false;
		var show_wires = true;
		var show_faces = true;
		var show_axes = true;
		var show_xyplane = true;
		var use_normals = false;

		function setup(canvas, width, height) {
			renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas, stencil: false});
			renderer.setSize(width, height);
			renderer.setClearColor(0x363241); // 10PB 2/2

			camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
			camera.position.z = 5;
			if ('view' in shape && 'distance' in shape.view)
				camera.position.z = shape.view.distance;

			controls = new THREE.TrackballControls( camera, renderer.domElement );

			var nudge = Math.PI / 8;
			root.rotation.x = -Math.PI/4;
			root.rotation.y = 0;
			root.rotation.z = Math.PI/4;

			makeScene();
		}

		function makeScene() {
			scene = new THREE.Scene();

			// Lighting
			if (use_normals) {
				body_material = new THREE.MeshNormalMaterial( { side:THREE.DoubleSide,
							polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 } );
			} else {
				body_material = new THREE.MeshLambertMaterial( { side:THREE.DoubleSide, color: 0xADA7E4, // 10PB 7/8
							polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 } );

				var lights = [];
				lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
				lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
				lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );
				lights[ 0 ].position.set( 0, 200, 0 );
				lights[ 1 ].position.set( 100, 200, 100 );
				lights[ 2 ].position.set( - 100, - 200, - 100 );
				scene.add( lights[ 0 ] );
				scene.add( lights[ 1 ] );
				scene.add( lights[ 2 ] );
			}

			scene.add( root );
		}

		function toggleView(id, name, checked) {
			var tmpl = _.template('<input type="checkbox" id="<%=id%>" <%=checked%>/><label for="<%=id%>" class="ui"><%=name%></label>');
			var frag = $(tmpl({id:id, name:name, checked:(checked?'checked ':'')}));
			//frag[0].checked = checked;
			return _.map(frag, function (x) { return x.outerHTML; }).join('');
		}
		function slideView(id, left, right, cls) {
			//console.log( param );
			return _.template(
				'<tr class="<%=cls%>">' +
					'<td width="20" style="text-align: center;"><span>\\(<%= left %>\\)</span></td>' +
					'<td width="380"><div id="<%= id %>-slide"></div></td>' +
					'<td width="100" nowrap><span id="<%= id %>-txt"><%= right %></span></td>' +
				'</tr>')(
				//'<tr class="<%=cls%>"><td class="math" style="text-align: right;"><span>\\(<%= left %>\\)</span></td>' +
				//'<td width="100%"><div id="<%= id %>-slide"></div></td>' +
				//'<td class="math"><span id="<%= id %>-txt" style="width: 110px">\\(<%= right %>\\)</span></td></tr>')(
				{id:id, left:left, right:right, cls:cls||''});
		}

		function paramView(param, index) {
			return slideView('p' + index, param.name, param.init.toFixed(1), 'green');
		}
		function lerpView() {
			return slideView('t', "t", "1.00", 'yellow');
		}
		function domainView(i, dmn) {
			return slideView(dom[i].name, dom[i].name, domainText(i), 'violet');
		}
		function paramControl(i, name, _min, _max, _step, _init) {
			param[i] = _init;

			ui.hslide("p" + i + "-slide", {
				    value:  _init || 1,
				    step:   _step || 0.1,
				    min:    _min || 0,
				    max: 	_max || 1,
				    peer:	"p" + i + "-txt",
				    size: 	380,
				},
				function(value) {
					param[i] = value;
					root.remove( group );
					group = makeShape();
					root.add( group );
				});
		}
		function lerpControl() {
			t = 1;

			ui.hslide("t-slide", {
				    value:  1,
				    step:   0.01,
				    min:    0,
				    max:    1,
				    peer:	"t-txt",
				    size: 	380,
				},
				function(value) {
					t = value;
					root.remove( group );
					group = makeShape();
					root.add( group );
				});
		}

		function domainText(i) {
			var pi = dom[i].pi === true ? Math.PI : 1,
				lo = dom[i].off / pi,
				hi = (dom[i].off + dom[i].scale) / pi;

			if (pi !== 1) {
				var pi_val = function(val) {
					if (val === 0) {
						return '0';
					}
					if (val === 1) {
						return 'π';
					}
					if (val === -1) {
						return '-π';
					}
					return val.toFixed(2) + " π";
				};
				//return "[" + pi_val(lo) + ", " + pi_val(hi) + ")";
				return pi_val(lo) + ", " + pi_val(hi);
			} else {
				//return "[" + lo.toFixed(2) + ", " + hi.toFixed(2) + ")";
				return lo.toFixed(2) + ", " + hi.toFixed(2);
			}
		}
		function domainControl(i, dmn) {
			ui.hrange(dmn.name+"-slide", {
				    values:	[0,1],
				    step:	1/36,
				    min:	0,
				    max:	1,
				    size: 	380,
				},
				function(lo,hi) {
					dom[i] = domain(dmn, lo, hi);
					root.remove( group );
					group = makeShape();
					root.add( group );
					$('#'+dmn.name+"-txt").text(domainText(i));
				});
		}

		function paramsView(params) {
			var ps = [];
			if (params && params.length > 0) {
				ps.push('<tr><td colspan="3" class="ui-title">Parameters:</td></tr>');
				ps.push(_.map(params, paramView).join(''));
			}
			ps.push('<tr><td colspan="3" class="ui-title">Domain:</td></tr>');
			ps.push(domainView(0, shape.domain[0]));
			ps.push(domainView(1, shape.domain[1]));
			ps.push('<tr><td colspan="3" class="ui-title">Interpolation from domain to shape:</td></tr>');
			ps.push(lerpView());
			return ps.join('');

			//var tmplt = _.template("blah<table border=0 cellpadding=0 cellspacing=2><%= ps %></table>");
			//return '<table border=0 cellpadding=0 cellspacing=2>' + ps + '</table>';
		}

		function paramUI()
		{
			var names = _.map(shape.param, function (p) { return p.name; });
			//$("#params").html(paramsView(shape.param));
//
			_.each(shape.param, function (p, i) {
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

			var html =
				'<table border=0 cellpadding=0 cellspacing=2 style="margin: 0 auto;"><tr>' +

				  '<td valign="top">' +
					'<table border=0 cellpadding=0 cellspacing=2>' + paramsView(shape.param) + '</table>' +
				  '</td>' +

				  '<td nowrap valign="top">' +
			    	'<table border=0 cellpadding=0 cellspacing=2>' +
					    '<tr><td><div class="ui-title">Options:</div></td></tr>' +
						'<tr><td>' + toggleView('ani-btn', 'Tumble', animate) + '</td></tr>' +
						'<tr><td>' + toggleView('wire-btn', 'Wireframe', show_wires) + '</td></tr>' +
						'<tr><td>' + toggleView('face-btn', 'Surface', show_faces) + '</td></tr>' +
						'<tr><td>' + toggleView('axes-btn', 'Axes <span style="color: #F00">X</span> <span style="color: #0F0">Y</span> <span style="color: #66F">Z</span', show_axes) + '</td></tr>' +
						'<tr><td>' + toggleView('xyplane-btn', 'XY plane', show_xyplane) + '</td></tr>' +
						'<tr><td>' + toggleView('color-btn', 'RGB normals', use_normals) + '</td></tr>';
			_.each(extras, function(extra, i) {
				html += '<tr><td>' + toggleView('extra-btn-'+i, extra.name, extra.show) + '</td></tr>';
			});

			html +=
					'</table>' +
				  '</td>' +
				'</tr></table>';

			canvas.after(html);

			$('#ani-btn').click( function() {
				//console.log( $(this)[0] );
				animate = $(this)[0].checked;
			});
			$('#wire-btn').click( function() {
				//console.log( $(this)[0] );
				show_wires = $(this)[0].checked;
				if (show_wires)
					group.add(wire_lines);
				else
					group.remove(wire_lines);
			});
			$('#face-btn').click( function() {
				//console.log( $(this)[0] );
				show_faces = $(this)[0].checked;
				if (show_faces)
					group.add(body_mesh);
				else
					group.remove(body_mesh);
			});
			$('#color-btn').click( function() {
				//console.log( $(this)[0] );
				use_normals = $(this)[0].checked;
				makeScene();
				root.remove( group );
				group = makeShape();
				root.add( group );
			});
			$('#axes-btn').click( function() {
				//console.log( $(this)[0] );
				show_axes = $(this)[0].checked;
				if (show_axes)
					group.add(axes);
				else
					group.remove(axes);
			});
			$('#xyplane-btn').click( function() {
				//console.log( $(this)[0] );
				show_xyplane = $(this)[0].checked;
				if (show_xyplane)
					group.add(xyplane);
				else
					group.remove(xyplane);
			});
			_.each(extras, function(extra, i) {
				$('#extra-btn-'+i).click( function() {
					//console.log( $(this)[0] );
					extra.show = $(this)[0].checked;
					if (extra.show)
						group.add(extra.group);
					else
						group.remove(extra.group);
				});
			});

			paramUI();
		}

		function makeShape() {
			var geom = shape.calc(dom[0], dom[1], param, t), //, bands(1,3)),
				group = new THREE.Object3D();

			xyplane = new THREE.GridHelper( 5, 10, '#888', '#444');
			xyplane.rotateX(Math.PI/2);
			if (show_xyplane) {
				group.add(xyplane);
			}

			body_mesh = new THREE.Mesh( geom.body.clone(), body_material );
			if (show_faces)
				group.add( body_mesh );

			wire_lines = new THREE.LineSegments( geom.wire.clone(), wire_material );
			if (show_wires)
				group.add( wire_lines );

			axes = new THREE.AxisHelper();
			if (show_axes)
				group.add( axes );


			_.each(extras, function(extra, i) {
				extra.geom = extra.calc(dom[0], dom[1], param, t); //, bands(1,3)),
				extra.group = new THREE.Object3D();

				//if (extra.is_surface) {
				//	extra.surface = new THREE.Mesh( extra.geom.body.clone(), body_material );
				//	extra.group.add(extra.surface);
				//}
				if (_.isArray(extra.geom)) {
					_.each(extra.geom, function(g) {
						extra.group.add(new THREE.LineSegments( g.clone(), extra_wire_material[i % 3] ));
					});
				} else {
					extra.group.add(new THREE.LineSegments( extra.geom.wire.clone(), extra_wire_material[i % 3] ));
				}

				if (extra.show) {
					group.add(extra.group);
				}
			});

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

    exports.calcParametricWireGeometry = calcParametricWireGeometry;
	exports.calcParametricGeometry = calcParametricGeometry;
    exports.parasurf = parasurf;
});
