define(function(require, exports, module) {

	exports.hslide = function(parent, options, action) {
		var slider = new dhtmlXSlider({
		    parent:     parent,
		    //size:       150,
		    value:      options.value,
		    step:       options.step,
		    min:        options.min,
		    max:        options.max,
		    //vertical:   true,
		    linkTo:     options.peer,
		    size: 		options.size,
		    //inverse:    true
		});

		if (action) {
			slider.attachEvent("onChange", function(newValue, sliderObj) {
				action(newValue);
			});
		}
	};

	exports.hrange = function(parent, options, action) {
		var slider = new dhtmlXSlider({
		    parent:     parent,
		    //size:       150,
		    value:      options.values,
		    step:       options.step,
		    min:        options.min,
		    max:        options.max,
		    //vertical:   true,
		    linkTo:     options.peer,
		    //inverse:    true,
		    range:  	true,
		    size: 		options.size,
		});

		if (action) {
			slider.attachEvent("onChange", function(newValue, sliderObj) {
				action(newValue[0],newValue[1]);
			});
		}
	};
});
