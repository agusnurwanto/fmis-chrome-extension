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

function run_script(command, data=false){
	postMessage({
		command: command,
		data: data
	}, '*');
}

function removeNewlines(str) {
	//remove line breaks from str
	str = str.replace(/\s{2,}/g, ' ');
	str = str.replace(/\t/g, ' ');
	str = str.toString().trim().replace(/\n/g," ");
	return str;
}

function run_script_lama(code){
	var script = document.createElement('script');
	script.appendChild(document.createTextNode(code));
	(document.head||document.documentElement).appendChild(script);
	script.parentNode.removeChild(script);
}

function capitalizeFirstLetter(string) {
  	return string.charAt(0).toUpperCase() + string.slice(1);
}

function relayAjax(options, retries=20, delay=5000, timeout=180000000){
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
				var new_delay = Math.random() * (delay/1000);
				setTimeout(function(){
	                relayAjax(options);
	            }, new_delay * 1000);
			}
		};
	}
    jQuery.ajax(options)
    .fail(function(jqXHR, exception, message){
    	console.log('jqXHR, exception, message', jqXHR, exception, message);
    	if(
    		jqXHR.status != '0' 
    		&& jqXHR.status != '503'
    		&& jqXHR.status != '500'
    		&& message != 'timeout'
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
				|| b.kelompok == 7
			){
				var golongan = b.kode_gol_standar_harga;
				var kelompok = replace_string(b.kode_kel_standar_harga, true);
				if(!kelompok || kelompok==''){
					kelompok = 'kosong';
				}
				var sub_kelompok = replace_string(b.nama_sub_kel_standar_harga, true);
				if(!sub_kelompok || sub_kelompok==''){
					sub_kelompok = 'kosong';
				}
				var nama_subkelompok = replace_string(b.nama_sub_kel_standar_harga, true);
				if(!nama_subkelompok || nama_subkelompok==''){
					nama_subkelompok = 'kosong';
				}
				var item_ssh = replace_string(b.nama_standar_harga, true);
				if(!item_ssh || item_ssh==''){
					item_ssh = 'kosong';
				}
				var nama_item = replace_string(b.nama_standar_harga, true);
				if(!nama_item || nama_item==''){
					nama_item = 'kosong';
				}
			}else{
				var rek = b.kode_kel_standar_harga.split('.');
				var golongan = rek[0]+'.'+rek[1]+'.'+rek[2]+'.'+rek[3]+'.'+rek[4];
				var kelompok = golongan+'.'+rek[5];
				var nama_subkelompok = b.kode_kel_standar_harga+' '+b.nama_kel_standar_harga;
				var item_ssh = b.kode_standar_harga;
				var nama_item = item_ssh+' '+b.id_standar_harga+' '+b.nama_standar_harga;
				var sub_kelompok = b.kode_kel_standar_harga;
			}

			var check_filter = false;
			var check_filter_include = false;
			filter_ssh.map(function(filter, ii){
				if(filter.substr(0,2) != '!='){
					check_filter_include = true;
					if(
						golongan.indexOf(filter) != -1
						|| kelompok.indexOf(filter) != -1
						|| sub_kelompok.indexOf(filter) != -1
						|| nama_item.indexOf(filter) != -1
					){
						check_filter = true;
						return;
					}
				}
			});

			// jika ada yg terfilter atau cek filter include == kosong
			if(
				check_filter 
				|| !check_filter_include
			){
				filter_ssh.map(function(filter2, ii2){
					if(filter2.substr(0,2) == '!='){
						filter2 = filter2.replace('!=', '');
						if(
							golongan.indexOf(filter2) != -1
							|| kelompok.indexOf(filter2) != -1
							|| sub_kelompok.indexOf(filter2) != -1
							|| nama_item.indexOf(filter2) != -1
						){
							check_filter = true;
							return;
						}
					}
				});
			}

			// jika ada yg terfilter atau tidak ada filter
			if(
				check_filter
				|| filter_ssh.length == 0
			){
				if(filter_ssh.length >= 1){
					console.log('filter_ssh', golongan, kelompok, sub_kelompok, nama_item, filter_ssh);
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
			}
		});

		if(filter_ssh.length >= 1){
			console.log('filter_ssh', filter_ssh);
		}
		run_script('window.data_ssh', JSON.stringify(data_ssh));
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
						var new_golongan_data = {};
						golongan.data.map(function(b, i){
							new_golongan_data[b.uraian] = b;
							if(no_urut_golongan < +b.kdurut){
								no_urut_golongan = +b.kdurut;
							}
						});
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
							}else if(jns_golongan == 9){
								var jns_ssh = 4;
							}else{
								continue;
							}
							if(!new_golongan_data[nama_golongan]){
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
		            			run_script("data_table_golongan");
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
	return replace_string(text, true);
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
				console.log('all_ssh', all_ssh);
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
						console.log('Uraian item SSH tidak ditemukan!', id_ssh);
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
								data_post.nilai[id_fmis] = ((+b.harga)+'').replace(/\./g, ',');
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
					alert('Berhasil singkronisasi tarif SSH!');
		        })
		        .catch(function(e){
		            console.log(e);
		        });
			}
		});
	});
}

function singkronisasi_ssh_kelompok(data_ssh, cb, options){
	// ge semua golongan ssh
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
					// set code golongan dan get kelompok berdasarkan kode golongan
					data_ssh[gol_id].code = kode_golongan;
					sendData.push(new Promise(function(resolve, reject){
						relayAjax({
							url: config.fmis_url+'/parameter/ssh/struktur-ssh/kelompok/datatable?code='+data_ssh[gol_id].code+'&gol_id='+gol_id,
							success: function(kelompok){
								var _gol_id = this.url.split('&gol_id=')[1].split('&')[0];
								// console.log('gol_id', _gol_id, data_ssh[_gol_id]);
								var no_urut_kelompok = 0;
								pesan_loading('GET KELOMPOK DARI GOLONGAN '+data_ssh[_gol_id].nama, true);
								var new_kelompok_data = {};
								kelompok.data.map(function(b, i){
									new_kelompok_data[b.uraian] = b;
									if(no_urut_kelompok < +b.kdurut){
										no_urut_kelompok = +b.kdurut;
									}
								});
								for(var kelompok_id in data_ssh[_gol_id].data){
									var nama_kelompok = data_ssh[_gol_id].data[kelompok_id].nama;
									// cek jika golongan belum ada maka buat parameter untuk simpan kelompok
									if(!new_kelompok_data[nama_kelompok]){
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
	var data_kelompok = [];
	for(var gol_id in data_ssh){
		var nama_golongan = data_ssh[gol_id].nama;
		if(data_ssh[gol_id].code){
			data_kelompok.push({
				code: data_ssh[gol_id].code,
				gol_id: gol_id,
				gol_data: data_ssh[gol_id].data
			})
		}
	}
	get_kelompok(data_kelompok, data_ssh)
	.then(function(new_data){
		var data_all = new_data.data_all;
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
			singkronisasi_ssh_item(new_data.data_ssh, cb, options);
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

function get_kelompok(_data_all, data_ssh){
	return new Promise(function(resolve, reject){
		var last = _data_all.length - 1;
		var data_all = [];
		_data_all.reduce(function(sequence, nextData){
            return sequence.then(function(gol){
        		return new Promise(function(resolve_reduce, reject_reduce){
        			// get data kelompok berdasarkan kode golongan
        			relayAjax({
						url: config.fmis_url+'/parameter/ssh/struktur-ssh/kelompok/datatable?code='+gol.code+'&gol_id='+gol.gol_id,
						success: function(kelompok){
							// console.log('gol_id', _gol_id);
							var _gol_id = this.url.split('&gol_id=')[1].split('&')[0];
							var data_sub_kelompok = [];
							var new_kelompok_data = {};
							kelompok.data.map(function(b, i){
								new_kelompok_data[b.uraian] = b;
							});
							for(var kelompok_id in gol.gol_data){
								var nama_kelompok = gol.gol_data[kelompok_id].nama;
								var kode_kelompok = '';
								if(new_kelompok_data[nama_kelompok]){
									kode_kelompok = new_kelompok_data[nama_kelompok].action.split('code="')[1].split('"')[0];
								}
								if(kode_kelompok != ''){
									data_ssh[gol.gol_id].data[kelompok_id].code = kode_kelompok;
									data_sub_kelompok.push({
										code_gol: gol.code,
										code_kel: kode_kelompok,
										gol_id: gol.gol_id,
										kelompok_id: kelompok_id,
										kelompok_data: gol.gol_data[kelompok_id].data,
										tipe: 'get_kelompok'
									});
								}
							}

							// get data sub kelompok berdasarkan kelompok dan return param ajax simpan sub kelompok jika belum ada
							get_sub_kel_ssh(data_sub_kelompok, data_ssh)
							.then(function(new_data){
								new_data.data_all.map(function(b, i){
									data_all.push(b);
								})
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
        }, Promise.resolve(_data_all[last]))
        .then(function(data_last){
			resolve({
				data_all: data_all,
				data_ssh: data_ssh
			});
        })
        .catch(function(e){
            console.log(e);
        });
    });
}

function singkronisasi_ssh_item(data_ssh, cb, options){
	var data_sub_kelompok = [];
	for(var gol_id in data_ssh){
		var nama_golongan = data_ssh[gol_id].nama;
		if(data_ssh[gol_id].code){
			for(var kelompok_id in data_ssh[gol_id].data){
				if(data_ssh[gol_id].data[kelompok_id].code){
					data_sub_kelompok.push({
						code_gol: data_ssh[gol_id].code,
						code_kel: data_ssh[gol_id].data[kelompok_id].code,
						gol_id: gol_id,
						kelompok_id: kelompok_id,
						kelompok_data: data_ssh[gol_id].data[kelompok_id].data,
						tipe: 'get_sub_kelompok'
					});
				}
			}
		}
	}
	get_sub_kel_ssh(data_sub_kelompok, data_ssh)
	.then(function(new_data){
		var data_all = new_data.data_all;
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
			singkronisasi_ssh_rekening(new_data.data_ssh, cb, options);
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

function get_sub_kel_ssh(_data_all, data_ssh){
	return new Promise(function(resolve, reject){
		var last = _data_all.length - 1;
		var data_all_sub_kel = [];
		var data_all = [];
		_data_all.reduce(function(sequence, nextData){
            return sequence.then(function(sub_kel){
        		return new Promise(function(resolve_reduce, reject_reduce){
        			relayAjax({
						url: config.fmis_url+'/parameter/ssh/struktur-ssh/subkelompok/datatable?code='+sub_kel.code_kel+'&gol_id='+sub_kel.gol_id+'&kelompok_id='+sub_kel.kelompok_id,
						length: 1000,
						success: function(subkelompok){
							// console.log('gol_id', _gol_id);
							var _gol_id = this.url.split('&gol_id=')[1].split('&')[0];
							var _kelompok_id = this.url.split('&kelompok_id=')[1].split('&')[0];
							var data_item = [];

							var no_urut_subkelompok = 0;
							var new_sub_kelompok_data = {};
							subkelompok.data.map(function(b, i){
								new_sub_kelompok_data[replace_string(b.uraian, true)] = b;
								if(no_urut_subkelompok < +b.kdurut){
									no_urut_subkelompok = +b.kdurut;
								}
							});
							if(sub_kel.tipe == 'get_kelompok'){
								pesan_loading('GET SUB KELOMPOK DARI KELOMPOK '+data_ssh[_gol_id].data[_kelompok_id].nama, true);
								for(var subkelompok_id in sub_kel.kelompok_data){
									var nama_subkelompok = replace_string(sub_kel.kelompok_data[subkelompok_id].nama, true);
									// cek jika sub kelompok belum ada maka simpan kelompok ssh
									if(!new_sub_kelompok_data[nama_subkelompok]){
										no_urut_subkelompok++;
										data_all.push({
											url: config.fmis_url+'/parameter/ssh/struktur-ssh/subkelompok/save/'+sub_kel.code_kel,
								            type: "post",
								            data: {
								                _token: _token,
								                kdurut: no_urut_subkelompok,
								                uraian: nama_subkelompok
								            }
										});
									}
								}
								resolve_reduce(nextData);
							}else{
								for(var subkelompok_id in sub_kel.kelompok_data){
									var nama_subkelompok = replace_string(sub_kel.kelompok_data[subkelompok_id].nama, true);
									var kode_subkelompok = '';
									if(new_sub_kelompok_data[nama_subkelompok]){
										kode_subkelompok = new_sub_kelompok_data[nama_subkelompok].action.split('code="')[1].split('"')[0];
									}
									if(kode_subkelompok != ''){
										// penting menyimpan kode sub kelompok di variable global
										data_ssh[_gol_id].data[_kelompok_id].data[subkelompok_id].code = kode_subkelompok;
										
										data_item.push({
											kode_gol: sub_kel.code_gol,
											kode_kel: sub_kel.code_kel,
											kode_subkelompok: kode_subkelompok,
											gol_id: _gol_id,
											kelompok_id: _kelompok_id,
											subkelompok_id: subkelompok_id,
											subkelompok_data: sub_kel.kelompok_data[subkelompok_id].data,
											subkelompok_nama: sub_kel.kelompok_data[subkelompok_id].nama
										});
									}
								}
								console.log('get_ssh_item ', data_item, sub_kel);
								get_ssh_item(data_item).then(function(val){
									val.map(function(b, i){
										data_all.push(b);
									})
									resolve_reduce(nextData);
								});
							}
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
			resolve({
				data_all: data_all,
				data_ssh: data_ssh
			});
        })
	});
}

function get_ssh_item(old_data_all){
	return new Promise(function(resolve, reject){
		var _data_all = [];
		var data_all = [];
		old_data_all.map(function(b, i){
			_data_all.push({
				param: {
					data: b
				},
				cb: function(ret2, ret_cb2){
					var item = ret2.data;
					relayAjax({
						url: config.fmis_url+'/parameter/ssh/struktur-ssh/item/datatable?code='+item.kode_subkelompok+'&gol_id='+item.gol_id+'&kelompok_id='+item.kelompok_id+'&subkelompok_id='+item.subkelompok_id,
						length: 1000,
						success: function(item_data){
							var __gol_id = this.url.split('&gol_id=')[1].split('&')[0];
							var __kelompok_id = this.url.split('&kelompok_id=')[1].split('&')[0];
							var __subkelompok_id = this.url.split('&subkelompok_id=')[1].split('&')[0];
							var no_urut_item = 0;
							var sendDataSatuan = [];
							pesan_loading('GET ITEM SSH DARI SUB KELOMPOK '+item.subkelompok_nama, true);
							var new_item_data = {};
							item_data.data.map(function(b, i){
								var id_ssh_fmis = get_id_ssh(b.uraian);
								new_item_data[id_ssh_fmis] = b;
								if(no_urut_item < +b.kdurut){
									no_urut_item = +b.kdurut;
								}
							});
							for(var item_id in item.subkelompok_data){
								var nama_item = replace_string(item.subkelompok_data[item_id].nama, true).substring(0, 250).trim();
								var id_ssh_sipd = get_id_ssh(nama_item);
								// jika item tidak ditemukan maka simpan data
								if(!new_item_data[id_ssh_sipd]){
									no_urut_item++;
									var keterangan_item = replace_string(item.subkelompok_data[item_id].data.spek, true).substring(0, 250).trim();
									var satuan_asli = item.subkelompok_data[item_id].data.satuan;
									if(
										!satuan_asli 
										|| satuan_asli == ''
									){
										satuan_asli = 'kosong';
									}else if(
										__kelompok_id == 'Pendapatan'
										|| __kelompok_id == 'Pembiayaan penerimaan'
										|| __kelompok_id == 'Pembiayaan pengeluaran'
									){
										satuan_asli = 'tahun';
									}else{
										satuan_asli = satuan_asli.toLowerCase().trim();
									}
									var satuan = satuan_asli+' ('+satuan_asli+')';
									sendDataSatuan.push(new Promise(function(resolve3, reject3){
										getIdSatuan(satuan_asli, false, {
											url: config.fmis_url+'/parameter/ssh/struktur-ssh/item/save/'+item.kode_subkelompok,
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
								ret_cb2();
						    })
						    .catch(function(err){
						        console.log('err', err);
								ret_cb2();
						    });
						}
					});
				}
			})
		});
		reduce_promise(_data_all, function(val_all){
			resolve(data_all);
		}, 50);
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
											var new_item = {};
											item.data.map(function(b, i){
												var id_ssh_fmis = get_id_ssh(b.uraian);
												new_item[id_ssh_fmis] = b;
											});
											for(var item_id in ret.subkelompok.data){
												var nama_item = ret.subkelompok.data[item_id].nama;
												var id_ssh_sipd = get_id_ssh(nama_item);
												var kode_item = false;
												if(new_item[id_ssh_sipd]){
													kode_item = new_item[id_ssh_sipd].action.split('code="')[1].split('"')[0];
												}
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

function replace_string(text_awal, no_lowercase=false, no_replace=false, recursive=false){
	if(no_lowercase){
		var text = jQuery('<textarea />').html(text_awal.trim()).text();
	}else{
		var text = jQuery('<textarea />').html(text_awal.toLowerCase().trim()).text();	
	}
	if(!no_replace){
		text = text.replace(/⁰/g, '0');
		text = text.replace(/⁹/g, '9');
		text = text.replace(/⁸/g, '8');
		text = text.replace(/⁷/g, '7');
		text = text.replace(/⁶/g, '6');
		text = text.replace(/⁵/g, '5');
		text = text.replace(/⁴/g, '4');
		text = text.replace(/³/g, '3');
		text = text.replace(/²/g, '2');
		text = text.replace(/¹/g, '1');
		text = text.replace(/'/g, '`');
		text = text.replace(/&/g, 'dan');
		text = text.replace(/Â/g, '');
		text = text.replace(/â/g, '’');
		text = text.replace(/€/g, '');
		text = text.replace(/™/g, '');
		text = text.replace(/˜/g, '');
		text = text.replace(/\n/g, ' ');
	}
	if(recursive && text_awal.length != text.length){
		return replace_string(text, no_lowercase, no_replace, recursive);
	}else{
		return text.trim();
	}
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
				// dibuat sekali request agar tidak mengganggu proses singkron
				jQuery.ajax({
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
							run_script("data_table_item");
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
							run_script("data_table_subkelompok");
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
							run_script("data_table_kelompok");
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
						run_script("data_table_golongan");
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
							run_script("data_table_rekening");
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
							run_script("data_table_item");
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
							run_script("data_table_subkelompok");
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
							run_script("data_table_kelompok");
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
					run_script("data_table_golongan");
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

function simpan_ulang_all_skpd(){
	if(confirm('Apakah anda yakin untuk menyimpan ulang data All SKPD di FMIS?')){
		show_loading();
		var sendData = [];
		jQuery('#bidang li[data-type="bidang"]').map(function(i, b){
			sendData.push(new Promise(function(resolve_reduce2, reject_reduce2){
				var code_bidang = jQuery(b).attr('data-code');
				relayAjax({
					url: config.fmis_url+'/parameter/unit-organisasi/datatable?code='+code_bidang+'&table=skpd',
					success: function(skpd_all){
						var _data_all = skpd_all.data;
	        			var sendData2 = _data_all.map(function(skpd, i){
	        				return new Promise(function(resolve_reduce2, reject_reduce2){
					    		var url_edit = skpd.action.split('href=\"')[1].split('\"')[0];
					    		url_edit = jQuery('<textarea />').html(url_edit).text();
			        			relayAjax({
									url: url_edit+'&action=edit',
									success: function(form_edit){
										var url_save = form_edit.form.split('action=\"')[1].split('\"')[0];
										var form = jQuery(form_edit.form);
										var kdskpd = +skpd.DT_RowIndex;
										var nmskpd = skpd.nmskpd;
										var idbidang_utama = form.find('input[name="idbidang_utama"]:checked').val();
										var idbidang2 = form.find('#idbidang2').val();
										var idbidang3 = form.find('#idbidang3').val();
										pesan_loading('UPDATE SKPD '+nmskpd, true);
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
			                });
		                });
		                Promise.all(sendData2)
						.then(function(val_all){
							var url_tambah_skpd = config.fmis_url+'/parameter/unit-organisasi/form?code='+code_bidang+'&table=skpd';
	        				relayAjax({
								url: config.fmis_url+'/parameter/unit-organisasi/datatable?code='+code_bidang+'&table=skpd',
								success: function(skpd){
									relayAjax({
										url: url_tambah_skpd+'&action=create',
										success: function(form_edit){
											var _data = [];
											var form = jQuery(form_edit.form);
											var idbidang = form.find('input[name="idbidang"]').val();
											skpd.data.map(function(_unit, _i){
												var unit = {
													nama_skpd: _unit.nmskpd,
													subunit: []
												};
												unit.idbidang = idbidang;
												unit.fmis = _unit;
												_data.push(unit);
											});
											singkron_unit_sipd(_data, function(){
												resolve_reduce2();
											});
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
	        }));
	    });
	    Promise.all(sendData)
		.then(function(val_all){
			hide_loading();
			alert('Berhasil simpan All SKPD!');
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
				var url_tambah_skpd = config.fmis_url+'/parameter/unit-organisasi/form?code='+code_bidur+'&table=skpd';
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

function get_row_index(row_index){
	var current_kdurut = (+row_index)-1;
	return current_kdurut;
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
					&& b.is_skpd == 1
				){
					data_skpd_selected.push(b);
				}
			});
			console.log('data_skpd_selected', data_skpd_selected);
			relayAjax({
				url: config.fmis_url+'/parameter/unit-organisasi/datatable?code='+code_bidang+'&table=skpd',
				success: function(skpd){
					var _leng = 5;
					var _data_all = [];
					var _data = [];
					var kdurut = 0;
					data_skpd_selected.map(function(unit, i){
						skpd.data.map(function(_unit, _i){
							if(unit.nama_skpd == _unit.nmskpd){
								unit.fmis = _unit;
							}
							var current_kdurut = +_unit.DT_RowIndex;
							if(kdurut <= current_kdurut){
								kdurut = current_kdurut;
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
													var kdskpd = +skpd.fmis.DT_RowIndex;
													var nmskpd = skpd.nama_skpd;
													var idbidang_utama = form.find('input[name="idbidang_utama"]:checked').val();
													var idbidang2 = get_id_bidur_skpd(form.find('#idbidang2 option'), skpd.bidur2_text);
													var idbidang3 = get_id_bidur_skpd(form.find('#idbidang3 option'), skpd.bidur3_text);
	    											pesan_loading('UPDATE SKPD '+nmskpd, true);
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
						        			kdurut++;
						        			relayAjax({
												url: url_tambah_skpd+'&action=create',
												success: function(form_edit){
													var url_save = form_edit.form.split('action=\"')[1].split('\"')[0];
													var form = jQuery(form_edit.form);
													var idbidang = form.find('input[name="idbidang"]').val();
													var idpemda = form.find('input[name="idpemda"]').val();
													var kdskpd = kdurut;
													var nmskpd = skpd.nama_skpd;
													var idbidang_utama = idbidang;
													var idbidang2 = get_id_bidur_skpd(form.find('#idbidang2 option'), skpd.bidur2_text);
													var idbidang3 = get_id_bidur_skpd(form.find('#idbidang3 option'), skpd.bidur3_text);
	    											pesan_loading('SIMPAN SKPD '+nmskpd, true);
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
												run_script("data_table_2");
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
			var kdurut = 0;
			units.data.map(function(unit, ii){
				if(unit_sipd.nama_skpd == unit.nmunit){
					unit_fmis = unit
				}
				var current_kdurut = +unit.DT_RowIndex;
				if(kdurut <= current_kdurut){
					kdurut = current_kdurut;
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
							var kdunit = +unit_fmis.DT_RowIndex;
							var nmunit = unit_sipd.nama_skpd;
	    					pesan_loading('UPDATE UNIT '+nmunit, true);
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
	    			kdurut++;
	    			relayAjax({
						url: config.fmis_url+'/parameter/unit-organisasi/form?code='+code_skpd+'&table=unit&action=create',
						success: function(form_edit){
							var url_save = form_edit.form.split('action=\"')[1].split('\"')[0];
							var form = jQuery(form_edit.form);
							var idskpd = form.find('input[name="idskpd"]').val();
							var kdunit = kdurut;
							var nmunit = unit_sipd.nama_skpd;
	    					pesan_loading('SIMPAN UNIT '+nmunit, true);
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
	    		pesan_loading('PROSES SUB UNIT DARI '+unit_sipd.nama_skpd, true);
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
	var kdurut = 0;
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
							var current_kdurut = get_row_index(subunit.DT_RowIndex);
							if(kdurut <= current_kdurut){
								kdurut = current_kdurut;
							}
						});
						if(sub_unit_fmis){
				    		var url_edit = sub_unit_fmis.action.split('href=\"')[1].split('\"')[0];
				    		url_edit = jQuery('<textarea />').html(url_edit).text();
		        			relayAjax({
								url: url_edit+'&action=edit',
								success: function(form_edit){
									var url_save = form_edit.form.split('action=\"')[1].split('\"')[0];
									// var kdsubunit = sub_unit_sipd.id_skpd;
									var kdsubunit = get_row_index(sub_unit_fmis.DT_RowIndex);
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
										pesan_loading('UPDATE SUB UNIT '+nmsubunit, true);
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
		        			kdurut++;
		        			relayAjax({
								url: config.fmis_url+'/parameter/unit-organisasi/form?code='+code_unit+'&table=subunit&action=create',
								success: function(form_edit){
									var url_save = form_edit.form.split('action=\"')[1].split('\"')[0];
									// var kdsubunit = sub_unit_sipd.id_skpd;
									var kdsubunit = kdurut;
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
										pesan_loading('SIMPAN SUB UNIT '+nmsubunit, true);
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
					if(so.struktur == null){
						relayAjax({
							url: config.fmis_url+'/parameter/struktur-organisasi/form?idunit='+options.idunit+'&action=create',
							success: function(form_create){
								var url_save = form_create.form.split('action=\"')[1].split('\"')[0];
								relayAjax({
									url: url_save,
									type: "post",
						            data: {
						                _token: _token,
						                idunit: options.idunit,
						                nm_so: options.uraian_so,
						                status: 1,
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
					}else if(so.struktur.title == options.uraian_so){
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
							run_script("data_table_2");
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
		pesan_loading('GET ALL SKPD FMIS', true);
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
							pesan_loading('GET ALL SUB UNIT dari '+param.name+' FMIS', true);
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

function get_all_user_fmis(username){
	return new Promise(function(resolve, reject){
		pesan_loading('GET ALL USER FMIS', true);
		var url_search = '';
		if(typeof username != 'undefined'){
			url_search = config.fmis_url+'/manajemen-user/user/datatable?draw=2&columns%5B0%5D%5Bdata%5D=action&columns%5B0%5D%5Bname%5D=action&columns%5B0%5D%5Bsearchable%5D=false&columns%5B0%5D%5Borderable%5D=false&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=DT_RowIndex&columns%5B1%5D%5Bname%5D=DT_RowIndex&columns%5B1%5D%5Bsearchable%5D=false&columns%5B1%5D%5Borderable%5D=false&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=kduser&columns%5B2%5D%5Bname%5D=kduser&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=true&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&search%5Bvalue%5D='+username+'&search%5Bregex%5D=false';
		}else{
			url_search = config.fmis_url+'/manajemen-user/user/datatable';
		}
		relayAjax({
			url: url_search,
			success: function(users){
				resolve(users);
			}
		});
	});
}

function get_level_user(id_level = false, nmgroup = false){
	return new Promise(function(resolve, reject){
		pesan_loading('GET LEVEL USER', true);
		relayAjax({
			url: config.fmis_url+'/manajemen-user/group/datatable',
			success: function(level){
				var all_level = {};
				level.data.map(function(b, i){
					all_level[b.DT_RowIndex] = b.nmgroup;
				});
				if(
					id_level 
					&& !all_level[id_level]
				){
					relayAjax({
						url: config.fmis_url+'/manajemen-user/group',
						type: 'post',
						data: {
							_token: _token,
							_method: 'POST',
							nmgroup: nmgroup
						},
						success: function(){
							get_level_user()
							.then(function(val){
								resolve(val);
							});
						}
					});
				}else{
					resolve(all_level);
				}
			}
		});
	});
}

function singkronisasi_user_sipd(data_skpd){
	var pass = prompt('Masukan password default untuk user dari SIPD!');
	get_all_user_fmis()
	.then(function(users){
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
						}else if(last == 'b'){
							skpd.user_fmis_b = u;
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

						if(jenis_level_user == 10){
							// insert or update user bendahara
							if(data.skpd.user_fmis_b){
								sendDataSub.push({
									param: {
										skpd: data.skpd
									},
									cb: function(data, ret_cb2){
										var url_form = data.skpd.user_fmis_b.action.split('href=\"')[1].split('\"')[0];
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
										                kduser: data.skpd.nipkepala+'b',
										                nmuser: (data.skpd.namakepala).substring(0, 50).trim(),
										                nmket: (data.skpd.kode_skpd+' '+data.skpd.nama_skpd).substring(0, 50).trim(),
										                level: 'operator',
										                status: 1,
										                idunit: data.skpd.idunit_fmis,
										                idsubunit: data.skpd.idsubunit_fmis,
										                idgroup: [10], // Bendahara PD
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
								                kduser: data.skpd.nipkepala+'b',
								                nmuser: (data.skpd.namakepala).substring(0, 50).trim(),
								                pwd: pass,
								                pwd_confirmation: pass,
								                nmket: (data.skpd.kode_skpd+' '+data.skpd.nama_skpd).substring(0, 50).trim(),
								                level: 'operator',
								                status: 1,
								                idunit: data.skpd.idunit_fmis,
								                idsubunit: data.skpd.idsubunit_fmis,
								                idgroup: [10], // Perencanaan PD
								                tahun: [config.tahun_anggaran],
								            },
											success: function(res){
												ret_cb2();
											}
										});
									}
								});
							}
						}else if(jenis_level_user == 3){
							// insert or update user perencana
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
						}else if(jenis_level_user == 5){
							// insert or update user keuangan
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
	});
}

function generate_gl(data_skpd){
	console.log('data_skpd', data_skpd);
	window.data_bidur_skpd = {};
	var pilih_bidur = '';
	pesan_loading('GET data ALL SKPD FMIS!', true);
	relayAjax({
		url: config.fmis_url+'/importren/scgl?action=renstra',
		success: function(form_ret){
			var skpd_selected_gl = [];
			var form = jQuery(form_ret.form);
			form.find('#id_unit option').map(function(i, b){
				var nama_skpd_fmis = jQuery(b).text();
				var id_skpd_fmis = jQuery(b).attr('value');
				data_skpd.map(function(bb, ii){
					// cek berdasarkan id mapping
					if(bb.id_mapping){
						var id_mapping = bb.id_mapping.split('.');
						if(id_mapping[0] == id_skpd_fmis){
							console.log('id_mapping == id_skpd_fmis ', id_mapping[0]+'=='+id_skpd_fmis);
							bb.id_skpd_fmis = id_skpd_fmis;
							bb.nama_skpd_fmis = nama_skpd_fmis;
							skpd_selected_gl.push(bb);
						}
					}

					// jika masih tidak ditemukan, cek berdasarkan nama skpd
					if(
						!bb.id_skpd_fmis
						&& bb.nama_skpd == nama_skpd_fmis
					){
						bb.id_skpd_fmis = id_skpd_fmis;
						bb.nama_skpd_fmis = nama_skpd_fmis;
						skpd_selected_gl.push(bb);
					}
				});
			});
			skpd_selected_gl.map(function(b, i){
				if(!data_bidur_skpd[b.id_skpd_fmis]){
					data_bidur_skpd[b.id_skpd_fmis] = b;
					pilih_bidur += ''
						+'<tr>'
							+'<td><input type="checkbox" value="'+b.id_skpd_fmis+'"></td>'
							+'<td>'+b.nama_skpd_fmis+'</td>'
						+'</tr>';
				}
			});
			jQuery('#mod-rpjm').html(form.find('#no_perda').html());
			run_script('custom_dt_bidur_skpd', pilih_bidur);
			hide_loading();
		}
	});
}

function generate_gl_modal(){
	var skpd_selected = [];
	jQuery('#konfirmasi-bidur-skpd tbody tr input[type="checkbox"]').map(function(i, b){
		var cek = jQuery(b).is(':checked');
		if(cek){
			var id = jQuery(b).val();
			skpd_selected.push(data_bidur_skpd[id]);
		}
	});
	if(skpd_selected.length >= 1){
		var rpjm_id = jQuery('#mod-rpjm').val();
		var type_gl = jQuery('#mod-type-gl').val();
		if(rpjm_id == -1){
			return alert('Dokumen RPJMD belum dipilih!');
		}else if(
			type_gl != 1
			&& type_gl != 2
		){
			return alert('Type GL belum dipilih!');
		}else if(confirm('Apakah anda yakin untuk menggenerate data dengan metode GL (Garis Lurus)?')){
			show_loading();
			console.log('skpd_selected', skpd_selected);
			var last = skpd_selected.length - 1;
			skpd_selected.reduce(function(sequence, nextData){
	            return sequence.then(function(skpd){
	        		return new Promise(function(resolve_reduce, reject_reduce){
	        			if(type_gl == 1){
		        			pesan_loading('Generate RENSTRA GL SKPD = '+skpd.nama_skpd, true);
		        			var url = config.fmis_url+'/importren/save-renstragl?code=0';
	        			}else if(type_gl == 2){
		        			pesan_loading('Generate RENJA GL SKPD = '+skpd.nama_skpd, true);
		        			var url = config.fmis_url+'/importren/save-renjagl?code=0';
	        			}
	        			// ajax tidak direlay karena jika data sudah digenerate maka responnya akan 500
        				jQuery.ajax({
							url: url,
							data: {
								_token: _token,
								no_perda: rpjm_id,
								id_unit: skpd.id_skpd_fmis
							},
							type: "post",
							success: function(form_ret){
        						resolve_reduce(nextData);
							},
							error: function(e){
								console.log('error proses GL', e, this.data, skpd);
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
	        }, Promise.resolve(skpd_selected[last]))
	        .then(function(data_last){
				run_script('bidur_skpd_hide');
				alert('Sukses generate metodde GL!');
				hide_loading();
	        });
		}
	}else{
		alert('Pilih SKPD dulu!');
	}
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
								var kode = nama_urusan.shift();
								nama_urusan = nama_urusan.join(' ');
								urusan_all[nama_urusan] = { 
									id: id_urusan,
									kode_urusan: kode,
									bidang: {} 
								};
								sendData.push(new Promise(function(resolve, reduce){
									// get master all bidang by id urusan
									relayAjax({
										url: config.fmis_url+'/parameter/unit-organisasi/select-bidang/'+id_urusan+'?nama_urusan='+nama_urusan+'&id_urusan='+id_urusan+'&kode_urusan='+kode,
										success: function(bidang){
											var nama_urusan = replace_string(this.url.split('nama_urusan=')[1].split('&')[0], true, true);
											var id_urusan = this.url.split('id_urusan=')[1].split('&')[0];
											var kode_urusan = this.url.split('kode_urusan=')[1].split('&')[0];
											for( var bb in bidang.bidang){
												if(bb != ''){
													var nama_bidang = bidang.bidang[bb].split(' ');
													var _kode_bidang = nama_bidang.shift();
													var kode_bidang = kode_urusan+_kode_bidang.replace('.', '');
													nama_bidang = nama_bidang.join(' ');
													urusan_all[nama_urusan].bidang[bb] = nama_bidang;
													bidang_all[kode_bidang] = {
														id_bidang: bb,
														nama_bidang: nama_bidang,
														id_urusan: id_urusan,
														kode_bidang: kode_bidang,
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
										b.is_skpd == 1
										&& unit_fmis[b.nama_skpd]
									){
										// insert penunjang urusan bidang
										var cek_exist = false;
										var cek_exist_skpd = false;
										var kode_bidang_sipd = '0.0';
										bidur.data.map(function(bb, ii){
											if(bb.kdurbid == kode_bidang_sipd){
												cek_exist = true;
												bb.skpd_pelaksana.map(function(bbb, iii){
													console.log('skpd_pelaksana', bbb);
													if(bbb.skpd.nmskpd == b.nama_skpd){
														cek_exist_skpd = true;
													}
												});
											}
										});
										if(
											!cek_exist_skpd
											&& bidang_all[kode_bidang_sipd]
										){
											var data_bidur = {
												kode_bidang: kode_bidang_sipd,
												urusan: bidang_all[kode_bidang_sipd].id_urusan,
												bidang: bidang_all[kode_bidang_sipd].id_bidang,
												nama_bidang: bidang_all[kode_bidang_sipd].nama_bidang,
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
													+'<td><input type="checkbox" value="'+kode_bidang_sipd+'-'+b.id_skpd+'"></td>'
													+'<td>'+bidang_all[kode_bidang_sipd].nama_bidang+'</td>'
													+'<td>'+b.nama_skpd+'</td>'
												+'</tr>';
										}else if(!bidang_all[kode_bidang_sipd]){
											console.log('Bidang SIPD tidak ditemukan', kode_bidang_sipd, bidang_all);
										}

										// cek bidur1
										if(b.bidur1){
											var cek_exist = false;
											var cek_exist_skpd = false;
											var _kode_bidang_sipd = b.bidur1.split(' ');
											var kode_bidang_sipd = [];
											_kode_bidang_sipd[0].split('.').map(function(c, n){
												kode_bidang_sipd.push(+c);
											});
											kode_bidang_sipd = kode_bidang_sipd.join('.');
											bidur.data.map(function(bb, ii){
												if(bb.kdurbid == kode_bidang_sipd){
													cek_exist = true;
													bb.skpd_pelaksana.map(function(bbb, iii){
														if(bbb.skpd.nmskpd == b.nama_skpd){
															cek_exist_skpd = true;
														}
													});
												}
											});
											if(
												(
													!cek_exist
													|| !cek_exist_skpd
												)
												&& bidang_all[kode_bidang_sipd]
											){
												var data_bidur = {
													kode_bidang: kode_bidang_sipd,
													urusan: bidang_all[kode_bidang_sipd].id_urusan,
													bidang: bidang_all[kode_bidang_sipd].id_bidang,
													nama_bidang: bidang_all[kode_bidang_sipd].nama_bidang,
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
														+'<td><input type="checkbox" value="'+kode_bidang_sipd+'-'+b.id_skpd+'"></td>'
														+'<td>'+bidang_all[kode_bidang_sipd].nama_bidang+'</td>'
														+'<td>'+b.nama_skpd+'</td>'
													+'</tr>';
											}else if(!bidang_all[kode_bidang_sipd]){
												console.log('Bidang SIPD tidak ditemukan', kode_bidang_sipd, bidang_all);
											}
										}

										// cek bidur2
										if(b.bidur2){
											var cek_exist = false;
											var cek_exist_skpd = false;
											var _kode_bidang_sipd = b.bidur2.split(' ');
											var kode_bidang_sipd = [];
											_kode_bidang_sipd[0].split('.').map(function(c, n){
												kode_bidang_sipd.push(+c);
											});
											kode_bidang_sipd = kode_bidang_sipd.join('.');
											bidur.data.map(function(bb, ii){
												if(bb.kdurbid == kode_bidang_sipd){
													cek_exist = true;
													bb.skpd_pelaksana.map(function(bbb, iii){
														if(bbb.skpd.nmskpd == b.nama_skpd){
															cek_exist_skpd = true;
														}
													});
												}
											});
											if(
												(
													!cek_exist
													|| !cek_exist_skpd
												)
												&& bidang_all[kode_bidang_sipd]
											){
												var data_bidur = {
													kode_bidang: kode_bidang_sipd,
													urusan: bidang_all[kode_bidang_sipd].id_urusan,
													bidang: bidang_all[kode_bidang_sipd].id_bidang,
													nama_bidang: bidang_all[kode_bidang_sipd].nama_bidang,
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
														+'<td><input type="checkbox" value="'+kode_bidang_sipd+'-'+b.id_skpd+'"></td>'
														+'<td>'+bidang_all[kode_bidang_sipd].nama_bidang+'</td>'
														+'<td>'+b.nama_skpd+'</td>'
													+'</tr>';
											}else if(!bidang_all[kode_bidang_sipd]){
												console.log('Bidang SIPD tidak ditemukan', kode_bidang_sipd, bidang_all);
											}
										}

										// cek bidur3
										if(b.bidur3){
											var cek_exist = false;
											var cek_exist_skpd = false;
											var _kode_bidang_sipd = b.bidur3.split(' ');
											var kode_bidang_sipd = [];
											_kode_bidang_sipd[0].split('.').map(function(c, n){
												kode_bidang_sipd.push(+c);
											});
											kode_bidang_sipd = kode_bidang_sipd.join('.');
											bidur.data.map(function(bb, ii){
												if(bb.kdurbid == kode_bidang_sipd){
													cek_exist = true;
													bb.skpd_pelaksana.map(function(bbb, iii){
														if(bbb.skpd.nmskpd == b.nama_skpd){
															cek_exist_skpd = true;
														}
													});
												}
											});
											if(
												(
													!cek_exist
													|| !cek_exist_skpd
												)
												&& bidang_all[kode_bidang_sipd]
											){
												var data_bidur = {
													kode_bidang: kode_bidang_sipd,
													urusan: bidang_all[kode_bidang_sipd].id_urusan,
													bidang: bidang_all[kode_bidang_sipd].id_bidang,
													nama_bidang: bidang_all[kode_bidang_sipd].nama_bidang,
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
														+'<td><input type="checkbox" value="'+kode_bidang_sipd+'-'+b.id_skpd+'"></td>'
														+'<td>'+bidang_all[kode_bidang_sipd].nama_bidang+'</td>'
														+'<td>'+b.nama_skpd+'</td>'
													+'</tr>';
											}else if(!bidang_all[kode_bidang_sipd]){
												console.log('Bidang SIPD tidak ditemukan', kode_bidang_sipd, bidang_all);
											}
										}
									}
								});
								console.log('data_bidur_skpd', data_bidur_skpd);
								if(data_bidur_skpd.length >= 1){
									run_script('bidur_skpd_destroy');
									jQuery('#konfirmasi-bidur-skpd tbody').html(pilih_bidur);
									var table = jQuery('#konfirmasi-bidur-skpd');
									table.attr('data-urut', urut);
									table.attr('data-idbidkewenangan', idbidkewenangan);
									table.attr('data-idrpjmdprogram', idrpjmdprogram);
									table.attr('data-url-save', url_save_form);
									table.attr('data-code-bidang', code_bidang);
									run_script('bidur_skpd_show');
								}else{
									run_script("data_table_rpjmd", code_bidang);
									alert('Berhasil singkronisasi bidang urusan dan SKPD di RPJMD');
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

function get_list_program(options){
	return new Promise(function(resolve, reject){
		if(_type_singkronisasi_rka == 'rka-opd'){
			if(!options){
				var sasaran = jQuery(".info-sasaran").eq(0).text();
				pesan_loading('GET PROGRAM EXISTING UNTUK SASARAN = '+sasaran, true);
				var url_tambah_program = jQuery('a.btn-sm[title="Tambah Program RKA"]').attr('href');
				var code_sasaran = url_tambah_program.split('code=')[1].split('&')[0];
				// get form tambah program fmis
				relayAjax({
					url: url_tambah_program+'&action=create',
					success: function(form_tambah){
						// get program fmis
						relayAjax({
							url: config.fmis_url+'/anggaran/rka-opd/program/datatable?code='+code_sasaran,
							success: function(program){
								program.form_tambah_program = form_tambah.form;
								return resolve(program);
							}
						});
					}
				});
			}else{
				pesan_loading('GET PROGRAM EXISTING', true);
				// get form tambah program fmis
				relayAjax({
					url: config.fmis_url+'/anggaran/rka-opd/program/form?code='+options.code_sasaran+'&action=create',
					success: function(form_tambah){
						// get program fmis
						relayAjax({
							url: config.fmis_url+'/anggaran/rka-opd/program/datatable?code='+options.code_sasaran,
							success: function(program){
								program.form_tambah_program = form_tambah.form;
								return resolve(program);
							}
						});
					}
				});
			}
		}else{
			var sasaran = jQuery('button[data-tab-target="#sasaran-tab"]').closest('tr').find('td').eq(2).text();
			pesan_loading('GET PROGRAM EXISTING UNTUK SASARAN = '+sasaran, true);
			var url_tambah_program = jQuery('a.btn-sm[title="Tambah Program"]').attr('href');
			var id_sasaran = url_tambah_program.split('/').pop();
			// get program fmis
			relayAjax({
				url: config.fmis_url+'/perencanaan-tahunan/renja-murni/program/data/'+id_sasaran,
				success: function(program){
					return resolve(program);
				}
			});
		}
	});
}

function get_list_kegiatan(options){
	return new Promise(function(resolve, reject){
		if(_type_singkronisasi_rka == 'rka-opd'){
			options.nmprogram = removeNewlines(options.nmprogram);
			pesan_loading('GET KEGIATAN EXISTING UNTUK PROGRAM = '+options.nmprogram, true);
			var code_program = options.action.split('data-code="')[1].split('"')[0];
			// get program fmis
			relayAjax({
				url: config.fmis_url+'/anggaran/rka-opd/kegiatan/datatable?code='+code_program,
				success: function(kegiatan){
					return resolve(kegiatan);
				}
			});
		}else{
			pesan_loading('GET KEGIATAN EXISTING UNTUK PROGRAM = '+options.uraian, true);
			// get program fmis
			relayAjax({
				url: config.fmis_url+'/perencanaan-tahunan/renja-murni/kegiatan/data/'+options.idrkpdrenjaprogram,
				success: function(kegiatan){
					return resolve(kegiatan);
				}
			});
		}
	});
}

function get_list_sub_kegiatan(options){
	return new Promise(function(resolve, reject){
		if(_type_singkronisasi_rka == 'rka-opd'){
			options.nmkegiatan = removeNewlines(options.nmkegiatan);
			pesan_loading('GET SUB KEGIATAN EXISTING UNTUK KEGIATAN = '+options.nmkegiatan, true);
			var code_kegiatan = options.action.split('data-code="')[1].split('"')[0];
			relayAjax({
				url: config.fmis_url+'/anggaran/rka-opd/subkegiatan/datatable?code='+code_kegiatan,
				success: function(sub_kegiatan){
					return resolve(sub_kegiatan);
				}
			});
		}else{
			pesan_loading('GET SUB KEGIATAN EXISTING UNTUK KEGIATAN = '+options.uraian, true);
			relayAjax({
				url: config.fmis_url+'/perencanaan-tahunan/renja-murni/subkegiatan/data/'+options.idrkpdrenjakegiatan,
				success: function(sub_kegiatan){
					return resolve(sub_kegiatan);
				}
			});
		}
	});
}

function get_list_program_rpjmd(form_tambah, code_sasaran){
	return new Promise(function(resolve, reject){
		if(_type_singkronisasi_rka == 'rka-opd'){
			relayAjax({
				url: config.fmis_url+'/anggaran/rka-opd/program/datatable-rpjmd?code='+code_sasaran,
				success: function(program_rpjmd){
					var html_program_rkpd = '<option value="">Pilih Program</option>';
					program_rpjmd.data.map(function(b, i){
						html_program_rkpd += '<option value="'+b.idrapbdprogram+'">'+b.uraian_program+'</option>';
					});
					return resolve(html_program_rkpd);
				}
			});
		}else{
			var form = jQuery(form_tambah);
			var html_program_rkpd = form.find('select[name="idrkpdranwalprogram"]').html();
			return resolve(html_program_rkpd);
		}
	});
}

function load_tambah_program(){
	pesan_loading('GET FORM TAMBAH PROGRAM UNTUK MENDAPATKAN PROGRAM RKPD', true);
	return new Promise(function(resolve, reject){
		if(_type_singkronisasi_rka == 'rka-opd'){
			var url_tambah_program = jQuery('a.btn-sm[title="Tambah Program RKA"]').attr('href');
			var code_sasaran = url_tambah_program.split('code=')[1].split('&')[0];
			// load form tambah program
			relayAjax({
				url: url_tambah_program+'&action=create',
				success: function(form_tambah){
					resolve({
						form_tambah: form_tambah, 
						code_sasaran: code_sasaran
					});
				}
			});
		}else{
			var url_tambah_program = jQuery('a.btn-sm[title="Tambah Program"]').attr('href');
			// load form tambah program
			relayAjax({
				url: url_tambah_program,
				success: function(form_tambah){
					resolve({
						form_tambah: form_tambah, 
						code_sasaran: false
					});
				}
			});
		}
	});
}

function singkronisasi_program(sub_keg){
	window.sub_keg_renja = sub_keg;
	var program_fmis = {};
	var sub_keg_fmis = {};
	get_list_program()
	.then(function(program){
		run_script('program_destroy');
		var last = program.data.length - 1;
		program.data.reduce(function(sequence, nextData){
            return sequence.then(function(current_data){
        		return new Promise(function(resolve_reduce, reject_reduce){
        			current_data.uraian = removeNewlines(current_data.uraian);
        			program_fmis[current_data.uraian] = current_data;
					get_list_kegiatan(current_data)
					.then(function(kegiatan){
						program_fmis[current_data.uraian].kegiatan = {};
						var last = kegiatan.data.length - 1;
						kegiatan.data.reduce(function(sequence2, nextData2){
				            return sequence2.then(function(current_data2){
				        		return new Promise(function(resolve_reduce2, reject_reduce2){
				        			current_data2.uraian = removeNewlines(current_data2.uraian);
				        			program_fmis[current_data.uraian].kegiatan[current_data2.uraian] = current_data2;
				        			get_list_sub_kegiatan(current_data2)
				        			.then(function(sub_kegiatan){
										program_fmis[current_data.uraian].kegiatan[current_data2.uraian].sub_kegiatan = sub_kegiatan.data;
										sub_kegiatan.data.map(function(b, i){
											b.uraian = removeNewlines(b.uraian);
											sub_keg_fmis[b.uraian.trim().toLowerCase()] = b;
										});
										resolve_reduce2(nextData2);
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
			var daftar_sub = '';
			sub_keg_renja.map(function(b, i){
				var sub_giat = b.nama_sub_giat.split(' ');
				sub_giat.shift();
				sub_giat = sub_giat.join(' ');
				sub_giat = removeNewlines(sub_giat);
				// cek jika sub giat belum ada di fmis maka ditampilkan
				if(!sub_keg_fmis[sub_giat.trim().toLowerCase()]){
					daftar_sub += ''
						+'<tr>'
							+'<td><input type="checkbox" value="'+b.kode_sbl+'"></td>'
							+'<td>'+b.nama_skpd_data_unit+' - '+b.nama_program+'</td>'
							+'<td>'+b.nama_giat+'</td>'
							+'<td>'+b.nama_sub_giat+'</td>'
						+'</tr>';
				}else{
					daftar_sub += ''
						+'<tr>'
							+'<td><input type="checkbox" value="'+b.kode_sbl+'"> <b>EXISTING</b></td>'
							+'<td>'+b.nama_skpd_data_unit+' - '+b.nama_program+'</td>'
							+'<td>'+b.nama_giat+'</td>'
							+'<td>'+b.nama_sub_giat+'</td>'
						+'</tr>';
				}
			});
			jQuery('#konfirmasi-program tbody').html(daftar_sub);
			load_tambah_program()
			.then(function(res){
				get_list_program_rpjmd(res.form_tambah, res.code_sasaran)
				.then(function(html_program_rkpd){
					jQuery('#mod-program-rkpd').html(html_program_rkpd);
					jQuery('#mod-program-rkpd').parent().show();
					jQuery('#mod-konfirmasi-program .modal-title').text('Data Sub Kegiatan dari WP-SIPD yang akan disingkronisasi ke FMIS');
					var table = jQuery('#konfirmasi-program');
					table.attr('data-singkron-rka', '');
					run_script('custom_dt_program');
					hide_loading();
				});
			});
        });
	});
}

function singkronisasi_rka(sub_keg){
	window.sub_keg_renja_rka = sub_keg;
	var sub_keg_fmis = {};
	var options = {
		idrkpdrenjakegiatan: '',
		nmkegiatan: '',
		uraian: '',
		action: 'data-code="'
	};
	if(_type_singkronisasi_rka == 'rka-opd'){
		var url_tambah_sub_kegiatan = jQuery('a.btn-sm[title="Tambah Sub Kegiatan RKA"]').attr('href');
		var code_kegiatan = url_tambah_sub_kegiatan.split('code=')[1];
		var keg_fmis = jQuery('button.tab-return[onclick="changeTab(\'#tab-kegiatan\')"]').eq(0).closest('tr').find('td').eq(2).text();
		var program_fmis = jQuery('button.tab-return[onclick="changeTab(\'#tab-program\')"]').eq(0).closest('tr').find('td').eq(2).text();
		options.action = 'data-code="'+code_kegiatan+'"';
		var idkegiatan = code_kegiatan;
	}else{
		var url_tambah_sub_kegiatan = jQuery('a.btn-sm[title="Tambah Sub Kegiatan"]').attr('href');
		var keg_fmis = jQuery('button.previous-tab[data-tab-target="#kegiatan-tab"]').closest('tr').find('td').eq(2).text().split(' ');
		keg_fmis.shift();
		keg_fmis = keg_fmis.join(' ');
		var program_fmis = jQuery('button.previous-tab[data-tab-target="#program-tab"]').closest('tr').find('td').eq(2).text().split(' ');
		program_fmis.shift();
		program_fmis = program_fmis.join(' ');
		var idkegiatan = url_tambah_sub_kegiatan.split('/').pop();
		options.idrkpdrenjakegiatan = idkegiatan;
	}
	options.nmkegiatan = keg_fmis;
	options.uraian = keg_fmis;
	get_list_sub_kegiatan(options)
	.then(function(sub_kegiatan){
		sub_kegiatan.data.map(function(b, i){
			b.uraian = removeNewlines(b.uraian);
			sub_keg_fmis[program_fmis+'|'+keg_fmis+'|'+b.uraian] = b;
		});
		run_script('program_destroy');
		var daftar_sub = '';
		sub_keg_renja_rka.map(function(b, i){
			var sub_giat = b.nama_sub_giat.split(' ');
			sub_giat.shift();
			sub_giat = sub_giat.join(' ');
			var keyword = b.nama_program+'|'+b.nama_giat+'|'+sub_giat;
			// cek sub giat yang ada di kegiatan ini saja yang akan ditampilkan di popup
			if(sub_keg_fmis[keyword]){
				sub_keg_renja_rka[i].sub_keg_fmis = sub_keg_fmis[keyword];
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
		jQuery('#mod-konfirmasi-program .modal-title').text('Singkronisasi data RKA per sub kegiatan');
		var table = jQuery('#konfirmasi-program');
		table.attr('data-singkron-rka', idkegiatan);
		run_script('custom_dt_program');
		hide_loading();
	});
}

function delete_rka(sub_keg){
	window.sub_keg_fmis_delete = {};
	window.keg_fmis_delete = {};
	window.prog_fmis_delete = {};
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
						prog_fmis_delete[keyword] = program;
						daftar_sub += ''
							+'<tr>'
								+'<td><input type="checkbox" value="'+keyword+'"></td>'
								+'<td>'+program.uraian+'</td>'
								+'<td>-</td>'
								+'<td>-</td>'
							+'</tr>';
						get_list_kegiatan(program)
        				.then(function(kegiatan_exist){
        					if(kegiatan_exist.data.length >= 1){
								var last2 = kegiatan_exist.data.length - 1;
								kegiatan_exist.data.reduce(function(sequence2, nextData2){
						            return sequence2.then(function(kegiatan){
						            	return new Promise(function(resolve_reduce2, reject_reduce2){
						            		kegiatan.uraian = removeNewlines(kegiatan.uraian);
											var keyword = program.DT_RowId+'-'+kegiatan.DT_RowId;
											keg_fmis_delete[keyword] = kegiatan;
											daftar_sub += ''
												+'<tr>'
													+'<td><input type="checkbox" value="'+keyword+'"></td>'
													+'<td>'+program.uraian+'</td>'
													+'<td>'+kegiatan.uraian+'</td>'
													+'<td>-</td>'
												+'</tr>';
							        		get_list_sub_kegiatan(kegiatan)
											.then(function(sub_kegiatan){
												sub_kegiatan.data.map(function(b, i){
													b.uraian = removeNewlines(b.uraian);
													var keyword = program.DT_RowId+'-'+kegiatan.DT_RowId+'-'+b.DT_RowId;
													b.kegiatan = kegiatan;
													b.program = program;
													sub_keg_fmis_delete[keyword] = b;
													daftar_sub += ''
														+'<tr>'
															+'<td><input type="checkbox" value="'+keyword+'"></td>'
															+'<td>'+program.uraian+'</td>'
															+'<td>'+kegiatan.uraian+'</td>'
															+'<td>'+b.uraian+'</td>'
														+'</tr>';
												});
												resolve_reduce2(nextData2);
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
				jQuery('#mod-konfirmasi-program .modal-title').text('Delete RKA per sub kegiatan');
				jQuery('#konfirmasi-program tbody').html(daftar_sub);
				jQuery('#mod-program-rkpd').parent().hide();
				var table = jQuery('#konfirmasi-program');
				table.attr('data-singkron-rka', 'delete-rka');
				run_script('custom_dt_program');
				hide_loading();
	        });
		}else{
			console.log('program_exist kosong', program_exist.data);
			alert('Program kosong!');
		}
	})
}

function delete_rka_modal(idkegiatan){
	show_loading();
	var sub_kegiatan_selected = [];
	jQuery('#konfirmasi-program tbody tr input[type="checkbox"]').map(function(i, b){
		var cek = jQuery(b).is(':checked');
		if(cek){
			var keyword_selected = jQuery(b).val();
			for(var keyword in sub_keg_fmis_delete){
				if(keyword == keyword_selected){
					sub_kegiatan_selected.push(sub_keg_fmis_delete[keyword]);
				}
			}
		}
	});
	var kegiatan_selected = [];
	jQuery('#konfirmasi-program tbody tr input[type="checkbox"]').map(function(i, b){
		var cek = jQuery(b).is(':checked');
		if(cek){
			var keyword_selected = jQuery(b).val();
			for(var keyword in keg_fmis_delete){
				if(keyword == keyword_selected){
					kegiatan_selected.push(keg_fmis_delete[keyword]);
				}
			}
		}
	});
	var program_selected = [];
	jQuery('#konfirmasi-program tbody tr input[type="checkbox"]').map(function(i, b){
		var cek = jQuery(b).is(':checked');
		if(cek){
			var keyword_selected = jQuery(b).val();
			for(var keyword in prog_fmis_delete){
				if(keyword == keyword_selected){
					program_selected.push(prog_fmis_delete[keyword]);
				}
			}
		}
	});
	if(
		sub_kegiatan_selected.length >= 1
		|| kegiatan_selected.length >= 1
		|| program_selected.length >= 1
	){
		console.log('delete sub_kegiatan ', sub_kegiatan_selected);
		new Promise(function(resolve, reject){
			if(sub_kegiatan_selected.length >= 1){
				// hapus sub kegiatan
				var last = sub_kegiatan_selected.length - 1;
				sub_kegiatan_selected.reduce(function(sequence, nextData){
		            return sequence.then(function(sub_kegiatan){
		        		return new Promise(function(resolve_reduce, reject_reduce){
		        			get_list_aktivitas(sub_kegiatan)
		        			.then(function(aktivitas_exist){
								var last2 = aktivitas_exist.data.length - 1;
								aktivitas_exist.data.reduce(function(sequence2, nextData2){
						            return sequence2.then(function(aktivitas){
						        		return new Promise(function(resolve_reduce2, reject_reduce2){
						        			aksi_delete_rka(aktivitas)
						        			.then(function(){
						        				resolve_reduce2(nextData2);
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
						        }, Promise.resolve(aktivitas_exist.data[last2]))
						        .then(function(){
						        	pesan_loading('HAPUS SUB KEGIATAN = '+sub_kegiatan.uraian, true);
						        	if(_type_singkronisasi_rka == 'rka-opd'){
				        				var url_form_delete = sub_kegiatan.action.split('href="')[2].split('"')[0];
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
										            	resolve_reduce(nextData);
										            },
										            error: function(e){
										            	console.log('Error hapus sub kegiatan!', e, sub_kegiatan);
										            }
												});
								            }
										});
				        			}else{
							        	var url_delete = sub_kegiatan.action.split('href="')[3].split('"')[0];
					        			relayAjax({
											url: url_delete,
											headers: {"x-csrf-token": _token},
											type: "post",
								            success: function(res){
							        			resolve_reduce(nextData);
								            },
								            error: function(e){
								            	console.log('Error hapus sub kegiatan!', e, sub_kegiatan);
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
		        }, Promise.resolve(sub_kegiatan_selected[last]))
		        .then(function(data_last){
		    		resolve();
		        });
		    }else{
		    	resolve();
		    }
		})
        .then(function(val){
        	// hapus kegiatan
        	return new Promise(function(resolve, reject){
        		if(kegiatan_selected.length >= 1){
	        		var last = kegiatan_selected.length - 1;
	        		kegiatan_selected.reduce(function(sequence, nextData){
			            return sequence.then(function(kegiatan){
			        		return new Promise(function(resolve_reduce, reject_reduce){
			        			pesan_loading('HAPUS KEGIATAN = '+kegiatan.uraian, true);
			        			if(_type_singkronisasi_rka == 'rka-opd'){
			        				var url_form_delete = kegiatan.action.split('href="')[2].split('"')[0];
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
									            	resolve_reduce(nextData);
									            },
									            error: function(e){
									            	console.log('Error hapus kegiatan!', e, kegiatan);
									            }
											});
							            }
									});
			        			}else{
						        	var url_delete = kegiatan.action.split('href="')[2].split('"')[0];
				        			relayAjax({
										url: url_delete,
										headers: {"x-csrf-token": _token},
										type: "post",
							            success: function(res){
						        			resolve_reduce(nextData);
							            },
							            error: function(e){
							            	console.log('Error hapus kegiatan!', e, kegiatan);
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
			        }, Promise.resolve(kegiatan_selected[last]))
			        .then(function(data_last){
			        	resolve();
			        });
			    }else{
			    	resolve();
			    }
        	});
        })
        .then(function(val){
        	// hapus program
        	return new Promise(function(resolve, reject){
        		if(program_selected.length >= 1){
	        		var last = program_selected.length - 1;
	        		program_selected.reduce(function(sequence, nextData){
			            return sequence.then(function(program){
			        		return new Promise(function(resolve_reduce, reject_reduce){
			        			pesan_loading('HAPUS PROGRAM = '+program.uraian, true);
			        			if(_type_singkronisasi_rka == 'rka-opd'){
			        				var url_form_delete = program.action.split('href="')[2].split('"')[0];
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
									            	resolve_reduce(nextData);
									            },
									            error: function(e){
									            	console.log('Error hapus program!', e, program);
									            }
											});
							            }
									});
			        			}else{
						        	var url_delete = program.action.split('href="')[2].split('"')[0];
				        			relayAjax({
										url: url_delete,
										headers: {"x-csrf-token": _token},
										type: "post",
							            success: function(res){
						        			resolve_reduce(nextData);
							            },
							            error: function(e){
							            	console.log('Error hapus program!', e, program);
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
			        }, Promise.resolve(program_selected[last]))
			        .then(function(data_last){
			        	resolve();
			        });
			    }else{
			    	resolve();
			    }
        	});
        })
        .then(function(val){
        	alert('berhasil hapus rincian, aktivitas dan sub kegiatan!');
			hide_loading();
			run_script('program_hide');
        });
	}else{
		alert('Pilih sub kegiatan dulu!');
		hide_loading();
	}
}

function get_id_sub_unit_fmis(options, id_mapping_skpd, nama_sub_skpd){
	pesan_loading('GET ID SUB UNIT DARI SUBKEGIATAN = '+options.uraian+', id_mapping = '+id_mapping_skpd+', skpd = '+nama_sub_skpd, true);
	var keyword = id_mapping_skpd+' '+nama_sub_skpd;
	return new Promise(function(resolve, reject){
		if(typeof id_sub_unit_fmis_global == 'undefined'){
			window.id_sub_unit_fmis_global = {};
		}
		var id_sub_skpd_fmis = false;
		// id sub skpd diambil dari hasil mapping skpd di WP-SIPD
		if(id_mapping_skpd){
			var id_sub_skpd = id_mapping_skpd.split('.');
			if(id_sub_skpd[1]){
				id_sub_skpd_fmis = id_sub_skpd[1];
			}
		}
		if(typeof id_sub_unit_fmis_global[keyword] == 'undefined'){
			if(id_sub_skpd_fmis){
				id_sub_unit_fmis_global[keyword] = id_sub_skpd_fmis;
				resolve(id_sub_unit_fmis_global[keyword]);
			}else{
				// jika skpd belum dimapping di wp-sipd maka cari id sub skpd berdasarkan nama skpd dari sub kegiatan wp-sipd
				if(_type_singkronisasi_rka == 'rka-opd'){
					var code_subkegiatan = options.action.split('data-code="')[1].split('"')[0];
					relayAjax({
						url: config.fmis_url+'/anggaran/rka-opd/aktivitas/form?code='+code_subkegiatan+'&action=create',
						success: function(form_tambah){
							jQuery(form_tambah.form).find('#idsubunit option').map(function(i, b){
								var nama_sub_skpd_fmis = jQuery(b).text().trim();
								if(nama_sub_skpd_fmis == nama_sub_skpd){
									id_sub_skpd_fmis = jQuery(b).attr('value');
								}
							});
							if(id_sub_skpd_fmis){
								id_sub_unit_fmis_global[keyword] = id_sub_skpd_fmis;
								resolve(id_sub_unit_fmis_global[keyword]);
							}else{
								console.log('id_sub_skpd_fmis untuk skpd = '+nama_sub_skpd+' tidak ditemukan!');
							}
						}
					});
				}else{
					relayAjax({
						url: config.fmis_url+'/perencanaan-tahunan/renja-murni/aktivitas/create/'+options.idsubkegiatan,
						success: function(form_tambah){
							jQuery(form_tambah).find('select[name="idsubunit"] option').map(function(i, b){
								var nama_sub_skpd_fmis = jQuery(b).text().trim();
								if(nama_sub_skpd_fmis == nama_sub_skpd){
									id_sub_skpd_fmis = jQuery(b).attr('value');
								}
							});
							if(id_sub_skpd_fmis){
								id_sub_unit_fmis_global[keyword] = id_sub_skpd_fmis;
								resolve(id_sub_unit_fmis_global[keyword]);
							}else{
								console.log('id_sub_skpd_fmis untuk skpd = '+nama_sub_skpd+' tidak ditemukan!');
							}
						}
					});
				}
			}
		}else{
			resolve(id_sub_unit_fmis_global[keyword]);
		}
	});
}

function get_id_unit_fmis(from_user=false){
	return new Promise(function(resolve, reject){
		pesan_loading('GET ID UNIT FMIS', true);
		var url_unit = config.fmis_url+'/perencanaan-tahunan/renja-murni';
		if(_type_singkronisasi_rka == 'rka-opd'){
			url_unit = config.fmis_url+'/anggaran/rka-opd/dokumen/datatable';
		}
		relayAjax({
			url: url_unit,
			success: function(renja){
				if(renja.data.length >= 1){
					if(_type_singkronisasi_rka == 'rka-opd'){
						if(from_user){
							resolve(renja.data[0].idunit);
						}else{
							var nama_dokumen = jQuery('.info-dokumen strong').eq(0).text().trim();
							var idunit = false;
							renja.data.map(function(b, i){
								if(nama_dokumen == b.no_rka){
									idunit = b.idunit;
								}
							});
							if(idunit){
								resolve(idunit);
							}else{
								reject('ID unit Tidak ditemukan!');
							}
						}
					}else{
						resolve(renja.data[0].idunit);
					}
				}else{
					reject();
				}
			}
		});
	});
}

function get_load_urusan(id_code_sasaran, id_program_rapbd){
	return new Promise(function(resolve, reject){
		pesan_loading('GET MASTER URUSAN', true);
		if(_type_singkronisasi_rka == 'rka-opd'){
			relayAjax({
				url: config.fmis_url+'/anggaran/rka-opd/program/select-urusan/'+id_program_rapbd,
				success: function(urusan_bidang){
					resolve(urusan_bidang.urusan);
				}
			});
		}else{
			relayAjax({
				url: config.fmis_url+'/perencanaan-tahunan/renja-murni/program/pilih-program/'+id_code_sasaran+'?load=urusan',
				success: function(html_urusan){
					var urusan = [];
					jQuery(html_urusan).find('table td a').map(function(i, b){
						var tr = jQuery(b).closest('tr');
						var nama_urusan = tr.find('td').eq(1).text();
						var url_bidang = jQuery(b).attr('href');
						var id_urusan = url_bidang.split('&kode=')[1].split('&')[0];
						urusan.push({
							id_urusan: id_urusan,
							nama_urusan: nama_urusan,
							url_bidang: url_bidang+'&id_urusan='+id_urusan
						});
					});
					return resolve(urusan);
				}
			});
		}
	});
}

function get_load_bidang(url_bidang){
	return new Promise(function(resolve, reject){
		pesan_loading('GET MASTER BIDANG', true);
		if(_type_singkronisasi_rka == 'rka-opd'){

		}else{
			relayAjax({
				url: url_bidang,
				success: function(html_bidang){
					var id_urusan = this.url.split('&id_urusan=')[1].split('&')[0];
					var bidang = [];
					jQuery(html_bidang).find('table td a').map(function(i, b){
						var tr = jQuery(b).closest('tr');
						var nama_bidang = tr.find('td').eq(1).text();
						var url_program = jQuery(b).attr('href');
						var id_bidang = url_program.split('&kode=')[1].split('&')[0];
						bidang.push({
							id_urusan: id_urusan,
							id_bidang: id_bidang,
							nama_bidang: nama_bidang,
							url_program: url_program+'&id_urusan='+id_urusan+'&id_bidang='+id_bidang
						});
					});
					resolve(bidang);
				}
			});
		}
	});
}

function get_load_program(url_program){
	return new Promise(function(resolve, reject){
		pesan_loading('GET MASTER PROGRAM', true);
		var program = [];
		var id_urusan = url_program.split('&id_urusan=')[1].split('&')[0];
		var id_bidang = url_program.split('&id_bidang=')[1].split('&')[0];
		if(_type_singkronisasi_rka == 'rka-opd'){
			relayAjax({
				url: url_program,
				success: function(data_program){
					data_program.data.map(function(b, i){
						var id_program = b.action.split('data-id="')[1].split('"')[0];
						program.push({
							id_urusan: id_urusan,
							id_bidang: id_bidang,
							id_program: id_program,
							nama_program: b.nmprogram
						});
					});
					resolve(program);
				}
			});
		}else{
			relayAjax({
				url: url_program,
				success: function(html_program){
					jQuery(html_program).find('table td a').map(function(i, b){
						var tr = jQuery(b).closest('tr');
						var nama_program = tr.find('td').eq(1).text();
						var id_program = jQuery(b).attr('data-idprogram');
						program.push({
							id_urusan: id_urusan,
							id_bidang: id_bidang,
							id_program: id_program,
							nama_program: nama_program
						});
					});
					resolve(program);
				}
			});
		}
	});
}

function get_master_prog_fmis(idsasaran, idrkpdranwalprogram){
	pesan_loading('GET MASTER PROGRAM FMIS UNTUK ID/CODE SASARAN = '+idsasaran, true);
	return new Promise(function(resolve, reject){
		var master_prog_fmis_global = {
			hirarki: {},
			program: []
		};
		get_load_urusan(idsasaran, idrkpdranwalprogram)
		.then(function(data_urusan){
			console.log('data_urusan', data_urusan);
			var sendData = [];
			if(_type_singkronisasi_rka == 'rka-opd'){
				master_prog_fmis_global.hirarki[idrkpdranwalprogram] = {
					id: idrkpdranwalprogram,
					nama: idrkpdranwalprogram,
					bidang: {}
				};
				var url_programs = [];
				for(var id_bidang in data_urusan){
					if(id_bidang != -1){
						master_prog_fmis_global.hirarki[idrkpdranwalprogram].bidang[id_bidang] = {
							id: id_bidang,
							nama: data_urusan[id_bidang],
							program: {}
						};
						url_programs.push(config.fmis_url+'/anggaran/rka-opd/program/datatable-ref?idbidang='+id_bidang+'&id_urusan='+idrkpdranwalprogram+'&id_bidang='+id_bidang);
					}
				}
				sendData.push(Promise.resolve(url_programs));
			}else{
				data_urusan.map(function(b, i){
					master_prog_fmis_global.hirarki[b.id_urusan] = {
						id: b.id_urusan,
						nama: b.nama_urusan,
						bidang: {}
					};
					sendData.push(new Promise(function(resolve2, reject2){
						get_load_bidang(b.url_bidang)
						.then(function(data_bidang){
							console.log('data_bidang', data_bidang);
							var url_programs = [];
							data_bidang.map(function(bb, ii){
								master_prog_fmis_global.hirarki[bb.id_urusan].bidang[bb.id_bidang] = {
									id: bb.id_bidang,
									nama: bb.nama_bidang,
									program: {}
								}
								url_programs.push(bb.url_program+'&id_urusan='+bb.id_urusan+'&id_bidang='+bb.id_bidang);
							});
							resolve2(url_programs);
						});
					}));
				});
			}
			Promise.all(sendData)
			.then(function(all_url_program){
				var last = all_url_program.length - 1;
				all_url_program.reduce(function(sequence, nextData){
		            return sequence.then(function(current_data){
		        		return new Promise(function(resolve_reduce, reject_reduce){
		        			var sendData = current_data.map(function(url_program, ii){
		        				return new Promise(function(resolve2, reject2){
									get_load_program(url_program)
									.then(function(data_program){
										console.log('data_program', data_program);
										data_program.map(function(b, i){
											b.nama_program = removeNewlines(b.nama_program);
											var data_prog = {
												id: b.id_program,
												nama: b.nama_program,
												kegiatan: {}
											};
											master_prog_fmis_global.hirarki[b.id_urusan].bidang[b.id_bidang].program[b.id_program] = data_prog;
											master_prog_fmis_global.program[b.nama_program] = data_prog;
										});
										resolve2();
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
		        	console.log('master_prog_fmis_global', master_prog_fmis_global);
					resolve(master_prog_fmis_global);
		        });
			});
		});
	});
}

function get_master_keg_fmis(options){
	pesan_loading('GET MASTER KEGIATAN FMIS UNTUK IDPROGRAM = '+options.uraian, true);
	return new Promise(function(resolve, reject){
		var kegiatan_all = {};
		if(_type_singkronisasi_rka == 'rka-opd'){
			var code_program = options.action.split('data-code="')[1].split('"')[0];
			relayAjax({
				url: config.fmis_url+'/anggaran/rka-opd/kegiatan/form?code='+code_program+'&action=create',
				success: function(form_tambah){
					window.global_form_tambah_kegiatan = form_tambah.form;
					relayAjax({
						url: config.fmis_url+'/anggaran/rka-opd/kegiatan/datatable-ref?code='+code_program,
						success: function(kegiatan){
							kegiatan.data.map(function(b, i){
								b.nmkegiatan = removeNewlines(b.nmkegiatan);
								var id_kegiatan = b.action.split('data-id="')[1].split('"')[0];
								var data_keg = {
									id: id_kegiatan,
									nama: b.nmkegiatan
								}
								// keyword nama kegiatan dibuat lowercase agar mudah dicari
								kegiatan_all[b.nmkegiatan.toLowerCase()] = data_keg;
							});
							resolve(kegiatan_all);
						}
					});
				}
			});
		}else{
			relayAjax({
				url: config.fmis_url+'/perencanaan-tahunan/renja-murni/kegiatan/pilih-kegiatan/'+options.idrkpdrenjaprogram+'?load=kegiatan',
				success: function(html_kegiatan){
					jQuery(html_kegiatan).find('table td a').map(function(i, b){
						var tr = jQuery(b).closest('tr');
						var nama_kegiatan = tr.find('td').eq(1).text().trim();
						var id_kegiatan = jQuery(b).attr('data-idkegiatan');
						var data_keg = {
							id: id_kegiatan,
							nama: nama_kegiatan
						}
						// keyword nama kegiatan dibuat lowercase agar mudah dicari
						kegiatan_all[nama_kegiatan.toLowerCase()] = data_keg;
					});
					resolve(kegiatan_all);
				}
			});
		}
	});
}

function cek_insert_kegiatan_fmis(program, sub_kegiatan_filter_program){
	program.uraian = removeNewlines(program.uraian);
	var sub_kegiatan_filter_kegiatan = [];
	return new Promise(function(resolve, reduce){
		get_list_kegiatan(program)
		.then(function(kegiatan_exist){
			var kdurut = 0;
			get_master_keg_fmis(program)
			.then(function(master_kegiatan){
				var cek_kegiatan = {};
				var last = sub_kegiatan_filter_program.length - 1;
				sub_kegiatan_filter_program.reduce(function(sequence, nextData){
		            return sequence.then(function(current_data){
		        		return new Promise(function(resolve_reduce, reject_reduce){
		        			current_data.nama_program = removeNewlines(current_data.nama_program);
		        			current_data.nama_giat = removeNewlines(current_data.nama_giat);
		        			// cek proses kegiatan hanya yang nama programnya sama
		        			if(current_data.nama_program == program.uraian){
		        				current_data.nama_giat = current_data.nama_giat.toLowerCase();
		        				// cek jika kegiatan sipd tidak ada di master kegiatan fmis
								if(master_kegiatan[current_data.nama_giat]){
									var cek_exist = false;
									kegiatan_exist.data.map(function(b, i){
										b.uraian = removeNewlines(b.uraian);
										if(b.uraian.toLowerCase() == current_data.nama_giat){
											cek_exist = b;
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
			        						uraian: master_kegiatan[current_data.nama_giat].nama
			        					};
			        					pesan_loading('SIMPAN KEGIATAN '+current_data.nama_giat, true);
			        					new Promise(function(resolve, reject){
				        					if(_type_singkronisasi_rka == 'rka-opd'){
				        						var form = jQuery(global_form_tambah_kegiatan);
												data_post.idrapbdrkakegiatan = '';
												data_post.idrapbdrkaprogram = form.find('input[name="idrapbdrkaprogram"]').val();
												data_post.status_pelaksanaan = 4;
												var url = form.attr('action');
				        					}else{
				        						data_post.pagu_tahun1 = '0';
				        						data_post.pagu_tahun2 = '0';
				        						data_post.pagu_tahun3 = '0';
				        						var url = config.fmis_url+'/perencanaan-tahunan/renja-murni/kegiatan/create/'+program.idrkpdrenjaprogram;
					        				}
				        					resolve(url);
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
									            	console.log('Error simpan kegiatan!', e, this.data);
									            }
											});
			        					})
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
		});
	});
}

function get_master_sub_keg_fmis(options){
	pesan_loading('GET MASTER SUB KEGIATAN FMIS UNTUK KEGIATAN = '+options.uraian, true);
	return new Promise(function(resolve, reject){
		var sub_kegiatan_all = {};
		if(_type_singkronisasi_rka == 'rka-opd'){
			var code_kegiatan = options.action.split('data-code="')[1].split('"')[0];
			relayAjax({
				url: config.fmis_url+'/anggaran/rka-opd/subkegiatan/form?code='+code_kegiatan+'&action=create',
				success: function(form_tambah){
					window.global_form_tambah_subkegiatan = form_tambah.form;
					relayAjax({
						url: config.fmis_url+'/anggaran/rka-opd/subkegiatan/datatable-ref?code='+code_kegiatan,
						success: function(subkegiatan){
							subkegiatan.data.map(function(b, i){
								b.nmsubkegiatan = removeNewlines(b.nmsubkegiatan);
								var id_sub_kegiatan = b.action.split('data-id="')[1].split('"')[0];
								var nama_sub_kegiatan = b.nmsubkegiatan;
								var data_sub_keg = {
									id: id_sub_kegiatan,
									nama: nama_sub_kegiatan
								}
								// keyword nama subkegiatan dibuat lowercase agar mudah dicari
								sub_kegiatan_all[b.nmsubkegiatan.toLowerCase()] = data_sub_keg;
							});
							resolve(sub_kegiatan_all);
						}
					});
				}
			});
		}else{
			relayAjax({
				url: config.fmis_url+'/perencanaan-tahunan/renja-murni/subkegiatan/pilih-kegiatan/'+options.idrkpdrenjakegiatan+'?load=subkegiatan',
				success: function(html_kegiatan){
					jQuery(html_kegiatan).find('table td a').map(function(i, b){
						var tr = jQuery(b).closest('tr');
						var nama_sub_kegiatan = tr.find('td').eq(1).text().trim();
						var id_sub_kegiatan = jQuery(b).attr('data-idsubkegiatan');
						var data_sub_keg = {
							id: id_sub_kegiatan,
							nama: nama_sub_kegiatan
						}
						sub_kegiatan_all[nama_sub_kegiatan.toLowerCase()] = data_sub_keg;
					});
					resolve(sub_kegiatan_all);
				}
			});
		}
	});
}

function cek_insert_sub_kegiatan_fmis(kegiatan, sub_kegiatan_filter_kegiatan){
	kegiatan.uraian = removeNewlines(kegiatan.uraian);
	var sub_kegiatan_filter = [];
	return new Promise(function(resolve, reduce){
		get_list_sub_kegiatan(kegiatan)
		.then(function(sub_kegiatan_exist){
			var kdurut = 0;
			var kdurut_exist = 0;
			var idrkpdrenjasubkegiatan = 0;
			var code_subkegiatan = '';
			get_master_sub_keg_fmis(kegiatan)
			.then(function(master_sub_kegiatan){
				var sub_kegiatan_total = [];
				sub_kegiatan_filter_kegiatan.map(function(b, i){
					b.nama_giat = removeNewlines(b.nama_giat);
					b.nama_sub_giat = removeNewlines(b.nama_sub_giat);
					var keyword = b.nama_giat+b.nama_sub_giat;
					if(!sub_kegiatan_total[keyword]){
						b.pagu_n_lalu = +b.pagu_n_lalu;
						b.pagu_keg = +b.pagu_keg;
						b.pagu_n_depan = +b.pagu_n_depan;
						sub_kegiatan_total[keyword] = b;
					}else{
						sub_kegiatan_total[keyword].pagu_n_lalu += +b.pagu_n_lalu;
						sub_kegiatan_total[keyword].pagu_keg += +b.pagu_keg;
						sub_kegiatan_total[keyword].pagu_n_depan += +b.pagu_n_depan;
					}
				});
				var cek_sub_kegiatan = {};
				var last = sub_kegiatan_filter_kegiatan.length - 1;
				sub_kegiatan_filter_kegiatan.reduce(function(sequence, nextData){
		            return sequence.then(function(current_data){
		        		return new Promise(function(resolve_reduce, reject_reduce){
		        			current_data.nama_sub_giat = removeNewlines(current_data.nama_sub_giat);
		        			current_data.nama_giat = removeNewlines(current_data.nama_giat);
		        			// cek proses kegiatan hanya yang nama programnya sama
		        			if(current_data.nama_giat == kegiatan.uraian.toLowerCase()){
								var nama_sub_giat = current_data.nama_sub_giat.split(' ');
								nama_sub_giat.shift();
								nama_sub_giat = nama_sub_giat.join(' ');
								nama_sub_giat = nama_sub_giat.trim().toLowerCase();
		        				// cek jika kegiatan sipd tidak ada di master kegiatan fmis
								if(master_sub_kegiatan[nama_sub_giat]){
									var cek_exist = false;
									sub_kegiatan_exist.data.map(function(b, i){
										b.uraian = removeNewlines(b.uraian);
										if(b.uraian.trim().toLowerCase() == nama_sub_giat){
											cek_exist = b;
											kdurut_exist = b.kdurut;
											idrkpdrenjasubkegiatan = b.idrkpdrenjasubkegiatan;
											if(_type_singkronisasi_rka == 'rka-opd'){
												code_subkegiatan = b.action.split('data-code="')[1].split('"')[0];
											}
										}
										if(kdurut <= +b.kdurut){
											kdurut = +b.kdurut;
										}
									});
									current_data.kegiatan_fmis = kegiatan;
									sub_kegiatan_filter.push(current_data);
									var keyword = current_data.nama_giat+current_data.nama_sub_giat;
		        					var data_post = {
		        						_token: _token,
		        						idsubkegiatan: master_sub_kegiatan[nama_sub_giat].id,
		        						uraian: master_sub_kegiatan[nama_sub_giat].nama,
		        						pagu_tahun1: +sub_kegiatan_total[keyword].pagu_n_lalu,
		        						// pagu_tahun1: 0,
		        						pagu_tahun2: +sub_kegiatan_total[keyword].pagu_keg,
		        						pagu_tahun3: +sub_kegiatan_total[keyword].pagu_n_depan
		        					};
									if(!cek_exist && !cek_sub_kegiatan[nama_sub_giat]){
										cek_sub_kegiatan[nama_sub_giat] = current_data;
					        			kdurut++;
			        					data_post.kdurut = kdurut;
			        					pesan_loading('SIMPAN SUB KEGIATAN '+nama_sub_giat, true);
			        					new Promise(function(resolve3, reject3){
				        					if(_type_singkronisasi_rka == 'rka-opd'){
			        							var form = jQuery(global_form_tambah_subkegiatan);
			        							data_post.bln1 = 1;
			        							data_post.bln2 = 12;
			        							data_post.status_pelaksanaan = 4;
			        							data_post.idrapbdrkakegiatan = form.find('input[name="idrapbdrkakegiatan"]').val();
												var url = form.attr('action');
				        						resolve3(url);
				        					}else{
					        					data_post['table-pilih-subkegiatan_length'] = 10;
				        						var url = config.fmis_url+'/perencanaan-tahunan/renja-murni/subkegiatan/create/'+kegiatan.idrkpdrenjakegiatan;
				        						resolve3(url);
					        				}
			        					})
			        					.then(function(url_proses){
				        					relayAjax({
												url: url_proses,
												type: "post",
									            data: data_post,
									            success: function(res){
								        			resolve_reduce(nextData);
									            },
									            error: function(e){
									            	console.log('Error kegiatan!', e, this.data);
									            }
											});
			        					})
			        				}else if(cek_exist && !cek_sub_kegiatan[nama_sub_giat]){
										cek_sub_kegiatan[nama_sub_giat] = current_data;
			        					data_post.kdurut = kdurut_exist;
			        					pesan_loading('UPDATE SUB KEGIATAN '+nama_sub_giat, true);
			        					new Promise(function(resolve3, reject3){
				        					if(_type_singkronisasi_rka == 'rka-opd'){
				        						relayAjax({
													url: config.fmis_url+'/anggaran/rka-opd/subkegiatan/form?code='+code_subkegiatan+'&action=edit',
													success: function(form_edit){
														var form = jQuery(form_edit.form);
					        							data_post._method = 'PUT';
					        							data_post.bln1 = 1;
					        							data_post.bln2 = 12;
					        							data_post.status_pelaksanaan = cek_exist.status_pelaksanaan;
					        							data_post.idrapbdrkasubkegiatan = form.find('input[name="idrapbdrkasubkegiatan"]').val();
					        							data_post.idrapbdrkakegiatan = form.find('input[name="idrapbdrkakegiatan"]').val();
														var url = form.attr('action');
						        						resolve3(url);
						        					}
						        				});
				        					}else{
				        						var url = config.fmis_url+'/perencanaan-tahunan/renja-murni/subkegiatan/update/'+idrkpdrenjasubkegiatan;
				        						resolve3(url);
					        				}
			        					})
			        					.then(function(url_proses){
				        					relayAjax({
												url: url_proses,
												type: "post",
									            data: data_post,
									            success: function(res){
								        			resolve_reduce(nextData);
									            },
									            error: function(e){
									            	console.log('Error kegiatan!', e, this.data);
									            }
											});
				        				});
			        				}else{
			        					console.log('sub kegiatan sudah ada di fmis double', current_data, sub_kegiatan_exist.data);
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
		        	return new Promise(function(resolve2, reject2){
			        	// cek hanya insert sampai sub atau juga rincian belanjanya
			        	if(
			        		typeof lingkup_rka_global == 'undefined' 
			        		|| lingkup_rka_global == 1
			        	){
				        	// start insert RKA
				        	get_list_sub_kegiatan(kegiatan)
							.then(function(sub_kegiatan_exist){
								var last = sub_kegiatan_filter_kegiatan.length - 1;
								sub_kegiatan_filter_kegiatan.reduce(function(sequence, nextData){
						            return sequence.then(function(current_data){
						        		return new Promise(function(resolve_reduce, reject_reduce){
					        				var nama_sub_giat = current_data.nama_sub_giat.split(' ');
											nama_sub_giat.shift();
											nama_sub_giat = nama_sub_giat.join(' ');
											nama_sub_giat = nama_sub_giat.trim().toLowerCase();
						        			var sub_kegiatan_sipd = false;
						        			sub_kegiatan_exist.data.map(function(sub_kegiatan_fmis, i){
						        				sub_kegiatan_fmis.uraian = removeNewlines(sub_kegiatan_fmis.uraian);
						        				if(
						        					current_data.nama_giat == kegiatan.uraian.toLowerCase()
						        					&& sub_kegiatan_fmis.uraian.trim().toLowerCase() == nama_sub_giat
						        				){
						        					current_data.sub_keg_fmis = sub_kegiatan_fmis;
						        					sub_kegiatan_sipd = current_data;
						        				}
						        			});
						        			if(sub_kegiatan_sipd){
												window.ssh_not_found_global = [];
								        		insert_update_rka(sub_kegiatan_sipd)
								        		.then(function(){
								        			resolve_reduce(nextData);
								        			if(ssh_not_found_global.length >= 1){
										        		var pesan_ssh = 'Data SSH tidak ditemukan dari PERKADA SSH { '+ssh_not_found_global.join('; ')+' }';
										        		console.log(pesan_ssh);
										        	}
								        		});
								        	}else{
								        		// console.log('SUB KEGIATAN tidak ditemukan di SIPD!', sub_kegiatan_fmis);
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
				        			resolve2();
				        		});
				        	});
						}else{
		        			resolve2();
		        		}
		        	});
		        })
		        .then(function(){
		        	// cek apakah perlu update pagu sub kegiatan sesuai pagu rincian
		        	if(
		        		typeof pagu_sub_keg_global != 'undefined'
		        		&& pagu_sub_keg_global == 1
		        	){
		        		update_pagu_sub_from_rincian(kegiatan, cek_sub_kegiatan)
		        		.then(function(){
		        			resolve(sub_kegiatan_filter);
		        		});
		        	}else{
		        		resolve(sub_kegiatan_filter);
		        	}
		        });
			});
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

function get_list_aktivitas(options){
	return new Promise(function(resolve, reject){
		pesan_loading('GET AKTIVITAS EXISTING DARI SUBKEGIATAN = '+options.uraian, true);
		if(_type_singkronisasi_rka == 'rka-opd'){
			var code_subkegiatan = options.action.split('data-code="')[1].split('"')[0];
			relayAjax({
				url: config.fmis_url+'/anggaran/rka-opd/aktivitas/datatable?code='+code_subkegiatan,
				success: function(aktivitas_exist){
					return resolve(aktivitas_exist);
				}
			});
		}else{
			relayAjax({
				url: config.fmis_url+'/perencanaan-tahunan/renja-murni/aktivitas/data/'+options.idrkpdrenjasubkegiatan,
				success: function(aktivitas_exist){
					return resolve(aktivitas_exist);
				}
			});
		}
	});
}

function singkronisasi_rka_modal(id_code_kegiatan){
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
        			insert_update_rka(current_data)
        			.then(function(){
        				resolve_reduce(nextData);
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
        	alert('Berhasil singkronisasi data RKA sub kegiatan dari WP-SIPD!');
			run_script('program_hide');
			hide_loading();
        });
	}else{
		alert('Pilih sub kegiatan dulu!');
	}
}

function insert_update_rka(sub_kegiatan_sipd){
	return new Promise(function(resolve2, reject2){
		pesan_loading('GET DATA RKA DI WP-SIPD UNTUK SUBKEGIATAN = '+sub_kegiatan_sipd.sub_keg_fmis.uraian+', kode_sbl = '+sub_kegiatan_sipd.kode_sbl, true);
		get_rka_sipd(sub_kegiatan_sipd.kode_sbl)
		.then(function(rka_sipd){
			new Promise(function(resolve, reject){
				get_list_aktivitas(sub_kegiatan_sipd.sub_keg_fmis)
				.then(function(aktivitas_exist){
					sub_kegiatan_sipd.aktivitas = aktivitas_exist.data;
					cek_insert_aktivitas_fmis(rka_sipd, sub_kegiatan_sipd)
					.then(function(){
						resolve();
					});
				});
			})
			.then(function(){
				get_list_aktivitas(sub_kegiatan_sipd.sub_keg_fmis)
				.then(function(aktivitas_exist){
					sub_kegiatan_sipd.aktivitas = aktivitas_exist.data;
					cek_insert_rka_fmis(rka_sipd, sub_kegiatan_sipd)
					.then(function(){
						resolve2();
					});
				});
			})
		});
	});
}

function get_master_sumberdana(options){
	pesan_loading('GET MASTER SUMBER DANA DARI SUBKEGIATAN = '+options.uraian, true);
	return new Promise(function(resolve, reject){
		if(_type_singkronisasi_rka == 'rka-opd'){
			var code_subkegiatan = options.action.split('data-code="')[1].split('"')[0];
			relayAjax({
				url: config.fmis_url+'/anggaran/rka-opd/aktivitas/form?code='+code_subkegiatan+'&action=create',
				success: function(form_tambah){
					var data = {};
					jQuery(form_tambah.form).find('#idsumberdana1 option').map(function(i, b){
						var val = jQuery(b).attr('value');
						if(val != -1){
							data[jQuery(b).text().trim()] = val;
						}
					});
					resolve(data);
				}
			});
		}else{
			relayAjax({
				url: config.fmis_url+'/perencanaan-tahunan/renja-murni/aktivitas/pilih-data/'+options.idsubkegiatan+'?load=sumberdana1',
				success: function(form_tambah){
					var data = {};
					jQuery(form_tambah).find('a.btn-choose-data-sumberdana1').map(function(i, b){
						data[jQuery(b).attr('data-uraian')] = jQuery(b).attr('data-idsumberdana');
					});
					resolve(data);
				}
			});
		}
	});
}

function get_rka_aktivitas(options){
	pesan_loading('GET RKA EXISTING DARI AKTIVITAS = '+options.uraian, true);
	return new Promise(function(resolve, reject){
		if(_type_singkronisasi_rka == 'rka-opd'){
			var code_aktivitas = options.action.split('form?code=')[1].split('"')[0];
			relayAjax({
				url: config.fmis_url+'/anggaran/rka-belanja/belanja/form?code='+code_aktivitas+'&action=create',
				success: function(form_tambah){
					relayAjax({
						url: config.fmis_url+'/anggaran/rka-belanja/belanja/datatable?code='+code_aktivitas,
						success: function(rka){
							rka.form_tambah_rka = form_tambah.form;
							resolve(rka);
						},
						error: function(e){
							console.log('Error get RKA existing dari aktivitas', options);
						}
					});
				}
			});
		}else{
			relayAjax({
				url: config.fmis_url+'/perencanaan-tahunan/renja-murni/aktivitas/rincbelanja/data/'+options.idrkpdrenjaaktivitas,
				success: function(rka){
					resolve(rka);
				},
				error: function(e){
					console.log('Error get RKA existing dari aktivitas', options.idrkpdrenjaaktivitas);
				}
			});
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

function get_id_ssh_rka(rka, options){
	pesan_loading('GET DATA SSH "'+rka.nama_komponen+'" HARGA "'+rka.harga_satuan+'"', true);
	return new Promise(function(resolve, reject){
		var unik_rincian = (rka.harga_satuan+' '+rka.satuan+' '+rka.nama_komponen)
		unik_rincian = unik_rincian.split('\n')[0];
		unik_rincian = replace_string(unik_rincian, true).substring(0, 250).trim();
		// pencairan item ssh jika ada karakter [ atau ] di halaman tambah rincian tidak jalan. berbeda jika dicari di halman perkada lancar. maka perlu di split.
		unik_rincian = unik_rincian.split('[')[0];
		unik_rincian = unik_rincian.split('>')[0];
		unik_rincian = unik_rincian.split('<')[0];
		unik_rincian = unik_rincian.split('"')[0];
		unik_rincian = unik_rincian.replace('null', '');
		var unik_rincian_search = encodeURIComponent(unik_rincian);
		if(_type_singkronisasi_rka == 'rka-opd'){
			var url_ssh = config.fmis_url+'/anggaran/rka-belanja/belanja/datatable-ref?draw=1&columns%5B0%5D%5Bdata%5D=action&columns%5B0%5D%5Bname%5D=action&columns%5B0%5D%5Bsearchable%5D=false&columns%5B0%5D%5Borderable%5D=false&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=uraian&columns%5B1%5D%5Bname%5D=uraian&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=true&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=nilai&columns%5B2%5D%5Bname%5D=nilai&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=true&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=uraian_satuan&columns%5B3%5D%5Bname%5D=uraian_satuan&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=true&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=spesifikasi&columns%5B4%5D%5Bname%5D=spesifikasi&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=true&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&order%5B0%5D%5Bcolumn%5D=1&order%5B0%5D%5Bdir%5D=asc&start=0&length=-1&search%5Bvalue%5D='+unik_rincian_search+'&search%5Bregex%5D=false';
		}else{
			var url_ssh = config.fmis_url+'/perencanaan-tahunan/renja-murni/aktivitas/rincbelanja/datassh4/'+options.idrkpdrenjaaktivitas+'?idrkpdrenjaaktivitas='+options.idrkpdrenjaaktivitas+'&draw=1&columns%5B0%5D%5Bdata%5D=action&columns%5B0%5D%5Bname%5D=action&columns%5B0%5D%5Bsearchable%5D=false&columns%5B0%5D%5Borderable%5D=false&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=kdurut&columns%5B1%5D%5Bname%5D=kdurut&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=true&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=uraian&columns%5B2%5D%5Bname%5D=uraian&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=true&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=satuan&columns%5B3%5D%5Bname%5D=satuan&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=true&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=nilai&columns%5B4%5D%5Bname%5D=nilai&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=true&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=spesifikasi&columns%5B5%5D%5Bname%5D=spesifikasi&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=true&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&order%5B0%5D%5Bcolumn%5D=1&order%5B0%5D%5Bdir%5D=asc&start=0&length=-1&search%5Bvalue%5D='+unik_rincian_search+'&search%5Bregex%5D=false';
		}
		relayAjax({
			url: url_ssh,
			success: function(ssh){
				var data_ssh = false;
				var data_ssh_satuan_null = false;
				ssh.data.map(function(b, i){
					if(to_number(b.nilai) == rka.harga_satuan){
						if(
							(
								rka.satuan == 'null' 
								|| !rka.satuan
							)
							&& b.uraian_satuan == 'kosong'
						){
							data_ssh_satuan_null = b;
						}else{
							data_ssh = b;
						}
					}
				});
				if(data_ssh_satuan_null != false){
					data_ssh = data_ssh_satuan_null;
				}
				if(ssh.data.length == 0 || !data_ssh){
					console.log('Item SSH tidak ditemukan', unik_rincian, rka, url_ssh);
					resolve(false);
				}else{
					if(_type_singkronisasi_rka == 'rka-opd'){
						data_ssh.idssh_4 = data_ssh.action.split('data-id="')[1].split('"')[0];
						var form = jQuery(options.form_tambah_rka);
						var idsub = form.find('input[name="idrapbdrkaaktivitas"]').val();
						var url_rekening = config.fmis_url+'/anggaran/rka-belanja/belanja/datatable-rek?draw=2&columns%5B0%5D%5Bdata%5D=action&columns%5B0%5D%5Bname%5D=action&columns%5B0%5D%5Bsearchable%5D=false&columns%5B0%5D%5Borderable%5D=false&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=kode_rekening&columns%5B1%5D%5Bname%5D=kode_rekening&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=true&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=nmrek6&columns%5B2%5D%5Bname%5D=nmrek6&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=true&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&order%5B0%5D%5Bcolumn%5D=0&order%5B0%5D%5Bdir%5D=asc&start=0&length=10&search%5Bvalue%5D='+rka.kode_akun+'&search%5Bregex%5D=false&code='+data_ssh.idssh_4+'&idsub='+idsub;
					}else{
						var url_rekening = config.fmis_url+'/perencanaan-tahunan/renja-murni/aktivitas/rincbelanja/pilih-data/'+data_ssh.idssh_4+'?load=rekening&idrkpdrenjaaktivitas='+options.idrkpdrenjaaktivitas;
					}
					relayAjax({
						url: url_rekening,
						success: function(rekening_html){
							var cek_rek = false;
							if(_type_singkronisasi_rka == 'rka-opd'){
								rekening_html.data.map(function(b, i){
									if(rka.kode_akun == b.kode_rekening){
										data_ssh.nama_akun = b.kode_rekening+' '+b.nmrek6;
									    data_ssh.harga = data_ssh.action.split('data-harga="')[1].split('"')[0];
									    data_ssh.kdrek1 = b.kdrek1;
									    data_ssh.kdrek2 = b.kdrek2;
									    data_ssh.kdrek3 = b.kdrek3;
									    data_ssh.kdrek4 = b.kdrek4;
									    data_ssh.kdrek5 = b.kdrek5;
									    data_ssh.kdrek6 = b.kdrek6;
									    data_ssh.uraian = data_ssh.uraian + '/' + b.nmrek6;
									    data_ssh.satuan = data_ssh.idsatuan;
									    cek_rek = true;
									}
								})
							}else{
								var rek_sipd = [];
								rka.kode_akun.split('.').map(function(b, n){
									rek_sipd.push(+b);
								});
								rek_sipd = rek_sipd.join('.');
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
							}
							if(cek_rek){
								resolve(data_ssh);
							}else if(_type_singkronisasi_rka == 'rka-opd'){
								console.log('Rekening tidak ditemukan untuk SSH', unik_rincian, rka, data_ssh);
								resolve(false);
							}else{
								pesan_loading('DATA SSH "'+rka.nama_komponen+'" belum tersetting rekenginnya. Cari dari master rekenging.', true);
								get_master_rekening_rka(options.idrkpdrenjaaktivitas, data_ssh.idssh_4)
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
										resolve(data_ssh);
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
				console.log('Error get RKA existing dari aktivitas', options.idrkpdrenjaaktivitas);
			}
		});
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

Number.prototype.noExponents = function() {
  	var data = String(this).split(/[eE]/);
  	if (data.length == 1) return data[0];

  	var z = '',
	    sign = this < 0 ? '-' : '',
	    str = data[0].replace('.', ''),
	    mag = Number(data[1]) + 1;

  	if (mag < 0) {
	    z = sign + '0.';
	    while (mag++) z += '0';
	    return z + str.replace(/^\-/, '');
  	}
	mag -= str.length;
	while (mag--) z += '0';
	return str + z;
}

function replace_number(number){
	number = (+number).noExponents();
	if(_type_singkronisasi_rka == 'rka-opd'){
		return (number+'').replace(/\./g, ',');
	}else{
		return number;
	}
}

function cek_insert_rka_fmis(rka_sipd, sub_keg){
	return new Promise(function(resolve, reject){
		console.log('cek dan insert RKA '+sub_keg.nama_sub_giat, rka_sipd, sub_keg.aktivitas, sub_keg);
		var last1 = sub_keg.aktivitas.length - 1;
		sub_keg.aktivitas.reduce(function(sequence, nextData){
            return sequence.then(function(aktivitas){
        		return new Promise(function(resolve_reduce, reject_reduce){
					var cek_aktivitas_sub_unit = false;
					// inisiasi data rincian unik sipd
					var rka_unik = {};
					var uraian_aktivitas_fmis = replace_string(aktivitas.uraian, true, true);
					rka_sipd.map(function(b, i){
    					var sumber_dana_sipd = b.sumber_dana[0].nama_dana.split('] - ');
	        			if(sumber_dana_sipd.length > 1){
		    				sumber_dana_sipd = sumber_dana_sipd[1].replace(/ - /g,'-').trim();
		    			}else{
		    				sumber_dana_sipd = sumber_dana_sipd[0].replace(/ - /g,'-').trim();
		    			}
						var nama_aktivitas = (sumber_dana_sipd+' | '+sub_keg.nama_sub_skpd).substring(0, 500).trim();
						if(nama_aktivitas == uraian_aktivitas_fmis){
							cek_aktivitas_sub_unit = true;
						}

						var kelompok_keterangan = replace_string(b.subs_bl_teks+' | '+b.ket_bl_teks, true, true).substring(0, 500).trim();
    					var nama_rincian = nama_aktivitas+replace_string(kelompok_keterangan+' | '+b.nama_komponen+' | '+b.spek_komponen, false, false).substring(0, 500).trim()+b.kode_akun+b.harga_satuan;
    					if(!rka_unik[nama_rincian]){
    						rka_unik[nama_rincian] = {
    							jml_sipd: 1,
    							jml_fmis: 0
    						};
    					}else{
    						rka_unik[nama_rincian].jml_sipd++;
    					}
					});

					var nama_skpd_aktivitas = uraian_aktivitas_fmis.split(' | ');

					// cek jika aktivitas tidak ditemukan tapi rincian ada dan sub unitnya berbeda
					if(
						false == cek_aktivitas_sub_unit 
						&& rka_sipd.length > 0
					){
						return resolve_reduce(nextData);
					// cek jika rka sipd kosong, dan aktivitas tidak ada di fmis
					}else if(
						rka_sipd.length == 0
						&& nama_skpd_aktivitas[1]
						&& nama_skpd_aktivitas[1] != sub_keg.nama_sub_skpd
					){
						return resolve_reduce(nextData);
					}else{
						console.log(
							cek_aktivitas_sub_unit, 
							rka_sipd, 
							sub_keg.nama_sub_skpd, 
							uraian_aktivitas_fmis
						);
					}

        			get_rka_aktivitas(aktivitas)
					.then(function(rka){
						// inisiasi form tambah rka fmis dalam aktivitas yang dipilih
						if(rka.form_tambah_rka){
							aktivitas.form_tambah_rka = rka.form_tambah_rka;
						}

						// inisiasi data rincian unik fmis
						var data_rka = rka.data;
						data_rka.map(function(b, i){
							var uraian_belanja = replace_string(b.uraian_belanja, false, false);
							var uraian_belanja_unik = replace_string(aktivitas.uraian, true, true)+uraian_belanja+b.kode_rekening+to_number(b.harga);
							if(!rka_unik[uraian_belanja_unik]){
        						rka_unik[uraian_belanja_unik] = {
        							jml_sipd: 0,
        							jml_fmis: 1
        						};
        					}else{
        						rka_unik[uraian_belanja_unik].jml_fmis++;
        					}
						});
						console.log('rka_unik', rka_unik);

						var last = rka_sipd.length - 1;
						var kdurut = 0;
						console.log('Insert RKA untuk aktivitas = '+aktivitas.uraian, sub_keg.nama_sub_giat, data_rka);
						var cek_double = {sipd: {}, fmis: {}};
						rka_sipd.reduce(function(sequence2, nextData2){
				            return sequence2.then(function(current_data){
				        		return new Promise(function(resolve_reduce2, reject_reduce2){
				        			var sumber_dana_sipd = current_data.sumber_dana[0].nama_dana.split('] - ');
				        			if(sumber_dana_sipd.length > 1){
					    				sumber_dana_sipd = sumber_dana_sipd[1].replace(/ - /g,'-').trim();
					    			}else{
					    				sumber_dana_sipd = sumber_dana_sipd[0].replace(/ - /g,'-').trim();
					    			}
									var nama_aktivitas = (sumber_dana_sipd+' | '+sub_keg.nama_sub_skpd).substring(0, 500).trim();

			        				if(nama_aktivitas == replace_string(aktivitas.uraian, true, true)){
				        				var kelompok_keterangan = replace_string(current_data.subs_bl_teks+' | '+current_data.ket_bl_teks, true, true).substring(0, 500).trim();
			        					var nama_rincian = replace_string(kelompok_keterangan+' | '+current_data.nama_komponen+' | '+current_data.spek_komponen, false, false).substring(0, 500).trim();
										var nama_rincian_unik = replace_string(aktivitas.uraian, true, true)+nama_rincian+current_data.kode_akun+current_data.harga_satuan;
			        					var cek_exist = false;
			        					var need_update = false;
			        					if(!cek_double.sipd[nama_rincian_unik]){
											cek_double.sipd[nama_rincian_unik] = [];
										}
										cek_double.sipd[nama_rincian_unik].push(current_data);
										cek_double.fmis = {};
										data_rka.map(function(b, i){
											var uraian_belanja = replace_string(b.uraian_belanja, false, false);
											var uraian_belanja_unik = replace_string(aktivitas.uraian, true, true)+uraian_belanja+b.kode_rekening+to_number(b.harga);
											if(!cek_double.fmis[uraian_belanja_unik]){
												cek_double.fmis[uraian_belanja_unik] = [];
											}
											cek_double.fmis[uraian_belanja_unik].push(b);

											// cek jika nama unik sudah terinsert atau belum
											if(uraian_belanja_unik == nama_rincian_unik){
												// cek jika jumlah rincian unik fmis sudah sama dengan jumlah rincian sipd
												if(rka_unik[uraian_belanja_unik].jml_fmis >= rka_unik[uraian_belanja_unik].jml_sipd){
													cek_exist = true;
													if(
														to_number(b.jumlah) != current_data.total_harga
														&& cek_double.sipd[uraian_belanja_unik].length == cek_double.fmis[uraian_belanja_unik].length
													){
														console.log('URAIAN BELANJA UNIK:', uraian_belanja_unik, current_data);
														need_update = b;
													}
												}else{
													rka_unik[uraian_belanja_unik].jml_fmis++;
												}
											}
											if(kdurut <= +b.kdurut){
												kdurut = +b.kdurut;
											}
										});
										if(!cek_exist){
											current_data.nama_rincian = nama_rincian;
											get_id_ssh_rka(current_data, aktivitas)
											.then(function(ssh){
												if(ssh){
													kdurut++;
							        				var data_post = {
							        					_token: _token,
							        					idsumberdana : aktivitas.idsumberdana1,
							        					kdurut : kdurut,
							        					idssh_4 : ssh.idssh_4,
							        					kdrek1 : ssh.kdrek1,
							        					kdrek2 : ssh.kdrek2,
							        					kdrek3 : ssh.kdrek3,
							        					kdrek4 : ssh.kdrek4,
							        					kdrek5 : ssh.kdrek5,
							        					kdrek6 : ssh.kdrek6,
							        					uraian_belanja : nama_rincian,
							        					idsatuan1 : ssh.idsatuan,
							        					volume_1 : replace_number(current_data.volume),
							        					idsatuan2 : '',
							        					volume_2 : '',
							        					idsatuan3 : '',
							        					volume_3 : '',
							        					harga : replace_number(ssh.harga),
							        				}
							        				pesan_loading('SIMPAN RINCIAN "'+ssh.uraian+'" AKTIVITAS "'+aktivitas.uraian+'" SUBKEGIATAN "'+sub_keg.nama_sub_giat+'"', true);
							        				new Promise(function(resolve3, reject3){
								        				if(_type_singkronisasi_rka == 'rka-opd'){
								        					var form = jQuery(aktivitas.form_tambah_rka);
								        					data_post.idrapbdrkabelanja = '';
								        					data_post.idrapbdrkaaktivitas = form.find('input[name="idrapbdrkaaktivitas"]').val();
								        					data_post.uraian = ssh.uraian;
								        					data_post.uraian_rekening = ssh.nama_akun;
								        					data_post.volume_renja1 = 0;
								        					data_post.volume_renja2 = 0;
								        					data_post.volume_renja3 = 0;
								        					data_post.harga_renja = 1;
								        					data_post.jml_volume_renja = 0;
								        					data_post.jumlah_renja = 0;
								        					if(current_data.totalpajak != 0){
								        						data_post.volume_2 = '1,1';
								        						data_post.idsatuan2 = ssh.idsatuan;
								        					}else{
								        						data_post.volume_2 = 1;
								        					}
								        					data_post.volume_3 = 1;
								        					data_post.jml_volume = replace_number(current_data.volume);
								        					data_post.jumlah = replace_number(current_data.total_harga);
								        					data_post.status_pelaksanaan = 4;
								        					var url = form.attr('action');
								        					resolve3(url);
								        				}else{
								        					if(current_data.totalpajak != 0){
								        						data_post.volume_2 = '1,1';
								        						data_post.idsatuan2 = ssh.idsatuan;
								        						data_post.uraian_satuan2 = ssh.uraian_satuan;
								        					}else{
								        						data_post.volume_2 = '';
								        						data_post.uraian_satuan2 = '';
								        					}
							        						data_post.uraian_idssh_4 = ssh.uraian;
							        						data_post.idsatuanindikator = '';
								        					data_post.uraian_satuan1 = ssh.uraian_satuan;
								        					data_post.uraian_satuan3 = '';
								        					var url = config.fmis_url+'/perencanaan-tahunan/renja-murni/aktivitas/rincbelanja/create/'+aktivitas.idrkpdrenjaaktivitas;
								        					resolve3(url);
								        				}
								        			})
								        			.then(function(url_simpan){
								        				if(
								        					data_post.harga == '0'
								        					&& data_post.jumlah == '0'
								        				){
								        					console.log('Lewati simpan rincian jumlah 0!', data_post);
								        					return resolve_reduce2(nextData2);
								        				}
								        				// ajax dibuat sekali karena terjadi double input rincian, ketika jaringan ke server fmis lambat
							        					jQuery.ajax({
															url: url_simpan,
															type: "post",
												            data: data_post,
												            success: function(res){
												            	resolve_reduce2(nextData2);
												            },
												            error: function(e){
												            	console.log('Error save rincian!', e, this.data);
												            	resolve_reduce2(nextData2);
												            }
														});
								        			});
												}else{
													var unik_rincian = (current_data.harga_satuan+' '+current_data.satuan+' '+current_data.nama_komponen).substring(0, 250).trim();
													ssh_not_found_global.push(unik_rincian);
													console.log('item SSH tidak ditemukan ', unik_rincian);
													resolve_reduce2(nextData2);
												}
					        				});
				        				}else if(need_update){
				        					need_update.volume_1 = replace_number(current_data.volume);
				        					need_update.jml_volume = replace_number(current_data.volume);
				        					need_update.jumlah = replace_number(current_data.total_harga);
				        					if(current_data.totalpajak != 0){
				        						need_update.volume_2 = '1,1';
				        						need_update.jml_volume = replace_number(current_data.volume*1.1);
				        						need_update.idsatuan2 = need_update.idsatuan1;
				        					}else{
				        						need_update.volume_2 = 1;
				        					}
											update_rincian_fmis(need_update, aktivitas, sub_keg)
					        				.then(function(){
					        					resolve_reduce2(nextData2);
					        				});
				        				}else{
				        					console.log('Item belanja "'+nama_rincian_unik+'" sudah ada!');
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
				        	var rka_unik_fmis = {};
				        	data_rka.map(function(b, i){
								var uraian_belanja = replace_string(b.uraian_belanja, false, false);
								var uraian_belanja_unik = replace_string(aktivitas.uraian, true, true)+uraian_belanja+b.kode_rekening+to_number(b.harga);;
								if(!rka_unik_fmis[uraian_belanja_unik]){
									rka_unik_fmis[uraian_belanja_unik] = [];
								}
								rka_unik_fmis[uraian_belanja_unik].push(b);
							});
				        	var kosongkan_rincian = [];
				        	for(var nama_rincian_unik in rka_unik){
				        		var selisih = rka_unik[nama_rincian_unik].jml_fmis - rka_unik[nama_rincian_unik].jml_sipd;
				        		// cek jika ada rincian yang ada di fmis dan tidak ada di sipd. bisa karena diinput manual atau karena rincian di sipd dihapus. rincian ini perlu di nolkan agar pagu sub kegiatannya sama dengan sipd
				        		if(selisih >= 1){
				        			rka_unik_fmis[nama_rincian_unik].map(function(b, i){
										if(i < selisih){
											if(to_number(b.jml_volume) > 0){
												kosongkan_rincian.push(b);
											}
											rka_unik[nama_rincian_unik].jml_sipd++;
										}
									});
				        		}
				        	}
				        	console.log('kosongkan_rincian, rka_unik, rka_unik_fmis', kosongkan_rincian, rka_unik, rka_unik_fmis);
				        	var last = kosongkan_rincian.length - 1;
				        	kosongkan_rincian.reduce(function(sequence2, nextData2){
					            return sequence2.then(function(current_data){
					        		return new Promise(function(resolve_reduce2, reject_reduce2){
					        			current_data.volume_1 = replace_number('0');
			        					current_data.jml_volume = replace_number('0');
			        					current_data.jumlah = replace_number('0');
					        			update_rincian_fmis(current_data, aktivitas, sub_keg)
					        			.then(function(){
					        				resolve_reduce2(nextData2);
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
					        }, Promise.resolve(kosongkan_rincian[last]))
					        .then(function(data_last){
				        		resolve_reduce(nextData);
				        	});
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

function update_rincian_fmis(need_update, aktivitas, sub_keg){
	return new Promise(function(resolve_reduce2, reject_reduce2){
		need_update.uraian_belanja = replace_string(need_update.uraian_belanja, true, true, true);
		var data_post = {
			_token: _token,
			_method: 'PUT',
			kdurut: need_update.kdurut,
			idsumberdana: aktivitas.idsumberdana1,
			uraian: need_update.uraian_ssh,
			idssh_4: need_update.idssh_4,
			uraian_rekening: need_update.rekening_display,
			kdrek1: need_update.kdrek1,
			kdrek2: need_update.kdrek2,
			kdrek3: need_update.kdrek3,
			kdrek4: need_update.kdrek4,
			kdrek5: need_update.kdrek5,
			kdrek6: need_update.kdrek6,
			uraian_belanja: need_update.uraian_belanja,
			volume_renja1: to_number(need_update.volume_renja1, true),
			volume_renja2: to_number(need_update.volume_renja2, true),
			volume_renja3: to_number(need_update.volume_renja3, true),
			jml_volume_renja: to_number(need_update.jml_volume_renja, true),
			jumlah_renja: to_number(need_update.jumlah_renja, true),
			volume_1: to_number(need_update.volume_1, true),
			volume_2: to_number(need_update.volume_2, true),
			volume_3: to_number(need_update.volume_3, true),
			jml_volume: to_number(need_update.jml_volume, true),
			jumlah: to_number(need_update.jumlah, true),
			idsatuan1: need_update.idsatuan1,
			idsatuan2: need_update.idsatuan2,
			idsatuan3: need_update.idsatuan3,
			status_pelaksanaan: need_update.status_pelaksanaan
		};
		pesan_loading('UPDATE RINCIAN "'+need_update.uraian_ssh+' | '+need_update.uraian_belanja+'" REKENING "'+need_update.rekening_display+'" AKTIVITAS "'+aktivitas.uraian+'" SUBKEGIATAN "'+sub_keg.nama_sub_giat+'"', true);
		console.log('need_update', need_update);
		new Promise(function(resolve, reduce){
			var code_rincian = need_update.action.split('code=')[1].split('"')[0];
			relayAjax({
				url: config.fmis_url+'/anggaran/rka-belanja/belanja/form?code='+code_rincian+'&action=edit',
	            success: function(form_edit){
    				var form = jQuery(form_edit.form);
    				data_post.idrapbdrkabelanja = form.find('input[name="idrapbdrkabelanja"]').val();
    				data_post.idrapbdrkaaktivitas = form.find('input[name="idrapbdrkaaktivitas"]').val();
    				data_post.harga_renja = form.find('input[name="harga_renja"]').val().replace(/\./g, '');
    				data_post.harga = form.find('input[name="harga"]').val().replace(/\./g, '');
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
	            	resolve_reduce2();
	            },
	            error: function(e){
	            	console.log('Error save rincian!', e, this.data);
	            }
			});
		})
	})
}

function cek_insert_aktivitas_fmis(rka_sipd, sub_keg){
	return new Promise(function(resolve, reject){
		get_id_sub_unit_fmis(sub_keg.sub_keg_fmis, sub_keg.id_mapping, sub_keg.nama_sub_skpd)
		.then(function(id_sub_unit){
			get_master_sumberdana(sub_keg.sub_keg_fmis)
			.then(function(master_sumberdana){
				getIdSatuan('Paket', false, {
					data: {}
				})
				.then(function(satuan_fmis){
					var all_aktivitas = [];
					rka_sipd.map(function(b, i){
						var idsumberdana = '5';
	        			var uraian_sumberdana = 'Pendapatan Transfer Pemerintah Pusat';
	        			var sumber_dana_sipd = b.sumber_dana[0].nama_dana.split('] - ');
	        			if(sumber_dana_sipd.length == 1){
	        				sumber_dana_sipd = sumber_dana_sipd[0].replace(/ - /g,'-').trim();
	        			}else{
	        				sumber_dana_sipd = sumber_dana_sipd[1].replace(/ - /g,'-').trim();
	        			}
						// var nama_aktivitas = replace_string(b.subs_bl_teks+' | '+b.ket_bl_teks, true, true).substring(0, 500).trim();
						var nama_aktivitas = (sumber_dana_sipd+' | '+sub_keg.nama_sub_skpd).substring(0, 500).trim();
						var cek_exist = false;
						var _aktivitas = false;
						all_aktivitas.map(function(bb, ii){
							if(bb.aktivitas == nama_aktivitas){
								cek_exist = true;
								_aktivitas = {
									key: ii,
									val: bb
								}
							}
						});
						var sumber_dana_sipd_master = sumber_dana_sipd.substring(0, 150).trim();
	        			if(master_sumberdana[sumber_dana_sipd_master]){
	        				idsumberdana = master_sumberdana[sumber_dana_sipd_master];
	        				uraian_sumberdana = sumber_dana_sipd_master;
	        			}else{
	        				console.log('Sumber Dana SIPD tidak ditemukan di FMIS!', sumber_dana_sipd_master);
	        			}
						if(!cek_exist){
	        				var data = {
								aktivitas: nama_aktivitas,
								sumber_dana: {}
							};
							data.sumber_dana[sumber_dana_sipd] = {
								idsumberdana: idsumberdana,
	        					uraian_sumberdana: uraian_sumberdana
							}
							all_aktivitas.push(data);
						}else{
							_aktivitas.val.sumber_dana[sumber_dana_sipd] = {
								idsumberdana: idsumberdana,
	        					uraian_sumberdana: uraian_sumberdana
							}
							all_aktivitas[_aktivitas.key] = _aktivitas.val;
						}
					});
					if(all_aktivitas.length > 1){
						console.log('Aktivitas multi sumber dana! Perlu penanganan khusus.');
					}
					console.log('cek insert aktivitas sub keg = '+sub_keg.nama_sub_giat, sub_keg.aktivitas, all_aktivitas);
					var last = all_aktivitas.length - 1;
					var kdurut = 0;
					all_aktivitas.reduce(function(sequence, nextData){
			            return sequence.then(function(current_data){
			        		return new Promise(function(resolve_reduce, reject_reduce){
			        			var cek_exist = false;
			        			var aktivitas_exist_update = false;
			        			var cek_aktivitas_sub_unit = [];
		        				sub_keg.aktivitas.map(function(b, i){
		        					var sub_unit_fmis = b.uraian.split(' | ').pop();
		        					if(replace_string(sub_unit_fmis) == replace_string(sub_keg.nama_sub_skpd)){
		        						cek_aktivitas_sub_unit.push(b);
		        					}
		        					var aktivitas_fmis = replace_string(b.uraian, true, true);
		        					var aktivitas_sipd2 = current_data.aktivitas.split(' | ')[0];
		        					// cek jika nama aktivitas sama
		        					if(aktivitas_fmis == current_data.aktivitas){
		        						cek_exist = true;
		        					// cek jika nama aktivitas sumber dana sama tapi belum ada nama skpdnya
		        					}else if(aktivitas_fmis == aktivitas_sipd2){
		        						cek_exist = true;
		        						aktivitas_exist_update = b;
		        					}
		        					if(kdurut <= +b.kdurut){
		        						kdurut = +b.kdurut;
		        					}
		        				});
		        				if(!cek_exist){
		        					// cek jika aktivitas di fmis hanya satu dan di sipd juga hanya satu, maka aktivitas fmis diupdate sesuai aktivitas di sipd
		        					if(
		        						cek_aktivitas_sub_unit.length == 1
		        						&& all_aktivitas.length == 1
		        					){
		        						cek_exist = true;
		        						aktivitas_exist_update = cek_aktivitas_sub_unit[0];
		        					}
		        				}
			        			var idsumberdana1 = '';
			        			var uraian_sumberdana1 = '';
			        			var idsumberdana2 = '';
			        			var uraian_sumberdana2 = '';
			        			var no = 0;
			        			for(var i in current_data.sumber_dana){
			        				no++;
			        				if(no == 1){
			        					idsumberdana1 = current_data.sumber_dana[i].idsumberdana;
			        					uraian_sumberdana1 = current_data.sumber_dana[i].uraian_sumberdana;
			        				}else if(no == 2){
			        					idsumberdana2 = current_data.sumber_dana[i].idsumberdana;
			        					uraian_sumberdana2 = current_data.sumber_dana[i].uraian_sumberdana;
			        				}
			        			}
			        			var data_post = {
			        				_token: _token,
			        				uraian: current_data.aktivitas,
			        				idsubunit: id_sub_unit,
			        				idsumberdana1: idsumberdana1,
			        				idsumberdana2: idsumberdana2,
			        				idsatuan1: satuan_fmis.data.idsatuan,
			        				idsatuan2: '',
			        				pagu: 0
			        			};
		        				if(!cek_exist){
				        			kdurut++;
				        			data_post.kdurut = kdurut;
									pesan_loading('SIMPAN AKTIVITAS '+current_data.aktivitas+' SUBKEGIATAN '+sub_keg.nama_sub_giat, true);
									new Promise(function(resolve, reduce){
					        			if(_type_singkronisasi_rka == 'rka-opd'){
					        				var code_subkegiatan = sub_keg.sub_keg_fmis.action.split('data-code="')[1].split('"')[0];
											relayAjax({
												url: config.fmis_url+'/anggaran/rka-opd/aktivitas/form?code='+code_subkegiatan+'&action=create',
												success: function(form_tambah){
							        				var form = jQuery(form_tambah.form);
							        				data_post.idrapbdrkaaktivitas = '';
							        				data_post.idrapbdrkasubkegiatan = form.find('input[name="idrapbdrkasubkegiatan"]').val();
							        				data_post.jn_asb = 0;
							        				data_post.jn_rkud = 0;
							        				data_post.status_luncuran = 0;
							        				data_post.idasb = 0;
							        				data_post.idpptk = '';
							        				data_post.volume1 = 1;
							        				data_post.volume2 = 0;
							        				data_post.status_pelaksanaan = 4;
							        				var url = form.attr('action');
							        				resolve(url);
							        			}
							        		});
				        				}else{
					        				data_post.uraian_sumberdana1 = uraian_sumberdana1;
					        				data_post.uraian_sumberdana2 = uraian_sumberdana2;
					        				data_post.idsatuanindikator = '';
					        				data_post.uraian_satuan1 = satuan_fmis.data.uraian_satuan;
					        				data_post.uraian_satuan2 = '';
					        				var url = config.fmis_url+'/perencanaan-tahunan/renja-murni/aktivitas/create/'+sub_keg.sub_keg_fmis.idrkpdrenjasubkegiatan;
					        				resolve(url);
				        				}
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
			        			// update ativitas jika sudah ada dengan parameter tertentu
				        		}else if(aktivitas_exist_update){
				        			data_post.kdurut = aktivitas_exist_update.kdurut;
				        			data_post._method = 'PUT';
									pesan_loading('UPDATE AKTIVITAS '+aktivitas_exist_update.uraian+' menjadi '+current_data.aktivitas+' SUBKEGIATAN '+sub_keg.nama_sub_giat, true);
									new Promise(function(resolve, reduce){
					        			if(_type_singkronisasi_rka == 'rka-opd'){
					        				var code_aktivitas = aktivitas_exist_update.action.split('code=')[1].split('"')[0];
					        				relayAjax({
												url: config.fmis_url+'/anggaran/rka-opd/aktivitas/form?code='+code_aktivitas+'&action=edit',
									            success: function(form_edit){
							        				var form = jQuery(form_edit.form);
							        				data_post.idrapbdrkaaktivitas = '';
							        				data_post.idrapbdrkasubkegiatan = form.find('input[name="idrapbdrkasubkegiatan"]').val();
							        				data_post.idsubunit = aktivitas_exist_update.idsubunit; // jika ada perubahan PA/KPA
							        				data_post.jn_asb = aktivitas_exist_update.jn_asb;
							        				data_post.jn_rkud = aktivitas_exist_update.jn_rkud; // jika ada perubahan jenis rkud
							        				data_post.status_luncuran = aktivitas_exist_update.status_luncuran;
							        				data_post.idasb = aktivitas_exist_update.idasb;
							        				data_post.idpptk = '';
							        				data_post.volume1 = 1;
							        				data_post.volume2 = 0;
							        				data_post.status_pelaksanaan = aktivitas_exist_update.status_pelaksanaan;
							        				var url = form.attr('action');
							        				resolve(url);
							        			}
							        		});
				        				}else{
					        				data_post.uraian_sumberdana1 = uraian_sumberdana1;
					        				data_post.uraian_sumberdana2 = uraian_sumberdana2;
					        				data_post.idsatuanindikator = '';
					        				data_post.uraian_satuan1 = satuan_fmis.data.uraian_satuan;
					        				data_post.uraian_satuan2 = '';
					        				var url = config.fmis_url+'/perencanaan-tahunan/renja-murni/aktivitas/update/'+sub_keg.sub_keg_fmis.idrkpdrenjasubkegiatan;
					        				resolve(url);
				        				}
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
				        		}else{
				        			console.log('Ativitas sudah ada', current_data.aktivitas, sub_keg.nama_sub_giat);
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
			        }, Promise.resolve(all_aktivitas[last]))
			        .then(function(data_last){
			        	resolve();
			        });
			    });
		    });
	    });
    });
}

function singkronisasi_program_modal(options, cb){
	var sub_kegiatan = [];
	window.pagu_sub_keg_global = jQuery('input[name="pagu-sub-keg"]:checked').val();
	if(typeof cb != 'function'){
		var idrkpdranwalprogram = jQuery('#mod-program-rkpd').val();
		var uraian_rkpd = jQuery('#mod-program-rkpd option:selected').text();
	}else{
		console.log('options skpd all singkron program', options);
		var idrkpdranwalprogram = options.idrkpdranwalprogram;
		var uraian_rkpd = options.uraian_rkpd;
	}
	if(idrkpdranwalprogram != ''){
		if(typeof cb != 'function'){
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
		}else{
			sub_kegiatan = options.sub_kegiatan;
		}
		if(sub_kegiatan.length >= 1){
			if(typeof cb == 'function' || confirm('Apakah anda yakin untuk mengsingkronkan data program RENJA dari WP-SIPD?')){
				if(typeof cb != 'function'){
					show_loading();
				}
				var sub_kegiatan_filter_program = [];
				var sub_kegiatan_filter_kegiatan = [];
				var sub_kegiatan_filter_sub_kegiatan = [];
				if(_type_singkronisasi_rka == 'rka-opd'){
					if(typeof cb != 'function'){
						var code_id_sasaran = jQuery('a.btn-sm[title="Tambah Program RKA"]').attr('href').split('code=')[1].split('&')[0];
					}else{
						var code_id_sasaran = options.code_sasaran;
					}
				}else{
					var code_id_sasaran = jQuery('a.btn-sm[title="Tambah Program"]').attr('href').split('/').pop();
				}
				new Promise(function(resolve, reject){
					get_master_prog_fmis(code_id_sasaran, idrkpdranwalprogram)
					.then(function(master_program){
						get_list_program(options)
						.then(function(program_exist){
							var cek_program = {};
							var last = sub_kegiatan.length - 1;
							var kdurut = 0;
							var kdurut_exist = 0;
							var pagu_tahun1 = 0;
							var pagu_tahun2 = 0;
							var pagu_tahun3 = 0;
							var idrkpdrenjaprogram = 0;
							var code_program = 0;
							// sub kegiatan yang sudah dipilih kemudian dilooping satu per satu
							sub_kegiatan.reduce(function(sequence, nextData){
					            return sequence.then(function(current_data){
					        		return new Promise(function(resolve_reduce, reject_reduce){
					        			current_data.nama_program = removeNewlines(current_data.nama_program);
				        				var check_exist = false;
				        				program_exist.data.map(function(b, i){
				        					b.uraian = removeNewlines(b.uraian);
				        					if(current_data.nama_program == b.uraian){
				        						check_exist = b;
				        						kdurut_exist = b.kdurut;
				        						pagu_tahun1 = b.pagu_tahun1;
												pagu_tahun2 = b.pagu_tahun2;
												pagu_tahun3 = b.pagu_tahun3;
												if(_type_singkronisasi_rka == 'rka-opd'){
													code_program = b.action.split('data-code="')[1].split('"')[0];
												}else{
													idrkpdrenjaprogram = b.idrkpdrenjaprogram;
												}
				        					}
				        					if(kdurut <= +b.kdurut){
				        						kdurut = +b.kdurut;
				        					}
				        				});
				        				// cek jika sub kegiatan memiliki nama program yang sama dengan program yang belum ditambahkan
				        				if(!check_exist){
				        					// cek jika sub kegiatan memiliki nama program yang ada di master program FMIS
				        					if(master_program.program[current_data.nama_program]){
		        								sub_kegiatan_filter_program.push(current_data);
				        						// cek jika sudah pernah disimpan, jangan disimpan lagi
				        						if(!cek_program[current_data.nama_program]){
					        						cek_program[current_data.nama_program] = current_data;
						        					kdurut++;
						        					var data_post = {
						        						_token: _token,
						        						kdurut: kdurut,
						        						idprogram: master_program.program[current_data.nama_program].id,
						        						uraian: current_data.nama_program,
						        					}
													pesan_loading('SIMPAN PROGRAM '+current_data.nama_program, true);
													if(_type_singkronisasi_rka == 'rka-opd'){
														var form = jQuery(program_exist.form_tambah_program);
														data_post.idrapbdrkaprogram = form.find('input[name="idrapbdrkaprogram"]').val();
														data_post.idrapbdrkasasaran = form.find('input[name="idrapbdrkasasaran"]').val();
														data_post.jns_program = 0;
														data_post.uraian_rkpd = uraian_rkpd;
														data_post.idrapbdprogram = idrkpdranwalprogram;
														data_post.status_pelaksanaan = 4;
														var url = form.attr('action');
													}else{
						        						data_post.pagu_tahun1 = '0';
						        						data_post.pagu_tahun2 = '0';
						        						data_post.pagu_tahun3 = '0';
														data_post.idrkpdranwalprogram = idrkpdranwalprogram;
							        					var url = config.fmis_url+'/perencanaan-tahunan/renja-murni/program/create/'+code_id_sasaran;
							        				}
							        				relayAjax({
														url: url,
														type: "post",
											            data: data_post,
											            success: function(res){
											            	resolve_reduce(nextData);
											            },
											            error: function(e){
											            	console.log('Error save program!', e, this.data);
											            }
													});
							        			}else{
							        				resolve_reduce(nextData);
							        			}
					        				}else{
					        					console.log('Program "'+current_data.nama_program+'" tidak ditemukan di master program FMIS', master_program);
				        						resolve_reduce(nextData);
					        				}
					        			// update program jika sudah ada
				        				}else{
				        					// cek jika sub kegiatan memiliki nama program yang ada di master program FMIS
				        					if(master_program.program[current_data.nama_program]){
							        			sub_kegiatan_filter_program.push(current_data);
				        						// cek jika sudah pernah diupdate, jangan diupdate lagi
				        						if(!cek_program[current_data.nama_program]){
					        						cek_program[current_data.nama_program] = current_data;
					        						var data_post = {
						        						_token: _token,
						        						kdurut: kdurut_exist,
						        						idprogram: master_program.program[current_data.nama_program].id,
						        						uraian: current_data.nama_program
						        					}
													pesan_loading('UPDATE PROGRAM '+current_data.nama_program, true);
													new Promise(function(resolve4, reject4){
														if(_type_singkronisasi_rka == 'rka-opd'){
															relayAjax({
																url: config.fmis_url+'/anggaran/rka-opd/program/form?code='+code_program+'&action=edit',
																success: function(form_edit){
																	var form = jQuery(form_edit.form);
																	var url = form.attr('action');
																	data_post.idrapbdrkaprogram = form.find('input[name="idrapbdrkaprogram"]').val();
																	data_post.idrapbdrkasasaran = form.find('input[name="idrapbdrkasasaran"]').val();
																	data_post._method = 'PUT';
																	data_post.jns_program = 0;
																	data_post.uraian_rkpd = uraian_rkpd;
																	data_post.idrapbdprogram = idrkpdranwalprogram;
																	data_post.status_pelaksanaan = check_exist.status_pelaksanaan;
																	resolve4(url);
																}
															});
														}else{
							        						data_post.idrkpdranwalprogram = idrkpdranwalprogram;
							        						data_post.pagu_tahun1 = pagu_tahun1;
							        						data_post.pagu_tahun2 = pagu_tahun2;
							        						data_post.pagu_tahun3 = pagu_tahun3;
															var url = config.fmis_url+'/perencanaan-tahunan/renja-murni/program/update/'+idrkpdrenjaprogram;
															resolve4(url);
														}
													})
													.then(function(url_update){
							        					relayAjax({
															url: url_update,
															type: "post",
												            data: data_post,
												            success: function(res){
												            	resolve_reduce(nextData);
												            },
												            error: function(e){
												            	console.log('Error update program!', e, this.data);
												            }
														});
							        				});
					        					}else{
					        						resolve_reduce(nextData);
					        					}
					        				}else{
					        					console.log('Program "'+current_data.nama_program+'" tidak ditemukan di master program FMIS', master_program);
				        						resolve_reduce(nextData);
					        				}
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
						});
					});
				})
				.then(function(){
					return new Promise(function(resolve, reject){
						if(sub_kegiatan_filter_program.length >= 1){
							console.log('sub_kegiatan_filter_program', sub_kegiatan_filter_program);
							get_list_program(options)
							.then(function(program_exist){
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
					        			if(_type_singkronisasi_rka == 'rka-opd'){
					        				current_data.program_fmis.idrkpdrenjaprogram = current_data.program_fmis.idprogram;
					        			}
					        			if(!cek_program[current_data.program_fmis.idrkpdrenjaprogram]){
					        				cek_program[current_data.program_fmis.idrkpdrenjaprogram] = current_data;
					        				get_list_kegiatan(current_data.program_fmis)
					        				.then(function(kegiatan_exist){
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
					if(typeof cb != 'function'){
						alert('Berhasil singkronisasi data program, kegiatan dan sub kegiatan dari WP-SIPD!');
						if(_type_singkronisasi_rka == 'rka-opd'){
							run_script("data_table_renstra_program");
						}else{
							run_script("data_table_renja_program");
						}
						run_script('program_hide');
						hide_loading();
					}else{
						cb();
					}
					console.log('sub_kegiatan_filter_program, sub_kegiatan_filter_kegiatan, sub_kegiatan_filter_sub_kegiatan', sub_kegiatan_filter_program, sub_kegiatan_filter_kegiatan, sub_kegiatan_filter_sub_kegiatan);
				});
			}
		}else{
			if(typeof cb != 'function'){
				alert('Pilih sub kegiatan dulu!');
			}else{
				cb();
			}
		}
	}else{
		if(typeof cb != 'function'){
			alert('Pilih program RKPD dulu!');
		}else{
			cb();
		}
	}
}

function singkronisasi_bidur_skpd_rpjm_modal(){
	var skpd_selected = [];
	jQuery('#konfirmasi-bidur-skpd tbody tr input[type="checkbox"]').map(function(i, b){
		var cek = jQuery(b).is(':checked');
		if(cek){
			var val = jQuery(b).attr('value').split('-');
			var kode_bidang = val[0];
			var id_skpd = val[1];
			data_bidur_skpd.map(function(bb, ii){
				if(
					bb.kode_bidang == kode_bidang
					&& bb.id_skpd == id_skpd
				){
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
						run_script('bidur_skpd_hide');
						run_script("data_table_rpjmd", code_bidang);
			        	hide_loading();
						alert('Berhasil singkronisasi bidang urusan dan SKPD di RPJMD');
					});
				}
			});
        });
	}else{
		alert("Pilih SKPD dulu!");
	}
}

function mapping_sumberdana(){
	pesan_loading('GET MASTER SUMBER DANA FMIS', true);
	// get all sumber dana fmis
	relayAjax({
		url: config.fmis_url+'/parameter/simda-ng/sumber-dana/datatable',
		success: function(sd_fmis){
			window.sd_fmis_global = sd_fmis.data;
			var sumber_dana = [];
			sd_fmis.data.map(function(b, i){
				sumber_dana.push({
					uraian: b.uraian,
					kode_sumber_dana: b.kode_sumber_dana,
					kategori: b.kategori,
					nmrek: b.nmrek,
					kode_rekening: b.kode_rekening
				})
			});
			var data = {
			    message:{
			        type: "get-url",
			        content: {
					    url: config.url_server_lokal,
					    type: 'post',
					    data: { 
							action: 'get_sumber_dana',
							tahun_anggaran: config.tahun_anggaran,
							sumber_dana: sumber_dana,
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
}

function singkronisasi_sumberdana(res){
	var sd_sipd = res.data;
	var sd_belum_ada = {};
	var nama_sd_belum_ada = [];
	var sd_sipd_new = [];
	for(var i in sd_sipd){
		sd_sipd_new.push(sd_sipd[i]);
	}
	var sd_fmis = {};
	sd_fmis_global.map(function(b, i){
		sd_fmis[b.kode_sumber_dana] = b;
	});
	var last = sd_sipd_new.length - 1;
	sd_sipd_new.reduce(function(sequence, nextData){
        return sequence.then(function(current_data){
    		return new Promise(function(resolve_reduce, reject_reduce){
    			var nama_sd_sipd = current_data.nama_dana.split('] - ');
    			if(nama_sd_sipd.length > 1){
    				nama_sd_sipd = nama_sd_sipd[1].replace(/ - /g,'-').trim();
    			}else{
    				nama_sd_sipd = nama_sd_sipd[0].replace(/ - /g,'-').trim();
    			}
    			nama_sd_sipd = nama_sd_sipd.substring(0, 150).trim();
				sd_belum_ada[nama_sd_sipd] = current_data;
				nama_sd_belum_ada.push(nama_sd_sipd);
				var kdsd1 = '';
				var kdsd2 = '';
				var kdsd3 = '';
				var kdsd4 = '';
				var kdsd5 = '';
				var kdsd6 = '';
				var kdsd = current_data.kode_dana.split('.');
				if(kdsd[0]){
					kdsd1 = kdsd[0];
				}
				if(kdsd[1]){
					kdsd2 = kdsd[1];
				}
				if(kdsd[2]){
					kdsd3 = kdsd[2];
				}
				if(kdsd[3]){
					kdsd4 = kdsd[3];
				}
				if(kdsd[4]){
					kdsd5 = kdsd[4];
				}
				if(kdsd[5]){
					kdsd6 = kdsd[5];
				}
				var data_post = {
					_token: _token,
					kdsd1: kdsd1,
					kdsd2: kdsd2,
					kdsd3: kdsd3,
					kdsd4: kdsd4,
					kdsd5: kdsd5,
					kdsd6: kdsd6,
					uraian_rekening: '4.2.1.1.2 - Dana Transfer Umum-Dana Alokasi Umum (DAU)',
					kdrek: '4.2.1.1.2',
					uraian: nama_sd_sipd,
					kategori: 2
				};
				if(
					current_data.jenis == 'pendapatan'
					|| current_data.jenis == 'penerimaan'
					|| current_data.jenis == 'pengeluaran'
				){
					data_post.uraian_rekening = current_data.kode_dana+' - '+current_data.nama_dana;
					data_post.kdrek = current_data.kode_dana;
				}
				var kd_sipd = [];
				kdsd.map(function(b, i){
					kd_sipd.push(+b);
				});
				kd_sipd = kd_sipd.join('.');
				if(sd_fmis[kd_sipd] || kdsd3==''){
					if(current_data.jenis == 'pendapatan'){
						data_post['kdsd6'] = +data_post['kdsd6']+100;
					}else if(current_data.jenis == 'penerimaan'){
						data_post['kdsd6'] = +data_post['kdsd6']+200;
					}else if(current_data.jenis == 'pengeluaran'){
						data_post['kdsd6'] = +data_post['kdsd6']+300;
					}else{
						data_post['kdsd1'] = 1;
	            		data_post['kdsd2'] = 1;
	            		data_post['kdsd3'] = 1;
	            		data_post['kdsd4'] = 1;
	            		data_post['kdsd5'] = 1;
	            		data_post['kdsd6'] = current_data.id_dana;
	            	}
				}
				pesan_loading('SIMPAN SUMBER DANA "'+nama_sd_sipd+'"', true);
				// simpan sumber dana
				relayAjax({
					url: config.fmis_url+'/parameter/simda-ng/sumber-dana/save',
					type: "post",
		            data: data_post,
		            success: function(res){
	            		resolve_reduce(nextData);
		            },
		            error: function(e){
		            	console.log('Error save sumber dana!', e, this.data);
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
    }, Promise.resolve(sd_sipd_new[last]))
    .then(function(data_last){
    	console.log('sd_belum_ada', sd_belum_ada, nama_sd_belum_ada);
    	if(sd_sipd_new >= 1){
    		mapping_sumberdana();
    	}else{
	    	hide_loading();
			alert('Berhasil singkronisasi sumberdana. Nama sumber dana yang ada di WP-SIPD tapi belum ada di FMIS '+nama_sd_belum_ada.length+' dari total '+res.total+' sumberdana! '+nama_sd_belum_ada.join(', '));
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

function mapping_sub_kegiatan(){
	var bidur = [];
	var program = [];
	var kegiatan = [];
	var sub_kegiatan = [];
	jQuery('li[data-type="bidang"]').map(function(i, b){ 
		bidur.push({
			bidang: jQuery(b).attr('data-info'),
			code: jQuery(b).attr('data-code')
		});
	});
	var last = bidur.length - 1;
	bidur.reduce(function(sequence, nextData){
        return sequence.then(function(current_data){
    		return new Promise(function(resolve_reduce, reject_reduce){
    			pesan_loading('GET PROGRAM DARI BIDANG '+current_data.bidang, true);
				relayAjax({
					url: config.fmis_url+'/parameter/program-kegiatan/datatable?table=tabel-program&code='+current_data.code,
			        success: function(res){
			    		res.data.map(function(b, i){
			    			b.nmprogram = removeNewlines(b.nmprogram);
			    			program.push({
								param: {
									data: {
					    				bidang: current_data.bidang,
					    				program: b.nmprogram,
					    				code: b.code
					    			}
								},
								cb: function(ret, ret_cb){
									pesan_loading('GET KEGIATAN DARI PROGRAM '+ret.data.program, true);
									relayAjax({
										url: config.fmis_url+'/parameter/program-kegiatan/datatable?table=tabel-kegiatan&code='+ret.data.code,
								        success: function(res){
								    		res.data.map(function(b, i){
								    			b.nmkegiatan = removeNewlines(b.nmkegiatan);
								    			kegiatan.push({
								    				param: {
														data: {
										    				bidang: ret.data.bidang,
								    						program: ret.data.program,
										    				kegiatan: b.nmkegiatan,
										    				code: b.code
										    			}
													},
													cb: function(ret2, ret_cb2){
														pesan_loading('GET SUB KEGIATAN DARI KEGIATAN '+ret2.data.kegiatan, true);
														relayAjax({
															url: config.fmis_url+'/parameter/program-kegiatan/datatable?table=tabel-sub-kegiatan&code='+ret2.data.code,
													        success: function(res){
													    		res.data.map(function(b, i){
													    			b.nmsubkegiatan = removeNewlines(b.nmsubkegiatan);
													    			sub_kegiatan.push({
													    				bidang: ret2.data.bidang,
											    						program: ret2.data.program,
													    				kegiatan: ret2.data.kegiatan,
													    				sub_kegiatan: b.nmsubkegiatan,
													    				code: b.code
													    			})
													    		});
													    		ret_cb2();
													        }
														});
													}
												});

								    		});
								    		ret_cb();
								        }
									});
								}
							});
			    		});
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
    }, Promise.resolve(bidur[last]))
    .then(function(){
    	return new Promise(function(resolve, reduce){
    		console.log('list program', program);
    		reduce_promise(program, function(){
    			console.log('list kegiatan', kegiatan);
	    		reduce_promise(kegiatan, function(){
	    			resolve();
	    		});
    		});
    	});
    })
    .then(function(){
    	console.log('list sub_kegiatan', sub_kegiatan);
    	pesan_loading('SEND SUB KEGIATAN KE WP-SIPD', true);
    	var data = {
		    message:{
		        type: "get-url",
		        content: {
				    url: config.url_server_lokal,
				    type: 'post',
				    data: { 
						action: 'mapping_sub_kegiatan_fmis',
						tahun_anggaran: config.tahun_anggaran,
						sub_kegiatan: sub_kegiatan,
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

function get_all_dokumen_rka(){
	pesan_loading('GET ALL DOKUMEN', true);
	return new Promise(function(resolve, reject){
		relayAjax({
			url: config.fmis_url+'/anggaran/rka-opd/dokumen/datatable',
	        success: function(rka){
	        	resolve(rka.data);
	        }
	    });
	})
}

function get_all_sasaran_rka(code){
	pesan_loading('GET ALL SASARAN', true);
	return new Promise(function(resolve, reject){
		relayAjax({
			url: config.fmis_url+'/anggaran/rka-opd/sasaran/datatable?code='+code,
	        success: function(sasaran){
	        	resolve(sasaran.data);
	        }
	    });
	})
}

function get_all_sasaran_rka_rpjmd(code){
	pesan_loading('GET ALL SASARAN RPJMD', true);
	return new Promise(function(resolve, reject){
		relayAjax({
			url: config.fmis_url+'/anggaran/rka-opd/sasaran/datatable-rpjmd?code='+code,
	        success: function(sasaran){
	        	resolve(sasaran.data);
	        }
	    });
	})
}

function get_all_tujuan_rka_renstra(code){
	pesan_loading('GET ALL SASARAN RPJMD', true);
	return new Promise(function(resolve, reject){
		relayAjax({
			url: config.fmis_url+'/anggaran/rka-opd/sasaran/datatable-tujuan?code='+code,
	        success: function(tujuan){
	        	resolve(tujuan.data);
	        }
	    });
	})
}

function gl_dokumen_rka(cb, options_skpd){
	if(typeof cb != 'function'){
		show_loading();
	}
	var url_save_dokumen = '';
	var dokumen_rka = false;
	var no = 0;
	return new Promise(function(resolve, reject){
		get_all_dokumen_rka()
		.then(function(dokumen){
			no++;
			if(dokumen.length == 0){
				pesan_loading('GET FORM TAMBAH DOKUMEN', true);
				relayAjax({
					url: config.fmis_url+'/anggaran/rka-opd/dokumen/form?action=create',
			        success: function(form_create){
			    		var form = jQuery(form_create.form);
			    		var idrapbd = false;
			    		form.find('#idrapbd option').map(function(i, b){
			    			var val = jQuery(b).attr('value');
			    			if(val && !idrapbd){
			    				idrapbd = val;
			    			}
			    		});
			    		var no_rka = '';
			    		var idrkpdrenja = false;
			    		form.find('#idrkpdrenja option').map(function(i, b){
			    			var val = jQuery(b).attr('value');
			    			if(val && !idrkpdrenja){
			    				idrkpdrenja = val;
			    				no_rka = jQuery(b).text().replace(/RKPD/g, 'RKA-SKPD');
			    			}
			    		});
			    		if(!idrapbd || !idrkpdrenja){
			    			var pesan = 'Dokumen TAPD Referensi atau Dokumen Renja Referensi tidak ditemukan!';
			    			if(typeof cb != 'function'){
			    				alert(pesan);
			    			}else{
			    				pesan_loading(pesan, true);
			    				cb(false);
			    			}
			    			reject();
			    		}else{
			    			if(typeof cb != 'function'){
			    				var tgl_rka = form.find('#tgl_rka').val();
			    				var sub_unit = jQuery('.nav-link .text-secondary').text().split('/ ')[2].trim();
			    			}else{
			    				var d = new Date();
			    				var tgl_rka = d.toISOString().split('T')[0];
			    				sub_unit = options_skpd.nama;
			    			}
				    		var data_post = {
				    			_token: _token,
								idrapbd: idrapbd,
								idrkpdrenja: idrkpdrenja, 
								no_rka: no_rka,
								tgl_rka: tgl_rka,
								keterangan: 'RKA-SKPD '+sub_unit,
								tdt_nama: 'Nama Pejabat',
								tdt_nip: '11111111 111111 1 111',
								tdt_jabatan: 'Kepala Dinas'
				    		};
			    			url_save_dokumen = form.attr('action');
			    			resolve(data_post);
				    	}
			        }
				});
			}else{
				var last = dokumen.length - 1;
				// update dokumen
				dokumen.reduce(function(sequence, nextData){
		            return sequence.then(function(dokumen){
		        		return new Promise(function(resolve_reduce, reject_reduce){
		        			if(dokumen.tdt_nip == '11111111 111111 1 111'){
		        				pesan_loading('GET FORM EDIT DOKUMEN', true);
		        				var code_dokumen = dokumen.action.split('code=')[1].split('"')[0];
								relayAjax({
									url: config.fmis_url+'/anggaran/rka-opd/dokumen/form?action=edit&code='+code_dokumen,
							        success: function(form_edit){
							        	var form = jQuery(form_edit.form);
							        	var tgl_rka = form.find('#tgl_rka').val();
				        				var data_post = {
							    			_method: 'PUT',
							    			_token: _token,
											idrapbd: dokumen.idrapbd,
											idrkpdrenja: dokumen.idrkpdrenja, 
											no_rka: dokumen.no_rka,
											tgl_rka: tgl_rka,
											keterangan: 'RKA-SKPD '+options_skpd.nama,
											tdt_nama: 'Nama Pejabat',
											tdt_nip: dokumen.tdt_nip,
											tdt_jabatan: 'Kepala Dinas'
							    		};
				        				pesan_loading('UPDATE DOKUMEN '+options_skpd.nama, true);
							    		relayAjax({
											url: form.attr('action'),
											data: data_post,
											type: 'post',
									        success: function(res){
									        	resolve_reduce(nextData);
									        }
									    });
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
		        }, Promise.resolve(dokumen[last]))
		        .then(function(data_last){
					dokumen_rka = dokumen;
					return resolve(false);
		        });
			}
		});
	})
	.then(function(data_post){
		return new Promise(function(resolve, reject){
			if(data_post){
				pesan_loading('SIMPAN DOKUMEN RKA METODE GL', true);
				relayAjax({
					url: url_save_dokumen,
					data: data_post,
					type: 'post',
			        success: function(form_create){
			        	get_all_dokumen_rka()
						.then(function(dokumen){
							dokumen_rka = dokumen;
							return resolve();
						});
			        }
				});
			}else{
				return resolve();
			}
		});
	})
	.then(function(data_post){
		var code_rka_first = false;
		var last = dokumen_rka.length - 1;
		var no = 0;
		dokumen_rka.reduce(function(sequence, nextData){
            return sequence.then(function(dokumen){
        		return new Promise(function(resolve_reduce, reject_reduce){
                	no++;
                	var code_rka = dokumen.action.split('data-code="')[1].split('"')[0];
        			if(!code_rka_first || no==2){
        				code_rka_first = code_rka;
        			}
        			cek_insert_sasaran_rka({
        				code_rka: code_rka
        			})
        			.then(function(res){
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
        }, Promise.resolve(dokumen_rka[last]))
        .then(function(data_last){
        	if(typeof cb != 'function'){
	        	run_script("data_table_renstra_dokumen");
	        	alert('Sukses generate dokumen RKA!');
				hide_loading();
        	}else{
        		get_all_sasaran_rka(code_rka_first)
            	.then(function(sasaran_exist){
            		var current_sasaran = false;
					sasaran_exist.map(function(sasaran, i){
	        			var uraian = replace_string(sasaran.uraian, false, true);
	        			if(
	        				jenis_apbd_global == 1 
	        				&& uraian.indexOf('generated data perencanaan') != -1
	        			){
		        			current_sasaran = sasaran;
		        		}else if(
		        			(
		        				jenis_apbd_global == 2
		        				|| jenis_apbd_global == 3
		        			)
		        			&& uraian.indexOf('pendapatan & pembiayaan') != -1
		        		){
		        			current_sasaran = sasaran;
		        		}
			        });
			        if(!current_sasaran){
			        	current_sasaran = sasaran_exist[0];
			        }
	        		pesan_loading('GET form tambah program dari sasaran '+current_sasaran.uraian, true);
	        		var code_sasaran = current_sasaran.action.split('data-code="')[1].split('"')[0];
					relayAjax({
						url: config.fmis_url+'/anggaran/rka-opd/program/form?code='+code_sasaran+'&action=create',
						success: function(form_tambah){
							get_list_program_rpjmd(form_tambah, code_sasaran)
							.then(function(html_program_rkpd){
								var program = jQuery('<select>'+html_program_rkpd+'</select>').find('option').eq(1);
				        		cb({
				        			code_sasaran: code_sasaran,
				        			idrkpdranwalprogram: program.val(),
									uraian_rkpd: program.text().trim(),
									html_program_rkpd: html_program_rkpd
				        		});
				        	});
						}
					});
				});
			}
        });
	})
	.catch(function(e){
		if(typeof cb != 'function'){
			hide_loading();
		}
	});
}

function cek_insert_sasaran_rka(options){
	return new Promise(function(resolve, reject){
		var code_rka = options.code_rka;
    	get_all_sasaran_rka(code_rka)
    	.then(function(sasaran_exist){
			pesan_loading('GET FORM TAMBAH DOKUMEN', true);
			relayAjax({
				url: config.fmis_url+'/anggaran/rka-opd/sasaran/form?action=create&code='+code_rka,
		        success: function(form_create){
		        	get_all_sasaran_rka_rpjmd(code_rka)
		        	.then(function(sasaran_rpjm){
		        		var idrapbdsasaran = false;
		        		var uraian_sasaran_rapbd = false;
		        		var idrapbdsasaran_p = false;
		        		var uraian_sasaran_rapbd_p = false;
		        		sasaran_rpjm.map(function(b, i){
		        			var uraian_sasaran = replace_string(b.uraian_sasaran, false, true);
		        			if(uraian_sasaran.indexOf('generated data perencanaan') != -1){
			        			uraian_sasaran_rapbd = uraian_sasaran;
			        			idrapbdsasaran = b.action.split('data-id="')[1].split('"')[0];
			        		}else if(uraian_sasaran.indexOf('pendapatan & pembiayaan') != -1){
			        			uraian_sasaran_rapbd_p = uraian_sasaran;
			        			idrapbdsasaran_p = b.action.split('data-id="')[1].split('"')[0];
			        		}
		        		});
			        	get_all_tujuan_rka_renstra(code_rka)
			        	.then(function(tujuan_renstra){
			        		var idrenstratujuan = false;
			        		var uraian_tujuan = false;
			        		var idrenstratujuan_p = false;
			        		var uraian_tujuan_p = false;
			        		tujuan_renstra.map(function(b, i){
			        			var uraian = replace_string(b.uraian, false, true);
			        			if(uraian.indexOf('generated data perencanaan') != -1){
				        			uraian_tujuan = uraian;
				        			idrenstratujuan = b.action.split('data-id="')[1].split('"')[0];
				        		}else if(uraian.indexOf('pendapatan & pembiayaan') != -1){
				        			uraian_tujuan_p = uraian;
				        			idrenstratujuan_p = b.action.split('data-id="')[1].split('"')[0];
				        		}
			        		});

			        		var cek_sasaran_belanja = false;
			        		var cek_sasaran_pendapatan = false;
				    		var last = sasaran_exist.length - 1;
				    		var kdurut = 0;
							sasaran_exist.map(function(sasaran, i){
			        			var uraian = replace_string(sasaran.uraian, false, true);
			        			if(uraian.indexOf('generated data perencanaan') != -1){
				        			cek_sasaran_belanja = {
				        				kdurut: sasaran.kdurut,
				        				idrapbdrkasasaran: sasaran.idrapbdsasaran
				        			};
				        		}else if(uraian.indexOf('pendapatan & pembiayaan') != -1){
				        			cek_sasaran_pendapatan = {
				        				kdurut: sasaran.kdurut,
				        				idrapbdrkasasaran: sasaran.idrapbdsasaran
				        			}
				        		}
				        		if(kdurut <= +sasaran.kdurut){
				        			kdurut = +sasaran.kdurut;
				        		}
					        });

							var sendData = [];
							sendData.push(new Promise(function(resolve2, reject2){
				        		if(
				        			idrapbdsasaran 
				        			&& idrenstratujuan
				        			&& !cek_sasaran_belanja
				        		){
				        			kdurut++;
						        	var form = jQuery(form_create.form);
						        	var data_post = {
						        		_token: _token,
										idrapbdrka: form.find('#idrapbdrka').val(),
										idrapbdrkasasaran: '', 
										uraian_sasaran_rapbd: uraian_sasaran_rapbd,
										idrapbdsasaran: idrapbdsasaran, 
										uraian_tujuan: uraian_tujuan,
										idrenstratujuan: idrenstratujuan,
										kdurut: kdurut,
										uraian: 'Sasaran Renja Perangkat Daerah diproses melalui Generated Data Perencanaan',
										idrkpdrenjasasaran: '',
										status_pelaksanaan: 4,
						        	};
						        	var url_save_sasaran = form.attr('action');
		                			pesan_loading('SIMPAN SASARAN RKA METODE GL', true);
									relayAjax({
										url: url_save_sasaran,
										data: data_post,
										type: 'post',
								        success: function(form_create){
											return resolve2();
								        }
									});
								}else{
									if(cek_sasaran_belanja){
		                				pesan_loading('Sasaran belanja RKA METODE GL sudah ada!', true);
									}else{
		                				pesan_loading('Sasaran RPJMD atau Tujuan RENSTRA untuk belanja RKA METODE GL tidak ditemukan!', true);
		                			}
		                			resolve2();
								}
							}));

							sendData.push(new Promise(function(resolve2, reject2){
				        		if(
				        			idrapbdsasaran_p 
				        			&& idrenstratujuan_p
				        			&& !cek_sasaran_pendapatan
				        		){
				        			kdurut++;
						        	var form = jQuery(form_create.form);
						        	var data_post = {
						        		_token: _token,
										idrapbdrka: form.find('#idrapbdrka').val(),
										idrapbdrkasasaran: '', 
										uraian_sasaran_rapbd: uraian_sasaran_rapbd_p,
										idrapbdsasaran: idrapbdsasaran_p, 
										uraian_tujuan: uraian_tujuan_p,
										idrenstratujuan: idrenstratujuan_p,
										kdurut: kdurut,
										uraian: 'Pendapatan & Pembiayaan',
										idrkpdrenjasasaran: '',
										status_pelaksanaan: 4,
						        	};
						        	var url_save_sasaran = form.attr('action');
		                			pesan_loading('SIMPAN SASARAN PENDAPATAN dan PEMBIAYAAN RKA METODE GL', true);
									relayAjax({
										url: url_save_sasaran,
										data: data_post,
										type: 'post',
								        success: function(form_create){
											return resolve2();
								        }
									});
								}else{
		                			if(cek_sasaran_pendapatan){
		                				pesan_loading('Sasaran pendapatan dan pembiayaan RKA METODE GL sudah ada!', true);
									}else{
		                				pesan_loading('Sasaran RPJMD atau Tujuan RENSTRA untuk pendapatan dan pembiayaan RKA METODE GL tidak ditemukan!', true);
		                			}
		                			resolve2();
								}
							}));

							Promise.all(sendData)
							.then(function(){
								resolve();
							});
			        	});
		        	});
				}
			});
    	});
	});
}

function to_number(text, koma=false){
	text = (text+'').split(',');
	var ret = +(text[0].replace(/\./g, ''));
	if(text.length >= 2){
		if(koma){
			ret += ','+text[1];
		}else{
			ret = +(ret+'.'+text[1]);
		}
	}
	return ret;
}

function tampil_pagu_sub_keg(){
	show_loading();
	window._type_singkronisasi_rka = 'rka-opd';
	var sub_kegiatan = [];
	jQuery('#table-subkegiatan tbody .btn-group-sm .btn.btn-success.my-1.tab-next').map(function(i, b){
		var kode_sub = jQuery(b).attr('data-code');
		sub_kegiatan.push({
			code: kode_sub,
			sub_keg: jQuery(b).attr('data-info'),
			keg: jQuery(b).attr('data-keg'),
			prog: jQuery(b).attr('data-prog')
		});
	});
	jQuery('#table-subkegiatan tbody td span.badge.badge-success').attr('data-pagu', 0);
	var total = 0;
	var last = sub_kegiatan.length - 1;
	sub_kegiatan.reduce(function(sequence, nextData){
        return sequence.then(function(sub){
    		return new Promise(function(resolve_reduce, reject_reduce){
    			var total_sub = 0;
    			relayAjax({
					url: config.fmis_url+'/anggaran/rka-belanja/aktivitas/datatable?code='+sub.code,
			        success: function(aktivitas_exist){
			        	var last2 = aktivitas_exist.data.length - 1;
			        	aktivitas_exist.data.reduce(function(sequence2, nextData2){
					        return sequence2.then(function(aktivitas){
					    		return new Promise(function(resolve_reduce2, reject_reduce2){
						        	get_rka_aktivitas(aktivitas)
									.then(function(rka){
										var data_rka = rka.data;
										data_rka.map(function(b, i){
											total_sub += to_number(b.jumlah);
										});
										return resolve_reduce2(nextData2);
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
					    }, Promise.resolve(aktivitas_exist.data[last2]))
					    .then(function(data_last){
					    	total += total_sub;
					    	var td_prog = jQuery('td:contains("PROGRAM : '+sub.prog+'")');
					    	var td_keg = jQuery('td:contains("KEGIATAN : '+sub.keg+'")');
					    	var td_sub = jQuery('.btn.btn-success.my-1.tab-next[data-code="'+sub.code+'"]').closest('tr').find('td.text-left');
					    	var text = ' <span class="badge badge-success" style="font-size: 15px !important;" data-pagu="0">Rp 0</span>';
					    	if(td_prog.find('span.badge').length == 0){
					    		td_prog.append(text);
					    	}
					    	if(td_keg.find('span.badge').length == 0){
					    		td_keg.append(text);
					    	}
					    	if(td_sub.find('span.badge').length == 0){
					    		td_sub.append(text);
					    	}
					    	var pagu_prog = +td_prog.find('span.badge').attr('data-pagu');
					    	pagu_prog += total_sub;
					    	var pagu_keg = +td_keg.find('span.badge').attr('data-pagu');
					    	pagu_keg += total_sub;
					    	var pagu_sub = +td_sub.find('span.badge').attr('data-pagu');
					    	pagu_sub += total_sub;
					    	td_prog.find('span.badge').attr('data-pagu', pagu_prog);
					    	td_keg.find('span.badge').attr('data-pagu', pagu_keg);
					    	td_sub.find('span.badge').attr('data-pagu', pagu_sub);
					    	td_prog.find('span.badge').text('Rp '+formatMoney(pagu_prog, 0, ',', '.'));
							td_keg.find('span.badge').text('Rp '+formatMoney(pagu_keg, 0, ',', '.'));
							td_sub.find('span.badge').text('Rp '+formatMoney(pagu_sub, 0, ',', '.'));
    						pesan_loading('GET PAGU SUB KEGIATAN '+sub.sub_keg+' = '+pagu_sub, true);
							return resolve_reduce(nextData);
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
    }, Promise.resolve(sub_kegiatan[last]))
    .then(function(data_last){
    	var pesan = 'Sukses get pagu sub kegiatan! Total pagu Rp '+formatMoney(total, 0, ',', '.');
    	console.log(pesan);
    	alert(pesan);
		hide_loading();
    });
}

function kosongkan_rincian_item(rincian, ulangi=false){
	return new Promise(function(resolve, reduce){
		var cek_link = rincian.action.split('href="');
		if(rincian.action.indexOf('data-action="delete"') != -1 && ulangi == false){
			if(cek_link.length >= 4){
				var url_form_delete = cek_link[3].split('"')[0];
			}else{
				var url_form_delete = cek_link[2].split('"')[0];
			}
			relayAjax({
				url: url_form_delete+'&action=delete',
	            success: function(form_delete){
	            	var form = jQuery(form_delete.form);
	            	var url_delete = form.attr('action');
	    			jQuery.ajax({
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
			            	console.log('Error hapus rincian!', e);
			            	kosongkan_rincian_item(rincian, true)
			            	.then(function(){
			            		resolve();
			            	})
			            }
					});
	            }
			});
		}else{
			if(to_number(rincian.jumlah) == 0){
				console.log('jumlah pagu rincian sudah 0', rincian);
				return resolve();
			}
			var url_form_update = cek_link[1].split('"')[0];
			rincian.uraian_belanja = replace_string(rincian.uraian_belanja, true, true, true);
			var data_post = {
				_token: _token,
				_method: 'PUT',
				kdurut: rincian.kdurut,
				idsumberdana: rincian.idsumberdana,
				uraian: rincian.uraian_ssh,
				idssh_4: rincian.idssh_4,
				uraian_rekening: rincian.rekening_display,
				kdrek1: rincian.kdrek1,
				kdrek2: rincian.kdrek2,
				kdrek3: rincian.kdrek3,
				kdrek4: rincian.kdrek4,
				kdrek5: rincian.kdrek5,
				kdrek6: rincian.kdrek6,
				uraian_belanja: rincian.uraian_belanja,
				volume_renja1: to_number(rincian.volume_renja1, true),
				volume_renja2: to_number(rincian.volume_renja2, true),
				volume_renja3: to_number(rincian.volume_renja3, true),
				jml_volume_renja: to_number(rincian.jml_volume_renja, true),
				jumlah_renja: to_number(rincian.jumlah_renja, true),
				volume_1: 0,
				volume_2: to_number(rincian.volume_2, true),
				volume_3: to_number(rincian.volume_3, true),
				jml_volume: 0,
				jumlah: 0,
				idsatuan1: rincian.idsatuan1,
				idsatuan2: rincian.idsatuan2,
				idsatuan3: rincian.idsatuan3,
				status_pelaksanaan: rincian.status_pelaksanaan
			};
			pesan_loading('UPDATE RINCIAN "'+rincian.uraian_ssh+' | '+rincian.uraian_belanja+'" REKENING "'+rincian.rekening_display+'"', true);
			console.log('rincian', rincian);
			new Promise(function(resolve2, reduce2){
				relayAjax({
					url: url_form_update+'&action=edit',
		            success: function(form_edit){
	    				var form = jQuery(form_edit.form);
	    				data_post.idrapbdrkabelanja = form.find('input[name="idrapbdrkabelanja"]').val();
	    				data_post.idrapbdrkaaktivitas = form.find('input[name="idrapbdrkaaktivitas"]').val();
	    				data_post.harga_renja = form.find('input[name="harga_renja"]').val().replace(/\./g, '');
	    				data_post.harga = form.find('input[name="harga"]').val().replace(/\./g, '');
	    				var url = form.attr('action');
	    				resolve2(url);
	    			}
	    		});
			})
			.then(function(url_simpan){
				relayAjax({
					url: url_simpan,
					type: "post",
		            data: data_post,
		            success: function(res){
		            	resolve();
		            },
		            error: function(e){
		            	resolve();
		            	console.log('Error save rincian!', e, this.data);
		            }
				});
			});
		}
	});
}

function kosongkan_rincian(){
	var sub_kegiatan = [];
	// jQuery('#table-subkegiatan tbody .btn-group-sm .btn.btn-success.my-1.tab-next').map(function(i, b){
	jQuery('#table-subkegiatan tbody .btn-group-sm .btn.btn-primary.tab-next').map(function(i, b){
		var kode_sub = jQuery(b).attr('data-code');
		sub_kegiatan.push({
			code: kode_sub,
			sub_keg: jQuery(b).attr('data-info'),
			keg: jQuery(b).attr('data-keg'),
			prog: jQuery(b).attr('data-prog')
		});
	});
	if(sub_kegiatan.length == 0){
		return alert('Sub kegiatan tidak ditemukan!');
	}
	if(!confirm('Apakah anda yakin untuk menghapus atau mengosongkan nilai rincian dari '+sub_kegiatan.length+' sub kegiatan ini?')){
		return;
	}
	var nama_aktivitas = prompt('Aktivitas apa yang mau dihapus? Kosongkan jika mau menghapus semua aktivitas dalam sub kegiatan ini.')
	show_loading();
	window._type_singkronisasi_rka = 'rka-opd';
	var total = 0;
	console.log('sub_kegiatan', sub_kegiatan);
	var last = sub_kegiatan.length - 1;
	sub_kegiatan.reduce(function(sequence, nextData){
        return sequence.then(function(sub){
    		return new Promise(function(resolve_reduce, reject_reduce){
    			var total_sub = 0;
    			relayAjax({
					url: config.fmis_url+'/anggaran/rka-belanja/aktivitas/datatable?code='+sub.code,
			        success: function(aktivitas_exist){
			        	var last2 = aktivitas_exist.data.length - 1;
			        	aktivitas_exist.data.reduce(function(sequence2, nextData2){
					        return sequence2.then(function(aktivitas){
					    		return new Promise(function(resolve_reduce2, reject_reduce2){
					    			if(
					    				!nama_aktivitas
					    				|| nama_aktivitas == aktivitas.uraian
					    			){
							        	get_rka_aktivitas(aktivitas)
										.then(function(rka){
											var data_rka = rka.data;
											var last3 = data_rka.length - 1;
								        	data_rka.reduce(function(sequence3, nextData3){
										        return sequence3.then(function(rincian){
						    						return new Promise(function(resolve_reduce3, reject_reduce3){
						    							kosongkan_rincian_item(rincian)
						    							.then(function(){
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
										    }, Promise.resolve(data_rka[last3]))
										    .then(function(data_last){
												return resolve_reduce2(nextData2);
											});
										});
									}else{
										console.log('Aktivitas tidak dihapus! = '+aktivitas.uraian);
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
					    }, Promise.resolve(aktivitas_exist.data[last2]))
					    .then(function(data_last){
							return resolve_reduce(nextData);
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
    }, Promise.resolve(sub_kegiatan[last]))
    .then(function(data_last){
    	alert('Berhasil hapus atau kosongkan rincian!');
		hide_loading();
    });
}

function singkron_rka_all_skpd(){
	show_loading();
	getUnitFmis().then(function(unit_fmis){
		window.data_all_skpd = unit_fmis;
		var body = '';
		for(var unit_f in unit_fmis){
			body += ''
				+'<tr>'
					+'<td><input type="checkbox" value="'+unit_fmis[unit_f].id+'"></td>'
					+'<td>'+unit_f+'</td>'
				+'</tr>';
		}
		run_script('custom_dt_skpd', body);
		hide_loading();
	});
}

function get_id_current_user(){
	return new Promise(function(resolve, reject){
		pesan_loading('GET PROFILE CURRENT USER', true);
		relayAjax({
			url: config.fmis_url+'/profile',
	        success: function(html){
				html = html.split('<form method="POST"')[1].split('</form>')[0];
				var form = jQuery('<form method="POST"'+html+'</form>');
				resolve({
					nama: form.find('#nmuser-field').val(),
					username: form.find('#kduser-field').val()
				});
	        }
		});
	});
}

function singkron_rka_all_skpd_modal(){
	var skpd_selected = [];
	jQuery('#konfirmasi-skpd tbody tr input[type="checkbox"]').map(function(i, b){
		var cek = jQuery(b).is(':checked');
		if(cek){
			var id = jQuery(b).val();
			var nama = jQuery(b).closest('tr').find('td').eq(1).text().trim();
			skpd_selected.push({
				id: id,
				nama: nama
			});
		}
	});
	if(skpd_selected.length >= 1){
		window.jenis_apbd_global = jQuery('input[name="jenis-data"]:checked').val();
		var cek_jenis = false;
		if(jenis_apbd_global == 1){
			cek_jenis = 'Belanja';
		}else if(jenis_apbd_global == 2){
			cek_jenis = 'Pendapatan';
		}else if(jenis_apbd_global == 3){
			cek_jenis = 'Pembiayaan';
		}else if(jenis_apbd_global == 4){
			cek_jenis = 'Anggaran Kas';
		}else if(jenis_apbd_global == 5){
			cek_jenis = 'Anggaran Kas SIMDA';
		}
		if(
			cek_jenis 
			&& confirm('Apakah anda yakin untuk melakukan singkronisasi RKA dari WP-SIPD?')
		){
			show_loading();
			window.sub_kegiatan_selected_all_skpd = prompt('Masukan daftar sub kegiatan yang mau disingkronkan dipisah dengan koma (,). Biarkan kosong jika mau melakukan singkronisasi seluruh sub kegiatan. Tambahkan tanda != di awal nama sub kegiatan jika ingin mengecualikasi sub kegiatan tersebut.');
			if(sub_kegiatan_selected_all_skpd.trim() == ''){
				sub_kegiatan_selected_all_skpd = false;
			}else{
				sub_kegiatan_selected_all_skpd = sub_kegiatan_selected_all_skpd.split(',');
			}

			window.lingkup_rka_global = jQuery('input[name="data-singkron"]:checked').val();
			window.pagu_sub_keg_global = jQuery('input[name="pagu-sub-keg"]:checked').val();
			var last = skpd_selected.length - 1;
			skpd_selected.reduce(function(sequence, nextData){
		        return sequence.then(function(skpd){
		    		return new Promise(function(resolve_reduce, reject_reduce){
		    			get_id_current_user()
		    			.then(function(user){
		    				console.log('user', user, skpd);
		    				get_all_user_fmis(user.username)
							.then(function(users){
		    					var current_user = false;
		    					users.data.map(function(u, n){
									if(u.kduser == user.username){
										current_user = u;
									}
								});
								if(current_user){
									new Promise(function(resolve, reject){
			    						var url_form_edit = current_user.action.split('href="')[2].split('"')[0];
			    						relayAjax({
											url: url_form_edit+'?action=edit',
									        success: function(form_edit){
												var form = jQuery(form_edit.form);
												var data_post = {
													_token: _token,
													_method: 'PUT',
													kduser: current_user.kduser,
													nmuser: current_user.nmuser,
													nmket: current_user.nmket,
													level: 'admin',
													status: 1,
													idunit: skpd.id,
													idsubunit: '',
													'idgroup[]': form.find('select[name="idgroup[]"]').val(),
													'tahun[]': form.find('select[name="tahun[]"]').val()
												};
			    								pesan_loading('UPDATE User '+user.nama+' SET UNIT SKPD = '+skpd.nama, true);
												var url_edit = form.attr('action');
												relayAjax({
													url: url_edit,
													data: data_post,
													type: 'post',
											        success: function(res){
											        	resolve(res);
											        }
											    });
									        }
										});
			    					})
			    					.then(function(res){
			    						gl_dokumen_rka(function(res_dokumen){
			    							// return resolve_reduce(nextData);
			    							if(!res_dokumen){
			    								resolve_reduce(nextData);
			    							}else{
				    							window.options_all_skpd = {
				    								idrkpdranwalprogram: res_dokumen.idrkpdranwalprogram,
				    								uraian_rkpd: res_dokumen.uraian_rkpd,
				    								code_sasaran: res_dokumen.code_sasaran,
				    								html_program_rkpd: res_dokumen.html_program_rkpd,
				    								sub_kegiatan: []
				    							};
				    							window.lanjut_singkron_rka_all_skpd = resolve_reduce;
				    							window.nextData_all_skpd = nextData;

			    								// belanja
			    								if(jenis_apbd_global == 1){
					    							var data = {
													    message:{
													        type: "get-url",
													        content: {
															    url: config.url_server_lokal,
															    type: 'post',
															    data: { 
																	action: 'get_sub_keg',
																	run: 'singkronisasi_program_all_skpd',
																	tahun_anggaran: config.tahun_anggaran,
																	id_skpd_fmis: skpd.id,
																	idsumber: 1,
																	api_key: config.api_key
																},
												    			return: true
															}
													    }
													};
													chrome.runtime.sendMessage(data, function(response) {
													    console.log('responeMessage', response);
													});
												// pendapatan
			    								}else if(jenis_apbd_global == 2){
			    									var data = {
													    message:{
													        type: "get-url",
													        content: {
															    url: config.url_server_lokal,
															    type: 'post',
															    data: { 
																	action: 'get_data_pendapatan',
																	tahun_anggaran: config.tahun_anggaran,
																	id_skpd_fmis: skpd.id,
																	api_key: config.api_key
																},
												    			return: true
															}
													    }
													};
													chrome.runtime.sendMessage(data, function(response) {
													    console.log('responeMessage', response);
													});
			    								}else if(jenis_apbd_global == 3){
			    									var data = {
													    message:{
													        type: "get-url",
													        content: {
															    url: config.url_server_lokal,
															    type: 'post',
															    data: { 
																	action: 'get_data_pembiayaan',
																	tahun_anggaran: config.tahun_anggaran,
																	id_skpd_fmis: skpd.id,
																	api_key: config.api_key
																},
												    			return: true
															}
													    }
													};
													chrome.runtime.sendMessage(data, function(response) {
													    console.log('responeMessage', response);
													});
			    								}else if(
			    									jenis_apbd_global == 4
			    									|| jenis_apbd_global == 5
			    								){
			    									var data = {
													    message:{
													        type: "get-url",
													        content: {
															    url: config.url_server_lokal,
															    type: 'post',
															    data: { 
																	action: 'get_kas_fmis',
																	tahun_anggaran: config.tahun_anggaran,
																	id_skpd_fmis: skpd.id,
																	api_key: config.api_key,
																	type: jenis_apbd_global
																},
												    			return: true
															}
													    }
													};
													chrome.runtime.sendMessage(data, function(response) {
													    console.log('responeMessage', response);
													});
												}else{
													pesan_loading('Jenis APBD = '+jenis_apbd_global+' masih dalam pengembangan!');
													resolve_reduce(nextData);
												}
											}
			    						}, skpd);
			    					})
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
		    }, Promise.resolve(skpd_selected[last]))
		    .then(function(data_last){
		    	run_script('custom_dt_skpd_hide');
		    	alert('Sukses singkronisasi data!');
		    	hide_loading();
		    });
		}else{
			alert('Jenis APBD = '+jenis_apbd_global+' masih dalam pengembangan!');
		}
	}else{
		alert('Pilih Unit SKPD dulu!');
	}
}

function singkronisasi_anggaran_kas(data_sipd){
	console.log('data anggaran kas', data_sipd, 'options_all_skpd', options_all_skpd);
	if(_type_singkronisasi_rka != 'rka-opd'){
		pesan_loading('PROGRAM PENDAPATAN dan PEMBIAYAAN di RENJA tidak perlu dibuat!', true);
		return lanjut_singkron_rka_all_skpd(nextData_all_skpd);
	}else if(data_sipd.data.length == 0){
		pesan_loading('Data pendapatan atau pembiayaan dari SKPD ini tidak ditemukan di WP-SIPD!');
		return lanjut_singkron_rka_all_skpd(nextData_all_skpd);
	}
	var code_sasaran = options_all_skpd.code_sasaran;
	var uraian_rkpd = options_all_skpd.uraian_rkpd;
	var idrkpdranwalprogram = options_all_skpd.idrkpdranwalprogram;
	var html_program_rkpd = options_all_skpd.html_program_rkpd;
	var kas_unik = {};
	data_sipd.data.map(function(b, i){
		var nama_sub = removeNewlines(b.nama_program+' | '+b.nama_giat+' | '+get_text_bidur(b.nama_sub_giat));
		var nama_aktivitas = nama_sub+' | '+b.nama_skpd_data_unit.trim();
		if(
			sub_kegiatan_selected_all_skpd
			&& sub_kegiatan_selected_all_skpd.length >= 1
		){
			var cek_exclude = [];
			var cek_include = [];
			sub_kegiatan_selected_all_skpd.map(function(bb, ii){
				if(bb.trim().substr(0,2) == '!='){
					cek_exclude.push(bb.trim().replace('!=', ''));
				}else{
					cek_include.push(bb.trim());
				}
			});
			if(cek_include.length == 0){
				var check = true;
				cek_exclude.map(function(bb, ii){
					if(removeNewlines(b.nama_sub_giat).indexOf(removeNewlines(bb)) != -1){
						check = false;
					}
				});
				if(check){
					if(b.id_mapping){
						var id_skpd_fmis = b.id_mapping.split('.');
						if(id_skpd_fmis.length > 1){
							id_skpd_fmis = id_skpd_fmis[1];
						}else{
							id_skpd_fmis = id_skpd_fmis[0];
						}
						kas_unik[replace_string(nama_aktivitas)] = b;
					}
				}
			}else{
				var check = false;
				cek_include.map(function(bb, ii){
					if(removeNewlines(b.nama_sub_giat).indexOf(removeNewlines(bb)) != -1){
						var check2 = false;
						cek_exclude.map(function(bbb, iii){
							if(removeNewlines(b.nama_sub_giat).indexOf(removeNewlines(bbb)) != -1){
								check2 = true;
							}
						});
						if(!check2){
							check = true;
						}
					}
				});
				if(check){
					if(b.id_mapping){
						var id_skpd_fmis = b.id_mapping.split('.');
						if(id_skpd_fmis.length > 1){
							id_skpd_fmis = id_skpd_fmis[1];
						}else{
							id_skpd_fmis = id_skpd_fmis[0];
						}
						kas_unik[replace_string(nama_aktivitas)] = b;
					}
				}
			}
		}else{
			if(b.id_mapping){
				var id_skpd_fmis = b.id_mapping.split('.');
				if(id_skpd_fmis.length > 1){
					id_skpd_fmis = id_skpd_fmis[1];
				}else{
					id_skpd_fmis = id_skpd_fmis[0];
				}
				kas_unik[replace_string(nama_aktivitas)] = b;
			}
		}
	});
	get_aktivitas_kas()
	.then(function(aktivitas_all){
		var aktivitas_per_sub = {};
		aktivitas_all.map(function(b, i){
			var key = removeNewlines(b.nmprogram+' | '+b.nmkegiatan+' | '+b.nmsubkegiatan);
			if(!aktivitas_per_sub[replace_string(key)]){
				aktivitas_per_sub[replace_string(key)] = [];
			}
			aktivitas_per_sub[replace_string(key)].push(b);
		});

		var aktivitas_filter = {};
		for(var i in kas_unik){
			var nama_sub = removeNewlines(kas_unik[i].nama_program+' | '+kas_unik[i].nama_giat+' | '+get_text_bidur(kas_unik[i].nama_sub_giat));
			if(!aktivitas_filter[replace_string(nama_sub)]){
				aktivitas_filter[replace_string(nama_sub)] = [];
			}
			aktivitas_filter[replace_string(nama_sub)].push(kas_unik[i]);
		}

		console.log('kas_unik', kas_unik, aktivitas_per_sub, aktivitas_filter);
		var last = aktivitas_all.length - 1;
		aktivitas_all.reduce(function(sequence, nextData){
            return sequence.then(function(aktivitas){
        		return new Promise(function(resolve_reduce, reject_reduce){
        			var nama_aktivitas_fmis = aktivitas.nm_aktivitas;
        			var nama_sub_fmis = removeNewlines(aktivitas.nmprogram+' | '+aktivitas.nmkegiatan+' | '+aktivitas.nmsubkegiatan);
        			// hanya sub kegiatan terpilih yang boleh lanjut
        			if(!aktivitas_filter[replace_string(nama_sub_fmis)]){
        				return resolve_reduce(nextData);
        			}

        			console.log('Cek insert aktivitas "'+nama_aktivitas_fmis+'" Sub kegiatan "'+nama_sub_fmis+'"', aktivitas);
		        	var code_aktivitas = aktivitas.action.split('data-code="')[1].split('"')[0];
        			new Promise(function(resolve_reduce2, reject_reduce2){
	        			// cek apakah aktivitas fmis ada di sipd
	        			var key = nama_aktivitas_fmis.split(' | ');
	        			if(
	        				(
	        					key[1] 
	        					&& kas_unik[replace_string(nama_sub_fmis+' | '+key[1])]
	        				)
	        				|| (
	        					aktivitas_per_sub[replace_string(nama_sub_fmis)].length == 1
	        					&& aktivitas_filter[replace_string(nama_sub_fmis)].length == 1
	        				)
	        			){
	        				if(
	        					key[1] 
	        					&& kas_unik[replace_string(nama_sub_fmis+' | '+key[1])]
	        				){
	        					var aktivitas_sipd = kas_unik[replace_string(nama_sub_fmis+' | '+key[1])];
	        				}else{
	        					var aktivitas_sipd = aktivitas_filter[replace_string(nama_sub_fmis)][0];
	        				}
		        			relayAjax({
								url: config.fmis_url+'/anggaran/rka-renkas/rincian/form?code='+code_aktivitas+'&action=create',
					            success: function(form_tambah){
					            	var form = jQuery(form_tambah.form);
					            	var akun_fmis = [];
					            	// get rekening yang belum ditambahkan ke fmis
					            	form.find('#uraian_rekening option').map(function(i, b){
					            		var val = jQuery(b).val();
					            		if(val){
						            		var akun = jQuery(b).text().trim().split(' ');
						            		var kode_akun = akun.shift();
						            		var nama_akun = akun.join(' ');
						            		var pagu_akun = +jQuery(b).attr('data-pagu');
						            		akun_fmis.push({
						            			uraian_rekening: val,
						            			kode_akun: kode_akun,
						            			nama_akun: nama_akun,
						            			pagu_akun: pagu_akun
						            		});
						            	}
					            	});
					            	aktivitas_sipd.code_aktivitas = code_aktivitas;
					            	aktivitas_sipd.form_tambah = form_tambah.form;
					            	aktivitas_sipd.aktivitas_fmis = aktivitas;
					            	cek_insert_akun_rak(aktivitas_sipd, akun_fmis)
					            	.then(function(){
					            		resolve_reduce2();
					            	});
					            }
					        });
		        		}else{
		        			pesan_loading('Aktivitas "'+nama_aktivitas_fmis+'" tidak ditemukan di SIPD! Sub kegiatan "'+nama_sub_fmis+'"', true);
		        			resolve_reduce2();
		        		}
		        	})
		        	.then(function(){
		        		// kirim data aktivitas dan anggaran kas ke lokal
		        		get_renkas({
		        			code_aktivitas: code_aktivitas,
		        			aktivitas_fmis: aktivitas
		        		})
		        		.then(function(akun_exist){
		        			var akun = [];
		        			akun_exist.data.map(function(b, i){
		        				b.action = '';
		        				akun.push(b);
		        			});
		        			var new_aktivitas = aktivitas;
		        			new_aktivitas.action = '';
			        		var data = {
							    message:{
							        type: "get-url",
							        content: {
									    url: config.url_server_lokal,
									    type: 'post',
									    data: { 
											action: 'singkron_kas_fmis',
											tahun_anggaran: config.tahun_anggaran,
											api_key: config.api_key,
											aktivitas: new_aktivitas,
											akun: akun
										},
						    			return: false
									}
							    }
							};
							chrome.runtime.sendMessage(data, function(response) {
							    console.log('responeMessage', response);
							});
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
        }, Promise.resolve(aktivitas_all[last]))
        .then(function(data_last){
        	lanjut_singkron_rka_all_skpd(nextData_all_skpd);
        });
	});
}

function get_renkas(aktivitas_sipd) {
	return new Promise(function(resolve, reject){
		pesan_loading('Get anggaran kas existing per rekening! aktivitas '+aktivitas_sipd.aktivitas_fmis.nm_aktivitas, true);
		relayAjax({
			url: config.fmis_url+'/anggaran/rka-renkas/rincian/datatable?code='+aktivitas_sipd.code_aktivitas,
            success: function(akun_exist){
            	return resolve(akun_exist);
            }
        });
	});
}

function cek_insert_akun_rak(aktivitas_sipd, akun_fmis){
	return new Promise(function(resolve, reject){
		new Promise(function(resolve2, reject2){
			get_renkas(aktivitas_sipd)
			.then(function(akun_exist){
				console.log('Insert baru jika belum ada!', aktivitas_sipd, akun_fmis);
	        	var last = akun_fmis.length - 1;
				akun_fmis.reduce(function(sequence, nextData){
		            return sequence.then(function(akun){
		        		return new Promise(function(resolve_reduce, reject_reduce){
		        			var rek_display = akun.kode_akun+' '+akun.nama_akun;
		        			var cek_exist = false;
		        			akun_exist.data.map(function(b, i){
		        				if(rek_display == b.rekening_display){
		        					cek_exist = true;
		        				}
		        			});
		        			if(!cek_exist){
		        				var cek_rek_sipd = false;
		        				aktivitas_sipd.kas.map(function(b, i){
		        					if(akun.kode_akun == b.kode_akun){
										b.total_kas = (+b.bulan_1)+(+b.bulan_2)+(+b.bulan_3)+(+b.bulan_4)+(+b.bulan_5)+(+b.bulan_6)+(+b.bulan_7)+(+b.bulan_8)+(+b.bulan_9)+(+b.bulan_10)+(+b.bulan_11)+(+b.bulan_12);
		        						cek_rek_sipd = b;
		        					}
		        				});
		        				if(cek_rek_sipd){
		        					if(akun.pagu_akun == cek_rek_sipd.total_kas){
		        						var form = jQuery(aktivitas_sipd.form_tambah);
		        						var url_simpan = form.attr('action');
		        						var data_post = {
		        							_token: _token,
		        							uraian_rekening: akun.uraian_rekening,
		        							jan: cek_rek_sipd.bulan_1.replace(/\./g, ','),
		        							feb: cek_rek_sipd.bulan_2.replace(/\./g, ','),
		        							mar: cek_rek_sipd.bulan_3.replace(/\./g, ','),
		        							apr: cek_rek_sipd.bulan_4.replace(/\./g, ','),
		        							mei: cek_rek_sipd.bulan_5.replace(/\./g, ','),
		        							jun: cek_rek_sipd.bulan_6.replace(/\./g, ','),
		        							jul: cek_rek_sipd.bulan_7.replace(/\./g, ','),
		        							aug: cek_rek_sipd.bulan_8.replace(/\./g, ','),
		        							sep: cek_rek_sipd.bulan_9.replace(/\./g, ','),
		        							okt: cek_rek_sipd.bulan_10.replace(/\./g, ','),
		        							nov: cek_rek_sipd.bulan_11.replace(/\./g, ','),
		        							des: cek_rek_sipd.bulan_12.replace(/\./g, ',')
		        						};
		        						pesan_loading('Simpan anggaran kas '+rek_display+', aktivitas '+aktivitas_sipd.aktivitas_fmis.nm_aktivitas+', sub kegiatan '+aktivitas_sipd.aktivitas_fmis.sub_display, true);
					        			relayAjax({
											url: url_simpan,
											type: 'post',
											data: data_post,
								            success: function(){
								            	resolve_reduce(nextData);
								            }
								        });
		        					}else{
		        						pesan_loading('Pagu rekening '+rek_display+' tidak sama antara SIPD dan FMIS!', true);
			        					resolve_reduce(nextData);
		        					}
		        				}else{
			        				pesan_loading('Rekening '+rek_display+' tidak ditemukan di SIPD!', true);
			        				resolve_reduce(nextData);
		        				}
		        			}else{
		        				pesan_loading('Anggaran kas untuk rekening '+rek_display+' sudah ada!', true);
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
		        }, Promise.resolve(akun_fmis[last]))
		        .then(function(data_last){
		        	resolve2();
		        });
			});
		})
		.then(function(){
			get_renkas(aktivitas_sipd)
			.then(function(akun_exist){
				console.log('Update kas jika tidak sama!', akun_exist);
				var last = akun_exist.data.length - 1;
				akun_exist.data.reduce(function(sequence, nextData){
		            return sequence.then(function(akun){
		        		return new Promise(function(resolve_reduce, reject_reduce){
		        			var kode_akun = akun.rekening_display.split(' ')[0];
		        			var cek_rek_sipd = false;
	        				aktivitas_sipd.kas.map(function(b, i){
	        					if(kode_akun == b.kode_akun){
	        						cek_rek_sipd = b;
	        					}
	        				});
    						var url_edit = akun.action.split('href="')[1];
    						url_edit = url_edit.split('"')[0];
	        				if(cek_rek_sipd){
	        					// cek jika ada perbedaan pagu kas per bulan
	        					if(
	        						to_number(akun.jan) != cek_rek_sipd.bulan_1
	        						|| to_number(akun.feb) != cek_rek_sipd.bulan_2
	        						|| to_number(akun.mar) != cek_rek_sipd.bulan_3
	        						|| to_number(akun.apr) != cek_rek_sipd.bulan_4
	        						|| to_number(akun.mei) != cek_rek_sipd.bulan_5
	        						|| to_number(akun.jun) != cek_rek_sipd.bulan_6
	        						|| to_number(akun.jul) != cek_rek_sipd.bulan_7
	        						|| to_number(akun.aug) != cek_rek_sipd.bulan_8
	        						|| to_number(akun.sep) != cek_rek_sipd.bulan_9
	        						|| to_number(akun.okt) != cek_rek_sipd.bulan_10
	        						|| to_number(akun.nov) != cek_rek_sipd.bulan_11
	        						|| to_number(akun.des) != cek_rek_sipd.bulan_12
	        					){
	        						relayAjax({
										url: url_edit+'&action=edit',
							            success: function(form_tambah){
							            	var form = jQuery(form_tambah.form);
			        						var url_simpan = form.attr('action');
			        						var data_post = {
			        							_method: 'PUT',
			        							_token: _token,
			        							uraian_rekening: akun.rekening_display,
			        							jan: cek_rek_sipd.bulan_1.replace(/\./g, ','),
			        							feb: cek_rek_sipd.bulan_2.replace(/\./g, ','),
			        							mar: cek_rek_sipd.bulan_3.replace(/\./g, ','),
			        							apr: cek_rek_sipd.bulan_4.replace(/\./g, ','),
			        							mei: cek_rek_sipd.bulan_5.replace(/\./g, ','),
			        							jun: cek_rek_sipd.bulan_6.replace(/\./g, ','),
			        							jul: cek_rek_sipd.bulan_7.replace(/\./g, ','),
			        							aug: cek_rek_sipd.bulan_8.replace(/\./g, ','),
			        							sep: cek_rek_sipd.bulan_9.replace(/\./g, ','),
			        							okt: cek_rek_sipd.bulan_10.replace(/\./g, ','),
			        							nov: cek_rek_sipd.bulan_11.replace(/\./g, ','),
			        							des: cek_rek_sipd.bulan_12.replace(/\./g, ',')
			        						};
			        						pesan_loading('Update anggaran kas '+akun.rekening_display+', aktivitas '+aktivitas_sipd.aktivitas_fmis.nm_aktivitas+', sub kegiatan '+aktivitas_sipd.aktivitas_fmis.sub_display, true);
						        			relayAjax({
												url: url_simpan,
												type: 'post',
												data: data_post,
									            success: function(){
									            	resolve_reduce(nextData);
									            }
									        });
						        		}
						        	});
	        					}else{
	        						pesan_loading('Kas untuk rekening '+akun.rekening_display+' sudah sesuai!', true);
		        					resolve_reduce(nextData);
	        					}
	        				}else{
	        					if(
	        						to_number(akun.jan) != 0
	        						|| to_number(akun.feb) != 0
	        						|| to_number(akun.mar) != 0
	        						|| to_number(akun.apr) != 0
	        						|| to_number(akun.mei) != 0
	        						|| to_number(akun.jun) != 0
	        						|| to_number(akun.jul) != 0
	        						|| to_number(akun.aug) != 0
	        						|| to_number(akun.sep) != 0
	        						|| to_number(akun.okt) != 0
	        						|| to_number(akun.nov) != 0
	        						|| to_number(akun.des) != 0
	        					){
			        				relayAjax({
										url: url_edit+'&action=edit',
							            success: function(form_tambah){
							            	var form = jQuery(form_tambah.form);
			        						var url_simpan = form.attr('action');
			        						var data_post = {
				        						_method: 'PUT',
			        							_token: _token,
			        							uraian_rekening: akun.rekening_display,
			        							jan: 0,
			        							feb: 0,
			        							mar: 0,
			        							apr: 0,
			        							mei: 0,
			        							jun: 0,
			        							jul: 0,
			        							aug: 0,
			        							sep: 0,
			        							okt: 0,
			        							nov: 0,
			        							des: 0
			        						};
			        						pesan_loading('Kosongkan anggaran kas '+akun.rekening_display, true);
						        			relayAjax({
												url: url_simpan,
												type: 'post',
												data: data_post,
									            success: function(){
									            	resolve_reduce(nextData);
									            }
									        });
						        		}
						        	});
			        			}else{
			        				pesan_loading('Anggaran kas '+akun.rekening_display+' sudah kosong!', true);
					            	resolve_reduce(nextData);
			        			}
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
		        }, Promise.resolve(akun_exist.data[last]))
		        .then(function(data_last){
		        	resolve();
		        });
			});
		})
	});
}

function get_aktivitas_kas(){
	return new Promise(function(resolve, reject){
		var aktivitas_all = [];
		relayAjax({
			url: config.fmis_url+'/anggaran/rka-renkas/datatableDok',
            success: function(dokumen_all){
            	var last = dokumen_all.data.length - 1;
				dokumen_all.data.reduce(function(sequence, nextData){
		            return sequence.then(function(dokumen){
		        		return new Promise(function(resolve_reduce, reject_reduce){
		        			var code_dokumen = dokumen.action.split('data-code="')[1].split('"')[0];
		        			pesan_loading('Get all aktivitas dari dokumen kas '+dokumen.nmskpd+'. Nomor: '+dokumen.no_rka, true);
		        			relayAjax({
								url: config.fmis_url+'/anggaran/rka-renkas/datatable?code='+code_dokumen,
					            success: function(aktivitas){
					            	aktivitas.data.map(function(b, i){
					            		aktivitas_all.push(b);
					            	});
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
		        }, Promise.resolve(dokumen_all.data[last]))
		        .then(function(data_last){
		        	resolve(aktivitas_all);
		        });
            },
            error: function(e){
            	console.log('Error simpan kegiatan!', e, this.data);
            }
		});
	});
}

function get_nama_jenis_program(id_jenis){
	if(id_jenis == 1){
		return 'Pendapatan';
	}else if(id_jenis == 2){
		return 'Pembiayaan Penerimaan';
	}else if(id_jenis == 3){
		return 'Pembiayaan Pengeluaran';
	}
}

function singkronisasi_pendapatan(data_sipd){
	console.log('data pendapatan', data_sipd, 'options_all_skpd', options_all_skpd);
	if(_type_singkronisasi_rka != 'rka-opd'){
		pesan_loading('PROGRAM PENDAPATAN dan PEMBIAYAAN di RENJA tidak perlu dibuat!', true);
		return lanjut_singkron_rka_all_skpd(nextData_all_skpd);
	}else if(data_sipd.data.length == 0){
		pesan_loading('Data pendapatan atau pembiayaan dari SKPD ini tidak ditemukan di WP-SIPD!');
		return lanjut_singkron_rka_all_skpd(nextData_all_skpd);
	}
	var code_sasaran = options_all_skpd.code_sasaran;
	var uraian_rkpd = options_all_skpd.uraian_rkpd;
	var idrkpdranwalprogram = options_all_skpd.idrkpdranwalprogram;
	var html_program_rkpd = options_all_skpd.html_program_rkpd;
	var kegiatan_exist_global = [];
	var sub_kegiatan_exist_global = [];
	var aktivitas_exist_global = [];
	get_list_program(options_all_skpd)
	.then(function(program_exist){
		var cek_program_pendapatan = false;
		var cek_program_pembiayaan_penerimaan = false;
		var cek_program_pembiayaan_pengeluaran = false;
		var kdurut = 0;
		program_exist.data.map(function(b, i){
			if(b.jns_program == 1){
				cek_program_pendapatan = b;
			}else if(b.jns_program == 2){
				cek_program_pembiayaan_penerimaan = b;
			}else if(b.jns_program == 3){
				cek_program_pembiayaan_pengeluaran = b;
			}
			if(kdurut <= +b.kdurut){
				kdurut = +b.kdurut;
			}
		});
		return new Promise(function(resolve, reject){
			get_master_prog_fmis(code_sasaran, idrkpdranwalprogram)
			.then(function(master_program){
				var sendData = [];
				var nama_program = 'Non Program';
				var data_post = {
					_token: _token,
					idprogram: master_program.program[nama_program].id
				};
				data_post.uraian = nama_program;
				var form = jQuery(program_exist.form_tambah_program);
				data_post.idrapbdrkaprogram = form.find('input[name="idrapbdrkaprogram"]').val();
				data_post.idrapbdrkasasaran = form.find('input[name="idrapbdrkasasaran"]').val();
				data_post.status_pelaksanaan = 4;
				var url = form.attr('action');
				if(
					jenis_apbd_global == 2 
					&& !cek_program_pendapatan
				){
					kdurut++;
					jQuery('<select>'+html_program_rkpd+'</select>').find('option').map(function(i, b){
						var text = jQuery(b).text().trim();
						if(text.indexOf('Pendapatan') != -1){
							uraian_rkpd = text;
							idrkpdranwalprogram = jQuery(b).val();
						}
					});
					data_post.uraian_rkpd = uraian_rkpd;
					data_post.idrapbdprogram = idrkpdranwalprogram;
					data_post.kdurut = kdurut;
					data_post.jns_program = 1;
					pesan_loading('SIMPAN PROGRAM PENDAPATAN '+data_post.uraian, true);
					sendData.push(save_program(url, data_post));
				}
				if(
					jenis_apbd_global == 3 
					&& !cek_program_pembiayaan_penerimaan
				){
					kdurut++;
					jQuery('<select>'+html_program_rkpd+'</select>').find('option').map(function(i, b){
						var text = jQuery(b).text().trim();
						if(text.indexOf('Penerimaan Pembiayaan') != -1){
							uraian_rkpd = text;
							idrkpdranwalprogram = jQuery(b).val();
						}
					});
					data_post.uraian_rkpd = uraian_rkpd;
					data_post.idrapbdprogram = idrkpdranwalprogram;
					data_post.kdurut = kdurut;
					data_post.jns_program = 2;
					pesan_loading('SIMPAN PROGRAM PEMBIAYAAN PENERIMAAN '+data_post.uraian, true);
					sendData.push(save_program(url, data_post));
				}
				if(
					jenis_apbd_global == 3 
					&& !cek_program_pembiayaan_pengeluaran
				){
					kdurut++;
					jQuery('<select>'+html_program_rkpd+'</select>').find('option').map(function(i, b){
						var text = jQuery(b).text().trim();
						if(text.indexOf('Pengeluaran Pembiayaan') != -1){
							uraian_rkpd = text;
							idrkpdranwalprogram = jQuery(b).val();
						}
					});
					data_post.uraian_rkpd = uraian_rkpd;
					data_post.idrapbdprogram = idrkpdranwalprogram;
					data_post.kdurut = kdurut;
					data_post.jns_program = 3;
					pesan_loading('SIMPAN PROGRAM PEMBIAYAAN PENGELUARAN '+data_post.uraian, true);
					sendData.push(save_program(url, data_post));
				}
				Promise.all(sendData)
				.then(function(){
					resolve();
				})
			});
		});
	})
	// cek insert kegiatan
	.then(function(){
		return new Promise(function(resolve, reject){
			get_list_program(options_all_skpd)
			.then(function(program_exist){
				var last = program_exist.data.length - 1;
				program_exist.data.reduce(function(sequence, nextData){
		            return sequence.then(function(program){
		        		return new Promise(function(resolve_reduce, reject_reduce){
		        			// jika pilihan singkron pendapatan
		        			if(
		        				jenis_apbd_global == 2 
		        				&& program.jns_program != 1
		        			){
								return resolve_reduce(nextData);
		        			// jika pilihan singkron pembiayaan
							}else if(
								jenis_apbd_global == 3 
		        				&& (
		        					program.jns_program != 2
		        					&& program.jns_program != 3
		        				)
	        				){
								return resolve_reduce(nextData);
							}
		        			get_list_kegiatan(program)
							.then(function(kegiatan_exist){
								return new Promise(function(resolve2, reject2){
									if(kegiatan_exist.data.length == 0){
										get_master_keg_fmis(program)
										.then(function(master_kegiatan){
											var nama_kegiatan = 'Non Kegiatan'.toLowerCase();
											var data_post = {
				        						_token: _token,
				        						kdurut: 1,
				        						idkegiatan: master_kegiatan[nama_kegiatan].id,
				        						uraian: master_kegiatan[nama_kegiatan].nama
				        					};
				        					pesan_loading('SIMPAN KEGIATAN '+nama_kegiatan, true);
			        						var form = jQuery(global_form_tambah_kegiatan);
											data_post.idrapbdrkakegiatan = '';
											data_post.idrapbdrkaprogram = form.find('input[name="idrapbdrkaprogram"]').val();
											data_post.status_pelaksanaan = 4;
											var url_simpan = form.attr('action');
				        					relayAjax({
												url: url_simpan,
												type: "post",
									            data: data_post,
									            success: function(res){
									            	get_list_kegiatan(program)
													.then(function(kegiatan_exist){
														resolve2(kegiatan_exist);
													});
									            },
									            error: function(e){
									            	console.log('Error simpan kegiatan!', e, this.data);
									            }
											});
										});
									}else{
										resolve2(kegiatan_exist);
									}
								});
							})
							.then(function(filter_kegiatan){
								filter_kegiatan.data.map(function(b, i){
									b.program_fmis = program;
									kegiatan_exist_global.push(b);
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
			});
		});
	})
	// cek insert sub kegiatan
	.then(function(){
		return new Promise(function(resolve, reject){
			var last = kegiatan_exist_global.length - 1;
			kegiatan_exist_global.reduce(function(sequence, nextData){
	            return sequence.then(function(kegiatan){
	        		return new Promise(function(resolve_reduce, reject_reduce){
						get_list_sub_kegiatan(kegiatan)
						.then(function(sub_kegiatan_exist){
							new Promise(function(resolve3, reject3){
								if(sub_kegiatan_exist.data.length == 0){
									get_master_sub_keg_fmis(kegiatan)
									.then(function(master_sub_kegiatan){
										var nama_sub_giat = 'Non Sub Kegiatan'.toLowerCase();
										var data_post = {
			        						_token: _token,
			        						idsubkegiatan: master_sub_kegiatan[nama_sub_giat].id,
			        						uraian: master_sub_kegiatan[nama_sub_giat].nama,
			        						pagu_tahun1: 0,
			        						pagu_tahun2: 0,
			        						pagu_tahun3: 0
			        					};
			        					data_post.kdurut = 1;
			        					pesan_loading('SIMPAN SUB KEGIATAN '+nama_sub_giat, true);
			        					new Promise(function(resolve3, reject3){
		        							var form = jQuery(global_form_tambah_subkegiatan);
		        							data_post.bln1 = 1;
		        							data_post.bln2 = 12;
		        							data_post.status_pelaksanaan = 4;
		        							data_post.idrapbdrkakegiatan = form.find('input[name="idrapbdrkakegiatan"]').val();
											var url = form.attr('action');
			        						resolve3(url);
			        					})
			        					.then(function(url_proses){
				        					relayAjax({
												url: url_proses,
												type: "post",
									            data: data_post,
									            success: function(res){
									            	get_list_sub_kegiatan(kegiatan)
													.then(function(sub_kegiatan_exist){
														sub_kegiatan_exist.data.map(function(b, i){
															b.kegiatan_fmis = kegiatan;
															sub_kegiatan_exist_global.push(b);
														});
								        				resolve3();
								        			});
									            },
									            error: function(e){
									            	console.log('Error kegiatan!', e, this.data);
									            }
											});
			        					});
									});
								}else{
									sub_kegiatan_exist.data.map(function(b, i){
										b.kegiatan_fmis = kegiatan;
										sub_kegiatan_exist_global.push(b);
									});
									resolve3();
								}
							})
							.then(function(){
						        resolve_reduce(nextData);
							})
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
	        }, Promise.resolve(kegiatan_exist_global[last]))
	        .then(function(data_last){
	        	resolve();
	        });
		});
	})
	// cek insert aktivitas
	.then(function(){
		if(lingkup_rka_global == 2){
			return Promise.resolve();
		}else{
			return new Promise(function(resolve, reject){
				var last = sub_kegiatan_exist_global.length - 1;
				sub_kegiatan_exist_global.reduce(function(sequence, nextData){
		            return sequence.then(function(sub_kegiatan_fmis){
		        		return new Promise(function(resolve_reduce, reject_reduce){
		        			get_list_aktivitas(sub_kegiatan_fmis)
							.then(function(aktivitas_exist){
								get_master_sumberdana(sub_kegiatan_fmis)
								.then(function(master_sumberdana){
									getIdSatuan('Rupiah', false, {
										data: {}
									})
									.then(function(satuan_fmis){
										var aktivitas_sipd = [];
										var rka_sipd = [];
								        var jenis_program = sub_kegiatan_fmis.kegiatan_fmis.program_fmis.jns_program;
					        			var nama_jenis_program = get_nama_jenis_program(jenis_program);
										data_sipd.data.map(function(b, i){
											// jika pembiayaan penerimaan
									        if(
												jenis_apbd_global == 3 
						        				&& jenis_program == 2
						        				&& b.type != 'penerimaan'
					        				){
									        	return;
											// jika pembiayaan pengeluaran
									        }else if(
									        	jenis_apbd_global == 3 
						        				&& jenis_program == 3
						        				&& b.type != 'pengeluaran'
									        ){
									        	return;
									        }
											var nama_aktivitas = b.nama_akun+' | '+b.nama_skpd;
											var cek_exist = false;
											aktivitas_sipd.map(function(bb, ii){
												if(bb.uraian == nama_aktivitas){
													cek_exist = bb;
												}
											});
											if(!cek_exist){
												aktivitas_sipd.push({
													nama_skpd: b.nama_skpd,
													uraian: replace_string(nama_aktivitas, true, true),
													id_mapping: b.id_mapping,
													idsumberdana: master_sumberdana[b.nama_akun.substring(0, 150).trim()]
												});
											}
											b.sumber_dana = [{
												nama_dana: '[] - '+b.nama_akun
											}];
											rka_sipd.push(b);
										});
										console.log('cek insert aktivitas sub keg = '+sub_kegiatan_fmis.uraian, aktivitas_exist.data, aktivitas_sipd);
										var last2 = aktivitas_sipd.length - 1;
										var kdurut = 0;
										aktivitas_sipd.reduce(function(sequence2, nextData2){
								            return sequence2.then(function(current_aktivitas){
								        		return new Promise(function(resolve_reduce2, reject_reduce2){
								        			get_id_sub_unit_fmis(sub_kegiatan_fmis, current_aktivitas.id_mapping, current_aktivitas.nama_skpd)
													.then(function(id_sub_unit){
														var cek_exist = false;
														aktivitas_exist.data.map(function(b, i){
															var aktivitas_fmis = replace_string(b.uraian, true, true);
															if(aktivitas_fmis == current_aktivitas.uraian){
																cek_exist = true;
															}
															if(kdurut <= +b.kdurut){
																kdurut = +b.kdurut;
															}
														});
														var idsumberdana1 = '';
									        			var uraian_sumberdana1 = '';
									        			var idsumberdana2 = '';
									        			var uraian_sumberdana2 = '';
														var data_post = {
									        				_token: _token,
									        				uraian: current_aktivitas.uraian,
									        				idsubunit: id_sub_unit,
									        				idsumberdana1: current_aktivitas.idsumberdana,
									        				idsumberdana2: '',
									        				idsatuan1: satuan_fmis.data.idsatuan,
									        				idsatuan2: '',
									        				pagu: 0
									        			};
														if(!cek_exist){
															kdurut++;
										        			data_post.kdurut = kdurut;
															pesan_loading('SIMPAN AKTIVITAS '+current_aktivitas.uraian+' SUBKEGIATAN '+sub_kegiatan_fmis.uraian, true);
															var code_subkegiatan = sub_kegiatan_fmis.action.split('data-code="')[1].split('"')[0];
															relayAjax({
																url: config.fmis_url+'/anggaran/rka-opd/aktivitas/form?code='+code_subkegiatan+'&action=create',
																success: function(form_tambah){
											        				var form = jQuery(form_tambah.form);
											        				data_post.idrapbdrkaaktivitas = '';
											        				data_post.idrapbdrkasubkegiatan = form.find('input[name="idrapbdrkasubkegiatan"]').val();
											        				data_post.jn_asb = 0;
											        				data_post.jn_rkud = 0;
											        				data_post.status_luncuran = 0;
											        				data_post.idasb = 0;
											        				data_post.idpptk = '';
											        				data_post.volume1 = 1;
											        				data_post.volume2 = 0;
											        				data_post.status_pelaksanaan = 4;
											        				var url_simpan = form.attr('action');
											        				relayAjax({
																		url: url_simpan,
																		type: "post",
															            data: data_post,
															            success: function(res){
															            	resolve_reduce2(nextData2);
															            },
															            error: function(e){
															            	console.log('Error save aktivitas!', e, this.data);
															            }
																	});
											        			}
											        		});
														}else{
															console.log('Ativitas sudah ada', current_aktivitas.uraian, sub_kegiatan_fmis.uraian);
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
								        }, Promise.resolve(aktivitas_sipd[last2]))
								        .then(function(data_last){
								        	get_list_aktivitas(sub_kegiatan_fmis)
											.then(function(aktivitas_exist){
												aktivitas_exist.data.map(function(b, i){
													b.sub_kegiatan_fmis = sub_kegiatan_fmis;
													aktivitas_exist_global.push(b);
												});
								        		resolve_reduce(nextData);
								        	});
								        });
								    });
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
		        }, Promise.resolve(sub_kegiatan_exist_global[last]))
		        .then(function(data_last){
		        	resolve();
		        });
			});
		}
	})
	// cek insert rincian
	.then(function(){
		if(lingkup_rka_global == 2){
			return Promise.resolve();
		}else{
			return new Promise(function(resolve, reject){
				var last = aktivitas_exist_global.length - 1;
				aktivitas_exist_global.reduce(function(sequence, nextData){
		            return sequence.then(function(aktivitas_fmis){
		        		return new Promise(function(resolve_reduce, reject_reduce){
	        				var jenis_program = aktivitas_fmis.sub_kegiatan_fmis.kegiatan_fmis.program_fmis.jns_program;
	        				var nama_jenis_program = get_nama_jenis_program(jenis_program);
							console.log('cek dan insert RKA '+nama_jenis_program, aktivitas_fmis, data_sipd);
		        			get_rka_aktivitas(aktivitas_fmis)
							.then(function(rka){
								// inisiasi form tambah rka fmis dalam aktivitas yang dipilih
								if(rka.form_tambah_rka){
									aktivitas_fmis.form_tambah_rka = rka.form_tambah_rka;
								}

								// inisiasi data rincian unik sipd
								var rka_sipd = [];
								var rka_unik = {};
								data_sipd.data.map(function(b, i){
									// jika pembiayaan penerimaan
							        if(
										jenis_apbd_global == 3 
				        				&& jenis_program == 2
				        				&& b.type != 'penerimaan'
			        				){
							        	return;
									// jika pembiayaan pengeluaran
							        }else if(
							        	jenis_apbd_global == 3 
				        				&& jenis_program == 3
				        				&& b.type != 'pengeluaran'
							        ){
							        	return;
							        }
									var nama_aktivitas = b.nama_akun+' | '+b.nama_skpd;
									if(nama_aktivitas == aktivitas_fmis.uraian){
										b.sumber_dana = [{
											nama_dana: '[] - '+b.nama_akun
										}];
										rka_sipd.push(b);
			        				}
			        				// var nama_rincian = replace_string(b.total+' Rupiah '+b.uraian, false, false).substring(0, 500).trim();
			        				// var nama_unik_rincian = nama_rincian+b.kode_akun;
		        					// if(!rka_unik[nama_unik_rincian]){
		        					// 	rka_unik[nama_unik_rincian] = {
		        					// 		jml_sipd: 1,
		        					// 		jml_fmis: 0
		        					// 	};
		        					// }else{
		        					// 	rka_unik[nama_unik_rincian].jml_sipd++;
		        					// }
			        				var nama_rincian_baru = replace_string(b.total+' Rupiah '+b.uraian+' | '+b.keterangan, false, false).substring(0, 500).trim();
		        					var nama_rincian_unik_baru = nama_rincian_baru+b.kode_akun;
		        					if(!rka_unik[nama_rincian_unik_baru]){
		        						rka_unik[nama_rincian_unik_baru] = {
		        							jml_sipd: 1,
		        							jml_fmis: 0
		        						};
		        					}else{
		        						rka_unik[nama_rincian_unik_baru].jml_sipd++;
		        					}
								});

								// inisiasi data rincian unik fmis
								var data_rka = rka.data;
								data_rka.map(function(b, i){
									var uraian_belanja = replace_string(b.uraian_belanja, false, false);
									var uraian_belanja_unik = uraian_belanja+b.kode_rekening;
									if(!rka_unik[uraian_belanja_unik]){
		        						rka_unik[uraian_belanja_unik] = {
		        							jml_sipd: 0,
		        							jml_fmis: 1
		        						};
		        					}else{
		        						rka_unik[uraian_belanja_unik].jml_fmis++;
		        					}
								});
								console.log('rka_unik', rka_unik);

								if(rka_sipd.length >= 1){
									console.log('Insert RKA untuk aktivitas = '+aktivitas_fmis.uraian, aktivitas_fmis, rka_sipd);
									var last = rka_sipd.length - 1;
									var kdurut = 0;
									rka_sipd.reduce(function(sequence2, nextData2){
							            return sequence2.then(function(current_data){
							        		return new Promise(function(resolve_reduce2, reject_reduce2){
					        					var nama_rincian = replace_string(current_data.total+' Rupiah '+current_data.uraian, false, false).substring(0, 500).trim();
					        					var nama_rincian_unik = nama_rincian+current_data.kode_akun;
					        					var nama_rincian_baru = replace_string(current_data.total+' Rupiah '+current_data.uraian+' | '+current_data.keterangan, false, false).substring(0, 500).trim();
					        					var nama_rincian_unik_baru = nama_rincian_baru+current_data.kode_akun;
					        					var cek_exist = false;
					        					var cek_exist_update = false;
												data_rka.map(function(b, i){
													var uraian_belanja = replace_string(b.uraian_belanja, false, false);
													var uraian_belanja_unik = uraian_belanja+b.kode_rekening;
													// cek jika nama unik sudah terinsert atau belum
													if(uraian_belanja_unik == nama_rincian_unik){
														// cek jika jumlah rincian unik fmis sudah sama dengan jumlah rincian sipd
														if(rka_unik[uraian_belanja_unik].jml_fmis >= rka_unik[uraian_belanja_unik].jml_sipd){
															cek_exist = b;
															cek_exist_update = b;
														}else{
															rka_unik[uraian_belanja_unik].jml_fmis++;
														}
													}else if(uraian_belanja_unik == nama_rincian_unik_baru){
														if(rka_unik[uraian_belanja_unik].jml_fmis >= rka_unik[uraian_belanja_unik].jml_sipd){
															cek_exist = b;
															// cek jika jumlah total tidak sama maka perlu diupdate volumenya
															if(+current_data.total != to_number(b.jumlah)){
																cek_exist_update = b;
															}
														}else{
															rka_unik[uraian_belanja_unik].jml_fmis++;
														}
													}
													if(kdurut <= +b.kdurut){
														kdurut = +b.kdurut;
													}
												});
												var nama_rincian_asli = replace_string(current_data.total+' Rupiah '+current_data.uraian+' | '+current_data.keterangan, true, false).substring(0, 500).trim();
												if(!cek_exist){
													current_data.nama_rincian = nama_rincian;
													current_data.nama_komponen = current_data.uraian;
													current_data.spek_komponen = current_data.keterangan;
													current_data.harga_satuan = current_data.total;
													current_data.satuan = 'Rupiah';
													get_id_ssh_rka(current_data, aktivitas_fmis)
													.then(function(ssh){
														if(ssh){
															kdurut++;
															if(
																ssh.harga == '0.00'
																|| ssh.harga == '.00'
																|| ssh.harga == '0,00'
																|| ssh.harga == ',00'
															){
																console.log('Harga SSH 0, skip insert!', ssh);
																return resolve_reduce2(nextData2);
															}
									        				var data_post = {
									        					_token: _token,
									        					idsumberdana : aktivitas_fmis.idsumberdana1,
									        					kdurut : kdurut,
									        					idssh_4 : ssh.idssh_4,
									        					kdrek1 : ssh.kdrek1,
									        					kdrek2 : ssh.kdrek2,
									        					kdrek3 : ssh.kdrek3,
									        					kdrek4 : ssh.kdrek4,
									        					kdrek5 : ssh.kdrek5,
									        					kdrek6 : ssh.kdrek6,
									        					uraian_belanja : nama_rincian_asli,
									        					idsatuan1 : ssh.idsatuan,
									        					volume_1 : 1,
									        					idsatuan2 : '',
									        					volume_2 : '',
									        					idsatuan3 : '',
									        					volume_3 : '',
									        					harga : replace_number(ssh.harga),
									        				}
									        				pesan_loading('SIMPAN '+nama_jenis_program+' RINCIAN "'+ssh.uraian+'" AKTIVITAS "'+aktivitas_fmis.uraian+'"', true);
								        					var form = jQuery(aktivitas_fmis.form_tambah_rka);
								        					data_post.idrapbdrkabelanja = '';
								        					data_post.idrapbdrkaaktivitas = form.find('input[name="idrapbdrkaaktivitas"]').val();
								        					data_post.uraian = ssh.uraian;
								        					data_post.uraian_rekening = ssh.nama_akun;
								        					data_post.volume_renja1 = 0;
								        					data_post.volume_renja2 = 0;
								        					data_post.volume_renja3 = 0;
								        					data_post.harga_renja = 1;
								        					data_post.jml_volume_renja = 0;
								        					data_post.jumlah_renja = 0;
								        					data_post.volume_2 = 1;
								        					data_post.volume_3 = 1;
								        					data_post.jml_volume = 1;
								        					data_post.jumlah = replace_number(current_data.total);
								        					data_post.status_pelaksanaan = 4;
								        					var url_simpan = form.attr('action');
								        					relayAjax({
																url: url_simpan,
																type: "post",
													            data: data_post,
													            success: function(res){
													            	resolve_reduce2(nextData2);
													            },
													            error: function(e){
													            	console.log('Error save rincian!', e, this.data);
													            }
															});
														}else{
															console.log('item SSH tidak ditemukan ', nama_rincian);
															resolve_reduce2(nextData2);
														}
							        				});
							        			// jika item rincian sudah ada dan perlu diupdate rinciannya
						        				}else if(cek_exist_update){
							        				var data_post = {
							        					_method: 'PUT',
							        					_token: _token,
							        					idsumberdana : cek_exist_update.idsumberdana,
							        					kdurut : cek_exist_update.kdurut,
							        					idssh_4 : cek_exist_update.idssh_4,
							        					kdrek1 : cek_exist_update.kdrek1,
							        					kdrek2 : cek_exist_update.kdrek2,
							        					kdrek3 : cek_exist_update.kdrek3,
							        					kdrek4 : cek_exist_update.kdrek4,
							        					kdrek5 : cek_exist_update.kdrek5,
							        					kdrek6 : cek_exist_update.kdrek6,
							        					uraian_belanja : nama_rincian_asli,
							        					idsatuan1 : cek_exist_update.idsatuan1,
							        					volume_1 : to_number(cek_exist_update.volume_1, true),
							        					idsatuan2 : cek_exist_update.idsatuan2,
							        					volume_2 : to_number(cek_exist_update.volume_2, true),
							        					idsatuan3 : cek_exist_update.idsatuan3,
							        					volume_3 : to_number(cek_exist_update.volume_3, true),
							        					harga : to_number(cek_exist_update.harga, true)
							        				}
						        					var code_rincian = cek_exist_update.action.split('code=')[1].split('"')[0];
						        					relayAjax({
														url: config.fmis_url+'/anggaran/rka-belanja/belanja/form?code='+code_rincian+'&action=edit',
											            success: function(form_edit){
								        					var form = jQuery(form_edit.form);
						        							data_post.idrapbdrkaaktivitas = form.find('input[name="idrapbdrkaaktivitas"]').val();
								        					data_post.uraian = form.find('textarea[name="uraian"]').val();
								        					data_post.idrapbdrkabelanja = form.find('input[name="idrapbdrkabelanja"]').val();
								        					data_post.uraian_rekening = cek_exist_update.rekening_display;
								        					data_post.volume_renja1 = 0;
								        					data_post.volume_renja2 = 0;
								        					data_post.volume_renja3 = 0;
								        					data_post.harga_renja = 1;
								        					data_post.jml_volume_renja = 0;
								        					data_post.jumlah_renja = 0;
								        					data_post.jml_volume = 1;
								        					data_post.status_pelaksanaan = cek_exist_update.status_pelaksanaan;

								        					// data_post.jumlah = to_number(cek_exist_update.jumlah, true);
								        					// update volume dan jumlah sesuai SIPD
								        					data_post.volume_1 = 1;
								        					data_post.jumlah = replace_number(current_data.total);

									        				pesan_loading('UPDATE '+nama_jenis_program+' RINCIAN "'+cek_exist_update.uraian_belanja+'" AKTIVITAS "'+aktivitas_fmis.uraian+'"', true);
								        					var url_simpan = form.attr('action');
								        					relayAjax({
																url: url_simpan,
																type: "post",
													            data: data_post,
													            success: function(res){
													            	resolve_reduce2(nextData2);
													            },
													            error: function(e){
													            	console.log('Error save rincian!', e, this.data);
													            }
															});
											            },
											            error: function(e){
											            	console.log('Error save rincian!', e, this.data);
											            }
													});
						        				}else{
						        					console.log('Item belanja "'+nama_rincian+'" sudah ada!');
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
										var rka_unik_fmis = {};
							        	data_rka.map(function(b, i){
							        		var uraian_belanja = replace_string(b.uraian_belanja, false, false);
							        		var uraian_belanja_unik = uraian_belanja+b.kode_rekening;
											if(!rka_unik_fmis[uraian_belanja_unik]){
												rka_unik_fmis[uraian_belanja_unik] = [];
											}
											rka_unik_fmis[uraian_belanja_unik].push(b);
										});
							        	var kosongkan_rincian = [];
							        	for(var nama_rincian_unik in rka_unik){
							        		var selisih = rka_unik[nama_rincian_unik].jml_fmis - rka_unik[nama_rincian_unik].jml_sipd;
							        		// cek jika ada rincian yang ada di fmis dan tidak ada di sipd. bisa karena diinput manual atau karena rincian di sipd dihapus. rincian ini perlu di nolkan agar pagu sub kegiatannya sama dengan sipd
							        		if(selisih >= 1){
							        			rka_unik_fmis[nama_rincian_unik].map(function(b, i){
													if(i < selisih){
														if(to_number(b.jml_volume) > 0){
															kosongkan_rincian.push(b);
														}
														rka_unik[nama_rincian_unik].jml_sipd++;
													}
												});
							        		}
							        	}
							        	console.log('kosongkan_rincian', kosongkan_rincian);
							        	var last = kosongkan_rincian.length - 1;
							        	kosongkan_rincian.reduce(function(sequence2, nextData2){
								            return sequence2.then(function(cek_exist_update){
								        		return new Promise(function(resolve_reduce2, reject_reduce2){
								        			cek_exist_update.volume_1 = replace_number('0');
							    					cek_exist_update.jml_volume = replace_number('0');
							    					cek_exist_update.jumlah = replace_number('0');
							    					var data_post = {
							        					_method: 'PUT',
							        					_token: _token,
							        					idsumberdana : cek_exist_update.idsumberdana,
							        					kdurut : cek_exist_update.kdurut,
							        					idssh_4 : cek_exist_update.idssh_4,
							        					kdrek1 : cek_exist_update.kdrek1,
							        					kdrek2 : cek_exist_update.kdrek2,
							        					kdrek3 : cek_exist_update.kdrek3,
							        					kdrek4 : cek_exist_update.kdrek4,
							        					kdrek5 : cek_exist_update.kdrek5,
							        					kdrek6 : cek_exist_update.kdrek6,
							        					uraian_belanja : replace_string(cek_exist_update.uraian_belanja, true, true, true),
							        					idsatuan1 : cek_exist_update.idsatuan1,
							        					volume_1 : to_number(cek_exist_update.volume_1, true),
							        					idsatuan2 : cek_exist_update.idsatuan2,
							        					volume_2 : to_number(cek_exist_update.volume_2, true),
							        					idsatuan3 : cek_exist_update.idsatuan3,
							        					volume_3 : to_number(cek_exist_update.volume_3, true),
							        					harga : to_number(cek_exist_update.harga, true),
							        					jumlah : to_number(cek_exist_update.jumlah, true),
							        					jml_volume : to_number(cek_exist_update.jml_volume, true)
							        				}
							    					var code_rincian = cek_exist_update.action.split('code=')[1].split('"')[0];
							    					relayAjax({
														url: config.fmis_url+'/anggaran/rka-belanja/belanja/form?code='+code_rincian+'&action=edit',
											            success: function(form_edit){
								        					var form = jQuery(form_edit.form);
							    							data_post.idrapbdrkaaktivitas = form.find('input[name="idrapbdrkaaktivitas"]').val();
								        					data_post.uraian = form.find('textarea[name="uraian"]').val();
								        					data_post.idrapbdrkabelanja = form.find('input[name="idrapbdrkabelanja"]').val();
								        					data_post.uraian_rekening = cek_exist_update.rekening_display;
								        					data_post.volume_renja1 = 0;
								        					data_post.volume_renja2 = 0;
								        					data_post.volume_renja3 = 0;
								        					data_post.harga_renja = 1;
								        					data_post.jml_volume_renja = 0;
								        					data_post.jumlah_renja = 0;
								        					data_post.status_pelaksanaan = cek_exist_update.status_pelaksanaan;
									        				pesan_loading('UPDATE '+nama_jenis_program+' RINCIAN "'+cek_exist_update.uraian_belanja+'" AKTIVITAS "'+aktivitas_fmis.uraian+'"', true);
								        					var url_simpan = form.attr('action');
								        					relayAjax({
																url: url_simpan,
																type: "post",
													            data: data_post,
													            success: function(res){
													            	resolve_reduce2(nextData2);
													            },
													            error: function(e){
													            	console.log('Error save rincian!', e, this.data);
													            }
															});
											            },
											            error: function(e){
											            	console.log('Error save rincian!', e, this.data);
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
								        }, Promise.resolve(kosongkan_rincian[last]))
								        .then(function(data_last2){
							        		resolve_reduce(nextData);
							        	});
							        });
							    }else{
							    	pesan_loading('RKA untuk '+nama_jenis_program+' aktivitas = '+aktivitas_fmis.uraian+' tidak ditemukan!');
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
		        }, Promise.resolve(aktivitas_exist_global[last]))
		        .then(function(data_last){
		        	resolve();
		        });
		    });
		}
	})
	// cek apakah perlu update pagu sub kegiatan sesuai pagu rincian
	.then(function(){
		return new Promise(function(resolve, reject){
			if(
	    		typeof pagu_sub_keg_global != 'undefined'
	    		&& pagu_sub_keg_global == 1
	    	){
				var last = kegiatan_exist_global.length - 1;
				kegiatan_exist_global.reduce(function(sequence, nextData){
		            return sequence.then(function(kegiatan){
		        		return new Promise(function(resolve_reduce, reject_reduce){
							update_pagu_sub_from_rincian(kegiatan)
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
		        }, Promise.resolve(kegiatan_exist_global[last]))
		        .then(function(data_last){
		        	resolve();
		        });
			}else{
				resolve();
			}
		});
	})
	.then(function(){
		return lanjut_singkron_rka_all_skpd(nextData_all_skpd);
	});
}

function update_pagu_sub_from_rincian(kegiatan, cek_sub_kegiatan = false){
	if(cek_sub_kegiatan){
		console.log('cek_sub_kegiatan filter update_pagu_sub_from_rincian', cek_sub_kegiatan);
	}
	return new Promise(function(resolve, reject){
		get_list_sub_kegiatan(kegiatan)
		.then(function(sub_kegiatan_exist){
			var last = sub_kegiatan_exist.data.length - 1;
			sub_kegiatan_exist.data.reduce(function(sequence, nextData){
	            return sequence.then(function(sub_keg_fmis){
	        		return new Promise(function(resolve_reduce, reject_reduce){
	        			if(cek_sub_kegiatan[sub_keg_fmis.uraian.trim().toLowerCase()]){
		        			get_list_aktivitas(sub_keg_fmis)
							.then(function(aktivitas_exist){
								kirim_data_rka_ke_lokal(aktivitas_exist, sub_keg_fmis)
								.then(function(){
									resolve_reduce(nextData);
								});
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
	        }, Promise.resolve(sub_kegiatan_exist.data[last]))
	        .then(function(data_last){
    			resolve();
    		});
	    });
	})
}

function save_program(url, data_post){
	return new Promise(function(resolve2, reject2){
		relayAjax({
			url: url,
			type: "post",
	        data: data_post,
	        success: function(res){
	        	resolve2();
	        },
	        error: function(e){
	        	console.log('Error save program!', e, this.data);
	        }
		});
	});
}

function get_rincian_kas(code_aktivitas){
	pesan_loading('GET rincian Kas', true);
	return new Promise(function(resolve, reject){
		var url = config.fmis_url+'/anggaran/rka-renkas/rincian/datatable?code='+code_aktivitas;
		relayAjax({
			url: url,
	        success: function(res){
	        	resolve(res.data);
	        }
	    });
	});
}

function delete_kas(aktivitas){
	show_loading();
	var last = aktivitas.length - 1;
	aktivitas.reduce(function(sequence, nextData){
        return sequence.then(function(code_aktivitas){
        	return new Promise(function(resolve_reduce, reject_reduce){
				get_rincian_kas(code_aktivitas)
				.then(function(data){
					var last2 = data.length - 1;
					data.reduce(function(sequence2, nextData2){
				        return sequence2.then(function(rincian){
				        	return new Promise(function(resolve_reduce2, reject_reduce2){
				        		var url_form_delete = jQuery(rincian.action).find('a[data-action="delete"]').attr('href')+'&action=delete';
				        		relayAjax({
									url: url_form_delete,
							        success: function(res){
							        	var url_delete = jQuery(res.form).attr('action');
							        	pesan_loading('Hapus rincian kas '+rincian.rekening_display, true);
							    		relayAjax({
											url: url_delete,
											type: 'post',
											data: {
												_token: _token,
												_method: 'DELETE'
											},
									        success: function(res){
									        	resolve_reduce2(nextData2);
									        }
									    });
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
				    }, Promise.resolve(data[last2]))
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
    }, Promise.resolve(aktivitas[last]))
    .then(function(data_last){
    	run_script('data_table_renstra_dokumen');
    	hide_loading();
    	alert('Berhasil hapus data anggaran kas!');
	});
}