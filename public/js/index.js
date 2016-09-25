
function title(ttl) {
	var ttl_el = document.getElementsByTagName('title')[0];
	ttl_el.innerHTML = ttl;
}

// =============================================================================
// Derived from https://github.com/miazukee/restlite

var routes = [];
var error404 = '#404';

function route() {
	var r = window.location.hash.substr(1).split('?');
	var a = r[1];
	r = r[0];
	if(routes[r] !== undefined)
		routes[r](a);
	else if(routes[error404] !== undefined)
		routes[error404](a);
};

function render(id, path, success) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState === 4 && xhttp.status === 200) {
			document.getElementById(id).innerHTML = xhttp.responseText;
			if (success) {
				success();
			}
		}
	};
	xhttp.open('GET', '/html/' + path + '.html', true);
	xhttp.send();
};

window.addEventListener('hashchange', function() {
	route();
});


// =============================================================================
// ROUTES

routes[''] = function() {
	title("Martin's Stuff")
	render('content', 'front', function() {
		requirejs(['app/shadebob'], function(sb) {
			sb.resize();
		});
	})
};

routes['maths'] = function() {
	title("Martin's Maths Stuff");
	render('content', 'maths');
}

routes['music/mnm'] = function(num) {
	title("Monday Night Martin #" + num);
	render('content', 'mnm', function() {
		requirejs(['app/mnm'], function(mnm) {
			mnm(num);
		});
	});
}

routes['maths/jax'] = function(num) {
	title("Martin's MathJax Guide " + num);
	render('content', 'jax', function() {
		requirejs(['app/jax'], function(jax) {
			jax(num, render);
		});
	});
}

routes['maths/parasurf'] = function(shape) {
	var shapes = {
		'intro': "Introduction",
		'sphere': "Sphere",
		'torus': "Torus",
		'elliptic-torus': "Elliptic Torus",
		'limpet-torus': "Limpet Torus",
		'supertoroid': "Supertoroid",
		'mobius': "Möbius Strip",
		'boy-1': "Boy's Surface",
	};
	title("Martin's Parametric " + shapes[shape]);
	render('content', 'parasurf', function() {
		render('ps-text', 'parasurf/'+shape, function() {
			if (shape !== 'intro') {
				requirejs(['app/parasurf'], function(ps) {
					ps.parasurf('ps-shape', shape);
					//console.log("Typesetting...")
				    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
				    //MathJax.Hub.Queue(function() {console.log("...done.")});
				});
			} else {
			    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
			}
		});
	});
}

// =============================================================================

MathJax.Hub.Config({
	extensions: ["tex2jax.js"],
	"HTML-CSS": { scale: 90, availableFonts: [], webFont: "TeX"}
});

route();

