define(function(require, exports, module) {
	var Base = require('app/canvas/base');

	return Base.extend({
		constructor: function(context, args) {
			Base.call(this,context,args);
	        this.glyphs = [];
	    },
	    draw: function() {
	        var shapes = this.glyphs.slice();
	        shapes.sort(function(a,b) {return a.z - b.z});

	        this.context.translate(this.x, this.y);
	        shapes.forEach(function(shape) {
		        this.context.save();
	            shape.draw();
		        this.context.restore();
	        }, this);
	    },
	    test: function(pt) {
	        var shapes = this.glyphs.slice();
	        shapes.sort(function(a,b) {return a.z - b.z});
	        var found = null;

	        this.context.translate(this.x, this.y);
	        shapes.forEach(function(glyph) {
	        	if ('test' in glyph) {
			        this.context.save();
		            if (glyph.test(pt)) {
	                    found = glyph;
		            }
			        this.context.restore();
			    }
	        }, this);

	        return found != null;
	    },
	    add: function(klass) {
	    	var args = Array.prototype.slice.call(arguments, 1);
	        var glyph = new klass(this.context, args);
	        this.glyphs.push(glyph);
	        return glyph;
	    },
		emit: function(type) {
			var args = Array.prototype.slice.call(arguments);
	        var shapes = this.glyphs.slice();
	        var done = false;

	        shapes.sort(function(a,b) {return a.z - b.z});

	        shapes.forEach(function(shape) {
	            done |= shape.emit.apply(shape, args);
	        }, this);

	        return done;
		},
	},
	{
	    z: {get: function() {
	        var max = Math.max.apply(Math, this.glyphs.map(function(g) {return g.z || 0}));
	        return max === -Infinity ? 0 : max;
	    }},
	});
});
