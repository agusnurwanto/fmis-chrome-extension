if(typeof _token == 'undefined'){
	_token = jQuery('meta[name="csrf-token"]').attr('content');
	console.log('_token', _token);
}

// untuk menjaga session
intervalSession();

var loading = ''
	+'<div id="wrap-loading">'
        +'<div class="lds-hourglass"></div>'
        +'<div id="persen-loading"></div>'
    +'</div>';
if(jQuery('#wrap-loading').length == 0){
	jQuery('body').prepend(loading);
}
var current_url = window.location.href;
if(current_url.indexOf('parameter/ssh/struktur-ssh') != -1){
	var btn = ''
	+'<button type="button" class="btn btn-outline-success btn-sm" style="margin-left: 3px;" id="singkron-ssh-sipd">'
        +'<i class="fa fa-cloud-upload-alt fa-fw"></i> Singkronisasi SSH SIPD'
    +'</button>';
	jQuery('#golongan .btn-outline-dark').after(btn);
	jQuery('#singkron-ssh-sipd').on('click', function(){
		jQuery('#wrap-loading').show();
		var data = {
		    message:{
		        type: "get-url",
		        content: {
				    url: config.url_server_lokal,
				    type: 'post',
				    data: { 
						action: 'get_ssh',
						tahun_anggaran: config.tahun_anggaran,
						api_key: config.api_key
					},
	    			return: true,
	    			continue: 'get_ssh'
				}
		    }
		};
		chrome.runtime.sendMessage(data, function(response) {
		    console.log('responeMessage', response);
		});
	});

	var btn = ''
	+'<button type="button" class="btn btn-outline-danger btn-sm" style="margin-left: 3px;" id="delete-all-rekening">'
        +'<i class="fa fa-trash fa-fw"></i> Delete All Rekening'
    +'</button>';
	jQuery('#rekening a[title="Tambah Rekening"]').after(btn);
	jQuery('#delete-all-rekening').on('click', function(){
		var code_item = jQuery('input[name="code_item"]').val();
		delete_all_rekening(code_item);
	});

	var btn = ''
	+'<button type="button" class="btn btn-outline-danger btn-sm" style="margin-left: 3px;" id="delete-all-item">'
        +'<i class="fa fa-trash fa-fw"></i> Delete All Item SSH'
    +'</button>';
	jQuery('#item a[title="Tambah Item"]').after(btn);
	jQuery('#delete-all-item').on('click', function(){
		var code_subkelompok = jQuery('input[name="code_subkelompok"]').val();
		delete_all_item(code_subkelompok);
	});

	var btn = ''
	+'<button type="button" class="btn btn-outline-danger btn-sm" style="margin-left: 3px;" id="delete-all-subkelompok">'
        +'<i class="fa fa-trash fa-fw"></i> Delete All Sub Kelompok SSH'
    +'</button>';
	jQuery('#subkelompok a[title="Tambah Sub Kelompok"]').after(btn);
	jQuery('#delete-all-subkelompok').on('click', function(){
		var code_kelompok = jQuery('input[name="code_kelompok"]').val();
		delete_all_subkelompok(code_kelompok);
	});

	var btn = ''
	+'<button type="button" class="btn btn-outline-danger btn-sm" style="margin-left: 3px;" id="delete-all-kelompok">'
        +'<i class="fa fa-trash fa-fw"></i> Delete All Kelompok SSH'
    +'</button>';
	jQuery('#kelompok a[title="Tambah Kelompok"]').after(btn);
	jQuery('#delete-all-kelompok').on('click', function(){
		var code_golongan = jQuery('input[name="code_golongan"]').val();
		delete_all_kelompok(code_golongan);
	});

	var btn = ''
	+'<button type="button" class="btn btn-outline-danger btn-sm" style="margin-left: 3px;" id="delete-all-golongan">'
        +'<i class="fa fa-trash fa-fw"></i> Delete All Golongan SSH'
    +'</button>';
	jQuery('#singkron-ssh-sipd').after(btn);
	jQuery('#delete-all-golongan').on('click', function(){
		delete_all_golongan();
	});
}else if(current_url.indexOf('parameter/ssh/perkada-ssh') != -1){
	var btn = ''
	+'<button type="button" class="btn btn-outline-danger btn-sm" style="margin-left: 3px;" id="delete-all-tarif">'
        +'<i class="fa fa-trash fa-fw"></i> Delete All Tarif SSH'
    +'</button>';
    jQuery('a[title="Edit Nilai Tarif Item"]').after(btn);
    jQuery('#delete-all-tarif').on('click', function(){
		var subkelompok_code = jQuery('input[name="code_subkelompok"]').val();
		var code_perkada = jQuery('input[name="code_perkada"]').val();
    	detele_all_tarif(subkelompok_code, code_perkada);
    });

	var btn = ''
	+'<button type="button" class="btn btn-outline-danger btn-sm" style="margin-left: 3px;" id="delete-all-tarif-sub-kelompok">'
        +'<i class="fa fa-trash fa-fw"></i> Delete All Tarif SSH Sub Kelompok'
    +'</button>';
    jQuery('a[title="Tambah Sub Kelompok"]').after(btn);
    jQuery('#delete-all-tarif-sub-kelompok').on('click', function(){
		var kelompok_code = jQuery('input[name="code_kelompok"]').val();
		var code_perkada = jQuery('input[name="code_perkada"]').val();
    	detele_all_tarif_sub_kelompok(kelompok_code, code_perkada);
    });

	var btn = ''
	+'<button type="button" class="btn btn-outline-danger btn-sm" style="margin-left: 3px;" id="delete-all-tarif-kelompok">'
        +'<i class="fa fa-trash fa-fw"></i> Delete All Tarif SSH Kelompok'
    +'</button>';
    jQuery('a[title="Tambah Kelompok"]').after(btn);
    jQuery('#delete-all-tarif-kelompok').on('click', function(){
		var golongan_code = jQuery('input[name="code_golongan"]').val();
		var code_perkada = jQuery('input[name="code_perkada"]').val();
    	detele_all_tarif_kelompok(golongan_code, code_perkada);
    });

	var btn = ''
	+'<button type="button" class="btn btn-outline-danger btn-sm" style="margin-left: 3px;" id="delete-all-tarif-golongan">'
        +'<i class="fa fa-trash fa-fw"></i> Delete All Tarif SSH Golongan'
    +'</button>';
    jQuery('a[title="Tambah Golongan"]').parent().append(btn);
    jQuery('#delete-all-tarif-golongan').on('click', function(){
		var code_perkada = jQuery('input[name="code_perkada"]').val();
    	detele_all_tarif_golongan(code_perkada);
    });
}else if(current_url.indexOf('parameter/unit-organisasi') != -1){
	var btn = ''
	+'<button type="button" class="btn btn-outline-success btn-sm" style="margin-left: 3px;" id="singkron-skpd">'
        +'<i class="fa fa-cloud-upload-alt fa-fw"></i> Singkronisasi SKPD SIPD'
    +'</button>';
    jQuery('a[title="Tambah SKPD"]').after(btn);
    jQuery('#singkron-skpd').on('click', function(){
    	jQuery("#wrap-loading").show();
		var data = {
		    message:{
		        type: "get-url",
		        content: {
				    url: config.url_server_lokal,
				    type: 'post',
				    data: { 
						action: 'get_skpd',
						run: 'singkron_skpd_sipd',
						tahun_anggaran: config.tahun_anggaran,
						api_key: config.api_key
					},
	    			return: true
				}
		    }
		};
		chrome.runtime.sendMessage(data, function(response) {
		    console.log('responeMessage', response);
		});
    });
}

jQuery('body').on('click', '#singkron-tarif-ssh-sipd', function(){
	jQuery("#wrap-loading").show();
	var data = {
	    message:{
	        type: "get-url",
	        content: {
			    url: config.url_server_lokal,
			    type: 'post',
			    data: { 
					action: 'get_ssh',
					tahun_anggaran: config.tahun_anggaran,
					api_key: config.api_key
				},
    			return: true
			}
	    }
	};
	chrome.runtime.sendMessage(data, function(response) {
	    console.log('responeMessage', response);
	});
});