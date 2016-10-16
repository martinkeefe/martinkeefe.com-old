define(function(require, exports, module) {
    return function() {
	    var Canvas = require('app/canvas'),
	    	Path = require('app/canvas/path'),
	    	Text = require('app/canvas/text'),
	    	Group = require('app/canvas/group'),
	    	Checkbox = require('app/canvas/checkbox'),
	    	HSlide = require('app/canvas/hslide'),
	        c = new Canvas('one');

	    function mk_color() {
	        var r = Math.floor(Math.random()*255),
	            g = Math.floor(Math.random()*255),
	            b = Math.floor(Math.random()*255),
	            a = Math.random();
	        return "rgba(" + r + "," + g + "," + b + "," + a + ")";
	    }

	    function on_hover(on) {
	      if (on) {
	        this.old_stroke = this.style.stroke;
	        this.style.stroke = 'red';
	      } else {
	        this.style.stroke = this.old_stroke;
	      }
	    }
	    function on_click() {
	      this.z = c.z.max + 1;
	    }

	    function mk_shapes(c, n) {
	      c.add(Text,4,20,'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',{fill:'white',font:'italic 16px serif'});
	      c.add(Checkbox, 4,40, 'Check One');
	      c.add(Checkbox, 4,60, 'Check Two');
	      c.add(HSlide, 4,80, 0.3);
	      for (var i=0; i < n; i++) {
	        var r = 10 + Math.floor(Math.random()*25),
	            x = Math.random()*(c.width - r),
	            y = Math.random()*(c.height - r),
	            w = 1 + Math.floor(Math.random()*6),
	            grp = c.add(Group,x,y),
	            path = grp.add(Path,0,0,{fill:mk_color(),stroke:mk_color(),lineWidth:w,lineJoin:'round'}),
	            text = grp.add(Text,0,0,'#'+i,{fill:'white',font:'bold 18px Arial'});
	        path.rect(-r,-r,2*r,2*r);
	        //path.arc(0,0,r,0,Math.PI).close();
	        path.on('hover', on_hover);
	        path.on('click', on_click);
	        grp.draggable = true;
	      }
	    }

    	mk_shapes(c, 10);
    	c.render();
    };
});
