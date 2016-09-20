requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: '/js/lib',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        app: '../app'
    },
    shim: {
        'zepto': {
        	exports: '$'
        }
    },
});

// Start the main app logic.
//requirejs(['zepto', 'text!/text/math.html'], function($,mth) {
//	console.log('Start!');
//	$('#content').html(mth);
//});

//requirejs(['zepto', 'app/shadebob'], function($,sb) {
//	$('#content').html('<div id="screen"><canvas id="shadebob"></canvas></div>');
//	sb.resize();
//});
