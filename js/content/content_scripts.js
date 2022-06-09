// console.log('run content_script.js');

function injectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.insertBefore(s, th.firstChild);
}
injectScript( chrome.runtime.getURL('/content_message.js'), 'html');
injectScript( chrome.runtime.getURL('/config.js'), 'html');
injectScript( chrome.runtime.getURL('/js/content/content_inject.js'), 'html');
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
		}else if(res.action == 'mapping_rek_fmis'){
			_alert = false;
			cek_hide_loading = false;
			mapping_rek_fmis(res);
		}else if(res.action == 'get_sumber_dana'){
			_alert = false;
			cek_hide_loading = false;
			singkronisasi_sumberdana(res);
		}else if(res.action == 'get_kas_fmis'){
			_alert = false;
			cek_hide_loading = false;
			singkronisasi_anggaran_kas(res);
		}else if(res.action == 'get_spd'){
			_alert = false;
			cek_hide_loading = false;
			singkronisasi_spd(res);
		}else if(res.action == 'get_spd_rinci'){
			_alert = false;
			cek_hide_loading = false;
			continue_spd_rinci(res.data);
		}else if(res.action == 'get_spp'){
			_alert = false;
			cek_hide_loading = false;
			singkronisasi_spp(res.data);
		}else if(res.action == 'get_pegawai_simda'){
			_alert = false;
			cek_hide_loading = false;
			singkronisasi_data_pegawai(res.data);
		}else if(res.action == 'get_meta_subunit_simda'){
			_alert = false;
			cek_hide_loading = false;
			singkronisasi_data_meta_sub_unit(res.data);
		}else if(
			res.action == 'get_data_pendapatan'
			|| res.action == 'get_data_pembiayaan'
		){
			_alert = false;
			cek_hide_loading = false;
			singkronisasi_pendapatan(res);
		}else if(res.action == 'get_sub_keg_rka'){
			_alert = false;
			cek_hide_loading = false;
			// resolve get rka
			lanjut_singkron_rka(res.data);
		}else if(res.action == 'get_sub_keg'){
			_alert = false;
			cek_hide_loading = false;
			if(res.run == 'singkronisasi_program_all_skpd'){
				options_all_skpd.sub_kegiatan = res.data;
				singkronisasi_program_modal(options_all_skpd, function(){
					// resolve singkron all skpd
					lanjut_singkron_rka_all_skpd(nextData_all_skpd);
				});
			}else if(res.run == 'singkronisasi_program'){
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
			}else if(res.run == 'generate_gl'){
		    	generate_gl(res.data);
			}else{
				var bidur = {};
				jQuery('li[data-type="bidang"]').map(function(i, b){
					var bidang = jQuery(b).attr('data-info').split(' - ');
					bidur[bidang[0]] = {
						code: jQuery(b).attr('data-code'),
						text: bidang.join(' ')
					}
				});
				var data_skpd = [];
				res.data.map(function(b, i){
					if(!b.bidur1){
						return;
					}

					var bidur_sipd = b.bidur1.split(' ');
					bidur_sipd = bidur_sipd.shift();
					bidur_sipd = bidur_sipd.split('.').map(function(b, i){
						return +b;
					});
					bidur_sipd = bidur_sipd.join('.');
					if(bidur[bidur_sipd]){
						b.code = bidur[bidur_sipd].code;
						b.bidur1_text = bidur[bidur_sipd].text;
					}

					if(b.bidur2){
						var bidur_sipd = b.bidur2.split(' ');
						bidur_sipd = bidur_sipd.shift();
						bidur_sipd = bidur_sipd.split('.').map(function(b, i){
							return +b;
						});
						bidur_sipd = bidur_sipd.join('.');
						if(bidur[bidur_sipd]){
							b.bidur2_text = bidur[bidur_sipd].text;
						}
					}

					if(b.bidur3){
						var bidur_sipd = b.bidur3.split(' ');
						bidur_sipd = bidur_sipd.shift();
						bidur_sipd = bidur_sipd.split('.').map(function(b, i){
							return +b;
						});
						bidur_sipd = bidur_sipd.join('.');
						if(bidur[bidur_sipd]){
							b.bidur3_text = bidur[bidur_sipd].text;
						}
					}

					if(b.is_skpd == 1){
						var sub_unit = [];
						res.data.map(function(bb, ii){
							if(
								bb.is_skpd == 0
								&& bb.id_unit == b.id_skpd
							){
								sub_unit.push(bb);
							}
						});
						sub_unit.push(b);
						b.sub_unit = sub_unit;
					}
					data_skpd.push(b);
				});
				if(data_skpd.length == 0){
					cek_hide_loading = true;
					alert('Data Profile SKPD atau master sub kegiatan SIPD belum disingkronkan!');
				}else{
					if(res.run == 'singkron_skpd_sipd'){
						var url_tambah_skpd = jQuery('a[title="Tambah SKPD"]').attr('href');
				    	singkron_skpd_sipd(url_tambah_skpd, data_skpd);
					}else if(res.run == 'singkron_skpd_sipd_all'){
				    	singkron_skpd_sipd_all(data_skpd);
					}
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