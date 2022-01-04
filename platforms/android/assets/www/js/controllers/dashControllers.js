
app.controller('dashCtrl', function ($scope, $rootScope, searchSelect, $ionicModal, $state, myRequestDBService, myAllSharedService, myRequestDBService, $ionicLoading, $cordovaSQLite, $ionicPopup, $ionicScrollDelegate, $timeout, $ionicActionSheet, $cordovaImagePicker, Camera, $cordovaFileTransfer, $cordovaGeolocation, $cordovaToast, $location, $window, $ionicPlatform, $ionicHistory, $ionicModal, $stateParams, $ionicPopover, $cordovaAppVersion) {

    $scope.isRequestInProcess;
    $scope.dashboardData = {};
    $scope.loginData = myAllSharedService.loginData;
    $scope.data = {};
    $scope.data.showMoreCustomerCount = false;
    // $rootScope.isAttendanceStart  = myAllSharedService.loginData.startAttendance;
    // console.log($rootScope.isAttendanceStart);
    // myAllSharedService.loginData.startAttendance = false;
    // $rootScope.isAttendanceStart = false;
    $scope.uploadURL = uploadURL;
    console.log($scope.loginData);

    $scope.currentTime = new Date();

    console.log(moment($scope.currentTime).format('HH:mm'));

    $scope.currentTime = moment($scope.currentTime).format('h:mm:s')
    console.log($scope.currentTime);
    $scope.leadTabActive = false;


    // $scope.getCurrentTime = function()
    // {
    //     var currentTime = new Date();
    //     console.log("test");
    //     setTimeout(() => {
    //         // $scope.currentTime  = moment($scope.currentTime).format('LTS');
    //         $scope.currentTime = currentTime.getSeconds();
    //         console.log($scope.currentTime);
    //         $scope.getCurrentTime();
    //     },1000);





    // }


    $scope.gotoPage = function (id, dr_name, contact_mobile_no, page_name) {
        console.log(page_name);
        console.log(id, dr_name, contact_mobile_no, page_name);
        myRequestDBService.dr_id = id;
        myRequestDBService.dr_name = dr_name;
        myRequestDBService.contact_mobile_no = contact_mobile_no;
        console.log(myRequestDBService.dr_id);
        $state.go('tab.' + page_name);
        $scope.leadpopovers.hide();
    }

    $scope.clock = "loading clock..."; // initialise the time variable
    $scope.tickInterval = 1000 //ms
    var tick = function () {
        $scope.clock = Date.now() // get the current time
        $timeout(tick, $scope.tickInterval); // reset the timer
    }

    // Start the timer
    $timeout(tick, $scope.tickInterval);



    $scope.onGoToRootPageHandler = function (targetPage) {

        console.log(myAllSharedService.loginData.channelSalesLogin);

        console.log($scope.loginData.startAttendance);
        myAllSharedService.drTypeFilterData.referFrom = 'dashboard';


        console.log(targetPage);
        if (targetPage == 'sfa_billing_list') {
            console.log(targetPage);
            $state.go('tab.sfa_billing_list');
        }

        if (targetPage == 'primary-order-list') {
            console.log(targetPage);
            $state.go('tab.primary-order-list');
        }

        if (targetPage == 'CheckIn') {
            $state.go('tab.all-activity-list');
        }



        if (targetPage == 'sfaPriOrder') {
            myAllSharedService.drTypeFilterData.isInsideLead = 'No';
            myAllSharedService.drTypeFilterData.orderId = '';

            myAllSharedService.drTypeFilterData.dr_name = '';
            myAllSharedService.drTypeFilterData.dr_id = '';
            myAllSharedService.drTypeFilterData.orderCreatedBy = 'me';
            myAllSharedService.drTypeFilterData.order_type = 'primary';
            $state.go('tab.sfa-order-add');
        }

        if (targetPage == 'sfaSecOrder') {
            myAllSharedService.drTypeFilterData.isInsideLead = 'No';
            myAllSharedService.drTypeFilterData.orderId = '';
            myAllSharedService.drTypeFilterData.dr_name = '';
            myAllSharedService.drTypeFilterData.dr_id = '';
            myAllSharedService.drTypeFilterData.orderCreatedBy = 'me';
            myAllSharedService.drTypeFilterData.order_type = 'secondary';
            $state.go('tab.sfa-order-add');
        }

        if (targetPage == 'sfaPriOrder-list') {
            myAllSharedService.drTypeFilterData.orderCreatedBy = 'me';
            myAllSharedService.drTypeFilterData.order_type = 'primary';

            myAllSharedService.drTypeFilterData.referFrom = 'dashboard';
            myAllSharedService.drTypeFilterData.detail.net_detail ='not_visited';
            myAllSharedService.drTypeFilterData.detail.billing_detail ='not_visited';
            myAllSharedService.drTypeFilterData.detail.prim_detail = 'not_visited';


            $state.go('tab.sfa-order-list');
        }

        if (targetPage == 'secondary-order-list') {
            myAllSharedService.drTypeFilterData.orderCreatedBy = 'me';
            myAllSharedService.drTypeFilterData.order_type = 'secondary';
            myAllSharedService.drTypeFilterData.dr_name = '';
            myAllSharedService.drTypeFilterData.dr_id = '';
            myAllSharedService.drTypeFilterData.referFrom = 'dashboard';


            $state.go('tab.sfa-order-list');
        }

        if (targetPage == 'Stock') {
            $state.go('tab.stock');
             myAllSharedService.drTypeFilterData.detail.net_detail ='not_visited';
             myAllSharedService.drTypeFilterData.detail.Pend_orderdetail = 'not_visited';
             myAllSharedService.drTypeFilterData.detail.billing_detail ='not_visited';
             myAllSharedService.drTypeFilterData.detail.prim_detail = 'not_visited';
        }
        if (targetPage == 'Distributor') {
            $state.go('tab.distribution-network');
            myAllSharedService.drTypeFilterData.detail.Pend_orderdetail = 'not_visited';
            myAllSharedService.drTypeFilterData.detail.billing_detail ='not_visited';
            myAllSharedService.drTypeFilterData.detail.prim_detail = 'not_visited';

        }
        if (targetPage == 'Dealer') {
            $state.go('tab.distribution-network');
        }
        // }
        if (targetPage == 'Home') {
            $state.go('tab.dashboard');
             myAllSharedService.drTypeFilterData.detail.net_detail ='not_visited';
             myAllSharedService.drTypeFilterData.detail.Pend_orderdetail = 'not_visited';
             myAllSharedService.drTypeFilterData.detail.billing_detail ='not_visited';
             myAllSharedService.drTypeFilterData.detail.prim_detail = 'not_visited';

        }
        // else if(targetPage=="Menu" || targetPage=="Home")
        // {
        if (targetPage == 'Menu') {
            $state.go('tab.menu');
             myAllSharedService.drTypeFilterData.detail.net_detail ='not_visited';
        }

    }



    $scope.getDashboardData = function () {

        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
        });

        $scope.isRequestInProcess = true;

        myRequestDBService.getDashboardData()
        .then(function (result) {
            console.log(result);
            $ionicLoading.hide();
            $scope.isRequestInProcess = false;
            if (result.status != "error") {
                myAllSharedService.drTypeFilterData.dashboardData = result;
            }

            $scope.dashboardData = result;

            console.log($scope.dashboardData);
            // $scope.dashboardData.achive_percent = (parseFloat($scope.dashboardData.collectionAchivement) * 100 / parseFloat($scope.dashboardData.collectionPlan)).toFixed(2);

            $scope.dashboardData['invoice_billing'] = result.invoice_billing.billing_qty;
            $scope.dashboardData['pending_order'] = result.pending_order.pending_order_qty;
            $scope.dashboardData['drCountData'] = result.drCountData;
            $scope.dashboardData['total_outstanding'] = result.total_outstanding.total_outstanding;
            // $scope.dashboardData['sfaPriOrdCount'] = result.sfaPriOrdCount;
            // $scope.dashboardData['sfaSecOrdCount'] = result.sfaSecOrdCount;

        }, function (err) {

            $ionicLoading.hide();
            $scope.isRequestInProcess = false;
            console.error(err);
        });
    }


    // $scope.getAttendanceStatus = function()
    // {
    //     myAllSharedService.loginData.startAttendance = false;

    //     $scope.data.isAttendanceDataReceived = 'No';
    //     myRequestDBService.getAttendanceStatus()
    //     .then(function (result)
    //     {

    //         console.log(result);

    //         if(result.start_time && !result.stope_time)
    //         {
    //             myAllSharedService.loginData.startAttendance = true;
    //             $scope.loginData.startAttendance = true;
    //             $rootScope.isAttendanceStart = true;
    //         }

    //         console.log($scope.loginData.startAttendance);


    //         $scope.data.isAttendanceDataReceived = 'Yes';
    //         myAllSharedService.drTypeFilterData.isAttendanceDataReceived = 'Yes';

    //         $scope.attendData = result;
    //         myAllSharedService.drTypeFilterData.attendData = result;

    //         console.log($scope.attendData);

    //     }, function (err) {

    //         console.error(err);
    //     });
    // }


    $scope.goToPage = function (URL) {
        $state.go(URL);
    }
    $scope.loginAlert = function () {
        $ionicPopup.alert({
            title: 'Error!',
            template: 'To continue, Start Work Time !'
        });

    }


    $scope.formatDate = function (date) {
        return new Date(date);
    }

    if ($location.path() == '/tab/dashboard') {
        $scope.loginData.channelSalesLogin = myAllSharedService.loginData.channelSalesLogin;

        $scope.getDashboardData();
        // $scope.getAttendanceStatus();
        // $scope.getCurrentTime();
    }
    console.log($scope.loginData.startAttendance);

    $scope.onActivateGPSLocationHandler = function (targetAction) {

        let attendanceStr = '';

        if (targetAction == 'startAttend') {
            attendanceStr = 'Are You Sure, You Want to Punch In Attendance ?';
        }

        if (targetAction == 'stopAttend') {
            attendanceStr = 'Are You Sure, You Want to Punch Out Attendance ?';
        }

        $ionicPopup.confirm({

            title: attendanceStr,
            buttons: [{

                text: 'YES',
                type: 'button-block button-outline button-stable',
                onTap: function (e) {

                    $ionicLoading.show({
                        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
                    });

                    cordova.plugins.locationAccuracy.request(function (success) {

                        var options = {
                            maximumAge: 5000,
                            timeout: 10000,
                            enableHighAccuracy: true
                        };
                        $cordovaGeolocation.getCurrentPosition(options).then(function (position) {

                            $ionicLoading.hide();

                            if (targetAction == 'startAttend') {
                                $scope.onStartAttendHandler(position.coords.latitude, position.coords.longitude);
                            }

                            if (targetAction == 'stopAttend') {
                                $scope.onStopAttendHandler(position.coords.latitude, position.coords.longitude);
                            }

                        }, function (error) {

                            $ionicLoading.hide();

                            if (targetAction == 'startAttend') {
                                $scope.onStartAttendHandler('', '');
                            }

                            if (targetAction == 'stopAttend') {
                                $scope.onStopAttendHandler('', '');
                            }

                            console.log("Could not get location");
                        });

                    }, function (error) {

                        $ionicLoading.hide();

                        $ionicPopup.alert({
                            title: 'Error!',
                            template: 'To continue, Activate GPS Location!'
                        });

                    }, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
                }

            }, {


                text: 'NO',
                type: 'button-block button-outline button-stable',
                onTap: function (e) {
                    $ionicLoading.hide();

                    console.log('You Are Not Sure');
                }
            }]

        });
    }

    $scope.logout = function () {
        var query = "DELETE From " + dbTableName;
        $cordovaSQLite.execute(db, query).then(function (res) {
            myAllSharedService.loginData = {};
            myAllSharedService.drTypeFilterData.dashboardData = {};
            $state.go('orp_login');
        });
    }

    $scope.orderRefresh = function (type) {
        myAllSharedService.drTypeFilterData.order_type = type;
        myAllSharedService.drTypeFilterData.orderCreatedBy = 'me';
        myAllSharedService.drTypeFilterData.dr_name = '';
        myAllSharedService.drTypeFilterData.dr_id = '';
        myAllSharedService.drTypeFilterData.referFrom = 'dashboard';

        $state.go('tab.sfa-order-list');
    }

    $scope.onStartAttendHandler = function (lat, lng) {

        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });

        myRequestDBService.onStartAttendHandler(lng, lat).then(function (result) {

            $ionicLoading.hide();

            $scope.getAttendanceStatus();

            $cordovaToast.show('Work Time Started Successfully', 'short', 'center').then(function (success) {

            }, function (error) {

            });

        }, function (err) {

            $ionicLoading.hide();
            console.error(err);
        });
    }


    $scope.onStopAttendHandler = function (lat, lng) {

        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });

        myRequestDBService.onStopAttendHandler($scope.attendData.attend_id, lng, lat).then(function (result) {

            console.log(result);
            $ionicLoading.hide();

            $scope.getAttendanceStatus();

            $cordovaToast.show('Work Time Stop Successfully', 'short', 'center').then(function (success) {

            }, function (error) {

            });

        }, function (err) {

            $ionicLoading.hide();
            console.error(err);
        });
    }




    $scope.onGoToDrListHandler = function (row) {

        myAllSharedService.drTypeFilterData.typeId = row.typeId;
        myAllSharedService.drTypeFilterData.typeName = row.typeName;
        myAllSharedService.drTypeFilterData.typeStatus = row.typeStatus;
        myAllSharedService.drTypeFilterData.typeCount = row.typeCount;

        $state.go('tab.customer-list');
    }

    $scope.gotoDrPage = function (type, value) {
        console.log(type);
        console.log(value);

        if (type == "Distributor") {
            myAllSharedService.drTypeFilterData.networkTabActive = 1;
            myAllSharedService.drTypeFilterData.outstanding = value;
            $state.go("tab.distribution-network");
        }
        if (type == "Dealer") {
            myAllSharedService.drTypeFilterData.networkTabActive = 2;
            myAllSharedService.drTypeFilterData.outstanding = false;
            $state.go("tab.distribution-network");
        }
        if (type == "Electrician") {
          myAllSharedService.drTypeFilterData.networkTabActive = 3;
          myAllSharedService.drTypeFilterData.outstanding = false;
          $state.go("tab.Electrician-list");
        }
        if (type == "outstanding") {
            myAllSharedService.drTypeFilterData.networkTabActive = 1;
            myAllSharedService.drTypeFilterData.outstanding = true;
            $state.go("tab.distribution-network");
        }
    }

    $scope.onGoToAddDrPageHandler = function () {

        myAllSharedService.drTypeFilterData.drId = '';
        $state.go('tab.add-lead');
    }


    $scope.getRoundAmountHandler = function (val) {

        return val.toFixed(2);
    }

    console.log($scope.loginData);

    $scope.goToBackPage = function () {
        console.log('heloasasas');
        $ionicHistory.goBack();
    }

    // if (ionic.Platform.isAndroid()) {

    //   $cordovaAppVersion.getVersionNumber().then(function (version) {
    //     console.log(version);
    //     appVersion = version;
    //     $rootScope.current_app_version = version;
    //     myRequestDBService.orpPostServiceRequest('/Dashboard_Controller/update_dr_version/' + appVersion)
    //     .then(function (response) {
    //       console.log(response);
    //     }, function (err) {
    //       console.error(err);
    //     });

    //   });

    // }



    if (ionic.Platform.isAndroid() && $location.path() == '/tab/dashboard') {
        console.log('*** GET VERSION NUMBER CALLED ***');

        myRequestDBService.orpPostServiceRequest('/Dashboard_Controller/getVersion')
        .then(function (response) {

            console.log(response);
            googleStoreVersion = response.google_store_version;

            if (googleStoreVersion) {

                $cordovaAppVersion.getVersionNumber().then(function (version) {
                    console.log(version);
                    console.log(googleStoreVersion);
                    appVersion = version;

                    if (googleStoreVersion !== version) {
                        console.log('Google Store Version not Equals to App Version');
                        versionerr(googleStoreVersion, appVersion);
                        $ionicPlatform.registerBackButtonAction(function (e) {
                            //This will restrict the user to close the popup by pressing back key
                            console.log('Registration Back Button Called');
                            e.preventDefault();
                        }, 401);
                    };

                });
            }



            console.log(googleStoreVersion);
        }, function (err) {
            $ionicLoading.hide();


            console.error(err);
        });


        versionerr = function (newv, oldv) {

            $ionicPopup.confirm({

                title: 'Update Available',
                template: "A newer version(" + newv + ") of this app is available for download. Please update it from PlayStore ! ",
                subTitle: 'current version : ' + oldv,
                buttons: [{

                    text: 'Exit',
                    type: 'button-block button-outline button-stable',
                    onTap: function (e) {
                        ionic.Platform.exitApp();

                    }

                }, {


                    text: 'Update',
                    type: 'button-block button-outline button-stable',
                    onTap: function (e) {
                        console.log('You Are Not Sure');
                        console.log("okaya update");
                        $window.open("https://play.google.com/store/apps/details?id=com.abacus.loyaltymicrotek", '_system');
                        ionic.Platform.exitApp();
                    }
                }]

            });

        }
    }

})





