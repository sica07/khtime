nw.Screen.Init();
var screens = nw.Screen.screens;

var DisplaySelectorView = Backbone.View.extend({
    el: '.uk-nav.uk-nav-dropdown.display_selectors',
    render: function(){
        var tpl;
        for(var i = 1; i <= screens.length; i++) {
            tpl = _.template($('#displayListItem').html())({id: i, text: lang.activate_on_display_nr});
            this.$el.append(tpl);
        }

        return this;
    }
});


$("document").ready(function() {
    var displaySelectorsView = new DisplaySelectorView();
    displaySelectorsView.render();
    $("#avi_src_selector").on('change', function(evt){
        var srcDir = evt.currentTarget.files[0];
        var fileURL = URL.createObjectURL(srcDir);
        localStorage.setItem('aviFolder',srcDir.path);
    });
    $("#songs_src_selector").on('change', function(evt){
        var srcDir = evt.currentTarget.files[0];
        var fileURL = URL.createObjectURL(srcDir);
        localStorage.setItem('musicFolder',srcDir.path);
    });
    var hrefSongs, hrefNewSongs = '';
    switch(localStorage.getItem("songLanguage") ) {
        case 'M':
            hrefSongs = "https://download-a.akamaihd.net/files/media_music/3d/iasnm_M.mp3.zip";
            hrefNewSongs = "https://download-a.akamaihd.net/files/media_music/29/ssnw_M.mp3.zip";
        default:
            hrefSongs = "https://download-a.akamaihd.net/files/media_music/7f/sjjm_E.mp3.zip";
    }
    $("#download_songs").attr("href", hrefSongs);
    $("#download_new_songs").attr("href", hrefNewSongs);
    addTranslatedStrings();
    /*********************Displays**********************/
    var premeetingDisplay = localStorage.getItem('premeetingDisplay');
    var timerDisplay = localStorage.getItem('timerDisplay');
    var videoDisplay = localStorage.getItem('videoDisplay');
    var premeetingActive = document.getElementById("premeeting-display-nr");
    var timerActive = document.getElementById("timer-display-nr");
    var videoActive = document.getElementById("video-display-nr");

    if(premeetingDisplay) {
        premeetingActive.textContent = ' ['+premeetingDisplay+']';
    }

    if(timerDisplay) {
        timerActive.textContent = ' ['+timerDisplay+']';
    }

    if(videoDisplay) {
        videoActive.textContent = ' ['+videoDisplay+']';
    }

    $("#premeeting-display").on('click', function(evt){
        var val = evt.target.hash.split("#");
        if(val[1]) {
            localStorage.setItem('premeetingDisplay', val[1])
            premeetingActive.textContent = ' [' + val[1] +']';
        }
    });
    $("#timer-display").on('click', function(evt){
        var val = evt.target.hash.split("#");
        if(val[1]) {
            localStorage.setItem('timerDisplay', val[1])
            timerActive.textContent = ' [' + val[1] + ']';
        }
    });
    $("#video-display").on('click', function(evt){
        var val = evt.target.hash.split("#");
        if(val[1]) {
            localStorage.setItem('videoDisplay', val[1])
            videoActive.textContent = ' [' + val[1] + ']';
        }
    });

    /*** Internet source ***/
    $isrc = $("#internet_source");
    $isrc.toggles();
    console.log($isrc.data('toggles'))
    $isrc.click(function(){
        if($(this).data('toggles').active) {
            localStorage.setItem('internetSource', 'true')
        } else {
            localStorage.setItem('internetSource', 0)
        }
    });
    if(localStorage.getItem('internetSource') == 'true') {
        $isrc.toggles(true);
    } else {
        $isrc.toggles(false);
    }
    /*** end if Internet source***/
});
function ukNotify(text, type) {
    var html = '';
    if(type === 0) {
        html += '<div class="uk-alert uk-alert-danger notify-box">';
    }
    if(type === 1) {
        html += '<div class="uk-alert uk-alert-success notify-box">';
    }
    html += ' <a href="" class="uk-alert-close uk-close"></a>';
    html += '<p>' + text + '</p>';
    html += '</div>';
    $('body').append($(html));
    setTimeout(function() {
        $('.notify-box').remove();
    }, 4000);
}
function addTranslatedStrings() {
    $(".lang_weekday_meeting").text(lang['weekday_meeting']);
    $(".lang_weekend_meeting").text(lang['weekend_meeting']);
    $(".lang_settings").text(lang['settings']);
    $(".lang_disabled").text(lang['disabled']);
    $(".lang_title").text(lang['title']);
    $(".lang_duration").text(lang['duration']);
    $(".lang_flexible").text(lang['flexible']);
    $(".lang_invisible").text(lang['invisible']);
    $(".lang_save").text(lang['save']);
    $(".lang_reset").text(lang['reset']);
    $(".lang_settings").text(lang['settings']);
    $(".lang_internet_source").text(lang['internet_source']);
    $(".lang_avi_source").text(lang['avi_source']);
    $(".lang_songs_source").text(lang['songs_source']);
    $(".lang_download_songs").text(lang['download_songs']);
    $(".lang_download_avi").text(lang['download_avi']);
    $(".lang_download").text(lang['download']);
    $(".lang_displays").text(lang['displays']);
    $('.lang_select_display_for_prelude').text(lang['select_display_for_prelude']);
    $('.lang_deactivate_prelude_display' ).text(lang['deactivate_prelude_display']);
    $('.lang_select_display_for_timer' ).text(lang['select_display_for_timer']);
    $('.lang_deactivate_video_display' ).text(lang['deactivate_video_display']);
    $('.lang_deactivate_timer_display' ).text(lang['deactivate_timer_display']);
    $('.lang_select_display_for_video' ).text(lang['select_display_for_video']);
}
