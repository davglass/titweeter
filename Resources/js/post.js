
    var val = '', buttonValue = 'Post';

    var replyID = Titanium.App.Properties.getString('replyID');
    
    TT.log('[POST]: replyID: ' + replyID);

    if (replyID) {
        var replyName = Titanium.App.Properties.getString('replyTo');
        TT.log('[POST]: replyName: ' + replyName);

        Titanium.App.Properties.setString('replyTo', null);
        Titanium.App.Properties.setString('replyID', null);
        val = '@' + replyName + ' ';
        document.title = 'Titweeter: Reply to @' + replyName;
        buttonValue = 'Reply';
    }

    var ta1 = Titanium.UI.createTextArea({
        id: 'post_status', 
        value: val,
        height: 100,
        width: 300,
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_BEZEL,
        returnKeyType: Titanium.UI.RETURNKEY_SEND
    });
    
    var c = document.getElementById('charCount');

    var postStatusReal = function(e) {
        TT.showLoading('Posting Status...');
        TT.log('postStatusReal: ' + ta1.value);
        var creds = TT.getCreds();
        var c = {
            status: ta1.value
        };

        if (replyID > 0) {
            TT.log('Reply to: ' + replyID);
            c.in_reply_to_status_id = replyID;
        }

        if (e && e.coords) {
            c.lat = e.coords.latitude;
            c.long = e.coords.longitude;
        }

        TT.fetchURL('statuses/update.json', {
            type: 'POST',
            data: c,
            onload: function() {
                TT.hideLoading();
                Titanium.currentWindow.close();
            },
            onerror: function() {
                TT.log('Status Text: ' + this.getStatusText());
                TT.log('Response: ' + this.getResponseText());
            }
        });
    };
    

    var postStatus = function() {
        TT.log('Post Status: ' + ta1.value);
        TT.showLoading('Getting Geo...');
        Titanium.Geolocation.getCurrentPosition(function(e) {
            TT.log('Coords: ' + e.coords.latitude + ' :: ' + e.coords.longitude);
            postStatusReal(e);
        }, function(e) {
            TT.log('Coords Lookup Failed');
            postStatusReal(e);
        });
    };

    var countChars = function(e) {
        var len = e.value.length,
            left = (140 - len);
        if (left < 0) {
            c.innerHTML = '<strong>' + left + '</strong> Chars left';
        } else {
            c.innerHTML = left + ' Chars left';
        }
    };

    ta1.addEventListener('change', countChars);

    ta1.addEventListener('return', function(e) {
        TT.log('return');
        postStatus();
    });

    var button = Titanium.UI.createButton({
        id: 'post_button',
        title: buttonValue,
        color: '#000',
        height: 32,
        width: 75,
        fontSize: 12,
        fontWeight: 'bold'
    });
    
    button.addEventListener('click', function() {
        postStatus();
    });

