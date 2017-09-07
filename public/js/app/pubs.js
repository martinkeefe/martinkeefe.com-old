define(function(require, exports, module) {
	var MK = require('app/lib');
    var L = require('leaflet');

    // Railway Hotel, Dorking, Surrey
    //var STATES = ['bone','gone','dead','food','open','limbo']; // In drawing order
    var STATES = ['bone','gone','dead','open','limbo']; // In drawing order

    var MAP;
    var DATA = [];
    var DOTS = [];
    var SOLO = null;

   	var COLOR = {
   		open: '#6A0',
   		//food: '#C80',
   		food: '#6A0',
   		limbo:'#F00',
   		dead: '#82A',
   		gone: '#28A',
   		bone: '#40D',
   	}

	var map_url = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png';
	var map_att = '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution" target="_blank">CARTO</a>';

	function render() {
		DOTS.forEach(function(dot) {
			MAP.removeLayer(dot);
		});
		DOTS = [];

		STATES.forEach(function(status) {
			if (SOLO && status !== SOLO) {
				return;
			}

			var chk = document.getElementById(status+'-chk');
			if (!SOLO && !chk.checked) {
				return;
			}

			DATA.forEach(function(pub) {
				//if (pub.status === status && pub.lat && pub.lon) {
				if ((pub.status === status || pub.status === 'food' && status === 'open') && pub.lat && pub.lon) {
					var circle = L.circle([pub.lat, pub.lon], {
					    color: COLOR[pub.status],
					    fillColor: COLOR[pub.status],
					    fillOpacity: 0.5,
					    radius: 5
					}).addTo(MAP);
					circle.bindTooltip(pub.name + (pub.closed ? ' (' + pub.closed + ')' : ''));

					var popup = '<b>'+pub.name+'</b>';
					if (pub.url) {
						var url = pub.url.split('|').pop();
						popup = '<a href="'+url+'" target="_blank">'+popup+'</a>';
					}
					if (pub.closed) {
						popup += '&nbsp; closed: ' + pub.closed;
					}
					else if (['open','food'].indexOf(pub.status) == -1) {
						popup += '&nbsp; closed';
					}

					if (pub.prev) {
						popup += '<br/>formerly: ' + pub.prev.split('|').join(', ');
					}

					if (pub.img) {
						var img = pub.img.split('|').pop();
						popup += '<br/><img src="'+img+'" width="150"/>';
					}

					if (pub.addr) {
						popup += '<br/>' + pub.addr.split(',').join('<br/>');// map(function(a) {return '<br/>' + a;});
					}
					if (pub.town) {
						popup += '<br/>' + pub.town;
					}
					if (pub.postcode && pub.postcode.length > 5) {
						popup += '<br/>' + pub.postcode;
					}

					var osm = 'https://www.openstreetmap.org/#map=17/' + pub.lat + '/' + pub.lon
					popup += '<br/><a href="'+osm+'" target="_blank">OSM</a>'

					if (pub.gsv) {
						popup += ' · <a href="'+pub.gsv+'" target="_blank">StreetView</a>';
					}

					circle.bindPopup('<div style="font-family: Lato, sans-serif; font-size: 14px; max-width: 150px;">'+popup+'</div>');

					DOTS.push(circle);
				}
			});
		});
	}



    return function() {
		MAP = L.map('mapid', {
			center: [51.23, -0.33],
			maxBounds: [
			    [51.15, -0.49],
			    [51.32, -0.20]
			],
			zoom: 12,
		});

		L.tileLayer(map_url, {
		    attribution: map_att,
		    minZoom: 11,
		    maxZoom: 18,
		}).addTo(MAP);

		//L.control.scale().addTo(map);

    	MK.get_csv('/data/pubs.csv')
    		.then(function(data) {
    			DATA = data;
    			render();
			});

		STATES.forEach(function(status) {
			var chk = document.getElementById(status+'-chk');
			chk.addEventListener('click', function(e) {
				render();
			});

			var btn = document.getElementById(status+'-btn');
			btn.addEventListener('click', function(e) {
				if (SOLO === status) {
					btn.checked = false;
					SOLO = null;
				}
				else {
					SOLO = status;
				}
				STATES.forEach(function(s) {
					var c = document.getElementById(s+'-chk');
					c.disabled = !!SOLO;
				});

				render();
			});
		})
	};
});
