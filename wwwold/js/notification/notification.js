console.log("test");
           
     function init()
      {
           console.log("PushNotification");
           
           const push = PushNotification.init({
              android: {
                  senderID: "756133565474", 
                  sound: "true",
                  vibrate: "true",
                  icon: "ic_stat_droid_notification",
                  iconColor: "#ed6c11"
                //   forceShow : false,
                //   foreground: true,
                // coldstart: false,
                // 'content-available': "1"
              },
              "data": {
                "content-available": "1",
                "force-start": "1"
                
            }
          });



          push.on('registration', (data) => {
            // data.registrationId
            console.log('*****************');
            console.log('push success data=',data);
            console.log('*****************');

            var regID = data.registrationId;

            console.log(regID, login_id, access_level, type);

            var platformType = '';
            if(ionic.Platform.isAndroid()) {
                platformType = 'android';
            }

            // if (ionic.Platform.isIOS()) {
            //     platformType = 'ios';
            // }

             $.post(""+server_url+"/add_device.php",
             {
                 regID:regID,
                 login_id: login_id,
                 access_level: access_level,
                 type: type,
                 deviceCheck: 'Test',
                 platform: platformType
             });
        });
      }



        // function initOldNotification()
        // {
        //      window.plugins.pushNotification.register(
        //         successHandler,
        //         errorHandler,
        //         {"senderID":"1071931574626",
        //         "ecb":"onNotificationGCM",
        //         "icon": "icon_notification"
        //         });
        // }


    //     function successHandler(result) {
    //        //  alert("Result "+result);
    //     }

    //     function errorHandler(error) {
    //          alert("error"+result);
    //     }

    //     function onNotificationGCM(e) {

    //         switch(e.event) {

    //            case 'registered':
    //                  sendRequest(e.regid);
    //                  break;
    //            case 'message' :
    //                 var sound = new Media("assets/www/"+e.soundname);
    //                 sound.play();
    //                 break;
    //            default:
    //                 alert("Unknown Event");
    //         }
    //     }

    //    function sendRequest(regID) {

    //        console.log(regID, login_id, access_level, type);
    //        $.post(""+server_url+"/add_device.php",
    //        {
    //            regID:regID,
    //            login_id: login_id,
    //            access_level: access_level,
    //            type: type
    //        });
    //    }
