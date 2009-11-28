
        TT.openDB();

		var height = (Titanium.Platform.name.indexOf('iPhone') != -1) ? 30: 40;
		var tf1 = Titanium.UI.createTextField({
			id:'textfield1',
			value:'',
			keyboardType:Titanium.UI.KEYBOARD_EMAIL,
			hintText:'enter username',
			width:170,
			height:height,
			clearOnEdit:true,
			borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
			clearButtonMode:Titanium.UI.INPUT_BUTTONMODE_ALWAYS
		});
		var tf2 = Titanium.UI.createTextField({
			id:'textfield2',
			value:'',
			keyboardType:Titanium.UI.KEYBOARD_ASCII,
			hintText:'enter password',
			width:170,
			height:height,
			clearOnEdit:true,
			passwordMask:true,
			borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
			clearButtonMode:Titanium.UI.INPUT_BUTTONMODE_ALWAYS
		});
		var button = Titanium.UI.createButton({
			id:'button',
			title:'Login',
			color:'#336699',
			height:32,
			width:100,
			fontSize:12,
			fontWeight:'bold'
		});
		button.addEventListener('click', function() {
            TT.log('Checking Creds');
			// hide the keyboards if they're showing
			tf1.blur();
			tf2.blur();

			var login = tf1.value,
			    passwd = tf2.value,
                url = 'http:/'+'/' + login + ':' + passwd + '@twitter.com/account/verify_credentials.json',
                xhr = Titanium.Network.createHTTPClient();

            if (login != '' && passwd != '') {
                TT.log('Fetching URL: ' + url);
                xhr.onload = function() {
                    TT.log('Verify Creds');
                    var json = eval('('+this.responseText+')');
                    if (json.error) {
                        TT.log('ERROR: ' + json.error);
                        TT.showError(json.error);
                    } else {
                        TT.db.execute('delete from accounts');
                        TT.db.execute('insert into accounts (login, passwd) values ("' + login + '", "' + passwd + '")');
                        
                        TT.db.close();
                        TT.log('Close Login Window');
                        //Figure out how to listen for window close to close app when not authed.
                        //Titanium.UI.currentWindow.close();
                        TT.showTimeline({
                            login: login,
                            passwd: passwd
                        });
                    }

                };
                xhr.open("GET",url);
                xhr.send();
            } else {
                TT.log('Show Error');
                if (!login) {
                    TT.showError('Username is required');
			        tf1.focus();
                } else {
                    TT.showError('Password is required');
			        tf2.focus();
                }
            }

		});
    
