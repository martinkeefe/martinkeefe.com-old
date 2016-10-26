define(function(require, exports, module) {
    var $ = require('zepto');
    var THREE = require('three');
    require('TrackballControls');
    var MK = require('app/lib');
    var xgui = require('xgui');

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

	function domain(dom, lo, hi) {
		var rng = hi - lo,
			ful = dom.max - dom.min,
			lo_ = dom.min + lo * ful,
			hi_ = dom.min + hi * ful,
			num = Math.floor(rng * dom.steps);

		return Object.assign({}, dom, {lo:lo, hi:hi, off: lo_, scale:(hi_-lo_), num:num});
	}

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

		if (Array.isArray(shape)) {
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
				return pi_val(lo) + ", " + pi_val(hi);
			} else {
				return lo.toFixed(2) + ", " + hi.toFixed(2);
			}
		}

		function XUI(elem_id) {
			$('#ps-shape').css('text-align', 'center');

			var elem = $('#'+elem_id);
			var canvas = $('<canvas width=' + elem.width() + ' height=' + elem.width()*0.75 + '></canvas>');

			elem.append(canvas);
			setup(canvas.get(0), canvas.width(), canvas.height());

			var chk_h = 20;
			var opts_h = (7 + extras.length) * chk_h;
			var para_h = shape.param && shape.param.length ? (1 + shape.param.length) * chk_h : 0;
			var domn_h = (1 + shape.domain.length) * chk_h;
			var height = Math.max(opts_h, para_h + domn_h);
			var gui = new xgui( {width: 280, height: height, textColor: "#BBB",
				backgroundColor: "rgb(91,97,111)", dimColor: "rgb(124,148,188)", frontColor: "rgb(220,200,118)"} );

			var gui_el = $('<div style="width: 280px; margin: 0 auto;"></div>');
			gui_el.append(gui.getDomElement());
			elem.append(gui_el);

			var x = 0, y = 0, dy = chk_h;

			new gui.Label( {x: x, y: y+4, text: "Options:"} );
			y += dy;

			var ani_chk = new gui.CheckBox( {x: x, y: y, text: "Tumble", selected: false, width: 14, height:14} );
			ani_chk.value.bind(function(v) {
				animate = v;
			});
			y += dy;

			var wire_chk = new gui.CheckBox( {x: x, y: y, text: "Wireframe", selected: true, width: 14, height:14} );
			wire_chk.value.bind(function(v) {
				show_wires = v;
				if (show_wires) group.add(wire_lines);
				else			group.remove(wire_lines);
			});
			y += dy;

			var face_chk = new gui.CheckBox( {x: x, y: y, text: "Surface", selected: true, width: 14, height:14} );
			face_chk.value.bind(function(v) {
				show_faces = v;
				if (show_faces) group.add(body_mesh);
				else			group.remove(body_mesh);
			});
			y += dy;

			var axes_chk = new gui.CheckBox( {x: x, y: y, text: "Axes", selected: true, width: 14, height:14} );
			axes_chk.value.bind(function(v) {
				show_axes = v;
				if (show_axes)	group.add(axes);
				else			group.remove(axes);
			});
			y += dy;

			var xy_chk = new gui.CheckBox( {x: x, y: y, text: "XY Plane", selected: true, width: 14, height:14} );
			xy_chk.value.bind(function(v) {
				show_xyplane = v;
				if (show_xyplane)	group.add(xyplane);
				else				group.remove(xyplane);
			});
			y += dy;

			var rgb_chk = new gui.CheckBox( {x: x, y: y, text: "RGB Normals", selected: false, width: 14, height:14} );
			rgb_chk.value.bind(function(v) {
				use_normals = v;
				makeScene();
				root.remove( group );
				group = makeShape();
				root.add( group );
			});
			y += dy;

			var ex_chks = [];
			extras.forEach(function(extra) {
				var chk  = new gui.CheckBox( {x: x, y: y, text: extra.name, selected: extra.show, width: 14, height:14} );
				ex_chks.push(chk);
				chk.value.bind(function(v) {
					extra.show = v;
					if (extra.show)	group.add(extra.group);
					else			group.remove(extra.group);
				});
				y += dy;
			});

			x = 140; y = 0;
			if (shape.param && shape.param.length) {
				new gui.Label( {x: x, y: y+4, text: "Parameters:"} );
				y += dy;

				shape.param.forEach(function (p, i) {
					param[i] = p.init;

					new gui.Label( {x: x, y: y+2, text: p.name, height: 14} );
					var slide = new gui.HSlider( {x:x+20, y:y, value: p.init, min: p.min, max: p.max,
						decimals: 1, height: 14, width: 120} );
					slide.value.bind(function(v) {
						param[i] = v;
						root.remove( group );
						group = makeShape();
						root.add( group );
					});

					y += dy;
				});
			}

			new gui.Label( {x: x, y: y+4, text: "Domain:"} );
			y += dy;

			shape.domain.forEach(function (d, i) {

				new gui.Label( {x: x, y: y+2, text: d.name, height: 14} );
				var slide = new gui.RangeSlider( {x:x+20, y:y, value1: 0.0001, value2: 1.0, min: 0, max: 1,
					decimals: 1, height: 14, width: 120} );
				slide.value1.bind(function(v) {
					dom[i] = domain(d, v, slide.value2.v);
					root.remove( group );
					group = makeShape();
					root.add( group );
				});
				slide.value2.bind(function(v) {
					dom[i] = domain(d, slide.value1.v, v);
					root.remove( group );
					group = makeShape();
					root.add( group );
				});
				y += dy;
			});

			var group = makeShape();
			root.add( group );
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


			extras.forEach(function(extra, i) {
				extra.geom = extra.calc(dom[0], dom[1], param, t); //, bands(1,3)),
				extra.group = new THREE.Object3D();

				//if (extra.is_surface) {
				//	extra.surface = new THREE.Mesh( extra.geom.body.clone(), body_material );
				//	extra.group.add(extra.surface);
				//}
				if (Array.isArray(extra.geom)) {
					extra.geom.forEach(function(g) {
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

		XUI(elem_id);
		Animator.add( loop );
	}

    return function(shape) {
		parasurf('ps-shape', shape);
	    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    };
});
