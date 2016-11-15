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
    if(localStorage.getItem('internetSource') == 'true' && !sessionStorage.getItem('internetSource')) {
        getScheduleFromInternet();
    }
function getScheduleFromInternet() {
 $.get("https://dl.dropboxusercontent.com/u/28737407/schedule.json", function(data,err,obj){
    if(obj.status !== 200) {
        console.error(err)
        console.error(a.status)
        ukNotify(errr + '\n Error downloading the weekly schedule', 0);
        return;
    }
    var schedule = JSON.parse(data);
    localStorage.setItem('weekendTalks',JSON.stringify(schedule.weekendTalks));
    localStorage.setItem('weekdayTalks',JSON.stringify(schedule.weekdayTalks));
    window.location.reload();
     sessionStorage.setItem('internetSource',true);

}).fail(function(){
    ukNotify('Error downloading the weekly schedule', 0);
});
}

