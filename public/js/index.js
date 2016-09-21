
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

routes[''] = function() {
	render('content', 'front', function() {
		requirejs(['app/shadebob'], function(sb) {
			sb.resize();
		});
	})
};

routes['maths'] = function() {
	render('content', 'maths');
}

routes['music/mnm'] = function(num) {
	render('content', 'mnm', function() {
		requirejs(['app/mnm'], function(mnm) {
			mnm(num);
		});
	});
}

routes['maths/jax'] = function(num) {
	render('content', 'jax', function() {
		requirejs(['app/jax'], function(jax) {
			jax(num, render);
		});
	});
}

route();

