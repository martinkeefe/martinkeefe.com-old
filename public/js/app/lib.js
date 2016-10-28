define(function(require, exports, module) {
	require('npo');

	// http://javascript.crockford.com/remedial.html - supplant(object)
	exports.strerp = function(str, obj) {
		return str.replace(
			/\{\{([^{}]*)\}\}/g,
			function (a, b) {
				var r = obj[b];
				return typeof r === 'string' || typeof r === 'number' ? r : a;
			}
		);
	};

	// https://developers.google.com/web/fundamentals/getting-started/primers/promises#promisifying_xmlhttprequest
	function get(url) {
		// Return a new promise.
		return new Promise(function(resolve, reject) {
			// Do the usual XHR stuff
			var req = new XMLHttpRequest();
			req.open('GET', url);

			req.onload = function() {
				// This is called even on 404 etc
				// so check the status
				if (req.status == 200) {
					// Resolve the promise with the response text
					resolve(req.response);
				}
				else {
					// Otherwise reject with the status text
					// which will hopefully be a meaningful error
					reject(Error(req.statusText));
				}
			};

			// Handle network errors
			req.onerror = function() {
				reject(Error("Network Error"));
			};

			// Make the request
			req.send();
		});
	};
	exports.get = get;

	function get_csv(url, cols) {
		return new Promise(function(resolve, reject) {
			get(url).then(
				function(response) {
					var recs = response.split('\n').map(function(s) {return s.trim()});

					if (cols == null && recs.length > 0) {
						cols = recs.shift().split(';');
					}

					var data = [];
					recs.forEach(function(rec) {
						var datum = {};
						rec.split(';').forEach(function(value, i) {
							datum[cols[i]] = value;
						});
						data.push(datum);
					});

					resolve(data);
				}
			);

		});
	};
	exports.get_csv = get_csv;

	function title(ttl) {
		var ttl_el = document.getElementsByTagName('title')[0];
		ttl_el.innerHTML = ttl;
	}

	// =============================================================================
	// Derived from https://github.com/miazukee/restlite

	var routes = [];
	var error404 = '#404';

	function route() {
		//var r = window.location.hash.substr(1).split('?');
		var r = window.location.pathname.substr(1);
		//var a = r[1];
		//r = r[0];
		if(routes[r] !== undefined)
			routes[r](); //a);
		else if(routes[error404] !== undefined)
			routes[error404](); //a);
	};

	function navto(r) {
		console.log('NAVTO', r);
		history.pushState({}, '', r);
		route();
	};
	//window.navto = navto;

	function render(id, path, success) {
		if (path) {
			get('/html/' + path + '.html').then(
				function(response) {
					var el = document.getElementById(id);
					el.innerHTML = response;
					if (success) {
						success();
					}

					var host = window.location.href.split('/')[2];
					for (var i = 0; i < document.links.length; i++) {
						var link = document.links[i];
						if (link.href) {
							var href = link.href.split('/');
							if (href[2] === host) {
								(function(dst) {
									link.onclick = function(e) {
										e.preventDefault();
										e.stopPropagation();
										navto(dst);
									};
								})('/' + href.slice(3).join('/'));
							}
						}
					}
				});
		}
	};
	exports.render = render;

	//window.addEventListener('hashchange', function() {
	window.addEventListener('popstate', function() {
		console.log('POPSTATE');
		route();
	});


	exports.start = function(ondone) {
		console.log('START');
		var cols = ['route','ttl','outer','inner','fn','args','tags','date'];
		get_csv('/data/index.csv', cols).then(
			function(data) {
				data.forEach(function(r) {
					routes[r.route] = function() {
						title(r.ttl);
						var done = null;
						if (r.fn) {
							done = function() {
								requirejs(['app/'+r.fn], function(fn) {
									fn.apply(window, r.args.split('|'));
								});
							};
						}
						render('content', r.outer, function() {
							if (r.date) {
								var els = document.getElementsByClassName('body');
								if (els.length > 0) {
									els[0].insertAdjacentHTML('beforeend', '<div class="update">Last update: '+r.date+'</div>');
								}
							}
							if (r.inner) {
								render('body', r.outer + '/' + r.inner, done);
							} else if (done) {
								done();
							}
						});
					};
				});
				route();
			},
			function(error) {
				console.warn(error);
			}
		);
	}
});
