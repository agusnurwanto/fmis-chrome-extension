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
			var idkelompok = prompt('Masukan ID kelompok dari SIPD! 1=SSH, 4=SBU, 2=HSPK, 3=ASB', 1);
			jQuery('#wrap-loading').show();
			jQuery('#persen-loading').attr('persen', 0);
			jQuery('#persen-loading').html('LOADING...<br>GET STRUKTUR STANDAR HARGA DARI WP-SIPD');
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
    	jQuery("#wrap-loading").show();
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
			jQuery('#wrap-loading').show();
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
			jQuery('#wrap-loading').show();
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
		var skpd_selected = [];
		jQuery('#konfirmasi-bidur-skpd tbody tr input[type="checkbox"]').map(function(i, b){
			var cek = jQuery(b).is(':checked');
			if(cek){
				var id_skpd = jQuery(b).attr('value');
				data_bidur_skpd.map(function(bb, ii){
					if(bb.id_skpd == id_skpd){
						skpd_selected.push(bb);
					}
				});
			}
		});
		if(skpd_selected.length >= 1){
			console.log('skpd_selected', skpd_selected);
			jQuery('#wrap-loading').show();
			var table = jQuery('#konfirmasi-bidur-skpd');
			var code_bidang = table.attr('data-code-bidang');
			var urut = table.attr('data-urut');
			var data_post = {
                _token: _token,
                idbidkewenangan: table.attr('data-idbidkewenangan'),
                idrpjmdprogram: table.attr('data-idrpjmdprogram')
            };
            var bidur_save = {};
            var last = skpd_selected.length - 1;
			skpd_selected.reduce(function(sequence, nextData){
	            return sequence.then(function(bidur){
	        		return new Promise(function(resolve_reduce, reject_reduce){
	        			if(!bidur_save[bidur.urusan+'.'+bidur.bidang]){
	        				bidur_save[bidur.urusan+'.'+bidur.bidang] = [];
	        				bidur_save[bidur.urusan+'.'+bidur.bidang].push(bidur);
	        				if(!bidur.bidur_exist){
		        				data_post.kdurut = urut;
		        				urut++;
		        				data_post.idurusan = bidur.urusan;
		        				data_post.idbidang = bidur.bidang;
		        				// save bidang urusan
								relayAjax({
									url: table.attr('data-url-save'),
									type: "post",
						            data: data_post,
						            success: function(res){
						            	resolve_reduce(nextData);
						            },
						            error: function(e){
						            	console.log('Error save bidang urusan!', e, this.data);
						            }
								});
							}else{
						        resolve_reduce(nextData);
							}
						}else{
	        				bidur_save[bidur.urusan+'.'+bidur.bidang].push(bidur);
							resolve_reduce(nextData);
						}
	                })
	                .catch(function(e){
	                    console.log(e);
	                    return Promise.resolve(nextData);
	                });
	            })
	            .catch(function(e){
	                console.log(e);
	                return Promise.resolve(nextData);
	            });
	        }, Promise.resolve(skpd_selected[last]))
	        .then(function(data_last){
	        	// get all bidang urusan
	        	relayAjax({
					url: config.fmis_url+'/perencanaan-lima-tahunan/rpjmd-murni/datatable?code='+code_bidang+'&table=program-urbid',
					success: function(bidur){
						var sendData1 = [];
			            var last = bidur.data.length - 1;
						bidur.data.reduce(function(sequence, nextData){
				            return sequence.then(function(current_data){
				        		return new Promise(function(resolve_reduce, reject_reduce){
				        			var code_bidang_pelaksana = false;
				        			var id_skpd_fmis = [];
									skpd_selected.map(function(bb, ii){
										if(bb.nama_bidang == current_data.bidang.nmbidang){
											code_bidang_pelaksana = current_data.code;
											id_skpd_fmis.push(bb.id_skpd_fmis);
										}
									});
									if(code_bidang_pelaksana){
										// get form tambah data skpd pelaksana
							        	relayAjax({
											url: config.fmis_url+'/perencanaan-lima-tahunan/rpjmd-murni/form?table=program-pelaksana&code='+code_bidang_pelaksana+'&action=create',
											success: function(form_tambah){
												var url_save_form = form_tambah.form.split('action=\"')[1].split('\"')[0];
												var form = jQuery(form_tambah.form);
												var data_post = {
									                _token: _token,
									                kdurut: form.find('#kdurut').val(),
									                idbidkewenangan: form.find('input[name="idbidkewenangan"]').val(),
									                idskpdpelaksana: form.find('input[name="idskpdpelaksana"]').val(),
									                DataTables_Table_0_length: 10,
									                idskpd: id_skpd_fmis
									            };
									            // simpan skpd pelaksana
												relayAjax({
													url: url_save_form,
													type: "post",
										            data: data_post,
										            success: function(res){
										            	resolve_reduce(nextData);
										            },
										            error: function(e){
										            	console.log('Error save SKPD pelaksana!', e, this.data);
										            }
												});
											}
										});
									}else{
										console.log('Bidang urusan tidak ditemukan untuk SKPD yang dipilih!', current_data, skpd_selected);
										resolve_reduce(nextData);
									}
				                })
				                .catch(function(e){
				                    console.log(e);
				                    return Promise.resolve(nextData);
				                });
				            })
				            .catch(function(e){
				                console.log(e);
				                return Promise.resolve(nextData);
				            });
				        }, Promise.resolve(bidur.data[last]))
				        .then(function(data_last){
				        	console.log('bidur_save', bidur_save);
							run_script('jQuery("#mod-konfirmasi-bidur-skpd").modal("hide")');
							run_script("initRpjmdTableDetail('program-urbid', 'table-program-urbid','"+ code_bidang+"');");
				        	jQuery('#wrap-loading').hide();
							alert('Berhasil singkroniasi bidang urusan dan SKPD di RPJMD');
						});
					}
				});
	        });
		}else{
			alert("Pilih SKPD dulu!");
		}
	});
	var btn = ''
	+'<button type="button" class="btn btn-outline-success btn-sm" style="margin-left: 3px;" id="singkron-skpd-rpjm">'
        +'<i class="fa fa-cloud-upload-alt fa-fw"></i> Singkronisasi Bidang Urusan & SKPD dari WP-SIPD'
    +'</button>';
    jQuery('#program-urbid a.btn-sm[title="Tambah Urusan"]').parent().append(btn);
    jQuery('#singkron-skpd-rpjm').on('click', function(){
    	if(confirm('Apakah anda yakin untuk menggenerate data user FMIS dari SIPD?')){
			jQuery('#wrap-loading').show();
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
}else if(current_url.indexOf('/perencanaan-tahunan/renja-murni') != -1){
	console.log('Halaman RENJA Murni');
	var modal_sub_keg = ''
		+'<div class="modal fade" id="mod-konfirmasi-program" tabindex="-1" role="dialog" data-backdrop="static" aria-hidden="true" style="z-index: 99999">'
	        +'<div class="modal-dialog modal-xl" role="document">'
	            +'<div class="modal-content">'
	                +'<div class="modal-header bgpanel-theme" style="background: #8997bd;">'
	                    +'<h4 class="modal-title text-white" id="">Sinkronisasi Program RENJA</h4>'
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
	                    +'<button type="button" class="btn btn-success" id="singkron_program_modal">Sinkronisasi</button>'
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
		var sub_kegiatan = [];
		var idrkpdranwalprogram = jQuery('#mod-program-rkpd').val();
		if(idrkpdranwalprogram != ''){
			jQuery('#konfirmasi-program tbody tr input[type="checkbox"]').map(function(i, b){
				var cek = jQuery(b).is(':checked');
				if(cek){
					var kode_sbl = jQuery(b).val();
					sub_keg_renja.map(function(bb, ii){
						if(bb.kode_sbl == kode_sbl){
							sub_kegiatan.push(bb);
						}
					});
				}
			});
			if(sub_kegiatan.length >= 1){
				if(confirm('Apakah anda yakin untuk mengsingkronkan data program RENJA dari WP-SIPD?')){
					jQuery('#wrap-loading').show();
					var sub_kegiatan_filter_program = [];
					var id_sasaran = jQuery('a.btn-sm[title="Tambah Program"]').attr('href').split('/').pop();
					new Promise(function(resolve, reject){
						get_master_prog_fmis(id_sasaran)
						.then(function(master_program){
							// get program fmis dan insert jika belum ada
							relayAjax({
								url: config.fmis_url+'/perencanaan-tahunan/renja-murni/program/data/'+id_sasaran,
								success: function(program_exist){
									var cek_program = {};
									var last = sub_kegiatan.length - 1;
									var kdurut = 0;
									sub_kegiatan.reduce(function(sequence, nextData){
							            return sequence.then(function(current_data){
							        		return new Promise(function(resolve_reduce, reject_reduce){
							        			if(!cek_program[current_data.nama_program]){
							        				var check_exist = false;
							        				program_exist.data.map(function(b, i){
							        					if(current_data.nama_program == b.uraian){
							        						check_exist = true;
							        					}
							        					if(kdurut <= +b.kdurut){
							        						kdurut = +b.kdurut;
							        					}
							        				});
							        				if(!check_exist){
							        					if(master_program.program[current_data.nama_program]){
							        						cek_program[current_data.nama_program] = current_data;
								        					kdurut++;
								        					var data_post = {
								        						_token: _token,
								        						kdurut: kdurut,
								        						idrkpdranwalprogram: idrkpdranwalprogram,
								        						idprogram: master_program.program[current_data.nama_program].id,
								        						uraian: current_data.nama_program,
								        						pagu_tahun1: '0',
								        						pagu_tahun2: '0',
								        						pagu_tahun3: '0'
								        					}
								        					relayAjax({
																url: config.fmis_url+'/perencanaan-tahunan/renja-murni/program/create/'+id_sasaran,
																type: "post",
													            data: data_post,
													            success: function(res){
							        								sub_kegiatan_filter_program.push(current_data);
													            	resolve_reduce(nextData);
													            },
													            error: function(e){
													            	console.log('Error save bidang urusan!', e, this.data);
													            }
															});
								        				}else{
								        					console.log('Program "'+current_data.nama_program+'" tidak ditemukan di master program FMIS', master_program);
							        						resolve_reduce(nextData);
								        				}
							        				}else{
							        					sub_kegiatan_filter_program.push(current_data);
							        					resolve_reduce(nextData);
							        				}
							        			}else{
							        				resolve_reduce(nextData);
							        			}
							        		})
							                .catch(function(e){
							                    console.log(e);
							                    return Promise.resolve(nextData);
							                });
							            })
							            .catch(function(e){
							                console.log(e);
							                return Promise.resolve(nextData);
							            });
							        }, Promise.resolve(sub_kegiatan[last]))
							        .then(function(data_last){
							        	resolve();
							        });
							    }
							});
						});
					})
					.then(function(){
						run_script("tableProgram.ajax.reload(null, false)");
						run_script('jQuery("#mod-konfirmasi-program").modal("hide")');
						jQuery('#wrap-loading').hide();
						console.log('sub_kegiatan_filter_program', sub_kegiatan_filter_program);
					});
				}
			}else{
				alert('Pilih sub kegiatan dulu!');
			}
		}else{
			alert('Pilih program RKPD dulu!');
		}
	});
	var btn = ''
	+'<button type="button" class="btn btn-outline-success btn-sm" style="float: right;" id="singkron-program">'
        +'<i class="fa fa-cloud-upload-alt fa-fw"></i> Singkronisasi Program WP-SIPD'
    +'</button>';
    jQuery('.card-header.bg-light').prepend(btn);
    jQuery('#singkron-program').on('click', function(){
    	if(confirm('Apakah anda yakin untuk mengsingkronkan data program RENJA dari WP-SIPD?')){
			jQuery('#wrap-loading').show();
			get_id_unit_fmis()
			.then(function(id_skpd_fmis){
				var tambah_program = jQuery('a.btn-sm[title="Tambah Program"]');
				if(tambah_program.length >= 1){
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
					jQuery('#wrap-loading').hide();
					alert('Pilih sasaran RENJA dulu!');
				}
			})
			.catch(function(e){
				jQuery('#wrap-loading').hide();
				alert('Dokumen RENJA belum dibuat!');
			});
		}
    });
}

jQuery('body').on('click', '#singkron-tarif-ssh-sipd', function(){
    if(confirm('Apakah anda yakin untuk melakukan singkronisasi data tarif SSH dari WP-SIPD ke FMIS?')){
		var idkelompok = prompt('Masukan ID kelompok dari SIPD! 1=SSH, 4=SBU, 2=HSPK, 3=ASB', 1);
		jQuery("#wrap-loading").show();
		jQuery('#persen-loading').attr('persen', 0);
		jQuery('#persen-loading').html('LOADING...<br>GET STRUKTUR STANDAR HARGA DARI WP-SIPD');
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
	}
});