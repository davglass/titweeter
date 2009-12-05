var TT = {
    db: null,
    Views: {},
    lastID: null,
    firstID: null,
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
    showLoading: function(str, bar) {
        TT.log('show loading indicator');
        var ind;
        str = ((str) ? str : 'Loading..');
        if (TT._loading) {
            ind = TT._loading
        } else {
            var ind = Titanium.UI.createActivityIndicator();
        }
        ind.setMessage(str);
        if (bar) {
            ind.setLocation(Titanium.UI.ActivityIndicator.STATUS_BAR);
        } else {
            ind.setLocation(Titanium.UI.ActivityIndicator.DIALOG);
        }
        ind.setType(Titanium.UI.ActivityIndicator.INDETERMINANT);
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
        Titanium.App.Properties.setString('LOGIN', l);
        Titanium.App.Properties.setString('PASSWD', p);
    },
    showImage: function(url) {
        TT.log('showImage: ' + url);
        var ImageWindow = Titanium.UI.createWindow({
            url: url,
            hideTabBar: 'true',
            hideNavBar: 'true'
        });
        ImageWindow.open({
            modal: true,
            animated: true
        });
    },
    fetchURL: function(url, cb) {
        var creds = TT.getCreds(),
            xhr = Titanium.Network.createHTTPClient(),
            meth = 'GET', o = null,
            url = TT.proto + ':/'+'/' + creds.login + ':' + creds.passwd + '@twitter.com/' + url;

        if (cb) {
            if (cb.type) {
                meth = cb.type;
            }
            if (cb.data) {
                o = TT.stringifyObject(cb.data);
            }
            if (cb.onload) {
                xhr.onload = cb.onload;
            }
            if (cb.onerror) {
                xhr.onerror = cb.onerror;
            }
        }
        
        TT.log('Method: ' + meth);
        TT.log('URL: ' + url);
        TT.log('Send: ' + o);
        xhr.open(meth, url);
        xhr.send(o);
    },
    stringifyObject: function(o) {
        var str = '', i;
        for (i in o) {
            str += '&' + i + '=' + Titanium.Network.encodeURIComponent(o[i]);
        }
        return str;
    },
    getCreds: function() {
        var creds = {
            login: Titanium.App.Properties.getString('LOGIN'),
            passwd: Titanium.App.Properties.getString('PASSWD')
        };

        TT.creds = creds;

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
    getTrueStatus: function(d) {
        if (d.retweeted_status) {
            return d.retweeted_status;
        } else {
            return d;
        }
    },
    showProfile: function(user) {
        TT.log('Loading ShowProfile: ' + user.id);
        Titanium.App.Properties.setString('currentUser', user.id);
        win = Titanium.UI.createWindow({ url: 'profile.html' });
        win.open();
    },
    createTimelineView: function(data, cb, layout_custom) {

        var template = {
            selectedBackgroundColor: '#fff',
            backgroundColor: '#ffffff',
            rowHeight: 50,
            layout: [
                { type: 'image', left: 5, top: 5, width: 36, height: 36, name: 'photo' },
                { type: 'text', fontSize: 11, fontWeight: 'normal', left: 49, right: 4, top: 3, color: '#222', name: 'message' },
                { type: 'image', right: 5, top: 5, width: 36, height: 36, name: 'photo_me' },
                { type: 'text', fontSize: 11, fontWeight: 'normal', right: 50, left: 2, top: 3, color: '#222', name: 'message_me' },
                { type: 'text', fontSize: 11, fontWeight: 'normal', left: 3, right: 4, top: 3, color: '#222', name: 'message_nopic' }                 
            ]
        };
        if (layout_custom && layout_custom.length) {
            TT.log('Found Custom Layout, Applying..');
            for (var i in layout_custom) {
                template.layout.push(layout_custom[i]);
            }
        }

        var tableView = Titanium.UI.createTableView({
            template: template,
            data: data,
            rowHeight: 60
        }, cb);

        return tableView;
    },
    holder: function() {},
    showTimelineView: function() {
        TT.showLoading('Fetching Timeline..');

        TT.fetchURL('statuses/home_timeline.json?count=50', {
            onload: function() {
                TT.showLoading('Parsing Timeline..');
                TT.log('TimelineXHR Loaded');
                var json = eval('(' + this.responseText + ')'),
                    set = true, c = 0, row, info,
                    data = [];

                for (var c = 0; c < json.length; c++) {
                    var row = json[c];
                    if (!TT.lastID) {
                        TT.lastID = row.id;
                    }
                    TT.firstID = row.id;
                    info = TT.formatTimelineRow(row);
                    data.push(info);
                }


                var tableView = TT.createTimelineView(data, function(e) {
                    TT.log('TableView clicked..');
                    var name = e.layoutName,
                        status = TT.getTrueStatus(e.rowData.json);

                    if (name && (name == 'photo') || (name == 'photo_me')) {
                        TT.log('Show Profile: ' + status.user.screen_name);
                        TT.showProfile(status.user);
                    } else {
                        TT.log('currentStatus: ' + status.id);

                        Titanium.App.Properties.setString('currentStatus', status.id);
                        Titanium.App.Properties.setList('currentStatusList', status);

                        TT.log('Create status window..');
                        
                        var win = Titanium.UI.createWindow({ url: 'status.html' });
                        win.open();
                    }
                });

                Titanium.UI.currentWindow.addView(tableView);
                Titanium.UI.currentWindow.showView(tableView);
                TT.hideLoading();
                TT.Views.Timeline = tableView;
                TT.checker = window.setInterval(TT.updateTimelines, (2000 * 60));
            },
            onerror: function() {
                TT.log('Status Text: ' + this.getStatusText());
                TT.log('Response: ' + this.getResponseText());
            }
        });
        
        var menu = Titanium.UI.createMenu();

        menu.addItem("Post", function() {
            win = Titanium.UI.createWindow({ url: 'post.html' });
            win.open();
        }/*, Titanium.UI.Android.SystemIcon.COMPOSE*/);

        menu.addItem("Timeline", function() {
            TT.log('Menu: Timeline');
        }/*, Titanium.UI.Android.SystemIcon.VIEW*/);

        menu.addItem("Mentions", function() {
            TT.log('Menu: Mentions');
        }/*, Titanium.UI.Android.SystemIcon.ZOOM*/);

        menu.addItem("Directs", function() {
            TT.log('Menu: Directs');
        }/*, Titanium.UI.Android.SystemIcon.SEND*/);

        menu.addItem("Search", function() {
            TT.log('Menu: Search');
        }/*, Titanium.UI.Android.SystemIcon.SEARCH*/);

        menu.addItem("Options", function() {
            TT.log('Menu: Options');
            TT.showSettings();
        }/*, Titanium.UI.Android.SystemIcon.PREFERENCES*/);

        menu.addItem("Exit", function() {
            TT.log('Menu: EXIT');
            Titanium.currentWindow.close();
        }/*, Titanium.UI.Android.SystemIcon.CLOSE*/);

        Titanium.UI.setMenu(menu);
    },
    filterStatus: function(txt) {
        //Filter URL's
        txt = txt.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/, function(url) {
            return '<a href="' + url + '" class="url">' + url + '</a>';
        });
        
        //Filter @messages
        //Hook profile view up here..
        txt = txt.replace(/[@]+[A-Za-z0-9-_]+/g, function(f, n, s) {
            return '<a href="http:/'+'/twitter.com/' + f.replace('@', '') + '" class="profile">' + f + '</a>';
        });
        
        //Filter #hashtags
        //Hook search view up here..
        txt = txt.replace(/[#]+[A-Za-z0-9-_]+/g, function(f, n, s) {
            return '<a href="http:/'+'/search.twitter.com/search?q=' + f.replace('#', '%23') + '" class="search">' + f + '</a>';
        });
        
        return txt;
    },
    formatTimelineRow: function(row) {
        var d = TT.toRelativeTime(new Date(row.created_at)),
            s = row.source, a,
            div = document.createElement('div'),
            username = row.user.name,
            img = row.user.profile_image_url,
            txt = row.text;

        div.innerHTML = s;
        a = div.firstChild;
        if (a.nodeName == 'A') {
            s = a.innerHTML;
        }

        s = ' from ' + s;
        if (row.in_reply_to_status_id) {
            s = ' in reply to ' + row.in_reply_to_screen_name;
        }

        if (row.retweeted_status) {
            username = row.retweeted_status.user.name;
            img = row.retweeted_status.user.profile_image_url;
            txt = row.retweeted_status.text;
            s = ' retweeted by ' + row.user.name + ' ' + d;
            d = '';
        }
        

        var info = {
            message: txt,
            photo: img,
            header: username + ': ' + d + s,
            json: row
        };
 
        if (row.user.screen_name == TT.creds.login) {
            info.message_me = info.message;
            info.photo_me = info.photo;
            delete info.photo;
            delete info.message;

        }

        return info;
        
    },
    updateTimelines: function() {
        TT.log('updateTimelines: ' + new Date());
        TT.showLoading('reloading', true);
        
        TT.fetchURL('statuses/home_timeline.json?since_id=' + TT.lastID, {
            onload: function() {
                TT.log('TimelineUpdateXHR Loaded');
                var json = eval('(' + this.responseText + ')'),
                    set = true, c = 0, row, info;

                for (c = 0; c < json.length; c++) {
                    row = json[c];
                    if (set) {
                        TT.lastID = row.id;
                        set = false;
                    }
                    TT.firstID = row.id;
                    info = TT.formatTimelineRow(row);
				    TT.Views.Timeline.insertRowBefore(0, info);
                }
                TT.hideLoading();
            },
            onerror: function() {
                TT.log('Status Text: ' + this.getStatusText());
                TT.log('Response: ' + this.getResponseText());
            }
        });
    },
    showSettings: function() {
        TT.log('TT.showSettings');
        var win = Titanium.UI.createWindow({ url: 'settings.html', fullscreen: true });
        win.open();
    }
};


