function update_aktivitas(){
	window.sub_keg_fmis_update = {};
	window.keg_fmis_update = {};
	window.prog_fmis_update = {};
	window.aktivitas_fmis_update = {};
	var daftar_sub = '';
	get_list_program()
	.then(function(program_exist){
		if(program_exist.data.length >= 1){
	        run_script('program_destroy');
			var last = program_exist.data.length - 1;
			program_exist.data.reduce(function(sequence, nextData){
	            return sequence.then(function(program){
	        		return new Promise(function(resolve_reduce, reject_reduce){
	        			program.uraian = removeNewlines(program.uraian);
						var keyword = program.DT_RowId;
						prog_fmis_update[keyword] = program;
						get_list_kegiatan(program)
        				.then(function(kegiatan_exist){
        					if(kegiatan_exist.data.length >= 1){
								var last2 = kegiatan_exist.data.length - 1;
								kegiatan_exist.data.reduce(function(sequence2, nextData2){
						            return sequence2.then(function(kegiatan){
						            	return new Promise(function(resolve_reduce2, reject_reduce2){
						            		kegiatan.uraian = removeNewlines(kegiatan.uraian);
											var keyword = program.DT_RowId+'-'+kegiatan.DT_RowId;
											keg_fmis_update[keyword] = kegiatan;
							        		get_list_sub_kegiatan(kegiatan)
											.then(function(sub_kegiatan){
												if(sub_kegiatan.data.length >= 1){
													var last3 = sub_kegiatan.data.length - 1;
													sub_kegiatan.data.reduce(function(sequence3, nextData3){
											            return sequence3.then(function(sub_keg_fmis){
											            	return new Promise(function(resolve_reduce3, reject_reduce3){
																var keyword = program.DT_RowId+'-'+kegiatan.DT_RowId+'-'+sub_keg_fmis.DT_RowId;
																sub_keg_fmis_update[keyword] = sub_keg_fmis;
																get_list_aktivitas(sub_keg_fmis)
																.then(function(aktivitas_exist){
																	aktivitas_exist.data.map(function(b, a){
																		b.uraian = removeNewlines(b.uraian);
																		sub_keg_fmis.uraian = removeNewlines(sub_keg_fmis.uraian);
																		var keyword = program.DT_RowId+'-'+kegiatan.DT_RowId+'-'+sub_keg_fmis.DT_RowId+'-'+b.DT_RowId;
																		b.sub_keg_fmis = sub_keg_fmis;
																		aktivitas_fmis_update[keyword] = b;
																		var status = '';
																		if(b.status_pelaksanaan == '1'){
																			status = 'Data Existing';
																		}else if(b.status_pelaksanaan == '2'){
																			status = 'Batal';
																		}else if(b.status_pelaksanaan == '3'){
																			status = 'Tunda';
																		}else if(b.status_pelaksanaan == '4'){
																			status = 'Penambahan Baru';
																		}
																		daftar_sub += ''
																			+'<tr>'
																				+'<td><input type="checkbox" value="'+keyword+'"> <b>'+status+'</b></td>'
																				+'<td>'+program.uraian+'</td>'
																				+'<td>'+kegiatan.uraian+'</td>'
																				+'<td>'+sub_keg_fmis.uraian+' (<b>'+b.uraian+'</b>)</td>'
																			+'</tr>';
																	});
																	return resolve_reduce3(nextData3);
																});
											            	})
												            .catch(function(e){
												                console.log(e);
												                return Promise.resolve(nextData3);
												            });
											            })
											            .catch(function(e){
											                console.log(e);
											                return Promise.resolve(nextData3);
											            });
											        }, Promise.resolve(sub_kegiatan.data[last3]))
											        .then(function(data_last){
											        	resolve_reduce2(nextData2);
											        });
								            	}else{
													console.log('sub_kegiatan kosong', sub_kegiatan.data);
													resolve_reduce2(nextData2);
								            	}
											});
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
						        }, Promise.resolve(kegiatan_exist.data[last2]))
						        .then(function(data_last){
						        	resolve_reduce(nextData);
						        });
							}else{
								console.log('kegiatan_exist kosong', kegiatan_exist.data);
								resolve_reduce(nextData);
							}
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
	        }, Promise.resolve(program_exist.data[last]))
	        .then(function(data_last){
				jQuery('#mod-konfirmasi-program .modal-title').text('Update RKA per aktivitas');
				jQuery('#konfirmasi-program tbody').html(daftar_sub);
				jQuery('#mod-program-rkpd').parent().hide();
				var table = jQuery('#konfirmasi-program');
				table.attr('data-singkron-rka', 'update-rka');
				run_script('custom_dt_program');
				hide_loading();
	        });
		}else{
			console.log('program_exist kosong', program_exist.data);
			alert('Program kosong!');
		}
	})
}

function update_rka_modal(){
	window.hapus_rka = prompt('Apakah mau menghapus rincian dan RKA? isikan 1 jika iya dan kosongkan saja jika hanya mau merubah status aktivitas.');
	show_loading();
	var aktivitas_selected = [];
	jQuery('#konfirmasi-program tbody tr input[type="checkbox"]').map(function(i, b){
		var cek = jQuery(b).is(':checked');
		if(cek){
			var keyword_selected = jQuery(b).val();
			for(var keyword in aktivitas_fmis_update){
				if(keyword == keyword_selected){
					aktivitas_selected.push(aktivitas_fmis_update[keyword]);
				}
			}
		}
	});
	if(aktivitas_selected.length >= 1){
		console.log('update aktivitas', aktivitas_selected);
		var last = aktivitas_selected.length - 1;
		aktivitas_selected.reduce(function(sequence, nextData){
            return sequence.then(function(aktivitas_exist_update){
        		return new Promise(function(resolve_reduce, reject_reduce){
        			var data_post = {
        				_token: _token,
        				uraian: aktivitas_exist_update.uraian,
        				idsubunit: aktivitas_exist_update.idsubunit,
        				idsumberdana1: aktivitas_exist_update.idsumberdana1,
        				idsumberdana2: aktivitas_exist_update.idsumberdana2,
        				idsatuan1: aktivitas_exist_update.idsatuan1,
        				idsatuan2: aktivitas_exist_update.idsatuan2,
        				pagu: to_number(aktivitas_exist_update.pagu, true)
        			};
        			data_post._method = 'PUT';
        			data_post.kdurut = aktivitas_exist_update.kdurut;
    				data_post.jn_asb = aktivitas_exist_update.jn_asb;
    				data_post.jn_rkud = aktivitas_exist_update.jn_rkud;
    				data_post.status_luncuran = aktivitas_exist_update.status_luncuran;
    				data_post.idasb = aktivitas_exist_update.idasb;
    				data_post.idpptk = aktivitas_exist_update.idpptk;
    				data_post.volume1 = aktivitas_exist_update.volume1;
    				data_post.volume2 = aktivitas_exist_update.volume2;
					pesan_loading('UPDATE STATUS Tambahan Baru AKTIVITAS '+aktivitas_exist_update.uraian+' SUBKEGIATAN '+aktivitas_exist_update.kode_subkegiatan+' '+aktivitas_exist_update.nmsubkegiatan, true);
					new Promise(function(resolve, reduce){
        				var code_aktivitas = aktivitas_exist_update.action.split('code=')[1].split('"')[0];
        				relayAjax({
							url: config.fmis_url+'/anggaran/rka-opd/aktivitas/form?code='+code_aktivitas+'&action=edit',
				            success: function(form_edit){
		        				var form = jQuery(form_edit.form);
		        				data_post.idrapbdrkaaktivitas = '';
		        				data_post.idrapbdrkasubkegiatan = form.find('input[name="idrapbdrkasubkegiatan"]').val();
		        				data_post.status_pelaksanaan = 4; // dirubah jadi status tambahan baru
		        				var url = form.attr('action');
		        				resolve(url);
		        			}
		        		});
        			})
        			.then(function(url_simpan){
    					relayAjax({
							url: url_simpan,
							type: "post",
				            data: data_post,
				            success: function(res){
				            	if(hapus_rka == '1'){
				            		aksi_delete_rka(aktivitas_exist_update)
				            		.then(function(){
				            			resolve_reduce(nextData);
				            		})
				            	}else{
				            		resolve_reduce(nextData);
				            	}
				            },
				            error: function(e){
				            	console.log('Error save aktivitas!', e, this.data);
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
        }, Promise.resolve(aktivitas_selected[last]))
        .then(function(data_last){
			alert('Berhasil update status aktivitas!');
			hide_loading();
			run_script('program_hide');
        });
	}else{
		alert('Pilih aktivitas dulu!');
		hide_loading();
	}
}

function aksi_delete_rka(aktivitas){
	return new Promise(function(resolve, reduce){
		get_rka_aktivitas(aktivitas)
		.then(function(rka){
			var data_rka = rka.data;
			var last3 = data_rka.length - 1;
			data_rka.reduce(function(sequence3, nextData3){
	            return sequence3.then(function(rka){
	        		return new Promise(function(resolve_reduce3, reject_reduce3){
	        			pesan_loading('HAPUS RINCIAN = '+rka.uraian_belanja, true);
	        			if(_type_singkronisasi_rka == 'rka-opd'){
	        				var url_form_delete = rka.action.split('href="')[3].split('"')[0];
		        			relayAjax({
								url: url_form_delete+'&action=delete',
					            success: function(form_delete){
					            	var form = jQuery(form_delete.form);
					            	var url_delete = form.attr('action');
				        			relayAjax({
										url: url_delete,
										data: {
											_method: 'DELETE',
											_token: _token
										},
										type: "post",
							            success: function(res){
							            	resolve_reduce3(nextData3);
							            },
							            error: function(e){
							            	console.log('Error hapus rincian!', e, rka);
							            }
									});
					            }
							});
	        			}else{
	        				var url_delete = rka.action.split('href="')[2].split('"')[0];
		        			relayAjax({
								url: url_delete,
								headers: {"x-csrf-token": _token},
								type: "post",
					            success: function(res){
					            	resolve_reduce3(nextData3);
					            },
					            error: function(e){
					            	console.log('Error hapus rincian!', e, rka);
					            }
							});
	        			}
	        		})
	                .catch(function(e){
	                    console.log(e);
	                    return Promise.resolve(nextData3);
	                });
	            })
	            .catch(function(e){
	                console.log(e);
	                return Promise.resolve(nextData3);
	            });
	        }, Promise.resolve(data_rka[last3]))
	        .then(function(){
				return new Promise(function(resolve2, reduce2){
		        	if(aktivitas.sub_keg_fmis){
			        	get_list_aktivitas(aktivitas.sub_keg_fmis)
						.then(function(aktivitas_exist){
							aktivitas_exist.data.map(function(b, a){
								if(b.DT_RowId == aktivitas.DT_RowId){
									var url_form_delete = b.action.split('href="')[2].split('"')[0];
									resolve2(url_form_delete);
								}
							});
						});
		        	}else{
						var url_form_delete = aktivitas.action.split('href="')[2].split('"')[0];
						resolve2(url_form_delete);
		        	}
		        })
		        .then(function(url_form_delete){
		        	pesan_loading('HAPUS AKTIVITAS = '+aktivitas.uraian, true);
		        	if(_type_singkronisasi_rka == 'rka-opd'){
		    			relayAjax({
							url: url_form_delete+'&action=delete',
				            success: function(form_delete){
				            	var form = jQuery(form_delete.form);
				            	var url_delete = form.attr('action');
			        			relayAjax({
									url: url_delete,
									data: {
										_method: 'DELETE',
										_token: _token
									},
									type: "post",
						            success: function(res){
						            	resolve();
						            },
						            error: function(e){
						            	console.log('Error hapus aktivitas!', e, aktivitas);
						            	resolve();
						            }
								});
				            }
						});
					}else{
		    			relayAjax({
							url: url_form_delete,
							headers: {"x-csrf-token": _token},
							type: "post",
				            success: function(res){
			        			resolve();
				            },
				            error: function(e){
				            	console.log('Error hapus aktivitas!', e, aktivitas);
			        			resolve();
				            }
						});
		    		}
		        });
	        });
		});
	});
}

function singkron_rka_ke_lokal(){
	window.sub_keg_fmis_update = {};
	window.keg_fmis_update = {};
	window.prog_fmis_update = {};
	window.aktivitas_fmis_update = {};
	var daftar_sub = '';
	get_list_program()
	.then(function(program_exist){
		if(program_exist.data.length >= 1){
	        run_script('program_destroy');
			var last = program_exist.data.length - 1;
			program_exist.data.reduce(function(sequence, nextData){
	            return sequence.then(function(program){
	        		return new Promise(function(resolve_reduce, reject_reduce){
	        			program.uraian = removeNewlines(program.uraian);
						var keyword = program.DT_RowId;
						prog_fmis_update[keyword] = program;
						get_list_kegiatan(program)
        				.then(function(kegiatan_exist){
        					if(kegiatan_exist.data.length >= 1){
								var last2 = kegiatan_exist.data.length - 1;
								kegiatan_exist.data.reduce(function(sequence2, nextData2){
						            return sequence2.then(function(kegiatan){
						            	return new Promise(function(resolve_reduce2, reject_reduce2){
						            		kegiatan.uraian = removeNewlines(kegiatan.uraian);
											var keyword = program.DT_RowId+'-'+kegiatan.DT_RowId;
											keg_fmis_update[keyword] = kegiatan;
							        		get_list_sub_kegiatan(kegiatan)
											.then(function(sub_kegiatan){
												if(sub_kegiatan.data.length >= 1){
													var last3 = sub_kegiatan.data.length - 1;
													sub_kegiatan.data.reduce(function(sequence3, nextData3){
											            return sequence3.then(function(sub_keg_fmis){
											            	return new Promise(function(resolve_reduce3, reject_reduce3){
																var keyword = program.DT_RowId+'-'+kegiatan.DT_RowId+'-'+sub_keg_fmis.DT_RowId;
																sub_keg_fmis_update[keyword] = sub_keg_fmis;
																get_list_aktivitas(sub_keg_fmis)
																.then(function(aktivitas_exist){
																	kirim_data_rka_ke_lokal(aktivitas_exist, sub_keg_fmis)
																	.then(function(){
																		return resolve_reduce3(nextData3);
																	});
																});
											            	})
												            .catch(function(e){
												                console.log(e);
												                return Promise.resolve(nextData3);
												            });
											            })
											            .catch(function(e){
											                console.log(e);
											                return Promise.resolve(nextData3);
											            });
											        }, Promise.resolve(sub_kegiatan.data[last3]))
											        .then(function(data_last){
											        	resolve_reduce2(nextData2);
											        });
								            	}else{
													console.log('sub_kegiatan kosong', sub_kegiatan.data);
													resolve_reduce2(nextData2);
								            	}
											});
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
						        }, Promise.resolve(kegiatan_exist.data[last2]))
						        .then(function(data_last){
						        	resolve_reduce(nextData);
						        });
							}else{
								console.log('kegiatan_exist kosong', kegiatan_exist.data);
								resolve_reduce(nextData);
							}
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
	        }, Promise.resolve(program_exist.data[last]))
	        .then(function(data_last){
				hide_loading();
	        });
		}else{
			console.log('program_exist kosong', program_exist.data);
			alert('Program kosong!');
		}
	});
}

function kirim_data_rka_ke_lokal(aktivitas_exist, sub_keg_fmis){
	var pagu_rincian = 0;
	return new Promise(function(resolve3, reject3){
		var pagu_sub_keg_sipd = {};
		var sendData = aktivitas_exist.data.map(function(b, i){
			return new Promise(function(resolve4, reject4){
				if(!pagu_sub_keg_sipd[b.idsubunit]){
					pagu_sub_keg_sipd[b.idsubunit] = {
						idsubunit: b.idsubunit,
						idunit: b.idunit,
						sub_kegiatan: removeNewlines(sub_keg_fmis.uraian),
						kegiatan: removeNewlines(sub_keg_fmis.nmkegiatan),
						program: removeNewlines(sub_keg_fmis.nmprogram),
						rincian: [],
						total: 0
					};
				}
				var id_aktivitas = b.DT_RowId.split('row_aktivitas_')[1];
				get_rka_aktivitas(b)
				.then(function(rka){
					rka.data.map(function(d, n){
						pagu_rincian += to_number(d.jumlah);
						pagu_sub_keg_sipd[b.idsubunit].total += to_number(d.jumlah);
						d.action = '';
						d.idaktivitas = id_aktivitas;
						d.aktivitas = b.uraian;
						d.jumlah = to_number(d.jumlah);
						d.harga = to_number(d.harga);
						pagu_sub_keg_sipd[b.idsubunit].rincian.push(d);
					});
					resolve4();
				});
			});
		});
		Promise.all(sendData)
		.then(function(){
			var nama_sub_giat = sub_keg_fmis.uraian;
			pesan_loading('Kirim data ke lokal RINCIAN SUB KEGIATAN '+nama_sub_giat, true);
			// send data pagu sub keg fmis ke wp-sipd
			var data = {
			    message:{
			        type: "get-url",
			        content: {
					    url: config.url_server_lokal,
					    type: 'post',
					    data: { 
							action: 'singkronisasi_total_sub_keg_fmis',
							tahun_anggaran: config.tahun_anggaran,
							api_key: config.api_key,
							data: pagu_sub_keg_sipd
						},
		    			return: false
					}
			    }
			};
			chrome.runtime.sendMessage(data, function(response) {
			    console.log('responeMessage', response);
			});

			var data_post = {
				_token: _token,
				_method: 'PUT',
				kdurut: sub_keg_fmis.kdurut,
				idsubkegiatan: sub_keg_fmis.idsubkegiatan,
				uraian: nama_sub_giat,
				pagu_tahun1: to_number(sub_keg_fmis.pagu_tahun1),
				pagu_tahun2: Math.round(pagu_rincian),
				pagu_tahun3: to_number(sub_keg_fmis.pagu_tahun3)
			};
			new Promise(function(resolve4, reject4){
				if(_type_singkronisasi_rka == 'rka-opd'){
					var code_subkegiatan = sub_keg_fmis.action.split('data-code="')[1].split('"')[0];
					relayAjax({
						url: config.fmis_url+'/anggaran/rka-opd/subkegiatan/form?code='+code_subkegiatan+'&action=edit',
						success: function(form_edit){
							var form = jQuery(form_edit.form);
							data_post.bln1 = 1;
							data_post.bln2 = 12;
							data_post.status_pelaksanaan = sub_keg_fmis.status_pelaksanaan;
							data_post.idrapbdrkasubkegiatan = form.find('input[name="idrapbdrkasubkegiatan"]').val();
							data_post.idrapbdrkakegiatan = form.find('input[name="idrapbdrkakegiatan"]').val();
							var url = form.attr('action');
    						resolve4(url);
    					}
    				});
				}else{
					var url = config.fmis_url+'/perencanaan-tahunan/renja-murni/subkegiatan/update/'+sub_keg_fmis.idrkpdrenjasubkegiatan;
					resolve4(url);
				}
			})
			.then(function(url_proses){
				pesan_loading('UPDATE PAGU RINCIAN SUB KEGIATAN '+nama_sub_giat, true);
				relayAjax({
					url: url_proses,
					type: "post",
		            data: data_post,
		            success: function(res){
						resolve3();
		            },
		            error: function(e){
		            	console.log('Error update sub kegiatan!', e, this.data);
		            }
				});
			});
		})
	});
}

function ganti_nama_aktivitas(){
	show_loading();
	var aktivitas_selected = [];
	jQuery('#konfirmasi-program tbody tr input[type="checkbox"]').map(function(i, b){
		var cek = jQuery(b).is(':checked');
		if(cek){
			var keyword_selected = jQuery(b).val();
			for(var keyword in aktivitas_fmis_update){
				if(keyword == keyword_selected){
					aktivitas_selected.push(aktivitas_fmis_update[keyword]);
				}
			}
		}
	});
	if(aktivitas_selected.length >= 1){
		var aktivitas_baru = prompt('Masukan nama aktivitas baru!', aktivitas_selected[0].uraian);
		if(aktivitas_baru == ''){
			hide_loading();
			return alert('Nama Aktivitas tidak boleh kosong!');
		}
		console.log('update aktivitas', aktivitas_selected);
		var last = aktivitas_selected.length - 1;
		aktivitas_selected.reduce(function(sequence, nextData){
            return sequence.then(function(aktivitas_exist_update){
        		return new Promise(function(resolve_reduce, reject_reduce){
        			var data_post = {
        				_token: _token,
        				uraian: aktivitas_baru,
        				idsubunit: aktivitas_exist_update.idsubunit,
        				idsumberdana1: aktivitas_exist_update.idsumberdana1,
        				idsumberdana2: aktivitas_exist_update.idsumberdana2,
        				idsatuan1: aktivitas_exist_update.idsatuan1,
        				idsatuan2: aktivitas_exist_update.idsatuan2,
        				pagu: to_number(aktivitas_exist_update.pagu, true)
        			};
        			data_post._method = 'PUT';
        			data_post.kdurut = aktivitas_exist_update.kdurut;
    				data_post.jn_asb = aktivitas_exist_update.jn_asb;
    				data_post.jn_rkud = aktivitas_exist_update.jn_rkud;
    				data_post.status_luncuran = aktivitas_exist_update.status_luncuran;
    				data_post.idasb = aktivitas_exist_update.idasb;
    				data_post.idpptk = aktivitas_exist_update.idpptk;
    				data_post.volume1 = aktivitas_exist_update.volume1;
    				data_post.volume2 = aktivitas_exist_update.volume2;
		        	data_post.status_pelaksanaan = aktivitas_exist_update.status_pelaksanaan;
					pesan_loading('UPDATE nama AKTIVITAS "'+aktivitas_exist_update.uraian+'" menjadi "'+aktivitas_baru+'" SUBKEGIATAN '+aktivitas_exist_update.kode_subkegiatan+' '+aktivitas_exist_update.nmsubkegiatan, true);
					new Promise(function(resolve, reduce){
        				var code_aktivitas = aktivitas_exist_update.action.split('code=')[1].split('"')[0];
        				relayAjax({
							url: config.fmis_url+'/anggaran/rka-opd/aktivitas/form?code='+code_aktivitas+'&action=edit',
				            success: function(form_edit){
		        				var form = jQuery(form_edit.form);
		        				data_post.idrapbdrkaaktivitas = '';
		        				data_post.idrapbdrkasubkegiatan = form.find('input[name="idrapbdrkasubkegiatan"]').val();
		        				var url = form.attr('action');
		        				resolve(url);
		        			}
		        		});
        			})
        			.then(function(url_simpan){
    					relayAjax({
							url: url_simpan,
							type: "post",
				            data: data_post,
				            success: function(res){
			            		resolve_reduce(nextData);
				            },
				            error: function(e){
				            	console.log('Error save aktivitas!', e, this.data);
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
        }, Promise.resolve(aktivitas_selected[last]))
        .then(function(data_last){
			alert('Berhasil update status aktivitas!');
			hide_loading();
			run_script('program_hide');
        });
	}else{
		alert('Pilih aktivitas dulu!');
		hide_loading();
	}
}