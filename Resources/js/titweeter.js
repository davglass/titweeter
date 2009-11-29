var TT = {
    db: null,
    users: {},
    statuses: {},
    openDB: function(){
        TT.db = Titanium.Database.open('titweeter'); 
        return TT.db;
    },
    log: function(str) {
        Titanium.API.log('debug', str);
    },
    showError: function(str) {
        var a = Titanium.UI.createAlertDialog();
        a.setTitle('Error');
        a.setMessage(str);
        a.show(); 
    
    },
    getCreds: function() {
        var creds = {
            login: null,
            passwd: null
        };
        //Debugging
        //TT.db.execute('delete from accounts');
        var rows = TT.db.execute('select * from accounts');

        if (rows.isValidRow()) {
            TT.log('Got a record');
            creds.login = rows.fieldByName('login');
            creds.passwd = rows.fieldByName('passwd');
        }
        rows.close();

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
    hideLoading: function() {
        document.getElementById('loading').style.display = 'none';
    },
    showTimeline: function(creds) {
        TT.log('Loading the WebView Timeline');
        TT.hideLoading();
        TT.log('Found Login and Password');
        TT.log('Login: ' + creds.login);
        TT.log('Passwd: ' + creds.passwd);

        var activityIndicator = Titanium.UI.createActivityIndicator();
        Titanium.UI.currentWindow.setRightNavButton(activityIndicator);
        var url = "http:/"+"/" + creds.login + ":" + creds.passwd + "@twitter.com/statuses/home_timeline.json?count=50";

        TT.log('URL: ' + url);

        var xhr = Titanium.Network.createHTTPClient();
        xhr.onload = function() {
            TT.log('XHR Loaded');
            var json = eval('(' + this.responseText + ')');
            var data = [],
                ul = document.createElement('ul');
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
                var username = row.retweeted_status.user.name,
                    img = row.retweeted_status.user.profile_image_url,
                    txt = row.retweeted_status.text;
                    s = ' retweeted by ' + row.user.name + ' ' + d;
                    d = '';
                }

                var html = '';
                html += '<h2>' + username + ': ' + d + s + '</h2>';
                html += '<img src="' + img + '">';
                html += '<div class="text">' + txt + '</div>';

                var li = document.createElement('li');
                li.id = 'status_' + row.id
                li.innerHTML = html;
                if (row.user.screen_name == creds.login) {
                    li.className = 'mine';
                }
                ul.appendChild(li);

                data[c] = { html: html };
            }

            var ti = document.getElementById('timeline');
            ti.appendChild(ul);
            ti.style.display = 'block';

            YUI().use('node', function(Y) {
                Y.delegate('click', function(e) {
                    TT.log('Click: ' + e.currentTarget.one('.text').get('innerHTML'));
                    var id = parseInt(e.currentTarget.get('id').replace('status_', ''), 10);
                    TT.showStatus(id);
                }, '#timeline', 'li');
            });

        };
        xhr.open("GET",url);
        xhr.send();
        
    },
    showStatus: function(id) {
        var win = Titanium.UI.createWindow({ url: 'status.html' });
        win.open({ animated: true });
        
        TT.currentStatus = TT.statues[id];
            
    },
    showTimelineView: function(creds) {
        TT.hideLoading();
        TT.log('Found Login and Password');
        TT.log('Login: ' + creds.login);
        TT.log('Passwd: ' + creds.passwd);

        var activityIndicator = Titanium.UI.createActivityIndicator();
        Titanium.UI.currentWindow.setRightNavButton(activityIndicator);
        var url = "http:/"+"/" + creds.login + ":" + creds.passwd + "@twitter.com/statuses/friends_timeline.json?count=25";

        TT.log('URL: ' + url);

        var xhr = Titanium.Network.createHTTPClient();
        xhr.onload = function() {
            TT.log('XHR Loaded');
            var json = eval('('+this.responseText+')');
            var data = [];
            for (var c = 0; c < json.length; c++) {
                var row = json[c];
                TT.users[row.user.id] = row.user;
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
                    s = ' in reply to FOO';
                }

                var html = '<div class="timeline_post" style="position: relative; color: black; font-size: 10px; height: 88px;">';
                html += '<h2 style="font-weight: bold; font-size: 10px; color: #fff;">' + row.user.name + ': ' + d + s + '</h2>';
                html += '<img src="' + row.user.profile_image_url + '" style="height: 36px; width: 36px; position: absolute; top: 14px; left: 0;">';
                html += '<div class="text" style="padding: 4px; position: absolute; top: 14px; left: 43px; font-size: 11px; background-color: ' + color + '; -webkit-border-top-right-radius: 4px; -webkit-border-bottom-left-radius: 4px; border: 1px solid ' + color + ';">';
                html += row.text + '</div>';
                html += "</div>";

                data[c] = { html: html };
            }
            var tableView = Titanium.UI.createTableView({ data: data, rowHeight: 90 },function (e) {
                TT.log('TableView clicked..');
                /*
                var a = Titanium.UI.createAlertDialog();
                    a.setTitle('Table View');
                    //a.setMessage('row ' + e.row + ' index ' + e.index + ' section ' + e.section + ' rowData ' + e.rowData);
                    a.setMessage(json[e.index].text);
                    a.show(); 
                */
            });
            Titanium.UI.currentWindow.addView(tableView);
            Titanium.UI.currentWindow.showView(tableView);

        };
        xhr.open("GET",url);
        xhr.send();
    
    },
    showLogin: function() {
        document.title = 'Titweeter: Login';
		var height = (Titanium.Platform.name.indexOf('iPhone') != -1) ? 30: 40;
		var tf1 = Titanium.UI.createTextField({
			id:'textfield1',
			value:'',
			keyboardType:Titanium.UI.KEYBOARD_EMAIL,
			hintText:'enter username',
			width:170,
			height:height,
			clearOnEdit:true,
			borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
			clearButtonMode:Titanium.UI.INPUT_BUTTONMODE_ALWAYS
		});
		var tf2 = Titanium.UI.createTextField({
			id:'textfield2',
			value:'',
			keyboardType:Titanium.UI.KEYBOARD_ASCII,
			hintText:'enter password',
			width:170,
			height:height,
			clearOnEdit:true,
			passwordMask:true,
			borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
			clearButtonMode:Titanium.UI.INPUT_BUTTONMODE_ALWAYS
		});
		var button = Titanium.UI.createButton({
			id:'button',
			title:'Login',
			color:'#336699',
			height:32,
			width:100,
			fontSize:12,
			fontWeight:'bold'
		});
		button.addEventListener('click', function() {
            TT.log('Checking Creds');
			// hide the keyboards if they're showing
			tf1.blur();
			tf2.blur();

			var login = tf1.value,
			    passwd = tf2.value,
                url = 'https:/'+'/' + login + ':' + passwd + '@twitter.com/account/verify_credentials.json',
                xhr = Titanium.Network.createHTTPClient();

            if (login != '' && passwd != '') {
                TT.log('Fetching URL: ' + url);
                xhr.onload = function() {
                    TT.log('Verify Creds');
                    var json = eval('('+this.responseText+')');
                    if (json.error) {
                        TT.log('ERROR: ' + json.error);
                        TT.showError(json.error);
                    } else {
                        TT.db.execute('delete from accounts');
                        TT.db.execute('insert into accounts (login, passwd) values ("' + login + '", "' + passwd + '")');
                        
                        TT.db.close();
                        TT.log('Close Login Window');
                        document.getElementById('login').style.display = 'none';
                        TT.showTimeline({
                            login: login,
                            passwd: passwd
                        });
                    }

                };
                xhr.open("GET",url);
                xhr.send();
            } else {
                TT.log('Show Error');
                if (!login) {
                    TT.showError('Username is required');
			        tf1.focus();
                } else {
                    TT.showError('Password is required');
			        tf2.focus();
                }
            }

		});
    
    }
};
