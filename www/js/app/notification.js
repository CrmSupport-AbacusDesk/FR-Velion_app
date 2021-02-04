
function init(logInID) {

    console.log("Notification Function Call");

    const push = PushNotification.init({
        android: {
            senderID: "317183046550",
            sound: "true",
            vibrate: "true",
            icon: "ic_stat_onesignal_default",
            iconColor: "#ed6c11"
        }
    });
    
    
    push.on('notification', data => {
        console.log(data);
    });
    
    
    push.on('registration', (data) => {
        // data.registrationId
        console.log('*****************');
        console.log('push success data=', data);
        console.log('*****************');
        
        var regID = data.registrationId;
        
        console.log(regID, logInID);
        
        var platformType = '';
        if (ionic.Platform.isAndroid()) {
            platformType = 'android';
        }
        
        if (ionic.Platform.isIOS()) {
            platformType = 'ios';
        }
        
        $.post("" + rootURL + "/okaya_sfa/user/updateDeviceToken",
        {
            regID: regID,
            login_id: logInID,
            platform: platformType
        });
    });
}