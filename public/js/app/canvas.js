define(function(require, exports, module) {

	//function fire(obj, evt, args) {
	//	if (obj && obj[evt]) {
	//		obj[evt].apply(obj, args)
	//	}
	//}

//------------------------------------------------------------------------------

	function Canvas(id_or_el) {
		if (typeof id_or_el === 'string') {
			id_or_el = document.getElementById(id_or_el);
		}
		this.element = id_or_el;
		this.context = this.element.getContext('2d');
		this.bounds = this.element.getBoundingClientRect();
		this.glyphs = [];
		this._glyph = undefined;
		this._mouse = {x:0, y:0};
		this._drag = {};
		this._hover = {};

		this.element.addEventListener("mousedown", this, false);
		window.addEventListener("mousemove", this, false);
		window.addEventListener("mouseup", this, false);
	}
	Canvas.prototype = Object.create({
			handleEvent: function(evt) {
				switch (evt.type) {
					case 'mousedown':
						return this.on_mouse_down(evt);
					case 'mousemove':
						return this.on_mouse_move(evt);
					case 'mouseup':
						return this.on_mouse_up(evt);
				}
			},

			dispose: function() {
				this.element.removeEventListener("mousedown", this, false);
				window.removeEventListener("mousemove", this, false);
				window.removeEventListener("mouseup", this, false);
			},

			add: function(klass) {
				var args = Array.prototype.slice.call(arguments, 1);
				var glyph = new klass(this.context, args);
				this.glyphs.push(glyph);
				return glyph;
			},

			clear: function() {
				this.context.clearRect(0, 0, this.element.width, this.element.height);
			},

			render: function() {
				var shapes = this.glyphs.slice();
				shapes.sort(function(a,b) {return a.z - b.z});

				shapes.forEach(function(shape) {
					this.context.save();
					shape.draw();
					this.context.restore();
				}, this);
			},

			mouse_pt: function(evt) {
				var totalOffsetX = 0;
				var totalOffsetY = 0;
				var canvasX = 0;
				var canvasY = 0;
				var currentElement = this.element;

				do {
					totalOffsetX += currentElement.offsetLeft;
					totalOffsetY += currentElement.offsetTop;
				}
				while (currentElement = currentElement.offsetParent)

				canvasX = evt.pageX - totalOffsetX;
				canvasY = evt.pageY - totalOffsetY;

				// Fix for variable canvas width
				canvasX = Math.round( canvasX * (this.element.width / this.element.offsetWidth) );
				canvasY = Math.round( canvasY * (this.element.height / this.element.offsetHeight) );

				return {x:canvasX, y:canvasY}
			},

			find_glyph: function(pt) {
				var shapes = this.glyphs.slice();
				shapes.sort(function(a,b) {return a.z - b.z});
				var found;

				shapes.forEach(function(glyph) {
					if ('test' in glyph) {
						this.context.save();
						if (glyph.test(pt)) {
							found = glyph;
						}
						this.context.restore();
					}
				}, this);

				return found;
			},

			on_mouse_down: function(evt) {
				var mouse = this.mouse_pt(evt),
					found = this.find_glyph(mouse);

				if (found) {
					this._mouse.down = true;
					this._mouse.x = mouse.x;
					this._mouse.y = mouse.y;
					this._glyph = found;
					if (this._glyph.emit('mousedown', mouse.x, mouse.y)) {
						this.clear();
						this.render();
					}
				} else {
					this._mouse.down = false;
				}

				evt.preventDefault();
				return false;
			},

			on_mouse_move: function(evt) {
				var mouse = this.mouse_pt(evt),
					moved = this._mouse.x !== mouse.x || this._mouse.y !== mouse.y;

				if (moved) {
					if (this._mouse.down) {
						this._dragging = true;
						this._drag.x = mouse.x - this._glyph.x;
						this._drag.y = mouse.y - this._glyph.y;
						this._mouse.down = false;
					}

					if (this._dragging) {
						var x = mouse.x,
							y = mouse.y;

						if (this._glyph.draggable) {
							x = (x < 0) ? 0 : ((x > this.width) ? this.width : x);
							y = (y < 0) ? 0 : ((y > this.height) ? this.height : y);

							this._glyph.x = x - this._drag.x;
							this._glyph.y = y - this._drag.y;
							this._glyph.emit('drag', true);
						} else {
							this._glyph.emit('drag', true, x, y);
						}

						this.clear();
						this.render();
					} else {
						var found = this.find_glyph(mouse);

						if (this._hover.glyph !== found) {
							if (this._hover.glyph) {
								this._hover.glyph.emit('hover', false);
							}
							if (found) {
								found.emit('hover', true);
							}
							this._hover.glyph = found;
							this.clear();
							this.render();
						}
					}
					this._mouse.x = mouse.x;
					this._mouse.y = mouse.y;
				}
			},

			on_mouse_up: function(evt) {
				if (this._mouse.down) {
					var ran = this._glyph.emit('mouseup');
					ran |= this._glyph.emit('click');
					if (ran) {
						this.clear();
						this.render();
					}
					this._mouse.down = false;
					this._glyph = undefined;
				} else if (this._dragging) {
					if (this._glyph.emit('drag', false)) {
						this.clear();
						this.render();
					}
					this._dragging = false;
					this._drag = {};
					this._glyph = undefined;
				}
			},
		},
		{
			width: {get: function() { return this.element.width; }},
			height: {get: function() { return this.element.height; }},

			z: {get: function() {
				var max = Math.max.apply(Math, this.glyphs.map(function(g) {return g.z || 0}));
				var min = Math.min.apply(Math, this.glyphs.map(function(g) {return g.z || 0}));
				return {min: min === Infinity ? 0 : min, max: max === -Infinity ? 0 : max};
			}},
		}
	);

	return Canvas;
});
