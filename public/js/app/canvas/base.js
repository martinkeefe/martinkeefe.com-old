define(function(require, exports, module) {
	var inherit = require('inherit');
	var Events = require('app/events');

	return inherit(Events, {
		constructor: function(context,args) {
			Events.call(this);
	        this.context = context;
	        this.x = this.get(args[0], 0);
	        this.y = this.get(args[1], 0);

	        this.style = {};
	        var last_arg = args[args.length-1];
	        if (typeof last_arg === 'object' && !Array.isArray(last_arg)) {
	        	this.style = last_arg;
	        }
		},
		apply_style: function() {
			Object.keys(this.style).forEach(function(key) {
				if (key === 'lineDash') {
					this.context.setlineDash(this.style.lineDash);
				} else if (key === 'fill' || key === 'stroke') {
					this.context[key+'Style'] = this.style[key];
				} else {
					this.context[key] = this.style[key];
				}
			}, this);
		},
		get: function(val, def) {
			return val !== undefined ? val : def;
		},
	});
});
