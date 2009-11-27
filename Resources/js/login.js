
        var db = Titanium.Database.open('titweeter');
    

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
			clearButtonMode:Titanium.UI.INPUT_BUTTONMODE_ALWAYS,
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
			clearButtonMode:Titanium.UI.INPUT_BUTTONMODE_ALWAYS,
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
            Titanium.API.log('debug', 'Caching creds');
			// hide the keyboards if they're showing
			tf1.blur();
			tf2.blur();

			var un = tf1.value;
			var pw = tf2.value;

            db.execute('delete from accounts');
            db.execute('insert into accounts (login, passwd) values ("' + un + '", "' + pw + '")');
            
            db.close();
            Titanium.API.log('debug', 'Close Login Window');
            Titanium.UI.currentWindow.close();
		});
    
