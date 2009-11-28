    TT.openDB();
    
    TT.db.execute('create table if not exists accounts (login text, passwd text)');

    //Check for credentials
    TT.log('Fetching from accounts');
    var creds = TT.getCreds();
    
    if (creds.login && creds.passwd) {
        TT.showTimeline(creds);
        document.getElementById('login').style.display = 'none';
    } else {
        TT.log('No Creds, loading login screen');
        TT.showLogin();
        /*
        var LoginView = Titanium.UI.createWebView({
            url: 'login.html',
            name:'login'
        });
        Titanium.UI.currentWindow.addView(LoginView);
        Titanium.UI.currentWindow.showView(LoginView);
		var w = Titanium.UI.createWindow({ url: 'login.html', hideTabBar: 'true', hideNavBar: 'true' });
		w.open();        
        */

    }


