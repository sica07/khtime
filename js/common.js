function ukNotify(text, type) {
	var html = '';
	if(type === 0) {
		html += '<div class="uk-alert uk-alert-danger notify-box">';
	}
	if(type === 1) {
		html += '<div class="uk-alert uk-alert-success notify-box">';
	}
	html += ' <a href="#" class="uk-alert-close uk-close"></a>';
	html += '<p>' + text + '</p>';
	html += '</div>';
	$('body').append($(html));

        $('.notify-box').find('.uk-close').click(function(){
            $('.notify-box').remove();
        });

	setTimeout(function() {
		$('.notify-box').remove();
	}, 4000);
}
