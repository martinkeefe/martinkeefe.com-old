define(function(require, exports, module) {
	var Group = require('app/canvas/group');
    var Rect = require('app/canvas/rect');
	var Text = require('app/canvas/text');

	var OPTS = {height: 20, width: 100, hilite: '#CC8', dark: '#555', lite: '#CCC', font: '10pt Arial', min: 0, max: 1};

	return Group.extend({
		constructor: function(context, args) {
	        Group.call(this, context, args);
			this.value = this.get(args[2], 0);
	        var cfg = Object.assign({}, OPTS, this.get(args[3], {}));

			var ctrl  = this.add(Rect, 0,0, cfg.width, cfg.height);
			var box   = this.add(Rect, 2,2, cfg.width-4, cfg.height-4, {fill: cfg.dark});
			var slide = this.add(Rect, 4,4, (cfg.width-8) * this.value, cfg.height-8, {fill: cfg.hilite});

			ctrl.on('hover', function(on) {
		    	ctrl.style.stroke = on ? cfg.dark : null;
			});

			ctrl.on('mousedown', function(x, y) {
				this.value = Math.max(0, Math.min(1, (x-this.x)/cfg.width));
				slide.w = (cfg.width-8) * this.value;
			}, this);

			ctrl.on('drag', function(dragging, x, y) {
				if (dragging) {
					this.value = Math.max(0, Math.min(1, (x-this.x)/cfg.width));
					slide.w = (cfg.width-8) * this.value;
		    	}
			}, this);
	    },
	});
});
