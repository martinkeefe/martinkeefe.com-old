// Based on https://github.com/allouis/minivents

define(function(require, exports, module) {
	var inherit = require('inherit');

	return inherit({
		constructor: function() {
			this.events = {};
		},
		on: function(type, func, ctx) {
			this.events[type] = this.events[type] || [];
			this.events[type].push([func, ctx || this]);
		},
		off: function(type, func) {
			type || (this.events = {});

			var list = this.events[type] || [],
				i = list.length = func ? list.length : 0;

			while (i--) {
				if (func == list[i][0]) {
					list.splice(i,1);
				}
			}
		},
		emit: function(type) {
			var e = this.events[type] || [],
				list = e.length > 0 ? e.slice(0, e.length) : e,
				i = 0,
				j;

			while (j = list[i++]) {
				j[0].apply(j[1], [].slice.call(arguments, 1));
			}

			return e.length > 0;
		},
	});
});
