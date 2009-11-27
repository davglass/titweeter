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
                

                var html = '<div class="timeline_post" style="position:relative; background-color: ' + color + '; color: black; font-size: 12px; height: 80px;">';
                html += '<img src="' + row.user.profile_image_url + '" style="height: 48px; width: 48px; position: absolute; top: 3px; left: 3px;">';
                html += '<div class="text" style="padding: 2px; position: absolute; top: 3px; left: 52px;">' + row.text + '</div>';
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
