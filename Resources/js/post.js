
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
    
    
    var ta1 = Titanium.UI.createTextArea({
        id: 'post_status', 
        value: TT.html_entity_decode(val),
        autocorrect: true,
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_BEZEL,
        keyboardType: Titanium.UI.KEYBOARD_ASCII, 
        returnKeyType: Titanium.UI.RETURNKEY_DONE,
        capitalizeType: Titanium.UI.CAPITALIZE_SENTENCES,
        backgroundColor: '#ffffff',
        color: '#000000'
    });
    
    var postStatusReal = function(e) {
        TT.log('postStatusReal: ' + ta1.value);
        var creds = TT.getCreds(),
            val = ta1.value;
        
        TT.ping('post');

        /*{{{ TODO - URL shortening
        var urls = val.match(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/g);
        if (urls.length) {
            TT.showLoading('Shortening URLs');
            TT.log('Found (' + urls.length + ') URL, shorten them');
            var xhr = Titanium.Network.createHTTPClient();
            Y.each(urls, function(v) {
                xhr.onload = function() {
                    TT.log('Bitly reponse: ' + this.responseText);
                    var json = Y.JSON.parse(this.responseText);
                    Y.each(json.results, function(v) {
                        var url = v.shortUrl;
                        val.replace(v, url);
                    });
                    TT.hideLoading();
                };
                var o = TT.stringifyObject({
                    login: bitly.username,
                    apiKey: bitly.key,
                    version: '2.0.1',
                    format: 'json',
                    longUrl: v
                });
                xhr.open('GET', 'http:/'+'/api.bit.ly/shorten?' + o);
                xhr.send(null);
            });
        }
        ta1.value = val;
        TT.log('After shorten: ' + val);
        return;
        }}} */
        
        var c = {
            status: val
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
        TT.log('[TWEET] : ' + ta1.value);
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
        
        if (TT.settings.geo == '1') {
            TT.log('Post Status: ' + ta1.value);
            TT.showLoading('Getting Geo...');
            Titanium.Geolocation.getCurrentPosition(function(e) {
                TT.log('Coords: ' + e.coords.latitude + ' :: ' + e.coords.longitude);
                postStatusReal(e);
            }, function(e) {
                TT.log('Coords Lookup Failed');
                postStatusReal(e);
            });
        } else {
            TT.log('Skipping Geo Lookup..');
            postStatusReal({});
        }
    };

    var cCount = Y.one('#charCount');
    var countChars = function(e) {
        var len = e.value.length,
            left = (140 - len);
        if (left < 0) {
            cCount.set('innerHTML', '<strong>' + left + '</strong> Chars left');
        } else {
            cCount.set('innerHTML', left + ' Chars left');
        }
    };

    ta1.addEventListener('change', countChars);
    
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

    if (TT.settings.enter == '1') {
        ta1.addEventListener('return', function() {
            postStatus();
        });
    }
    
    var pic_button = Titanium.UI.createButton({
        id: 'attach_button',
        title: 'TwitPic',
        color: '#000',
        height: 32,
        width: 75,
        fontSize: 12,
        fontWeight: 'bold'
    });
    
    pic_button.addEventListener('click', function() {
        /* Doesn't Work
        * showCamera doesn't work on Android
        var dialog = Titanium.UI.createOptionDialog();
        dialog.setOptions(['Take Picture', 'Open Photo Gallery']);
        dialog.setTitle('Picture Options');

        dialog.addEventListener('click', function(e) {
            switch(e.index) {
                case 0:
                    Titanium.Media.showCamera({
                        success: postImage,
                        error: function(e) {
                            TT.showError(e.message);
                        },
                        allowImageEditing: false
                    });
                    break;
                case 1:
                    Titanium.Media.openPhotoGallery({
                        success: postImage,
                        error: function(e) {
                            TT.showError(e.message);
                        },
                        allowImageEditing: false
                    });
                    break;
            }
        });
        dialog.show();
        */
        Titanium.Media.openPhotoGallery({
            success: postImage,
            error: function(e) {
                TT.showError(e.message);
            },
            allowImageEditing: false
        });
    });
    
    var postImage = function(image) {
        TT.showLoading('Posting Image...');
        var creds = TT.getCreds();
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onload = function() {
            TT.ping('post.twitpic');
            TT.log('XHR Loaded: ' + this.responseText);
            var parser = new DOMParser();
            var doc = parser.parseFromString(this.responseText, "text/xml"); 
            var rsp = doc.getElementsByTagName('mediaurl')[0];
            TT.log('URL: ' + rsp.firstChild.nodeValue);
            if (ta1.value == '') {
                ta1.value = rsp.firstChild.nodeValue + ' ';
            } else {
                ta1.value += ' ' + rsp.firstChild.nodeValue;
            }
            TT.hideLoading();
            ta1.focus();
        };
        xhr.open('POST', 'http:/'+'/twitpic.com/api/upload');
        xhr.send({
            media: image,
            username: creds.login,
            password: creds.passwd
        });
    };
    

    window.onload = function() {
        countChars({ value: { length: val.length} });
    };

