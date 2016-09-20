define(function(require, exports, module) {
    var $ = require('zepto');
    var _ = require('lodash');

    function syms(i, elem) {
        var text = elem.innerHTML;
        var html = '<table class="centre">';
        _.each(text.split('\n'), function (line) {
            html += '<tr>';
            _.each(line.split(' '), function (code) {
                if (code === '_') {
                    html += '<td></td><td></td>';
                } else if (code !== '') {
                    html += '<td class="sym">\\('+code+'\\)</td><td class="code"><pre><code>'+code+'</code></pre></td>';
                }
            });
            html += '</tr>';
        });
        html += '</table>';
        elem.innerHTML = html;
    }

    var jax_num;
    var text = $('#text');

    function render(html) {
        text.html(html);

        $('div.syms').each(syms);
        $('tex').each(function (i, elem) {
            $(elem).replaceWith('<pre class="code"><code class="tex">'+elem.innerHTML+'</code></pre>');
        });



        MathJax.Hub.Queue(["Typeset",MathJax.Hub]);

        //html = text.html()
        //text.empty();
        //text.html(html);
        MathJax.Hub.Queue(function() {
        //    window.scrollX = 0;
            hljs.tabReplace = '    ';
            hljs.initHighlighting.called = false;
            hljs.initHighlighting();
        });
    };

    function get_data() {
        $.ajax({
            type: 'GET',
            url: '/data/jax/jax'+jax_num+'.html',
            success: render,
            error: function(xhr, type){
                console.error(xhr);
            },
        });
    };

    MathJax.Hub.Config({
      extensions: ["tex2jax.js"],
      "HTML-CSS": { scale: 100, availableFonts: [], webFont: "TeX"}
    });

    $(window).on('hashchange', function(){
        jax_num = window.location.hash.substr(1,2);
        get_data();
    });

    // Manually trigger a hashchange to start the app.
    $(window).trigger('hashchange');
});
