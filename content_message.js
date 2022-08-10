window.addEventListener('message', function(event) {
	var command = event.data.command;
	console.log('run_script', event.data);
	switch(command) {
    	case 'window.data_ssh':
			window.data_ssh = event.data.data; console.log(data_ssh);
			break;
    	case 'data_table_golongan':
    		initDatatable('golongan');
			break;
    	case 'data_table_item':
    		initDatatable('item');
			break;
    	case 'data_table_subkelompok':
    		initDatatable('subkelompok');
			break;
    	case 'data_table_kelompok':
    		initDatatable('kelompok');
			break;
    	case 'data_table_rekening':
    		initDatatable('rekening');
			break;
    	case 'data_table_2':
    		initUnitTable('2');
			break;
    	case 'custom_dt_bidur_skpd':
    		jQuery("#konfirmasi-bidur-skpd").DataTable().destroy();
			jQuery('#konfirmasi-bidur-skpd tbody').html(event.data.data);
			jQuery("#konfirmasi-bidur-skpd").DataTable({lengthMenu: [[20, 50, 100, -1], [20, 50, 100, "All"]], "columnDefs": [{ "orderable": false, "targets": 0 } ]});
			jQuery("#mod-konfirmasi-bidur-skpd").modal("show");
			break;
    	case 'bidur_skpd_hide':
    		jQuery("#mod-konfirmasi-bidur-skpd").modal("hide");
			break;
    	case 'bidur_skpd_destroy':
    		jQuery("#konfirmasi-bidur-skpd").DataTable().destroy();
			break;
    	case 'bidur_skpd_show':
    		jQuery("#konfirmasi-bidur-skpd").DataTable({lengthMenu: [[20, 50, 100, -1], [20, 50, 100, "All"]]});
    		jQuery("#mod-konfirmasi-bidur-skpd").modal("show");
			break;
    	case 'data_table_rpjmd':
    		initRpjmdTableDetail('program-urbid', 'table-program-urbid', event.data.data);
			break;
    	case 'program_destroy':
    		jQuery("#konfirmasi-program").DataTable().destroy();
			break;
    	case 'custom_dt_program':
    		jQuery("#konfirmasi-program").DataTable({lengthMenu: [[20, 50, 100, -1], [20, 50, 100, "All"]], "columnDefs": [{ "orderable": false, "targets": 0 } ]});
    		jQuery("#mod-konfirmasi-program").modal("show");
			break;
    	case 'program_hide':
    		jQuery("#mod-konfirmasi-program").modal("hide");
			break;
    	case 'data_table_renstra_program':
    		initRenstraTable('program');
			break;
    	case 'data_table_renstra_dokumen':
    		initRenstraTable('dokumen');
			break;
    	case 'data_table_renja_program':
    		tableProgram.ajax.reload(null, false);
			break;
    	case 'custom_dt_skpd':
    		jQuery("#konfirmasi-skpd").DataTable().destroy();
			jQuery('#konfirmasi-skpd tbody').html(event.data.data);
			jQuery("#konfirmasi-skpd").DataTable({lengthMenu: [[20, 50, 100, -1], [20, 50, 100, "All"]], "columnDefs": [{ "orderable": false, "targets": 0 } ]});
			jQuery("#mod-konfirmasi").modal("show");
			break;
    	case 'custom_dt_skpd_hide':
    		jQuery("#mod-konfirmasi").modal("hide");
			break;
    	case 'reload_spd':
    		tableDokumen.ajax.reload(null, false);
			break;
    	case 'reload_tagihan':
    		tableTagihan.ajax.reload(null, false);
			break;
    	case 'reload_kontrak':
    		tableKontrak.ajax.reload(null, false);
			break;
	}
});