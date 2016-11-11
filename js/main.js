nw.Screen.Init();
var screens = nw.Screen.screens;
//var screens = [1,2];
//initialization of localStorage
if(!localStorage.getItem('musicFolder')) {
    localStorage.musicFolder = 'Songs/';
    localStorage.aviFolder = 'Avi/';
    localStorage.playAviSongs = 0;
    localStorage.premeetingDisplay = 2;
    localStorage.timerDisplay = 1;
    localStorage.videoDisplay = 2;
    localStorage.recalculateTime = 0;
    localStorage.songLanguage = 'E';
    localStorage.weekdayTalks = '[]';
    localStorage.weekendTalks = '[]';
}
var talkCountdown = false;
var windowTalkCountdown = false;
var timerWindow = false;
var videoFiles = [];
var videoWindow = false;
/***********Models**************/
var TalkCounterModel = Backbone.Model.extend({
    defaults: {
        talkTitle: lang['no_talk_yet'],
        counter: 0,
        counterOn: false,
        talkDuration: 0,
        percent: 0
    },
    initialize: function(){
        var that = this;
        this.on("change:counterOn", function(){that.start()})
    },
    start: function(){
    }
});
var talkCounterModel = new TalkCounterModel({ });
var MeetingCounterModel = Backbone.Model.extend({
    defaults: {
        meetingCounter: 0,
        debtTime: 0,
        meetingDuration: 6300,
        remained: 0,
        talkId: 0,
        counterOn: false

    },

});
var meetingCounterModel = new MeetingCounterModel({ });
var TalkModel = Backbone.Model.extend({
    defaults: {
        title: lang['default_title'],
        duration: 0,
        spent: 0,
        invisible: false,
        disabled: false,
        flexible: false,
        status: false,
        id: 0
    },
});

/***********Collections*********/
var TalksCollection = Backbone.Collection.extend({
    model: TalkModel,
});

var date = new Date();
var weekday = date.getDay();
var talksmodels = JSON.parse(localStorage.getItem('weekdayTalks'));
if (weekday === 0 || weekday === 6) {
    talksmodels = JSON.parse(localStorage.getItem('weekendTalks'));
    $("#meetingTitleTabsContainer").find('a').addClass('lang_weekday_meeting');
} else {
    $("#meetingTitleTabsContainer").find('a').addClass('lang_weekend_meeting');
}
var talks = new TalksCollection();
talks.add(talksmodels);

/***********Views***************/
var TalkView = Backbone.View.extend({
    class: 'talk-container',
    initialize: function(){
        var that = this;
        this.model.on('change', function(){that.toggleState()});
        this.model.on('durationRecalculated', function(){that.updateSeconds(that.model.get('duration'))});
    },
    render: function() {
        var duration = this.model.get('duration');
        this.model.set('duration_formatted', parseSeconds(duration), {silent: true});
        var tpl = _.template($('#talkContainer').html())(this.model.toJSON())
            this.$el.html(tpl);

        return this;
    },
    updateSeconds: function(seconds) {
        var $time = $('#talk_time_'+this.model.get('id'));
        $time.text(parseSeconds(seconds));
    },
    toggleState: function() {
        var $button = $('#talk_'+this.model.get('id'));
        var $title = $('#talk_title_'+this.model.get('id'));
        var $time = $('#talk_time_'+this.model.get('id'));
        if(this.model.get('status')) {
            $button.removeClass('uk-button-success').addClass('uk-button-danger');
            $button.children('i').removeClass('uk-icon-hourglass-start').addClass('uk-icon-stop-circle');
            $title.addClass('uk-text-success');
            $time.addClass('uk-text-success');
            talkCounterModel.set({talkTitle: this.model.get('title'),talkDuration: this.model.get('duration'), counterOn: true});
        } else {
            var spent = talkCounterModel.get('counter');
            this.model.set('spent', spent, {silent: true})
                $button.removeClass('uk-button-danger');
                //$button.removeClass('uk-button-danger').attr('disabled', true);
            $button.children('i').addClass('uk-icon-check').removeClass('uk-icon-hourglass-start');
            $title.removeClass('uk-text-success').addClass('uk-text-muted');
            if(spent > 0) {
                $time.removeClass('uk-text-success').addClass('uk-text-muted');
            } else {
                $time.removeClass('uk-text-success').addClass('uk-text-warning');
            }
            this.updateSeconds(spent);
            if(localStorage.getItem('	culateTime') != 1) {
                var debtTime = meetingCounterModel.get('debtTime');
                debtTime = debtTime + spent;
                meetingCounterModel.set('debtTime', debtTime);
            }

        }
    }

});

var TalksView = Backbone.View.extend({
    el: '#talks_container',
    events: {
        'click .uk-button' : 'toggleTalkTimer',
        'click .plus_seconds' : 'increaseTime',
        'click .minus_seconds' : 'decreaseTime'
    },
    render: function() {
        var that = this;
        this.collection.each(function(model){
            if(!model.get('disabled') && !model.get('invisible')) {
                var talkView =  new TalkView({model: model});
                talkView = talkView.render()
                    that.$el.append(talkView.$el.html());
                if(localStorage.getItem('recalculateTime') > 0) {
                    $(".plus_seconds").hide();
                    $(".minus_seconds").hide();
                }
            }
        });

        return this;
    },
    increaseTime: function(evt){
        var $el = $(evt.currentTarget);
        this.updateTalkTime($el, '+');
    },
    decreaseTime: function(evt){
        var $el = $(evt.currentTarget);
        this.updateTalkTime($el, '-');
    },
    updateTalkTime: function($el, update){
        var id = $el.parent('div')[0].id;
        id = id.split('talk_time_');
        var model= this.collection.findWhere({id: parseInt(id[1])});
        if(update === '+') {
            model.set('duration', parseInt(model.get('duration')) + 30, {silent: true});
        } else {
            model.set('duration', parseInt(model.get('duration')) - 30, {silent: true});
        }
        $el.siblings(".duration_formatted")[0].innerHTML = parseSeconds(model.get('duration'));

    },
    toggleTalkTimer: function(evt) {
        var id = evt.currentTarget.id;
        id = id.split('_');
        var model= this.collection.findWhere({id: parseInt(id[1])});
        if(!meetingCounterModel.get('counterOn')) {
            ukNotify(lang['start_the_meeting_counter'], 1);
            return;
        }
        if(!model.get('status')) {
            if(talkCounterModel.get('counterOn')) {
                ukNotify(lang['another_talk_is_on!'], 1)
                    return;
            }
            model.set('status', true);
        } else {
            talkCounterModel.set({title: lang['no_talk_yet'], counterOn: false});
            model.set('status', false);
            meetingCounterModel.set('talkId', model.get('id'));
            if(localStorage.getItem('recalculateTime') > 0) {
                calculateRemainingTime(talks);
            }
        }
    }
});

var TalkCounterContainer = Backbone.View.extend({
    el: "#talk_counter_container",
    initialize: function() {
        var that = this;
        this.startingTime = 0;
        this.listenTo(this.model, 'change', function(){that.render()})
    },
    render: function(){
        var tpl = _.template($('#talkCounterContainer').html())(this.model.toJSON())
            if (this.model.get('talkDuration') > 0 && this.model.get('counterOn') === false) {
            } else {
                this.$el.html(tpl);
                this.loadTalkCounter();
            }
        this.start();

        return this;
    },
    loadTalkCounter: function() {
        var that = this;
        talkCountdown = this.$el.find("#talkCounter").countdown360({
            radius: that.$el.width() / 2,
            seconds: that.model.get('talkDuration'),
            fontColor: '#FFFFFF',
            strokeStyle: "#222",          // the color of the stroke
            fillStyle: "#222",            // the fill color
            autostart: false,
            onComplete: function () {
                this.fontColor = '#da314b';
            },
            onTimeUpdate: function(second){
                that.model.set('counter', second, {silent: true});
            }

        });
    },
    start: function() {
        var talkDuration = this.model.get('talkDuration');
        if(talkDuration == 0) {
            return true;
        }
        if(this.model.get('counterOn')) {
            talkCountdown.start()
                this.createCounterWindow(this.model.get('talkDuration'), this.model.get('talkTitle'));
        } else {
            talkCountdown.stop()

                this.model.set('talkDuration', 0, {silent: true});
            if(timerWindow) {
                windowTalkCountdown.stop();
                timerWindow.close();
                timerWindow = false;
            }
        }
    },
    createCounterWindow: function(duration, title){
        var displayNr = localStorage.getItem('timerDisplay') - 1;
        if(displayNr < 0) {
            ukNotify(lang['video_display_disabled'], 1)
        }

        if(!timerWindow) {
            nw.Window.open('timer.html', {x: screens[displayNr].work_area.x + 1, y: screens[displayNr].work_area.y + 1}, function(win){
                win.enterFullscreen();
                win.on('enter-fullscreen',function(win){
                    var that = this;
                    setTimeout(function(){
                        var $document = $(that.window.document);
                        var width = $document.width();
                        console.log($document);
                        $document.find("h1").text(title);
                        var $title = $document.find("h1");
                        windowTalkCountdown = $document.find("#talkCounter").countdown360({
                            radius:  width / 3.1,
                            seconds: duration,
                            fillStyle: '#222',
                            strokeStyle: "#8cc14c",          // the color of the stroke
                            strokeWidth: 15,
                            fontSize: width / 5.7,
                            fontColor: "#8cc14c",            // the fill color
                            onComplete: function () {
                                this.fontColor = '#fff';
                                this.fillStyle= "#e13d35";            // the fill color
                                $title.css({'backgroundColor':'#e13d35', 'color': '#fff'}).text(lang['please_finish_the_talk']);
                            },
                            onTimeUpdate: function(time){
                                if(time < 60) {
                                    this.fontColor = '#fefd58';
                                    $title.text(lang['prepare_finish_talk']).css({'color':'#fefd58'})
                                        if(time%2 > 0) {
                                            $title.css({'color': '#222'})
                                        }
                                }
                            }
                        });

                    }, 1000)
                })
                timerWindow = win;
            });
        } else {
            timerWindow.close();
            timerWindow = false;
        }
    }
});

var MeetingCounterContainer = Backbone.View.extend({
    el: "#meeting_counter_container",
    events: {
        'click .uk-button': 'toggleCounterState'
    },
    initialize: function() {
        this.listenTo(this.model, 'change:debtTime', function(){this.loadDebtCounter()})
    },
    render: function(){
        var tpl = _.template($('#meetingCounterContainer').html())(this.model.toJSON())
        this.$el.html(tpl);
        this.loadMeetingCounter();
        this.loadDebtCounter();

        return this;
    },
    toggleCounterState: function() {
        var $button = this.$el.find(".uk-button");
        if(this.model.get('counterOn')) {
            $button.text(lang["start_meeting"]);
            $button.removeClass("uk-button-danger").addClass("uk-button-success")
                this.model.set('counterOn', false);
            this.countdown.stop();
            $("a[href='settings.html']").show();
        } else {
            $button.text(lang["end_meeting"]);
            $button.removeClass("uk-button-success").addClass("uk-button-danger")
                this.model.set('counterOn', true);
            this.countdown.start();
            this.stopPreludePlaying();
            $("a[href='settings.html']").hide();
        }
    },
    stopPreludePlaying: function() {
        var $preludeButton = $("#playContinuous");
        if($('audio').length > 0) {
            $('audio')[0].pause();
        }
        $preludeButton.removeClass('uk-button-danger');
        $preludeButton.text(lang['musical_prelude'])
    },
    loadMeetingCounter: function() {
        var that = this;
        this.countdown = this.$el.find("#meetingCounter").countdown360({
            radius: that.$el.width() / 8,
            seconds: that.model.get('meetingDuration'),
            fontColor: '#39f',
            strokeStyle: "#222",          // the color of the stroke
            fillStyle: "#222",            // the fill color
            autostart: false,
            onComplete: function () {
            },
            onTimeUpdate: function(second){
                meetingCounterModel.set('meetingCounter', second)
            }
        });
    },
    loadDebtCounter: function() {
        var that = this;
        var $debtContainer = this.$el.find("#debtCounter");
        var unit = this.$el.width() / 8;
        $debtContainer.css({'height': unit, 'marginTop': unit/2, 'fontSize': unit/1.5});
        var debt = this.model.get('debtTime');
        $debtContainer.text(parseSeconds(debt));
        if (debt >= 0) {
            $debtContainer.css('color', '#8cc14c');
        } else {
            $debtContainer.css('color', '#da314b');
        }
    }
});

var ClockContainer = Backbone.View.extend({
    el: "#clock_container",
    render: function() {
        var that = this;
        var tpl = _.template('<h1 style="margin-bottom: 0;"><strong></strong>&nbsp;<span style="font-size: small"></span></h1>');
        this.$el.html(tpl);
        this.$clock = this.$el.find("strong");
        this.$date = this.$el.find("span");

        setInterval(function(){that.runClock()}, 1000);

        return this;
    },
    runClock: function() {
        var a=new Date();
        this.$clock.text(this.precedByZero(a.getHours()) + ":" + this.precedByZero(a.getMinutes()) + ":" + this.precedByZero(a.getSeconds())) ;
        this.$date.text(this.precedByZero(a.getDate()) + "." + this.precedByZero(a.getMonth() + 1) + "." + a.getFullYear()) ;
    },
    precedByZero: function(value) {
        if(value < 10) {
            value = '0' + value;
        }
        return value;
    }
});

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

/***********Controller**********/
$(document).ready(function(){

    var talkCounterContainer = new TalkCounterContainer({model: talkCounterModel});
    talkCounterContainer.render();
    var meetingCounterContainer = new MeetingCounterContainer({model: meetingCounterModel});
    meetingCounterContainer.render();
    var clockContainer = new ClockContainer({});
    clockContainer.render();
    var talksView = new TalksView({collection: talks})
        talksView.render();
    var displaySelectorsView = new DisplaySelectorView();
    displaySelectorsView.render();
    $('.toggle').toggles();
    $("#playAvi").click(function(el){
            if($(this).data('toggles').active) {
                    localStorage.setItem('playAviSong', 1)
            } else {
                    localStorage.setItem('playAviSong', 0)
            }
    });
    if(localStorage.getItem('playAviSong') == '1') {
        $("#playAvi").toggles(true);
    }

    addTranslatedStrings();
    var pdfFile = '';

    /*********************PDF**********************/
    $("#pdfFile").on('change',function(evt){
        imageFile = evt.currentTarget.files[0];
        pdfFile = evt.currentTarget.files[0];
        document.getElementById('imagePath').value = evt.currentTarget.files[0].name
        if(pdfFile.type === 'application/pdf') {
            $("#pdfOptions").slideDown();
        } else {
            $("#pdfOptions").slideUp();
        }
    })
    $("#showPdf").on('click', function(evt){
        var file = $("#imagePath").val();
        var pageNr = $("#pageNr").val();
        var pageZoom = $("#pageZoom").val();
        if(videoWindow) {
            videoWindow.close();
            videoWindow = false;
            $("#showPdf").children('i').removeClass('uk-icon-close').addClass('uk-icon-eye');
            var html = '<input type="TEXT" class="uk-width-1-1" readonly placeholder=""/>';
            $("#imagePath").html(html);
            $("#pdfControls").slideUp();
            return;
        }

        createPdfWindow(pdfFile, parseInt(localStorage.getItem('videoDisplay')) - 1, pageNr, pageZoom);
        $("#showPdf").children('i').removeClass('uk-icon-eye').addClass('uk-icon-close');

    })
    $(".pdfControls").click(function(){
        if(!videoWindow) { return; }
        var fileURL = URL.createObjectURL(pdfFile);
        videoWindow.window.location.hash = '#page=' + $("#pageNr").val() + '&zoom=' + $("#pageZoom").val();
        videoWindow.reload();
    });
function createPdfWindow(pdfFile, displayNr, pageNr, pageZoom){
    if(displayNr < 0) {
        ukNotify(lang['video_display_disabled'], 1)
    }
    if(!videoWindow) {
        var fileURL = URL.createObjectURL(pdfFile)
        var url = 'image.html';
        if (pdfFile.type === 'application/pdf') {
            url = fileURL + '#page=' + pageNr + '&zoom=' + pageZoom;
        }
        nw.Window.open(url, {x: screens[displayNr].work_area.x + 1, y: screens[displayNr].work_area.y + 1}, function(win){
            win.enterFullscreen();
            videoWindow = win;
            if (url !== 'image.html') { return; }
            win.on('enter-fullscreen',function(win){
                var $img = this.window.document.querySelector('img');
                $img.src = fileURL;
                $img.addEventListener('load', function(){
                    if ($img.offsetWidth > $img.offsetHeight) {
                        $img.style.width = '99%';
                    } else {
                        $img.style.height = '99%';
                    }
                });
            })

        });
    } else {
        videoWindow.close();
        videoWindow = false;
    }
    }
            /*********************Video**********************/
            $("input[id^='videoFile']").on('change',function(evt){
                var id = evt.currentTarget.id.split('videoFile');
                videoFiles[id[1]] = evt.currentTarget.files[0];
                evt.currentTarget.parentNode.nextElementSibling.children[0].value = evt.currentTarget.files[0].name
            })
            $("button[id^='playVideo']").on('click',function(evt){
                var $el = $(evt.currentTarget);
                var id = evt.currentTarget.id.split('playVideo');
                if(videoWindow) {
                    videoWindow.close();
                    videoWindow = false;
                    $el.children('i').removeClass('uk-icon-stop').addClass('uk-icon-play');
                    var html = '<input type="TEXT" class="uk-width-1-1" readonly placeholder=""/>';
                    $("#durationVideo" + id[1]).html(html);
                    return;
                }
                var fileURL = URL.createObjectURL(videoFiles[id[1]])
                video.autoplay = true;
                createVideoWindow(fileURL, parseInt(localStorage.getItem('videoDisplay')) - 1,id, true);
                $el.children('i').removeClass('uk-icon-play').addClass('uk-icon-stop');
            });


            function createVideoWindow(fileSrc, displayNr, id, isMovie){
                if(displayNr < 0) {
                    ukNotify(lang['video_display_disabled'], 1)
                }

                if(!videoWindow) {
                    nw.Window.open('video.html', {x: screens[displayNr].work_area.x + 1, y: screens[displayNr].work_area.y + 1}, function(win){
                        win.window.document.createElement('p');
                        win.enterFullscreen();
                        win.on('enter-fullscreen',function(win){
                            video = this.window.document.querySelector('video')
                            try{
                                video.src = fileSrc;
                                video.play();
                                $(video).on('timeupdate', function() {
                                    addProgressBar(video, id, isMovie);
                                });
                            }catch(e) {
                                ukNotify(e, 0)
                            }
                            video.webkitRequestFullscreen();
                        })
                        videoWindow = win;
                    });
                } else {
                    videoWindow.close();
                    videoWindow = false;
                }
            }

            var playSelectedFile = function (event) {
                var file = this.files[0]
                var type = file.type
                var videoNode = document.querySelector('video')
                var canPlay = videoNode.canPlayType(type)
                if (canPlay === '') canPlay = 'no'
                var message = 'Can play type "' + type + '": ' + canPlay
                var isError = canPlay === 'no'
                displayMessage(message, isError)

                if (isError) {
                    return
                }

                var fileURL = URL.createObjectURL(file)
                videoNode.src = fileURL
            }

            /*********************Audio**********************/

            var audio = new Audio();
            var audioplaying = 0;
            var audiosrc, audionr;

            function playPrelude(){
                audio = new Audio();
                //audionr = Math.floor(Math.random() * 152);
                audionr = Math.floor(Math.random() * 20);
                audiosrc = getAudiofileName(audionr, false);
                audioplaying = audionr;

                try {
                    audio.src = audiosrc;
                    audio.play();
                    $(audio).on('ended', function(){
                        audio = new Audio();
                        playPrelude();
                    })
                } catch(e) {
                    ukNotify(lang['file_not_exists_or_error'], 0);
                    console.error(e);
                }
            }
            var $preludeButton = $("#playContinuous");
            function stopPreludePlaying(audio, $preludeButton) {
                audio.pause();
                audio = new Audio();
                $preludeButton.removeClass('uk-button-danger');
                $preludeButton.text(lang['musical_prelude'])
            }

            $preludeButton.click(function(evt){
                if (audioplaying === audionr) {
                    audionr = false;
                    audioplaying = 0;
                    stopPreludePlaying(audio, $preludeButton);
                } else if (audioplaying === 0) {
                    playPrelude();
                    $preludeButton.addClass('uk-button-danger');
                    $preludeButton.text(lang['playing_musical_prelude'])

                } else {
                    ukNotify(lang['another_song_playing'], 1)
                    return;
                }
            });

            function getAudiofileName(audionr, isVideo){
                if (10 <= audionr && audionr < 100) {
                    audionr = '0' + audionr;
                } else if (audionr < 10) {
                    audionr = '00' + audionr;
                }

                if (isVideo) {
                    var audiosrc = 'Cantarea ' + audionr + ' o.mp4'
                    return localStorage.getItem('aviFolder') + audiosrc;
                }

                if (audionr > 135) {
                    var audiosrc = 'snnw_' + localStorage.getItem('songLanguage') + '_' + audionr + '.mp3'
                } else {
                    var audiosrc = 'iasnm_' + localStorage.getItem('songLanguage') + '_' + audionr + '.mp3'
                }

                return localStorage.getItem('musicFolder') + audiosrc;
            }
            function addProgressBar(audio, id, video) {
                var html = '';
                if (video) {
                    html = '<input type="TEXT" class="uk-width-1-1" readonly placeholder=""/>';
                }
                if(audio.currentTime > 0) {
                    html = '<div class="uk-progress uk-progress-striped uk-active">';
                    html += '<div class="uk-progress-bar" style="width:' + (audio.currentTime / audio.duration)*100 + '% ;">';
                    html += parseSeconds(Math.floor(audio.duration - audio.currentTime));
                    html += '</div></div>';
                }
                if(video) {
                    $("#durationVideo" + id[1]).html(html);
                } else {
                    $("#durationAudio" + id[1]).html(html);
                }
            }
            function stopSongPlayer($audioEl, $audioTitle, id, audio) {
                $audioEl.children('i').removeClass('uk-icon-stop').addClass('uk-icon-play');
                audioplaying = 0;
                $audioTitle.attr('readonly', false);
                $("#durationAudio" + id[1]).html('');
                $(audio).off('paused')
                $(audio).off('ended')
                $(audio).off('timeupdate')
                audio = new Audio();
            }

            $("button[id^='playAudio']").click(function(evt){
                var isVideo = false;
                if(localStorage.getItem('playAviSong') == '1') {
                    isVideo = true;
                }
                var id = evt.currentTarget.id.split('playAudio');
                var $audioEl = $(evt.currentTarget);
                var $audioTitle = $("#titleAudio" + id[1]);
                var audionr = $audioTitle.val();

                audiosrc = getAudiofileName(audionr, isVideo);

                if (audioplaying === audionr) {
                    if(isVideo && videoWindow) {
                        videoWindow.close();
                        videoWindow = false;
                        $audioEl.children('i').removeClass('uk-icon-stop').addClass('uk-icon-play');
                        $("#durationAudio" + id[1]).html('');
                        audioplaying = 0;
                    } else {
                        audio.pause();
                        stopSongPlayer($audioEl, $audioTitle, id, audio);
                    }
                } else if (audioplaying === 0) {

                    if(!fileExists(audiosrc)) {
                        ukNotify(lang['file_not_exists_or_error'], 0);
                        $audioTitle.val('')
                        audionr = 0;
                        return;
                    }

                    audioplaying = audionr;

                    if(isVideo && !videoWindow) {
                        createVideoWindow(audiosrc, parseInt(localStorage.getItem('videoDisplay')) - 1, id, false);
                    } else {
                        audio.src = audiosrc;
                        audio.play();
                    }

                    $audioEl.children('i').removeClass('uk-icon-play').addClass('uk-icon-stop');
                    $audioTitle.attr('readonly', true);
                    if(!isVideo) {
                        $(audio).on('ended', function() {
                            stopSongPlayer($audioEl, $audioTitle, id, audio);
                        });
                        $(audio).on('paused', function() {
                            stopSongPlayer($audioEl, $audioTitle, id, audio);
                        });

                        $(audio).on('timeupdate', function() {
                            addProgressBar(audio, id, false);
                        });
                    }
                } else {
                    ukNotify(lang['another_song_playing'], 1)
                    return;
                }

            });


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
            $('#closeApp').click(function(){
                nw.App.quit();
            })
            var $recalculateTime = $("#recalculateTime");
            if(localStorage.getItem('recalculateTime') > 0) {
                $recalculateTime.toggles(true);
            }

            $recalculateTime.on('click', function(){
                var val = 0;
                if($recalculateTime.data('toggles').active) {
                    val = 1;
                    $.each($(".plus_seconds"), function(i, el){
                        $(el).hide();
                    })
                    $.each($(".minus_seconds"), function(i, el){
                        $(el).hide();
                    })
                } else {
                    $.each($(".plus_seconds"), function(i, el){
                        $(el).show();
                    })
                    $.each($(".minus_seconds"), function(i, el){
                        $(el).show();
                    })
                }
                localStorage.setItem('recalculateTime', val);
            });
})

function getElapsedTime(startingTime) {
    return  Math.round((new Date().getTime() - startingTime)/1000);
}

function parseSeconds(seconds) {
    var mins = '00';
    var secs = '00';
    var minus = false;
    if (seconds < 0) {
        seconds = -1*seconds;
        minus =  true;
    }
    if (seconds != 0) {
        mins = Math.floor(seconds / 60);
        secs = seconds % 60;
        if (mins < 10) {
            mins = '0' + mins;
        }
        if (secs < 10) {
            secs = '0' + secs;
        }
    }
    if (minus) {
        mins = '-' + mins;
    }

    return mins + ':' + secs;
}
function calculateRemainingTime(collection) {
    var that = meetingCounterModel;
    var debtTime = 0;
    var totalTalksTimeTillEnd = 0;
    var remainingTalks = new TalksCollection();
    var unflexiblePercent = 0;
    var flexibleSlots = [];

    collection.each(function(model){
        if(model.get('id') > that.get('talkId') && !model.get('disabled')) {
            var percent = parseInt(model.get('duration')) / that.get('meetingCounter');
            if(model.get('flexible') && that.get('meetingCounter') > 0) {
                model.set('percent', percent, {silent:true});
                //flexibleSlots[model.get(id)] = percent;
            } else {
                unflexiblePercent += percent;
            }
                console.log(model.get('title'))
                console.log(parseInt(model.get('duration')))
            totalTalksTimeTillEnd += parseInt(model.get('duration'));
            remainingTalks.add(model);
        }
    });
    console.log('Talks till end ' + totalTalksTimeTillEnd);
    debtTime = that.get('meetingCounter') - totalTalksTimeTillEnd;
    that.set('debtTime', debtTime);
    console.log('Debt time ' + debtTime);

    if(debtTime < 0) {
        remainingTalks.each(function(model){
            if(model.get('percent') && model.get('percent') > 0) {
                console.log('-----')
                console.log('percent:' + model.get('percent'))
                var newPercent = model.get('percent') + (model.get('percent') * unflexiblePercent);
                console.log('new percent' + newPercent)
                var duration = parseInt(model.get('duration')) + (debtTime * newPercent);
                console.log('DURATION' + duration)
                console.log('------')
                model.set('duration', Math.floor(duration), {silent:true});
                model.trigger('durationRecalculated');
            }
        })
    }
}
function fileExists(url) {
    var response = true;
    $.ajax({
        url: url,
        type: 'GET',
        async: false,
        success: function(){
        },
        error: function(e) {
            response = false;
        }
    })
    return response;
}
function addTranslatedStrings() {
    $('.lang_weekday_meeting').text(lang['weekday_meeting']);
    $('.lang_weekend_meeting').text(lang['weekend_meeting']);
    $('.lang_songs').text(lang['songs']);
    $('.lang_musical_prelude').text(lang['musical_prelude']);
    $('.lang_videos').text(lang['video']);
    $('.lang_displays').text(lang['displays']);
    $('.lang_select_display_for_prelude').text(lang['select_display_for_prelude']);
    $('.lang_deactivate_prelude_display' ).text(lang['deactivate_prelude_display']);
    $('.lang_select_display_for_timer' ).text(lang['select_display_for_timer']);
    $('.lang_deactivate_video_display' ).text(lang['deactivate_video_display']);
    $('.lang_debt_time' ).text(lang['debt_time']);
    $('.lang_start_meeting' ).text(lang['start_meeting']);
    $('.lang_deactivate_timer_display' ).text(lang['deactivate_timer_display']);
    $('.lang_select_display_for_video' ).text(lang['select_display_for_video']);
    $('.lang_recalculate_time' ).text(lang['recalculate_time']);
    $('.lang_play_avi_songs' ).text(lang['play_avi_songs']);
    $('.lang_images_and_pdf' ).text(lang['images_and_pdf']);
}
