    TT.openDB();
    
    TT.db.execute('create table if not exists accounts (login text, passwd text)');

    //Check for credentials
    TT.log('Fetching from accounts');
    var creds = TT.getCreds();
    
    if (creds.login && creds.passwd) {
        TT.showTimelineView(creds);
        //document.getElementById('login').style.display = 'none';
        TT.db.close();
    } else {
        TT.log('No Creds, loading login screen');
        //TT.showLogin();
    }


