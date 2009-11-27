    var l = document.getElementById('loading');

    l.innerHTML = 'Processing: ' + (new Date()).getTime() + '<br>';
    //Create the DB to store
    var db = Titanium.Database.open('titweeter'),
        login, passwd;

    l.innerHTML += 'Create Table<br>';
    db.execute('create table if not exists accounts (login text, passwd text)');
    
    //Check for credentials
    l.innerHTML += 'Select Rows<br>';
    var rows = db.execute('select * from accounts');
    l.innerHTML += 'After Select Rows<br>';

    while (rows.isValidRow()) {
        l.innerHTML += 'isValidRows<br>';
        login = rows.fieldByName('login');
        passwd = rows.fieldByName('passwd');
        rows.next();
    }
    rows.close();
    l.innerHTML += 'Close Rows<br>';

    
    l.innerHTML += 'Login: ' + login + '<br>';
    l.innerHTML += 'Password: ' + passwd + '<br>';

    Titanium.UI.currentWindow.close();

    if (login && passwd) {
        l.innerHTML += 'show timeline<br>';
		var w = Titanium.UI.createWindow({ url: 'timeline.html', hideTabBar: 'true', hideNavBar: 'true' });
		w.open();
    } else {
        l.innerHTML += 'show login<br>';
		var w = Titanium.UI.createWindow({ url: 'login.html', hideTabBar: 'true', hideNavBar: 'true' });
		w.open();
    }
    
    l.innerHTML += 'Finished: ' + (new Date()).getTime() + '<br>';

    db.close();
    
