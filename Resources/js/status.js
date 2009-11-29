
    TT.openDB();

    TT.log('Loading Status..');

    var creds = TT.getCreds(),
        id = Titanium.App.Properties.getString('currentStatus'),
        url = 'http:/'+'/' + creds.login + ':' + creds.passwd + '@twitter.com/statuses/show/' + id + '.json',
        xhr = Titanium.Network.createHTTPClient();

    TT.log('URL: ' + url);

    xhr.onload = function() {
        TT.log('Status XHR Loaded');
        var stat = eval('(' + this.responseText + ')');
        
        document.getElementsByTagName('img')[0].src = stat.user.profile_image_url;
        document.getElementsByTagName('h1')[0].innerHTML = stat.user.name;
        document.getElementsByTagName('h3')[0].innerHTML = '@' + stat.user.screen_name;
        document.getElementsByTagName('em')[0].innerHTML = stat.user.followers_count;
        document.getElementsByTagName('strong')[0].innerHTML = stat.user.friends_count;
        //document.getElementsByTagName('span')[0].innerHTML = stat.user.description;

        document.getElementsByTagName('ul')[0].innerHTML = '<li class="status">' + stat.text + '</li>';
        
    };
    xhr.open("GET", url);
    xhr.send();

