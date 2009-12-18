    TT.showLoading('Loading Friends List');
    var creds = TT.getCreds(),
    friends = {}, sorter = [], ids = [],
    ul = Y.one('ul');
    TT.ping('show.friends');


    /*
    TT.fetchURL('statuses/friends/' + creds.login + '.json?cursor=-1', {
        onload: function() {
            TT.showLoading('Parsing Friends List');
            var json = eval('(' + this.responseText + ')');
            Y.each(json.users, function(v) {
                friends[v.name.toLowerCase()] = v;
                ids[v.id] = v.name.toLowerCase();
                sorter.push(v.name.toLowerCase());
            });
            TT.log(Y.JSON.stringify(sorter));
            sorter.sort();
            TT.log(Y.JSON.stringify(sorter));
            Y.each(sorter, function(v) {
                var info = friends[v];
                ul.append('<li id="' + info.id + '"><img src="' + info.profile_image_url + '" align="left"> <em>' + info.name + '<br>@' + info.screen_name + '</em></li>');
            });
            TT.hideLoading();
        }
    });
    */

    Y.delegate('click', function(e) {
        var id = e.currentTarget.get('parentNode.id');
        TT.log('Load Profile: ' + id);
        TT.log('Load Profile: ' + ids[id]);
        TT.showProfile(friends[ids[id]]);
    }, '#friends', 'ul li em');

    var showFriends = function() {
        sorter.sort();
        document.title += ' (' + sorter.length + ')';
        //TT.log(Y.JSON.stringify(sorter));
        Y.each(sorter, function(v) {
            var info = friends[v];
            ul.append('<li id="' + info.id + '"><img src="' + info.profile_image_url + '" align="left"> <em>' + info.name + '<br>@' + info.screen_name + '</em></li>');
        });
        TT.hideLoading();
    };

    var fetch = function(c) {
        TT.showLoading('Fetching Page ' + page);
        TT.fetchURL('statuses/friends/' + creds.login + '.json?cursor=' + c, {
            onload: function() {
                TT.showLoading('Parsing Page ' + page);
                var json = eval('(' + this.responseText + ')');
                Y.each(json.users, function(v) {
                    friends[v.name.toLowerCase()] = v;
                    ids[v.id] = v.name.toLowerCase();
                    sorter.push(v.name.toLowerCase());
                });
                page++;
                if (json.next_cursor) {
                    fetch(json.next_cursor);
                } else {
                    showFriends();
                }
            }
        });
    },
    page = 1;

    fetch(-1);
