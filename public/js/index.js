
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
	if (path) {
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
	}
};

window.addEventListener('hashchange', function() {
	route();
});


// =============================================================================

var ondone = {
	front: function() {
		requirejs(['app/shadebob'], function(sb) {
			sb.resize();
		});
	},
	jax: function(num) {
		requirejs(['app/jax'], function(jax) {
			jax('0'+num, render);
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
}

function start() {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState === 4 && xhttp.status === 200) {
	    	var recs = xhttp.responseText.split('\n');
			recs.forEach(function(rec) {
				r = rec.split(';')
				if (r.length > 1) {
					var ttl = r[1];
					var outer = r[2];
					var inner = r[3] ? outer + '/' + r[3] : null;
					var fn = r[4];
					var args = r[5];
					var date = r[7];
					routes[r[0]] = function() {
						title(ttl);
						var done = null;
						if (fn && fn in ondone) {
							done = function() {
								ondone[fn].apply(window, args.split('|'));
							};
						}
						render('content', outer, function() {
							if (date) {
								var els = document.getElementsByClassName('body');
								if (els.length > 0) {
									els[0].insertAdjacentHTML('beforeend', '<div class="update">Last update: '+date+'</div>');
								}
							}
							if (inner) {
								render('body', inner, done);
							} else if (done) {
								done();
							}
						});
					};
				}
			});
			route();
		}
		if (xhttp.readyState === 4 && xhttp.status !== 200) {
			console.error(xhttp);
		}
	};
	xhttp.open('GET', '/data/index.csv', true);
	xhttp.send();
}

// =============================================================================

MathJax.Hub.Config({
	extensions: ["tex2jax.js"],
	"HTML-CSS": { scale: 90, availableFonts: [], webFont: "TeX"}
});

start();
