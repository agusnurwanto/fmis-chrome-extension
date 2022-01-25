function formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
  try {
    decimalCount = Math.abs(decimalCount);
    decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

    const negativeSign = amount < 0 ? "-" : "";

    let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
    let j = (i.length > 3) ? i.length % 3 : 0;

    return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
  } catch (e) {
    console.log(e)
  }
};

function show_loading(){
	jQuery('#wrap-loading').show();
	jQuery('#persen-loading').html('');
	jQuery('#persen-loading').attr('persen', '');
	jQuery('#persen-loading').attr('total', '');
}

function hide_loading(){
	jQuery('#wrap-loading').hide();
	jQuery('#persen-loading').html('');
	jQuery('#persen-loading').attr('persen', '');
	jQuery('#persen-loading').attr('total', '');
}

function pesan_loading(pesan, loading=false){
	if(loading){
		pesan = 'LOADING...<br>'+pesan;
	}
	jQuery('#persen-loading').html(pesan);
	console.log(pesan);
}

function run_script(code){
	var script = document.createElement('script');
	script.appendChild(document.createTextNode(code));
	(document.head||document.documentElement).appendChild(script);
	script.parentNode.removeChild(script);
}

function capitalizeFirstLetter(string) {
  	return string.charAt(0).toUpperCase() + string.slice(1);
}

function relayAjax(options, retries=20, delay=5000, timeout=90000){
	options.timeout = timeout;
	options.cache = false;
    jQuery.ajax(options)
    .fail(function(jqXHR, exception){
    	// console.log('jqXHR, exception', jqXHR, exception);
    	if(
    		jqXHR.status != '0' 
    		&& jqXHR.status != '503'
    		&& jqXHR.status != '500'
    	){
    		if(jqXHR.responseJSON){
    			options.success(jqXHR.responseJSON);
    		}else{
    			options.success(jqXHR.responseText);
    		}
    	}else if (retries > 0) {
            console.log('Koneksi error. Coba lagi '+retries, options);
            var new_delay = Math.random() * (delay/1000);
            setTimeout(function(){ 
                relayAjax(options, --retries, delay, timeout);
            }, new_delay * 1000);
        } else {
            alert('Capek. Sudah dicoba berkali-kali error terus. Maaf, berhenti mencoba.');
        }
    });
}

function singkronisasi_ssh(options){
	if(options.status == 'error'){
		alert(options.message);
		hide_loading();
	}else{
		getSatuan({ force: 1 });
		var data_ssh = {};
		window.ssh_all_length = options.data.length;
		window.ssh_golongan_all_length = 0;
		window.ssh_kelompok_all_length = 0;
		window.ssh_sub_kelompok_all_length = 0;
		options.data.map(function(b, i){
			var rek = b.kode_kel_standar_harga.split('.');
			var golongan = rek[0]+'.'+rek[1]+'.'+rek[2]+'.'+rek[3]+'.'+rek[4];
			var kelompok = golongan+'.'+rek[5];
			var sub_kelompok = b.kode_kel_standar_harga;
			var item_ssh = b.kode_standar_harga;
			if(!data_ssh[golongan]){
				data_ssh[golongan] = {
					nama: golongan,
					jenis: b.kelompok,
					data: {}
				}
				ssh_golongan_all_length++;
			}
			if(!data_ssh[golongan].data[kelompok]){
				data_ssh[golongan].data[kelompok] = {
					nama: kelompok,
					jenis: b.kelompok,
					data: {}
				}
				ssh_kelompok_all_length++;
			}
			if(!data_ssh[golongan].data[kelompok].data[sub_kelompok]){
				data_ssh[golongan].data[kelompok].data[sub_kelompok] = {
					nama: sub_kelompok+' '+b.nama_kel_standar_harga,
					jenis: b.kelompok,
					data: {}
				}
				ssh_sub_kelompok_all_length++;
			}
			data_ssh[golongan].data[kelompok].data[sub_kelompok].data[item_ssh] = {
				nama: item_ssh+' '+b.id_standar_harga+' '+b.nama_standar_harga,
				jenis: b.kelompok,
				data: b
			}
		});
		run_script('window.data_ssh = '+JSON.stringify(data_ssh)+'; console.log(data_ssh);');
		var modal_title = jQuery('#modal .modal-title > span').text();
		if(
			typeof modal_title != 'undefined'
			&& modal_title == 'Tambah Data Tarif Item'
		){
			singkronisasi_ssh_tarif(options.data);
		}else{
			relayAjax({
				url: config.fmis_url+'/parameter/ssh/struktur-ssh/golongan/datatable',
				success: function(golongan){
					var data_all = [];
					var no_urut_golongan = 0;
					for(var gol_id in data_ssh){
						var nama_golongan = data_ssh[gol_id].nama;
						var jns_golongan = data_ssh[gol_id].jenis;
						if(
							jns_golongan == 1
							|| jns_golongan == 2
							|| jns_golongan == 3
							|| jns_golongan == 4
						){
							var jns_ssh = 1;
						}else{
							continue;
						}
						var cek = false;
						golongan.data.map(function(b, i){
							if(b.uraian == nama_golongan){
								cek = true;
							}
							if(no_urut_golongan < +b.kdurut){
								no_urut_golongan = +b.kdurut;
							}
						});
						if(cek == false){
							no_urut_golongan++;
							data_all.push({
								url: config.fmis_url+'/parameter/ssh/struktur-ssh/golongan/save',
					            type: "post",
					            data: {
					                _token: _token,
					                kdurut: no_urut_golongan,
					                jns_ssh: jns_ssh,
					                uraian: nama_golongan
					            }
							});
						}
					}
					jQuery('#persen-loading').attr('persen', 0);
					var last = data_all.length - 1;
					data_all.reduce(function(sequence, nextData){
	                    return sequence.then(function(current_data){
	                		return new Promise(function(resolve_reduce, reject_reduce){
			                	current_data.success = function(data){
			                		var c_persen = +jQuery('#persen-loading').attr('persen');
	                				c_persen++;
									jQuery('#persen-loading').attr('persen', c_persen);
									pesan_loading(((c_persen/data_all.length)*100).toFixed(2)+'% SAVE GOLONGAN'+'<br>'+current_data.data.uraian);
									return resolve_reduce(nextData);
								};
								current_data.error = function(e) {
									console.log(e);
								};
			                	relayAjax(current_data);
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
	                }, Promise.resolve(data_all[last]))
	                .then(function(data_last){
	            		run_script("initDatatable('golongan');");
						singkronisasi_ssh_kelompok(data_ssh);
	                })
	                .catch(function(e){
	                    console.log(e);
	                });	
				}
			});
		}
	}
}

function get_id_ssh(text){
	var _text = text.split(' ');
	var ret = text;
	if(_text[1]){
		ret = _text[0]+' '+_text[1];
	}
	return ret;
}

function singkronisasi_ssh_tarif(data_ssh){
	var url_save_form = jQuery('#form').attr('action');
	var form_code = url_save_form.split('/save/')[1];
	var idssh_fmis = jQuery('#form .form-referensi > label').attr('for');
	relayAjax({
		url: config.fmis_url+'/parameter/ssh/perkada-ssh/datatable-ref?code='+form_code+'&action=add',
		success: function(items){
			var all_ssh = {};
			data_ssh.map(function(b, i){
				var id_ssh = b.kode_standar_harga+' '+b.id_standar_harga;
				all_ssh[id_ssh] = b;
			});
			console.log(all_ssh);
            var no = 0;
            var _leng = 100;
            var _data_all = [];
			var _data = [];
			items.data.map(function(b, i){
				var id_ssh = get_id_ssh(b.uraian);
				if(all_ssh[id_ssh]){
					b.harga = all_ssh[id_ssh].harga;
					_data.push(b);
					if((i+1)%_leng == 0){
						_data_all.push(_data);
						_data = [];
					}
				}else{
					console.log('Uraian item SSH tidak ditemukan!', b.uraian);
				}
			});
			if(_data.length > 0){
				_data_all.push(_data);
			}
			jQuery('#persen-loading').attr('persen', 0);
			var last = _data_all.length - 1;
			_data_all.reduce(function(sequence, nextData){
	            return sequence.then(function(current_data){
	        		return new Promise(function(resolve_reduce, reject_reduce){
						var c_persen = +jQuery('#persen-loading').attr('persen');
        				c_persen++;
						jQuery('#persen-loading').attr('persen', c_persen);
						pesan_loading(((c_persen/_data_all.length)*100).toFixed(2)+'%'+'<br>SET TARIF ITEM SSH');
						var data_post = {
			                _token: _token,
			                _method: 'PUT',
			                'table-referensi_length': 10,
			                nilai: {},
			                idperkadatarif: {}
			            };
			            data_post[idssh_fmis] = {};
	        			current_data.map(function(b, i){
							var id_fmis = b.nilai.split('idperkadatarif[')[1].split(']')[0];
							data_post.nilai[id_fmis] = b.harga+',00';
							data_post.idperkadatarif[id_fmis] = '';
							data_post[idssh_fmis][id_fmis] = id_fmis;
							no++;
	        			});
				        // console.log('data_post', no, data_post);
						relayAjax({
							url: url_save_form,
							type: "post",
				            data: data_post,
							success: function(items){
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
	        }, Promise.resolve(_data_all[last]))
	        .then(function(data_last){
				jQuery('#modal .btn.btn-secondary.ml-1').click();
				hide_loading();
				pesan_loading('');
				jQuery('#persen-loading').attr('persen', '');
				jQuery('#persen-loading').attr('total', '');
				alert('Berhasil singkroniasi tarif SSH!');
	        })
	        .catch(function(e){
	            console.log(e);
	        });
		}
	});
}

function singkronisasi_ssh_kelompok(data_ssh){
	relayAjax({
		url: config.fmis_url+'/parameter/ssh/struktur-ssh/golongan/datatable',
		success: function(golongan){
			var data_all = [];
			var sendData = [];
			for(var gol_id in data_ssh){
				var nama_golongan = data_ssh[gol_id].nama;
				var kode_golongan = '';
				golongan.data.map(function(b, i){
					if(b.uraian == nama_golongan){
						kode_golongan = b.action.split('code="')[1].split('"')[0];
					}
				});
				if(kode_golongan != ''){
					data_ssh[gol_id].code = kode_golongan;
					sendData.push(new Promise(function(resolve, reject){
						relayAjax({
							url: config.fmis_url+'/parameter/ssh/struktur-ssh/kelompok/datatable?code='+data_ssh[gol_id].code+'&gol_id='+gol_id,
							success: function(kelompok){
								var _gol_id = this.url.split('&gol_id=')[1].split('&')[0];
								// console.log('gol_id', _gol_id, data_ssh[_gol_id]);
								var no_urut_kelompok = 0;
								pesan_loading('GET KELOMPOK DARI GOLONGAN '+data_ssh[_gol_id].nama, true);
								for(var kelompok_id in data_ssh[_gol_id].data){
									var nama_kelompok = data_ssh[_gol_id].data[kelompok_id].nama;
									var cek = false;
									kelompok.data.map(function(b, i){
										if(b.uraian == nama_kelompok){
											cek = true;
										}
										if(no_urut_kelompok < +b.kdurut){
											no_urut_kelompok = +b.kdurut;
										}
									});
									if(cek == false){
										no_urut_kelompok++;
										data_all.push({
											url: config.fmis_url+'/parameter/ssh/struktur-ssh/kelompok/save/'+data_ssh[_gol_id].code,
								            type: "post",
								            data: {
								                _token: _token,
								                kdurut: no_urut_kelompok,
								                uraian: nama_kelompok
								            }
										});
									}
								}
								resolve();
							}
						});
					}));
				}
			}
			Promise.all(sendData)
        	.then(function(val_all){
				// console.log('data_all kelompok', data_all);
				jQuery('#persen-loading').attr('persen', 0);
				var last = data_all.length - 1;
				data_all.reduce(function(sequence, nextData){
	                return sequence.then(function(current_data){
	            		return new Promise(function(resolve_reduce, reject_reduce){
		                	current_data.success = function(data){
		                		var c_persen = +jQuery('#persen-loading').attr('persen');
							    c_persen++;
								jQuery('#persen-loading').attr('persen', c_persen);
								pesan_loading(((c_persen/data_all.length)*100).toFixed(2)+'% SAVE KELOMPOK'+'<br>'+current_data.data.uraian);
								return resolve_reduce(nextData);
							};
							current_data.error = function(e) {
								console.log('Error save kelompok', e, this.data);
							};
		                	relayAjax(current_data);
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
	            }, Promise.resolve(data_all[last]))
	            .then(function(data_last){
	            	singkronisasi_ssh_sub_kelompok(data_ssh);
	            })
	            .catch(function(e){
	                console.log(e);
	            });
            })
            .catch(function(err){
                console.log('err', err);
        		alert('Ada kesalahan sistem!');
        		hide_loading();
            });
		}
	})
}

function singkronisasi_ssh_sub_kelompok(data_ssh){
	var data_all = [];
	var sendData = [];
	for(var gol_id in data_ssh){
		var nama_golongan = data_ssh[gol_id].nama;
		if(data_ssh[gol_id].code){
			sendData.push(new Promise(function(resolve, reject){
				relayAjax({
					url: config.fmis_url+'/parameter/ssh/struktur-ssh/kelompok/datatable?code='+data_ssh[gol_id].code+'&gol_id='+gol_id,
					success: function(kelompok){
						// console.log('gol_id', _gol_id);
						var _gol_id = this.url.split('&gol_id=')[1].split('&')[0];
						var sendDataSub = [];
						for(var kelompok_id in data_ssh[_gol_id].data){
							var nama_kelompok = data_ssh[_gol_id].data[kelompok_id].nama;
							var kode_kelompok = '';
							kelompok.data.map(function(b, i){
								if(b.uraian == nama_kelompok){
									kode_kelompok = b.action.split('code="')[1].split('"')[0];
								}
							});
							if(kode_kelompok != ''){
								data_ssh[_gol_id].data[kelompok_id].code = kode_kelompok;
								sendDataSub.push(new Promise(function(resolve2, reject2){
								relayAjax({
									url: config.fmis_url+'/parameter/ssh/struktur-ssh/subkelompok/datatable?code='+data_ssh[_gol_id].data[kelompok_id].code+'&gol_id='+_gol_id+'&kelompok_id='+kelompok_id,
									success: function(subkelompok){
										var __gol_id = this.url.split('&gol_id=')[1].split('&')[0];
										var _kelompok_id = this.url.split('&kelompok_id=')[1].split('&')[0];
										pesan_loading('GET SUB KELOMPOK DARI KELOMPOK '+data_ssh[__gol_id].data[_kelompok_id].nama, true);
										var no_urut_subkelompok = 0;
										for(var subkelompok_id in data_ssh[__gol_id].data[_kelompok_id].data){
											var nama_subkelompok = replace_string(data_ssh[__gol_id].data[_kelompok_id].data[subkelompok_id].nama, true);
											var cek = false;
											subkelompok.data.map(function(b, i){
												if(replace_string(b.uraian, true) == nama_subkelompok){
													cek = true;
												}
												if(no_urut_subkelompok < +b.kdurut){
													no_urut_subkelompok = +b.kdurut;
												}
											});
											if(cek == false){
												no_urut_subkelompok++;
												data_all.push({
													url: config.fmis_url+'/parameter/ssh/struktur-ssh/subkelompok/save/'+data_ssh[__gol_id].data[_kelompok_id].code,
										            type: "post",
										            data: {
										                _token: _token,
										                kdurut: no_urut_subkelompok,
										                uraian: nama_subkelompok
										            }
												});
											}
										}
										resolve2();
									}
								});
							}));
							}
						}
						Promise.all(sendDataSub)
						.then(function(val_all){
							resolve();
					    })
					    .catch(function(err){
					        console.log('err', err);
							alert('Ada kesalahan sistem!');
							hide_loading();
					    });
					}
				});
			}));
		}
	}
	Promise.all(sendData)
	.then(function(val_all){
		// console.log('data_all kelompok', data_all);
		jQuery('#persen-loading').attr('persen', 0);
		var last = data_all.length - 1;
		data_all.reduce(function(sequence, nextData){
            return sequence.then(function(current_data){
        		return new Promise(function(resolve_reduce, reject_reduce){
                	current_data.success = function(data){
                		var c_persen = +jQuery('#persen-loading').attr('persen');
					    c_persen++;
						jQuery('#persen-loading').attr('persen', c_persen);
						pesan_loading(((c_persen/data_all.length)*100).toFixed(2)+'% SAVE SUB KELOMPOK'+'<br>'+current_data.data.uraian);
						return resolve_reduce(nextData);
					};
					current_data.error = function(e) {
						console.log('Error insert sub kelompok', e, this.data);
					};
                	relayAjax(current_data);
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
        }, Promise.resolve(data_all[last]))
        .then(function(data_last){
			singkronisasi_ssh_item(data_ssh);
        })
        .catch(function(e){
            console.log(e);
        });
    })
    .catch(function(err){
        console.log('err', err);
		alert('Ada kesalahan sistem!');
		hide_loading();
    });
}

function singkronisasi_ssh_item(data_ssh){
	var data_all = [];
	var sendData = [];
	for(var gol_id in data_ssh){
		var nama_golongan = data_ssh[gol_id].nama;
		if(data_ssh[gol_id].code){
			for(var kelompok_id in data_ssh[gol_id].data){
				if(data_ssh[gol_id].data[kelompok_id].code){
					sendData.push(new Promise(function(resolve, reject){
						relayAjax({
							url: config.fmis_url+'/parameter/ssh/struktur-ssh/subkelompok/datatable?code='+data_ssh[gol_id].data[kelompok_id].code+'&gol_id='+gol_id+'&kelompok_id='+kelompok_id,
							success: function(subkelompok){
								// console.log('gol_id', _gol_id);
								var _gol_id = this.url.split('&gol_id=')[1].split('&')[0];
								var _kelompok_id = this.url.split('&kelompok_id=')[1].split('&')[0];
								var sendDataSub = [];
								for(var subkelompok_id in data_ssh[_gol_id].data[_kelompok_id].data){
									var nama_subkelompok = data_ssh[_gol_id].data[_kelompok_id].data[subkelompok_id].nama;
									var kode_subkelompok = '';
									subkelompok.data.map(function(b, i){
										if(replace_string(b.uraian, true) == nama_subkelompok){
											kode_subkelompok = b.action.split('code="')[1].split('"')[0];
										}
									});
									if(kode_subkelompok != ''){
										data_ssh[_gol_id].data[_kelompok_id].data[subkelompok_id].code = kode_subkelompok;
										sendDataSub.push(new Promise(function(resolve2, reject2){
											relayAjax({
												url: config.fmis_url+'/parameter/ssh/struktur-ssh/item/datatable?code='+kode_subkelompok+'&gol_id='+_gol_id+'&kelompok_id='+_kelompok_id+'&subkelompok_id='+subkelompok_id,
												success: function(item){
													var __gol_id = this.url.split('&gol_id=')[1].split('&')[0];
													var __kelompok_id = this.url.split('&kelompok_id=')[1].split('&')[0];
													var __subkelompok_id = this.url.split('&subkelompok_id=')[1].split('&')[0];
													var no_urut_item = 0;
													var sendDataSatuan = [];
													pesan_loading('GET ITEM SSH DARI SUB KELOMPOK '+data_ssh[__gol_id].data[__kelompok_id].data[__subkelompok_id].nama, true);
													for(var item_id in data_ssh[__gol_id].data[__kelompok_id].data[__subkelompok_id].data){
														var nama_item = replace_string(data_ssh[__gol_id].data[__kelompok_id].data[__subkelompok_id].data[item_id].nama, true).substring(0, 250).trim();
														var cek = false;
														item.data.map(function(b, i){
															var id_ssh_fmis = get_id_ssh(b.uraian);
															var id_ssh_sipd = get_id_ssh(nama_item);
															if(id_ssh_fmis == id_ssh_sipd){
																cek = true;
															}
															if(no_urut_item < +b.kdurut){
																no_urut_item = +b.kdurut;
															}
														});
														if(cek == false){
															no_urut_item++;
															var keterangan_item = replace_string(data_ssh[__gol_id].data[__kelompok_id].data[__subkelompok_id].data[item_id].data.spek, true);
															var satuan_asli = data_ssh[__gol_id].data[__kelompok_id].data[__subkelompok_id].data[item_id].data.satuan.toLowerCase().trim();
															if(satuan_asli == ''){
																satuan_asli = 'kosong';
															}
															var satuan = satuan_asli+' ('+satuan_asli+')';
															sendDataSatuan.push(new Promise(function(resolve3, reject3){
																getIdSatuan(satuan_asli, false, {
																	url: config.fmis_url+'/parameter/ssh/struktur-ssh/item/save/'+data_ssh[__gol_id].data[__kelompok_id].data[__subkelompok_id].code,
														            type: "post",
														            data: {
														                _token: _token,
														                kdurut: no_urut_item,
														                uraian: nama_item,
														                spesifikasi: keterangan_item,
														                uraian_satuan: satuan,
														                status: 1
														            }
																}).then(function(val){
																	data_all.push(val);
																	resolve3();
																});
															}));
														}
													}
													Promise.all(sendDataSatuan)
													.then(function(val_all){
														resolve2();
												    })
												    .catch(function(err){
												        console.log('err', err);
														resolve2();
												    });
												}
											});
										}));
									}
								}
								Promise.all(sendDataSub)
								.then(function(val_all){
									resolve();
							    })
							    .catch(function(err){
							        console.log('err', err);
									alert('Ada kesalahan sistem!');
									hide_loading();
							    });
							}
						});
					}));

				}
			}
		}
	}
	Promise.all(sendData)
	.then(function(val_all){
		var _leng = 5;
		var _data_all = [];
		var _data = [];
		data_all.map(function(ssh, i){
			_data.push(ssh);
			if((i+1)%_leng == 0){
				_data_all.push(_data);
				_data = [];
			}
		});
		if(_data.length > 0){
			_data_all.push(_data);
		}

		jQuery('#persen-loading').attr('persen', 0);
		var last = _data_all.length - 1;
		_data_all.reduce(function(sequence, nextData){
            return sequence.then(function(current_data){
        		return new Promise(function(resolve_reduce, reject_reduce){
        			var sendData = current_data.map(function(ssh, i){
        				return new Promise(function(resolve_reduce2, reject_reduce2){
	                		var c_persen = +jQuery('#persen-loading').attr('persen');
            				c_persen++;
							jQuery('#persen-loading').attr('persen', c_persen);
							pesan_loading(((c_persen/data_all.length)*100).toFixed(2)+'% SAVE ITEM SSH'+'<br>'+ssh.data.uraian);
		                	ssh.success = function(data){
								return resolve_reduce2();
							};
							ssh.error = function(e) {
								console.log('ERROR insert ssh', e, ssh.data);
							};
		                	relayAjax(ssh);
		                });
	                });
	                Promise.all(sendData)
					.then(function(val_all){
						resolve_reduce(nextData);
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
        }, Promise.resolve(_data_all[last]))
        .then(function(data_last){
			singkronisasi_ssh_rekening(data_ssh);
        })
        .catch(function(e){
            console.log(e);
        });
    })
    .catch(function(err){
        console.log('err', err);
		alert('Ada kesalahan sistem!');
		hide_loading();
    });
}

function singkronisasi_ssh_rekening(data_ssh){
	var sendData = [];
	var sendDataSub = [];
	jQuery('#persen-loading').attr('persen', 0);
	for(var gol_id in data_ssh){
		var nama_golongan = data_ssh[gol_id].nama;
		if(data_ssh[gol_id].code){
			for(var kelompok_id in data_ssh[gol_id].data){
				if(data_ssh[gol_id].data[kelompok_id].code){
					for(var subkelompok_id in data_ssh[gol_id].data[kelompok_id].data){
						if(data_ssh[gol_id].data[kelompok_id].data[subkelompok_id].code){
							sendData.push({
								param: {
									code: data_ssh[gol_id].data[kelompok_id].data[subkelompok_id].code,
									gol_id: gol_id,
									kelompok_id: kelompok_id,
									subkelompok_id: subkelompok_id,
									subkelompok: data_ssh[gol_id].data[kelompok_id].data[subkelompok_id]
								},
								cb: function(ret, ret_cb){
									relayAjax({
										url: config.fmis_url+'/parameter/ssh/struktur-ssh/item/datatable?code='+ret.code+'&gol_id='+ret.gol_id+'&kelompok_id='+ret.kelompok_id+'&subkelompok_id='+ret.subkelompok_id,
										success: function(item){
											var _gol_id = this.url.split('&gol_id=')[1].split('&')[0];
											var _kelompok_id = this.url.split('&kelompok_id=')[1].split('&')[0];
											var _subkelompok_id = this.url.split('&subkelompok_id=')[1].split('&')[0];
											for(var item_id in ret.subkelompok.data){
												var nama_item = ret.subkelompok.data[item_id].nama;
												var kode_item = false;
												item.data.map(function(b, i){
													var id_ssh_fmis = get_id_ssh(b.uraian);
													var id_ssh_sipd = get_id_ssh(nama_item);
													if(id_ssh_fmis == id_ssh_sipd){
														kode_item = b.action.split('code="')[1].split('"')[0];
													}
												});
												if(kode_item != false){
													ret.subkelompok.data[item_id].code = kode_item;
													sendDataSub.push({
														param: {
															data: ret.subkelompok.data[item_id]
														},
														cb: function(ret2, ret_cb2){
															set_rekening_ssh(ret2.data).then(function(){
																var c_persen = +jQuery('#persen-loading').attr('persen');
								                				c_persen++;
																jQuery('#persen-loading').attr('persen', c_persen);
																pesan_loading(((c_persen/ssh_all_length)*100).toFixed(2)+'% SET REKENING ITEM SSH'+'<br>'+ret2.data.nama);
																ret_cb2();
															});
														}
													});
												}else{
													console.log('Item SSH SIPD tidak ditemukan di FMIS untuk proses SET REKENING SSH ',nama_item);
												}
											}
											ret_cb();
										}
									});
								}
							});
						}
					}
				}
			}
		}
	}
	reduce_promise(sendData, function(val_all){
		reduce_promise(sendDataSub, function(val_all){
			hide_loading();
			pesan_loading('');
			jQuery('#persen-loading').attr('persen', '');
			jQuery('#persen-loading').attr('total', '');
			console.log('Berhasil singkron SSH dari SIPD!');
			alert('Berhasil singkron SSH dari SIPD!');
	    }, 5);
    }, 50);
}

function reduce_promise(data_all, cb, _leng=false){
	if(!_leng){
		_leng = 10;
	}
	var _data_all = [];
	var _data = [];
	data_all.map(function(ssh, i){
		_data.push(ssh);
		if((i+1)%_leng == 0){
			_data_all.push(_data);
			_data = [];
		}
	});
	if(_data.length > 0){
		_data_all.push(_data);
	}

	var last = _data_all.length - 1;
	_data_all.reduce(function(sequence, nextData){
        return sequence.then(function(current_data){
    		return new Promise(function(resolve_reduce, reject_reduce){
				var sendData = current_data.map(function(data, i){
    				return new Promise(function(resolve_reduce2, reject_reduce2){
    					// console.log('data', data);
		    			data.cb(data.param, function(){
							resolve_reduce2();
						});
	                });
                });
                Promise.all(sendData)
				.then(function(val_all){
					resolve_reduce(nextData);
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
    }, Promise.resolve(_data_all[last]))
    .then(function(data_last){
		cb();
    })
    .catch(function(e){
        console.log(e);
    });
}

function set_rekening_ssh(options){
	return new Promise(function(resolve2, reject2){
		relayAjax({
			url: config.fmis_url+'/parameter/ssh/struktur-ssh/rekening/datatable?code='+options.code,
			success: function(rekening){
				var data_post = {
	                _token: _token,
	                'table-rekening-ref_length': 10,
	                kdrek: []
	            };
	            getMasterRek().then(function(rek_master){
		            var rek_sipd_detail = [];
		            var tahun = getTahun();
					options.data.rek_belanja.map(function(rek, i){
						var rek_sipd = [];
						rek.kode_akun.split('.').map(function(b, n){
							rek_sipd.push(+b);
						});
						rek_sipd = rek_sipd.join('.');
						var cek = false;
						rekening.data.map(function(b, n){
							if(rek_sipd == b.kdrek){
								cek = true;
							}
						});
						if(cek == false){
							if(rek_master[rek_sipd]){
								data_post.kdrek.push(tahun+'.'+rek_sipd);
								rek_sipd_detail.push(rek);
							}else{
								console.warn('Rekening SIPD tidak ada di master FMIS', rek);
							}
						}
					});
					if(data_post.kdrek.length >= 1){
						// get code from generate form
						relayAjax({
							url: config.fmis_url+'/parameter/ssh/struktur-ssh/rekening/form?action=create&code='+options.code,
							success: function(detail_ssh){
								var url_save = detail_ssh.form.split('action=\"')[1].split('\"')[0];
								// simpan rekening baru
								relayAjax({
									url: url_save,
									type: "post",
						            data: data_post,
						            success: function(res){
						            	resolve2();
						            },
						            error: function(e){
						            	console.log('Error set rekening SSH', e, this.data, rek_sipd_detail);
						            }
								});
							}
						});
					}else{
						resolve2();
					}
				});
			}
		});
	});
}

function getMasterRek() {
	return new Promise(function(resolve, reject){
		if(typeof rekening_master != 'undefined'){
			resolve(rekening_master);
		}else{
			relayAjax({
				url: config.fmis_url+'/parameter/rekening/datatable-rekening',
				type: "post",
	            data: {
	                _token: _token,
	                kdrek1: '4,5,6',
	                exclude_table: 'ref_ssh_rekening',
	                tahun: config.tahun_anggaran
	            },
				success: function(rek){
					window.rekening_master = {};
					rek.data.map(function(b, i){
						rekening_master[b.kdrek] = b;
					});
					resolve(rekening_master);
				}
			});
		}
	});
}

function getTahun(){
	return jQuery('.nav-link button.waves-light.dropdown-toggle strong').text();
}

function replace_string(text, no_lowercase=false, no_replace=false){
	if(no_lowercase){
		text = jQuery('<textarea />').html(text.trim()).text();
	}else{
		text = jQuery('<textarea />').html(text.toLowerCase().trim()).text();	
	}
	if(!no_replace){
		text = text.replace(/³/g, '3');
		text = text.replace(/²/g, '2');
		text = text.replace(/'/g, '`');
	}
	return text.trim();
}

function getIdSatuan(satuan, force, val_cb){
	satuan = replace_string(satuan).substring(0, 50).trim();
	var singkatan_sipd = satuan.substring(0, 30).trim();
	return new Promise(function(resolve, reject){
		getSatuan({ force: force }).then(function(satuan_fmis){
			var id_satuan = 0;
			var uraian_satuan = '';
			satuan_fmis.map(function(b, i){
				var uraian = replace_string(b.uraian);
				var singkatan = replace_string(b.singkatan);
				if(
					singkatan_sipd == singkatan
					|| satuan == uraian
				){
					id_satuan = b.action.split('data-id=\"')[1].split('"')[0];
					uraian_satuan = replace_string(b.uraian, false, true)+' ('+replace_string(b.singkatan, false, true)+')';
				}
			});
			if(
				id_satuan == 0
				&& force == false
			){
				getIdSatuan(satuan, 1, val_cb).then(function(val_cb){
					resolve(val_cb);
				});
			}else if(id_satuan == 0){
				relayAjax({
					url: config.fmis_url + '/parameter/satuan/store',
					type: "post",
		            data: {
		                _token: _token,
		                _method: 'POST',
		                uraian: satuan,
		                singkatan: singkatan_sipd
		            },
					success: function(data){
						getIdSatuan(satuan, 1, val_cb).then(function(val_cb){
							resolve(val_cb);
						});
					},
					error: function(e){
						console.log(e, this.data);
						getIdSatuan(satuan, 1, val_cb).then(function(val_cb){
							resolve(val_cb);
						});
					}
				});
			}else{
				val_cb.data.idsatuan = id_satuan;
				val_cb.data.uraian_satuan = uraian_satuan;
				resolve(val_cb);
			}
		});
    })
    .catch(function(e){
        console.log(e);
        return Promise.resolve(0);
    });
}

function getSatuan(options){
	return new Promise(function(resolve, reject){
		if(
			typeof satuan_all == 'undefined'
			|| options.force == 1
		){
			relayAjax({
				url: config.fmis_url + '/parameter/satuan/datatable-satuan',
				success: function(data){
					window.satuan_all = data.data;
					resolve(satuan_all);
				}
			});
		}else{
			resolve(satuan_all);
		}
    })
    .catch(function(e){
        console.log(e);
        return Promise.resolve([]);
    });
}

function intervalSession(no){
	if(!_token){
		return;
	}else{
		if(!no){
			no = 0;
		}
		relayAjax({
			url: config.fmis_url + '/dashboard',
			success: function(html){
				no++;
				// console.log('Interval session per 60s ke '+no);
				setTimeout(function(){
					intervalSession(no);
				}, 60000);
			}
		});
	}
}

function detele_all_tarif(subkelompok_code, code_perkada, cb){
	if(
		subkelompok_code == ''
		|| code_perkada == ''
	){
		alert('Code sub kelompok tidak ditemukan!');
	}else{
		if(
			typeof cb == 'function'
			|| confirm('Apakah anda yakin untuk menghapus semua tarif SSH di sub kelompok ini?')
		){
			if(typeof cb != 'function'){
				show_loading();
			}
			relayAjax({
				url: config.fmis_url+'/parameter/ssh/perkada-ssh/tarif/datatable?code='+subkelompok_code+'&code_perkada='+code_perkada,
				success: function(items){
					var _leng = 50;
					var _data_all = [];
					var _data = [];
					items.data.map(function(ssh, i){
						_data.push(ssh);
						if((i+1)%_leng == 0){
							_data_all.push(_data);
							_data = [];
						}
					});
					if(_data.length > 0){
						_data_all.push(_data);
					}

					var last = _data_all.length - 1;
					_data_all.reduce(function(sequence, nextData){
			            return sequence.then(function(current_data){
			        		return new Promise(function(resolve_reduce, reject_reduce){
			        			var sendData = current_data.map(function(ssh, i){
			        				return new Promise(function(resolve_reduce2, reject_reduce2){
					        			var url_tarif = ssh.action.split('href=\"')[1].split('\"')[0];
					        			relayAjax({
											url: url_tarif+'&action=delete',
											success: function(form_delete){
												var url_delete = form_delete.form.split('action=\"')[1].split('\"')[0];
												relayAjax({
													url: url_delete,
													type: "post",
										            data: {
										                _token: _token,
										                _method: 'DELETE'
										            },
													success: function(res){
														resolve_reduce2(res);
													}
												});
											}
										});
					                });
				                });
				                Promise.all(sendData)
								.then(function(val_all){
									resolve_reduce(nextData);
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
			        }, Promise.resolve(_data_all[last]))
			        .then(function(data_last){
			        	if(typeof cb != 'function'){
							run_script("initDatatable('item');");
							alert('Berhasil hapus tarif SSH!');
							hide_loading();
						}else{
							cb();
						}
			        })
			        .catch(function(e){
			            console.log(e);
			        });
				}
			});
		}
	}
}

function detele_all_tarif_sub_kelompok(kelompok_code, code_perkada, cb){
	if(
		kelompok_code == ''
		|| code_perkada == ''
	){
		alert('Code kelompok tidak ditemukan!');
	}else{
		if(
			typeof cb == 'function'
			|| confirm('Apakah anda yakin untuk menghapus semua tarif SSH di kelompok ini?')
		){
			if(typeof cb != 'function'){
				show_loading();
			}
			relayAjax({
				url: config.fmis_url+'/parameter/ssh/struktur-ssh/subkelompok/datatable?code='+kelompok_code+'&code_perkada='+code_perkada,
				success: function(subkelompok){
					var _leng = 1;
					var _data_all = [];
					var _data = [];
					subkelompok.data.map(function(ssh, i){
						_data.push(ssh);
						if((i+1)%_leng == 0){
							_data_all.push(_data);
							_data = [];
						}
					});
					if(_data.length > 0){
						_data_all.push(_data);
					}

					var last = _data_all.length - 1;
					_data_all.reduce(function(sequence, nextData){
			            return sequence.then(function(current_data){
			        		return new Promise(function(resolve_reduce, reject_reduce){
			        			var sendData = current_data.map(function(ssh, i){
			        				return new Promise(function(resolve_reduce2, reject_reduce2){
					        			var subkelompok_code = ssh.action.split('data-code="')[1].split('"')[0];
								    	detele_all_tarif(subkelompok_code, code_perkada, function(){
								    		resolve_reduce2();
								    	});
					                });
				                });
				                Promise.all(sendData)
								.then(function(val_all){
									resolve_reduce(nextData);
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
			        }, Promise.resolve(_data_all[last]))
			        .then(function(data_last){
			        	if(typeof cb != 'function'){
							run_script("initDatatable('subkelompok');");
							alert('Berhasil hapus tarif SSH!');
							hide_loading();
						}else{
							cb();
						}
			        })
			        .catch(function(e){
			            console.log(e);
			        });
				}
			});
		}
	}
}

function detele_all_tarif_kelompok(golongan_code, code_perkada, cb){
	if(
		golongan_code == ''
		|| code_perkada == ''
	){
		alert('Code golongan tidak ditemukan!');
	}else{
		if(
			typeof cb == 'function'
			|| confirm('Apakah anda yakin untuk menghapus semua tarif SSH di golongan ini?')
		){
			if(typeof cb != 'function'){
				show_loading();
			}
			relayAjax({
				url: config.fmis_url+'/parameter/ssh/struktur-ssh/kelompok/datatable?code='+golongan_code+'&code_perkada='+code_perkada,
				success: function(kelompok){
					var _leng = 1;
					var _data_all = [];
					var _data = [];
					kelompok.data.map(function(ssh, i){
						_data.push(ssh);
						if((i+1)%_leng == 0){
							_data_all.push(_data);
							_data = [];
						}
					});
					if(_data.length > 0){
						_data_all.push(_data);
					}

					var last = _data_all.length - 1;
					_data_all.reduce(function(sequence, nextData){
			            return sequence.then(function(current_data){
			        		return new Promise(function(resolve_reduce, reject_reduce){
			        			var sendData = current_data.map(function(ssh, i){
			        				return new Promise(function(resolve_reduce2, reject_reduce2){
					        			var kelompok_code = ssh.action.split('data-code="')[1].split('"')[0];
								    	detele_all_tarif_sub_kelompok(kelompok_code, code_perkada, function(){
								    		resolve_reduce2();
								    	});
					                });
				                });
				                Promise.all(sendData)
								.then(function(val_all){
									resolve_reduce(nextData);
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
			        }, Promise.resolve(_data_all[last]))
			        .then(function(data_last){
			        	if(typeof cb != 'function'){
							run_script("initDatatable('kelompok');");
							alert('Berhasil hapus tarif SSH!');
							hide_loading();
						}else{
							cb();
						}
			        })
			        .catch(function(e){
			            console.log(e);
			        });
				}
			});
		}
	}
}

function detele_all_tarif_golongan(code_perkada){
	if(
		code_perkada == ''
	){
		alert('Code perkada tidak ditemukan!');
	}else{
		if(
			confirm('Apakah anda yakin untuk menghapus semua tarif SSH di golongan ini?')
		){
			show_loading();
			relayAjax({
				url: config.fmis_url+'/parameter/ssh/struktur-ssh/golongan/datatable?code_perkada='+code_perkada,
				success: function(golongan){
					var _leng = 1;
					var _data_all = [];
					var _data = [];
					golongan.data.map(function(ssh, i){
						_data.push(ssh);
						if((i+1)%_leng == 0){
							_data_all.push(_data);
							_data = [];
						}
					});
					if(_data.length > 0){
						_data_all.push(_data);
					}

					var last = _data_all.length - 1;
					_data_all.reduce(function(sequence, nextData){
			            return sequence.then(function(current_data){
			        		return new Promise(function(resolve_reduce, reject_reduce){
			        			var sendData = current_data.map(function(ssh, i){
			        				return new Promise(function(resolve_reduce2, reject_reduce2){
					        			var golongan_code = ssh.action.split('data-code="')[1].split('"')[0];
								    	detele_all_tarif_kelompok(golongan_code, code_perkada, function(){
								    		resolve_reduce2();
								    	});
					                });
				                });
				                Promise.all(sendData)
								.then(function(val_all){
									resolve_reduce(nextData);
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
			        }, Promise.resolve(_data_all[last]))
			        .then(function(data_last){
						run_script("initDatatable('golongan');");
						alert('Berhasil hapus tarif SSH!');
						hide_loading();
			        })
			        .catch(function(e){
			            console.log(e);
			        });
				}
			});
		}
	}
}

function delete_all_rekening(code_item, cb){
	if(
		code_item == ''
	){
		alert('Code item tidak ditemukan!');
	}else{
		if(
			typeof cb == 'function'
			|| confirm('Apakah anda yakin untuk menghapus semua rekening di item ini?')
		){
			if(typeof cb != 'function'){
				show_loading();
			}
			relayAjax({
				url: config.fmis_url+'/parameter/ssh/struktur-ssh/rekening/datatable?code='+code_item,
				success: function(rekening){
					var _leng = 50;
					var _data_all = [];
					var _data = [];
					rekening.data.map(function(ssh, i){
						_data.push(ssh);
						if((i+1)%_leng == 0){
							_data_all.push(_data);
							_data = [];
						}
					});
					if(_data.length > 0){
						_data_all.push(_data);
					}

					var last = _data_all.length - 1;
					_data_all.reduce(function(sequence, nextData){
			            return sequence.then(function(current_data){
			        		return new Promise(function(resolve_reduce, reject_reduce){
			        			var sendData = current_data.map(function(rek, i){
			        				return new Promise(function(resolve_reduce2, reject_reduce2){
					        			var url_rekening = rek.action.split('href=\"')[1].split('\"')[0];
					        			relayAjax({
											url: url_rekening+'&action=delete',
											success: function(form_delete){
												var url_delete = form_delete.form.split('action=\"')[1].split('\"')[0];
												relayAjax({
													url: url_delete,
													type: "post",
										            data: {
										                _token: _token,
										                _method: 'DELETE'
										            },
													success: function(res){
														resolve_reduce2(res);
													}
												});
											}
										});
					                });
				                });
				                Promise.all(sendData)
								.then(function(val_all){
									resolve_reduce(nextData);
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
			        }, Promise.resolve(_data_all[last]))
			        .then(function(data_last){
			        	if(typeof cb != 'function'){
							run_script("initDatatable('rekening');");
							alert('Berhasil hapus rekening!');
							hide_loading();
						}else{
							cb();
						}
			        })
			        .catch(function(e){
			            console.log(e);
			        });
				}
			});
		}
	}
}

function delete_all_item(code_subkelompok, cb){
	if(
		code_subkelompok == ''
	){
		alert('Code sub kelompok tidak ditemukan!');
	}else{
		if(
			typeof cb == 'function'
			|| confirm('Apakah anda yakin untuk menghapus semua rekening di sub kelompok ini?')
		){
			if(typeof cb != 'function'){
				show_loading();
			}
			relayAjax({
				url: config.fmis_url+'/parameter/ssh/struktur-ssh/item/datatable?code='+code_subkelompok,
				success: function(items){
					var _leng = 50;
					var _data_all = [];
					var _data = [];
					items.data.map(function(ssh, i){
						_data.push(ssh);
						if((i+1)%_leng == 0){
							_data_all.push(_data);
							_data = [];
						}
					});
					if(_data.length > 0){
						_data_all.push(_data);
					}

					var last = _data_all.length - 1;
					_data_all.reduce(function(sequence, nextData){
			            return sequence.then(function(current_data){
			        		return new Promise(function(resolve_reduce, reject_reduce){
			        			var sendData = current_data.map(function(item, i){
			        				return new Promise(function(resolve_reduce2, reject_reduce2){
					        			var item_code = item.action.split('data-code="')[1].split('"')[0];
								    	delete_all_rekening(item_code, function(){
								    		var url_item = item.action.split('href=\"')[1].split('\"')[0];
						        			relayAjax({
												url: url_item+'&action=delete',
												success: function(form_delete){
													var url_delete = form_delete.form.split('action=\"')[1].split('\"')[0];
													relayAjax({
														url: url_delete,
														type: "post",
											            data: {
											                _token: _token,
											                _method: 'DELETE'
											            },
														success: function(res){
															resolve_reduce2(res);
														}
													});
												}
											});
								    	});
					                });
				                });
				                Promise.all(sendData)
								.then(function(val_all){
									resolve_reduce(nextData);
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
			        }, Promise.resolve(_data_all[last]))
			        .then(function(data_last){
			        	if(typeof cb != 'function'){
							run_script("initDatatable('item');");
							alert('Berhasil hapus item SSH!');
							hide_loading();
						}else{
							cb();
						}
			        })
			        .catch(function(e){
			            console.log(e);
			        });
				}
			});
		}
	}
}

function delete_all_subkelompok(code_kelompok, cb){
	if(
		code_kelompok == ''
	){
		alert('Code sub kelompok tidak ditemukan!');
	}else{
		if(
			typeof cb == 'function'
			|| confirm('Apakah anda yakin untuk menghapus semua item di sub kelompok ini?')
		){
			if(typeof cb != 'function'){
				show_loading();
			}
			relayAjax({
				url: config.fmis_url+'/parameter/ssh/struktur-ssh/subkelompok/datatable?code='+code_kelompok,
				success: function(subkelompok){
					var _leng = 50;
					var _data_all = [];
					var _data = [];
					subkelompok.data.map(function(ssh, i){
						_data.push(ssh);
						if((i+1)%_leng == 0){
							_data_all.push(_data);
							_data = [];
						}
					});
					if(_data.length > 0){
						_data_all.push(_data);
					}

					var last = _data_all.length - 1;
					_data_all.reduce(function(sequence, nextData){
			            return sequence.then(function(current_data){
			        		return new Promise(function(resolve_reduce, reject_reduce){
			        			var sendData = current_data.map(function(subkelompok, i){
			        				return new Promise(function(resolve_reduce2, reject_reduce2){
					        			var subkelompok_code = subkelompok.action.split('data-code="')[1].split('"')[0];
								    	delete_all_item(subkelompok_code, function(){
								    		var url_subkelompok = subkelompok.action.split('href=\"')[1].split('\"')[0];
						        			relayAjax({
												url: url_subkelompok+'&action=delete',
												success: function(form_delete){
													var url_delete = form_delete.form.split('action=\"')[1].split('\"')[0];
													relayAjax({
														url: url_delete,
														type: "post",
											            data: {
											                _token: _token,
											                _method: 'DELETE'
											            },
														success: function(res){
															resolve_reduce2(res);
														}
													});
												}
											});
								    	});
					                });
				                });
				                Promise.all(sendData)
								.then(function(val_all){
									resolve_reduce(nextData);
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
			        }, Promise.resolve(_data_all[last]))
			        .then(function(data_last){
			        	if(typeof cb != 'function'){
							run_script("initDatatable('subkelompok');");
							alert('Berhasil hapus Sub Kelompok SSH!');
							hide_loading();
						}else{
							cb();
						}
			        })
			        .catch(function(e){
			            console.log(e);
			        });
				}
			});
		}
	}
}

function delete_all_kelompok(code_golongan, cb){
	if(
		code_golongan == ''
	){
		alert('Code golongan tidak ditemukan!');
	}else{
		if(
			typeof cb == 'function'
			|| confirm('Apakah anda yakin untuk menghapus semua kelompok di golongan ini?')
		){
			if(typeof cb != 'function'){
				show_loading();
			}
			relayAjax({
				url: config.fmis_url+'/parameter/ssh/struktur-ssh/kelompok/datatable?code='+code_golongan,
				success: function(kelompok){
					var _leng = 50;
					var _data_all = [];
					var _data = [];
					kelompok.data.map(function(ssh, i){
						_data.push(ssh);
						if((i+1)%_leng == 0){
							_data_all.push(_data);
							_data = [];
						}
					});
					if(_data.length > 0){
						_data_all.push(_data);
					}

					var last = _data_all.length - 1;
					_data_all.reduce(function(sequence, nextData){
			            return sequence.then(function(current_data){
			        		return new Promise(function(resolve_reduce, reject_reduce){
			        			var sendData = current_data.map(function(kelompok, i){
			        				return new Promise(function(resolve_reduce2, reject_reduce2){
					        			var kelompok_code = kelompok.action.split('data-code="')[1].split('"')[0];
								    	delete_all_subkelompok(kelompok_code, function(){
								    		var url_kelompok = kelompok.action.split('href=\"')[1].split('\"')[0];
						        			relayAjax({
												url: url_kelompok+'&action=delete',
												success: function(form_delete){
													var url_delete = form_delete.form.split('action=\"')[1].split('\"')[0];
													relayAjax({
														url: url_delete,
														type: "post",
											            data: {
											                _token: _token,
											                _method: 'DELETE'
											            },
														success: function(res){
															resolve_reduce2(res);
														}
													});
												}
											});
								    	});
					                });
				                });
				                Promise.all(sendData)
								.then(function(val_all){
									resolve_reduce(nextData);
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
			        }, Promise.resolve(_data_all[last]))
			        .then(function(data_last){
			        	if(typeof cb != 'function'){
							run_script("initDatatable('kelompok');");
							alert('Berhasil hapus Kelompok SSH!');
							hide_loading();
						}else{
							cb();
						}
			        })
			        .catch(function(e){
			            console.log(e);
			        });
				}
			});
		}
	}
}

function delete_all_golongan(){
	if(
		confirm('Apakah anda yakin untuk menghapus semua golongan?')
	){
		show_loading();
		relayAjax({
			url: config.fmis_url+'/parameter/ssh/struktur-ssh/golongan/datatable',
			success: function(golongan){
				var _leng = 1;
				var _data_all = [];
				var _data = [];
				golongan.data.map(function(ssh, i){
					_data.push(ssh);
					if((i+1)%_leng == 0){
						_data_all.push(_data);
						_data = [];
					}
				});
				if(_data.length > 0){
					_data_all.push(_data);
				}

				var last = _data_all.length - 1;
				_data_all.reduce(function(sequence, nextData){
		            return sequence.then(function(current_data){
		        		return new Promise(function(resolve_reduce, reject_reduce){
		        			var sendData = current_data.map(function(golongan, i){
		        				return new Promise(function(resolve_reduce2, reject_reduce2){
				        			var golongan_code = golongan.action.split('data-code="')[1].split('"')[0];
							    	delete_all_kelompok(golongan_code, function(){
							    		var url_golongan = golongan.action.split('href=\"')[1].split('\"')[0];
					        			relayAjax({
											url: url_golongan+'&action=delete',
											success: function(form_delete){
												var url_delete = form_delete.form.split('action=\"')[1].split('\"')[0];
												relayAjax({
													url: url_delete,
													type: "post",
										            data: {
										                _token: _token,
										                _method: 'DELETE'
										            },
													success: function(res){
														resolve_reduce2(res);
													}
												});
											}
										});
							    	});
				                });
			                });
			                Promise.all(sendData)
							.then(function(val_all){
								resolve_reduce(nextData);
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
		        }, Promise.resolve(_data_all[last]))
		        .then(function(data_last){
					run_script("initDatatable('golongan');");
					alert('Berhasil hapus Golongan SSH!');
					hide_loading();
		        })
		        .catch(function(e){
		            console.log(e);
		        });
			}
		});
	}
}

function singkron_skpd_sipd_all(data_skpd){
	if(confirm('Apakah anda yakin untuk mengsingkronkan data All SKPD dari SIPD?')){
		show_loading();
		var sendData = [];
		jQuery('#bidang li[data-type="bidang"]').map(function(i, b){
			sendData.push(new Promise(function(resolve_reduce2, reject_reduce2){
				var code_bidur = jQuery(b).attr('data-code');
				var url_tambah_skpd = config.fmis_url+'/parameter/unit-organisasi/form?code='+code_bidur+'&table=skpd'
				singkron_skpd_sipd(url_tambah_skpd, data_skpd, function(){
					resolve_reduce2();
				});
	        }));
	    });
	    Promise.all(sendData)
		.then(function(val_all){
			hide_loading();
			alert('Berhasil singkron All SKPD!');
		});
	}
}

function singkron_skpd_sipd(url_tambah_skpd, data_skpd, cb){
	if(
		url_tambah_skpd == ''
	){
		alert('Url tambah SKPD tidak ditemukan!');
	}else{
		if(
			typeof cb == 'function'
			|| confirm('Apakah anda yakin untuk mengsingkronkan data SKPD dari SIPD?')
		){
			if(typeof cb != 'function'){
				show_loading();
			}
			var code_bidang = url_tambah_skpd.split('code=')[1].split('&')[0];
			var data_skpd_selected = [];
			data_skpd.map(function(b, i){
				if(
					b.code == code_bidang
					&& b.isskpd == 1
				){
					data_skpd_selected.push(b);
				}
			});
			relayAjax({
				url: config.fmis_url+'/parameter/unit-organisasi/datatable?code='+code_bidang+'&table=skpd',
				success: function(skpd){
					var _leng = 5;
					var _data_all = [];
					var _data = [];
					data_skpd_selected.map(function(unit, i){
						skpd.data.map(function(_unit, _i){
							if(unit.nama_skpd == _unit.nmskpd){
								unit.fmis = _unit;
							}
						});
						_data.push(unit);
						if((i+1)%_leng == 0){
							_data_all.push(_data);
							_data = [];
						}
					});
					if(_data.length > 0){
						_data_all.push(_data);
					}

					var last = _data_all.length - 1;
					_data_all.reduce(function(sequence, nextData){
			            return sequence.then(function(current_data){
			        		return new Promise(function(resolve_reduce, reject_reduce){
			        			var sendData = current_data.map(function(skpd, i){
			        				return new Promise(function(resolve_reduce2, reject_reduce2){
			        					if(skpd.fmis){
								    		var url_edit = skpd.fmis.action.split('href=\"')[1].split('\"')[0];
								    		url_edit = jQuery('<textarea />').html(url_edit).text();
						        			relayAjax({
												url: url_edit+'&action=edit',
												success: function(form_edit){
													var url_save = form_edit.form.split('action=\"')[1].split('\"')[0];
													var form = jQuery(form_edit.form);
													var kdskpd = skpd.id_skpd;
													var nmskpd = skpd.nama_skpd;
													var idbidang_utama = form.find('input[name="idbidang_utama"]:checked').val();
													var idbidang2 = get_id_bidur_skpd(form.find('#idbidang2 option'), skpd.bidur2);
													var idbidang3 = get_id_bidur_skpd(form.find('#idbidang3 option'), skpd.bidur3);
													relayAjax({
														url: url_save,
														type: "post",
											            data: {
											                _token: _token,
											                _method: 'PUT',
											                idbidang_utama: idbidang_utama,
											                idbidang2: idbidang2,
											                idbidang3: idbidang3,
											                kdskpd: kdskpd,
											                nmskpd: nmskpd
											            },
														success: function(res){
															resolve_reduce2(res);
														}
													});
												}
											});
						        		}else{
						        			relayAjax({
												url: url_tambah_skpd+'&action=create',
												success: function(form_edit){
													var url_save = form_edit.form.split('action=\"')[1].split('\"')[0];
													var form = jQuery(form_edit.form);
													var idbidang = form.find('input[name="idbidang"]').val();
													var idpemda = form.find('input[name="idpemda"]').val();
													var kdskpd = skpd.id_skpd;
													var nmskpd = skpd.nama_skpd;
													var idbidang_utama = idbidang;
													var idbidang2 = get_id_bidur_skpd(form.find('#idbidang2 option'), skpd.bidur2);
													var idbidang3 = get_id_bidur_skpd(form.find('#idbidang3 option'), skpd.bidur3);
													relayAjax({
														url: url_save,
														type: "post",
											            data: {
											                _token: _token,
											                idpemda: idpemda,
											                idbidang: idbidang,
											                idbidang_utama: idbidang_utama,
											                idbidang2: idbidang2,
											                idbidang3: idbidang3,
											                kdskpd: kdskpd,
											                nmskpd: nmskpd
											            },
														success: function(res){
															resolve_reduce2(res);
														}
													});
												}
											});
						        		}
					                });
				                });
				                Promise.all(sendData)
								.then(function(val_all){
									resolve_reduce(nextData);
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
			        }, Promise.resolve(_data_all[last]))
			        .then(function(data_last){
			        	relayAjax({
							url: config.fmis_url+'/parameter/unit-organisasi/datatable?code='+code_bidang+'&table=skpd',
							success: function(skpd){
								relayAjax({
									url: url_tambah_skpd+'&action=create',
									success: function(form_edit){
										var _data = [];
										var form = jQuery(form_edit.form);
										var idbidang = form.find('input[name="idbidang"]').val();
										data_skpd_selected.map(function(unit, i){
											skpd.data.map(function(_unit, _i){
												if(unit.nama_skpd == _unit.nmskpd){
													unit.idbidang = idbidang;
													unit.fmis = _unit;
													_data.push(unit);
												}
											});
										});
							        	if(typeof cb != 'function'){
											singkron_unit_sipd(_data, function(){
												run_script("initUnitTable(2);");
												alert('Berhasil singkron SKPD!');
												hide_loading();
											});
										}else{
											singkron_unit_sipd(_data, cb);
										}
									}
								});
							}
						});
			        })
			        .catch(function(e){
			            console.log(e);
			        });
				}
			});
		}
	}
}

function singkron_unit_sipd(data_skpd, cb){
	var last = data_skpd.length - 1;
	data_skpd.reduce(function(sequence, nextData){
        return sequence.then(function(current_data){
    		return new Promise(function(resolve_reduce, reject_reduce){
    			var code_skpd = current_data.fmis.code;
				update_save_unit_sipd(current_data, code_skpd, function(){
					resolve_reduce(nextData);
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
    }, Promise.resolve(data_skpd[last]))
    .then(function(data_last){
    	cb();
    });
}

function update_save_unit_sipd(unit_sipd, code_skpd, cb){
	relayAjax({
		url: config.fmis_url+'/parameter/unit-organisasi/datatable?code='+code_skpd+'&table=unit',
		success: function(units){
			var unit_fmis = false;
			units.data.map(function(unit, ii){
				if(unit_sipd.nama_skpd == unit.nmunit){
					unit_fmis = unit
				}
			});
			new Promise(function(resolve_reduce, reject_reduce){
				if(unit_fmis){
		    		var url_edit = unit_fmis.action.split('href=\"')[1].split('\"')[0];
		    		url_edit = jQuery('<textarea />').html(url_edit).text();
	    			relayAjax({
						url: url_edit+'&action=edit',
						success: function(form_edit){
							var url_save = form_edit.form.split('action=\"')[1].split('\"')[0];
							var kdunit = unit_sipd.id_skpd;
							var nmunit = unit_sipd.nama_skpd;
							relayAjax({
								url: url_save,
								type: "post",
					            data: {
					                _token: _token,
					                _method: 'PUT',
					                kdunit: kdunit,
					                nmunit: nmunit
					            },
								success: function(res){
									resolve_reduce();
								}
							});
						}
					});
	    		}else{
	    			relayAjax({
						url: config.fmis_url+'/parameter/unit-organisasi/form?code='+code_skpd+'&table=unit&action=create',
						success: function(form_edit){
							var url_save = form_edit.form.split('action=\"')[1].split('\"')[0];
							var form = jQuery(form_edit.form);
							var idskpd = form.find('input[name="idskpd"]').val();
							var kdunit = unit_sipd.id_skpd;
							var nmunit = unit_sipd.nama_skpd;
							relayAjax({
								url: url_save,
								type: "post",
					            data: {
					                _token: _token,
					                idskpd: idskpd,
					                kdunit: kdunit,
					                nmunit: nmunit
					            },
								success: function(res){
									resolve_reduce();
								}
							});
						}
					});
	    		}
	    	})
	    	.then(function(){
	    		if(unit_sipd.sub_unit){
		    		relayAjax({
						url: config.fmis_url+'/parameter/unit-organisasi/datatable?code='+code_skpd+'&table=unit',
						success: function(units){
							var unit_fmis = false;
							units.data.map(function(unit, ii){
								if(unit_sipd.nama_skpd == unit.nmunit){
									unit_fmis = unit
								}
							});
							relayAjax({
								url: config.fmis_url+'/parameter/unit-organisasi/form?code='+code_skpd+'&table=unit&action=create',
								success: function(form_edit){
									var form = jQuery(form_edit.form);
									unit_fmis.idskpd = form.find('input[name="idskpd"]').val();
									unit_fmis.idbidang = unit_sipd.idbidang;
									update_save_sub_unit_sipd(unit_sipd.sub_unit, unit_fmis, cb);

								}
							});
						}
					});
		    	}else{
		    		cb();
		    	}
	    	});
		}
	});
}

function update_save_sub_unit_sipd(sub_unit, unit_fmis, cb){
	var code_unit = unit_fmis.code;
	var last = sub_unit.length - 1;
	relayAjax({
		url: config.fmis_url+'/parameter/unit-organisasi/datatable?code='+code_unit+'&table=subunit',
		success: function(units){
			sub_unit.reduce(function(sequence, nextData){
		        return sequence.then(function(sub_unit_sipd){
		    		return new Promise(function(resolve_reduce, reject_reduce){
						var sub_unit_fmis = false;
						units.data.map(function(subunit, ii){
							if(sub_unit_sipd.nama_skpd == subunit.nmsubunit){
								sub_unit_fmis = subunit
							}
						});
						if(sub_unit_fmis){
				    		var url_edit = sub_unit_fmis.action.split('href=\"')[1].split('\"')[0];
				    		url_edit = jQuery('<textarea />').html(url_edit).text();
		        			relayAjax({
								url: url_edit+'&action=edit',
								success: function(form_edit){
									var url_save = form_edit.form.split('action=\"')[1].split('\"')[0];
									var kdsubunit = sub_unit_sipd.id_skpd;
									var nmsubunit = sub_unit_sipd.nama_skpd;
									var form = jQuery(form_edit.form);
									var idunit = form.find('input[name="idunit"]').val();
									var idso = '';
									var uraian_so = 'Kepala '+nmsubunit;
									form.find('#table-so .select-so').map(function(i, b){
										var uraian = jQuery(b).attr('data-uraian');
										if(uraian == uraian_so){
											idso = jQuery(b).attr('data-so');
										}
									});
									getIdSo({
										idso: idso,
										uraian_so: uraian_so,
										idbidur: unit_fmis.idbidang,
										idskpd: unit_fmis.idskpd,
										idunit: idunit
									}).then(function(val){
										relayAjax({
											url: url_save,
											type: "post",
								            data: {
								                _token: _token,
								                _method: 'PUT',
								                idso: val.idso,
								                uraian_so: val.uraian_so,
								                'table-so_length': 10,
								                idunit: idunit,
								                kdsubunit: kdsubunit,
								                nmsubunit: nmsubunit
								            },
											success: function(res){
												resolve_reduce(nextData);
											}
										});
									});
								}
							});
		        		}else{
		        			relayAjax({
								url: config.fmis_url+'/parameter/unit-organisasi/form?code='+code_unit+'&table=subunit&action=create',
								success: function(form_edit){
									var url_save = form_edit.form.split('action=\"')[1].split('\"')[0];
									var kdsubunit = sub_unit_sipd.id_skpd;
									var nmsubunit = sub_unit_sipd.nama_skpd;
									var form = jQuery(form_edit.form);
									var idunit = form.find('input[name="idunit"]').val();
									var idso = '';
									var uraian_so = 'Kepala '+nmsubunit;
									form.find('#table-so .select-so').map(function(i, b){
										var uraian = jQuery(b).attr('data-uraian');
										if(uraian == uraian_so){
											idso = jQuery(b).attr('data-so');
										}
									});
									getIdSo({
										idso: idso,
										uraian_so: uraian_so,
										idbidur: unit_fmis.idbidang,
										idskpd: unit_fmis.idskpd,
										idunit: idunit
									}).then(function(val){
										relayAjax({
											url: url_save,
											type: "post",
								            data: {
								                _token: _token,
								                idso: val.idso,
								                uraian_so: val.uraian_so,
								                'table-so_length': 10,
								                idunit: idunit,
								                kdsubunit: kdsubunit,
								                nmsubunit: nmsubunit
								            },
											success: function(res){
												resolve_reduce(nextData);
											}
										});
									});
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
		    }, Promise.resolve(sub_unit[last]))
		    .then(function(data_last){
		    	cb();
		    });
		}
	});
}

function getIdSo(options){
	return new Promise(function(resolve_reduce, reject_reduce){
		if(options.idso != ''){
			resolve_reduce(options);
		}else{
			relayAjax({
				url: config.fmis_url+'/parameter/struktur-organisasi/chart?idunit='+options.idunit,
				success: function(so){
					if(so.struktur.title == options.uraian_so){
						options.idso = so.struktur.idso;
						resolve_reduce(options);
					}else{
						so.struktur.children.map(function(b, i){
							if(b.title == options.uraian_so){
								options.idso = b.idso;
							}
						});
						if(options.idso != ''){
							resolve_reduce(options);
						}else{
							relayAjax({
								url: config.fmis_url+'/parameter/struktur-organisasi/form?idso='+so.struktur.idso+'&idunit='+options.idunit+'&action=create',
								success: function(form_create){
									var url_save = form_create.form.split('action=\"')[1].split('\"')[0];
									var form = jQuery(form_create.form);
									relayAjax({
										url: url_save,
										type: "post",
							            data: {
							                _token: _token,
							                idunit: options.idunit,
							                nm_so: options.uraian_so,
							                status: 1,
							                uraian_so: so.struktur.title,
							                idsoref: so.struktur.idso,
							                'table-so_length': 10
							            },
										success: function(res){
											getIdSo(options).then(function(val){
												resolve_reduce(val);
											});
										}
									});
								}
							});
						}
					}
				}
			});
		}
	});
}

function get_id_bidur_skpd(html, bidur_sipd){
	if(typeof bidang_urusan == 'undefined'){
		window.bidang_urusan = {};
		html.map(function(i, b){
			var bidur_fmis = get_text_bidur(jQuery(b).text());
			bidang_urusan[jQuery(b).attr('value')] = bidur_fmis;
		});
	}
	if(!bidur_sipd || bidur_sipd == ''){
		return '';
	}else{
		bidur_sipd = get_text_bidur(bidur_sipd);
		var id_bidur = '';
		for(var id in bidang_urusan){
			if(bidur_sipd == bidang_urusan[id]){
				id_bidur = id;
			}
		}
		return id_bidur;
	}
}

function get_text_bidur(text){
	text = text.split(' ');
	text.shift();
	text = text.join(' ');
	return text;
}

function delete_skpd_all_fmis(){
	if(confirm('Apakah anda yakin untuk menghapus semua SKPD di semua Bidang Urusan?')){
		show_loading();
		var sendData = [];
		jQuery('#bidang li[data-type="bidang"]').map(function(i, b){
			sendData.push(new Promise(function(resolve_reduce2, reject_reduce2){
				var code_bidur = jQuery(b).attr('data-code');
				var url_tambah_skpd = config.fmis_url+'/parameter/unit-organisasi/form?code='+code_bidur+'&table=skpd'
				delete_skpd_fmis(url_tambah_skpd, function(){
					resolve_reduce2();
				});
	        }));
	    });
	    Promise.all(sendData)
		.then(function(val_all){
			hide_loading();
			alert('Berhasil hapus All SKPD!');
		});
	}
}

function delete_skpd_fmis(url_tambah_skpd, cb){
	if(
		url_tambah_skpd == ''
	){
		alert('Url tambah SKPD tidak ditemukan!');
	}else{
		if(
			typeof cb == 'function'
			|| confirm('Apakah anda yakin untuk menghapus data SKPD dari Urusan Bidang ini?')
		){
			if(typeof cb != 'function'){
				show_loading();
			}
			var code_bidang = url_tambah_skpd.split('code=')[1].split('&')[0];
			relayAjax({
				url: config.fmis_url+'/parameter/unit-organisasi/datatable?code='+code_bidang+'&table=skpd',
				success: function(skpd){
					var _leng = 1;
					var _data_all = [];
					var _data = [];
					skpd.data.map(function(unit, i){
						_data.push(unit);
						if((i+1)%_leng == 0){
							_data_all.push(_data);
							_data = [];
						}
					});
					if(_data.length > 0){
						_data_all.push(_data);
					}

					var last = _data_all.length - 1;
					_data_all.reduce(function(sequence, nextData){
			            return sequence.then(function(current_data){
			        		return new Promise(function(resolve_reduce, reject_reduce){
			        			var sendData = current_data.map(function(skpd, i){
			        				return new Promise(function(resolve_reduce2, reject_reduce2){
			        					delete_unit_fmis(skpd.code, function(){
				        					var url_form = skpd.action.split('href=\"')[2].split('\"')[0];
				        					url_form = jQuery('<textarea />').html(url_form).text();
						        			relayAjax({
												url: url_form+'&action=delete',
												success: function(form_delete){
													console.log('Hapus SKPD '+skpd.nmskpd);
													var url_delete = form_delete.form.split('action=\"')[1].split('\"')[0];
													relayAjax({
														url: url_delete,
														type: "post",
											            data: {
											                _token: _token,
											                _method: 'DELETE'
											            },
														success: function(res){
															resolve_reduce2(res);
														}
													});
												}
											});
						        		});
					                });
				                });
				                Promise.all(sendData)
								.then(function(val_all){
									resolve_reduce(nextData);
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
			        }, Promise.resolve(_data_all[last]))
			        .then(function(data_last){
			        	if(typeof cb != 'function'){
							run_script("initUnitTable(2);");
							alert('Berhasil hapus SKPD!');
							hide_loading();
						}else{
							cb();
						}
			        })
			        .catch(function(e){
			            console.log(e);
			        });
				}
			});
		}
	}
}

function delete_unit_fmis(code_skpd, cb){
	relayAjax({
		url: config.fmis_url+'/parameter/unit-organisasi/datatable?code='+code_skpd+'&table=unit',
		success: function(units){
			var last = units.data.length - 1;
			units.data.reduce(function(sequence, nextData){
	            return sequence.then(function(unit){
	        		return new Promise(function(resolve_reduce, reject_reduce){
	        			delete_so_subunit_fmis(unit.code, function(){
        					var url_form = unit.action.split('href=\"')[2].split('\"')[0];
        					url_form = jQuery('<textarea />').html(url_form).text();
		        			relayAjax({
								url: url_form+'&action=delete',
								success: function(form_delete){
									console.log('Hapus Unit '+unit.nmunit);
									var url_delete = form_delete.form.split('action=\"')[1].split('\"')[0];
									relayAjax({
										url: url_delete,
										type: "post",
							            data: {
							                _token: _token,
							                _method: 'DELETE'
							            },
										success: function(res){
											resolve_reduce(nextData);
										}
									});
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
	        }, Promise.resolve(units.data[last]))
	        .then(function(data_last){
				cb();
	        })
	        .catch(function(e){
	            console.log(e);
	        });
		}
	});
}

function delete_so_subunit_fmis(code_unit, cb){
	relayAjax({
		url: config.fmis_url+'/parameter/unit-organisasi/form?code='+code_unit+'&table=subunit&action=create',
		success: function(form_edit){
			var form = jQuery(form_edit.form);
			var idunit = form.find('input[name="idunit"]').val();
			relayAjax({
				url: config.fmis_url+'/parameter/unit-organisasi/datatable?code='+code_unit+'&table=subunit',
				success: function(subunits){
					var last = subunits.data.length - 1;
					subunits.data.reduce(function(sequence, nextData){
			            return sequence.then(function(sub_unit){
			        		return new Promise(function(resolve_reduce, reject_reduce){
		    					var url_form = sub_unit.action.split('href=\"')[2].split('\"')[0];
		    					url_form = jQuery('<textarea />').html(url_form).text();
			        			relayAjax({
									url: url_form+'&action=delete',
									success: function(form_delete){
										console.log('Hapus Sub Unit '+sub_unit.nmsubunit);
										var url_delete = form_delete.form.split('action=\"')[1].split('\"')[0];
										relayAjax({
											url: url_delete,
											type: "post",
								            data: {
								                _token: _token,
								                _method: 'DELETE'
								            },
											success: function(res){
												resolve_reduce(nextData);
											}
										});
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
			        }, Promise.resolve(subunits.data[last]))
			        .then(function(data_last){
						relayAjax({
							url: config.fmis_url+'/parameter/struktur-organisasi/chart?idunit='+idunit,
							success: function(so){
								var sendData = [];
								if(so && so.struktur && so.struktur.children){
									// hapus children so level 1
									sendData = so.struktur.children.map(function(b, i){
										return new Promise(function(resolve, reduce){
											relayAjax({
												url: config.fmis_url+'/parameter/struktur-organisasi/form?idso='+b.idso+'&idunit='+idunit+'&action=delete',
												success: function(form_create){
													console.log('Hapus Struktur Organisasi '+b.title);
													var url_save = form_create.form.split('action=\"')[1].split('\"')[0];
													relayAjax({
														url: url_save,
														type: "post",
											            data: {
											                _token: _token,
											                _method: 'DELETE'
											            },
														success: function(res){
															resolve(res);
														}
													});
												}
											});
										});
									});
								}else{
									console.log('so tak punya children', so);
								}
								Promise.all(sendData)
								.then(function(val_all){
									if(so && so.struktur && so.struktur.idso){
										// hapus master so
										relayAjax({
											url: config.fmis_url+'/parameter/struktur-organisasi/form?idso='+so.struktur.idso+'&idunit='+idunit+'&action=delete',
											success: function(form_create){
												console.log('Hapus Struktur Organisasi '+so.struktur.title);
												var url_save = form_create.form.split('action=\"')[1].split('\"')[0];
												relayAjax({
													url: url_save,
													type: "post",
										            data: {
										                _token: _token,
										                _method: 'DELETE'
										            },
													success: function(res){
														cb();
													}
												});
											}
										});
									}else{
										console.log('so tak punya struktur', so);
										cb();
									}
								});
							}
						});
			        })
			        .catch(function(e){
			            console.log(e);
			        });
				}
			});
		}
	});
}

function getUnitFmis(){
	return new Promise(function(resolve, reject){
		relayAjax({
			url: config.fmis_url+'/manajemen-user/user/form?action=create',
			success: function(form_tambah){
				var sendData = [];
				var unit = {};
				jQuery(form_tambah.form).find('#idunit option').map(function(i, b){
					var id = jQuery(b).attr('value');
					if(id == ''){
						return;
					}
					var name = jQuery(b).text();
					unit[name] = {
						id: id,
						sub_unit: {}
					};
					sendData.push({
						param: {
							id: id,
							name: name
						},
						cb: function(param, ret_cb){
							relayAjax({
								url: config.fmis_url+'/manajemen-user/user/subunit?idunit='+param.id,
								success: function(data_fmis){
									for(var id_sub in data_fmis.subunit){
										if(id_sub != ''){
											unit[param.name].sub_unit[data_fmis.subunit[id_sub]] = {
												id: id_sub,
												name: data_fmis.subunit[id_sub]
											};
										}
									}
									ret_cb();
								}
							});
						}
					});
				});
				reduce_promise(sendData, function(val_all){
					resolve(unit);
			    }, 5);
			}
		});
	});
}

function singkronisasi_user_sipd(data_skpd){
	var pass = prompt('Masukan password default untuk user dari SIPD!');
	relayAjax({
		url: config.fmis_url+'/manajemen-user/user/datatable',
		success: function(users){
			getUnitFmis().then(function(unit_fmis){
				var sendData = [];
				data_skpd.map(function(skpd, i){
					users.data.map(function(u, n){
						var username = u.kduser.slice(0, -1);
						if(skpd.nipkepala == username){
							var last = u.kduser.charAt(u.kduser.length-1);
							if(last == 'p'){
								skpd.user_fmis_p = u;
							}else if(last == 'k'){
								skpd.user_fmis_k = u;
							}
						}
					});
					skpd.idunit_fmis = false;
					skpd.idsubunit_fmis = false;
					for(var unit_f in unit_fmis){
						for(var sub_unit_f in unit_fmis[unit_f].sub_unit){
							if(skpd.nama_skpd == sub_unit_f){
								skpd.idsubunit_fmis = unit_fmis[unit_f].sub_unit[sub_unit_f].id;
								skpd.idunit_fmis = unit_fmis[unit_f].id;
							}
						}
					}
					// return console.log('data_skpd', skpd);
					sendData.push({
						param: {
							skpd: skpd
						},
						cb: function(data, ret_cb){
							if(
								!data.skpd.idunit_fmis
								|| !data.skpd.idsubunit_fmis
							){
								console.log('idunit atau idsubunit tidak ditemukan', data.skpd);
								return ret_cb();
							}
							var sendDataSub = [];
							if(data.skpd.user_fmis_p){
								sendDataSub.push({
									param: {
										skpd: data.skpd
									},
									cb: function(data, ret_cb2){
										var url_form = data.skpd.user_fmis_p.action.split('href=\"')[1].split('\"')[0];
										relayAjax({
											url: url_form+'?action=edit',
											success: function(form_update){
												var url_update = form_update.form.split('action=\"')[1].split('\"')[0];
												relayAjax({
													url: url_update,
													type: "post",
										            data: {
										                _token: _token,
										                _method: 'PUT',
										                kduser: data.skpd.nipkepala+'p',
										                nmuser: (data.skpd.namakepala).substring(0, 50).trim(),
										                nmket: (data.skpd.kode_skpd+' '+data.skpd.nama_skpd).substring(0, 50).trim(),
										                level: 'operator',
										                status: 1,
										                idunit: data.skpd.idunit_fmis,
										                idsubunit: data.skpd.idsubunit_fmis,
										                idgroup: [3], // Perencanaan PD
										                tahun: [config.tahun_anggaran],
										            },
													success: function(res){
														ret_cb2();
													}
												});
											}
										});
									}
								});
							}else{
								sendDataSub.push({
									param: {
										skpd: data.skpd
									},
									cb: function(data, ret_cb2){
										relayAjax({
											url: config.fmis_url+'/manajemen-user/user/store',
											type: "post",
								            data: {
								                _token: _token,
								                _method: 'POST',
								                kduser: data.skpd.nipkepala+'p',
								                nmuser: (data.skpd.namakepala).substring(0, 50).trim(),
								                pwd: pass,
								                pwd_confirmation: pass,
								                nmket: (data.skpd.kode_skpd+' '+data.skpd.nama_skpd).substring(0, 50).trim(),
								                level: 'operator',
								                status: 1,
								                idunit: data.skpd.idunit_fmis,
								                idsubunit: data.skpd.idsubunit_fmis,
								                idgroup: [3], // Perencanaan PD
								                tahun: [config.tahun_anggaran],
								            },
											success: function(res){
												ret_cb2();
											}
										});
									}
								});
							}
							if(data.skpd.user_fmis_k){
								sendDataSub.push({
									param: {
										skpd: data.skpd
									},
									cb: function(data, ret_cb2){
										var url_form = data.skpd.user_fmis_k.action.split('href=\"')[1].split('\"')[0];
										relayAjax({
											url: url_form+'?action=edit',
											success: function(form_update){
												var url_update = form_update.form.split('action=\"')[1].split('\"')[0];
												relayAjax({
													url: url_update,
													type: "post",
										            data: {
										                _token: _token,
										                _method: 'PUT',
										                kduser: data.skpd.nipkepala+'k',
										                nmuser: (data.skpd.namakepala).substring(0, 50).trim(),
										                nmket: (data.skpd.kode_skpd+' '+data.skpd.nama_skpd).substring(0, 50).trim(),
										                level: 'operator',
										                status: 1,
										                idunit: data.skpd.idunit_fmis,
										                idsubunit: data.skpd.idsubunit_fmis,
								                		idgroup: [5], // Anggaran PD
										                tahun: [config.tahun_anggaran],
										            },
													success: function(res){
														ret_cb2();
													}
												});
											}
										});
									}
								});
							}else{
								sendDataSub.push({
									param: {
										skpd: data.skpd
									},
									cb: function(data, ret_cb2){
										relayAjax({
											url: config.fmis_url+'/manajemen-user/user/store',
											type: "post",
								            data: {
								                _token: _token,
								                _method: 'POST',
								                kduser: data.skpd.nipkepala+'k',
								                nmuser: (data.skpd.namakepala).substring(0, 50).trim(),
								                pwd: pass,
								                pwd_confirmation: pass,
								                nmket: (data.skpd.kode_skpd+' '+data.skpd.nama_skpd).substring(0, 50).trim(),
								                level: 'operator',
								                status: 1,
								                idunit: data.skpd.idunit_fmis,
								                idsubunit: data.skpd.idsubunit_fmis,
								                idgroup: [5], // Anggaran PD
								                tahun: [config.tahun_anggaran],
								            },
											success: function(res){
												ret_cb2();
											}
										});
									}
								});
							}

							reduce_promise(sendDataSub, function(val_all){
								ret_cb();
						    }, 5);
						}
					});
				});

				reduce_promise(sendData, function(val_all){
					hide_loading();
					alert('Berhasil generate user dari SIPD!');
			    }, 5);
			});
		}
	});
}

function singkronisasi_bidur_skpd_rpjm(data_skpd){
	var code_bidang = jQuery('#program-urbid a.btn-sm[title="Tambah Urusan"]').attr('href').split('code=')[1].split('&')[0];
	// get bidang urusan
	relayAjax({
		url: config.fmis_url+'/perencanaan-lima-tahunan/rpjmd-murni/datatable?code='+code_bidang+'&table=program-urbid',
		success: function(bidur){
			var sendData1 = [];
			bidur.data.map(function(bb, ii){
				sendData1.push(new Promise(function(resolve, reduce){
					// get skpd pelaksana per bidang urusan
					relayAjax({
						url: config.fmis_url+'/perencanaan-lima-tahunan/rpjmd-murni/datatable?code='+bb.code+'&table=program-pelaksana',
						success: function(skpd_pelaksana){
							bidur.data[ii].skpd_pelaksana = skpd_pelaksana.data;
							resolve();
						}
					});
				}));
			});
			Promise.all(sendData1)
    		.then(function(val_all){
				var url = jQuery('#program-urbid a.btn-sm[title="Tambah Urusan"]').attr('href');
				// get form tambah bidang urusan
				relayAjax({
					url: url+'&action=create',
					success: function(detail_form){
						var url_save_form = detail_form.form.split('action=\"')[1].split('\"')[0];
						var form = jQuery(detail_form.form);
						var urut = form.find('input[name="kdurut"]').val();
						var idbidkewenangan = form.find('input[name="idbidkewenangan"]').val();
		                var idrpjmdprogram = form.find('input[name="idrpjmdprogram"]').val();
						var urusan_all = {};
						var bidang_all = {};
						var sendData = [];
						form.find('#idurusan option').map(function(i, b){
							var id_urusan = jQuery(b).attr('value');
							if(id_urusan != ''){
								var nama_urusan = jQuery(b).text().split(' ');
								nama_urusan.shift();
								nama_urusan = nama_urusan.join(' ');
								urusan_all[nama_urusan] = { 
									id: id_urusan,
									bidang: {} 
								};
								sendData.push(new Promise(function(resolve, reduce){
									// get master all bidang by id urusan
									relayAjax({
										url: config.fmis_url+'/parameter/unit-organisasi/select-bidang/'+id_urusan+'?nama_urusan='+nama_urusan+'&id_urusan='+id_urusan,
										success: function(bidang){
											var nama_urusan = replace_string(this.url.split('nama_urusan=')[1].split('&')[0], true, true);
											var id_urusan = this.url.split('id_urusan=')[1].split('&')[0];
											for( var bb in bidang.bidang){
												if(bb != ''){
													var nama_bidang = bidang.bidang[bb].split(' ');
													nama_bidang.shift();
													nama_bidang = nama_bidang.join(' ');
													urusan_all[nama_urusan].bidang[bb] = nama_bidang;
													bidang_all[nama_bidang] = {
														id_bidang: bb,
														nama_bidang: nama_bidang,
														id_urusan: id_urusan,
														nama_urusan: nama_urusan
													};
												}
											}
											resolve();
										}
									});
								}));
							}
						});
						Promise.all(sendData)
	        			.then(function(val_all){
							getUnitFmis().then(function(unit_fmis){
								// console.log('unit_fmis, bidur, data_skpd', unit_fmis, bidur, data_skpd);
								window.data_bidur_skpd = [];
								var pilih_bidur = '';
								data_skpd.map(function(b, i){
									if(
										b.isskpd == 1
										&& unit_fmis[b.nama_skpd]
									){
										var cek_exist = false;
										var cek_exist_skpd = false;
										var nama_bidang_sipd = b.bidur1.split(' ');
										nama_bidang_sipd.shift();
										nama_bidang_sipd = nama_bidang_sipd.join(' ');
										bidur.data.map(function(bb, ii){
											if(bb.bidang.nmbidang == nama_bidang_sipd){
												cek_exist = true;
											}
											bb.skpd_pelaksana.map(function(bbb, iii){
												if(bbb.skpd.kdskpd == b.id_skpd){
													cek_exist_skpd = true;
												}
											});
										});
										if(
											(
												!cek_exist
												|| !cek_exist_skpd
											)
											&& bidang_all[nama_bidang_sipd]
										){
											var data_bidur = {
												urusan: bidang_all[nama_bidang_sipd].id_urusan,
												bidang: bidang_all[nama_bidang_sipd].id_bidang,
												nama_bidang: nama_bidang_sipd,
												id_skpd: b.id_skpd,
												id_skpd_fmis: unit_fmis[b.nama_skpd].id,
												skpd: b,
												bidur_exist: false
											};
											if(cek_exist){
												data_bidur.bidur_exist = true
											}
											data_bidur_skpd.push(data_bidur);
											pilih_bidur += ''
												+'<tr>'
													+'<td><input type="checkbox" value="'+b.id_skpd+'"></td>'
													+'<td>'+b.bidur1+'</td>'
													+'<td>'+b.nama_skpd+'</td>'
												+'</tr>';
										}else if(!bidang_all[nama_bidang_sipd]){
											console.log('Bidang SIPD tidak ditemukan', nama_bidang_sipd, bidang_all);
										}
									}
								});
								console.log('data_bidur_skpd', data_bidur_skpd);
								if(data_bidur_skpd.length >= 1){
									run_script('jQuery("#konfirmasi-bidur-skpd").DataTable().destroy();');
									jQuery('#konfirmasi-bidur-skpd tbody').html(pilih_bidur);
									var table = jQuery('#konfirmasi-bidur-skpd');
									table.attr('data-urut', urut);
									table.attr('data-idbidkewenangan', idbidkewenangan);
									table.attr('data-idrpjmdprogram', idrpjmdprogram);
									table.attr('data-url-save', url_save_form);
									table.attr('data-code-bidang', code_bidang);
									run_script('jQuery("#konfirmasi-bidur-skpd").DataTable({lengthMenu: [[20, 50, 100, -1], [20, 50, 100, "All"]]});');
									run_script('jQuery("#mod-konfirmasi-bidur-skpd").modal("show")');
								}else{
									run_script("initRpjmdTableDetail('program-urbid', 'table-program-urbid', '"+code_bidang+"')");
									alert('Berhasil singkroniasi bidang urusan dan SKPD di RPJMD');
								}
								hide_loading();
							});
						});
					}
				});
			});
		}
	});
}

function singkronisasi_program(sub_keg){
	window.sub_keg_renja = sub_keg;
	var program_fmis = {};
	var sub_keg_fmis = {};
	var url_tambah_program = jQuery('a.btn-sm[title="Tambah Program"]').attr('href');
	var id_sasaran = url_tambah_program.split('/').pop();
	pesan_loading('GET PROGRAM EXISTING UNTUK IDSASARAN = '+id_sasaran, true);
	// get program fmis
	relayAjax({
		url: config.fmis_url+'/perencanaan-tahunan/renja-murni/program/data/'+id_sasaran,
		success: function(program){
			var last = program.data.length - 1;
			program.data.reduce(function(sequence, nextData){
	            return sequence.then(function(current_data){
	        		return new Promise(function(resolve_reduce, reject_reduce){
	        			program_fmis[current_data.uraian] = current_data;
						pesan_loading('GET KEGIATAN EXISTING UNTUK IDPROGRAM = '+current_data.idrkpdrenjaprogram, true);
	        			// get kegiatan fmis
	        			relayAjax({
							url: config.fmis_url+'/perencanaan-tahunan/renja-murni/kegiatan/data/'+current_data.idrkpdrenjaprogram,
							success: function(kegiatan){
								program_fmis[current_data.uraian].kegiatan = {};
								var last = kegiatan.data.length - 1;
								kegiatan.data.reduce(function(sequence2, nextData2){
						            return sequence2.then(function(current_data2){
						        		return new Promise(function(resolve_reduce2, reject_reduce2){
						        			program_fmis[current_data.uraian].kegiatan[current_data2.uraian] = current_data2;
						        			pesan_loading('GET SUB KEGIATAN EXISTING UNTUK IDKEGIATAN = '+current_data2.idrkpdrenjakegiatan, true);
						        			// get sub kegiatan fmis
						        			relayAjax({
												url: config.fmis_url+'/perencanaan-tahunan/renja-murni/subkegiatan/data/'+current_data2.idrkpdrenjakegiatan,
												success: function(sub_kegiatan){
													program_fmis[current_data.uraian].kegiatan[current_data2.uraian].sub_kegiatan = sub_kegiatan.data;
													sub_kegiatan.data.map(function(b, i){
														sub_keg_fmis[b.uraian] = b;
													});
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
						        }, Promise.resolve(kegiatan.data[last]))
						        .then(function(data_last){
						        	resolve_reduce(nextData);
						        });
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
	        }, Promise.resolve(program.data[last]))
	        .then(function(data_last){
				run_script('jQuery("#konfirmasi-program").DataTable().destroy();');
				var daftar_sub = '';
				sub_keg_renja.map(function(b, i){
					var sub_giat = b.nama_sub_giat.split(' ');
					sub_giat.shift();
					sub_giat = sub_giat.join(' ');
					// cek jika sub giat belum ada di fmis maka ditampilkan
					if(!sub_keg_fmis[sub_giat]){
						daftar_sub += ''
							+'<tr>'
								+'<td><input type="checkbox" value="'+b.kode_sbl+'"></td>'
								+'<td>'+b.nama_program+'</td>'
								+'<td>'+b.nama_giat+'</td>'
								+'<td>'+b.nama_sub_giat+'</td>'
							+'</tr>';
					}
				});
				jQuery('#konfirmasi-program tbody').html(daftar_sub);
				pesan_loading('GET FORM TAMBAH PROGRAM UNTUK MENDAPATKAN PROGRAM RKPD', true);
				// load form tambah program
				relayAjax({
					url: url_tambah_program,
					success: function(form_tambah){
						var form = jQuery(form_tambah);
						var html_program_rkpd = form.find('select[name="idrkpdranwalprogram"]').html();
						jQuery('#mod-program-rkpd').html(html_program_rkpd);
						var table = jQuery('#konfirmasi-program');
						run_script('jQuery("#konfirmasi-program").DataTable({lengthMenu: [[20, 50, 100, -1], [20, 50, 100, "All"]]});');
						run_script('jQuery("#mod-konfirmasi-program").modal("show")');
						hide_loading();
					}
				});
	        });
		}
	});
}

function get_id_sub_unit_fmis(idsubkegiatan){
	return new Promise(function(resolve, reject){
		if(typeof id_sub_unit_fmis_global == 'undefined'){
			window.id_sub_unit_fmis_global = {};
		}
		if(typeof id_sub_unit_fmis_global[idsubkegiatan] == 'undefined'){
			relayAjax({
				url: config.fmis_url+'/perencanaan-tahunan/renja-murni/aktivitas/create/'+idsubkegiatan,
				success: function(form_tambah){
					id_sub_unit_fmis_global[idsubkegiatan] = jQuery(form_tambah).find('select[name="idsubunit"] option').eq(1).attr('value');
					resolve(id_sub_unit_fmis_global[idsubkegiatan]);
				}
			});
		}else{
			resolve(id_sub_unit_fmis_global[idsubkegiatan]);
		}
	});
}

function get_id_unit_fmis(){
	pesan_loading('GET ID UNIT FMIS', true);
	return new Promise(function(resolve, reject){
		if(typeof id_unit_fmis_global == 'undefined'){
			relayAjax({
				url: config.fmis_url+'/perencanaan-tahunan/renja-murni',
				success: function(renja){
					if(renja.data.length >= 1){
						window.id_unit_fmis_global = renja.data[0].idunit;
						resolve(id_unit_fmis_global);
					}else{
						reject();
					}
				}
			});
		}else{
			resolve(id_unit_fmis_global);
		}
	});
}

function get_master_prog_fmis(idsasaran){
	pesan_loading('GET MASTER PROGRAM FMIS UNTUK IDSASARAN = '+idsasaran, true);
	return new Promise(function(resolve, reject){
		if(typeof master_prog_fmis_global == 'undefined'){
			var master_prog_fmis_global = {
				hirarki: {},
				program: []
			};
			pesan_loading('GET MASTER URUSAN', true);
			// load urusan
			relayAjax({
				url: config.fmis_url+'/perencanaan-tahunan/renja-murni/program/pilih-program/'+idsasaran+'?load=urusan',
				success: function(html_urusan){
					pesan_loading('GET MASTER BIDANG', true);
					var sendData = [];
					jQuery(html_urusan).find('table td a').map(function(i, b){
						var tr = jQuery(b).closest('tr');
						var nama_urusan = tr.find('td').eq(1).text();
						var url_bidang = jQuery(b).attr('href');
						var id_urusan = url_bidang.split('&kode=')[1].split('&')[0];
						master_prog_fmis_global.hirarki[id_urusan] = {
							id: id_urusan,
							nama: nama_urusan,
							bidang: {}
						};
						sendData.push(new Promise(function(resolve2, reject2){
							// load bidang
							relayAjax({
								url: url_bidang,
								success: function(html_bidang){
									var url_programs = [];
									jQuery(html_bidang).find('table td a').map(function(i, b){
										var tr = jQuery(b).closest('tr');
										var nama_bidang = tr.find('td').eq(1).text();
										var url_program = jQuery(b).attr('href');
										var id_bidang = url_program.split('&kode=')[1].split('&')[0];
										master_prog_fmis_global.hirarki[id_urusan].bidang[id_bidang] = {
											id: id_bidang,
											nama: nama_bidang,
											program: {}
										}
										url_programs.push(url_program+'&id_urusan='+id_urusan+'&id_bidang='+id_bidang);
									});
									resolve2(url_programs);
								}
							});
						}));
					});
					Promise.all(sendData)
					.then(function(all_url_program){
						var last = all_url_program.length - 1;
						all_url_program.reduce(function(sequence, nextData){
				            return sequence.then(function(current_data){
				        		return new Promise(function(resolve_reduce, reject_reduce){
				        			var sendData = current_data.map(function(url_program, ii){
				        				return new Promise(function(resolve2, reject2){
											pesan_loading('GET MASTER PROGRAM', true);
						        			// load program
						        			relayAjax({
												url: url_program,
												success: function(html_program){
													var id_urusan = this.url.split('&id_urusan=')[1].split('&')[0];
													var id_bidang = this.url.split('&id_bidang=')[1].split('&')[0];
													jQuery(html_program).find('table td a').map(function(i, b){
														var tr = jQuery(b).closest('tr');
														var nama_program = tr.find('td').eq(1).text();
														var id_program = jQuery(b).attr('data-idprogram');
														var data_prog = {
															id: id_program,
															nama: nama_program,
															kegiatan: {}
														}
														master_prog_fmis_global.hirarki[id_urusan].bidang[id_bidang].program[id_program] = data_prog;
														master_prog_fmis_global.program[nama_program] = data_prog;
													});
													resolve2();
												}
											});
						        		});
				        			});
				        			Promise.all(sendData)
									.then(function(){
										resolve_reduce(nextData);
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
				        }, Promise.resolve(all_url_program[last]))
				        .then(function(data_last){
							resolve(master_prog_fmis_global);
				        });
					});
				}
			});
		}else{
			resolve(master_prog_fmis_global);
		}
	});
}

function get_master_keg_fmis(idrkpdrenjaprogram){
	pesan_loading('GET MASTER KEGIATAN FMIS UNTUK IDPROGRAM = '+idrkpdrenjaprogram, true);
	return new Promise(function(resolve, reject){
		if(typeof master_keg_fmis_global == 'undefined'){
			window.master_keg_fmis_global = {};
		}
		if(typeof master_keg_fmis_global[idrkpdrenjaprogram] == 'undefined'){
			// get master kegiatan by id program
			relayAjax({
				url: config.fmis_url+'/perencanaan-tahunan/renja-murni/kegiatan/pilih-kegiatan/'+idrkpdrenjaprogram+'?load=kegiatan',
				success: function(html_kegiatan){
					master_keg_fmis_global[idrkpdrenjaprogram] = {};
					jQuery(html_kegiatan).find('table td a').map(function(i, b){
						var tr = jQuery(b).closest('tr');
						var nama_kegiatan = tr.find('td').eq(1).text();
						var id_kegiatan = jQuery(b).attr('data-idkegiatan');
						var data_keg = {
							id: id_kegiatan,
							nama: nama_kegiatan
						}
						master_keg_fmis_global[idrkpdrenjaprogram][nama_kegiatan] = data_keg;
					});
					resolve(master_keg_fmis_global[idrkpdrenjaprogram]);
				}
			});
		}else{
			resolve(master_keg_fmis_global[idrkpdrenjaprogram]);
		}
	});
}

function cek_insert_kegiatan_fmis(program, sub_kegiatan_filter_program){
	var sub_kegiatan_filter_kegiatan = [];
	return new Promise(function(resolve, reduce){
		pesan_loading('GET KEGIATAN EXISTING DARI IDPROGRAM = '+program.idrkpdrenjaprogram, true);
		// get all kegiatan dan insert jika belum ada
		relayAjax({
			url: config.fmis_url+'/perencanaan-tahunan/renja-murni/kegiatan/data/'+program.idrkpdrenjaprogram,
			success: function(kegiatan_exist){
				var kdurut = 0;
				get_master_keg_fmis(program.idrkpdrenjaprogram)
				.then(function(master_kegiatan){
					var cek_kegiatan = {};
					var last = sub_kegiatan_filter_program.length - 1;
					sub_kegiatan_filter_program.reduce(function(sequence, nextData){
			            return sequence.then(function(current_data){
			        		return new Promise(function(resolve_reduce, reject_reduce){
			        			// cek proses kegiatan hanya yang nama programnya sama
			        			if(current_data.nama_program == program.uraian){
			        				// cek jika kegiatan sipd tidak ada di master kegiatan fmis
									if(master_kegiatan[current_data.nama_giat]){
										var cek_exist = false;
										kegiatan_exist.data.map(function(b, i){
											if(b.uraian == current_data.nama_giat){
												cek_exist = true;
											}
											if(kdurut <= +b.kdurut){
												kdurut = +b.kdurut;
											}
										});
										current_data.program_fmis = program;
			        					sub_kegiatan_filter_kegiatan.push(current_data);
										if(!cek_exist && !cek_kegiatan[current_data.nama_giat]){
											cek_kegiatan[current_data.nama_giat] = current_data;
						        			kdurut++;
				        					var data_post = {
				        						_token: _token,
				        						kdurut: kdurut,
				        						idkegiatan: master_kegiatan[current_data.nama_giat].id,
				        						uraian: current_data.nama_giat,
				        						pagu_tahun1: '0',
				        						pagu_tahun2: '0',
				        						pagu_tahun3: '0'
				        					};
				        					pesan_loading('SIMPAN KEGIATAN '+current_data.nama_giat, true);
				        					relayAjax({
												url: config.fmis_url+'/perencanaan-tahunan/renja-murni/kegiatan/create/'+program.idrkpdrenjaprogram,
												type: "post",
									            data: data_post,
									            success: function(res){
									            	resolve_reduce(nextData);
									            },
									            error: function(e){
									            	console.log('Error kegiatan!', e, this.data);
									            }
											});
				        				}else{
											resolve_reduce(nextData);
				        				}
									}else{
										console.log('nama kegiatan SIPD tidak ditemukan di master kegiatan FMIS', current_data.nama_giat, master_kegiatan);
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
			        }, Promise.resolve(sub_kegiatan_filter_program[last]))
			        .then(function(data_last){
			        	resolve(sub_kegiatan_filter_kegiatan);
			        });
				});
			}
		});
	});
}

function get_master_sub_keg_fmis(idrkpdrenjakegiatan){
	pesan_loading('GET MASTER SUB KEGIATAN FMIS UNTUK IDKEGIATAN = '+idrkpdrenjakegiatan, true);
	return new Promise(function(resolve, reject){
		if(typeof master_sub_keg_fmis_global == 'undefined'){
			window.master_sub_keg_fmis_global = {};
		}
		if(typeof master_sub_keg_fmis_global[idrkpdrenjakegiatan] == 'undefined'){
			// get master kegiatan by id program
			relayAjax({
				url: config.fmis_url+'/perencanaan-tahunan/renja-murni/subkegiatan/pilih-kegiatan/'+idrkpdrenjakegiatan+'?load=subkegiatan',
				success: function(html_kegiatan){
					master_sub_keg_fmis_global[idrkpdrenjakegiatan] = {};
					jQuery(html_kegiatan).find('table td a').map(function(i, b){
						var tr = jQuery(b).closest('tr');
						var nama_sub_kegiatan = tr.find('td').eq(1).text();
						var id_sub_kegiatan = jQuery(b).attr('data-idsubkegiatan');
						var data_sub_keg = {
							id: id_sub_kegiatan,
							nama: nama_sub_kegiatan
						}
						master_sub_keg_fmis_global[idrkpdrenjakegiatan][nama_sub_kegiatan] = data_sub_keg;
					});
					resolve(master_sub_keg_fmis_global[idrkpdrenjakegiatan]);
				}
			});
		}else{
			resolve(master_sub_keg_fmis_global[idrkpdrenjakegiatan]);
		}
	});
}

function cek_insert_sub_kegiatan_fmis(kegiatan, sub_kegiatan_filter_kegiatan){
	var sub_kegiatan_filter = [];
	return new Promise(function(resolve, reduce){
		pesan_loading('GET SUB KEGIATAN EXISTING DARI IDKEGIATAN =  '+kegiatan.idrkpdrenjakegiatan, true);
		// get all sub kegiatan dan insert jika belum ada
		relayAjax({
			url: config.fmis_url+'/perencanaan-tahunan/renja-murni/subkegiatan/data/'+kegiatan.idrkpdrenjakegiatan,
			success: function(sub_kegiatan_exist){
				var kdurut = 0;
				get_master_sub_keg_fmis(kegiatan.idrkpdrenjakegiatan)
				.then(function(master_sub_kegiatan){
					var cek_sub_kegiatan = {};
					var last = sub_kegiatan_filter_kegiatan.length - 1;
					sub_kegiatan_filter_kegiatan.reduce(function(sequence, nextData){
			            return sequence.then(function(current_data){
			        		return new Promise(function(resolve_reduce, reject_reduce){
			        			// cek proses kegiatan hanya yang nama programnya sama
			        			if(current_data.nama_giat == kegiatan.uraian){
									var nama_sub_giat = current_data.nama_sub_giat.split(' ');
									nama_sub_giat.shift();
									nama_sub_giat = nama_sub_giat.join(' ');
			        				// cek jika kegiatan sipd tidak ada di master kegiatan fmis
									if(master_sub_kegiatan[nama_sub_giat]){
										var cek_exist = false;
										sub_kegiatan_exist.data.map(function(b, i){
											if(b.uraian == nama_sub_giat){
												cek_exist = true;
											}
											if(kdurut <= +b.kdurut){
												kdurut = +b.kdurut;
											}
										});
										current_data.kegiatan_fmis = kegiatan;
										sub_kegiatan_filter.push(current_data);
										if(!cek_exist && !cek_sub_kegiatan[nama_sub_giat]){
											cek_sub_kegiatan[nama_sub_giat] = current_data;
						        			kdurut++;
				        					var data_post = {
				        						_token: _token,
				        						kdurut: kdurut,
				        						idsubkegiatan: master_sub_kegiatan[nama_sub_giat].id,
				        						uraian: nama_sub_giat,
				        						pagu_tahun1: '0',
				        						pagu_tahun2: '0',
				        						pagu_tahun3: '0',
				        						'table-pilih-subkegiatan_length': 10
				        					};
				        					pesan_loading('SIMPAN SUB KEGIATAN '+nama_sub_giat, true);
				        					relayAjax({
												url: config.fmis_url+'/perencanaan-tahunan/renja-murni/subkegiatan/create/'+kegiatan.idrkpdrenjakegiatan,
												type: "post",
									            data: data_post,
									            success: function(res){
									            	resolve_reduce(nextData);
									            },
									            error: function(e){
									            	console.log('Error kegiatan!', e, this.data);
									            }
											});
				        				}else{
				        					console.log('sub kegiatan sudah ada di fmis', current_data, sub_kegiatan_exist.data);
											resolve_reduce(nextData);
				        				}
									}else{
										console.log('nama sub kegiatan SIPD tidak ditemukan di master sub kegiatan FMIS', current_data.nama_sub_giat, nama_sub_giat, master_sub_kegiatan);
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
			        }, Promise.resolve(sub_kegiatan_filter_kegiatan[last]))
			        .then(function(data_last){
			        	resolve(sub_kegiatan_filter);
			        });
				});
			}
		});
	});
}