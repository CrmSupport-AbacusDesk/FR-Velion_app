console.log('push notification work');
function init(logInID) {

    console.log("Notification Function Call");

    const push = PushNotification.init({
        android: {
            senderID: "358962269715",
            sound: "true",
            vibrate: "true",
            icon: "ic_stat_onesignal_default",
            iconColor: "#ed6c11",
            forceShow:"true"
        }
    });

    push.on('notification', data => {
        console.log(data);
        console.log(data.message);
        console.log(data.title);
        console.log(data.count);
        console.log(data.additionalData);
    //     if(data.additionalData.additionalData.path=="outstanding"){
    //       $state.go('orptab.billing-list');
    // }
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

        $.post("" + rootURL + "/index.php/okaya_sfa/user/updateDeviceToken",
        {
            regID: regID,
            login_id: logInID,
            platform: platformType
        });
    });
}
