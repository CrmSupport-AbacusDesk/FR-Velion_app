app.controller('orploginCtrl', function ($scope, $rootScope, searchSelect, $ionicModal, $state, myRequestDBService, myAllSharedService, $ionicLoading, $cordovaSQLite, $ionicPopup, $timeout, $ionicActionSheet, $cordovaImagePicker, Camera, $cordovaFileTransfer, $cordovaGeolocation, $cordovaToast, $location, $window, $ionicPlatform, $ionicHistory, $ionicModal,$stateParams, $ionicScrollDelegate, $ionicPopover, $ionicSlideBoxDelegate)
{
    $scope.goToBackPageHandler = function() {
        console.log($ionicHistory.goBack())
        $ionicHistory.goBack();
    }

    $scope.introduction_screen = [
        'screen-1.png',
        'screen-2.png',
        'screen-3.png',
        'screen-4.png',
        'screen-5.png',
    ];

    $scope.loginData = myAllSharedService.loginData;
    // $scope.loginData = {};
    console.log(myAllSharedService.loginData);

    $scope.data = {};
    $scope.userData = {};
    $scope.uploadURL = uploadURL;
    $scope.showMobile = true;
    $scope.Reg_mobile_no;
    $scope.Duplicacy;
    $scope.Duplicacy = myAllSharedService.Duplicacy;
    $scope.Reg_mobile_no = myAllSharedService.mobile_no;
    console.log($scope.Reg_mobile_no);
    console.log($ionicHistory.currentStateName());


    $scope.otpCode = '';
    $scope.distributorList = [];
    $scope.search = {}
    $scope.view = 'false';

    $scope.login = function () {
        console.log("function call");
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });

        myRequestDBService.orpPostServiceRequest('/ORP_Login/onValidateLogin',$scope.loginData).then(function (result)
        {
            console.log(result);

            $ionicLoading.hide();
            if (result.status == 'success')
            {
                var query = "INSERT INTO " + dbTableName + " (username,password,organisationId) VALUES (?,?,?)";
                $cordovaSQLite.execute(db, query, [$scope.loginData.username, $scope.loginData.password, result.loginData.organisationId]).then(function (resultData)
                {
                    const loginData = {};
                    console.log(result);

                    if(result.loginData.dr_code)
                    {
                        loginData.loginId = result.loginData.id;
                        loginData.loginName = result.loginData.dr_name;
                        loginData.loginType = result.loginData.type_name;
                        $rootScope.loginType = result.loginData.type_name;
                        loginData.loginTypeId = result.loginData.type_id;
                        loginData.loginMobile = result.loginData.contact_mobile_no;
                        loginData.contact_name = result.loginData.contact_name;
                        loginData.orp = result.loginData.orp;
                        loginData.orp_wallet_point = parseInt(result.loginData.orp_wallet_point);
                        loginData.drCode = result.loginData.dr_code;
                        loginData.state = result.loginData.state_name;
                        loginData.district = result.loginData.district_name;
                        loginData.isPasswordChange = result.loginData.isPasswordChange;
                        myAllSharedService.loginData = loginData;
                        console.log(myAllSharedService.loginData)
                        $ionicLoading.show({ template: 'Loging Successfully!', noBackdrop: true, duration: 2000 });
                        $rootScope.showBanner = 0;
                        $state.go('orptab.orp_dashboard');
                        if (window.cordova && ionic.Platform.isAndroid()) {
                            console.log("Android");
                            init(loginData.loginId);
                        }
                        if (window.cordova && ionic.Platform.isIOS()) {
                            console.log("IOS");
                            init(loginData.loginId);
                        }
                    }
                    else if (result.loginData.emp_code)
                    {
                        loginData.loginId = result.loginData.id;
                        loginData.loginName = result.loginData.name;
                        loginData.loginType = 'Sales User';
                        loginData.emp_code = result.loginData.emp_code;
                        loginData.loginSubType = result.loginData.sales_user_type;
                        loginData.loginMobile = result.loginData.contact_01;
                        loginData.loginImage = result.loginData.image;
                        loginData.loginAccessLevel = result.loginData.access_level;
                        loginData.user_branch = result.loginData.user_branch;
                        loginData.channelSalesLogin = true;
                        myAllSharedService.loginData = loginData;
                        $state.go('tab.dashboard');
                    }
                    else
                    {
                        $ionicLoading.hide();
                        $state.go('orp_login');

                        $ionicPopup.alert({
                            title: 'Login failed!',
                            template: 'Please check your credentials!'
                        });
                    }

                },
                function (err) {

                    $ionicLoading.hide();
                    console.error(err);
                });
            }
            else
            {
                $ionicPopup.alert({
                    title: 'Login failed!',
                    template: 'Please check your credentials!'
                });
            }

        }, function (resultData) {

            $ionicLoading.hide();
            $state.go('orp_login');

            $ionicPopup.alert({
                title: 'Login failed!',
                template: 'Please check your credentials!'
            });
        });
    }


    $scope.getOTP = function ()
    {
        $scope.data.otp = '';
        $scope.otpCode = '';

        console.log("function call");
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });

        myRequestDBService.orpPostServiceRequest('/ORP_Login/onValidateMobileExistance',$scope.data).then(function (result)
        {
            console.log(result);
            $ionicLoading.hide();
            if (result.status == 'success')
            {
                $scope.showMobile = false;
                // $scope.data.otp = result.otpCode;
                myAllSharedService.otpCode = result.otpCode;
                myAllSharedService.id = result.loginId;
                myAllSharedService.loginType = result.loginType;

                $cordovaToast.show('OTP Sent Successfully', 'short', 'bottom').then(function (success) {

                }, function (error) {

                });
            }
            else
            {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Mobile Number Does Not Exist!'
                });
            }

        });

    }

    $scope.Reg_mobile_no = myAllSharedService.mobile_no;
    console.log($scope.Reg_mobile_no);

    if($location.path() == '/orp_otp') {

        if($scope.Duplicacy=="Duplicacy"){

            $scope.data.mobileNo = myAllSharedService.mobile_no;
            $scope.showMobile=false;
            $scope.getOTP();
            myAllSharedService.mobile_no={};
            myAllSharedService.Duplicacy={};
        }
    }

    if ($ionicHistory.currentStateName() == 'orptab.orp_forgotpassword') {

        if(myAllSharedService.loginData && myAllSharedService.loginData.loginId) {

            console.log('hello');
            $scope.data.id = $scope.loginData.loginId;
            myAllSharedService.id = $scope.loginData.loginId;
            $scope.showMobile = false;

        } else {
            $scope.showMobile = true
        }
    }


    $scope.checkOtp = function()
    {
        console.log(myAllSharedService);

        const otpCode = $scope.data.otp;

        console.log(otpCode);
        console.log(myAllSharedService.otpCode);


        if (otpCode == myAllSharedService.otpCode)
        {
            $state.go('orp_forgotpassword');

        } else
        {
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Enter Correct OTP!'
            });
        }
    }


    $scope.onSavePassword = function()
    {
        console.log(myAllSharedService);
        console.log($scope.data);
        if($scope.data.password != $scope.data.confirmpassword)
        {
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Both Password Not Matched!'
            })
        }
        else{
            $ionicPopup.confirm({

                title: 'Are You Sure, You Want to Update Password ?',
                buttons: [{
                    text: 'YES',
                    type: 'button-block button-outline button-stable',
                    onTap: function (e) {
                        $ionicLoading.show({
                            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
                        });

                        $scope.data.id = myAllSharedService.id;
                        $scope.data.loginType = myAllSharedService.loginType;

                        myRequestDBService.orpPostServiceRequest('/ORP_Login/onUpdateLoginPassword',$scope.data)
                        .then(function (result) {

                            $ionicLoading.hide();
                            console.log(result);
                            if(result.status == 'Success')
                            {
                                $ionicLoading.show({ template: 'Password Updated Successfully!', noBackdrop: true, duration: 2000 });

                                if($scope.loginData && $scope.loginData.loginId) {

                                    var query = "UPDATE " + dbTableName + " SET password = "+ $scope.data.password +"";
                                    $cordovaSQLite.execute(db, query).then(function (resultData)
                                    {
                                        console.log(resultData);
                                    });

                                    // $rootScope.showBanner = 0;
                                    $state.go('orptab.orp_dashboard');

                                } else {

                                    $state.go('orp_login');

                                }

                            }
                            else
                            {
                                $ionicPopup.alert({
                                    title: 'Error!',
                                    template: 'Password not Updated, Try Later'
                                });

                            }

                        }, function (err) {

                            console.error(err);
                            $ionicLoading.hide();
                        })
                    }

                }, {

                    text: 'NO',
                    type: 'button-block button-outline button-stable',
                    onTap: function (e) {

                        console.log('You Are Not Sure');
                    }
                }]

            });
        }

    }

    $scope.mediaData = [];
    $scope.mediaData1 = [];
    $scope.mediaData2 = [];

    $scope.AadharImageClick=false;
    $scope.PanImageClick=false;
    $scope.DLImageClick=false;
    $scope.onImageTypeHandler = function (img_type) {
        console.log("click on image" + img_type);
        $scope.img_type=img_type

        $ionicActionSheet.show({
            buttons: [
                { text: "<i class='icon ion-android-image'></i> Take Picture From Gallery" },
                { text: "<i class='icon ion-camera'></i> Open Camera" }
            ],
            cancelText: 'Cancel',
            cancel: function () {

            },
            buttonClicked: function (index) {

                if (index === 0) {

                    $scope.onGetImageAccessPermissionHandler('gallaryPicture');

                } else if (index === 1) {

                    $scope.onGetImageAccessPermissionHandler('cameraPicture');
                }

                return true;
            }

        })

    }

    $scope.onGetImageAccessPermissionHandler = function(actionType) {

        cordova.plugins.diagnostic.requestCameraAuthorization({
            successCallback: function (data_status) {

                if(actionType == 'cameraPicture') {
                    $scope.onTakePictureFromCameraHandler();
                }

                if(actionType == 'gallaryPicture') {
                    $scope.getGallaryImageHandler();
                }

            }, errorCallback: function (error) {

                console.error(error);

            }, externalStorage: true

        });
    }
    $scope.onTakePictureFromCameraHandler = function() {

        var options = {

            quality: 70,
            targetWidth: 1024,
            targetHeight: 1024,
            saveToPhotoAlbum: false,
            cameraDirection: 1,
            correctOrientation: true
        };

        Camera.getPicture(options).then(function (imageData) {

            console.log(imageData);

            if ($scope.img_type =='cancel_check')
            {
                $scope.data.cancel_check = [];

                $scope.data.cancel_check.push({
                    src: imageData,
                });

            }
            if ($scope.img_type=='document')
            {
                $scope.mediaData.push({
                    src: imageData,
                    doc_type: $scope.data.doc_type,
                    doc_number: $scope.data.document_no
                });

            }


            $scope.data.doc_type = undefined;
            $scope.data.document_no = undefined;

        }, function (err) {


        });
    }

    $scope.getGallaryImageHandler = function() {

        var options = {

            maximumImagesCount: 1,
            width: 1024,
            height: 1024,
            quality: 70,
            cameraDirection: 1,
            correctOrientation: true
        };

        $cordovaImagePicker.getPictures(options).then(function (results) {

            console.log(results);

            for (var i = 0; i < results.length; i++) {

                if($scope.img_type=='document') {
                    $scope.mediaData.push({
                        src: results[i],
                        doc_type: $scope.data.doc_type,
                        doc_number: $scope.data.document_no
                    });
                }

                if ($scope.img_type == 'cancel_check') {
                    $scope.data.cancel_check = [];

                    $scope.data.cancel_check.push({
                        src: results[i],

                    });

                }

            }

            $scope.data.doc_type = undefined;
            $scope.data.document_no = undefined;

        }, function (error) {

            console.log('Error: ' + JSON.stringify(error));
        });
    }

    $scope.delete_img = function(index) {
        console.log("index");
        console.log(index);
        $scope.mediaData.splice(index,1);
    }

    $scope.remove_check = function (index) {
        console.log("index");
        console.log(index);
        $scope.data.cancel_check.splice(index, 1);
    }

    // $scope.uploadImageData = function() {

    //     // if($scope.mediaData.length)
    //     // {
    //     //     $ionicLoading.show
    //     //     ({
    //     //         template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
    //     //     });

    //     //     angular.forEach($scope.mediaData, function(val, key) {

    //     //         var options = {

    //     //             fileKey: "file",
    //     //             fileName: "image.jpg",
    //     //             chunkedMode: false,
    //     //             mimeType: "image/*",
    //     //         };

    //     //         $cordovaFileTransfer.upload(orpServerURL+'/ORP_Controller/onUploadDocumentImageData/' + $scope.loginData.loginId, val.src, options,val.type ).then(function(result) {

    //     //             console.log("SUCCESS: " + JSON.stringify(result));

    //     //             $ionicLoading.hide();
    //     //             // $scope.getLoginUserDetail();

    //     //             $cordovaToast.show('Document Image Uploaded Successfully', 'short', 'bottom').then(function (success) {

    //     //             }, function (error) {

    //     //             });

    //     //         }, function(err) {

    //     //             $ionicLoading.hide();
    //     //             console.log("ERROR: " + JSON.stringify(err));

    //     //             $cordovaToast.show('Something Went Wrong, Try Later!', 'short', 'bottom').then(function (success) {

    //     //             }, function (error) {

    //     //             });
    //     //         });
    //     //     });
    //     // }
    //     // else
    //     // {
    //     //     $ionicLoading.hide();

    //     // }
    // }

    $scope.All_distributors = [];

    $scope.get_distributor = function()
    {
        $scope.search.drName = [];
        $scope.All_distributors = [];

        const districtName = $scope.search.stateName && $scope.search.stateName.Key ? $scope.search.stateName.Key : '';

        // console.log($scope.search.stateName.Key);

        myRequestDBService.orpPostServiceRequest('/ORP_Login/getDistributorList', districtName)
        .then(function(response)
        {
            console.log(response);
            $ionicLoading.hide();
            $scope.All_distributors = response.list;

        }, function (err) {

            console.error(err);
        });
    }


    $scope.search.drName = [];
    $scope.selectedDr = [];

    $scope.select_mul_dr = function(data)
    {
        console.log(data)
        var idx = $scope.search.drName.findIndex(row=>row == data.Key);
        if(idx == -1)
        {
            $scope.search.drName.push(data.Key);
        }
        else
        {
            $scope.search.drName.splice(idx,1);
        }

        var idx2 = $scope.selectedDr.findIndex(row=>row.dr_name == data.Key);
        if(idx2 == -1)
        {
            $scope.selectedDr.push({"dr_id":data.id,"dr_name":data.Key});
        }
        else
        {
            $scope.selectedDr.splice(idx2,1);
        }

        console.log($scope.search.drName);
        console.log($scope.selectedDr);
    }

    $scope.categoryList = [];
    $scope.search.categoryName =[];
    $scope.selectedCategory =[];
    $scope.getAllCategorySegments = function()
    {

        myRequestDBService.orpPostServiceRequest('/App_SharedData/getAllCategoryList')
        .then(function(response)
        {
            console.log(response);
            $ionicLoading.hide();
            $scope.categoryList = response.categoryList;

        }, function (err) {

            console.error(err);
        });
    }

    $scope.select_mul_category = function (data)
    {
        console.log(data.category)
        var idx = $scope.search.categoryName.findIndex(row=>row == data.Key);
        if(idx == -1)
        {
            $scope.search.categoryName.push(data.Key);
        }
        else
        {
            $scope.search.categoryName.splice(idx,1);
        }

        var idx2 = $scope.selectedCategory.findIndex(row=>row.dr_name == data.Key);
        if(idx2 == -1)
        {
            $scope.selectedCategory.push({"category_id":data.id,"category_name":data.Key});
        }
        else
        {
            $scope.selectedCategory.splice(idx2,1);
        }

        console.log($scope.search.categoryName)

        $scope.getAllBrandList();
    };


    $scope.brandList = [];
    $scope.search.brandName =[];
    $scope.selectedBrand =[];

    $scope.getAllBrandList = function()
    {
        $scope.brandList = [];

        myRequestDBService.orpPostServiceRequest('/App_SharedData/getAllBrandList',$scope.search.categoryName)
        .then(function(response)
        {
            console.log(response);
            $scope.brandList = response.brandList;
            console.log($scope.brandList);


        }, function (err) {

            console.error(err);
        });
    }

    $scope.select_mul_brand = function (data)
    {
        console.log(data.category)
        var idx = $scope.search.brandName.findIndex(row=>row == data.Key);
        if(idx == -1)
        {
            $scope.search.brandName.push(data.Key);
        }
        else
        {
            $scope.search.brandName.splice(idx,1);
        }

        var idx2 = $scope.selectedBrand.findIndex(row=>row.brand_name == data.Key);
        if(idx2 == -1)
        {
            $scope.selectedBrand.push({"brand_name":data.Key});
        }
        else
        {
            $scope.selectedBrand.splice(idx2,1);
        }

        console.log($scope.search.brandName)

        //   $scope.getAllBrandList();
    };

    $scope.onSearchPincodeChangeHandler = function() {

        console.log(this.data.pincode)
        console.log(this.data.pincode.length)

        if(this.data.pincode) {

            setTimeout(() => {

                $ionicLoading.show({
                    template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
                });

                console.log(this.data.pincode)

                myRequestDBService.get_pincode_Address($scope.data.pincode)
                .then(function (result)  {

                    setTimeout(() => {
                        $ionicLoading.hide();
                    }, 200);

                    console.log(result);

                    if(result.pincodeData && result.pincodeData['id']) {

                        const stateName = result.pincodeData.state_name;

                        const districtName = result.pincodeData.district_name;
                        const cityName = result.pincodeData.city;
                        const pincode = result.pincodeData.pincode;

                        $scope.search.stateName = { Key: stateName, Value: stateName };

                        setTimeout(() => {

                            $scope.onGetSearchSelectDataHandler('fetchDistrictData', '', 1);

                        }, 500);

                        setTimeout(() => {

                            $scope.search.districtName = { Key: districtName, Value: districtName };

                        }, 3000);

                        $scope.data.city = cityName;
                        $scope.data.pincode = pincode;

                        $scope.data.searchPincode = '';

                    } else {

                        $scope.search.stateName = { Key: "Select State", Value: "" };
                        $scope.search.districtName = { Key: "Select District", Value: "" };
                        $scope.data.city = '';
                        $scope.data.pincode = '';
                    }

                },function (err) {

                    $ionicLoading.hide();
                    console.error(err);
                })

            }, 500);

        } else {

            $scope.search.stateName = { Key: "Select State", Value: "" };
            $scope.search.districtName = { Key: "Select District", Value: "" };
            $scope.data.city = '';
            //      $scope.data.pincode = '';
        }
    }

    let fetchingRecords = false;

    $scope.onGetSearchSelectDataHandler = function (type_info, searchKey, pagenumber) {
        if(!searchKey) {

            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
                duration: 3000
            });
        }

        if (fetchingRecords) return;
        fetchingRecords = true;

        var targetArr = { type: type_info, state_name: $scope.search.stateName.Value, loginData: $scope.loginData };

        searchSelect.onGetSearchSelectData(targetArr, searchKey, pagenumber).then(function (result) {

            console.log(result);

            if (type_info == 'fetchStateData') {

                $scope.totalStateRecords = result.TotalRecords;
                $scope.stateList = result.Records;
            }

            if (type_info == 'fetchDistrictData') {
                $scope.totalDistrictRecords = result.TotalRecords;
                $scope.districtList = result.Records;
            }

            fetchingRecords = false;

        }, function (errorMessage) {

            console.log(errorMessage);
            window.console.warn(errorMessage);
            fetchingRecords = false;
        });
    };

    $scope.$watch('search.stateName', function (newValue, oldValue) {

        if (newValue && newValue.Value && newValue.Value != oldValue.Value) {

            console.log('Go');
            console.log($scope.search.stateName);

            $scope.search.districtName = { Key: "Select District", Value: "" };
            $scope.onGetSearchSelectDataHandler('fetchDistrictData', '', 1);
        }
    });


    $scope.$watch('search.districtName', function (newValue, oldValue) {

        if (newValue && newValue.Value && newValue.Value != oldValue.Value) {

            console.log('Go');
            console.log($scope.search.districtName);
            $scope.get_distributor();

        }
    });


    $scope.docList;
    $scope.getDocList = function () {
        $scope.docList = [];

        myRequestDBService.getdoclist()
        .then(function (response) {
            console.log(response);
            $scope.docList = response.data;
            console.log($scope.docList);


        }, function (err) {

            console.error(err);
        });
    }


    if($location.path() == '/orp_registration') {

        $scope.getDocList();
        $scope.search.stateName = { Key: "Select State", Value: "" };
        $scope.search.districtName = { Key: "Select District", Value: "" };
        $scope.getAllCategorySegments();
        setTimeout(() => {
            $scope.onGetSearchSelectDataHandler('fetchStateData', '', 1);
        });
    }


    $scope.onSaveDrHandler = function()
    {
        console.log($scope.data);

        if($scope.data.type_name == 'Dealer' && $scope.selectedDr.length==0)
        {
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Select Distributor!'
            })
        }
        else if( $scope.data.type_name == 'Dealer' && $scope.selectedCategory.lemgth==0)
        {
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Select Category!'
            })
        }
        else if ($scope.mediaData == 0)
        {
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Document Image Required !'
            })
        }
        else
        {
            $ionicPopup.confirm({

                title: 'Are You Sure, You Want to Register ?',
                buttons: [{
                    text: 'YES',
                    type: 'button-block button-outline button-stable',
                    onTap: function (e) {
                        $ionicLoading.show({
                            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
                        });

                        $scope.data.stateName = $scope.search.stateName.Value;
                        $scope.data.districtName = $scope.search.districtName.Value;


                        $scope.data.selectedDr = $scope.selectedDr;
                        $scope.data.selectedCategory = $scope.selectedCategory;
                        $scope.data.selectedBrand = $scope.selectedBrand;

                        if($scope.data.fname != undefined && $scope.data.lname != undefined)
                        $scope.data.contact_name =$scope.data.fname+' '+$scope.data.lname;
                        else
                        ($scope.data.fname != undefined) ? ($scope.data.contact_name = $scope.data.fname ):($scope.data.lname != undefined) ? ($scope.data.contact_name =$scope.data.lname):'';

                        if($scope.data.type_name == 'Dealer')
                        $scope.data.typeId = 12;

                        if($scope.data.type_name == 'Distributor')
                        $scope.data.typeId = 6;

                        if($scope.data.type_name == 'Electrician')
                        $scope.data.typeId = 13;

                        if($scope.data.dob)
                        $scope.data.dob = moment($scope.data.dob).format('YYYY-MM-DD');

                        if($scope.data.doa)
                        $scope.data.doa = moment($scope.data.doa).format('YYYY-MM-DD');

                        console.log($scope.data);

                        myRequestDBService.orpPostServiceRequest('/ORP_Login/onRegistration',$scope.data)
                        .then(function (result) {

                            $ionicLoading.hide();
                            console.log(result);
                            console.log(result.inserted_id);
                            if(result.status == 'success')
                            {
                                console.log("array length" + $scope.data.cancel_check);

                                if($scope.mediaData.length)
                                {
                                    $ionicLoading.show
                                    ({
                                        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
                                    });

                                    angular.forEach($scope.mediaData, function(val, key) {

                                        var options = {

                                            fileKey: "file",
                                            fileName: "image.jpg",
                                            chunkedMode: false,
                                            mimeType: "image/*",
                                        };
                                        console.log(result.inserted_id);
                                        $scope.insert_id = result.inserted_id;
                                        console.log($scope.insert_id);
                                        $cordovaFileTransfer.upload(orpServerURL + '/ORP_Controller/onUploadDocumentImageData/' + $scope.insert_id + '/' + val.doc_type + '/' + val.doc_number, val.src, options).then(function(result) {

                                            console.log("SUCCESS: " + JSON.stringify(result));

                                            $ionicLoading.hide();
                                            // $scope.getLoginUserDetail();

                                            $cordovaToast.show('Document Image Uploaded Successfully', 'short', 'bottom').then(function (success) {

                                            }, function (error) {

                                            });

                                        }, function(err) {

                                            $ionicLoading.hide();
                                            console.log("ERROR: " + JSON.stringify(err));

                                            $cordovaToast.show('Something Went Wrong, Try Later!', 'short', 'bottom').then(function (success) {

                                            }, function (error) {

                                            });
                                        });
                                    });
                                }
                                if ($scope.data.cancel_check && $scope.data.cancel_check.length)
                                {
                                    console.log("cancel check update");
                                    angular.forEach($scope.data.cancel_check, function (val, key) {
                                        var options = {

                                            fileKey: "file",
                                            fileName: "image.jpg",
                                            chunkedMode: false,
                                            mimeType: "image/*",
                                        };
                                        $scope.insert_id = result.inserted_id;
                                        $cordovaFileTransfer.upload(orpServerURL + '/ORP_Controller/UPDATE_CENCEL_CHECK/' + $scope.insert_id, val.src, options).then(function (result) {
                                            console.log("SUCCESS: " + JSON.stringify(result));
                                        });
                                    });
                                }
                                else
                                {
                                    $ionicLoading.hide();

                                }
                                $ionicPopup.alert({
                                    template: 'Successfully Registered!, Login Details has been sent to Your Registered Mobile',
                                });
                                $state.go('orp_login');
                            }
                            else
                            {

                                if(result.error_type=="Duplicacy"){

                                    $ionicPopup.confirm({

                                        title: 'Mobile No. already exists! change Password',
                                        buttons: [{
                                            text: 'YES',
                                            type: 'button-block button-outline button-stable',
                                            onTap: function (e)
                                            {
                                                $ionicLoading.show({
                                                    template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
                                                });
                                                console.log(e);
                                                $ionicLoading.hide();
                                                myAllSharedService.mobile_no=result.mobile_no;
                                                myAllSharedService.Duplicacy = "Duplicacy";
                                                $state.go('orp_otp');
                                                console.log('OTP PAGE');
                                            }

                                        }
                                        , {

                                            text: 'NOT NOW',
                                            type: 'button-block button-outline button-stable',
                                            onTap: function (e) {
                                                console.log(e);
                                                console.log('You Are Not Sure');
                                            }
                                        }
                                    ]

                                });
                            }else{

                                $ionicPopup.alert({
                                    title: 'Error!',
                                    template: result.statusMessage
                                });
                            }
                        }

                    }, function (err) {

                        console.error(err);
                        $ionicLoading.hide();
                    })
                }

            }, {

                text: 'NO',
                type: 'button-block button-outline button-stable',
                onTap: function (e) {

                    console.log('You Are Not Sure');
                }
            }]

        });
    }

}


$scope.mobileNo_Handeler = function ()
{

    console.log("function call");
    $ionicLoading.show({
        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
    });

    myRequestDBService.mobileNoRequest('/ORP_Login/CHECK_MOBILE_EXIST/'+$scope.data.mobile_no).then(function (result)
    {
        console.log(result);
        $ionicLoading.hide();
        if(result.Existence){
            $ionicPopup.confirm({

                title: 'Mobile No. already exists! If Forgot Password, Login Through OTP',
                buttons: [{
                    text: 'YES',
                    type: 'button-block button-outline button-stable',
                    onTap: function (e)
                    {
                        $ionicLoading.show({
                            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
                        });
                        console.log(e);
                        $ionicLoading.hide();
                        myAllSharedService.mobile_no=result.mobile_no;
                        myAllSharedService.Duplicacy = "Duplicacy";
                        $state.go('orp_otp');
                        console.log('OTP PAGE');
                    }

                }
                , {

                    text: 'NOT NOW',
                    type: 'button-block button-outline button-stable',
                    onTap: function (e) {
                        console.log(e);
                        console.log('You Are Not Sure');
                        $state.go('orp_login');
                    }
                }
            ]

        });
    }

},function (err) {

    console.error(err);
    $ionicLoading.hide();
})

// }
}

$('#mobile_no').on('input', function() {
    $(this).val($(this).val().replace(/[^0-9]/gi, ''));
});

$('#email').on('input', function() {
    $(this).val($(this).val().replace(/[^a-zA-Z@._0-9]/gi, ''));
});

$('#gst').on('input', function() {
    $(this).val($(this).val().replace(/[^a-zA-Z0-9]/gi, ''));
});

$('#pan').on('input', function() {
    $(this).val($(this).val().replace(/[^a-zA-Z0-9]/gi, ''));
});

$('#pincode').on('input', function() {
    $(this).val($(this).val().replace(/[^0-9]/gi, ''));
});

var today=new Date();
$scope.today = today.toISOString();

console.log($scope.today);

$scope.index=0;
$scope.slideHasChanged = function(index){
    console.log(index)
    $scope.index = index;

}
$scope.slide = function($index) {
    $scope.current = $scope.index;
    $ionicSlideBoxDelegate.slide($scope.index + 1);
}

$scope.userView = function($index) {
    $scope.view = 'true';
    console.log($scope.view);
}


})
