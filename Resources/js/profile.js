    var user_id = Titanium.App.Properties.getString('currentUser'),
    userFound = false;

    TT.log('Loading Profile Data: ' + user_id);
    TT.ping('show.profile');

    TT.showLoading('Fetching Statuses');

    TT.fetchURL('statuses/user_timeline/' + user_id + '.json', {
        onload: function() {
            TT.log('Fetched user Statuses');
            TT.showLoading('Parsing Statuses...');
            var json = eval('(' + this.responseText + ')'),
                set = true, c = 0, row, info,
                data = [],
                ul = Y.one('#status ul');

            for (c = 0; c < json.length; c++) {
                info = TT.formatTimelineRow(json[c]);
                if (!userFound) {
                    userFound = json[c].user;
                    TT.formatProfileHeader(json[c].user);
                    document.title += ': ' + json[c].user.name;

                    if (json[c].geo) {
                        var geo = Y.one('#status a.geo');
                        geo.set('href', geo.get('href') + json[c].geo.coordinates[0] + ',' + json[c].geo.coordinates[1]);
                        geo.removeClass('hidden');
                    }
                    
                }
                var txt = TT.filterStatus(info.message);
                
                ul.append('<li id="' + info.id + '" class="status"><h4>' + info.header + '</h4>' + txt + '</li>');
            }
            
            TT.hideLoading();
        }
    });

    var menu = Titanium.UI.createMenu();

    menu.addItem("Reply", function() {
        
        Titanium.App.Properties.setString('replyTo', userFound.screen_name);
        TT.log('Reply to: ' + userFound.screen_name);
        
        TT.openWindow('post.html');
    }/*, Titanium.UI.Android.SystemIcon.REPLY*/);
    
    if (userFound.following) {
        menu.addItem("Direct Message", function() {
            TT.log('Menu: Direct Message');
            Titanium.App.Properties.setString('directTo', userFound.screen_name);
            TT.log('Direct Message To: ' + userFound.screen_name);
            
            TT.openWindow('post.html');
        }/*, Titanium.UI.Android.SystemIcon.SEND*/);
        menu.addItem("Unfollow", function() {
            TT.log('Menu: Unfollow');
            TT.showLoading('Unfollowing ' + userFound.name);
            TT.fetchURL('friendships/destroy/' + userFound.id + '.json', {
                type: 'POST',
                onload: function() {
                    TT.hideLoading();
                }
            });
        }/*, Titanium.UI.Android.SystemIcon.SEND*/);
    } else {
        var followMenu = menu.addItem("Follow", function() {
            TT.log('Menu: Follow');
            TT.showLoading('Following ' + userFound.name);
            TT.fetchURL('friendships/create.json?user_id=' + userFound.id + '&follow=true', {
                type: 'POST',
                data: {
                    user_id: userFound.id,
                    follow: true
                },
                onload: function() {
                    TT.hideLoading();
                    //TODO
                    followMenu.setLabel('Unfollow');
                }
            });
        }/*, Titanium.UI.Android.SystemIcon.SEND*/);
    }
    
    menu.addItem("Report Spam", function() {
        TT.log('Menu: Report Spam');
        TT.not('Spam reporting');
    }/*, Titanium.UI.Android.SystemIcon.SEND*/);


    var creds = TT.getCreds();
    if (creds.login !== userFound.screen_name) {
        Titanium.UI.setMenu(menu);
    }

