
    TT.openDB();

    TT.log('Loading Status..');

    YUI().use('node', function(Y) {

        var creds = TT.getCreds(),
            id = TT.getData('currentStatus'),
            url = 'http:/'+ +'/' + creds.login + ':' + creds.passwd + '@twitter.com/statuses/show/' + id + '.json',
            xhr = Titanium.Network.createHTTPClient();

        TT.log('URL: ' + url);

        xhr.onload = function() {
            TT.log('Status XHR Loaded');
            var stat = eval('('+this.responseText+')'),
                h = Y.one('#hd'),
                list = h.one('ul');

            h.one('img').set('src', stat.user.profile_image_url);
            h.one('h1').set('innerHTML', stat.user.name);
            h.one('h3').set('innerHTML', '@' + stat.user.screen_name);
            h.one('em').set('innerHTML', stat.user.followers_count);
            h.one('strong').set('innerHTML', stat.user.following_count);
            h.one('span').set('innerHTML', stat.user.description);
            
            h.get('parentNode').one('.status_list').append('<li>' + stat.text + '</li>');
            
        };
        xhr.open("GET", url);
        xhr.send();



    });
