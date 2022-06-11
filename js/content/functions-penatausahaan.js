function get_list_spd(){
	return new Promise(function(resolve2, reject2){
		var url = config.fmis_url+'/penatausahaan/skpkd/bud/spd?draw=1&columns%5B0%5D%5Bdata%5D=action&columns%5B0%5D%5Bname%5D=action&columns%5B0%5D%5Bsearchable%5D=false&columns%5B0%5D%5Borderable%5D=false&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=DT_RowIndex&columns%5B1%5D%5Bname%5D=DT_RowIndex&columns%5B1%5D%5Bsearchable%5D=false&columns%5B1%5D%5Borderable%5D=true&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=idunit&columns%5B2%5D%5Bname%5D=idunit&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=true&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=spd_no&columns%5B3%5D%5Bname%5D=spd_no&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=true&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=spd_tgl&columns%5B4%5D%5Bname%5D=spd_tgl&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=true&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=uraian&columns%5B5%5D%5Bname%5D=uraian&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=true&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B6%5D%5Bdata%5D=status&columns%5B6%5D%5Bname%5D=status&columns%5B6%5D%5Bsearchable%5D=true&columns%5B6%5D%5Borderable%5D=true&columns%5B6%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B6%5D%5Bsearch%5D%5Bregex%5D=false&order%5B0%5D%5Bcolumn%5D=6&order%5B0%5D%5Bdir%5D=asc&start=0&length=10000&search%5Bvalue%5D=&search%5Bregex%5D=false';
		relayAjax({
			url: url,
	        success: function(res){
	        	var spd = {};
	        	res.data.map(function(b, i){
	        		spd[b.spd_no] = b;
	        	})
	        	resolve2(spd);
	        },
	        error: function(e){
	        	console.log('Error save program!', e, this.data);
	        }
		});
	});
}

function get_list_penandatangan(){
	return new Promise(function(resolve2, reject2){
		var url = config.fmis_url+'/penatausahaan/skpkd/bud/spd/pilih-data?load=penandatangan';
		relayAjax({
			url: url,
	        success: function(res){
	        	var pegawai = [];
	        	jQuery(res).find('#table-pilih-penandatangan a.btn-choose-data-penandatangan').map(function(i, b){
	        		var nip = jQuery(b).attr('data-nip');
	        		var nama = jQuery(b).attr('data-nama');
	        		var jabatan = jQuery(b).attr('data-jabatan');
	        		pegawai.push({
	        			nip: nip,
	        			nama: nama,
	        			jabatan: jabatan
	        		});
	        	});
	        	resolve2(pegawai);
	        },
	        error: function(e){
	        	console.log('Error save program!', e, this.data);
	        }
		});
	});
}

function get_list_penandatangan_master(){
	return new Promise(function(resolve2, reject2){
		var url = config.fmis_url+'/penatausahaan/parameter/penandatangan';
		relayAjax({
			url: url,
	        success: function(res){
	        	var new_data = {};
	        	res.data.map(function(b, i){
	        		var keyword = replace_string(b.nip.replace(/ /g, '')+b.nama.trim()+b.nmsubunit.trim());
	        		new_data[keyword] = b;
	        	});
	        	resolve2({
	        		'array': res.data,
	        		'object': new_data
	        	});
	        },
	        error: function(e){
	        	console.log('Error save program!', e, this.data);
	        }
		});
	});
}

function singkronisasi_spd(res){
	window.spd_simda = res.data;
	get_list_spd()
	.then(function(spd_fmis){
		run_script('program_destroy');
		var body = '';
		spd_simda.map(function(b, i){
			if(
				!spd_fmis[b.no_spd.trim()]
				&& !spd_fmis['DRAFT-'+b.no_spd.trim()]
			){
				body += ''
					+'<tr>'
						+'<td><input type="checkbox" value="'+b.no_spd.trim()+'"></td>'
						+'<td>'+b.no_spd.trim()+'</td>'
						+'<td>'+b.kd_sub_unit+' '+b.skpd.nama_skpd+'</td>'
						+'<td>'+b.uraian+'</td>'
					+'</tr>';
			}else{
				if(spd_fmis[b.no_spd.trim()]){
					var spd_fmis_selected = spd_fmis[b.no_spd.trim()];
				}else{
					var spd_fmis_selected = spd_fmis['DRAFT-'+b.no_spd.trim()];
				}
				var disabled = '';
				var status = '';
				if(spd_fmis_selected.status == 'Final'){
					var disabled = 'disabled';
					var status = ' (Status Final)';
				}
				body += ''
					+'<tr>'
						+'<td><input '+disabled+' type="checkbox" value="'+b.no_spd.trim()+'"> <b>EXISTING'+status+'</b></td>'
						+'<td>'+b.no_spd.trim()+'</td>'
						+'<td>'+b.kd_sub_unit+' '+b.skpd.nama_skpd+'</td>'
						+'<td>'+b.uraian+'</td>'
					+'</tr>';
			}
		});
		get_list_penandatangan()
		.then(function(pegawai){
			var list_pegawai = '<option value="">Pilih Penandatangan SPD</option>';
			pegawai.map(function(b, i){
				list_pegawai += '<option data-nip="'+b.nip+'" data-nama="'+b.nama+'" data-jabatan="'+b.jabatan+'">'+b.nama+' || '+b.nip+' || '+b.jabatan+'</option>';
			});
			jQuery('#singkronisasi-spd-modal').attr('verifikasi', 0);
			jQuery('#mod-penandatangan').html(list_pegawai);
			jQuery('#mod-penandatangan').parent().show();
			jQuery('#konfirmasi-program tbody').html(body);
			run_script('custom_dt_program');
			hide_loading();
		});
	});
}

function singkronisasi_tagihan(res){
	window.spd_simda = res.data;
	get_list_tagihan()
	.then(function(spd_fmis){
		run_script('program_destroy');
		var body = '';
		spd_simda.map(function(b, i){
			if(
				!spd_fmis[b.no_spd.trim()]
				&& !spd_fmis['DRAFT-'+b.no_spd.trim()]
			){
				body += ''
					+'<tr>'
						+'<td><input type="checkbox" value="'+b.no_spd.trim()+'"></td>'
						+'<td>'+b.no_spd.trim()+'</td>'
						+'<td>'+b.kd_sub_unit+' '+b.skpd.nama_skpd+'</td>'
						+'<td>'+b.uraian+'</td>'
					+'</tr>';
			}else{
				if(spd_fmis[b.no_spd.trim()]){
					var spd_fmis_selected = spd_fmis[b.no_spd.trim()];
				}else{
					var spd_fmis_selected = spd_fmis['DRAFT-'+b.no_spd.trim()];
				}
				var disabled = '';
				var status = '';
				if(spd_fmis_selected.status == 'Final'){
					var disabled = 'disabled';
					var status = ' (Status Final)';
				}
				body += ''
					+'<tr>'
						+'<td><input '+disabled+' type="checkbox" value="'+b.no_spd.trim()+'"> <b>EXISTING'+status+'</b></td>'
						+'<td>'+b.no_spd.trim()+'</td>'
						+'<td>'+b.kd_sub_unit+' '+b.skpd.nama_skpd+'</td>'
						+'<td>'+b.uraian+'</td>'
					+'</tr>';
			}
		});
		get_list_penandatangan()
		.then(function(pegawai){
			var list_pegawai = '<option value="">Pilih Penandatangan SPD</option>';
			pegawai.map(function(b, i){
				list_pegawai += '<option data-nip="'+b.nip+'" data-nama="'+b.nama+'" data-jabatan="'+b.jabatan+'">'+b.nama+' || '+b.nip+' || '+b.jabatan+'</option>';
			});
			jQuery('#singkronisasi-spd-modal').attr('verifikasi', 0);
			jQuery('#mod-penandatangan').html(list_pegawai);
			jQuery('#mod-penandatangan').parent().show();
			jQuery('#konfirmasi-program tbody').html(body);
			run_script('custom_dt_program');
			hide_loading();
		});
	});
}

function verifikasi_spd(){
	get_list_spd()
	.then(function(spd_fmis){
		run_script('program_destroy');
		var spd_fmis_array = [];
		for(var i in spd_fmis){
			spd_fmis_array.push(spd_fmis[i]);
		}
		window.spd_fmis_global = spd_fmis_array;
		var body = '';
		spd_fmis_array.map(function(b, i){
			var disabled = '';
			var status = '';
			if(b.status == 'Final'){
				var disabled = 'disabled';
				var status = ' (Status Final)';
			}
			body += ''
				+'<tr>'
					+'<td><input '+disabled+' type="checkbox" value="'+b.spd_no+'"> <b>EXISTING'+status+'</b></td>'
					+'<td>'+b.spd_no+'</td>'
					+'<td>'+b.spd_tgl+' '+b.get_ref_unit.nmunit+'</td>'
					+'<td>'+b.uraian+'</td>'
				+'</tr>';
		});
		jQuery('#singkronisasi-spd-modal').attr('verifikasi', 1);
		jQuery('#mod-penandatangan').parent().hide();
		jQuery('#konfirmasi-program tbody').html(body);
		run_script('custom_dt_program');
		hide_loading();
	});
}

function verifikasi_spd_modal(){
	var spd_fmis_selected = [];
	jQuery('#konfirmasi-program tbody tr input[type="checkbox"]').map(function(i, b){
		var cek = jQuery(b).is(':checked');
		if(cek){
			var no_spd = jQuery(b).val();
			spd_fmis_global.map(function(bb, ii){
				if(bb.spd_no == no_spd){
					spd_fmis_selected.push(bb);
				}
			});
		}
	});
	if(spd_fmis_selected.length >= 1){
		if(confirm('Apakah anda yakin untuk mengsingkronkan data SPD?')){
			show_loading();
			var last = spd_fmis_selected.length - 1;
			spd_fmis_selected.reduce(function(sequence, nextData){
	            return sequence.then(function(spd_fmis){
	        		return new Promise(function(resolve_reduce, reject_reduce){
						if(spd_fmis.action.indexOf('Finalkan SPD') != -1){
							var url_final = spd_fmis.action.split('href="')[3].split('"')[0];
							pesan_loading('Finalkan SPD no='+spd_fmis.spd_no+' uraian='+spd_fmis.uraian, true);
	        				var data_post = {
	        					_token: _token
	        				};
	        				relayAjax({
								url: url_final,
								type: 'post',
								data: data_post,
						        success: function(res){
						        	resolve_reduce(nextData);
						        }
						    });
						}else{
							pesan_loading('Status sudah final! SPD no='+spd_fmis.spd_no+' uraian='+spd_fmis.uraian, true);
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
	        }, Promise.resolve(spd_fmis_selected[last]))
	        .then(function(data_last){
		    	run_script('reload_spd');
		    	alert('Sukses finalkan SPD!');
		    	run_script('program_hide');
		    	hide_loading();
			});
		}
	}else{
		alert('SPD FMIS belum ada yang dipilih!');
	}
}

function singkronisasi_spd_modal(){
	var spd_simda_selected = [];
	var penandatangan = jQuery('#mod-penandatangan option:selected').val();
	if(penandatangan != ''){
		var selected = jQuery('#mod-penandatangan option:selected');
		penandatangan = {
			nip: selected.attr('data-nip'),
			nama: selected.attr('data-nama'),
			jabatan: selected.attr('data-jabatan')
		}
		jQuery('#konfirmasi-program tbody tr input[type="checkbox"]').map(function(i, b){
			var cek = jQuery(b).is(':checked');
			if(cek){
				var no_spd = jQuery(b).val();
				spd_simda.map(function(bb, ii){
					if(bb.no_spd == no_spd){
						spd_simda_selected.push(bb);
					}
				});
			}
		});
		if(spd_simda_selected.length >= 1){
			if(confirm('Apakah anda yakin untuk mengsingkronkan data SPD?')){
				show_loading();
				console.log('spd_simda_selected', spd_simda_selected, penandatangan);
				// insert no SPD
				new Promise(function(resolve, reject){
					get_list_spd()
					.then(function(spd_fmis){
						var last = spd_simda_selected.length - 1;
						spd_simda_selected.reduce(function(sequence, nextData){
				            return sequence.then(function(spd){
				        		return new Promise(function(resolve_reduce, reject_reduce){
				        			if(
										!spd_fmis[spd.no_spd.trim()]
										&& !spd_fmis['DRAFT-'+spd.no_spd.trim()]
									){
				        				var idunit = spd.skpd.id_mapping_fmis.split('.')[0];
				        				var uraian = 'uraian kosong';
				        				if(spd.uraian){
				        					uraian = spd.uraian.trim();
				        				}
				        				var data_post = {
				        					_token: _token,
											idunit: idunit,
											spd_no: spd.no_spd.trim(),
											spd_tgl: spd.tgl_spd.split(' ')[0],
											uraian: uraian,
											penandatangan_nm: penandatangan.nama,
											penandatangan_nip: penandatangan.nip,
											penandatangan_jbt: penandatangan.jabatan
				        				}
				        				pesan_loading('Insert SPD no='+spd.no_spd+' uraian='+data_post.uraian, true);
				        				relayAjax({
											url: config.fmis_url+'/penatausahaan/skpkd/bud/spd/create',
											type: 'post',
											data: data_post,
									        success: function(res){
									        	resolve_reduce(nextData);
									        }
									    });
				        			}else{
				        				if(spd_fmis[spd.no_spd.trim()]){
											var spd_fmis_selected = spd_fmis[spd.no_spd.trim()];
										}else{
											var spd_fmis_selected = spd_fmis['DRAFT-'+spd.no_spd.trim()];
										}
										var id_spd_fmis = spd_fmis_selected.action.split('href="').pop().split('"')[0].split('/').pop();
				        				var idunit = spd.skpd.id_mapping_fmis.split('.')[0];
				        				var tgl_spd = new Date().toISOString().split('T')[0];
				        				var uraian = 'uraian kosong';
				        				if(spd.uraian){
				        					uraian = spd.uraian.trim();
				        				}
				        				var data_post = {
				        					_token: _token,
											idunit: idunit,
											spd_no: spd.no_spd.trim(),
											spd_tgl: tgl_spd,
											uraian: uraian,
											penandatangan_nm: penandatangan.nama,
											penandatangan_nip: penandatangan.nip,
											penandatangan_jbt: penandatangan.jabatan
				        				}
				        				pesan_loading('Update SPD tgl_spd='+tgl_spd+' no='+spd.no_spd+' uraian='+data_post.uraian, true);
				        				relayAjax({
											url: config.fmis_url+'/penatausahaan/skpkd/bud/spd/update/'+id_spd_fmis,
											type: 'post',
											data: data_post,
									        success: function(res){
									        	resolve_reduce(nextData);
									        }
									    });
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
				        }, Promise.resolve(spd_simda_selected[last]))
				        .then(function(data_last){
			    			resolve();
			    		});
				    });
			    })
			    // insert rincian SPD
			    .then(function(){
			    	return new Promise(function(resolve, reject){
			    		getUnitFmis().then(function(unit_fmis){
				    		get_list_spd()
							.then(function(spd_fmis){
								var last = spd_simda_selected.length - 1;
								spd_simda_selected.reduce(function(sequence, nextData){
						            return sequence.then(function(spd){
						            	return new Promise(function(resolve_reduce, reject_reduce){
						        			if(
												spd_fmis[spd.no_spd.trim()]
												|| spd_fmis['DRAFT-'+spd.no_spd.trim()]
											){
												spd.id_sub_unit = spd.skpd.id_mapping_fmis.split('.').pop();
												spd.nama_sub_unit = false;
												for(var unit_f in unit_fmis){
													for(var sub_unit_f in unit_fmis[unit_f].sub_unit){
														if(spd.id_sub_unit == unit_fmis[unit_f].sub_unit[sub_unit_f].id){
															spd.nama_sub_unit = sub_unit_f;
														}
													}
												}
												if(spd.nama_sub_unit){
													if(spd_fmis[spd.no_spd.trim()]){
														var spd_fmis_selected = spd_fmis[spd.no_spd.trim()];
													}else{
														var spd_fmis_selected = spd_fmis['DRAFT-'+spd.no_spd.trim()];
													}
													spd.spd_fmis = spd_fmis_selected;
							            			get_spd_rinci_fmis(spd.spd_fmis)
							            			.then(function(spd_fmis_rinci){
							            				spd.spd_fmis_rinci = spd_fmis_rinci;
								            			get_spd_rinci_simda(spd)
								            			.then(function(spd_simda_rinci){
								            				spd.spd_simda_rinci = spd_simda_rinci;
								            				cek_insert_spd_rinci(spd)
								            				.then(function(){
								            					resolve_reduce(nextData);
								            				})
								            			});
							            			});
							            		}else{
							            			show_loading('Sub Unit tidak ditemukan untuk SPD SIMDA dengan no='+spd.no_spd+'uraian='+spd.uraian, true);
							            			resolve_reduce(nextData);
							            		}
							            	}else{
							            		show_loading('SPD SIMDA dengan no='+spd.no_spd+'uraian='+spd.uraian+' tidak ditemukan di FMIS!', true);
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
						        }, Promise.resolve(spd_simda_selected[last]))
						        .then(function(data_last){
					    			resolve();
					    		});
					    	});
					    });
			    	});
			    })
			    .then(function(){
			    	return new Promise(function(resolve, reject){
			    		get_list_spd()
						.then(function(spd_fmis){
							var last = spd_simda_selected.length - 1;
							spd_simda_selected.reduce(function(sequence, nextData){
					            return sequence.then(function(spd){
					        		return new Promise(function(resolve_reduce, reject_reduce){
					        			if(
											spd_fmis[spd.no_spd.trim()]
											|| spd_fmis['DRAFT-'+spd.no_spd.trim()]
										){
											if(spd_fmis[spd.no_spd.trim()]){
												var spd_fmis_selected = spd_fmis[spd.no_spd.trim()];
											}else{
												var spd_fmis_selected = spd_fmis['DRAFT-'+spd.no_spd.trim()];
											}
											var id_spd_fmis = spd_fmis_selected.action.split('href="').pop().split('"')[0].split('/').pop();
					        				var idunit = spd.skpd.id_mapping_fmis.split('.')[0];
					        				var uraian = 'uraian kosong';
					        				if(spd.uraian){
					        					uraian = spd.uraian.trim();
					        				}
					        				var data_post = {
					        					_token: _token,
												idunit: idunit,
												spd_no: spd.no_spd.trim(),
												spd_tgl: spd.tgl_spd.split(' ')[0],
												uraian: uraian,
												penandatangan_nm: penandatangan.nama,
												penandatangan_nip: penandatangan.nip,
												penandatangan_jbt: penandatangan.jabatan
					        				}
					        				pesan_loading('Update SPD tgl_spd='+data_post.spd_tgl+' no='+spd.no_spd+' uraian='+data_post.uraian, true);
					        				relayAjax({
												url: config.fmis_url+'/penatausahaan/skpkd/bud/spd/update/'+id_spd_fmis,
												type: 'post',
												data: data_post,
										        success: function(res){
										        	resolve_reduce(nextData);
										        }
										    });
					        			}else{
					        				pesan_loading('Tidak ditemukan! SPD no='+spd.no_spd+' uraian='+spd.uraian, true);
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
					        }, Promise.resolve(spd_simda_selected[last]))
					        .then(function(data_last){
				    			resolve();
				    		});
					    });
			    	});
			    })
			    .then(function(){
			    	run_script('reload_spd');
			    	alert('Sukses singkronisasi SPD!');
			    	run_script('program_hide');
			    	hide_loading();
			    });
			}
		}else{
			alert('SPD SIMDA belum ada yang dipilih!');
		}
	}else{
		alert('Penandatangan SPD belum dipilih!');
	}
}

function singkronisasi_spd_lokal(spd){
	show_loading();
	get_list_spd()
	.then(function(spd_fmis){
		var spd_fmis_array = [];
		for(var i in spd_fmis){
			spd_fmis_array.push(spd_fmis[i]);
		}
		var last = spd_fmis_array.length - 1;
		spd_fmis_array.reduce(function(sequence, nextData){
            return sequence.then(function(spd_fmis){
        		return new Promise(function(resolve_reduce, reject_reduce){
					get_spd_rinci_fmis(spd_fmis)
					.then(function(spd_fmis_rinci){
						spd_fmis_rinci.map(function(b, i){
							spd_fmis_rinci[i].action = '';
						});
						spd_fmis.action = '';
						spd_fmis.spd_fmis_rinci = spd_fmis_rinci;
						var data = {
						    message:{
						        type: "get-url",
						        content: {
								    url: config.url_server_lokal,
								    type: 'post',
								    data: { 
										action: 'singkroniasi_spd_fmis',
										tahun_anggaran: config.tahun_anggaran,
										data: spd_fmis,
										api_key: config.api_key
									},
					    			return: false
								}
						    }
						};
						chrome.runtime.sendMessage(data, function(response) {
						    console.log('responeMessage', response);
						    resolve_reduce(nextData);
						});
					});
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
        }, Promise.resolve(spd_fmis_array[last]))
        .then(function(data_last){
			alert('Berhasil backup SPD ke DB WP-SIPD!');
			hide_loading();
		});
	});
}

function load_spd_sub_keg(id_spd_fmis){
	pesan_loading('Load all sub kegiatan dari id_spd_fmis='+id_spd_fmis, true);
	return new Promise(function(resolve, reject){
		relayAjax({
			url: config.fmis_url+'/penatausahaan/skpkd/bud/spd/rencana/pilih-data/'+id_spd_fmis+'?load=subkegiatan',
	        success: function(res){
	        	resolve(res);
	        }
	    });
	});
}

function load_spp_sub_keg(id_spp_fmis){
	pesan_loading('Load all sub kegiatan dari id_spp_fmis='+id_spp_fmis, true);
	return new Promise(function(resolve, reject){
		if(tipe_spp_global == 'up'){
			return resolve();
		}
		relayAjax({
			url: config.fmis_url+'/penatausahaan/skpd/bend-pengeluaran/spp/up/pilih-data/'+id_spp_fmis+'?load=subkegiatan',
	        success: function(res){
	        	resolve(res);
	        }
	    });
	});
}

function cek_insert_spd_rinci(spd){
	return new Promise(function(resolve, reject){
		var id_spd_fmis = spd.spd_fmis.action.split('href="').pop().split('"')[0].split('/bud/spd/rencana/')[1];
		load_spd_sub_keg(id_spd_fmis)
		.then(function(res_sub){
			var last = spd.spd_simda_rinci.length - 1;
	        var kdurut = 0;
	        var spd_unik = {};
	        spd.spd_fmis_rinci.map(function(b, i){
    			var kode_akun = b.rekening.split(' ').shift();
    			var nama_unik = kode_akun+replace_string(b.subkegiatan)+b.idsubunit;
    			if(!spd_unik[nama_unik]){
    				spd_unik[nama_unik] = {
						jml_sipd: 0,
						jml_fmis: 1
					};
    			}else{
    				spd_unik[nama_unik].jml_fmis++;
    			}
        	});
	        spd.spd_simda_rinci.map(function(b, i){
    			var kode_akun = b.detail.kode_akun;
    			var nama_unik = kode_akun+replace_string(b.detail.nama_sub_giat)+spd.id_sub_unit;
    			if(!spd_unik[nama_unik]){
    				spd_unik[nama_unik] = {
						jml_sipd: 1,
						jml_fmis: 0
					};
    			}else{
    				spd_unik[nama_unik].jml_sipd++;
    			}
        	});

	        console.log('spd_unik', spd_unik);
			var cek_double = {sipd: {}, fmis: {}};
	        spd.spd_simda_rinci.reduce(function(sequence, nextData){
	            return sequence.then(function(spd_rinci){
	            	return new Promise(function(resolve_reduce, reject_reduce){
	            		var nama_simda_unik = spd_rinci.detail.kode_akun+replace_string(spd_rinci.detail.nama_sub_giat)+spd.id_sub_unit;
	            		if(!cek_double.sipd[nama_simda_unik]){
							cek_double.sipd[nama_simda_unik] = [];
						}
						cek_double.sipd[nama_simda_unik].push(spd_rinci.detail);
						cek_double.fmis = {};

	            		var cek_exist = false;
    					var need_update = false;
	            		spd.spd_fmis_rinci.map(function(b, i){
	            			var kode_akun = b.rekening.split(' ').shift();
	            			var nama_fmis_unik = kode_akun+replace_string(b.subkegiatan)+b.idsubunit;
	            			if(!cek_double.fmis[nama_fmis_unik]){
								cek_double.fmis[nama_fmis_unik] = [];
							}
							cek_double.fmis[nama_fmis_unik].push(b);
							// cek jika nama unik sudah terinsert atau belum
		            		if(nama_simda_unik == nama_fmis_unik){
		            			// cek jika jumlah rincian unik fmis sudah sama dengan jumlah rincian sipd
		            			if(spd_unik[nama_fmis_unik].jml_fmis >= spd_unik[nama_fmis_unik].jml_sipd){
		            				cek_exist = b;
		            				if(
										(
											+b.nilai != +spd_rinci.nilai
											|| b.kdurut != spd_rinci.no_id 
										)
										&& cek_double.sipd[nama_fmis_unik].length == cek_double.fmis[nama_fmis_unik].length
									){
		            					console.log('URAIAN BELANJA UNIK: ('+(+b.nilai)+' != '+(+spd_rinci.nilai)+' || '+b.kdurut+' != '+spd_rinci.no_id+') && '+cek_double.sipd[nama_fmis_unik].length+' == '+cek_double.fmis[nama_fmis_unik].length, nama_fmis_unik, spd_rinci, b);
										need_update = b;
		            				}
		            			}else{
		            				rka_unik[nama_fmis_unik].jml_fmis++;
		            			}
		            		}

		            		if(kdurut <= +b.kdurut){
								kdurut = +b.kdurut;
							}
		            	});
		            	if(!cek_exist){
		            		new Promise(function(resolve2, reject2){
								var keyword_simda = spd_rinci.detail.nama_program+'|'+spd_rinci.detail.nama_giat+'|'+spd_rinci.detail.nama_sub_giat;
		            			pesan_loading('Get ID sub kegiatan FMIS dari nomenklatur '+keyword_simda, true);
					        	var id_sub_kegiatan = false;
					        	jQuery(res_sub).find('#table-subkegiatan a.next-tab-rekening').map(function(i, b){
					        		var tr = jQuery(b).closest('tr');
					        		var keyword_fmis = tr.find('td').eq(1).html().replace(' <br> ', '|').replace(' </br> ', '|')+'|'+tr.find('td').eq(2).text();
					        		if(replace_string(keyword_fmis) == replace_string(keyword_simda)){
					        			id_sub_kegiatan = jQuery(b).attr('data-idsubkegiatan');
					        		}
					        	});
					        	if(id_sub_kegiatan){
					        		resolve2(id_sub_kegiatan);
					        	}else{
					        		reject2('ID sub kegiatan FMIS dari nomenklatur '+keyword_simda+' tidak ditemukan!');
					        	}
		            		})
		            		// get aktivitas
		            		.then(function(id_sub_kegiatan){
		            			pesan_loading('Get All aktivitas FMIS dari id '+id_sub_kegiatan, true);
		            			return new Promise(function(resolve2, reject2){
			            			relayAjax({
										url: config.fmis_url+'/penatausahaan/skpkd/bud/spd/rencana/pilih-data/'+id_spd_fmis+'?load=aktivitas&idsubkegiatan='+id_sub_kegiatan,
								        success: function(res){
								        	var id_aktivitas = [];
								        	jQuery(res).find('#table-aktivitas a.next-tab-rekening').map(function(i, b){
								        		var tr = jQuery(b).closest('tr');
								        		var nama_aktivitas = tr.find('td').eq(1).text();
								        		var nama_unit = nama_aktivitas.split(' | ').pop();
								        		if(nama_unit == spd.nama_sub_unit){
									        		id_aktivitas.push({
									        			id_sub_kegiatan: id_sub_kegiatan,
									        			id: jQuery(b).attr('data-idrefaktivitas'),
									        			nama: nama_aktivitas,
									        			total: tr.find('td').eq(2).text()
									        		});
									        	}
								        	});
								        	resolve2(id_aktivitas);
								        }
								    })
			            		});
		            		})
		            		// cek rekening
		            		.then(function(id_aktivitas){
		            			return new Promise(function(resolve2, reject2){
		            				if(id_aktivitas.length == 1){
		            					resolve2(id_aktivitas[0]);
			            			}else{
		            					var url_rek = config.fmis_url+'/penatausahaan/skpkd/bud/spd/rencana/pilih-data/'+id_spd_fmis+'?load=rekening&idrefaktivitas='+id_aktivitas[0].id+'&idsubkegiatan='+id_aktivitas[0].id_sub_kegiatan;
			            				reject2('Ada lebih dari 1 aktivitas pada sub kegiatan ini. Perlu input manual SPD sesuai aktivitas yang dipilih! '+JSON.stringify(id_aktivitas));
			            			}
		            			})
		            		})
		            		// insert rincian SPD
		            		.then(function(id_aktivitas){
		            			pesan_loading('Insert SPD rinci rek='+spd_rinci.detail.kode_akun+', total='+spd_rinci.nilai+', no SPD='+spd.no_spd, true);
		            			return new Promise(function(resolve2, reject2){
		            				kdurut++;
									var data_post = {
										_token: _token,
										kdurut: spd_rinci.no_id,
										idrefaktivitas: id_aktivitas.id,
										idsubunit: spd.id_sub_unit,
										kdrek1: spd_rinci.kd_rek90_1,
										kdrek2: spd_rinci.kd_rek90_2,
										kdrek3: spd_rinci.kd_rek90_3,
										kdrek4: spd_rinci.kd_rek90_4,
										kdrek5: spd_rinci.kd_rek90_5,
										kdrek6: spd_rinci.kd_rek90_6,
										aktivitas_uraian: id_aktivitas.nama,
										nilai: formatMoney(spd_rinci.nilai, 2, ',', '.')
									}
		            				relayAjax({
										url: config.fmis_url+'/penatausahaan/skpkd/bud/spd/rencana/create/'+id_spd_fmis,
										type: 'post',
										data: data_post,
								        success: function(res){
								        	resolve_reduce(nextData);
								        }
								    });
			            		});
		            		})
		            		.catch(function(message){
		            			pesan_loading(message, true);
		            			resolve_reduce(nextData);
		            		});
		            	}else if(need_update){
	            			return new Promise(function(resolve2, reject2){
	            				var url_form = need_update.action.split('href="');
	            				if(url_form.length >= 3){
	            					pesan_loading('Update SPD rinci rek='+spd_rinci.detail.kode_akun+', total='+spd_rinci.nilai+', no SPD='+spd.no_spd, true);
		            				relayAjax({
										url: url_form[1].split('"')[0],
								        success: function(res){
								        	var url_update = jQuery(res).find('form').attr('action');
											var data_post = {
												_token: _token,
												kdurut: spd_rinci.no_id,
												idrefaktivitas: need_update.idrefaktivitas,
												idsubunit: need_update.idsubunit,
												kdrek1: need_update.kdrek1,
												kdrek2: need_update.kdrek2,
												kdrek3: need_update.kdrek3,
												kdrek4: need_update.kdrek4,
												kdrek5: need_update.kdrek5,
												kdrek6: need_update.kdrek6,
												aktivitas_uraian: need_update.aktivitas,
												nilai: formatMoney(spd_rinci.nilai, 2, ',', '.')
											}
				            				relayAjax({
												url: url_update,
												type: 'post',
												data: data_post,
										        success: function(res){
										        	resolve_reduce(nextData);
										        }
										    });
				            			}
								    });
	            				}else{
	            					pesan_loading('Tombol edit tidak ada! SPD rinci rek='+cek_exist.rekening+', total='+cek_exist.nilai+', no SPD='+spd.no_spd, true);
		            				resolve_reduce(nextData);
	            				}
		            		});
		            	}else{
		            		pesan_loading('Sudah ada! SPD rinci rek='+cek_exist.rekening+', total='+cek_exist.nilai+', no SPD='+spd.no_spd, true);
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
	        }, Promise.resolve(spd.spd_simda_rinci[last]))
	        .then(function(data_last){
	        	var spd_unik_fmis = {};
	        	spd.spd_fmis_rinci.map(function(b, i){
        			var kode_akun = b.rekening.split(' ').shift();
        			var nama_fmis_unik = kode_akun+replace_string(b.subkegiatan)+b.idsubunit;
					if(!spd_unik_fmis[nama_fmis_unik]){
						spd_unik_fmis[nama_fmis_unik] = [];
					}
					spd_unik_fmis[nama_fmis_unik].push(b);
				});
	        	var kosongkan_rincian = [];
	        	for(var nama_rincian_unik in spd_unik){
	        		var selisih = spd_unik[nama_rincian_unik].jml_fmis - spd_unik[nama_rincian_unik].jml_sipd;
	        		// cek jika ada rincian yang ada di fmis dan tidak ada di sipd. bisa karena diinput manual atau karena rincian di sipd dihapus. rincian ini perlu di nolkan agar pagu sub kegiatannya sama dengan sipd
	        		if(selisih >= 1){
	        			spd_unik_fmis[nama_rincian_unik].map(function(b, i){
							if(i < selisih){
								if(to_number(b.nilai) > 0){
									kosongkan_rincian.push(b);
								}
								spd_unik[nama_rincian_unik].jml_sipd++;
							}
						});
	        		}
	        	}
	        	console.log('kosongkan_rincian', kosongkan_rincian);
	        	var last = kosongkan_rincian.length - 1;
	        	kosongkan_rincian.reduce(function(sequence2, nextData2){
		            return sequence2.then(function(need_update){
		        		return new Promise(function(resolve_reduce2, reject_reduce2){
		        			var url_form = need_update.action.split('href="');
		        			if(url_form.length >= 3){
			        			pesan_loading('Kosongkan SPD rinci rek='+need_update.rekening+', total=0, no SPD='+spd.no_spd, true);
	            				relayAjax({
									url: url_form[1].split('"')[0],
							        success: function(res){
							        	var url_update = jQuery(res).find('form').attr('action');
										var data_post = {
											_token: _token,
											kdurut: spd_rinci.no_id,
											idrefaktivitas: need_update.idrefaktivitas,
											idsubunit: need_update.idsubunit,
											kdrek1: need_update.kdrek1,
											kdrek2: need_update.kdrek2,
											kdrek3: need_update.kdrek3,
											kdrek4: need_update.kdrek4,
											kdrek5: need_update.kdrek5,
											kdrek6: need_update.kdrek6,
											aktivitas_uraian: need_update.aktivitas,
											nilai: formatMoney(0, 2, ',', '.')
										}
			            				relayAjax({
											url: url_update,
											type: 'post',
											data: data_post,
									        success: function(res){
									        	resolve_reduce2(nextData2);
									        }
									    });
			            			}
							    });
	            			}else{
            					pesan_loading('Tombol edit tidak ada! SPD rinci rek='+need_update.rekening+', total='+need_update.nilai+', no SPD='+spd.no_spd, true);
								resolve_reduce2(nextData2);
	            			}
		        		})
		                .catch(function(e){
		                    console.log(e);
		                    return Promise.resolve(nextData2);
		                });
		            })
		            .catch(function(e){
		                console.log(e);
		                return Promise.resolve(nextData2);
		            });
		        }, Promise.resolve(kosongkan_rincian[last]))
		        .then(function(data_last){
    				resolve();
	        	});
    		});
	    });
	});
}

function cek_insert_spp_rinci(spp){
	return new Promise(function(resolve, reject){
		var id_spp_fmis = spp.spp_fmis.action.split('href="').pop().split('"')[0].split('/').pop();
		load_spp_sub_keg(id_spp_fmis)
		.then(function(res_sub){
			var last = spp.spp_simda_rinci.length - 1;
	        var kdurut = 0;
	        var spp_unik = {};
	        spp.spp_fmis_rinci.map(function(b, i){
    			var kode_akun = b.rekening.split(' ').shift();
    			var nama_unik = kode_akun+replace_string(b.subkegiatan);
    			if(!spp_unik[nama_unik]){
    				spp_unik[nama_unik] = {
						jml_sipd: 0,
						jml_fmis: 1
					};
    			}else{
    				spp_unik[nama_unik].jml_fmis++;
    			}
        	});
	        spp.spp_simda_rinci.map(function(b, i){
    			var kode_akun = b.detail.kode_akun;
    			var nama_unik = kode_akun+replace_string(b.detail.nama_sub_giat);
    			if(!spp_unik[nama_unik]){
    				spp_unik[nama_unik] = {
						jml_sipd: 1,
						jml_fmis: 0
					};
    			}else{
    				spp_unik[nama_unik].jml_sipd++;
    			}
        	});

	        console.log('spp_unik', spp_unik);
			var cek_double = {sipd: {}, fmis: {}};
	        spp.spp_simda_rinci.reduce(function(sequence, nextData){
	            return sequence.then(function(spp_rinci){
	            	return new Promise(function(resolve_reduce, reject_reduce){
	            		var nama_simda_unik = spp_rinci.detail.kode_akun+replace_string(spp_rinci.detail.nama_sub_giat);
	            		if(!cek_double.sipd[nama_simda_unik]){
							cek_double.sipd[nama_simda_unik] = [];
						}
						cek_double.sipd[nama_simda_unik].push(spp_rinci.detail);
						cek_double.fmis = {};

	            		var cek_exist = false;
    					var need_update = false;
	            		spp.spp_fmis_rinci.map(function(b, i){
	            			var kode_akun = b.rekening.split(' ').shift();
	            			var nama_fmis_unik = kode_akun+replace_string(b.subkegiatan);
	            			if(!cek_double.fmis[nama_fmis_unik]){
								cek_double.fmis[nama_fmis_unik] = [];
							}
							cek_double.fmis[nama_fmis_unik].push(b);
							// cek jika nama unik sudah terinsert atau belum
		            		if(nama_simda_unik == nama_fmis_unik){
		            			// cek jika jumlah rincian unik fmis sudah sama dengan jumlah rincian sipd
		            			if(spp_unik[nama_fmis_unik].jml_fmis >= spp_unik[nama_fmis_unik].jml_sipd){
		            				cek_exist = b;
		            				if(
										(
											+b.nilai != +spp_rinci.nilai
											|| b.kdurut != spp_rinci.no_id 
										)
										&& cek_double.sipd[nama_fmis_unik].length == cek_double.fmis[nama_fmis_unik].length
									){
		            					console.log('URAIAN BELANJA UNIK: ('+(+b.nilai)+' != '+(+spp_rinci.nilai)+' || '+b.kdurut+' != '+spp_rinci.no_id+') && '+cek_double.sipd[nama_fmis_unik].length+' == '+cek_double.fmis[nama_fmis_unik].length, nama_fmis_unik, spp_rinci, b);
										need_update = b;
		            				}
		            			}else{
		            				rka_unik[nama_fmis_unik].jml_fmis++;
		            			}
		            		}

		            		if(kdurut <= +b.kdurut){
								kdurut = +b.kdurut;
							}
		            	});
		            	if(!cek_exist){
		            		new Promise(function(resolve2, reject2){
		            			if(tipe_spp_global == 'up'){
		            				return resolve2();
		            			}
								var keyword_simda = spp_rinci.detail.nama_program+'|'+spp_rinci.detail.nama_giat+'|'+spp_rinci.detail.nama_sub_giat;
		            			pesan_loading('Get ID sub kegiatan FMIS dari nomenklatur '+keyword_simda, true);
					        	var id_sub_kegiatan = false;
					        	jQuery(res_sub).find('#table-subkegiatan a.next-tab-rekening').map(function(i, b){
					        		var tr = jQuery(b).closest('tr');
					        		var keyword_fmis = tr.find('td').eq(1).html().replace(' <br> ', '|').replace(' </br> ', '|')+'|'+tr.find('td').eq(2).text();
					        		if(replace_string(keyword_fmis) == replace_string(keyword_simda)){
					        			id_sub_kegiatan = jQuery(b).attr('data-idsubkegiatan');
					        		}
					        	});
					        	if(id_sub_kegiatan){
					        		resolve2(id_sub_kegiatan);
					        	}else{
					        		reject2('ID sub kegiatan FMIS dari nomenklatur '+keyword_simda+' tidak ditemukan!');
					        	}
		            		})
		            		// get aktivitas
		            		.then(function(id_sub_kegiatan){
		            			return new Promise(function(resolve2, reject2){
			            			if(tipe_spp_global == 'up'){
			            				return resolve2();
			            			}
		            				pesan_loading('Get All aktivitas FMIS dari id '+id_sub_kegiatan, true);
			            			relayAjax({
										url: config.fmis_url+'/penatausahaan/skpkd/bud/spp/rencana/pilih-data/'+id_spp_fmis+'?load=aktivitas&idsubkegiatan='+id_sub_kegiatan,
								        success: function(res){
								        	var id_aktivitas = [];
								        	jQuery(res).find('#table-aktivitas a.next-tab-rekening').map(function(i, b){
								        		var tr = jQuery(b).closest('tr');
								        		var nama_aktivitas = tr.find('td').eq(1).text();
								        		var nama_unit = nama_aktivitas.split(' | ').pop();
								        		if(nama_unit == spp.nama_sub_unit){
									        		id_aktivitas.push({
									        			id_sub_kegiatan: id_sub_kegiatan,
									        			id: jQuery(b).attr('data-idrefaktivitas'),
									        			nama: nama_aktivitas,
									        			total: tr.find('td').eq(2).text()
									        		});
									        	}
								        	});
								        	resolve2(id_aktivitas);
								        }
								    })
			            		});
		            		})
		            		// cek rekening
		            		.then(function(id_aktivitas){
		            			return new Promise(function(resolve2, reject2){
		            				if(tipe_spp_global == 'up'){
		            					return resolve2();
		            				}
		            				if(id_aktivitas.length == 1){
		            					resolve2(id_aktivitas[0]);
			            			}else{
		            					var url_rek = config.fmis_url+'/penatausahaan/skpkd/bud/spp/rencana/pilih-data/'+id_spp_fmis+'?load=rekening&idrefaktivitas='+id_aktivitas[0].id+'&idsubkegiatan='+id_aktivitas[0].id_sub_kegiatan;
			            				reject2('Ada lebih dari 1 aktivitas pada sub kegiatan ini. Perlu input manual spp sesuai aktivitas yang dipilih! '+JSON.stringify(id_aktivitas));
			            			}
		            			})
		            		})
		            		// insert rincian spp
		            		.then(function(id_aktivitas){
		            			pesan_loading('Insert SPP rinci rek='+spp_rinci.detail.kode_akun+', total='+spp_rinci.nilai+', no spp='+spp.no_spp, true);
		            			return new Promise(function(resolve2, reject2){
		            				kdurut++;
									var data_post = {
										_token: _token,
										kdurut: spp_rinci.no_id,
										idrefaktivitas: '',
										idsubunit: '',
										kdrek1: spp_rinci.kd_rek90_1,
										kdrek2: spp_rinci.kd_rek90_2,
										kdrek3: spp_rinci.kd_rek90_3,
										kdrek4: spp_rinci.kd_rek90_4,
										kdrek5: spp_rinci.kd_rek90_5,
										kdrek6: spp_rinci.kd_rek90_6,
										nilai: formatMoney(spp_rinci.nilai, 2, ',', '.')
									}
									if(tipe_spp_global != 'up'){
										data_post.aktivitas_uraian = id_aktivitas.nama;
										data_post.idsubunit = spp.id_sub_unit;
										data_post.idrefaktivitas = id_aktivitas.id;
									}
		            				relayAjax({
										url: config.fmis_url+'/penatausahaan/skpd/bend-pengeluaran/spp/up/rincian/create/'+id_spp_fmis,
										type: 'post',
										data: data_post,
								        success: function(res){
								        	resolve_reduce(nextData);
								        }
								    });
			            		});
		            		})
		            		.catch(function(message){
		            			pesan_loading(message, true);
		            			resolve_reduce(nextData);
		            		});
		            	}else if(need_update){
	            			return new Promise(function(resolve2, reject2){
	            				var url_form = need_update.action.split('href="');
	            				if(url_form.length >= 3){
	            					pesan_loading('Update SPP rinci rek='+spp_rinci.detail.kode_akun+', total='+spp_rinci.nilai+', no spp='+spp.no_spp, true);
		            				relayAjax({
										url: url_form[1].split('"')[0],
								        success: function(res){
								        	var url_update = jQuery(res).find('form').attr('action');
											var data_post = {
												_token: _token,
												kdurut: spp_rinci.no_id,
												idrefaktivitas: need_update.idrefaktivitas,
												kdrek1: need_update.kdrek1,
												kdrek2: need_update.kdrek2,
												kdrek3: need_update.kdrek3,
												kdrek4: need_update.kdrek4,
												kdrek5: need_update.kdrek5,
												kdrek6: need_update.kdrek6,
												aktivitas_uraian: need_update.aktivitas,
												nilai: formatMoney(spp_rinci.nilai, 2, ',', '.')
											}
											if(tipe_spp_global != 'up'){
												data_post.idsubunit = need_update.idsubunit;
											}
				            				relayAjax({
												url: url_update,
												type: 'post',
												data: data_post,
										        success: function(res){
										        	resolve_reduce(nextData);
										        }
										    });
				            			}
								    });
	            				}else{
	            					pesan_loading('Tombol edit tidak ada! SPP rinci rek='+cek_exist.rekening+', total='+cek_exist.nilai+', no spp='+spp.no_spp, true);
		            				resolve_reduce(nextData);
	            				}
		            		});
		            	}else{
		            		pesan_loading('Sudah ada! SPP rinci rek='+cek_exist.rekening+', total='+cek_exist.nilai+', no spp='+spp.no_spp, true);
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
	        }, Promise.resolve(spp.spp_simda_rinci[last]))
	        .then(function(data_last){
	        	var spp_unik_fmis = {};
	        	spp.spp_fmis_rinci.map(function(b, i){
        			var kode_akun = b.rekening.split(' ').shift();
        			var nama_fmis_unik = kode_akun+replace_string(b.subkegiatan);
					if(!spp_unik_fmis[nama_fmis_unik]){
						spp_unik_fmis[nama_fmis_unik] = [];
					}
					spp_unik_fmis[nama_fmis_unik].push(b);
				});
	        	var kosongkan_rincian = [];
	        	for(var nama_rincian_unik in spp_unik){
	        		var selisih = spp_unik[nama_rincian_unik].jml_fmis - spp_unik[nama_rincian_unik].jml_sipd;
	        		// cek jika ada rincian yang ada di fmis dan tidak ada di sipd. bisa karena diinput manual atau karena rincian di sipd dihapus. rincian ini perlu di nolkan agar pagu sub kegiatannya sama dengan sipd
	        		if(selisih >= 1){
	        			spp_unik_fmis[nama_rincian_unik].map(function(b, i){
							if(i < selisih){
								if(to_number(b.nilai) > 0){
									kosongkan_rincian.push(b);
								}
								spp_unik[nama_rincian_unik].jml_sipd++;
							}
						});
	        		}
	        	}
	        	console.log('kosongkan_rincian', kosongkan_rincian);
	        	var last = kosongkan_rincian.length - 1;
	        	kosongkan_rincian.reduce(function(sequence2, nextData2){
		            return sequence2.then(function(need_update){
		        		return new Promise(function(resolve_reduce2, reject_reduce2){
		        			var url_form = need_update.action.split('href="');
		        			if(url_form.length >= 3){
			        			pesan_loading('Kosongkan SPP rinci rek='+need_update.rekening+', total=0, no spp='+spp.no_spp, true);
	            				relayAjax({
									url: url_form[1].split('"')[0],
							        success: function(res){
							        	var url_update = jQuery(res).find('form').attr('action');
										var data_post = {
											_token: _token,
											kdurut: spp_rinci.no_id,
											idrefaktivitas: need_update.idrefaktivitas,
											idsubunit: need_update.idsubunit,
											kdrek1: need_update.kdrek1,
											kdrek2: need_update.kdrek2,
											kdrek3: need_update.kdrek3,
											kdrek4: need_update.kdrek4,
											kdrek5: need_update.kdrek5,
											kdrek6: need_update.kdrek6,
											aktivitas_uraian: need_update.aktivitas,
											nilai: formatMoney(0, 2, ',', '.')
										}
			            				relayAjax({
											url: url_update,
											type: 'post',
											data: data_post,
									        success: function(res){
									        	resolve_reduce2(nextData2);
									        }
									    });
			            			}
							    });
	            			}else{
            					pesan_loading('Tombol edit tidak ada! SPP rinci rek='+need_update.rekening+', total='+need_update.nilai+', no spp='+spp.no_spd, true);
								resolve_reduce2(nextData2);
	            			}
		        		})
		                .catch(function(e){
		                    console.log(e);
		                    return Promise.resolve(nextData2);
		                });
		            })
		            .catch(function(e){
		                console.log(e);
		                return Promise.resolve(nextData2);
		            });
		        }, Promise.resolve(kosongkan_rincian[last]))
		        .then(function(data_last){
    				resolve();
	        	});
    		});
	    });
	});
}

function get_spd_rinci_fmis(spd_fmis){
	pesan_loading('get SPD rinci FMIS dengan no='+spd_fmis.spd_no, true);
	return new Promise(function(resolve, reject){
		var url = spd_fmis.action.split('href="').pop().split('"')[0].replace('/bud/spd/rencana/', '/bud/spd/rencana/data/');
		relayAjax({
			url: url,
	        success: function(res){
	        	resolve(res.data);
	        }
	    });
	});
}

function get_spp_rinci_fmis(spp_fmis){
	pesan_loading('get SPP rinci FMIS dengan no='+spp_fmis.spp_no, true);
	return new Promise(function(resolve, reject){
		var url = spp_fmis.action.split('href="').pop().split('"')[0].replace('/spp/up/rincian/', '/spp/up/rincian/data/');
		relayAjax({
			url: url,
	        success: function(res){
	        	resolve(res.data);
	        }
	    });
	});
}

function get_data_pegawai(){
	pesan_loading('get all data pegawai', true);
	return new Promise(function(resolve, reject){
		relayAjax({
			url: config.fmis_url+'/parameter/data-pegawai/datatable',
	        success: function(res){
	        	var new_data = {};
	        	res.data.map(function(b, i){
	        		var nip = b.nip.replace(/ /g, '');
	        		var keyword = nip;
	        		new_data[keyword] = b;
	        	});
	        	resolve({
	        		'array': res.data,
	        		'object': new_data
	        	});
	        }
	    });
	});
}

function get_data_pegawai_penandatangan(){
	pesan_loading('get all data pegawai penandatangan', true);
	return new Promise(function(resolve, reject){
		relayAjax({
			url: config.fmis_url+'/penatausahaan/parameter/penandatangan/data-pegawai',
	        success: function(res){
	        	var new_data = {};
	        	jQuery(res.html).find('#table-pegawai a.select-pegawai').map(function(i, b){
	        		var nip = jQuery(b).attr('data-nip');
	        		var nama = jQuery(b).attr('data-name');
	        		var id = jQuery(b).attr('data-id');
	        		var keyword = nip.replace(/ /g, '').trim();
	        		new_data[keyword] = {
	        			id: id,
	        			nip: nip,
	        			nama: nama
	        		}
	        	});
	        	resolve(new_data);
	        }
	    });
	});
}

function get_spp_rinci_simda(spp_simda){
	pesan_loading('get SPD rinci SIMDA dengan no='+spp_simda.no_spp, true);
	return new Promise(function(resolve, reject){
		window.continue_spp_rinci = resolve;
		var data = {
		    message:{
		        type: "get-url",
		        content: {
				    url: config.url_server_lokal,
				    type: 'post',
				    data: { 
						action: 'get_spp_rinci',
						no_spp: spp_simda.no_spp,
						kd_urusan: spp_simda.kd_urusan,
						kd_bidang: spp_simda.kd_bidang,
						kd_unit: spp_simda.kd_unit,
						kd_sub: spp_simda.kd_sub,
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

function get_spd_rinci_simda(spd_simda){
	pesan_loading('get SPD rinci SIMDA dengan no='+spd_simda.no_spd, true);
	return new Promise(function(resolve, reject){
		window.continue_spd_rinci = resolve;
		var data = {
		    message:{
		        type: "get-url",
		        content: {
				    url: config.url_server_lokal,
				    type: 'post',
				    data: { 
						action: 'get_spd_rinci',
						no_spd: spd_simda.no_spd,
						kd_urusan: spd_simda.kd_urusan,
						kd_bidang: spd_simda.kd_bidang,
						kd_unit: spd_simda.kd_unit,
						kd_sub: spd_simda.kd_sub,
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

function singkronisasi_data_pegawai(data){
	getUnitFmis().then(function(unit_fmis){
		new Promise(function(resolve, reject){
			get_data_pegawai()
			.then(function(pegawai_fmis){
				var last = data.length - 1;
				data.reduce(function(sequence, nextData){
			        return sequence.then(function(pegawai){
			        	return new Promise(function(resolve_reduce, reject_reduce){
			        		var id_unit = pegawai.skpd.id_mapping_fmis.split('.').shift();
			        		var nama_sub_unit = false;
							for(var unit_f in unit_fmis){
								for(var sub_unit_f in unit_fmis[unit_f].sub_unit){
									if(id_unit == unit_fmis[unit_f].sub_unit[sub_unit_f].id){
										nama_sub_unit = sub_unit_f;
									}
								}
							}
							if(id_unit && nama_sub_unit){
								var nip = pegawai.nip.replace(/ /g, '');
								var keyword = nip;
								if(!pegawai_fmis.object[keyword]){
									var tahun = nip.substr(0, 4);
									var bulan = nip.substr(4, 2);
									var tanggal = nip.substr(6, 2);
									if(
										tahun != ''
										&& bulan != ''
										&& tanggal != ''
									){
										var tgllahir = tahun+'-'+bulan+'-'+tanggal;
									}else{
										var date = new Date();
										var tgllahir = date.getUTCFullYear()+'-'+(date.getUTCMonth()+1)+'-'+date.getUTCDate();
									}
					        		var data_post = {
					        			_token: _token,
					        			nmunit: nama_sub_unit,
					        			idunit: id_unit,
					        			nip: nip,
					        			nama: pegawai.nama.trim(),
					        			tmplahir: 'generate wp-sipd',
					        			tgllahir: tgllahir
					        		};
					        		pesan_loading('Insert Nama pegawai='+pegawai.nama+', NIP='+pegawai.nip, true);
					        		relayAjax({
										url: config.fmis_url+'/parameter/data-pegawai/store',
										type: 'post',
										data: data_post,
								        success: function(res){
								        	resolve_reduce(nextData);
								        }
								    });
					        	}else{
					        		pesan_loading('Sudah ada! Nama pegawai='+pegawai.nama+', NIP='+pegawai.nip, true);
					        		resolve_reduce(nextData);
					        	}
				        	}else{
				        		pesan_loading('Unit SKPD dengan kode SIMDA='+pegawai.kd_sub_unit+' tidak ditemukan di FMIS. Nama pegawai='+pegawai.nama+', NIP='+pegawai.nip, true);
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
			    }, Promise.resolve(data[last]))
			    .then(function(data_last){
			    	resolve();
				});
			});
		})
	    .then(function(){
	    	return new Promise(function(resolve, reject){
		    	if(cek_singkron_penandatangan){
		    		get_data_pegawai_penandatangan()
		    		.then(function(pegawai_fmis){
		    			console.log('pegawai_penandatangan_fmis', pegawai_fmis);
			    		get_list_penandatangan_master()
			    		.then(function(penandatangan){
			    			console.log('penandatangan existing', penandatangan);
							var last = data.length - 1;
							data.reduce(function(sequence, nextData){
						        return sequence.then(function(pegawai){
						        	return new Promise(function(resolve_reduce, reject_reduce){
						        		var id_unit = pegawai.skpd.id_mapping_fmis.split('.').pop();
						        		var nama_sub_unit = false;
										for(var unit_f in unit_fmis){
											for(var sub_unit_f in unit_fmis[unit_f].sub_unit){
												if(id_unit == unit_fmis[unit_f].sub_unit[sub_unit_f].id){
													nama_sub_unit = sub_unit_f;
												}
											}
										}
						        		var nip = pegawai.nip.replace(/ /g, '');
										if(pegawai_fmis[nip]){
											var keyword = replace_string(nip+pegawai.nama.trim()+nama_sub_unit.trim());
								    		if(!penandatangan.object[keyword]){
									    		var jabatan = {
									    			1 : 'KUASA PENGGUNA',
													2 : 'PPK SKPD',
													3 : 'BENDAHARA PENERIMAAN',
													4 : 'BENDAHARA PENGELUARAN',
													5 : 'BENDAHARA BARANG',
													6 : 'BENDAHARA PENERIMAAN PEMBANTU',
													7 : 'BENDAHARA PENGELUARAN PEMBANTU',
													8 : 'PENGGUNA ANGGARAN'
									    		};
									    		var data_post = {
									    			_token: _token,
													nmsubunit: nama_sub_unit,
													idsubunit: id_unit,
													ref_nama: pegawai.nama,
													iddatapegawai: pegawai_fmis[nip].id,
													nip: nip,
													nama: pegawai.nama,
													idjabatan: pegawai.kd_jab,
													nmjabatan: pegawai.jabatan.trim().substring(0, 50),
													jns_dokumen: [],
													jns_cakupan: 0
									    		};
									    		/*
													1=SPD
													2=SPP
													3=SPM
													4=SP2D
													5=Bukti Penerimaan
													6=STS
													7=Penguji SP2D
													8=SPB
									    		*/
									    		// KUASA PENGGUNA
									    		if(pegawai.kd_jab == 1){
									    			data_post.jns_dokumen.push(2);
									    			data_post.jns_dokumen.push(3);
									    		// PPK SKPD
									    		}else if(pegawai.kd_jab == 2){
									    			data_post.jns_dokumen.push(2);
									    			data_post.jns_dokumen.push(3);
									    		// BENDAHARA PENERIMAAN
									    		}else if(pegawai.kd_jab == 3){
									    			data_post.jns_dokumen.push(5);
									    		// BENDAHARA PENGELUARAN
									    		}else if(pegawai.kd_jab == 4){
									    			data_post.jns_dokumen.push(2);
									    			data_post.jns_dokumen.push(3);
									    		// BENDAHARA BARANG
									    		}else if(pegawai.kd_jab == 5){
									    		// BENDAHARA PENERIMAAN PEMBANTU
									    		}else if(pegawai.kd_jab == 6){
									    		// BENDAHARA PENGELUARAN PEMBANTU
									    		}else if(pegawai.kd_jab == 7){
									    			data_post.jns_dokumen.push(2);
									    		// PENGGUNA ANGGARAN
									    		}else if(pegawai.kd_jab == 8){
									    			data_post.jns_dokumen.push(2);
									    			data_post.jns_dokumen.push(3);
									    		}
									    		if(data_post.jns_dokumen.length > 0){
										    		pesan_loading('Insert Penandatangan dokumen untuk Nama pegawai='+pegawai.nama+', NIP='+pegawai.nip, true);
										    		relayAjax({
														url: config.fmis_url+'/penatausahaan/parameter/penandatangan/create',
														type: 'post',
														data: data_post,
												        success: function(res){
												        	resolve_reduce(nextData);
												        }
												    });
									    		}else{
									    			pesan_loading('Jenis Dokumen belum diset untuk jabatan '+jabatan[pegawai.kd_jab]+'! Penandatangan dokumen untuk Nama pegawai='+pegawai.nama+', NIP='+pegawai.nip, true);
												    resolve_reduce(nextData);
									    		}
									    	}else{
									    		pesan_loading('Sudah ada! Penandatangan dengan Nama pegawai='+pegawai.nama+', NIP='+pegawai.nip, true);
									    		resolve_reduce(nextData);
									    	}
									    }else{
									    	pesan_loading('Pegawai tidak ditemukan! Dengan Nama pegawai='+pegawai.nama+', NIP='+pegawai.nip, true);
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
						    }, Promise.resolve(data[last]))
						    .then(function(data_last){
						    	resolve();
							});
						});
					});
		    	}else{
				    resolve();
		    	}
		    });
	    })
	    .then(function(){
			hide_loading();
			alert('Berhasil singkronisasi data pegawai dari SIMDA!');
	    })
    })
}

function singkronisasi_data_meta_sub_unit_all(data){
	var last = data.length - 1;
	data.reduce(function(sequence, nextData){
        return sequence.then(function(sub_unit){
        	return new Promise(function(resolve_reduce, reject_reduce){
        		var id_skpd_fmis = sub_unit.skpd.id_mapping_fmis.split('.');
        		if(
        			id_skpd_fmis.length < 2 
        			|| id_skpd_fmis[1] == ''
        		){
        			console.log('id_skpd_fmis kosong!', sub_unit);
        			return resolve_reduce(nextData);
        		}

        		var id_skpd = id_skpd_fmis[0];
        		id_skpd_fmis = id_skpd_fmis[1];
        		get_id_current_user()
    			.then(function(user){
    				console.log('user', user, sub_unit);
    				get_all_user_fmis(user.username)
					.then(function(users){
    					var current_user = false;
    					users.data.map(function(u, n){
							if(u.kduser == user.username){
								current_user = u;
							}
						});
						if(current_user){
							singkronisasi_data_meta_sub_unit(data, function(){
								resolve_reduce(nextData);
							});
						}else{
							pesan_loading('USER '+user.nama+' tidak ditemukan di FMIS!', true);
							resolve_reduce(nextData);
						}
					});
    			});
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
    }, Promise.resolve(data[last]))
    .then(function(data_last){
    	hide_loading();
		alert('Berhasil singkronisasi data meta sub unit dari SIMDA!');
	});
}

function singkronisasi_data_meta_sub_unit(data, cb = false){
	get_id_sub_unit_penatausahaan()
	.then(function(sub_unit_fmis){
		var last = data.length - 1;
		data.reduce(function(sequence, nextData){
	        return sequence.then(function(sub_unit){
	        	return new Promise(function(resolve_reduce, reject_reduce){
	        		var id_skpd_fmis = sub_unit.skpd.id_mapping_fmis.split('.');
	        		if(
	        			id_skpd_fmis.length < 2 
	        			|| id_skpd_fmis[1] == ''
	        		){
	        			console.log('id_skpd_fmis kosong!', sub_unit);
	        			return resolve_reduce(nextData);
	        		}

	        		var id_skpd = id_skpd_fmis[0];
	        		id_skpd_fmis = id_skpd_fmis[1];
	        		if(id_skpd_fmis == sub_unit_fmis.idsubunit){
	    				console.log('sub_unit', sub_unit);
	    				show_loading('Get data umum existing '+sub_unit_fmis.nmsubunit);
	    				var url = config.fmis_url+'/penatausahaan/parameter/penandatangan';
	    				// https://stackoverflow.com/questions/3372962/can-i-remove-the-x-requested-with-header-from-ajax-requests
						jQuery.ajax({
							url: url,
        					xhr: function() {
						        var xhr = jQuery.ajaxSettings.xhr();
						        var setRequestHeader = xhr.setRequestHeader;
						        xhr.setRequestHeader = function(name, value) {
						            if (name == 'X-Requested-With') return;
						            setRequestHeader.call(this, name, value);
						        }
						        return xhr;
						    },
					        success: function(html){
					        	var form = jQuery(html.split('<div class="container">')[1].split('</form>')[0]+'</form>');
					        	var alamat_fmis = form.find('textarea[name="alamat"]').val();
					        	if(alamat_fmis == ''){
					        		alamat_fmis = sub_unit.alamat;
					        	}
					        	var pimpinan_nm_fmis = form.find('input[name="pimpinan_nm"]').val();
					        	if(pimpinan_nm_fmis == ''){
					        		pimpinan_nm_fmis = sub_unit.nm_pimpinan;
					        	}
					        	var pimpinan_nip_fmis = form.find('input[name="pimpinan_nip"]').val();
					        	if(pimpinan_nip_fmis == ''){
					        		pimpinan_nip_fmis = sub_unit.nip_pimpinan.replace(/ /g, '');
					        	}
					        	var pimpinan_jbt_fmis = form.find('input[name="pimpinan_jbt"]').val();
					        	if(pimpinan_jbt_fmis == ''){
					        		pimpinan_jbt_fmis = sub_unit.jbt_pimpinan;
					        	}
					        	var uraian_visi_fmis = form.find('input[name="uraian_visi"]').val();
					        	if(uraian_visi_fmis == ''){
					        		uraian_visi_fmis = sub_unit.ur_visi;
					        	}
					        	var bank_nm_fmis = form.find('select[name="bank_nm"]').val();
					        	if(bank_nm_fmis == ''){
					        		bank_nm_fmis = sub_unit.nm_bank;
					        	}
					        	var bank_rek_bendahara_fmis = form.find('input[name="bank_rek_bendahara"]').val();
					        	if(bank_rek_bendahara_fmis == ''){
					        		bank_rek_bendahara_fmis = sub_unit.rek_bendahara;
					        	}
					        	var npwp_fmis = form.find('input[name="npwp"]').val();
					        	if(npwp_fmis == ''){
					        		npwp_fmis = sub_unit.npwp;
					        	}
					        	var bendahara_nm_fmis = form.find('input[name="bendahara_nm"]').val();
					        	if(bendahara_nm_fmis == ''){
					        		bendahara_nm_fmis = sub_unit.nama;
					        	}
					        	var bendahara_nip_fmis = form.find('input[name="bendahara_nip"]').val();
					        	if(bendahara_nip_fmis == ''){
					        		bendahara_nip_fmis = sub_unit.nip.replace(/ /g, '');
					        	}
					        	var bendahara_jbt_fmis = form.find('input[name="bendahara_jbt"]').val();
					        	if(bendahara_jbt_fmis == ''){
					        		bendahara_jbt_fmis = sub_unit.jabatan;
					        	}
								var data_post = {
									_token: _token,
									alamat: alamat_fmis,
									pimpinan_nm: pimpinan_nm_fmis,
									pimpinan_nip: pimpinan_nip_fmis,
									pimpinan_jbt: pimpinan_jbt_fmis,
									uraian_visi: uraian_visi_fmis,
									bank_nm: bank_nm_fmis,
									bank_rek_bendahara: bank_rek_bendahara_fmis,
									npwp: npwp_fmis,
									bendahara_nm: bendahara_nm_fmis,
									bendahara_nip: bendahara_nip_fmis,
									bendahara_jbt: bendahara_jbt_fmis
								};
								pesan_loading('Update data sub unit '+sub_unit_fmis.nmsubunit, true);
								relayAjax({
									url: config.fmis_url+'/penatausahaan/parameter/penandatangan/data-subunit/create',
									type: 'post',
									data: data_post,
								    success: function(res){
								    	resolve_reduce(nextData);
								    }
								});
		    				}
		    			});
	    			}else{
	    				resolve_reduce(nextData);
	    			};
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
	    }, Promise.resolve(data[last]))
	    .then(function(data_last){
	    	if(typeof cb == 'function'){
	    		cb();
	    	}else{
		    	hide_loading();
				alert('Berhasil singkronisasi data meta sub unit dari SIMDA!');
			}
		});
	});
}

function get_id_sub_unit_penatausahaan(){
	pesan_loading('Get ID Sub Unit penatausahaan!');
	return new Promise(function(resolve, reject){
		relayAjax({
			url: config.fmis_url+'/penatausahaan/parameter/penandatangan/create',
	        success: function(html){
	        	var form = jQuery(html);
	        	resolve({
	        		nmsubunit: form.find('input[name="nmsubunit"]').val(),
	        		idsubunit: form.find('input[name="idsubunit"]').val()
	        	});
	        }
	    });
	});
}

function get_spp_up(){
	return new Promise(function(resolve, reduce){
		relayAjax({
			url: config.fmis_url+'/penatausahaan/skpd/bend-pengeluaran/spp/up',
	        success: function(res){
	        	var spp = {};
	        	res.data.map(function(b, i){
	        		spp[b.spp_no] = b;
	        	})
	        	resolve(spp);
	        }
	    });
	});
}

function singkronisasi_spp(data){
	window.spp_simda = data;
	get_spp_up()
	.then(function(spp_fmis){
		run_script('program_destroy');
    	var body = '';
		data.map(function(b, i){
			if(
				!spp_fmis[b.no_spp.trim()]
				&& !spp_fmis['DRAFT-'+b.no_spp.trim()]
			){
				body += ''
					+'<tr>'
						+'<td><input type="checkbox" value="'+b.no_spp.trim()+'"></td>'
						+'<td>'+b.no_spp.trim()+'</td>'
						+'<td>'+b.kd_sub_unit+' '+b.skpd.nama_skpd+'</td>'
						+'<td>'+b.uraian+'</td>'
					+'</tr>';
			}else{
				if(spp_fmis[b.no_spp.trim()]){
					var spp_fmis_selected = spp_fmis[b.no_spp.trim()];
				}else{
					var spp_fmis_selected = spp_fmis['DRAFT-'+b.no_spp.trim()];
				}
				var disabled = '';
				var status = '';
				if(spp_fmis_selected.status == 'Final'){
					var disabled = 'disabled';
					var status = ' (Stauts Final)';
				}
				body += ''
					+'<tr>'
						+'<td><input '+disabled+' type="checkbox" value="'+b.no_spp.trim()+'"> <b>EXISTING'+status+'</b></td>'
						+'<td>'+b.no_spp.trim()+'</td>'
						+'<td>'+b.kd_sub_unit+' '+b.skpd.nama_skpd+'</td>'
						+'<td>'+b.uraian+'</td>'
					+'</tr>';
			}
		});
		jQuery('#konfirmasi-program tbody').html(body);
		run_script('custom_dt_program');
		hide_loading();
    });
}

function singkronisasi_spp_modal(){
	var data_selected = [];
	jQuery('#konfirmasi-program tbody tr input[type="checkbox"]').map(function(i, b){
		var cek = jQuery(b).is(':checked');
		if(cek){
			var no_spp = jQuery(b).val();
			spp_simda.map(function(bb, ii){
				if(bb.no_spp == no_spp){
					data_selected.push(bb);
				}
			});
		}
	});
	if(data_selected.length >= 1){
		if(confirm('Apakah anda yakin untuk mengsingkronkan data SPP?')){
			show_loading();
			console.log('data_selected', data_selected);
			new Promise(function(resolve, reject){
    			get_spp_up()
				.then(function(spp_fmis){
					var last = data_selected.length - 1;
					data_selected.reduce(function(sequence, nextData){
			            return sequence.then(function(current_data){
			        		return new Promise(function(resolve_reduce, reject_reduce){
								if(
									!spp_fmis[current_data.no_spp.trim()]
									&& !spp_fmis['DRAFT-'+current_data.no_spp.trim()]
								){
									var data_post = {
			        					_token: _token,
										spp_no: current_data.no_spp.trim(),
										spp_tgl: current_data.tgl_spp.split(' ')[0],
										uraian: current_data.uraian,
										penerima_npwp: current_data.npwp,
										penerima_rek: current_data.rek_penerima,
										penerima_bank: current_data.bank_penerima,
										penerima_alamat: current_data.alamat_penerima,
										penerima_nm: current_data.nm_penerima
			        				}
			        				pesan_loading('Simpan data SPP '+current_data.no_spp, true);
			        				relayAjax({
										url: config.fmis_url+'/penatausahaan/skpd/bend-pengeluaran/spp/up/create',
										type: 'post',
										data: data_post,
								        success: function(res){
								        	resolve_reduce(nextData);
								        }
								    });
								}else{
									if(spp_fmis[current_data.no_spp.trim()]){
										var spp_fmis_selected = spp_fmis[current_data.no_spp.trim()];
									}else{
										var spp_fmis_selected = spp_fmis['DRAFT-'+current_data.no_spp.trim()];
									}
									if(
										spp_fmis_selected.action.indexOf('update') == -1
										|| (
											current_data.uraian == spp_fmis_selected.uraian
											&& current_data.nm_penerima == spp_fmis_selected.penerima_nm
										)
									){
										return resolve_reduce(nextData);
									}
									var id_spp_fmis = spp_fmis_selected.action.split('href="').pop().split('"')[0].split('/').pop();
									var data_post = {
			        					_token: _token,
										spp_no: current_data.no_spp.trim(),
										spp_tgl: current_data.tgl_spp.split(' ')[0],
										uraian: current_data.uraian,
										penerima_npwp: current_data.npwp,
										penerima_rek: current_data.rek_penerima,
										penerima_bank: current_data.bank_penerima,
										penerima_alamat: current_data.alamat_penerima,
										penerima_nm: current_data.nm_penerima
			        				}
									pesan_loading('Perlu update data SPP '+current_data.no_spp, true);
			        				relayAjax({
										url: config.fmis_url+'/penatausahaan/skpd/bend-pengeluaran/spp/up/update/'+id_spp_fmis,
										type: 'post',
										data: data_post,
								        success: function(res){
								        	resolve_reduce(nextData);
								        }
								    });
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
			        }, Promise.resolve(data_selected[last]))
			        .then(function(data_last){
				    	resolve();
					});
				});
			})
	        .then(function(){
	        	// singkronisasi rincian SPP
	        	return new Promise(function(resolve, reject){
	    			get_spp_up()
					.then(function(spp_fmis){
						var last = data_selected.length - 1;
						data_selected.reduce(function(sequence, nextData){
				            return sequence.then(function(current_data){
				        		return new Promise(function(resolve_reduce, reject_reduce){
				        			if(
										spp_fmis[current_data.no_spp.trim()]
										|| spp_fmis['DRAFT-'+current_data.no_spp.trim()]
									){
										if(spp_fmis[current_data.no_spp.trim()]){
											var spp_fmis_selected = spp_fmis[current_data.no_spp.trim()];
										}else{
											var spp_fmis_selected = spp_fmis['DRAFT-'+current_data.no_spp.trim()];
										}
										if(spp_fmis_selected.action.indexOf('update') == -1){
											return resolve_reduce(nextData);
										}
										current_data.spp_fmis = spp_fmis_selected;
										get_spp_rinci_fmis(current_data.spp_fmis)
				            			.then(function(spp_fmis_rinci){
				            				current_data.spp_fmis_rinci = spp_fmis_rinci;
					            			get_spp_rinci_simda(current_data)
					            			.then(function(spp_simda_rinci){
					            				current_data.spp_simda_rinci = spp_simda_rinci;
					            				cek_insert_spp_rinci(current_data)
					            				.then(function(){
					            					resolve_reduce(nextData);
					            				})
					            			});
				            			});
				        			}else{
				        				pesan_loading('Tidak ditemukan! Data SPP '+current_data.no_spp, true);
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
				        }, Promise.resolve(data_selected[last]))
				        .then(function(data_last){
					    	resolve();
						});
					});
				});
	        })
	        .then(function(){
		    	run_script('reload_spd');
				alert('Berhasil singkronisasi SPP!');
		    	run_script('program_hide');
				hide_loading();
			});
		}
	}else{
		alert('Pilih data dulu!');
	}
}