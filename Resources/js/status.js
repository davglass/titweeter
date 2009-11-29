
    YUI().use('node', function(Y) {
        var stat = TT.currentStatus,
            h = Y.one('#hd'),
            list = h.one('ul');

        h.one('img').set('src', stat.user.profile_image_url);
        h.one('h1').set('innerHTML', stat.user.name);
        h.one('h3').set('innerHTML', '@' + stat.user.screen_name);

        Y.each(stat.user, function(v, k) {
            if (k.indexOf('_count') !== -1) {
                var str = k.replace('_count', '') + ': ' + v;
                ul.append('<li>' + str + '</li>');
            }
        });
        ul.append('<li>location: ' + stat.user.location + '</li>');
        ul.append('<li>web: ' + stat.user.url + '</li>');
        ul.append('<li>bio: ' + stat.user.description + '</li>');
    });
