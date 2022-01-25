// console.log('run content_script.js');

function injectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    // th.appendChild(s);
    th.insertBefore(s, th.firstChild);
}
injectScript( chrome.extension.getURL('/config.js'), 'html');
injectScript( chrome.extension.getURL('/js/content/content_inject.js'), 'html');
window.data_temp_onmessage = {};

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
	if(request.continue){
		if(typeof data_temp_onmessage[request.continue] == 'undefined'){
			data_temp_onmessage[request.continue] = [];
		}
		data_temp_onmessage[request.continue].push(request.data.data);
		if(request.no >= request.length){
			request.data.data = data_temp_onmessage[request.continue];
		}else{
			return;
		}
	}
	console.log('sender, request', sender, request);
	if(request.type == 'response-fecth-url'){
		var res = request.data;
		var _alert = true;
		var cek_hide_loading = true;
		if(res.action == 'get_ssh'){
			_alert = false;
			cek_hide_loading = false;
			singkronisasi_ssh(res);
		}else if(res.action == 'get_sub_keg_rka'){
			_alert = false;
			cek_hide_loading = false;
			// resolve get rka
			lanjut_singkron_rka(res.data);
		}else if(res.action == 'get_sub_keg'){
			_alert = false;
			cek_hide_loading = false;
			if(res.run == 'singkronisasi_program'){
				singkronisasi_program(res.data);
			}else if(res.run == 'singkronisasi_rka'){
				singkronisasi_rka(res.data);
			}
		}else if(res.action == 'get_skpd'){
			_alert = false;
			cek_hide_loading = false;
			if(res.run == 'singkronisasi_user_sipd'){
    			singkronisasi_user_sipd(res.data);
			}else if(res.run == 'singkronisasi_bidur_skpd_rpjm'){
		    	singkronisasi_bidur_skpd_rpjm(res.data);
			}else{
				var bidur = {};
				jQuery('li[data-type="bidang"]').map(function(i, b){ 
					bidur[jQuery(b).attr('data-info')] = jQuery(b).attr('data-code');
				});
				var data_skpd = [];
				res.data.map(function(b, i){
					var bidur_sipd = b.bidur1.split(' ');
					bidur_sipd.shift();
					bidur_sipd = bidur_sipd.join(' ');
					if(bidur[bidur_sipd]){
						b.code = bidur[bidur_sipd];
					}
					if(b.isskpd == 1){
						var sub_unit = [];
						sub_unit.push(b);
						res.data.map(function(bb, ii){
							if(
								bb.isskpd == 0
								&& bb.id_unit == b.id_skpd
							){
								sub_unit.push(bb);
							}
						});
						b.sub_unit = sub_unit;
					}
					data_skpd.push(b);
				});
				if(res.run == 'singkron_skpd_sipd'){
					var url_tambah_skpd = jQuery('a[title="Tambah SKPD"]').attr('href');
			    	singkron_skpd_sipd(url_tambah_skpd, data_skpd);
				}else if(res.run == 'singkron_skpd_sipd_all'){
			    	singkron_skpd_sipd_all(data_skpd);
				}
			}
		}
		if(cek_hide_loading){
			hide_loading();
		}
		if(_alert){
			alert(res.message);
		}
	}
	return sendResponse("THANKS from content_script!");
});