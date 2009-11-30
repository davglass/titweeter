var TT = {
    db: null,
    users: {},
    statuses: {},
    log: function(str) {
        Titanium.API.log('debug', str);
    },
    showError: function(str) {
        var a = Titanium.UI.createAlertDialog();
        a.setTitle('Error');
        a.setMessage(str);
        a.show(); 
    
    },
    proto: 'http',
    _loading: null,
    showLoading: function(str) {
        TT.log('show loading indicator');
        str = ((str) ? str : 'Loading..');
        var ind = Titanium.UI.createActivityIndicator();
        ind.setMessage(str);
        ind.setLocation(Titanium.UI.ActivityIndicator.DIALOG)
        ind.setType(Titanium.UI.ActivityIndicator.INDETERMINANT)
        ind.show();
        TT._loading = ind;
    },
    hideLoading: function() {
        TT.log('hide loading indicator');
        if (TT._loading) {
            TT._loading.hide();
        }
    },
    setCreds: function(l, p) {
        Titanium.App.Properties.setString('LOGIN', l),
        Titanium.App.Properties.setString('PASSWD', p)
    },
    getCreds: function() {
        var creds = {
            login: Titanium.App.Properties.getString('LOGIN'),
            passwd: Titanium.App.Properties.getString('PASSWD')
        };

        return creds;
    },
    toRelativeTime: function(d,from) {
        d = d || new Date();
        from = from || new Date();

        var delta = (from.getTime() - d.getTime()) / 1000;

        return delta < 5      ? TT.strings.now :
               delta < 60     ? TT.strings.seconds :
               delta < 120    ? TT.strings.minute :
               delta < 3600   ? TT.strings.minutes.replace(/X/, Math.floor(delta/60)) :
               delta < 7200   ? TT.strings.hour :
               delta < 86400  ? TT.strings.hours.replace(/X/, Math.floor(delta/3600)) :
               delta < 172800 ? TT.strings.day :

               TT.strings.days.replace(/X/, Math.floor(delta/86400));
    },
    strings: {
        now     : "right now",
        seconds : "less than a minute ago",
        minute  : "about a minute ago",
        minutes : "X minutes ago",
        hour    : "about an hour ago",
        hours   : "about X hours ago",
        day     : "1 day ago" ,
        days    : "X days ago"
    },
    showTimelineView: function(creds) {
        TT.log('Found Login and Password');
        TT.log('Login: ' + creds.login);
        TT.log('Passwd: ' + creds.passwd);

        var activityIndicator = Titanium.UI.createActivityIndicator();
        Titanium.UI.currentWindow.setRightNavButton(activityIndicator);
        var url = TT.proto + ":/"+"/" + creds.login + ":" + creds.passwd + "@twitter.com/statuses/home_timeline.json?count=50";

        TT.log('URL: ' + url);

        var xhr = Titanium.Network.createHTTPClient();
        xhr.onload = function() {
            TT.log('XHR Loaded');
            var json = eval('('+this.responseText+')');
            var data = [];
            for (var c = 0; c < json.length; c++) {
                var row = json[c];
                TT.users[row.user.id] = row.user;
                TT.statuses[row.id] = row;
            }
            for (var c = 0; c < json.length; c++) {
                var row = json[c];
                var color = (((c % 2) == 0) ? '#ccc' : '#eee');
                var d = TT.toRelativeTime(new Date(row.created_at));
                var s = row.source;
                var div = document.createElement('div');
                div.innerHTML = s;
                var a = div.firstChild;
                if (a.nodeName == 'A') {
                    s = a.innerHTML;
                }

                s = ' from ' + s;
                if (row.in_reply_to_status_id) {
                    s = ' in reply to ' + row.in_reply_to_screen_name;
                }
 
                var username = row.user.name,
                    img = row.user.profile_image_url,
                    txt = row.text;
                if (row.retweeted_status) {
                    username = row.retweeted_status.user.name;
                    img = row.retweeted_status.user.profile_image_url;
                    txt = row.retweeted_status.text;
                    s = ' retweeted by ' + row.user.name + ' ' + d;
                    d = '';
                }
                

                var html = '<div class="timeline_post" style="position: relative; color: black; font-size: 10px; height: 88px;">';
                html += '<h2 style="font-weight: bold; font-size: 10px; color: #fff;">' + username + ': ' + d + s + '</h2>';
                html += '<img src="' + img + '" style="height: 36px; width: 36px; position: absolute; top: 14px; left: 0;">';
                html += '<div class="text" style="padding: 4px; position: absolute; top: 14px; left: 43px; font-size: 11px; background-color: ' + color + '; -webkit-border-top-right-radius: 4px; -webkit-border-bottom-left-radius: 4px; border: 1px solid ' + color + ';">';
                html += txt + '</div>';
                html += "</div>";

                data[c] = { html: html };
            }
            var tableView = Titanium.UI.createTableView({ data: data, rowHeight: 90 },function (e) {
                TT.log('TableView clicked..');

                TT.log('currentStatus: ' + json[e.index].id);
                Titanium.App.Properties.setString('currentStatus', json[e.index].id);
                Titanium.App.Properties.setList('currentStatusList', json[e.index]);
                
                TT.log('Create status window..');
                
                var win = Titanium.UI.createWindow({ url: 'status.html' });
                win.open();
            });
            Titanium.UI.currentWindow.addView(tableView);
            Titanium.UI.currentWindow.showView(tableView);
            TT.hideLoading();
            
        };
        xhr.open("GET",url);
        xhr.send();
    
    },
    showSettings: function() {
        TT.log('TT.showSettings');
        var win = Titanium.UI.createWindow({ url: 'settings.html', fullscreen: true });
        win.open();
    }
};


