    TT.showLoading('Loading Friends List');
    var creds = TT.getCreds(),
    friends = {}, sorter = [], ids = [],
    ul = Y.one('ul');

    TT.fetchURL('statuses/friends/' + creds.login + '.json', {
        onload: function() {
            TT.showLoading('Parsing Friends List');
            var json = eval('(' + this.responseText + ')');
            Y.each(json, function(v) {
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

    Y.delegate('click', function(e) {
        var id = e.currentTarget.get('parentNode.id');
        TT.log('Load Profile: ' + id);
        TT.log('Load Profile: ' + ids[id]);
        TT.showProfile(friends[ids[id]]);
    }, '#friends', 'ul li em');

