define(function(require, exports, module) {
    var MK = require('app/lib');
    var $ = require('zepto');

    var ttl;

    function render(data) {
        var el = $('#body');
        var dl = $('<dl></dl>');

        el.append('<h2>' + ttl + '</h2>');
        el.append(dl);

        data.forEach(function(d) {
            dl.append(MK.strerp(
                '<dt class="syntax">' +
                    '<span class="es{{es}}">{{es}}</span> ' +
                    '<a href="{{href}}" target="MDN ">{{syntax}}</a>' +
                '</dt>' +
                '<dd>{{txt}}</dd>',
                d));
        });
    }

    return function(name) {
        ttl = name;
        MK.get_csv('/data/js-qref/' + name + '.csv').then(render);
    }
});
