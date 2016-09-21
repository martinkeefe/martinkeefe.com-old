define(function(require, exports, module) {
    var $ = require('zepto');
    var _ = require('lodash');

    var mnm_num;
    var items;
    var index;
    var audio = $('<audio controls></audio>'); // <audio src="http://s3-eu-west-1.amazonaws.com/raiment57/mnm09/17.mp3" controls></audio>

    function play() {
    	console.log(' play', index);
    	if (index < items.length) {
			items[index].item.addClass('active');
	    	items[index].item.append(audio);
	    	audio.attr('src', 'http://s3-eu-west-1.amazonaws.com/raiment57/mnm' + items[index].mnm_num + '/' + items[index].trk_num + '.mp3');
	    	audio[0].play();
	    }
    }

    function stop() {
    	console.log(' stop', index);
		if (index < items.length) {
			items[index].item.removeClass('active');
		}
    	//audio[0].pause();
    	audio.remove();
    }

    function next(e) {
    	console.log('next');
    	//if (e) {
    	//	e.stopPropagation();
    	//}
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
	    var template = _.template($('#playlist-item').html());

    	var recs = data.split('\n');
    	var rec0 = recs[0].split('\t');

		$('#title').text(rec0[0]);
		$('#intro').html(rec0[1] || '');

	    items = [];
	    playlist.empty();
		_.each(recs, function(rec, i) {
			if (i > 0) {
				rec = rec.split('\t');
				var info = {
					mnm_num: mnm_num,
					trk_num: _.padStart(i,2,'0'),
					art_name: rec[0],
					trk_name: rec[1],
					alb_name: rec[3],
					alb_year: rec[5],
				};
				info.item = $(template(info));
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
