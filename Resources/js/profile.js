    var user_id = Titanium.App.Properties.getString('currentUser'),
    userFound = false;

    TT.log('Loading Profile Data: ' + user_id);

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
                    userFound = true;
                    TT.formatProfileHeader(json[c].user);
                    document.title += ': ' + json[c].user.name;
                }
                var txt = TT.filterStatus(info.message);

                ul.append('<li id="' + info.id + '" class="status">' + txt + '</li>');
            }
            
            /*
            var tableView = TT.createTimelineView(data, function(e) {
                TT.log('Status Clicked: ' + e.layoutName);
                var status;
                switch (e.layoutName) {
                    case 'url':
                        TT.log('Open URL: ' + e.rowData.url);
                        Titanium.Platform.openURL(e.rowData.url);
                        break;
                    case 'message_nopic':
                        status = TT.getTrueStatus(e.rowData.json);

                        TT.log('currentStatus: ' + status.id);

                        Titanium.App.Properties.setString('currentStatus', status.id);
                        Titanium.App.Properties.setList('currentStatusList', status);

                        TT.log('Create status window..');
                        
                        var win = Titanium.UI.createWindow({ url: 'status.html' });
                        win.open();
                        break;
                }
            });
            */

            TT.hideLoading();
        }
    });

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

/* {{{
    var header = {
        photo: '',
        following: '',
        screen_name: '@foo',
        fullname: 'Foo Bar',
        backgroundColor: '#ccc',
        selectedBackgroundColor: '#ccc',
        rowHeight: 100,
        layout: [
            { type: 'image', name: 'photo', height: 48, width: 48, top: 3, left: 3 },
            { type: 'text', name: 'fullname', fontWeight: 'bold', color: '#000', top: 3, left: 55, fontSize: 12, height: 14 },
            { type: 'text', name: 'screen_name', color: '#000', top: 16, left: 55, fontSize: 10, height: 14 },
            { type: 'text', name: 'following', color: '#000', top: 28, left: 55, fontSize: 10, height: 14 },
            { type: 'text', name: 'url', color: 'blue', top: 40, left: 55, fontSize: 10, textDecoration: 'underline', height: 14 },
            { type: 'text', name: 'bio', color: '#000', top: 53, left: 55, fontSize: 10, height: 40 },
        ]
    },
    getUser = function(u) {
        header.following = 'Followers ' + u.followers_count + ', Following ' + u.friends_count;
        header.screen_name = '@' + u.screen_name;
        header.fullname = u.name;
        header.photo = u.profile_image_url;
        if (u.url) {
            header.url = u.url;
        }
        header.bio = u.description;
        return header;
    },
    user_id = Titanium.App.Properties.getString('currentUser'),
    userFound = false;

    TT.log('Loading Profile Data: ' + user_id);

    TT.showLoading('Fetching Statuses');

    TT.fetchURL('statuses/user_timeline/' + user_id + '.json', {
        onload: function() {
            TT.log('Fetched user Statuses');
            TT.showLoading('Parsing Statuses...');
            var json = eval('(' + this.responseText + ')'),
                set = true, c = 0, row, info,
                data = [];

            for (c = 0; c < json.length; c++) {
                info = TT.formatTimelineRow(json[c]);
                if (!userFound) {
                    data.push(getUser(json[c].user));
                    userFound = true;
                }
                info.message_nopic = info.message;
                delete info.photo;
                if (info.photo_me) {
                    delete info.photo_me;
                    info.message_nopic = info.message_me;
                    delete info.message_me;
                }
                delete info.message;
                data.push(info);
            }

            var tableView = TT.createTimelineView(data, function(e) {
                TT.log('Status Clicked: ' + e.layoutName);
                var status;
                switch (e.layoutName) {
                    case 'url':
                        TT.log('Open URL: ' + e.rowData.url);
                        Titanium.Platform.openURL(e.rowData.url);
                        break;
                    case 'message_nopic':
                        status = TT.getTrueStatus(e.rowData.json);

                        TT.log('currentStatus: ' + status.id);

                        Titanium.App.Properties.setString('currentStatus', status.id);
                        Titanium.App.Properties.setList('currentStatusList', status);

                        TT.log('Create status window..');
                        
                        var win = Titanium.UI.createWindow({ url: 'status.html' });
                        win.open();
                        break;
                }
            });

            Titanium.UI.currentWindow.addView(tableView);
            Titanium.UI.currentWindow.showView(tableView);
            TT.hideLoading();
        }
    });
}}} */
