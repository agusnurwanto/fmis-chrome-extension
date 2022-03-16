var cek = 0;
jQuery(document).on('show.bs.modal', '#modal', function(event) { 
	var title = $(event.relatedTarget).attr('title');
	if(title == 'Tambah Data Tarif Item'){
		var btn = ''
		+'<button type="button" class="btn btn-outline-danger btn-sm btn-add" style="margin-left: 3px;" id="singkron-tarif-ssh-sipd">'
	        +'<i class="fa fa-cloud-upload-alt fa-fw"></i> Singkronisasi Tarif SSH SIPD'
	    +'</button>';
	    setTimeout(function(){
	    	$('#modal .modal-title').html('<span>'+title+'</span>'+btn);
	    }, 500);
	}else if(
		title == 'Tambah Pengguna'
		&& cek == 0
	){
    	setTimeout(function(){
    		cek++;
		    jQuery('body').on('change', '#idsubunit', function(){
		    	var id_mapping = jQuery('#idunit').val()+'.'+jQuery(this).val();
		    	jQuery('label[for="idsubunit"]').html('Sub Unit <span style="color: red;">( ID mapping = '+id_mapping+' )</span>');
		    });
		}, 1000);
    }
});