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
                    fetchMenu();
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
    });
    
    var createMenu = function(data) {
        TT.log('create status menu');
        var rel = data.relationship,
            tar = rel.target, src = rel.source;
        
        if (src.following && src.followed_by) {
            var title = 'Direct Message';
            menu.addItem(title, function() {
                TT.log('Menu: Direct Message');
                Titanium.App.Properties.setString('directTo', userFound.screen_name);
                TT.log('Direct Message To: ' + userFound.screen_name);
                
                TT.openWindow('post.html');   
            });
        }

        if (src.following) {
            menu.addItem("Unfollow", function() {
                TT.log('Menu: Unfollow');
                TT.showLoading('Unfollowing ' + userFound.name);
                TT.fetchURL('friendships/destroy/' + userFound.id + '.json', {
                    type: 'POST',
                    onload: function() {
                        TT.hideLoading();
                    }
                });
            });
        } else {
            menu.addItem("Follow", function() {
                TT.log('Menu: Follow');
                TT.showLoading('Following ' + userFound.name);
                TT.fetchURL('friendships/create/' + userFound.id + '.json?follow=true', {
                    type: 'POST',
                    data: {
                        follow: true
                    },
                    onload: function() {
                        TT.hideLoading();
                    }
                });
                
            });
        }
        
    };


    
    var fetchMenu = function() {
        var creds = TT.getCreds();
        if (creds.login !== userFound.screen_name) {
            Titanium.UI.setMenu(menu);
        }
        TT.log('Fetching Friendship Status');
        TT.log(Y.JSON.stringify(userFound));
        TT.fetchURL('friendships/show.json?target_id=' + userFound.id + '&source_id=' + creds.userid, {
            type: 'GET',
            onload: function() {
                var json = eval('(' + this.responseText + ')');
                createMenu(json);
            }
        });
    }
