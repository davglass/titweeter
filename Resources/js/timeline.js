    var db = Titanium.Database.open('titweeter'),
        login, passwd;

    db.execute('create table if not exists accounts (login text, passwd text)');

    //Check for credentials
    Titanium.API.log('debug', 'Fetching from accounts');
    var rows = db.execute('select * from accounts');

    if (rows.isValidRow()) {
        Titanium.API.log('debug', 'Got a record');
        login = rows.fieldByName('login');
        passwd = rows.fieldByName('passwd');
    }
    rows.close();
    
    if (login && passwd) {
        Titanium.API.log('debug', 'Found Login and Password');
        Titanium.API.log('debug', 'Login: ' + login);
        Titanium.API.log('debug', 'Passwd: ' + passwd);

        var activityIndicator = Titanium.UI.createActivityIndicator();
        Titanium.UI.currentWindow.setRightNavButton(activityIndicator);
        var url = "http:/"+"/" + login + ":" + passwd + "@twitter.com/statuses/friends_timeline.json?count=25";

        Titanium.API.log('debug', 'URL: ' + url);

        var xhr = Titanium.Network.createHTTPClient();
        xhr.onload = function() {
            Titanium.API.log('debug', 'XHR Loaded');
            var json = eval('('+this.responseText+')');
            var data = [];
            for (var c = 0; c < json.length; c++) {
                var row = json[c];
                var color = (((c % 2) == 0) ? '#ccc' : '#eee');
                var d = toRelativeTime(new Date(row.created_at));

                var html = '<div class="timeline_post" style="position: relative; color: black; font-size: 10px; height: 80px;">';
                html += '<h2 style="font-weight: bold; font-size: 10px; color: #fff;">' + row.user.name + ': ' + d + ' from ' + row.source + '</h2>';
                html += '<img src="' + row.user.profile_image_url + '" style="height: 36px; width: 36px; position: absolute; top: 14px; left: 0;">';
                html += '<div class="text" style="padding: 4px; position: absolute; top: 14px; left: 43px; background-color: ' + color + '; -webkit-border-radius: 4px; border: 1px solid ' + color + ';">';
                html += row.text + '</div>';
                html += "</div>";

                data[c] = { html: html };
            }
            var tableView = Titanium.UI.createTableView({data:data,rowHeight:80},function(){});
            Titanium.UI.currentWindow.addView(tableView);
            Titanium.UI.currentWindow.showView(tableView);

            var close = Titanium.UI.createButton({title:'Logout'});
            Titanium.UI.currentWindow.setRightNavButton(close);
            close.addEventListener('click',function()
            {
                Titanium.UI.currentWindow.close();
            });
        };
        xhr.open("GET",url);
        xhr.send();
    } else {
        Titanium.API.log('debug', 'No Creds, loading login screen');
		var w = Titanium.UI.createWindow({ url: 'login.html', hideTabBar: 'true', hideNavBar: 'true' });
		w.open();        
    }


    function toRelativeTime(d,from) {
        d = d || new Date();
        from = from || new Date();

        var delta = (from.getTime() - d.getTime()) / 1000;

        return delta < 5      ? toRelativeTime.strings.now :
               delta < 60     ? toRelativeTime.strings.seconds :
               delta < 120    ? toRelativeTime.strings.minute :
               delta < 3600   ? toRelativeTime.strings.minutes.
                                    replace(/X/, Math.floor(delta/60)) :
               delta < 7200   ? toRelativeTime.strings.hour :
               delta < 86400  ? toRelativeTime.strings.hours.
                                    replace(/X/, Math.floor(delta/3600)) :
               delta < 172800 ? toRelativeTime.strings.day :

               toRelativeTime.strings.days.
                                    replace(/X/, Math.floor(delta/86400));
    }

    /**
     * The strings to use for relative times.  Represent Numbers (minutes, hours,
     * days) as X (e.g. "about X hours ago"). Keys are now, seconds, minute,
     * minutes, hour, hours, day, and days.
     *
     * @property toRelativeTime.strings
     * @type {Object}
     */
    toRelativeTime.strings = {
        now     : "right now",
        seconds : "less than a minute ago",
        minute  : "about a minute ago",
        minutes : "X minutes ago",
        hour    : "about an hour ago",
        hours   : "about X hours ago",
        day     : "1 day ago" ,
        days    : "X days ago"
    };
    
