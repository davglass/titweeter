
    TT.log('Loading Status: ' + Titanium.App.Properties.getString('currentStatus'));

    var stat = Titanium.App.Properties.getList('currentStatusList')
    document.getElementsByTagName('img')[0].src = stat.user.profile_image_url;
    document.getElementsByTagName('h1')[0].innerHTML = stat.user.name;
    document.getElementsByTagName('h3')[0].innerHTML = '@' + stat.user.screen_name;
    document.getElementsByTagName('em')[0].innerHTML = stat.user.followers_count;
    document.getElementsByTagName('strong')[0].innerHTML = stat.user.friends_count;

    document.getElementsByTagName('ul')[0].innerHTML = '<li class="status">' + stat.text + '</li>';
        

