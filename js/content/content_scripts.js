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
		var hide_loading = true;
		if(res.action == 'get_ssh'){
			_alert = false;
			hide_loading = false;
			singkronisasi_ssh(res);
		}else if(res.action == 'get_skpd'){
			_alert = false;
			hide_loading = false;
			var bidur = {};
			jQuery('li[data-type="bidang"]').map(function(i, b){ 
				bidur[jQuery(b).attr('data-info')] = jQuery(b).attr('data-code');
			});
			res.data.map(function(b, i){
				var bidur_sipd = b.bidur1.split(' ');
				bidur_sipd.shift();
				bidur_sipd = bidur_sipd.join(' ');
				if(bidur[bidur_sipd]){
					res.data[i].code = bidur[bidur_sipd];
				}
			});
			if(res.run == 'singkron_skpd_sipd'){
				var url_tambah_skpd = jQuery('a[title="Tambah SKPD"]').attr('href');
		    	singkron_skpd_sipd(url_tambah_skpd, res.data);
			}
		}
		if(hide_loading){
			jQuery('#wrap-loading').hide();
			jQuery('#persen-loading').html('');
			jQuery('#persen-loading').attr('persen', '');
			jQuery('#persen-loading').attr('total', '');
		}
		if(_alert){
			alert(res.message);
		}
	}
	return sendResponse("THANKS from content_script!");
});