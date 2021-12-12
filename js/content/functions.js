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

function relayAjax(options, retries=20, delay=30000, timeout=90000){
	options.timeout = timeout;
    jQuery.ajax(options)
    .fail(function(){
        if (retries > 0) {
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
							if(no_urut_golongan < b.kdurut){
								no_urut_golongan = b.kdurut;
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
									return resolve_reduce(current_data);
								};
								current_data.error = function(argument) {
									console.log(e);
									return resolve_reduce(current_data);
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
								var _gol_id = this.url.split('&gol_id=')[1];
								// console.log('gol_id', _gol_id);
								var no_urut_kelompok = 0;
								for(var kelompok_id in data_ssh[_gol_id].data){
									var nama_kelompok = data_ssh[_gol_id].data[kelompok_id].nama;
									var cek = false;
									kelompok.data.map(function(b, i){
										if(b.uraian == nama_kelompok){
											cek = true;
										}
										if(no_urut_kelompok < b.kdurut){
											no_urut_kelompok = b.kdurut;
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
						var _gol_id = this.url.split('&gol_id=')[1];
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
												if(no_urut_subkelompok < b.kdurut){
													no_urut_subkelompok = b.kdurut;
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
															if(no_urut_item < b.kdurut){
																no_urut_item = b.kdurut;
															}
														});
														if(cek == false){
															no_urut_item++;
															var keterangan_item = data_ssh[__gol_id].data[__kelompok_id].data[__subkelompok_id].data[item_id].data.spek;
															var satuan_asli = data_ssh[__gol_id].data[__kelompok_id].data[__subkelompok_id].data[item_id].data.satuan.toLowerCase().trim();
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
        }, Promise.resolve(data_all[last]))
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