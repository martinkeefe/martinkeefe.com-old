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
