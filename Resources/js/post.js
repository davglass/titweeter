

    var ta1 = Titanium.UI.createTextArea({
        id: 'post_status', 
        value: '',
        height: 100,
        width: 300,
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_BEZEL,
        returnKeyType: Titanium.UI.RETURNKEY_SEND
    });
    
    var c = document.getElementById('charCount');

    ta1.addEventListener('change', function(e) {
        var len = e.value.length,
            left = (140 - len);
        //TT.log('change: ' + len + ' :: ' + left);
        if (left < 0) {
            c.innerHTML = '<strong>' + left + '</strong> Chars left';
        } else {
            c.innerHTML = left + ' Chars left';
        }
    });

    ta1.addEventListener('return', function(e) {
        TT.log('return');
        postStatus();
    });

    var button = Titanium.UI.createButton({
        id: 'post_button',
        title: 'Post',
        color: '#000',
        height: 32,
        width: 75,
        fontSize: 12,
        fontWeight: 'bold'
    });
    
    button.addEventListener('click', function() {
        postStatus();
    });

    var postStatus = function() {
        TT.log('Post Status: ' + ta1.value);
        TT.showLoading('Posting...');
        Titanium.Geolocation.getCurrentPosition(function(e) {
            TT.log('Coords: ' + e.coords.latitude + ' :: ' + e.coords.longitude);
            postStatusReal(e);
        }, function(e) {
            TT.log('Coords Failed');
            postStatusReal(e);
        });
    };

    var postStatusReal = function(e) {
        TT.log('postStatusReal: ' + ta1.value);
        var creds = TT.getCreds();
        var c = {
            status: ta1.value
        };

        if (e.coords) {
            c.lat = e.coords.latitude;
            c.long = e.coords.longitude;
        }

        var url = 'https:/'+'/' + creds.login + ':' + creds.passwd + '@twitter.com/statuses/update.json';

        TT.log('URL: ' + url);
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onreadystatechange = function() {
            TT.log('[' + this.readyState + ']');
        };

        xhr.onload = function() {
            TT.hideLoading();
            Titanium.currentWindow.close();
        };
        xhr.open('POST', url);
        xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        //xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        //xhr.send("status=" + Titanium.Network.encodeURIComponent(ta1.value));
        xhr.send("status=" + Titanium.Network.encodeURIComponent('This is a test.'));
        //xhr.send(c);
    };
    
    //ta1.focus();
    
