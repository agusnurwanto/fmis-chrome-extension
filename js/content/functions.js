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
	if(options.length){
		var start = options.url.split('start=');
		if(start.length >= 2){
			start = +(start[1].split('&')[0]);
		}else{
			options.url += '&start=0';
			start = 0;
			options.all_data = [];
			options.success2 = options.success;
		}
		var _length = options.url.split('length=');
		if(_length.length <= 1){
			options.url += '&length='+options.length;
		}
		pesan_loading('GET DATATABLE start='+start, true);
		options.success = function(items){
			items.data.map(function(b, i){
				options.all_data.push(b);
			});
			if(options.all_data.length >= items.recordsTotal){
				items.data = options.all_data;
				options.success2(items);
			}else{
				var newstart = options.all_data.length - 1;
				options.url = options.url.replace('&start='+start, '&start='+newstart);
				setTimeout(function(){
	                relayAjax(options);
	            }, 1000);
			}
		};
	}
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
			if(
				options.type == 'dari_rka'
				|| b.kelompok == 9
			){
				var golongan = b.kode_gol_standar_harga;
				var kelompok = b.kode_kel_standar_harga;
				var sub_kelompok = b.nama_sub_kel_standar_harga;
				var nama_subkelompok = b.nama_sub_kel_standar_harga;
				var item_ssh = b.nama_standar_harga;
				var nama_item = b.nama_standar_harga;
			}else{
				var rek = b.kode_kel_standar_harga.split('.');
				var golongan = rek[0]+'.'+rek[1]+'.'+rek[2]+'.'+rek[3]+'.'+rek[4];
				var kelompok = golongan+'.'+rek[5];
				var nama_subkelompok = b.kode_kel_standar_harga+' '+b.nama_kel_standar_harga;
				var item_ssh = b.kode_standar_harga;
				var nama_item = item_ssh+' '+b.id_standar_harga+' '+b.nama_standar_harga;
				var sub_kelompok = b.kode_kel_standar_harga;
			}
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
					nama: nama_subkelompok,
					jenis: b.kelompok,
					data: {}
				}
				ssh_sub_kelompok_all_length++;
			}
			data_ssh[golongan].data[kelompok].data[sub_kelompok].data[item_ssh] = {
				nama: nama_item,
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
			return new Promise(function(resolve, reject){
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
								|| jns_golongan == 9
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
		                	if(options.type != 'dari_rka'){
		            			run_script("initDatatable('golongan');");
		            		}
							singkronisasi_ssh_kelompok(data_ssh, resolve, options);
		                })
		                .catch(function(e){
		                    console.log(e);
		                });	
					}
				});
			});
		}
	}
}

function get_id_ssh(text){
	return replace_string(text, true, true);
	var _text = text.split(' ');
	var ret = text;
	if(_text[1]){
		ret = _text[0]+' '+_text[1];
	}
	return ret;
}

function singkronisasi_ssh_tarif(data_ssh, cb, options){
	var url_save_form = '';
	var form_code = '';
	var idssh_fmis = '';
	new Promise(function(resolve, reject){
		if(typeof cb == 'function'){
			console.log('BELUM SELESAI');
		}else{
			url_save_form = jQuery('#form').attr('action');
			form_code = url_save_form.split('/save/')[1];
			idssh_fmis = jQuery('#form .form-referensi > label').attr('for');
			resolve();
		}
	}).then(function(){
		pesan_loading('GET DATA STRUKTUR SSH FMIS', true);
		relayAjax({
			url: config.fmis_url+'/parameter/ssh/perkada-ssh/datatable-ref?code='+form_code+'&action=add',
			length: 5000,
			success: function(items){
				var all_ssh = {};
				data_ssh.map(function(b, i){
					if(b.kelompok == 9){
						var id_ssh = get_id_ssh(b.nama_standar_harga);
					}else{
						var id_ssh = get_id_ssh(b.kode_standar_harga+' '+b.id_standar_harga+' '+b.nama_standar_harga);
					}
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
					alert('Berhasil singkroniasi tarif SSH!');
		        })
		        .catch(function(e){
		            console.log(e);
		        });
			}
		});
	});
}

function singkronisasi_ssh_kelompok(data_ssh, cb, options){
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
	            	singkronisasi_ssh_sub_kelompok(data_ssh, cb, options);
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

function singkronisasi_ssh_sub_kelompok(data_ssh, cb, options){
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
									length: 1000,
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
			singkronisasi_ssh_item(data_ssh, cb, options);
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

function singkronisasi_ssh_item(data_ssh, cb, options){
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
							length: 1000,
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
												length: 1000,
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
															var keterangan_item = replace_string(data_ssh[__gol_id].data[__kelompok_id].data[__subkelompok_id].data[item_id].data.spek, true).substring(0, 250).trim();;
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
			singkronisasi_ssh_rekening(data_ssh, cb, options);
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

function singkronisasi_ssh_rekening(data_ssh, cb, options){
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
			if(options.type == 'dari_rka'){
				cb();
				// singkronisasi_ssh_tarif(options.data, cb, options);
			}else{
				hide_loading();
				pesan_loading('');
				jQuery('#persen-loading').attr('persen', '');
				jQuery('#persen-loading').attr('total', '');
				console.log('Berhasil singkron SSH dari SIPD!');
				alert('Berhasil singkron SSH dari SIPD!');
			}
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

function getMasterRek(kdrek1 = '4,5,6') {
	return new Promise(function(resolve, reject){
		if(typeof rekening_master == 'undefined'){
			window.rekening_master = {};
		}

		if(rekening_master[kdrek1]){
			resolve(rekening_master[kdrek1]);
		}else{
			relayAjax({
				url: config.fmis_url+'/parameter/rekening/datatable-rekening',
				type: "post",
	            data: {
	                _token: _token,
	                kdrek1: kdrek1,
	                exclude_table: 'ref_ssh_rekening',
	                tahun: config.tahun_anggaran
	            },
				success: function(rek){
					rekening_master[kdrek1] = {};
					rek.data.map(function(b, i){
						rekening_master[kdrek1][b.kdrek] = b;
					});
					resolve(rekening_master[kdrek1]);
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
						jQuery('#mod-program-rkpd').parent().show();
						var table = jQuery('#konfirmasi-program');
						table.attr('data-singkron-rka', '');
						run_script('jQuery("#konfirmasi-program").DataTable({lengthMenu: [[20, 50, 100, -1], [20, 50, 100, "All"]]});');
						run_script('jQuery("#mod-konfirmasi-program").modal("show")');
						hide_loading();
					}
				});
	        });
		}
	});
}

function singkronisasi_rka(sub_keg){
	window.sub_keg_renja_rka = sub_keg;
	var program_fmis = {};
	var sub_keg_fmis = {};
	var url_tambah_sub_kegiatan = jQuery('a.btn-sm[title="Tambah Sub Kegiatan"]').attr('href');
	var idkegiatan = url_tambah_sub_kegiatan.split('/').pop();
	pesan_loading('GET SUB KEGIATAN EXISTING UNTUK IDKEGIATAN = '+idkegiatan, true);
	// get sub kegiatan fmis
	relayAjax({
		url: config.fmis_url+'/perencanaan-tahunan/renja-murni/subkegiatan/data/'+idkegiatan,
		success: function(sub_kegiatan){
			sub_kegiatan.data.map(function(b, i){
				sub_keg_fmis[b.uraian] = b;
			});
			run_script('jQuery("#konfirmasi-program").DataTable().destroy();');
			var daftar_sub = '';
			sub_keg_renja_rka.map(function(b, i){
				var sub_giat = b.nama_sub_giat.split(' ');
				sub_giat.shift();
				sub_giat = sub_giat.join(' ');
				// cek sub giat yang ada di kegiatan ini saja yang akan ditampilkan di popup
				if(sub_keg_fmis[sub_giat]){
					sub_keg_renja_rka[i].sub_keg_fmis = sub_keg_fmis[sub_giat];
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
			jQuery('#mod-program-rkpd').parent().hide();
			var table = jQuery('#konfirmasi-program');
			table.attr('data-singkron-rka', idkegiatan);
			run_script('jQuery("#konfirmasi-program").DataTable({lengthMenu: [[20, 50, 100, -1], [20, 50, 100, "All"]]});');
			run_script('jQuery("#mod-konfirmasi-program").modal("show")');
			hide_loading();
		}
	});
}

function get_id_sub_unit_fmis(idsubkegiatan){
	pesan_loading('GET ID SUB UNIT DARI IDSUBKEGIATAN = '+idsubkegiatan, true);
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

function get_rka_sipd(kode_sbl){
	return new Promise(function(resolve, reduce){
		window.lanjut_singkron_rka = resolve;
		var data = {
		    message:{
		        type: "get-url",
		        content: {
				    url: config.url_server_lokal,
				    type: 'post',
				    data: { 
						action: 'get_sub_keg_rka',
						tahun_anggaran: config.tahun_anggaran,
						kode_sbl: kode_sbl,
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

function singkronisasi_rka_modal(idkegiatan){
	show_loading();
	window.ssh_not_found_global = [];
	var sub_kegiatan = [];
	jQuery('#konfirmasi-program tbody tr input[type="checkbox"]').map(function(i, b){
		var cek = jQuery(b).is(':checked');
		if(cek){
			var kode_sbl = jQuery(b).val();
			sub_keg_renja_rka.map(function(bb, ii){
				if(bb.kode_sbl == kode_sbl){
					sub_kegiatan.push(bb);
				}
			});
		}
	});
	if(sub_kegiatan.length >= 1){
		console.log('sub_kegiatan selected', sub_kegiatan);
		var last = sub_kegiatan.length - 1;
		sub_kegiatan.reduce(function(sequence, nextData){
            return sequence.then(function(current_data){
        		return new Promise(function(resolve_reduce, reject_reduce){
					pesan_loading('GET DATA RKA DI WP-SIPD UNTUK IDSUBKEGIATAN = '+current_data.sub_keg_fmis.idrkpdrenjasubkegiatan+', kode_sbl = '+current_data.kode_sbl, true);
					get_rka_sipd(current_data.kode_sbl)
					.then(function(rka_sipd){
						new Promise(function(resolve, reject){
							pesan_loading('GET AKTIVITAS EXISTING DARI IDSUBKEGIATAN = '+current_data.sub_keg_fmis.idrkpdrenjasubkegiatan, true);
							// get all aktivitas dan insert jika belum ada
							relayAjax({
								url: config.fmis_url+'/perencanaan-tahunan/renja-murni/aktivitas/data/'+current_data.sub_keg_fmis.idrkpdrenjasubkegiatan,
								success: function(aktivitas_exist){
									current_data.aktivitas = aktivitas_exist.data;
									cek_insert_aktivitas_fmis(rka_sipd, current_data)
									.then(function(){
										resolve();
									});
								}
							});
						})
						.then(function(){
							pesan_loading('GET AKTIVITAS EXISTING DARI IDSUBKEGIATAN = '+current_data.sub_keg_fmis.idrkpdrenjasubkegiatan+' UNTUK SINGKRON RKA', true);
							// get all aktivitas hasil dari insert sebelumnya
							relayAjax({
								url: config.fmis_url+'/perencanaan-tahunan/renja-murni/aktivitas/data/'+current_data.sub_keg_fmis.idrkpdrenjasubkegiatan,
								success: function(aktivitas_exist){
									current_data.aktivitas = aktivitas_exist.data;
									cek_insert_rka_fmis(rka_sipd, current_data)
									.then(function(){
										resolve_reduce(nextData);
									});
								}
							});
						})
					});
        		})
                .catch(function(e){
                    console.log(e, current_data);
                    return Promise.resolve(nextData);
                });
            })
            .catch(function(e){
                console.log(e);
                return Promise.resolve(nextData);
            });
        }, Promise.resolve(sub_kegiatan[last]))
        .then(function(data_last){
        	if(ssh_not_found_global.length >= 1){
        		var pesan_ssh = 'Data SSH tidak ditemukan dari PERKADA SSH { '+ssh_not_found_global.join('; ')+' }';
        		alert(pesan_ssh);
        		console.log(pesan_ssh);
        	}
        	alert('Berhasil singkroniasi data RKA sub kegiatan dari WP-SIPD!');
			run_script('jQuery("#mod-konfirmasi-program").modal("hide")');
			hide_loading();
        });
	}else{
		alert('Pilih sub kegiatan dulu!');
	}
}

function get_master_sumberdana(idsubkegiatan){
	pesan_loading('GET MASTER SUMBER DANA DARI IDSUBKEGIATAN = '+idsubkegiatan, true);
	return new Promise(function(resolve, reject){
		if(typeof master_sumberdana_global == 'undefined'){
			window.master_sumberdana_global = {};
		}
		if(typeof master_sumberdana_global[idsubkegiatan] == 'undefined'){
			relayAjax({
				url: config.fmis_url+'/perencanaan-tahunan/renja-murni/aktivitas/pilih-data/'+idsubkegiatan+'?load=sumberdana1',
				success: function(form_tambah){
					var data = {};
					jQuery(form_tambah).find('a.btn-choose-data-sumberdana1').map(function(i, b){
						data[jQuery(b).attr('data-uraian')] = jQuery(b).attr('data-idsumberdana');
					});
					master_sumberdana_global[idsubkegiatan] = data;
					resolve(master_sumberdana_global[idsubkegiatan]);
				}
			});
		}else{
			resolve(master_sumberdana_global[idsubkegiatan]);
		}
	});
}

function get_rka_aktivitas(idrkpdrenjaaktivitas){
	pesan_loading('GET RKA EXISTING DARI AKTIVITAS = '+idrkpdrenjaaktivitas, true);
	return new Promise(function(resolve, reject){
		if(typeof master_aktivitas_global == 'undefined'){
			window.master_aktivitas_global = {};
		}
		if(typeof master_aktivitas_global[idrkpdrenjaaktivitas] == 'undefined'){
			relayAjax({
				url: config.fmis_url+'/perencanaan-tahunan/renja-murni/aktivitas/rincbelanja/data/'+idrkpdrenjaaktivitas,
				success: function(rka){
					master_aktivitas_global[idrkpdrenjaaktivitas] = rka.data;
					resolve(master_aktivitas_global[idrkpdrenjaaktivitas]);
				},
				error: function(e){
					console.log('Error get RKA existing dari aktivitas', idrkpdrenjaaktivitas);
				}
			});
		}else{
			resolve(master_aktivitas_global[idrkpdrenjaaktivitas]);
		}
	});
}

function get_id_ssh_rka_lama(rka){
	pesan_loading('GET DATA SSH "'+rka.nama_komponen+'" HARGA "'+rka.harga_satuan+'"', true);
	return new Promise(function(resolve, reject){
		var unik_rincian = (rka.harga_satuan+' '+rka.satuan+' '+rka.nama_komponen).substring(0, 250).trim();
		if(typeof master_ssh_rka_global == 'undefined'){
			window.master_ssh_rka_global = {};
		}
		if(typeof master_ssh_rka_global[unik_rincian] == 'undefined'){
			singkronisasi_ssh({
				status: 'success',
				type: 'dari_rka',
				data: [{
					kode_standar_harga: config.tahun_anggaran,
					nama_standar_harga: unik_rincian,
					spek: rka.spek_komponen,
					satuan: rka.satuan,
					kelompok: 1,
					harga: rka.harga_satuan,
					kode_kel_standar_harga: config.tahun_anggaran,
					nama_kel_standar_harga: rka.nama_komponen,
					rek_belanja: [{
						kode_akun: rka.kode_akun,
						nama_akun: rka.nama_akun
					}]
				}]
			})
			.then(function(ssh){
				console.log('Cari dan insert tarif data jika belum ada!');
			})
			.then(function(ssh){
				master_ssh_rka_global[unik_rincian] = ssh;
				resolve(master_ssh_rka_global[unik_rincian]);
			});
		}else{
			resolve(master_ssh_rka_global[unik_rincian]);
		}
	});
}

function get_id_ssh_rka(rka, idrkpdrenjaaktivitas){
	pesan_loading('GET DATA SSH "'+rka.nama_komponen+'" HARGA "'+rka.harga_satuan+'"', true);
	return new Promise(function(resolve, reject){
		var unik_rincian = (rka.harga_satuan+' '+rka.satuan+' '+rka.nama_komponen).substring(0, 250).trim();
		if(typeof master_ssh_rka_global == 'undefined'){
			window.master_ssh_rka_global = {};
		}
		if(typeof master_ssh_rka_global[unik_rincian] == 'undefined'){
			var unik_rincian_search = unik_rincian.split('[')[0];
			relayAjax({
				url: config.fmis_url+'/perencanaan-tahunan/renja-murni/aktivitas/rincbelanja/datassh4/'+idrkpdrenjaaktivitas+'?idrkpdrenjaaktivitas='+idrkpdrenjaaktivitas+'&draw=1&columns%5B0%5D%5Bdata%5D=action&columns%5B0%5D%5Bname%5D=action&columns%5B0%5D%5Bsearchable%5D=false&columns%5B0%5D%5Borderable%5D=false&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=kdurut&columns%5B1%5D%5Bname%5D=kdurut&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=true&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=uraian&columns%5B2%5D%5Bname%5D=uraian&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=true&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=satuan&columns%5B3%5D%5Bname%5D=satuan&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=true&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=nilai&columns%5B4%5D%5Bname%5D=nilai&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=true&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=spesifikasi&columns%5B5%5D%5Bname%5D=spesifikasi&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=true&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&order%5B0%5D%5Bcolumn%5D=0&order%5B0%5D%5Bdir%5D=asc&start=0&length=10&search%5Bvalue%5D='+unik_rincian_search+'&search%5Bregex%5D=false',
				success: function(ssh){
					if(ssh.data.length == 0){
						console.log('Item SSH tidak ditemukan', unik_rincian, rka);
						resolve(false);
					}else{
						var data_ssh = ssh.data[0];
						relayAjax({
							url: config.fmis_url+'/perencanaan-tahunan/renja-murni/aktivitas/rincbelanja/pilih-data/'+data_ssh.idssh_4+'?load=rekening&idrkpdrenjaaktivitas='+idrkpdrenjaaktivitas,
							success: function(rekening_html){
								var rek_sipd = [];
								rka.kode_akun.split('.').map(function(b, n){
									rek_sipd.push(+b);
								});
								rek_sipd = rek_sipd.join('.');
								var cek_rek = false;
								jQuery(rekening_html).find('#table-pilih-rekening a.btn-choose-rekening').map(function(i, b){
									var tr = jQuery(b).closest('tr');
									var kode_akun = tr.find('td').eq(1).text().trim();
									if(rek_sipd == kode_akun){
										data_ssh.nama_akun = tr.find('td').eq(2).text().trim();
									    data_ssh.harga = jQuery(b).data('harga');
									    data_ssh.kdrek1 = jQuery(b).data('kdrek1');
									    data_ssh.kdrek2 = jQuery(b).data('kdrek2');
									    data_ssh.kdrek3 = jQuery(b).data('kdrek3');
									    data_ssh.kdrek4 = jQuery(b).data('kdrek4');
									    data_ssh.kdrek5 = jQuery(b).data('kdrek5');
									    data_ssh.kdrek6 = jQuery(b).data('kdrek6');
									    data_ssh.uraian = jQuery(b).data('uraian') + '/' + jQuery(b).data('nmrek6');
									    data_ssh.satuan = jQuery(b).data('satuan');
									    data_ssh.uraian_satuan = jQuery(b).data('uraian_satuan');
									    cek_rek = true;
									}
								});
								if(cek_rek){
									master_ssh_rka_global[unik_rincian] = data_ssh;
									resolve(master_ssh_rka_global[unik_rincian]);
								}else{
									pesan_loading('DATA SSH "'+rka.nama_komponen+'" belum tersetting rekenginnya. Cari dari master rekenging.', true);
									get_master_rekening_rka(idrkpdrenjaaktivitas, data_ssh.idssh_4)
									.then(function(rekening){
										var rek_sipd = [];
										rka.kode_akun.split('.').map(function(b, n){
											rek_sipd.push(+b);
										});
										rek_sipd = rek_sipd.join('.');
										var cek_rek = false;
										rekening.data.map(function(b, i){
											if(rek_sipd == b.kode){
												data_ssh.nama_akun = b.nmrek6;
											    data_ssh.kdrek1 = b.kdrek1;
											    data_ssh.kdrek2 = b.kdrek2;
											    data_ssh.kdrek3 = b.kdrek3;
											    data_ssh.kdrek4 = b.kdrek4;
											    data_ssh.kdrek5 = b.kdrek5;
											    data_ssh.kdrek6 = b.kdrek6;
											    data_ssh.uraian = data_ssh.uraian + '/' + b.nmrek6;
											    data_ssh.harga = data_ssh.nilai;
											    data_ssh.uraian_satuan = data_ssh.satuan;
											    data_ssh.satuan = data_ssh.idsatuan;
											    cek_rek = true;
											}
										});
										if(cek_rek){
											master_ssh_rka_global[unik_rincian] = data_ssh;
											resolve(master_ssh_rka_global[unik_rincian]);
										}else{
											console.log('Rekening tidak ditemukan untuk SSH', unik_rincian, rka, data_ssh);
											resolve(false);
										}
									});
								}
							}
						});
					}
				},
				error: function(e){
					console.log('Error get RKA existing dari aktivitas', idrkpdrenjaaktivitas);
				}
			});
		}else{
			resolve(master_ssh_rka_global[unik_rincian]);
		}
	});
}

function get_master_rekening_rka(idrkpdrenjaaktivitas, idssh_4){
	return new Promise(function(resolve, reject){
		if(typeof master_rek_rka_global == 'undefined'){
			relayAjax({
				url: config.fmis_url+'/perencanaan-tahunan/renja-murni/aktivitas/rincbelanja/pilih-rekening/'+idssh_4+'?idrkpdrenjaaktivitas='+idrkpdrenjaaktivitas+'&draw=1&columns%5B0%5D%5Bdata%5D=action&columns%5B0%5D%5Bname%5D=action&columns%5B0%5D%5Bsearchable%5D=false&columns%5B0%5D%5Borderable%5D=false&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=kode&columns%5B1%5D%5Bname%5D=kode&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=true&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=nmrek6&columns%5B2%5D%5Bname%5D=nmrek6&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=true&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=nilai&columns%5B3%5D%5Bname%5D=nilai&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=true&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&order%5B0%5D%5Bcolumn%5D=0&order%5B0%5D%5Bdir%5D=asc&start=0&length=5000&search%5Bvalue%5D=&search%5Bregex%5D=false',
				success: function(rekening){
					window.master_rek_rka_global = rekening;
					resolve(master_rek_rka_global);
				}
			});
		}else{
			resolve(master_rek_rka_global);
		}
	});
}

function cek_insert_rka_fmis(rka_sipd, sub_keg){
	return new Promise(function(resolve, reject){
		var last1 = sub_keg.aktivitas.length - 1;
		sub_keg.aktivitas.reduce(function(sequence, nextData){
            return sequence.then(function(aktivitas){
        		return new Promise(function(resolve_reduce, reject_reduce){
        			get_rka_aktivitas(aktivitas.idrkpdrenjaaktivitas)
					.then(function(data_rka){
						var last = rka_sipd.length - 1;
						var kdurut = 0;
						console.log('cek dan insert RKA', rka_sipd);
						rka_sipd.reduce(function(sequence2, nextData2){
				            return sequence2.then(function(current_data){
				        		return new Promise(function(resolve_reduce2, reject_reduce2){
				        			var nama_aktivitas = replace_string(current_data.subs_bl_teks+' | '+current_data.ket_bl_teks, true, true).substring(0, 500).trim();
			        				if(nama_aktivitas == aktivitas.uraian){
			        					var nama_rincian = replace_string(current_data.nama_komponen+' | '+current_data.spek_komponen, false, false).substring(0, 500).trim();
			        					var cek_exist = false;
										data_rka.map(function(b, i){
											var uraian_belanja = replace_string(b.uraian_belanja, false, false);
											if(uraian_belanja == nama_rincian){
												cek_exist = true;
											}
											if(kdurut <= +b.kdurut){
												kdurut = +b.kdurut;
											}
										});
										if(!cek_exist){
											current_data.nama_rincian = nama_rincian;
											get_id_ssh_rka(current_data, aktivitas.idrkpdrenjaaktivitas)
											.then(function(ssh){
												if(ssh){
													kdurut++;
							        				var data_post = {
							        					_token: _token,
							        					idsumberdana : aktivitas.idsumberdana1,
							        					kdurut : kdurut,
							        					idsatuanindikator : '',
							        					idssh_4 : ssh.idssh_4,
							        					kdrek1 : ssh.kdrek1,
							        					kdrek2 : ssh.kdrek2,
							        					kdrek3 : ssh.kdrek3,
							        					kdrek4 : ssh.kdrek4,
							        					kdrek5 : ssh.kdrek5,
							        					kdrek6 : ssh.kdrek6,
							        					uraian_idssh_4 : ssh.uraian,
							        					uraian_belanja : nama_rincian,
							        					idsatuan1 : ssh.idsatuan,
							        					volume_1 : current_data.volume1,
							        					uraian_satuan1 : ssh.uraian_satuan,
							        					idsatuan2 : '',
							        					volume_2 : '',
							        					uraian_satuan2 : '',
							        					idsatuan3 : '',
							        					volume_3 : '',
							        					uraian_satuan3 : '',
							        					harga : ssh.harga,
							        				}
							        				pesan_loading('SIMPAN RINCIAN "'+ssh.uraian+'" AKTIVITAS "'+aktivitas.uraian+'" SUBKEGIATAN "'+sub_keg.nama_sub_giat+'"', true);
						        					relayAjax({
														url: config.fmis_url+'/perencanaan-tahunan/renja-murni/aktivitas/rincbelanja/create/'+aktivitas.idrkpdrenjaaktivitas,
														type: "post",
											            data: data_post,
											            success: function(res){
											            	resolve_reduce2(nextData2);
											            },
											            error: function(e){
											            	console.log('Error save aktivitas!', e, this.data);
											            }
													});
												}else{
													var unik_rincian = (current_data.harga_satuan+' '+current_data.satuan+' '+current_data.nama_komponen).substring(0, 250).trim();
													ssh_not_found_global.push(unik_rincian);
													resolve_reduce2(nextData2);
												}
					        				});
				        				}else{
				        					console.log('Item belanja "'+nama_rincian+'" sudah ada!');
			        						resolve_reduce2(nextData2);
				        				}
			        				}else{
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
				        }, Promise.resolve(rka_sipd[last]))
				        .then(function(data_last){
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
        }, Promise.resolve(sub_keg.aktivitas[last1]))
        .then(function(data_last){
        	resolve();
        });
    });
}

function cek_insert_aktivitas_fmis(rka_sipd, sub_keg){
	return new Promise(function(resolve, reject){
		get_id_sub_unit_fmis(sub_keg.sub_keg_fmis.idrkpdrenjasubkegiatan)
		.then(function(id_sub_unit){
			get_master_sumberdana(sub_keg.sub_keg_fmis.idrkpdrenjasubkegiatan)
			.then(function(master_sumberdana){
				getIdSatuan('Paket', false, {
					data: {}
				})
				.then(function(satuan_fmis){
					var last = rka_sipd.length - 1;
					var cek_aktivitas = {};
					var kdurut = 0;
					rka_sipd.reduce(function(sequence, nextData){
			            return sequence.then(function(current_data){
			        		return new Promise(function(resolve_reduce, reject_reduce){
			        			var nama_aktivitas = replace_string(current_data.subs_bl_teks+' | '+current_data.ket_bl_teks, true, true).substring(0, 500).trim();
			        			if(!cek_aktivitas[nama_aktivitas]){
			        				cek_aktivitas[nama_aktivitas] = current_data;
			        				var cek_exist = false;
			        				sub_keg.aktivitas.map(function(b, i){
			        					var aktivitas_fmis = replace_string(b.uraian, true, true);
			        					if(aktivitas_fmis == nama_aktivitas){
			        						cek_exist = true;
			        					}
			        					if(kdurut <= +b.kdurut){
			        						kdurut = +b.kdurut;
			        					}
			        				});
			        				if(!cek_exist){
					        			kdurut++;
					        			var idsumberdana1 = '5';
					        			var uraian_sumberdana1 = 'Pendapatan Transfer Pemerintah Pusat';
					        			var sumber_dana_sipd = current_data.sumber_dana[0].nama_dana.split('] - ')[1].replace(/ - /g,'-').trim();
					        			if(master_sumberdana[sumber_dana_sipd]){
					        				idsumberdana1 = master_sumberdana[sumber_dana_sipd];
					        				uraian_sumberdana1 = sumber_dana_sipd;
					        			}
					        			var data_post = {
					        				_token: _token,
					        				kdurut: kdurut,
					        				idsatuanindikator: '',
					        				uraian: nama_aktivitas,
					        				idsubunit: id_sub_unit,
					        				idsumberdana1: idsumberdana1,
					        				uraian_sumberdana1: uraian_sumberdana1,
					        				idsumberdana2: '',
					        				uraian_sumberdana2: '',
					        				idsatuan1: satuan_fmis.data.idsatuan,
					        				uraian_satuan1: satuan_fmis.data.uraian_satuan,
					        				idsatuan2: '',
					        				uraian_satuan2: '',
					        				pagu: 0
					        			}
										pesan_loading('SIMPAN AKTIVITAS '+nama_aktivitas+' SUBKEGIATAN '+sub_keg.nama_sub_giat, true);
			        					relayAjax({
											url: config.fmis_url+'/perencanaan-tahunan/renja-murni/aktivitas/create/'+sub_keg.sub_keg_fmis.idrkpdrenjasubkegiatan,
											type: "post",
								            data: data_post,
								            success: function(res){
								            	resolve_reduce(nextData);
								            },
								            error: function(e){
								            	console.log('Error save aktivitas!', e, this.data);
								            }
										});
					        		}else{
					        			console.log('Atifitas sudah ada', nama_aktivitas, sub_keg.nama_sub_giat);
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
			        }, Promise.resolve(rka_sipd[last]))
			        .then(function(data_last){
			        	resolve();
			        });
			    });
		    });
	    });
    });
}

function singkronisasi_program_modal(){
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
				show_loading();
				var sub_kegiatan_filter_program = [];
				var sub_kegiatan_filter_kegiatan = [];
				var sub_kegiatan_filter_sub_kegiatan = [];
				var id_sasaran = jQuery('a.btn-sm[title="Tambah Program"]').attr('href').split('/').pop();
				new Promise(function(resolve, reject){
					get_master_prog_fmis(id_sasaran)
					.then(function(master_program){
						pesan_loading('GET PROGRAM EXISTING DARI IDSASARAN = '+id_sasaran, true);
						// get program fmis dan insert jika belum ada
						relayAjax({
							url: config.fmis_url+'/perencanaan-tahunan/renja-murni/program/data/'+id_sasaran,
							success: function(program_exist){
								var cek_program = {};
								var last = sub_kegiatan.length - 1;
								var kdurut = 0;
								// sub kegiatan yang sudah dipilih kemudian dilooping satu per satu
								sub_kegiatan.reduce(function(sequence, nextData){
						            return sequence.then(function(current_data){
						        		return new Promise(function(resolve_reduce, reject_reduce){
					        				var check_exist = false;
					        				program_exist.data.map(function(b, i){
					        					if(current_data.nama_program == b.uraian){
					        						check_exist = true;
					        					}
					        					if(kdurut <= +b.kdurut){
					        						kdurut = +b.kdurut;
					        					}
					        				});
					        				// cek jika sub kegiatan memiliki nama program yang sama dengan program yang sudah ditambahkan
					        				if(!check_exist){
					        					// cek jika sub kegiatan memiliki nama program yang ada di master program FMIS
					        					if(master_program.program[current_data.nama_program]){
					        						// cek jika sudah pernah disimpan, jangan disimpan lagi
					        						if(!cek_program[current_data.nama_program]){
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
														pesan_loading('SIMPAN PROGRAM '+current_data.nama_program, true);
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
						        						sub_kegiatan_filter_program.push(current_data);
								        				resolve_reduce(nextData);
								        			}
						        				}else{
						        					console.log('Program "'+current_data.nama_program+'" tidak ditemukan di master program FMIS', master_program);
					        						resolve_reduce(nextData);
						        				}
					        				}else{
					        					sub_kegiatan_filter_program.push(current_data);
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
					return new Promise(function(resolve, reject){
						if(sub_kegiatan_filter_program.length >= 1){
							console.log('sub_kegiatan_filter_program', sub_kegiatan_filter_program);
							pesan_loading('GET PROGRAM EXISTING DARI IDSASARAN = '+id_sasaran, true);
							// get all program fmis
							relayAjax({
								url: config.fmis_url+'/perencanaan-tahunan/renja-murni/program/data/'+id_sasaran,
								success: function(program_exist){
									if(program_exist.data.length >= 1){
										var last = program_exist.data.length - 1;
										program_exist.data.reduce(function(sequence, nextData){
								            return sequence.then(function(current_data){
								        		return new Promise(function(resolve_reduce, reject_reduce){
													cek_insert_kegiatan_fmis(current_data, sub_kegiatan_filter_program)
													.then(function(filter_kegiatan){
														filter_kegiatan.map(function(b, i){
															sub_kegiatan_filter_kegiatan.push(b);
														});
														resolve_reduce(nextData);
													})
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
								        	resolve();
								        });
									}else{
										console.log('program_exist kosong', program_exist.data);
										resolve();
									}
								}
							});
						}else{
							console.log('sub_kegiatan_filter_program kosong', sub_kegiatan_filter_program);
							resolve();
						}
					});
				})
				.then(function(){
					return new Promise(function(resolve, reject){
						console.log('sub_kegiatan_filter_kegiatan', sub_kegiatan_filter_kegiatan);
						if(sub_kegiatan_filter_kegiatan.length >= 1){
							var cek_program = {};
							var last = sub_kegiatan_filter_kegiatan.length - 1;
							sub_kegiatan_filter_kegiatan.reduce(function(sequence, nextData){
					            return sequence.then(function(current_data){
					        		return new Promise(function(resolve_reduce, reject_reduce){
					        			if(!cek_program[current_data.program_fmis.idrkpdrenjaprogram]){
					        				cek_program[current_data.program_fmis.idrkpdrenjaprogram] = current_data;
				        					pesan_loading('GET KEGIATAN EXISTING DARI IDPROGRAM =  '+current_data.program_fmis.idrkpdrenjaprogram, true);
											// get all kegiatan by id program
											relayAjax({
												url: config.fmis_url+'/perencanaan-tahunan/renja-murni/kegiatan/data/'+current_data.program_fmis.idrkpdrenjaprogram,
												success: function(kegiatan_exist){
													if(kegiatan_exist.data.length >= 1){
														var last2 = kegiatan_exist.data.length - 1;
														kegiatan_exist.data.reduce(function(sequence2, nextData2){
												            return sequence2.then(function(current_data2){
												        		return new Promise(function(resolve_reduce2, reject_reduce2){
																	cek_insert_sub_kegiatan_fmis(current_data2, sub_kegiatan_filter_kegiatan)
																	.then(function(filter_subkegiatan){
																		filter_subkegiatan.map(function(b, i){
																			sub_kegiatan_filter_sub_kegiatan.push(b);
																		});
																		resolve_reduce2(nextData2);
																	})
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
												}
											});
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
					        	resolve();
					        });
						}else{
							console.log('sub_kegiatan_filter_kegiatan kosong', sub_kegiatan_filter_kegiatan);
							resolve();
						}
					});
				})
				.then(function(){
					alert('Berhasil singkroniasi data program, kegiatan dan sub kegiatan dari WP-SIPD!');
					run_script("tableProgram.ajax.reload(null, false)");
					run_script('jQuery("#mod-konfirmasi-program").modal("hide")');
					hide_loading();
					console.log('sub_kegiatan_filter_program, sub_kegiatan_filter_kegiatan, sub_kegiatan_filter_sub_kegiatan', sub_kegiatan_filter_program, sub_kegiatan_filter_kegiatan, sub_kegiatan_filter_sub_kegiatan);
				});
			}
		}else{
			alert('Pilih sub kegiatan dulu!');
		}
	}else{
		alert('Pilih program RKPD dulu!');
	}
}

function singkronisasi_bidur_skpd_rpjm_modal(){
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
		show_loading();
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
			        	hide_loading();
						alert('Berhasil singkroniasi bidang urusan dan SKPD di RPJMD');
					});
				}
			});
        });
	}else{
		alert("Pilih SKPD dulu!");
	}
}

function singkronisasi_sumberdana(sd_sipd){
	pesan_loading('GET MASTER SUMBER DANA FMIS', true);
	// get all sumber dana fmis
	relayAjax({
		url: config.fmis_url+'/parameter/simda-ng/sumber-dana/datatable',
		success: function(sd_fmis){
			var sd_belum_ada = {};
			var nama_sd_belum_ada = [];
			var last = sd_sipd.length - 1;
			sd_sipd.reduce(function(sequence, nextData){
	            return sequence.then(function(current_data){
	        		return new Promise(function(resolve_reduce, reject_reduce){
	        			var check_exist = false;
	        			var nama_sd_sipd = current_data.nama_dana.split('] - ')[1].replace(/ - /g,'-').trim();
	        			sd_fmis.data.map(function(b, i){
	        				if(nama_sd_sipd == b.uraian){
	        					check_exist = true;
	        				}
	        			});
	        			if(!check_exist){
	        				sd_belum_ada[nama_sd_sipd] = current_data;
	        				nama_sd_belum_ada.push(nama_sd_sipd);
	        			}
	        			resolve_reduce(nextData);
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
	        }, Promise.resolve(sd_sipd[last]))
	        .then(function(data_last){
	        	console.log('sd_belum_ada', sd_belum_ada, nama_sd_belum_ada);
	        	console.log('Pengembangan selanjutnya akan dibuat mapping sumber dana di tabel data_sumber_dana WP-SIPD. Sementara dipending dulu, lanjut ke singkron RKA!');
	        	hide_loading();
				alert('Nama sumber dana yang ada di WP-SIPD tapi belum ada di FMIS '+nama_sd_belum_ada.length+' dari total '+sd_sipd.length+' sumberdana! '+nama_sd_belum_ada.join(', '));
			});
		}
	});
}

function mapping_rek_fmis(rek){
	var size = Object.keys(rek.data_rek).length;
	if(size >= 1){
		var data_rek = [];
		var jml = 0;
		for(var i in rek.data_rek){
			jml++;
			data_rek.push(i+' '+rek.data_rek[i].nama_akun);
		}
		var pesan = "Rekening yang tidak ada di FMIS ada = "+jml+". "+data_rek.join(', ');
		alert(pesan);
		console.log(pesan, rek.data_rek);
	}
	alert(rek.message);
	hide_loading();
}