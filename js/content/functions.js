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

function run_script(code){
	var script = document.createElement('script');
	script.appendChild(document.createTextNode(code));
	(document.head||document.documentElement).appendChild(script);
	script.parentNode.removeChild(script);
}

function capitalizeFirstLetter(string) {
  	return string.charAt(0).toUpperCase() + string.slice(1);
}

function relayAjax(options, retries=20, delay=10000, timeout=90000){
	options.timeout = timeout;
	options.cache = false;
    jQuery.ajax(options)
    .fail(function(jqXHR, exception){
    	// console.log('jqXHR, exception', jqXHR, exception);
    	if(
    		jqXHR.status != '0' 
    		&& jqXHR.status != '503'
    	){
    		if(jqXHR.responseJSON){
    			options.success(jqXHR.responseJSON);
    		}else{
    			options.success(jqXHR.responseText);
    		}
    	}else if (retries > 0) {
            console.log('Koneksi error. Coba lagi '+retries);
            setTimeout(function(){ 
                relayAjax(options, --retries, delay, timeout);
            },delay);
        } else {
            alert('Capek. Sudah dicoba berkali-kali error terus. Maaf, berhenti mencoba.');
        }
    });
}

function singkronisasi_ssh(options){
	if(options.status == 'error'){
		alert(options.message);
		jQuery('#wrap-loading').hide();
	}else{
		getSatuan({ force: 1 });
		var data_ssh = {};
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
			}
			if(!data_ssh[golongan].data[kelompok]){
				data_ssh[golongan].data[kelompok] = {
					nama: kelompok,
					jenis: b.kelompok,
					data: {}
				}
			}
			if(!data_ssh[golongan].data[kelompok].data[sub_kelompok]){
				data_ssh[golongan].data[kelompok].data[sub_kelompok] = {
					nama: sub_kelompok+' '+b.nama_kel_standar_harga,
					jenis: b.kelompok,
					data: {}
				}
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
						if(jns_golongan == 1){
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
					var last = data_all.length - 1;
					data_all.reduce(function(sequence, nextData){
	                    return sequence.then(function(current_data){
	                		return new Promise(function(resolve_reduce, reject_reduce){
			                	current_data.success = function(data){
									return resolve_reduce(nextData);
								};
								current_data.error = function(e) {
									console.log(e);
									return resolve_reduce(nextData);
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

function singkronisasi_ssh_tarif(data_ssh){
	var url_save_form = jQuery('#form').attr('action');
	var form_code = url_save_form.split('/save/')[1];
	var idssh_fmis = jQuery('#form .form-referensi > label').attr('for');
	relayAjax({
		url: config.fmis_url+'/parameter/ssh/perkada-ssh/datatable-ref?code='+form_code+'&action=add',
		success: function(items){
			var all_ssh = {};
			data_ssh.map(function(b, i){
				var uraian_item = b.kode_standar_harga+' '+b.id_standar_harga+' '+b.nama_standar_harga;
				all_ssh[uraian_item] = b;
			});
			var data_post = {
                _token: _token,
                _method: 'PUT',
                nilai: {}
            };
            data_post[idssh_fmis] = {};
			items.data.map(function(b, i){
				if(all_ssh[b.uraian]){
					var id_fmis = b.nilai.split('idperkadatarif[')[1].split(']')[0];
					data_post.nilai[id_fmis] = all_ssh[b.uraian].harga;
					data_post[idssh_fmis][id_fmis] = id_fmis;
				}
			});
			// return console.log('data_post', data_post);
			relayAjax({
				url: url_save_form,
				type: "post",
	            data: data_post,
				success: function(items){
					jQuery('#modal .btn.btn-secondary.ml-1').click();
					alert('Berhasil singkroniasi tarif SSH!');
					jQuery('#wrap-loading').hide();
				}
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
				var last = data_all.length - 1;
				data_all.reduce(function(sequence, nextData){
	                return sequence.then(function(current_data){
	            		return new Promise(function(resolve_reduce, reject_reduce){
		                	current_data.success = function(data){
								return resolve_reduce(nextData);
							};
							current_data.error = function(e) {
								console.log(e);
								return resolve_reduce(nextData);
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
        		jQuery('#wrap-loading').hide();
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
										var _kelompok_id = this.url.split('&kelompok_id=')[1];
										var no_urut_subkelompok = 0;
										for(var subkelompok_id in data_ssh[__gol_id].data[_kelompok_id].data){
											var nama_subkelompok = data_ssh[__gol_id].data[_kelompok_id].data[subkelompok_id].nama;
											var cek = false;
											subkelompok.data.map(function(b, i){
												if(b.uraian == nama_subkelompok){
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
							jQuery('#wrap-loading').hide();
					    });
					}
				});
			}));
		}
	}
	Promise.all(sendData)
	.then(function(val_all){
		// console.log('data_all kelompok', data_all);
		var last = data_all.length - 1;
		data_all.reduce(function(sequence, nextData){
            return sequence.then(function(current_data){
        		return new Promise(function(resolve_reduce, reject_reduce){
                	current_data.success = function(data){
						return resolve_reduce(nextData);
					};
					current_data.error = function(e) {
						console.log(e);
						return resolve_reduce(nextData);
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
		jQuery('#wrap-loading').hide();
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
										if(b.uraian == nama_subkelompok){
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
													for(var item_id in data_ssh[__gol_id].data[__kelompok_id].data[__subkelompok_id].data){
														var nama_item = data_ssh[__gol_id].data[__kelompok_id].data[__subkelompok_id].data[item_id].nama;
														var cek = false;
														item.data.map(function(b, i){
															if(b.uraian == nama_item){
																cek = true;
															}
															if(no_urut_item < +b.kdurut){
																no_urut_item = +b.kdurut;
															}
														});
														if(cek == false){
															no_urut_item++;
															var keterangan_item = data_ssh[__gol_id].data[__kelompok_id].data[__subkelompok_id].data[item_id].data.spek;
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
									jQuery('#wrap-loading').hide();
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
		var _leng = 50;
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
        			var sendData = current_data.map(function(ssh, i){
        				return new Promise(function(resolve_reduce2, reject_reduce2){
		                	ssh.success = function(data){
								return resolve_reduce2();
							};
							ssh.error = function(e) {
								console.log(e);
								return resolve_reduce2();
							};
		                	jQuery.ajax(ssh);
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
		jQuery('#wrap-loading').hide();
    });
}
function singkronisasi_ssh_rekening(data_ssh){
	var sendData = [];
	for(var gol_id in data_ssh){
		var nama_golongan = data_ssh[gol_id].nama;
		if(data_ssh[gol_id].code){
			for(var kelompok_id in data_ssh[gol_id].data){
				if(data_ssh[gol_id].data[kelompok_id].code){
					for(var subkelompok_id in data_ssh[gol_id].data[kelompok_id].data){
						if(data_ssh[gol_id].data[kelompok_id].data[subkelompok_id].code){
							sendData.push(new Promise(function(resolve, reject){
								relayAjax({
									url: config.fmis_url+'/parameter/ssh/struktur-ssh/item/datatable?code='+data_ssh[gol_id].data[kelompok_id].data[subkelompok_id].code+'&gol_id='+gol_id+'&kelompok_id='+kelompok_id+'&subkelompok_id='+subkelompok_id,
									success: function(item){
										var _gol_id = this.url.split('&gol_id=')[1].split('&')[0];
										var _kelompok_id = this.url.split('&kelompok_id=')[1].split('&')[0];
										var _subkelompok_id = this.url.split('&subkelompok_id=')[1].split('&')[0];
										var sendDataSub = [];
										for(var item_id in data_ssh[_gol_id].data[_kelompok_id].data[_subkelompok_id].data){
											var nama_item = data_ssh[_gol_id].data[_kelompok_id].data[_subkelompok_id].data[item_id].nama;
											var kode_item = false;
											item.data.map(function(b, i){
												if(b.uraian == nama_item){
													kode_item = b.action.split('code="')[1].split('"')[0];
												}
											});
											if(kode_item != false){
												data_ssh[_gol_id].data[_kelompok_id].data[_subkelompok_id].data[item_id].code = kode_item;
												sendDataSub.push(set_rekening_ssh(data_ssh[_gol_id].data[_kelompok_id].data[_subkelompok_id].data[item_id]));
											}
										}
										Promise.all(sendDataSub)
										.then(function(val_all){
											resolve();
									    })
									    .catch(function(err){
									        console.log('err', err);
											alert('Ada kesalahan sistem!');
											jQuery('#wrap-loading').hide();
									    });
									}
								});
							}));
						}
					}
				}
			}
		}
	}
	Promise.all(sendData)
	.then(function(val_all){
		jQuery('#wrap-loading').hide();
		alert('Berhasil singkron SSH dari SIPD!');
    })
    .catch(function(err){
        console.log('err', err);
		alert('Ada kesalahan sistem!');
		jQuery('#wrap-loading').hide();
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
						data_post.kdrek.push(tahun+'.'+rek_sipd);
					}
				});
				if(data_post.kdrek.length >= 1){
					// get code from generate form
					relayAjax({
						url: config.fmis_url+'/parameter/ssh/struktur-ssh/rekening/form?action=create&code='+options.code,
						success: function(detail_ssh){
							var url_save = detail_ssh.form.split('action=\"')[1].split('\"')[0];
							// simpan rekening baru
							jQuery.ajax({
								url: url_save,
								type: "post",
					            data: data_post,
					            success: function(res){
					            	resolve2();
					            },
					            error: function(e){
					            	console.log(e);
					            	resolve2();
					            }
							});
						}
					});
				}else{
					resolve2();
				}
			}
		});
	});
}

function getTahun(){
	return jQuery('.nav-link button.waves-light.dropdown-toggle strong').text();
}

function getIdSatuan(satuan, force, val_cb){
	satuan = satuan.toLowerCase().trim();
	return new Promise(function(resolve, reject){
		getSatuan({ force: force }).then(function(satuan_fmis){
			var id_satuan = 0;
			satuan_fmis.map(function(b, i){
				var uraian = jQuery('<textarea />').html(b.uraian.toLowerCase().trim()).text();
				if(satuan == uraian){
					id_satuan = b.action.split('data-id=\"')[1].split('"')[0]
				}
			});
			if(id_satuan == 0){
				jQuery.ajax({
					url: config.fmis_url + '/parameter/satuan',
					type: "post",
		            data: {
		                _token: _token,
		                _method: 'POST',
		                uraian: satuan,
		                singkatan: satuan
		            },
					success: function(data){
						getIdSatuan(satuan, 1, val_cb).then(function(val_cb){
							resolve(val_cb);
						});
					},
					error: function(e){
						console.log(e);
						getIdSatuan(satuan, 1, val_cb).then(function(val_cb){
							resolve(val_cb);
						});
					}
				});
			}else{
				val_cb.data.idsatuan = id_satuan;
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
				console.log('Interval session per 60s ke '+no);
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
				jQuery('#wrap-loading').show();
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
							jQuery('#wrap-loading').hide();
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
				jQuery('#wrap-loading').show();
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
							jQuery('#wrap-loading').hide();
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
				jQuery('#wrap-loading').show();
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
							jQuery('#wrap-loading').hide();
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
			jQuery('#wrap-loading').show();
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
						jQuery('#wrap-loading').hide();
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
				jQuery('#wrap-loading').show();
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
							jQuery('#wrap-loading').hide();
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
				jQuery('#wrap-loading').show();
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
							jQuery('#wrap-loading').hide();
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
				jQuery('#wrap-loading').show();
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
							jQuery('#wrap-loading').hide();
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
				jQuery('#wrap-loading').show();
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
							jQuery('#wrap-loading').hide();
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
		jQuery('#wrap-loading').show();
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
					jQuery('#wrap-loading').hide();
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
		jQuery('#wrap-loading').show();
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
			jQuery('#wrap-loading').hide();
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
				jQuery('#wrap-loading').show();
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
												jQuery('#wrap-loading').hide();
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
		jQuery('#wrap-loading').show();
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
			jQuery('#wrap-loading').hide();
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
				jQuery('#wrap-loading').show();
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
							jQuery('#wrap-loading').hide();
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