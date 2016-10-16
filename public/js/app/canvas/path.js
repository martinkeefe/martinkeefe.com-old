define(function(require, exports, module) {
	var Base = require('app/canvas/base');

	return Base.extend({
		constructor: function(context, args) {
			Base.call(this,context,args);
			this.reset();
	    },
	    reset: function() {
	        this.segs = [];
	        this.add('beginPath');
	    },
	    do_path: function() {
	        this.context.translate(this.x, this.y);
	        this.segs.forEach(function(seg) {
	           	this.context[seg.type].apply(this.context, seg.args);
	        }, this);
	    },
	    draw: function() {
	        this.apply_style();
	        this.do_path();
	        if (this.style.fill) this.context.fill(this.style.fillRule);
	        if (this.style.stroke) this.context.stroke();
	    },
	    test: function(pt) {
	        this.do_path();
	        return this.context.isPointInPath(pt.x, pt.y);
	    },

	    add: function(type) {
	    	var args = Array.prototype.slice.call(arguments, 1);
	        this.segs.push({type:type, args:args});
	        return this;
	    },
	    moveTo: function(x, y) {
	    	return this.add('moveTo', x, y);
	    },
	    lineTo: function(x, y) {
	    	return this.add('lineTo', x, y);
	    },
	    bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y) {
	    	return this.add('bezierCurveTo', cp1x, cp1y, cp2x, cp2y, x, y);
	    },
	    quadraticCurveTo: function(cpx, cpy, x, y) {
	    	return this.add('quadraticCurveTo', cpx, cpy, x, y);
	    },
	    arc: function(x, y, radius, startAngle, endAngle, anticlockwise) {
	    	return this.add('arc', x, y, radius, startAngle, endAngle, anticlockwise);
	    },
	    arcTo: function(x1, y1, x2, y2, radius) {
	    	return this.add('arcTo', x1, y1, x2, y2, radius);
	    },
	    rect: function(x, y, width, height) {
	    	return this.add('rect', x, y, width, height);
	    },
	    close: function() {
	    	return this.add('closePath');
	    },
	});
});
