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
// Source: https://weeknumber.net/how-to/javascript

// Returns the ISO week of the date.
Date.prototype.getWeek = function() {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}
function getScheduleFromInternet() {
    var date = new Date();
    var week = date.getWeek();
    $.get("https://dl.dropboxusercontent.com/u/28737407/" + week + "schedule.json", function(data,err,obj){
        if(obj.status !== 200) {
            console.error(err)
            console.error(a.status)
            ukNotify(errr + '\n Error downloading the weekly schedule', 0);
            return;
        }
        if(obj.status === 200){
            var schedule = JSON.parse(data);
            localStorage.setItem('netWeekdayTalks',JSON.stringify(schedule.weekdayTalks));
            localStorage.setItem('weekdaySongs',JSON.stringify(schedule.weekdaySongs));
            localStorage.setItem('weekendSongs',JSON.stringify(schedule.weekendSongs));
            var dateobj = new Date();
            var date = dateobj.getDate();
            localStorage.setItem('internetSourceUpdate',date);
            //window.location.reload();
            chrome.runtime.reload();
            return;
        }

    }).fail(function(){
        ukNotify('Error downloading the weekly schedule', 0);
    });
}
function showModal(txt) {
    var $modal = $("#modal");
    $modal.find("#modalContent").html(txt)
    $('body').append('<a href="#modal" id="tempHref" data-uk-modal></a>').find('#tempHref').trigger('click');
}

function getVersion() {
    $.get('https://dl.dropboxusercontent.com/u/28737407/version', function(data){
        if(data.trim() != localStorage.getItem('version')) {
            showModal('<h3>' + lang['new_version_available'] + '</h3> <br/> <a href="http://sica07.github.io/khtime/update.html" class="uk-button">' + lang['update_to_version'] + ' ' + data.trim() + '</a>');
        }
    });
}
