define(function(require, exports, module) {
	var Path = require('app/canvas/path');

	return Path.extend({
		constructor: function(context, args) {
			Path.call(this,context,args);
	        this.w = this.get(args[2], 0);
	        this.h = this.get(args[3], 0);
	        this.mk_path();
	    },
	    mk_path: function() {
	    	this.reset();
	    	this.rect(0,0,this.w, this.h);
	    },
	},
	{
		w: {
			get: function() {return this._w || 0},
			set: function(v) {this._w = v; this.mk_path()}
		},
		h: {
			get: function() {return this._h || 0},
			set: function(v) {this._h = v; this.mk_path()}
		},
	});
});
