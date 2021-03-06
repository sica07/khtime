nw.Screen.Init();
var screens = nw.Screen.screens;
//var screens = [1,2];
//initialization of localStorage
var defaultWeekendTalks = [
    {"id":1,"title":"Cantare si rugaciune de inceput","duration":"300","invisible":true,"disabled":false,"flexible":false,"talkId":0},
    {"id":2,"title":"Cuvantare publica","duration":"1800","invisible":false,"disabled":true,"flexible":false,"talkId":0},
    {"id":3,"title":"Cantare","duration":"300","invisible":true,"disabled":false,"flexible":false,"talkId":0},
    {"id":4,"title":"Studiu Turnului de Veghe","duration":"3600","invisible":false,"disabled":false,"flexible":true,"talkId":0},
    {"id":5,"title":"Cuvantare de serviciu","duration":"1800","invisible":false,"disabled":true,"flexible":false,"talkId":0},
    {"id":6,"title":"Cantare si rugaciune incheiere","duration":"300","invisible":true,"disabled":false,"flexible":true,"talkId":0}
];
var defaultWeekdayTalks = [
    {"id":1,"title":"Cantare si rugaciune de inceput","duration":"300","invisible":true,"disabled":false,"flexible":false,"talkId":0},
    {"id":2,"title":"Introducere","duration":"180","invisible":false,"disabled":false,"flexible":false,"talkId":0},
    {"id":3,"title":"Comori din Cuvant","duration":"600","invisible":false,"disabled":false,"flexible":false,"talkId":0},
    {"id":4,"title":"Nestemate","duration":"480","invisible":false,"disabled":false,"flexible":true,"talkId":0},
    {"id":5,"title":"Citirea Bibliei","duration":"240","invisible":false,"disabled":false,"flexible":false,"talkId":0},
    {"id":6,"title":"Sfaturi Citirea Bibliei","duration":"60","invisible":false,"disabled":false,"flexible":false,"talkId":0},
    {"id":7,"title":"Sa ne pregatim","duration":"900","invisible":false,"disabled":true,"flexible":true,"talkId":0},
    {"id":8,"title":"Vizita initiala","duration":"120","invisible":false,"disabled":false,"flexible":false,"talkId":0},
    {"id":9,"title":"Sfaturi Vizita Intiala","duration":"60","invisible":false,"disabled":false,"flexible":false,"talkId":0},
    {"id":10,"title":"Vizita Ulterioara","duration":"240","invisible":false,"disabled":false,"flexible":false,"talkId":0},
    {"id":11,"title":"Sfaturi Vizita Ulterioara","duration":"60","invisible":false,"disabled":false,"flexible":false,"talkId":0},
    {"id":12,"title":"Studiu Biblic","duration":"360","invisible":false,"disabled":false,"flexible":false,"talkId":0},
    {"id":13,"title":"Sfaturi Studiu Biblic","duration":"60","invisible":false,"disabled":false,"flexible":false,"talkId":0},
    {"id":14,"title":"Cantare","duration":"300","invisible":true,"disabled":false,"flexible":false,"talkId":0},
    {"id":15,"title":"Tema 1","duration":"900","invisible":false,"disabled":false,"flexible":true,"talkId":0},
    {"id":16,"title":"Tema 2","duration":"360","invisible":false,"disabled":true,"flexible":true,"talkId":0},
    {"id":17,"title":"Studiu Bibliei","duration":"1800","invisible":false,"disabled":false,"flexible":true,"talkId":0},
    {"id":18,"title":"Cuvantare de serviciu","duration":"1800","invisible":false,"disabled":true,"flexible":false,"talkId":0},
    {"id":19,"title":"Incheiere","duration":"180","invisible":false,"disabled":false,"flexible":true,"talkId":0},
    {"id":20,"title":"Cantare si rugaciune incheiere","duration":"300","invisible":true,"disabled":false,"flexible":true,"talkId":0}
];
if(!localStorage.getItem('firstTime')) {
    localStorage.musicFolder = 'Songs/';
    localStorage.aviFolder = 'Avi/';
    localStorage.playAviSongs = 0;
    localStorage.premeetingDisplay = 2;
    localStorage.timerDisplay = 1;
    localStorage.videoDisplay = 2;
    localStorage.recalculateTime = 0;
    localStorage.songLanguage = 'E';
    localStorage.weekdayTalks = JSON.stringify(defaultWeekdayTalks);
    localStorage.weekendTalks = JSON.stringify(defaultWeekendTalks);
    localStorage.netWeekdayTalks = '[]';
    localStorage.preludeCountdown = '120';
    localStorage.internetSource = false;
    localStorage.internetSourceUpdate = '';
    localStorage.weekendSongs = '[]';
    localStorage.weekdaySongs = '[]';
    localStorage.showYearText = false;
    localStorage.yearText = JSON.stringify({yearText: 'Textul anului fain este acum', scripture: 'Matei 99:99', background: 'rgb(0,0,0)', color: 'rgb(255,255,255)'});
    localStorage.firstTime = 0;
    localStorage.version = '0.8.0';
}
var talkCountdown = false;
var windowTalkCountdown = false;
var timerWindow = false;
var videoFiles = [];
var yearTextWindow = false;
var videoWindow = false;
var preludeWindow = false;
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
if(localStorage.getItem('internetSource') == 'true' ) {
    talksmodels = JSON.parse(localStorage.getItem('netWeekdayTalks'));
}
if (weekday === 0 || weekday === 6) {
    talksmodels = JSON.parse(localStorage.getItem('weekendTalks'));
    $("#meetingTitleTabsContainer").find('a').addClass('lang_weekend_meeting');
} else {
    $("#meetingTitleTabsContainer").find('a').addClass('lang_weekday_meeting');
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
            $button.children('i').removeClass('uk-icon-stop-circle').addClass('uk-icon-play');
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
        'click button.uk-button': 'toggleCounterState',
        'click a.uk-button': 'showPreludeDisplay',
        'click #preludeCountdownPlus': 'plusPreludeCountdown',
        'click #preludeCountdownMinus': 'minusPreludeCountdown'
    },
    initialize: function() {
        this.listenTo(this.model, 'change:debtTime', function(){this.loadDebtCounter()})
    },
    render: function(){
        var tpl = _.template($('#meetingCounterContainer').html())(this.model.toJSON())
        this.$el.html(tpl);
        this.$el.find("#preludeCountdown").val(parseInt(localStorage.getItem('preludeCountdown'))/60);
        this.loadMeetingCounter();
        this.loadDebtCounter();

        return this;
    },
    toggleCounterState: function() {
        var $button = this.$el.find("button.uk-button");
        var $preludeDisplayContainer = $("#preludeDisplayContainer");
        if(this.model.get('counterOn')) {
            $button.text(lang["start_meeting"]);
            $button.removeClass("uk-button-danger").addClass("uk-button-success")
            this.model.set('counterOn', false);
            this.countdown.stop();
            talks.each(function(model){
                if(model.get('status')) {
                    model.set('status', null);
                }
                talkCounterModel.set({title: lang['no_talk_yet'], counterOn: false});
            });
            $preludeDisplayContainer.show();
        } else {
            $button.text(lang["end_meeting"]);
            $button.removeClass("uk-button-success").addClass("uk-button-danger");
            this.model.set('counterOn', true);
            this.countdown.start();
            this.stopPreludePlaying();
            $("#preludeInfoMessage").hide();
            //$preludeDisplayContainer.hide();
            //$preludeDisplayContainer.slideDown();
            if(preludeWindow) {
                preludeWindow.close();
                preludeWindow = false;
            }
        }
    },
    showPreludeDisplay: function(evt) {
        $("#preludeDisplayContainer").slideUp();
        $("#preludeInfoMessage").show();
        if(!preludeWindow) {
            var displayNr = localStorage.getItem('premeetingDisplay') - 1;
            nw.Window.open('timer.html', {x: screens[displayNr].work_area.x + 1, y: screens[displayNr].work_area.y + 1}, function(win){
                win.enterFullscreen();
                win.on('enter-fullscreen',function(win){
                    var that = this;
                    setTimeout(function(){
                        var $document = $(that.window.document);
                        var width = $document.width();
                        $document.find("h1").text(lang['prelude_window_title']);
                        var $title = $document.find("h1");
                        $title.css({'fontSize':'8em', 'color':'#fff','margin':'.5em'});
                        $document.find('body').css({'background':'#4a6da7'});
                        windowPreludeCountdown = $document.find("#talkCounter").countdown360({
                            radius:  width / 7,
                            seconds: localStorage.getItem('preludeCountdown'),
                            fillStyle: '#4a6da7',
                            //strokeStyle: "#325796",          // the color of the stroke
                            strokeStyle: "#fff",          // the color of the stroke
                            strokeWidth: 5,
                            fontSize: width / 15,
                            fontColor: "#fff",            // the fill color
                            onComplete: function () {
                                //windowPreludeCountdown.close();
                            },
                            onTimeUpdate: function(time){
                            }
                        });

                    }, 1000)
                })
                preludeWindow = win;
            });
        }
    },
    plusPreludeCountdown: function() {
       var $preludeCountdown = $("#preludeCountdown");
       $preludeCountdown.val(parseInt($preludeCountdown.val()) + 1);
       this.setPreludeCountdown();
    },
    minusPreludeCountdown: function() {
       var $preludeCountdown = $("#preludeCountdown");
        if($preludeCountdown.val() > 1) {
           $preludeCountdown.val(parseInt($preludeCountdown.val()) - 1);
        }
        this.setPreludeCountdown();
    },
    setPreludeCountdown: function() {
        var preludeCountdown = $("#preludeCountdown").val()
        preludeCountdown = parseInt(preludeCountdown) * 60;
        localStorage.setItem('preludeCountdown',preludeCountdown)
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
    $('.toggle').toggles();
    $("#settings_window").click(function(){
        nw.Window.open('settings.html', {width: 800, height: 600, title:'settings'}, function(win){ });
    });
    $("#schedule_window").click(function(){
        nw.Window.open('schedule.html', {width: 800, height: 600, title:'schedule'}, function(win){ });
    });

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

    /*********************PDF**********************/
    var pdfFile, imgFile = '';
    $("#pdfFile").on('change',function(evt){
        pdfFile = evt.currentTarget.files[0];
        document.getElementById('pdfPath').value = evt.currentTarget.files[0].name
    });
    $("#imgFile").on('change',function(evt){
        imgFile = evt.currentTarget.files[0];
        document.getElementById('imagePath').value = evt.currentTarget.files[0].name
    });
    var $pageZoom = $("#pageZoom");
    $(".uk-icon-search-minus").click(function(){
        if($pageZoom.val() > 25) {
            $pageZoom.val(parseInt($pageZoom.val()) - 25);
        }
        zoomOrChangePageOfPdf();
    });
    $(".uk-icon-search-plus").click(function(){
        $pageZoom.val(parseInt($pageZoom.val()) + 25);
        zoomOrChangePageOfPdf();
    });
    var $pageNr = $("#pageNr");
    $("#pageDown").click(function(){
        if($pageNr.val() > 1) {
            $pageNr.val(parseInt($pageNr.val()) - 1);
        }
        zoomOrChangePageOfPdf();
    });
    $("#pageUp").click(function(){
        $pageNr.val(parseInt($pageNr.val()) + 1);
        zoomOrChangePageOfPdf();
    });
    $("#showPdf").on('click', function(evt){
        //make sure that no video is running
        if(videoWindow && videoWindow.window.location.hash.length === 0) {
            ukNotify(lang['another_song_playing'], 1)
            return;
        }
        var file = $("#pdfPath").val();
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
    $("#showImg").on('click', function(evt){
        //make sure that no video is running
        if(videoWindow && videoWindow.window.location.pathname !== '/image.html') {
        console.log(videoWindow.window.location)
            ukNotify(lang['another_song_playing'], 1)
            return;
        }
        var file = $("#imagePath").val();
        if(videoWindow) {
            videoWindow.close();
            videoWindow = false;
            $("#showImg").children('i').removeClass('uk-icon-close').addClass('uk-icon-eye');
            var html = '<input type="TEXT" class="uk-width-1-1" readonly placeholder=""/>';
            $("#imagePath").html(html);
            return;
        }

        createPdfWindow(imgFile, parseInt(localStorage.getItem('videoDisplay')) - 1, pageNr, pageZoom);
        $("#showImg").children('i').removeClass('uk-icon-eye').addClass('uk-icon-close');

    })

    function zoomOrChangePageOfPdf(){
        //make sure that in the videowindow is loaded a pdf file
        if(!videoWindow || videoWindow.window.location.hash.length === 0) {
            return;
        }
        var fileURL = URL.createObjectURL(pdfFile);
        videoWindow.window.location.hash = '#page=' + $("#pageNr").val() + '&zoom=' + $("#pageZoom").val();
        videoWindow.reload();
    }
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

    function setSongNr() {
        var weekdaySongs = JSON.parse(localStorage.getItem('weekdaySongs'));
        var weekendSongs = JSON.parse(localStorage.getItem('weekendSongs'));
        if(weekdaySongs.length < 2) {
            return;
        }
        var isVideo = checkVideo();
        if (weekday === 0 || weekday === 6) {
            $("#titleAudio2").val(weekendSongs[0]);
            var audiosrc = getAudiofileName(weekendSongs[0], isVideo);
            fileExists(audiosrc).then(function(){}, function(){
                ukNotify(lang['file_not_exists_or_error'], 0);
                $("#titleAudio2").addClass('uk-form-danger');
            });
            $("#titleAudio3").val(weekendSongs[1]);
            audiosrc = getAudiofileName(weekendSongs[1], isVideo);
            fileExists(audiosrc).then(function(){}, function(){
                ukNotify(lang['file_not_exists_or_error'], 0);
                $("#titleAudio3").addClass('uk-form-danger');
            });
        } else {
            var audiosrc = getAudiofileName(weekdaySongs[0], isVideo);
            $("#titleAudio1").val(weekdaySongs[0]);
            fileExists(audiosrc).then(function(){}, function(){
                ukNotify(lang['file_not_exists_or_error'], 0);
                $("#titleAudio1").addClass('uk-form-danger');
            });

            $("#titleAudio2").val(weekdaySongs[1]);
            audiosrc = getAudiofileName(weekdaySongs[1], isVideo);
            fileExists(audiosrc).then(function(){}, function(){
                ukNotify(lang['file_not_exists_or_error'], 0);
                $("#titleAudio2").addClass('uk-form-danger');
            });

            $("#titleAudio3").val(weekdaySongs[2]);
            audiosrc = getAudiofileName(weekdaySongs[1], isVideo);
            fileExists(audiosrc).then(function(){}, function(){
                ukNotify(lang['file_not_exists_or_error'], 0);
                $("#titleAudio3").addClass('uk-form-danger');
            });
        }
    }

    setSongNr();

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
            return 'file://' + process.cwd() + '/../' + localStorage.getItem('aviFolder') + '' + audiosrc;
        }

        if (audionr > 135) {
            var audiosrc = 'snnw_' + localStorage.getItem('songLanguage') + '_' + audionr + '.mp3'
        } else {
            var audiosrc = 'iasnm_' + localStorage.getItem('songLanguage') + '_' + audionr + '.mp3'
        }

        return 'file://' + process.cwd() + '/../' + localStorage.getItem('musicFolder') + '' + audiosrc;
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

    $("button[id^='titleAudio']").change(function(evt){
        var isVideo = checkVideo();
        var $audiotitle = getAudioTitleEl(evt);
        var audionr = $audioTitle.val();
        audiosrc = getAudiofileName(audionr, isVideo);

        fileExists(audiosrc).then(
            function(){//success
                $audioTitle.removeClass('uk-form-danger');
            },
            function(){//error
                ukNotify(lang['file_not_exists_or_error'], 0);
                $audioTitle.addClass('uk-form-danger');
                audionr = 0;
            }
        );
    });
    $("button[id^='playAudio']").click(function(evt){

        var isVideo = checkVideo();
        var id = evt.currentTarget.id.split('playAudio');
        var $audioEl = $(evt.currentTarget);
        var $audioTitle = getAudioTitleEl(evt);
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


    $('#reloadApp').click(function(){
        chrome.runtime.reload();
    });

    $('#closeApp').click(function(){
        nw.App.quit();
    });

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
    /************Year Text*********************/
    if(localStorage.getItem('showYearText') != false) {
        showYearText();
    }
    function showYearText(){
        if(!yearTextWindow) {
            var displayNr = localStorage.getItem('premeetingDisplay') - 1;
            nw.Window.open('yearText.html', {x: screens[displayNr].work_area.x + 1, y: screens[displayNr].work_area.y + 1}, function(win){
                win.enterFullscreen();
                win.on('enter-fullscreen',function(win){
                    var that = this;
                    setTimeout(function(){
                        var $document = $(that.window.document);
                        var yearText = JSON.parse(localStorage.getItem('yearText'));
                        $document.find("#container").css('height',$document.height());
                        $document.find("#yearTextContainer").css({
                            'width': ($document.width() - 100),
                            'borderTop':'2px solid ' + yearText.color,
                            'borderBottom':'2px solid ' + yearText.color
                        });
                        //set shadow
                        var backgroundValues = yearText.background.split('(')[1].split(')')[0].split(',');
                        console.log(backgroundValues);
                        var shadowColor = 'rgb(' + (parseInt(backgroundValues[0]) - 50) + ',' + (parseInt(backgroundValues[1]) - 50) + ',' + (parseInt(backgroundValues[2]) - 50) + ')'

                        $document.find('h1').text(yearText.text).css('textShadow', '10px 5px 10px ' + shadowColor);
                        $document.find('h2').text(yearText.scripture).css('textShadow', '10px 5px 10px ' + shadowColor);
                        $document.find('body').css('background',yearText.background);
                    }, 1000)
                })
                yearTextWindow = win;
            });
        }
    }

});


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
            totalTalksTimeTillEnd += parseInt(model.get('duration'));
            remainingTalks.add(model);
        }
    });
    debtTime = that.get('meetingCounter') - totalTalksTimeTillEnd;
    that.set('debtTime', debtTime);

    if(debtTime < 0) {
        remainingTalks.each(function(model){
            if(model.get('percent') && model.get('percent') > 0) {
                var newPercent = model.get('percent') + (model.get('percent') * unflexiblePercent);
                var duration = parseInt(model.get('duration')) + (debtTime * newPercent);
                model.set('duration', Math.floor(duration), {silent:true});
                model.trigger('durationRecalculated');
            }
        })
    }
}
function fileExists(url) {
    return $.ajax({
        url: url,
        type: 'GET',
        success: function(data){
            return true;
        },
        error: function(e) {
            return;
        }
    })
}
function checkVideo(){
    if(localStorage.getItem('playAviSong') == '1') {
        return true;
    }
    return;
}
function getAudioTitleEl(evt){
    var id = evt.currentTarget.id.split('playAudio');

    return $("#titleAudio" + id[1]);
}
function addTranslatedStrings() {
    $('.lang_weekday_meeting').text(lang['weekday_meeting']);
    $('.lang_weekend_meeting').text(lang['weekend_meeting']);
    $('.lang_songs').text(lang['songs']);
    $('.lang_musical_prelude').text(lang['musical_prelude']);
    $('.lang_videos').text(lang['video']);
    $('.lang_debt_time' ).text(lang['debt_time']);
    $('.lang_start_meeting' ).text(lang['start_meeting']);
    $('.lang_recalculate_time' ).text(lang['recalculate_time']);
    $('.lang_play_avi_songs' ).text(lang['play_avi_songs']);
    $('.lang_pdf' ).text(lang['pdf']);
    $('.lang_images' ).text(lang['images']);
    $('.lang_show_prelude_display' ).text(lang['show_prelude_display']);
    $('.lang_prelude_countdown' ).text(lang['prelude_countdown']);
    $('.lang_mins' ).text(lang['mins']);
    $('.lang_how_to_close_prelude_window' ).text(lang['how_to_close_prelude_window']);
}
