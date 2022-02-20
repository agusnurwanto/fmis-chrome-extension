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
if(current_url.indexOf('parameter/rekening') != -1){
	var btn = ''
	+'<button type="button" class="btn btn-outline-success btn-sm" id="mapping-rek-sipd">'
        +'<i class="fa fa-cloud-upload-alt fa-fw"></i> Mapping Data Rekening ke WP-SIPD'
    +'</button>';
	jQuery('a.btn-outline-dark[title="Salin Data Tahun Sebelumnya"]').parent().append(btn);
	jQuery('#mapping-rek-sipd').on('click', function(){
		show_loading();
		pesan_loading('GET DATA REKENING FMIS', true);
		getMasterRek(5).then(function(rek){
			pesan_loading('SEND MAPPING DATA REKENING KE WP-SIPD', true);
			var data = {
			    message:{
			        type: "get-url",
			        content: {
					    url: config.url_server_lokal,
					    type: 'post',
					    data: { 
							action: 'mapping_rek_fmis',
							rek: rek,
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
	});
}else if(current_url.indexOf('parameter/ssh/struktur-ssh') != -1){
	getMasterRek().then(function(rek){
		console.log('rek', rek);
	});
	var btn = ''
	+'<button type="button" class="btn btn-outline-success btn-sm" style="margin-left: 3px;" id="singkron-ssh-sipd">'
        +'<i class="fa fa-cloud-upload-alt fa-fw"></i> Singkronisasi SSH SIPD'
    +'</button>';
	jQuery('#golongan .btn-outline-dark').parent().append(btn);
	jQuery('#singkron-ssh-sipd').on('click', function(){
    	if(confirm('Apakah anda yakin untuk melakukan singkronisasi data Struktur SSH dari WP-SIPD ke FMIS?')){
			var idkelompok = prompt('Masukan ID kelompok dari SIPD! 1=SSH, 4=SBU, 2=HSPK, 3=ASB, 8=RKA APBD Murni SIMDA, 9=RKA', 1);
			if(idkelompok >= 1){
				show_loading();
				jQuery('#persen-loading').attr('persen', 0);
				pesan_loading('GET STRUKTUR STANDAR HARGA DARI WP-SIPD', true);
				var data = {
				    message:{
				        type: "get-url",
				        content: {
						    url: config.url_server_lokal,
						    type: 'post',
						    data: { 
								action: 'get_ssh',
								kelompok: idkelompok,
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
			}else{
				alert('ID kelompok harus diisi!');
			}
		}
	});

	var btn = ''
	+'<button type="button" class="btn btn-outline-danger btn-sm" style="margin-left: 3px;" id="delete-all-rekening">'
        +'<i class="fa fa-trash fa-fw"></i> Delete All Rekening'
    +'</button>';
	jQuery('#rekening a[title="Tambah Rekening"]').parent().append(btn);
	jQuery('#delete-all-rekening').on('click', function(){
		var code_item = jQuery('input[name="code_item"]').val();
		delete_all_rekening(code_item);
	});

	var btn = ''
	+'<button type="button" class="btn btn-outline-danger btn-sm" style="margin-left: 3px;" id="delete-all-item">'
        +'<i class="fa fa-trash fa-fw"></i> Delete All Item SSH'
    +'</button>';
	jQuery('#item a[title="Tambah Item"]').parent().append(btn);
	jQuery('#delete-all-item').on('click', function(){
		var code_subkelompok = jQuery('input[name="code_subkelompok"]').val();
		delete_all_item(code_subkelompok);
	});

	var btn = ''
	+'<button type="button" class="btn btn-outline-danger btn-sm" style="margin-left: 3px;" id="delete-all-subkelompok">'
        +'<i class="fa fa-trash fa-fw"></i> Delete All Sub Kelompok SSH'
    +'</button>';
	jQuery('#subkelompok a[title="Tambah Sub Kelompok"]').parent().append(btn);
	jQuery('#delete-all-subkelompok').on('click', function(){
		var code_kelompok = jQuery('input[name="code_kelompok"]').val();
		delete_all_subkelompok(code_kelompok);
	});

	var btn = ''
	+'<button type="button" class="btn btn-outline-danger btn-sm" style="margin-left: 3px;" id="delete-all-kelompok">'
        +'<i class="fa fa-trash fa-fw"></i> Delete All Kelompok SSH'
    +'</button>';
	jQuery('#kelompok a[title="Tambah Kelompok"]').parent().append(btn);
	jQuery('#delete-all-kelompok').on('click', function(){
		var code_golongan = jQuery('input[name="code_golongan"]').val();
		delete_all_kelompok(code_golongan);
	});

	var btn = ''
	+'<button type="button" class="btn btn-outline-danger btn-sm" style="margin-left: 3px;" id="delete-all-golongan">'
        +'<i class="fa fa-trash fa-fw"></i> Delete All Golongan SSH'
    +'</button>';
	jQuery('#singkron-ssh-sipd').parent().append(btn);
	jQuery('#delete-all-golongan').on('click', function(){
		delete_all_golongan();
	});
}else if(current_url.indexOf('parameter/ssh/perkada-ssh') != -1){
	var btn = ''
	+'<button type="button" class="btn btn-outline-danger btn-sm" style="margin-left: 3px;" id="delete-all-tarif">'
        +'<i class="fa fa-trash fa-fw"></i> Delete All Tarif SSH'
    +'</button>';
    jQuery('a[title="Edit Nilai Tarif Item"]').parent().append(btn);
    jQuery('#delete-all-tarif').on('click', function(){
		var subkelompok_code = jQuery('input[name="code_subkelompok"]').val();
		var code_perkada = jQuery('input[name="code_perkada"]').val();
    	detele_all_tarif(subkelompok_code, code_perkada);
    });

	var btn = ''
	+'<button type="button" class="btn btn-outline-danger btn-sm" style="margin-left: 3px;" id="delete-all-tarif-sub-kelompok">'
        +'<i class="fa fa-trash fa-fw"></i> Delete All Tarif SSH Sub Kelompok'
    +'</button>';
    jQuery('a[title="Tambah Sub Kelompok"]').parent().append(btn);
    jQuery('#delete-all-tarif-sub-kelompok').on('click', function(){
		var kelompok_code = jQuery('input[name="code_kelompok"]').val();
		var code_perkada = jQuery('input[name="code_perkada"]').val();
    	detele_all_tarif_sub_kelompok(kelompok_code, code_perkada);
    });

	var btn = ''
	+'<button type="button" class="btn btn-outline-danger btn-sm" style="margin-left: 3px;" id="delete-all-tarif-kelompok">'
        +'<i class="fa fa-trash fa-fw"></i> Delete All Tarif SSH Kelompok'
    +'</button>';
    jQuery('a[title="Tambah Kelompok"]').parent().append(btn);
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
    +'</button>'
	+'<button type="button" class="btn btn-outline-danger btn-sm" style="margin-left: 3px;" id="delete-skpd">'
        +'<i class="fa fa-trash-alt fa-fw"></i> Hapus All SKPD & Struktur Organisasi'
    +'</button>';
    jQuery('a[title="Tambah SKPD"]').parent().append(btn);
    jQuery('#singkron-skpd').on('click', function(){
    	if(confirm('Apakah anda yakin untuk melakukan singkronisasi data SKPD dari WP-SIPD ke FMIS?')){
	    	show_loading();
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
		}
    });
    jQuery('#delete-skpd').on('click', function(){
    	var url_tambah_skpd = jQuery('a[title="Tambah SKPD"]').attr('href');
    	delete_skpd_fmis(url_tambah_skpd);
    });

	var btn = ''
	+'<button type="button" class="btn btn-outline-success btn-sm" style="margin-left: 3px;" id="singkron-skpd-all">'
        +'<i class="fa fa-cloud-upload-alt fa-fw"></i> Singkronisasi All SKPD SIPD'
    +'</button>'
	+'<button type="button" class="btn btn-outline-danger btn-sm" style="margin-left: 3px;" id="delete-skpd-all">'
        +'<i class="fa fa-trash-alt fa-fw"></i> Hapus All SKPD & Struktur Organisasi'
    +'</button>';
    jQuery('#bidang .p-2 > h4').parent().append(btn);
    jQuery('#singkron-skpd-all').on('click', function(){
    	show_loading();
		var data = {
		    message:{
		        type: "get-url",
		        content: {
				    url: config.url_server_lokal,
				    type: 'post',
				    data: { 
						action: 'get_skpd',
						run: 'singkron_skpd_sipd_all',
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
    jQuery('#delete-skpd-all').on('click', function(){
    	delete_skpd_all_fmis();
    });
}else if(current_url.indexOf('/parameter/program-kegiatan') != -1){
	var btn = ''
	+'<button type="button" class="btn btn-outline-success btn-sm" style="margin-left: 3px;" id="singkron-sub-kegiatan">'
        +'<i class="fa fa-cloud-upload-alt fa-fw"></i> Mapping Data Sub Kegiatan ke WP-SIPD'
    +'</button>';
    jQuery('ol.breadcrumb').parent().append(btn);
    jQuery('#singkron-sub-kegiatan').on('click', function(){
		show_loading();
		mapping_sub_kegiatan();
    });
}else if(current_url.indexOf('/parameter/simda-ng/sumber-dana') != -1){
	var btn = ''
	+'<button type="button" class="btn btn-outline-success btn-sm" style="margin-left: 3px;" id="singkron-sumber-dana">'
        +'<i class="fa fa-cloud-upload-alt fa-fw"></i> Mapping Data Sumber Dana ke WP-SIPD'
    +'</button>';
    jQuery('a.btn-sm[title="Tambah Sumber Dana"]').parent().append(btn);
    jQuery('#singkron-sumber-dana').on('click', function(){
		show_loading();
		mapping_sumberdana();
    });
}else if(current_url.indexOf('/importren') != -1){
	var modal_sub_keg = ''
		+'<div class="modal fade" id="mod-konfirmasi-bidur-skpd" tabindex="-1" role="dialog" data-backdrop="static" aria-hidden="true" style="z-index: 99999">'
	        +'<div class="modal-dialog modal-lg" role="document">'
	            +'<div class="modal-content">'
	                +'<div class="modal-header bgpanel-theme" style="background: #8997bd;">'
	                    +'<h4 class="modal-title text-white" id="">Pilih SKPD Generate GL</h4>'
	                    +'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true"><i class="mdi mdi-close-circle"></i></span></button>'
	                +'</div>'
	                +'<div class="modal-body">'
	                	+'<div class="form-group row p-2">'
	                		+'<label for="mod-rpjm" class="col-sm-3 col-form-label text-left font-weight-semibold border-bottom">Pilih Dokumen RPJMD</label>'
	                		+'<select class="form-control col-sm-9" id="mod-rpjm"></select>'
	                	+'</div>'
	                	+'<div class="form-group row p-2">'
	                		+'<label for="mod-type-gl" class="col-sm-3 col-form-label text-left font-weight-semibold border-bottom">Pilih Type GL</label>'
	                		+'<select class="form-control col-sm-9" id="mod-type-gl">'
	                			+'<option value="1">RENSTRA</option>'
	                			+'<option value="2">RENJA</option>'
	                		+'</select>'
	                	+'</div>'
	                  	+'<table class="table table-hover table-striped" id="konfirmasi-bidur-skpd">'
	                      	+'<thead>'
	                        	+'<tr style="background: #8997bd;">'
	                          		+'<th class="text-white"><input type="checkbox" id="modal_cek_bidur_all"></th>'
	                          		+'<th class="text-white" width"300">Nama SKPD</th>'
	                        	+'</tr>'
	                      	+'</thead>'
	                      	+'<tbody></tbody>'
	                  	+'</table>'
	                +'</div>'
	                +'<div class="modal-footer">'
	                    +'<button type="button" class="btn btn-success" id="proses_modal">Proses</button>'
	                    +'<button type="button" class="btn btn-default" data-dismiss="modal">Tutup</button>'
	                +'</div>'
	            +'</div>'
	        +'</div>'
	    +'</div>';
	jQuery('body').append(modal_sub_keg);
	var btn = ''
	+'<button type="button" class="btn btn-outline-success btn-sm" style="display: block;" id="generate-renja">'
        +'<i class="fa fa-cloud-upload-alt fa-fw"></i> Generate All RENJA'
    +'</button>';
    jQuery('a.btn-block[title="Tambah Data Renja Metode 2 Garis Lurus"]')
    	.closest('.card-body')
    	.find('.row .col-auto')
    	.append(btn);
    jQuery('#modal_cek_bidur_all').on('click', function(){
		var cek = jQuery(this).is(':checked');
		jQuery('#konfirmasi-bidur-skpd tbody tr input[type="checkbox"]').prop('checked', cek);
	});
    jQuery('#generate-renja').on('click', function(){
		show_loading();
		var data = {
		    message:{
		        type: "get-url",
		        content: {
				    url: config.url_server_lokal,
				    type: 'post',
				    data: { 
						action: 'get_skpd',
						run: 'generate_gl',
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
    jQuery('#proses_modal').on('click', function(){
    	generate_gl_modal();
    });
}else if(current_url.indexOf('/manajemen-user/user') != -1){
	var btn = ''
	+'<button type="button" class="btn btn-outline-success btn-sm" style="margin-left: 3px;" id="singkron-user">'
        +'<i class="fa fa-cloud-upload-alt fa-fw"></i> Singkronisasi User SIPD dari WP-SIPD'
    +'</button>'
	+'<button type="button" class="btn btn-outline-warning btn-sm" style="margin-left: 3px;" id="singkron-skpd">'
        +'<i class="fa fa-cloud-download-alt fa-fw"></i> Mapping SKPD FMIS ke WP-SIPD'
    +'</button>';
    jQuery('a.btn-sm[title="Tambah Pengguna"]').parent().append(btn);
    jQuery('#singkron-user').on('click', function(){
    	if(confirm('Apakah anda yakin untuk menggenerate data user FMIS dari SIPD?')){
			show_loading();
			var data = {
			    message:{
			        type: "get-url",
			        content: {
					    url: config.url_server_lokal,
					    type: 'post',
					    data: { 
							action: 'get_skpd',
							run: 'singkronisasi_user_sipd',
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
		}
    });
    jQuery('#singkron-skpd').on('click', function(){
    	if(confirm('Apakah anda yakin untuk singkronisasi mapping SKPD dari FMIS ke WP-SIPD?')){
			show_loading();
			getUnitFmis().then(function(unit_fmis){
				var data = {
				    message:{
				        type: "get-url",
				        content: {
						    url: config.url_server_lokal,
						    type: 'post',
						    data: { 
								action: 'mapping_skpd_fmis',
								tahun_anggaran: config.tahun_anggaran,
								data: unit_fmis,
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
    });
}else if(current_url.indexOf('/perencanaan-lima-tahunan/rpjmd-murni') != -1){
	var modal_sub_keg = ''
		+'<div class="modal fade" id="mod-konfirmasi-bidur-skpd" tabindex="-1" role="dialog" data-backdrop="static" aria-hidden="true" style="z-index: 99999">'
	        +'<div class="modal-dialog modal-lg" role="document">'
	            +'<div class="modal-content">'
	                +'<div class="modal-header bgpanel-theme" style="background: #8997bd;">'
	                    +'<h4 class="modal-title text-white" id="">Sinkronisasi Urusan Bidang dan SKPD RPJM</h4>'
	                    +'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true"><i class="mdi mdi-close-circle"></i></span></button>'
	                +'</div>'
	                +'<div class="modal-body">'
	                	+''
	                  	+'<table class="table table-hover table-striped" id="konfirmasi-bidur-skpd">'
	                      	+'<thead>'
	                        	+'<tr style="background: #8997bd;">'
	                          		+'<th class="text-white"><input type="checkbox" id="modal_cek_bidur_all"></th>'
	                          		+'<th class="text-white" width="400">Bidang Urusan</th>'
	                          		+'<th class="text-white" width"300">Nama SKPD</th>'
	                        	+'</tr>'
	                      	+'</thead>'
	                      	+'<tbody></tbody>'
	                  	+'</table>'
	                +'</div>'
	                +'<div class="modal-footer">'
	                    +'<button type="button" class="btn btn-success" id="singkron_bidur_skpd_modal">Sinkronisasi</button>'
	                    +'<button type="button" class="btn btn-default" data-dismiss="modal">Tutup</button>'
	                +'</div>'
	            +'</div>'
	        +'</div>'
	    +'</div>';
	jQuery('body').append(modal_sub_keg);
	jQuery('#modal_cek_bidur_all').on('click', function(){
		var cek = jQuery(this).is(':checked');
		jQuery('#konfirmasi-bidur-skpd tbody tr input[type="checkbox"]').prop('checked', cek);
	});
	jQuery('#singkron_bidur_skpd_modal').on('click', function(){
    	singkronisasi_bidur_skpd_rpjm_modal();
	});
	var btn = ''
	+'<button type="button" class="btn btn-outline-success btn-sm" style="margin-left: 3px;" id="singkron-skpd-rpjm">'
        +'<i class="fa fa-cloud-upload-alt fa-fw"></i> Singkronisasi Bidang Urusan & SKPD dari WP-SIPD'
    +'</button>';
    jQuery('#program-urbid a.btn-sm[title="Tambah Urusan"]').parent().append(btn);
    jQuery('#singkron-skpd-rpjm').on('click', function(){
    	if(confirm('Apakah anda yakin untuk menggenerate data user FMIS dari SIPD?')){
			show_loading();
			var data = {
			    message:{
			        type: "get-url",
			        content: {
					    url: config.url_server_lokal,
					    type: 'post',
					    data: { 
							action: 'get_skpd',
							run: 'singkronisasi_bidur_skpd_rpjm',
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
		}
    });
}else if(
	current_url.indexOf('/perencanaan-tahunan/renja-murni') != -1
	|| current_url.indexOf('/anggaran/rka-opd') != -1
){
	window._type_singkronisasi_rka = 'renja-murni';
	if(current_url.indexOf('/anggaran/rka-opd') != -1){
		console.log('Halaman RKA OPD');
		_type_singkronisasi_rka = 'rka-opd';
	}else{
		console.log('Halaman RENJA Murni');
	}
	var modal_sub_keg = ''
		+'<div class="modal fade" id="mod-konfirmasi-program" tabindex="-1" role="dialog" data-backdrop="static" aria-hidden="true" style="z-index: 99999">'
	        +'<div class="modal-dialog modal-xl" role="document">'
	            +'<div class="modal-content">'
	                +'<div class="modal-header bgpanel-theme" style="background: #8997bd;">'
	                    +'<h4 class="modal-title text-white" id="">Data Sub Kegiatan dari WP-SIPD yang belum tersingkronisasi ke FMIS</h4>'
	                    +'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true"><i class="mdi mdi-close-circle"></i></span></button>'
	                +'</div>'
	                +'<div class="modal-body">'
	                	+'<div class="form-group row p-2">'
	                		+'<label for="mod-program-rkpd" class="col-sm-3 col-form-label text-left font-weight-semibold border-bottom">Pilih Program RKPD</label>'
	                		+'<select class="form-control col-sm-9" id="mod-program-rkpd"></select>'
	                	+'</div>'
	                  	+'<table class="table table-hover table-striped" id="konfirmasi-program">'
	                      	+'<thead>'
	                        	+'<tr style="background: #8997bd;">'
	                          		+'<th class="text-white"><input type="checkbox" id="modal_cek_all"></th>'
	                          		+'<th class="text-white" width="300">Program</th>'
	                          		+'<th class="text-white" width="300">Kegiatan</th>'
	                          		+'<th class="text-white" width="500">Sub Kegiatan</th>'
	                        	+'</tr>'
	                      	+'</thead>'
	                      	+'<tbody></tbody>'
	                  	+'</table>'
	                +'</div>'
	                +'<div class="modal-footer">'
	                    +'<button type="button" class="btn btn-success" id="singkron_program_modal">Proses</button>'
	                    +'<button type="button" class="btn btn-default" data-dismiss="modal">Tutup</button>'
	                +'</div>'
	            +'</div>'
	        +'</div>'
	    +'</div>';
	jQuery('body').append(modal_sub_keg);
	jQuery('#modal_cek_all').on('click', function(){
		var cek = jQuery(this).is(':checked');
		jQuery('#konfirmasi-program tbody tr input[type="checkbox"]').prop('checked', cek);
	});
	jQuery('#singkron_program_modal').on('click', function(){
		var table = jQuery('#konfirmasi-program');
		var idkegiatan = table.attr('data-singkron-rka');
		if(idkegiatan != '' && idkegiatan.indexOf('delete-') != -1){
			delete_rka_modal(idkegiatan.split('-')[1]);
		}else if(idkegiatan != ''){
			singkronisasi_rka_modal(idkegiatan);
		}else{
			singkronisasi_program_modal();
		}
	});
	var btn = ''
	+'<button type="button" class="btn btn-outline-danger btn-sm" style="margin-left: 10px; float: right;" id="delete-rka">'
        +'<i class="fa fa-trash fa-fw"></i> Delete RKA'
    +'</button>'
	+'<button type="button" class="btn btn-outline-warning btn-sm" style="margin-left: 10px; float: right;" id="singkron-rka">'
        +'<i class="fa fa-cloud-upload-alt fa-fw"></i> Singkronisasi RKA WP-SIPD di tab Sub Kegiatan'
    +'</button>'
	+'<button type="button" class="btn btn-outline-success btn-sm" style="float: right;" id="singkron-program">'
        +'<i class="fa fa-cloud-upload-alt fa-fw"></i> Singkronisasi Program WP-SIPD di tab Program'
    +'</button>';
    jQuery('.card-header.bg-light').prepend(btn);
    jQuery('#delete-rka').on('click', function(){
		show_loading();
		var tambah_program = jQuery('a.btn-sm[title="Tambah Program"]');
		if(_type_singkronisasi_rka == 'rka-opd'){
			var code_program = jQuery('a.btn-sm[title="Tambah Program RKA"]').attr('href').split('code=')[1];
			if(code_program){
				tambah_program = code_program;
				var sasaran_fmis = jQuery('button.tab-return[onclick="changeTab(\'#tab-sasaran\')"]').closest('tr').find('td').eq(2).text();
			}
		}
		if(tambah_program.length >= 1){
			if(typeof sasaran_fmis != 'undefined'){
				var sasaran_fmis = jQuery('button.previous-tab[data-tab-target="#sasaran-tab"]').closest('tr').find('td').eq(2).text().split(' ');
				sasaran_fmis.shift();
				sasaran_fmis = sasaran_fmis.join(' ');
			}
			if(confirm('Apakah anda yakin untuk menghapus data Program, Kegaitan, Sub Kegiatan, Aktivitas dan Rincian dari sasaran '+sasaran_fmis+'?')){
	    		delete_rka();
	    	}
		}else{
			hide_loading();
			alert('Masuk ke tab Program dulu!');
		}
    });
    jQuery('#singkron-program').on('click', function(){
    	if(confirm('Apakah anda yakin untuk mengsingkronkan data program RENJA dari WP-SIPD?')){
			show_loading();
			get_id_unit_fmis()
			.then(function(id_skpd_fmis){
				pesan_loading('GET DATA SUB KEGIATAN DARI WP-SIPD UNTUK ID SKPD = '+id_skpd_fmis, true);
				var tambah_program = jQuery('a.btn-sm[title="Tambah Program"]');
				if(_type_singkronisasi_rka == 'rka-opd'){
					var code_program = jQuery('a.btn-sm[title="Tambah Program RKA"]').attr('href').split('code=')[1];
					if(code_program){
						tambah_program = code_program;
					}
				}
				if(tambah_program.length >= 1){
					var idsumber = prompt('Masukan ID sumber RKA: 1=WP-SIPD (RKA terbaru), 2=SIMDA PINK (APBD Murni)', 1);
					if(idsumber >= 1){
						var data = {
						    message:{
						        type: "get-url",
						        content: {
								    url: config.url_server_lokal,
								    type: 'post',
								    data: { 
										action: 'get_sub_keg',
										run: 'singkronisasi_program',
										tahun_anggaran: config.tahun_anggaran,
										id_skpd_fmis: id_skpd_fmis,
										idsumber: idsumber,
										api_key: config.api_key
									},
					    			return: true
								}
						    }
						};
						chrome.runtime.sendMessage(data, function(response) {
						    console.log('responeMessage', response);
						});
					}else{
						hide_loading();
						alert('ID sumber RKA harus diisi!');
					}
				}else{
					hide_loading();
					alert('Masuk ke tab Program dulu!');
				}
			})
			.catch(function(e){
				hide_loading();
				alert('Dokumen RENJA belum dibuat!');
			});
		}
    });
    jQuery('#singkron-rka').on('click', function(){
    	if(confirm('Apakah anda yakin untuk mengsingkronkan data RKA dari WP-SIPD?')){
			show_loading();
			get_id_unit_fmis()
			.then(function(id_skpd_fmis){
				pesan_loading('GET DATA SUB KEGIATAN DARI WP-SIPD UNTUK ID SKPD = '+id_skpd_fmis, true);
				var tambah_sub_kegiatan = jQuery('a.btn-sm[title="Tambah Sub Kegiatan"]');
				if(_type_singkronisasi_rka == 'rka-opd'){
					var code_kegiatan = jQuery('a.btn-sm[title="Tambah Sub Kegiatan RKA"]').attr('href').split('code=')[1];
					if(code_kegiatan){
						tambah_sub_kegiatan = code_kegiatan;
					}
				}
				if(tambah_sub_kegiatan.length >= 1){
					var idsumber = prompt('Masukan ID sumber RKA: 1=WP-SIPD (RKA terbaru), 2=SIMDA PINK (APBD Murni)', 1);
					if(idsumber >= 1){
						var data = {
						    message:{
						        type: "get-url",
						        content: {
								    url: config.url_server_lokal,
								    type: 'post',
								    data: { 
										action: 'get_sub_keg',
										run: 'singkronisasi_rka',
										tahun_anggaran: config.tahun_anggaran,
										id_skpd_fmis: id_skpd_fmis,
										idsumber: idsumber,
										api_key: config.api_key
									},
					    			return: true
								}
						    }
						};
						chrome.runtime.sendMessage(data, function(response) {
						    console.log('responeMessage', response);
						});
					}else{
						hide_loading();
						alert('ID sumber RKA harus diisi!');
					}
				}else{
					hide_loading();
					alert('Masuk ke tab Sub Kegiatan dulu!');
				}
			})
			.catch(function(e){
				hide_loading();
				alert('Dokumen RENJA belum dibuat!');
			});
		}
    });
}

jQuery('body').on('click', '#singkron-tarif-ssh-sipd', function(){
    if(confirm('Apakah anda yakin untuk melakukan singkronisasi data tarif SSH dari WP-SIPD ke FMIS?')){
		var idkelompok = prompt('Masukan ID kelompok dari SIPD! 1=SSH, 4=SBU, 2=HSPK, 3=ASB, 8=RKA APBD Murni SIMDA, 9=RKA', 1);
		if(idkelompok >= 1){
			show_loading();
			jQuery('#persen-loading').attr('persen', 0);
			pesan_loading('GET STRUKTUR STANDAR HARGA DARI WP-SIPD', true);
			var data = {
			    message:{
			        type: "get-url",
			        content: {
					    url: config.url_server_lokal,
					    type: 'post',
					    data: { 
							action: 'get_ssh',
							kelompok: idkelompok,
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
		}else{
			alert('ID kelompok harus diisi!');
		}
	}
});