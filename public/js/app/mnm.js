define(function(require, exports, module) {
    var $ = require('zepto');
    var MK = require('app/lib');

    var mnm_num;
    var items;
    var index;
    var audio = $('<audio controls></audio>');

    function play() {
    	console.log(' play', index);
    	if (index < items.length) {
    		var src = MK.strerp('http://s3-eu-west-1.amazonaws.com/raiment57/mnm{{mnm_num}}/{{trk_num}}.mp3', items[index]);
			items[index].item.addClass('active');
	    	items[index].item.append(audio);
	    	audio.attr('src', src);
	    	audio[0].play();
	    }
    }

    function stop() {
    	console.log(' stop', index);
		if (index < items.length) {
			items[index].item.removeClass('active');
		}
    	audio.remove();
    }

    function next(e) {
    	console.log('next');
    	stop();
    	index++;
    	play();
    }
	audio.on("ended", next);

    function go_to(idx) {
    	if (idx !== index) {
	    	stop();
		   	index = idx;
		   	play();
		}
    }

    function render(data) {
	    var playlist = $('#playlist');
	    var template = $('#playlist-item').html();

    	var recs = data.split('\n');
    	var rec0 = recs[0].split('\t');

		$('#title').text(rec0[0]);
		$('#intro').html(rec0[1] || '');

	    items = [];
	    playlist.empty();
		recs.forEach(function(rec, i) {
			if (i > 0) {
				rec = rec.split('\t');
				var info = {
					mnm_num: mnm_num,
					trk_num: ('0' + i).substr(-2),
					art_name: rec[0],
					trk_name: rec[1],
					alb_name: rec[3],
					alb_year: rec[5],
				};
				info.item = $(MK.strerp(template, info));
				info.item.click(function() {
					go_to(i-1);
				});
				items.push(info);
				playlist.append(info.item);
			}
		});

	    index = 0;
		play();
    }

	return function(num) {
		mnm_num = num;
	    $.ajax({
  			type: 'GET',
  			url: 'data/mnm/mnm'+num+'.csv',
  			success: render,
  			error: function(xhr, type){
  				console.error(xhr);
  			},
  		});
	};
});
