


Y.delegate('click', function(e) {
    e.currentTarget.one('em').toggleClass('selected');
    var ch = e.currentTarget.one('em').hasClass('selected'),
        val = '0';
        title = 'SETTING_' + e.currentTarget.one('em').get('id').toUpperCase();
    if (ch) {
        val = '1';
    }
    TT.log('[SETTING]: ' + title + ': ' + val);
    Titanium.App.Properties.setString(title, val);
}, '#settings', 'li.check');


Y.one('#num_items').on('click', function(e) {
    // create dialog
    var dialog = Titanium.UI.createOptionDialog(),
        num_options = [
            '10 Items',
            '25 Items',
            '50 Items',
            '75 Items',
            '100 Items'
        ];
        num_options_val = [
            10,
            25,
            50,
            75,
            100
        ];
    
    // set button titles

    dialog.setOptions(num_options);

    // set title
    dialog.setTitle('Number of Timeline Entries');

    // add event listener
    dialog.addEventListener('click',function(e) {
        var num = num_options_val[e.index];
        Y.one('#num_items strong').set('innerHTML', num);
        Titanium.App.Properties.setString('SETTING_NUM_ITEMS', num);
    });

    // show dialog
    dialog.show();
});


Y.one('#num_items strong').set('innerHTML', Titanium.App.Properties.getString('SETTING_NUM_ITEMS'));
var creds = TT.getCreds();
Y.one('#login').set('value', creds.login);
Y.one('#passwd').set('value', creds.passwd);

var lis = Y.all('#settings li.check');
lis.each(function(node) {
    var em = node.one('em'),
        id = em.get('id');
    var setting = TT.settings[id];
    if (setting === '1') {
        em.addClass('selected');
    }
});

Y.one('#clear_cache').on('click', function(e) {
    var a = Titanium.UI.createAlertDialog({
        title: 'Are you sure?',
        message: 'Are you sure you want to clear the applications cache? This can not be undone.', 
        buttonNames: [ 'OK', 'Cancel']
    });
    a.addEventListener('click',function(e) {
        if (e.index == 0) {
            TT.showLoading('Clearing Application Settings');
            TT.openDB();
            db.execute('delete from tweets');
            TT.closeDB();
            Titanium.App.Properties.setString('LOGIN', null);
            Titanium.App.Properties.setString('PASSWD', null);
            Titanium.App.Properties.setString('SETTING_NUM_ITEMS', 50);

            TT.alert('Application Cache Cleared.');
        }
    });

    a.show(); 
});

var l = '', p = '',
checkCreds = function() {
    if (l && p) {
        TT.log('Checking Creds');
        // hide the keyboards if they're showing
        var login = l,
            passwd = p,
            creds = TT.getCreds(),
            url = 'https:/'+'/' + login + ':' + passwd + '@twitter.com/account/verify_credentials.json',
            xhr = Titanium.Network.createHTTPClient();

            if (creds.login == login && creds.passwd == passwd) {
            } else {
                TT.showLoading('Verifing Credentials', true);
                TT.log('Fetching URL: ' + url);
                xhr.onload = function() {
                    TT.log('Verify Creds');
                    var json = eval('('+this.responseText+')');
                    if (json.error) {
                        TT.log('ERROR: ' + json.error);
                        TT.showError(json.error);
                    } else {
                        Titanium.Analytics.featureEvent('settings.creds'); 
                        TT.openDB();
                        db.execute('delete from tweets');
                        TT.closeDB();
                        TT.log('setCreds..');
                        TT.setCreds(login, passwd);
                        TT.hideLoading();
                    }
                };
                xhr.open("GET",url);
                xhr.send();
            }
    }
};

Y.one('#login').on('blur', function(e) {
    if (e.target.get('value')) {
        l = e.target.get('value');
        checkCreds();
    }
});

Y.one('#passwd').on('blur', function(e) {
    if (e.target.get('value')) {
        p = e.target.get('value');
        checkCreds();
    }
});

