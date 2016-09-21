define(function(require, exports, module) {
    var $ = require('zepto');
    var text = $('#text');
    var ui = $('#ui');
    var surf = null;

	function render(html) {
		text.html(html);
        MathJax.Hub.Queue(["Typeset",MathJax.Hub]);

        ui.empty();
        if (surf != null) {
        	// . . .
        }
	}

	function get(surf_name) {
		if (surf_name === 'intro') {
			surf = null;
		} else {
			//surf = require('app/parasurf/' + surf_name);
		}

        $.ajax({
            type: 'GET',
            url: '/data/parasurf/'+surf_name+'.html',
            success: render,
            error: function(xhr, type){
                console.error(xhr);
            },
        });

	}

    $(window).on('hashchange', function(){
        if (window.location.hash) {
	        var surf_name = window.location.hash.substr(1);

	        get(surf_name);
        } else {
        	get('intro');
        }
    });

    // Manually trigger a hashchange to start the app.
    $(window).trigger('hashchange');
});
