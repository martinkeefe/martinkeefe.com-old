define(function(require, exports, module) {
	var Group = require('app/canvas/group');
    var Rect = require('app/canvas/rect');
	var Text = require('app/canvas/text');

	var OPTS = {height: 20, width: 100, hilite: '#CC8', dark: '#555', lite: '#CCC', font: '10pt Arial'};

	return Group.extend({
		constructor: function(context, args) {
	        Group.call(this, context, args);
	        this.text = this.get(args[2], '');
			this._val = false;

	        var cfg  = Object.assign({}, OPTS, this.get(args[3], {}));
			var ctrl = this.add(Rect, 0,0, cfg.width, cfg.height);
			var box  = this.add(Rect, 2,2, cfg.height-4, cfg.height-4, {fill: cfg.dark});
			var chk  = this.add(Rect, 5,5, cfg.height-10, cfg.height-10);
			this.add(Text, cfg.height+2, cfg.height-5, this.text, {fill: cfg.lite, font: cfg.font})

			ctrl.on('click', function() {
				var val = !this.value;
		    	chk.style.fill = val ? cfg.hilite : null;
				this.value = val;
			}, this);

			ctrl.on('hover', function(on) {
		    	ctrl.style.stroke = on ? cfg.dark : null;
			});
	    }
	},
	{
		value: {
			get: function() {return this._val},
			set: function(value) {
				if (value !== this._val) {
					this._val = value;
			    	this.emit('change', value);
				}
			}
		}
	});
});
