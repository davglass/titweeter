    var db = Titanium.Database.open('titweeter'),
        login, passwd;

    db.execute('create table if not exists accounts (login text, passwd text)');

    //Check for credentials
    var rows = db.execute('select * from accounts');

    while (rows.isValidRow()) {
        login = rows.fieldByName('login');
        passwd = rows.fieldByName('passwd');
        rows.next();
    }
    rows.close();
    
    if (login && passwd) {
        Titanium.API.log('debug', 'Found Login and Password');
        Titanium.API.log('debug', 'Login: ' + login);
        Titanium.API.log('debug', 'Passwd: ' + passwd);

        var activityIndicator = Titanium.UI.createActivityIndicator();
        Titanium.UI.currentWindow.setRightNavButton(activityIndicator);
        var url = "http:/"+"/" + login + ":" + passwd + "@twitter.com/statuses/friends_timeline.json?count=50";

        Titanium.API.log('debug', 'URL: ' + url);

        var xhr = Titanium.Network.createHTTPClient();
        xhr.onload = function() {
            Titanium.API.log('debug', 'XHR Loaded');
            var json = eval('('+this.responseText+')');
            var data = [];
            for (var c = 0; c < json.length; c++) {
                var row = json[c];

                var bgcolor = "";
                if (Titanium.Platform.name == 'android') {
                    bgcolor = (c % 2) == 0 ? 'background-color:#333;color:white' : 'background-color:#eee';
                } else {
                    bgcolor = (c % 2) == 0 ? '' : 'background-color:#eee';
                }
                var html = "<div style='position:relative;padding:0;height:80px;"+bgcolor+"'>";
                html += "<div style='position:absolute;left:0;top:5px;border:2px solid #999;'><img src='"+row.user.profile_image_url+"'/></div>";
                html+='<div style="position:absolute;top:6px;left:60px;height:70px;font-size:11px;">'+row.text+'</div>';
                html+="</div>";

                data[c] = {html:html};
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
