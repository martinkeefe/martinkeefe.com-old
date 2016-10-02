define(function(require, exports, module) {
    var $ = require('zepto');

    function syms(i, elem) {
        var text = elem.innerHTML;
        var html = '<table class="centre">';
        text.split('\n').forEach(function (line) {
            html += '<tr>';
            line.split(' ').forEach(function (code) {
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

    return function(num, render) {
        render('jax-text', 'jax/jax' + num, function() {
            $('div.syms').each(syms);
            $('tex').each(function (i, elem) {
                $(elem).replaceWith('<pre class="code"><code class="tex">'+elem.innerHTML+'</code></pre>');
            });

            MathJax.Hub.Queue(["Typeset",MathJax.Hub]);

            MathJax.Hub.Queue(function() {
                hljs.tabReplace = '    ';
                hljs.initHighlighting.called = false;
                hljs.initHighlighting();
            });
        });
    }
});
