var db = Titanium.Database.open('titweeter');
//db.execute('drop table tweets');
db.execute('create table if not exists tweets (id integer, screen_name text, type text, json text)');

//db.execute('delete from tweets');

var TT = {
    lastID: null,
    firstID: null,
    log: function(str) {
        Titanium.API.log('debug', str);
    },
    showError: function(str) {
        TT.hideLoading();
        var a = Titanium.UI.createAlertDialog();
        a.setTitle('Error');
        a.setMessage(str);
        a.show(); 
    },
    not: function(str) {
        TT.hideLoading();
        var a = Titanium.UI.createAlertDialog();
        a.setTitle('Not Implemented Yet');
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
                //xhr._cb = cb.onload;
                xhr.onload = function() {
                    if (this.responseText == 'Bad Gateway') {
                        TT.hideLoading();
                        TT.showError('Fail Whale!!');
                    } else {
                        cb.onload.apply(this);
                    }
                };
            }
            //if (cb.onerror) {
            //    xhr.onerror = cb.onerror;
            //}
        }

        xhr.onerror = function() {
            var err = this.getStatusText();
            TT.log('[ERROR]: Status Text: ' + err);
            switch (err) {
                case 'Bad Gateway':
                    err = 'Fail Whale';
                    break;
                case undefined:
                    err = 'Twitter failed to load.';
                    break;
            }
            TT.showError(err);
        };
        
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

        var str = delta < 5      ? TT.strings.now :
               delta < 60     ? TT.strings.seconds :
               delta < 120    ? TT.strings.minute :
               delta < 3600   ? TT.strings.minutes.replace(/X/, Math.floor(delta/60)) :
               delta < 7200   ? TT.strings.hour :
               delta < 86400  ? TT.strings.hours.replace(/X/, Math.floor(delta/3600)) :
               delta < 172800 ? TT.strings.day :

               TT.strings.days.replace(/X/, Math.floor(delta/86400));
        //TT.log('Date: ' + str + ' :: ' + d + ' :: ' + from);
        return str;
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
    holder: function() {},
    statuses: {},
    showTimeline: function() {
        TT.showLoading('Fetching Timeline Cache..');
        var rows = db.execute('select * from tweets where (type = "timeline") order by id desc'), 
            v;

        TT.log('Loading ' + rows.getRowCount() + ' items from cache');
        
        if (rows.getRowCount() == 0) {
            TT.showTimeline_new();
            return;
        }

        var ul = Y.one('#timeline ul');
        
        while (rows.isValidRow()) {
            //TT.log('Loading Cache: ' + rows.fieldByName('id') + ' :: ' + rows.fieldByName('screen_name'));
            v = TT.formatTimelineRow(Y.JSON.parse(rows.fieldByName('json')));
            var cls = ((v.me) ? ' class="mine"' : '');
            var li = Y.Node.create('<li id="' + v.id + '" ' + cls + '><h2>' + v.header + '</h2><img src="' + v.photo + '"><div class="text">' + TT.filterStatus(v.message) + '</div></li>');
            ul.append(li);
            
            if (!TT.lastID) {
                TT.lastID = v.id;
            }
            TT.firstID = v.id;
            rows.next();
            TT.statuses[v.id] = v;
        }
        // close database
        rows.close();

        TT.hideLoading();

        TT.createTimelineMenu();
        //TT.updateTimelines();
        window.setTimeout(TT.updateTimelines, 200);
        TT.checker = window.setInterval(TT.updateTimelines, (2000 * 60));
    },
    showTimeline_new: function() {
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
                    info = TT.formatTimelineRow(row, 'timeline');
                    data.push(info);
                }
                
                TT.showLoading('Using YUI3 to load Timeline...');
                TT.log('YUI().use()');

                var ul = Y.one('#timeline ul');

                Y.each(data, function(v) {
                    var cls = ((v.me) ? ' class="mine"' : '');
                    //TT.log('Header: ' + v.header);
                    var li = Y.Node.create('<li id="' + v.id + '" ' + cls + '><h2>' + v.header + '</h2><img src="' + v.photo + '"><div class="text">' + TT.filterStatus(v.message) + '</div></li>');
                    ul.append(li);
                });
                
                TT.hideLoading();
                TT.checker = window.setInterval(TT.updateTimelines, (2000 * 60));
            },
            onerror: function() {
                TT.log('Status Text: ' + this.getStatusText());
                TT.log('Response: ' + this.getResponseText());
            }
        });
        
        TT.createTimelineMenu();
    },
    createTimelineMenu: function() {
        var menu = Titanium.UI.createMenu();

        menu.addItem("Post", function() {
            win = Titanium.UI.createWindow({ url: 'post.html' });
            win.open();
        }/*, Titanium.UI.Android.SystemIcon.COMPOSE*/);

        menu.addItem("Refresh", function() {
            TT.log('Menu: Refresh Timeline');
            TT.updateTimelines();
        }/*, Titanium.UI.Android.SystemIcon.VIEW*/);

        menu.addItem("Mentions", function() {
            TT.log('Menu: Mentions');
            TT.not('Mentions');
        }/*, Titanium.UI.Android.SystemIcon.ZOOM*/);

        menu.addItem("Directs", function() {
            TT.log('Menu: Directs');
            TT.not('Directs');
        }/*, Titanium.UI.Android.SystemIcon.SEND*/);

        menu.addItem("Friends", function() {
            TT.log('Menu: Friends');
            TT.showFriends();
        }/*, Titanium.UI.Android.SystemIcon.SEARCH*/);

        menu.addItem("Search", function() {
            TT.log('Menu: Search');
            TT.not('Search');
        }/*, Titanium.UI.Android.SystemIcon.SEARCH*/);

        menu.addItem("Options", function() {
            TT.log('Menu: Options');
            TT.showSettings();
        }/*, Titanium.UI.Android.SystemIcon.PREFERENCES*/);

        Titanium.UI.setMenu(menu);
    },
    showFriends: function() {
        win = Titanium.UI.createWindow({ url: 'friends.html' });
        win.open();
    },
    filterStatus: function(txt) {
        //Filter URL's
        txt = txt.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/g, function(url) {
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
    formatTimelineRow: function(row, cache) {
        var d = '<em>' + TT.toRelativeTime(new Date(row.created_at)) + '</em>',
            s = row.source, a,
            div = document.createElement('div'),
            username = row.user.name,
            img = row.user.profile_image_url,
            txt = row.text,
            user = row.user;

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
            user = row.retweeted_status.user;
            s = ' retweeted by ' + row.user.name + ' ' + d;
            d = '';
        }
        
        var info = {
            id: row.id,
            created_at: row.created_at,
            user: user,
            user_id: user.id,
            message: txt,
            photo: img,
            header: username + ': ' + d + s,
            json: row,
            me: false,
            geo: false
        };

        Y.each(row, function(v, k) {
            if (!info[k]) {
                info[k] = v;
            }
        });
 
        if (row.user.screen_name == TT.creds.login) {
            info.me = true;
        }

        if (row.geo) {
            info.geo = row.geo.coordinates;
            info.header = info.header += ' <img src="css/map.gif">';
        }
        
        if (!TT.statuses[row.id]) {
            TT.statuses[row.id] = info;
        }
        
        if (!cache) {
            cache = 'status';
        }
        var rows = db.execute('select * from tweets where (id = ' + info.id + ')');
        if (rows.isValidRow()) {
            rows.next();
        } else {
            var sql = 'insert into tweets (id, screen_name, type, json) values (?, ?, ?, ?)';
            //TT.log('SQL: ' + sql);
            db.execute(sql, info.id, info.user.screen_name, cache, Titanium._JSON(row));
        }
        rows.close();

        return info;
        
    },
    updateTimelines: function() {
        TT.log('updateTimelines: ' + new Date());
        TT.showLoading('reloading', true);
        
        TT.updateTimeStamps();
        
        var url = 'statuses/home_timeline.json?count=50';
            if (TT.lastID) {
                url = 'statuses/home_timeline.json?since_id=' + TT.lastID;
            }
        TT.fetchURL(url, {
            onload: function() {
                TT.log('TimelineUpdateXHR Loaded');
                var json = eval('(' + this.responseText + ')'),
                    set = true, c = 0, row, info, data = [],
                    f = Y.one('#timeline ul li'),
                    ul = Y.one('#timeline ul');

                for (c = 0; c < json.length; c++) {
                    row = json[c];
                    if (set) {
                        TT.lastID = row.id;
                        set = false;
                    }
                    TT.firstID = row.id;
                    info = TT.formatTimelineRow(row, 'timeline');
                    var cls = ((info.me) ? ' class="mine"' : '');
                    TT.log('Update Header: ' + info.header);
                    var li = Y.Node.create('<li id="' + info.id + '" ' + cls + '><h2>' + info.header + '</h2><img src="' + info.photo + '"><div class="text">' + TT.filterStatus(info.message) + '</div></li>');
                    ul.insertBefore(li, f);
                }

                TT.hideLoading();
            },
            onerror: function() {
                TT.log('Status Text: ' + this.getStatusText());
                TT.log('Response: ' + this.getResponseText());
            }
        });
    },
    updateTimeStamps: function() {
        TT.log('update time stamps');
        var ems = Y.all('#timeline em');
        TT.log('Updating ' + ems.size() + ' stamps');
        ems.each(function(v) {
            var id = v.get('parentNode.parentNode.id');
            //TT.log(Y.JSON.stringify(TT.statuses[id]));
            var str = TT.toRelativeTime(new Date(TT.statuses[id].created_at));
            v.set('innerHTML', str);
        });
    },
    showSettings: function() {
        TT.log('TT.showSettings');
        var win = Titanium.UI.createWindow({ url: 'settings.html', fullscreen: true });
        win.open();
    },
    formatProfileHeader: function(user) {
        Y.one('#status img').set('src', user.profile_image_url).on('click', TT.showUserProfile);
        Y.one('#status h1').set('innerHTML', user.name).on('click', TT.showUserProfile);
        Y.one('#status h3').set('innerHTML', '@' + user.screen_name).on('click', TT.showUserProfile);
        Y.one('#status em').set('innerHTML', user.followers_count);
        Y.one('#status strong').set('innerHTML', user.friends_count);
        if (user.url) {
            Y.one('#status a.url').set('href', user.url).set('innerHTML', user.url).removeClass('hidden');
        }
        Y.one('#status p').set('innerHTML', user.description);
    },
    showUserProfile: function(e) {
        if (e) {
            e.halt();
        }
        TT.showProfile({ id: stat.user.screen_name });
    }

};

var Y;

YUI().use('*', function(Yc) {
    Y = Yc;
});

TT.getCreds();

Y.delegate('click', function(e) {
    var cls = e.currentTarget.get('className'),
    href = e.currentTarget.get('href');
    TT.log('[DELEGATE]: Click: ' + cls);
    switch (cls) {
        case 'profile':
            TT.showProfile({ id: href.replace('http:/'+'/twitter.com/', '') });
            e.halt();
            break;
        case 'search':
            //TODO
            break;
        case 'url':
            if (href.indexOf('twitpic.com') !== -1) {
                TT.log('Found Twitpic URL');
                //Filter TwitPic
                var url = href.replace('http:/'+'/twitpic.com/', 'http:/'+'/twitpic.com/show/full/');
                TT.log('Twitpic URL: ' + url);
                TT.showImage(url);
                e.halt();
            }
            //TODO
            break;
    }
}, 'body', 'a');

Y.delegate('click', function(e) {
    var id = e.currentTarget.get('parentNode.id'),
    status = TT.getTrueStatus(TT.statuses[id]);

    TT.log('Clicked on profile image: ' + id);
    TT.showProfile(status.user);
}, '#timeline', 'img');

Y.delegate('click', function(e) {
    var id = e.currentTarget.get('parentNode.id'),
    status = TT.getTrueStatus(TT.statuses[id]);
    TT.log('currentStatus: ' + status.id);

    Titanium.App.Properties.setString('currentStatus', status.id);
    Titanium.App.Properties.setList('currentStatusList', status);

    TT.log('Create status window..');
    
    var win = Titanium.UI.createWindow({ url: 'status.html' });
    win.open();
}, '#timeline', 'div');
