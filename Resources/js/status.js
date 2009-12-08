
    TT.log('Loading Status: ' + Titanium.App.Properties.getString('currentStatus'));

    var stat = TT.formatTimelineRow(Titanium.App.Properties.getList('currentStatusList'));
    document.title = 'Titweeter: Status: ' + stat.user.name;

    TT.formatProfileHeader(stat.user);

    var txt = TT.filterStatus(stat.text);
    TT.log('Status: ' + txt);

    if (stat.geo) {
        var geo = Y.one('#status a.geo');
        geo.set('href', geo.get('href') + stat.geo[0] + ',' + stat.geo[1]);
        geo.removeClass('hidden');
    }

    Y.one('#status ul').append('<li class="status"><h4>' + stat.header + '</h4>' + txt + '</li>');

    if (stat.in_reply_to_status_id) {
        var button1 = Titanium.UI.createButton({
            id: 'reply_button',
            title: 'in reply to @' + stat.in_reply_to_screen_name,
            color: '#ffffff',
            backgroundColor: '#ccc',
            height: 40
        });
        button1.addEventListener('click', function() {
            TT.showLoading('Fetching Status');
            TT.log('Load New Status Window');
            TT.log('Checking Status Cache');
            var rows = db.execute('select * from tweets where (id = ' + stat.in_reply_to_status_id + ')');
            if (rows.isValidRow()) {
                TT.log('Found Status in Cache');
                json = Y.JSON.parse(rows.fieldByName('json'));
                showStatus(json);
                rows.next();
            } else {
                var creds = TT.getCreds();
                var url = TT.proto + ":/"+"/" + creds.login + ":" + creds.passwd + "@twitter.com/statuses/show/" + stat.in_reply_to_status_id + '.json';

                TT.log('URL: ' + url);

                var xhr = Titanium.Network.createHTTPClient();
                xhr.onload = function() {
                    var json = eval('('+this.responseText+')');
                    showStatus(json);
                };
                xhr.open("GET",url);
                xhr.send();
            }
        });
        
    }
 
    var showStatus = function(json) {
        TT.log('Opening Status Window');
        if (json.retweeted_status) {
            Titanium.App.Properties.setString('currentStatus', json.retweeted_status.id);
            Titanium.App.Properties.setList('currentStatusList', json.retweeted_status);
        } else {
            Titanium.App.Properties.setString('currentStatus', json.id);
            Titanium.App.Properties.setList('currentStatusList', json);
        }
        TT.hideLoading();
        
        TT.log('Create status window..');
        var win = Titanium.UI.createWindow({ url: 'status.html' });
        win.open();
    };

    var menu = Titanium.UI.createMenu();

    menu.addItem("Reply", function() {
        
        Titanium.App.Properties.setString('replyTo', stat.user.screen_name);
        Titanium.App.Properties.setString('replyID', stat.id);
        TT.log('Reply to: ' + stat.user.screen_name);
        TT.log('Reply to: ' + stat.id);
        
        var win = Titanium.UI.createWindow({ url: 'post.html' });
        win.open();
    }/*, Titanium.UI.Android.SystemIcon.REPLY*/);
    
    menu.addItem("Retweet", function() {
        
        Titanium.App.Properties.setString('retweetID', stat.id);
        Titanium.App.Properties.setString('retweetStatus', 'RT @' + stat.user.screen_name + ' ' + stat.message);
        TT.log('Retweet: ' + stat.id);
        
        var win = Titanium.UI.createWindow({ url: 'post.html' });
        win.open();
    }/*, Titanium.UI.Android.SystemIcon.REPLY*/);
    
    if (stat.user.following) {
        menu.addItem("Direct Message", function() {
            TT.log('Menu: Direct Message');
            Titanium.App.Properties.setString('directTo', stat.user.screen_name);
            TT.log('Direct Message To: ' + stat.user.screen_name);
            
            var win = Titanium.UI.createWindow({ url: 'post.html' });
            win.open();
        }/*, Titanium.UI.Android.SystemIcon.SEND*/);
        menu.addItem("Unfollow", function() {
            TT.log('Menu: Unfollow');
            TT.showLoading('Unfollowing ' + stat.user.name);
            TT.fetchURL('friendships/destroy/' + stat.user.id + '.json', {
                type: 'POST',
                onload: function() {
                    TT.hideLoading();
                }
            });
        }/*, Titanium.UI.Android.SystemIcon.SEND*/);
    } else {
        menu.addItem("Follow", function() {
            TT.log('Menu: Follow');
            TT.showLoading('Following ' + stat.user.name);
            TT.fetchURL('friendships/create/' + stat.user.id + '.json?follow=true', {
                type: 'POST',
                data: {
                    follow: true
                },
                onload: function() {
                    TT.hideLoading();
                }
            });
            
        }/*, Titanium.UI.Android.SystemIcon.SEND*/);
    }
    
    if (stat.favorited) {
        menu.addItem("Remove Favorite", function() {
            TT.log('Menu: Remove Favorite');
            TT.showLoading('Removing as Favorite', true);
            TT.fetchURL('favorites/destroy/' + stat.id + '.json', {
                stat: 'POST',
                onload: function() {
                    TT.hideLoading();
                }
            });
        }/*, Titanium.UI.Android.SystemIcon.SEND*/);
    } else {
        menu.addItem("Add Favorite", function() {
            TT.log('Menu: Add Favorite');
            TT.showLoading('Marking as Favorite', true);
            TT.fetchURL('favorites/create/' + stat.id + '.json', {
                type: 'POST',
                onload: function() {
                    TT.hideLoading();
                }
            });
        }/*, Titanium.UI.Android.SystemIcon.SEND*/);
    }
    menu.addItem("Report Spam", function() {
        TT.log('Menu: Report Spam');
        TT.not('Report Spam');
    }/*, Titanium.UI.Android.SystemIcon.SEND*/);

    var creds = TT.getCreds();
    if (creds.login !== stat.user.screen_name) {
        Titanium.UI.setMenu(menu);
    }

