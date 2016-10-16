define(function(require, exports, module) {
    var MK = require('app/lib');

	// =============================================================================

	var ondone = {
		front: function() {
			requirejs(['app/shadebob'], function(sb) {
				sb.resize();
			});
		},
		jax: function(num) {
			requirejs(['app/jax'], function(jax) {
				jax('0'+num);
			});
		},
		parasurf: function(shape) {
			requirejs(['app/parasurf'], function(ps) {
				ps.parasurf('ps-shape', shape);
			    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
			});
		},
		mnm: function(num) {
			requirejs(['app/mnm'], function(mnm) {
				mnm(num);
			});
		},
		demo: function(demo) {
			requirejs(['app/'+demo], function(demo) {
				demo();
			});
		},
		'js-qref': function(name) {
			requirejs(['app/js-qref'], function(qref) {
				qref(name);
			});
		},
	}

	// =============================================================================

	MathJax.Hub.Config({
		extensions: ["tex2jax.js"],
		"HTML-CSS": { scale: 90, availableFonts: [], webFont: "TeX"}
	});

	return function() {
		MK.start(ondone);
	};
});
