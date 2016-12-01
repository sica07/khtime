$("document").ready(function() {
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
}
