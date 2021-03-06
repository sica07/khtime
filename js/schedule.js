var TalkModel = Backbone.Model.extend({
    defaults: {
        id: 0,
        title: 'Default title',
        duration: 0,
        invisible: false,
        disabled: false,
        flexible: false,
        talkId: 0
    },
});
var WeekdayTalksCollection = Backbone.Collection.extend({
    model: TalkModel,
    initialize: function(){
        this.on('update', function(){this.save();});
    },
    save: function() {
        localStorage.setItem('weekdayTalks', JSON.stringify(this));
    }
});
var WeekendTalksCollection = Backbone.Collection.extend({
    model: TalkModel,
    initialize: function(){
        this.on('update', function(){this.save();});
    },
    save: function() {
        localStorage.setItem('weekendTalks', JSON.stringify(this));
    }
});
var weekdayTalksColl = new WeekdayTalksCollection();
var weekendTalksColl = new WeekendTalksCollection();

var TalkView = Backbone.View.extend({
    tagName: "tr",
    initialize: function() {
        this.render();

    },
    render: function() {
        var tpl = _.template($('#talkElement').html())(this.model.toJSON());
        this.$el.html(tpl);

        return this;
    },

});

var NewTalkView = Backbone.View.extend({
    tagName: "tr",
    initialize: function() {
        this.render();
    },
    render: function() {
        var tpl = _.template($('#newTalkElement').html());
        this.$el.html(tpl);
        return this;
    }
});
var WeekendTalksContainer = Backbone.View.extend({
    el: "#weekendTalksTable",
    events: {
        'click #addWeekendTalk' : 'addTalk',
        'click .toggle': 'toggleDisable',
        'change input' : 'updateModel'
    },
    initialize: function() {
        this.model = new TalkModel();
        this.listenTo(this.collection, 'update', function(){
            this.render();
        });
        this.listenTo(this.collection, 'reset', function(){
            this.render();
        });
    },
    toggleDisable: function(evt){
        var id = $(evt.currentTarget).parents('div').parents('.uk-grid').attr('id');
        var model = this.collection.findWhere({'id' : parseInt(id)});
        if(model) {
            model.set('disabled', !model.get('disabled'));
        }
    },
    render: function() {
        var that = this;
        this.$el.empty();
        var newTalkElView = new NewTalkView();
        this.collection.each(function(model,i){
            var talkElView = new TalkView({model: model});
            that.$el.append(talkElView.$el.html());
            that.applyToggle(model);
        });
        this.$el.append(newTalkElView.$el.html());

        return this;
    },
    applyToggle: function(model) {
        var $tr = this.$el.find('#' + model.get('id'));
        var $disabled = $tr.find("#disabled");
        $disabled.toggles();
        if(!model.get('disabled')) {
            $disabled.toggles(true);
            $tr.find('input').removeClass('uk-text-muted');
        } else {
            $disabled.toggles(false);
            $tr.find('input').addClass('uk-text-muted');
        }
    },
    updateModel: function(evt) {
        var $el = $(evt.currentTarget);
        var id = $el.parent().parent().attr('id');
        var val = $el.val();
        var model = this.model;
        if(val === 'on' || val === 'off') {//checkbox
            val = $el.is(':checked');
        }

        if(id != 0) {
            model = this.collection.get(id);
        }

        model.set($el.attr('name'), val);
    },
    addTalk: function() {
        var lastId = 0;
        if(weekendTalksColl.length > 0) {
            lastId = weekendTalksColl.last().id;
        }
        this.model.set('id', lastId + 1);
        weekendTalksColl.add(this.model.toJSON());
    }
});
var WeekdayTalksContainer = Backbone.View.extend({
    el: "#weekdayTalksTable",
    events: {
        'click #addTalk' : 'addTalk',
        'change input' : 'updateModel',
        'click .toggle': 'toggleDisable'
    },
    initialize: function() {
        this.model = new TalkModel();
        this.listenTo(this.collection, 'update', function(){
            this.render();
        })
        this.listenTo(this.collection, 'reset', function(){
            this.render();
        })
    },
    render: function() {
        var that = this;
        this.$el.empty();
        var newTalkElView = new NewTalkView();
        this.collection.each(function(model,i){
            var talkElView = new TalkView({model: model});
            that.$el.append(talkElView.$el.html());
            that.applyToggle(model);
        });
        this.$el.append(newTalkElView.$el.html());

        return this;
    },
    toggleDisable: function(evt){
        var id = $(evt.currentTarget).parents('div').parents('.uk-grid').attr('id');
        var model = this.collection.findWhere({'id' : parseInt(id)});
        if(model) {
            model.set('disabled', !model.get('disabled'));
        }
    },
    applyToggle: function(model) {
        var $tr = this.$el.find('#' + model.get('id'));
        var $disabled = $tr.find("#disabled");
        $disabled.toggles();
        if(!model.get('disabled')) {
            $disabled.toggles(true);
            $tr.find('input').removeClass('uk-text-muted');
        } else {
            $disabled.toggles(false);
            $tr.find('input').addClass('uk-text-muted');
        }
    },
    updateModel: function(evt) {
        var $el = $(evt.currentTarget);
        var id = $el.parent().parent().attr('id');
        var val = $el.val();
        var model = this.model;
        if(val === 'on' || val === 'off') {//checkbox
            val = $el.is(':checked');
        }

        if(id != 0) {
            model = this.collection.get(id);
        }

        model.set($el.attr('name'), val);
    },
    addTalk: function() {
        var lastId = 0;
        if(weekdayTalksColl.length > 0) {
            lastId = weekdayTalksColl.last().id
        }
        this.model.set('id', lastId + 1);
        console.log(this.model)
        console.log(this.collection)
        weekdayTalksColl.add(this.model.toJSON());
    }
});
$("document").ready(function() {
    var weekdayTalksView = new WeekdayTalksContainer({collection: weekdayTalksColl});
    weekdayTalksView.render();
    weekdayTalksColl.add(JSON.parse(localStorage.getItem('weekdayTalks')));
    $("#saveWeekdayTalks").on('click', function() {
        weekdayTalksColl.trigger('update');
        ukNotify(lang['changes_saved'], 1);
    });
    $("#resetWeekdayTalks").on('click', function() {
        weekdayTalksColl.reset(JSON.parse(localStorage.getItem('weekdayTalks')));
    });

    var weekendTalksView = new WeekendTalksContainer({collection: weekendTalksColl});
    weekendTalksView.render();
    weekendTalksColl.add(JSON.parse(localStorage.getItem('weekendTalks')));
    $("#saveWeekendTalks").on('click', function() {
        weekendTalksColl.trigger('update');
        ukNotify(lang['changes_saved'], 1);
    });
    $("#resetWeekendTalks").on('click', function() {
        weekendTalksColl.reset(JSON.parse(localStorage.getItem('weekendTalks')));
    });
    addTranslatedStrings();
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
    $(".lang_meetings_schedule").text(lang['meetings_schedule']);
    $(".lang_save").text(lang['save']);
    $(".lang_reset").text(lang['reset']);
}
