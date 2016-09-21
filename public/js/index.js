
// =============================================================================
// Derived from https://github.com/miazukee/restlite

var restlite = {};

restlite.routes = [];
restlite.error404 = '#404';

restlite.route = function() {
  //var r = window.location.pathname;
  var r = window.location.hash.substr(1).split('?');
  var a = r[1];
  r = r[0];
  if(restlite.routes[r] !== undefined)
    restlite.routes[r](a);
  else if(restlite.routes[restlite.error404] !== undefined)
    restlite.routes[restlite.error404](a);
};

restlite.render = function(id, path, success) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      document.getElementById(id).innerHTML = xhttp.responseText;
      if (success) {
        success();
      }
    }
  };
  xhttp.open('GET', path, true);
  xhttp.send();
};

//restlite.setRoute = function(r) {
//  history.pushState({}, '', r);
//  restlite.route();
//};
//
//window.addEventListener('popstate', function() {
//  restlite.route();
//});
window.addEventListener('hashchange', function() {
  restlite.route();
});

// =============================================================================

restlite.routes[''] = function() {
  restlite.render('content', '/partials/front.html', function() {
    requirejs(['app/shadebob'], function(sb) {
      sb.resize();
    });
  })
};
//restlite.routes['#'] = restlite.routes[''];

restlite.routes['maths'] = function() {
  restlite.render('content', '/partials/maths.html');
}

restlite.routes['music/mnm'] = function(num) {
  restlite.render('content', '/partials/mnm.html', function() {
    requirejs(['app/mnm'], function(mnm) {
      mnm(num);
    });
  });
}

restlite.route();

