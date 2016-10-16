define(function(require, exports, module) {
	var Base = require('app/canvas/base');

	return Base.extend({
		constructor: function(context, args) {
			Base.call(this,context,args);
	        this.txt = this.get(args[2], '');
	        this.style = this.get(args[3], {});
	        //this.measure();
	    },
    	measure: function() {
    		this.context.save();
			this.context.font = '16px Arial';
			var metrics = this.context.measureText(this.txt);
	        this.context.restore();
	        this.width = metrics.width;
    	},
	    draw: function() {
			this.context.font = '16px Arial';
			this.context.textBaseline = 'alphabetic';
			this.context.textAlign = 'left';
	    	this.apply_style();
			if (this.style.fill) this.context.fillText(this.txt, this.x, this.y);
	        if (this.style.stroke) this.context.strokeText(this.txt, this.x, this.y);
	    },
	});
});
