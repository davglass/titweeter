
    TT.log('Loading Status: ' + Titanium.App.Properties.getString('currentStatus'));

    var stat = Titanium.App.Properties.getList('currentStatusList');
    document.title = 'Titweeter: Status: ' + stat.user.name;

    TT.formatProfileHeader(stat.user);

    var txt = TT.filterStatus(stat.message);
    TT.log('Status: ' + txt);

    if (stat.geo) {
        var geo = Y.one('#status a.geo');
        geo.set('href', geo.get('href') + stat.geo[0] + ',' + stat.geo[1]);
        geo.removeClass('hidden');
    }

    Y.one('#status ul').append('<li class="status"><h4>' + stat.header + '</h4>' + txt + '</li>');

    Y.delegate('click', function(e) {
        var cls = e.currentTarget.get('className'),
        href = e.currentTarget.get('href');
        TT.log('[STATUS]: Click: ' + cls);
        switch (cls) {
            case 'profile':
                TT.showProfile({ id: href.replace('http:/'+'/twitter.com/', '') });
                e.halt();
                break;
            case 'search':
                //TODO
                break;
            case 'url':
                if (href.indexOf('twitpic.com')) {
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
    }, '#status ul', 'a');

    if (stat.in_reply_to_status_id) {
        Y.one('#status').append('<div id="button"></div>');

        var button1 = Titanium.UI.createButton({
            id: 'button',
            title: 'in reply to @' + stat.in_reply_to_screen_name,
            color: '#ffffff',
            backgroundColor: '#ccc',
            height: 40
        });
        button1.addEventListener('click', function() {
            TT.showLoading('Fetching Status');
            TT.log('Load New Status Window');
            var creds = TT.getCreds();
            var url = TT.proto + ":/"+"/" + creds.login + ":" + creds.passwd + "@twitter.com/statuses/show/" + stat.in_reply_to_status_id + '.json';

            TT.log('URL: ' + url);

            var xhr = Titanium.Network.createHTTPClient();
            xhr.onload = function() {
                var json = eval('('+this.responseText+')');
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
            xhr.open("GET",url);
            xhr.send();
            
            
        });
        
    }
        


    var menu = Titanium.UI.createMenu();

    menu.addItem("Reply", function() {
        
        Titanium.App.Properties.setString('replyTo', stat.user.screen_name);
        Titanium.App.Properties.setString('replyID', stat.id);
        TT.log('Reply to: ' + stat.user.screen_name);
        TT.log('Reply to: ' + stat.id);
        
        var win = Titanium.UI.createWindow({ url: 'post.html' });
        win.open();
    }/*, Titanium.UI.Android.SystemIcon.REPLY*/);
    
    if (stat.user.following) {
        menu.addItem("Direct Message", function() {
            TT.log('Menu: Direct Message');
        }/*, Titanium.UI.Android.SystemIcon.SEND*/);
        menu.addItem("Unfollow", function() {
            TT.log('Menu: Unfollow');
        }/*, Titanium.UI.Android.SystemIcon.SEND*/);
    } else {
        menu.addItem("Follow", function() {
            TT.log('Menu: Follow');
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
        TT.log('Menu: Direct Message');
    }/*, Titanium.UI.Android.SystemIcon.SEND*/);

    Titanium.UI.setMenu(menu);
    

