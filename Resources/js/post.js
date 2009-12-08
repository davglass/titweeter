
    var val = '', buttonValue = 'Post',
        replyID = Titanium.App.Properties.getString('replyID'),
        replyName = Titanium.App.Properties.getString('replyTo'),
        directTo = Titanium.App.Properties.getString('directTo'),
        retweetID = Titanium.App.Properties.getString('retweetID');
    
    TT.log('[POST]: replyID: ' + replyID);
    TT.log('[POST]: retweetID: ' + retweetID);

    if (replyID || replyName) {
        TT.log('[POST]: replyName: ' + replyName);

        Titanium.App.Properties.setString('replyTo', null);
        Titanium.App.Properties.setString('replyID', null);
        val = '@' + replyName + ' ';
        document.title = 'Titweeter: Reply to @' + replyName;
        buttonValue = 'Reply';
    }

    if (retweetID) {
        var retweetStatus = Titanium.App.Properties.getString('retweetStatus'),
            val = retweetStatus;
        
        TT.log('[POST]: retweetStatus: ' + val);

        Titanium.App.Properties.setString('retweetID', null);
        Titanium.App.Properties.setString('retweetStatus', null);
        document.title = 'Titweeter: Retweet';
        buttonValue = 'Retweet';
    }

    if (directTo) {
        
        TT.log('[POST]: directTo: ' + directTo);

        Titanium.App.Properties.setString('directTo', null);
        document.title = 'Titweeter: Direct Message to ' + directTo;
        buttonValue = 'Direct Message';
    }
    
    /*
    var ta1 = Titanium.UI.createTextArea({
        id: 'post_status', 
        value: val,
        height: 100,
        width: 300,
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_BEZEL,
        returnKeyType: Titanium.UI.RETURNKEY_SEND
    });
    */
    var ta1 = Y.one('#post_status');
    ta1.set('value', val);
    

    var postStatusReal = function(e) {
        TT.log('postStatusReal: ' + ta1.get('value'));
        var creds = TT.getCreds();
        var c = {
            status: ta1.get('value')
        };

        if (replyID > 0) {
            TT.log('Reply to: ' + replyID);
            c.in_reply_to_status_id = replyID;
        }

        if (e && e.coords) {
            c.lat = e.coords.latitude;
            c.long = e.coords.longitude;
        }
        
        TT.log('[RETWEET] : ' + retweetStatus);
        TT.log('[TWEET] : ' + ta1.get('value'));
        if (directTo) {
            TT.showLoading('Send Direct Message...');
            TT.log('Sending Direct Message');
            c.screen_name = directTo;
            c.text = c.status;
            delete c.status;
            TT.fetchURL('direct_messages/new.json', {
                type: 'POST',
                data: c,
                onload: function() {
                    TT.hideLoading();
                    Titanium.UI.currentWindow.close();
                },
                onerror: function() {
                    TT.log('Status Text: ' + this.getStatusText());
                    TT.log('Response: ' + this.getResponseText());
                }
            });
        } else if (retweetStatus && (retweetStatus == ta1.get('value') )) {
            TT.showLoading('Posting Retweet...');
            TT.log('Retweet status == textarea.value: Retweeting..');
            TT.fetchURL('statuses/retweet/' + retweetID + '.json', {
                type: 'POST',
                data: c,
                onload: function() {
                    TT.hideLoading();
                    Titanium.UI.currentWindow.close();
                },
                onerror: function() {
                    TT.log('Status Text: ' + this.getStatusText());
                    TT.log('Response: ' + this.getResponseText());
                }
            });
        } else {
            TT.showLoading('Posting Status...');
            TT.fetchURL('statuses/update.json', {
                type: 'POST',
                data: c,
                onload: function() {
                    TT.hideLoading();
                    Titanium.UI.currentWindow.close();
                },
                onerror: function() {
                    TT.log('Status Text: ' + this.getStatusText());
                    TT.log('Response: ' + this.getResponseText());
                }
            });
        }
    };
    

    var postStatus = function() {
        TT.log('Post Status: ' + ta1.get('value'));
        TT.showLoading('Getting Geo...');
        Titanium.Geolocation.getCurrentPosition(function(e) {
            TT.log('Coords: ' + e.coords.latitude + ' :: ' + e.coords.longitude);
            postStatusReal(e);
        }, function(e) {
            TT.log('Coords Lookup Failed');
            postStatusReal(e);
        });
    };

    var cCount = Y.one('#charCount');
    var countChars = function(e) {
        var len = e.target.get('value').length,
            left = (140 - len);
        if (left < 0) {
            cCount.set('innerHTML', '<strong>' + left + '</strong> Chars left');
        } else {
            cCount.set('innerHTML', left + ' Chars left');
        }
    };

    //ta1.addEventListener('change', countChars);
    
    ta1.on('keypress', countChars);


    var button = Y.one('#post_button');
    button.set('innerHTML', buttonValue);
    
    button.on('click', function() {
        var val = ta1.get('value');
        if (val.length > 0) {
            postStatus();
        } else {
            TT.showError('You must have a status.');
        }
    });
    
    /*
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
    */

    window.onload = function() {
        countChars({ target: ta1 });
    };

