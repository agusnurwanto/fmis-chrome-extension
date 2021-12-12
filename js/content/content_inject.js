jQuery(document).on('show.bs.modal', '#modal', function(event) { 
	var title = jQuery(event.relatedTarget).attr('title');
	if(title == 'Tambah Data Tarif Item'){
		var btn = ''
		+'<button type="button" class="btn btn-outline-danger btn-sm btn-add" style="margin-left: 3px;" id="singkron-tarif-ssh-sipd">'
	        +'<i class="fa fa-cloud-upload-alt fa-fw"></i> Singkronisasi Tarif SSH SIPD'
	    +'</button>';
	    setTimeout(function(){
	    	jQuery('#modal .modal-title').html('<span>'+title+'</span>'+btn);
	    }, 500);
	}
});