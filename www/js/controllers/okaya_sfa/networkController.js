
app.controller('networkController', function ($http,$scope, $rootScope, searchSelect, $ionicModal, $state, myRequestDBService, myAllSharedService, $ionicLoading, $cordovaSQLite, $ionicPopup, $timeout, $ionicActionSheet, $cordovaImagePicker, Camera, $cordovaFileTransfer, $cordovaGeolocation, $cordovaToast, $location, $window, $ionicPlatform, $ionicHistory, $ionicModal,$stateParams, $ionicScrollDelegate, $ionicPopover) {
    
    console.log("welcome in Network Controller");
    
    $scope.loginData = myAllSharedService.loginData;
    $scope.isSearchActive = false;
    
    $scope.data.otpVerify = false;
    $scope.data.mobileExist = false;
    
    $scope.serverURL = serverURL;
    $scope.uploadURL = uploadURL;
    $scope.networkTabActive = myAllSharedService.drTypeFilterData.networkTabActive;
    
    if($scope.networkTabActive == undefined)
    {
        $scope.networkTabActive = 1;
    }
    
    $scope.goToBackPageHandler = function() {
        $ionicHistory.goBack();
    }
    
    $scope.isSearchActive = false;
    
    $scope.data = { };
    
    $scope.data.typeId = 'Dealer';
    
    $scope.search = {};
    
    $scope.data.drFormCurrentStep = 1;
    
    $scope.currentPage = 1;
    $scope.pageSize = 30;
    
    $scope.isSearchBarOpen = false;
    $scope.noMoreListingAvailable = false;
    
    $scope.goToNetwork = function()
    {
        $state.go('tab.network-add');
    }
    
    $scope.goToNetworkDetail = function(drId)
    {
        myAllSharedService.drTypeFilterData.drId = drId;
        $state.go('tab.network-detail');
    }
    
    
    $scope.getCurrentLocation = function()
    {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        console.log("Function Call");
        // if (ionic.Platform.isAndroid()) {
        
        cordova.plugins.locationAccuracy.request(function(success) {
            
            console.log(success);
            
            var options = {
                maximumAge: 5000,
                timeout: 10000,
                enableHighAccuracy: true
            };
            
            $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
                
                console.log(position.coords.latitude+" "+position.coords.longitude);
                
                $scope.data.latitude=position.coords.latitude;
                $scope.data.longitude=position.coords.longitude;
                
                
                $ionicLoading.hide();
                
                
                if($scope.data.latitude && $scope.data.longitude)
                {
                    $ionicLoading.show({
                        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
                    });
                    
                    var data = {lat:$scope.data.latitude,lng:$scope.data.longitude}
                    myRequestDBService.sfaPostServiceRequest('/Distribution_Network/getLocationPincode',data)
                    .then(function(response) {
                        
                        $ionicLoading.hide();
                        
                        console.log(response);
                        
                        if(response.status=='Success')
                        {
                            $scope.data.pincode = response.pincode;
                            $scope.data.gps_address = response.full_address;
                            $scope.data.street = response.full_address;
                            if($scope.data.pincode)
                            {
                                $scope.getPincodeAddress();
                            }
                        }
                        else
                        {
                            alert("No address available");
                            
                            $scope.noMoreItemsAvailable = true;
                            
                        }
                        
                        $ionicLoading.hide();
                        
                        
                    }, function (err) {
                        $ionicLoading.hide();
                        alert("No address available");
                        
                        console.error(err);
                    });
                }
                
                console.log(position);
                
            }, function(err) {
                
                $ionicLoading.hide();
                
                console.log(err.code + ' ' + err.message);
                console.log('Could not get location');
            });
            
        }, function(error) {
            
            $ionicLoading.hide();
            console.log(error);
            
            $ionicPopup.alert({
                title: 'Warning !',
                template: 'It is necessary to allow location to save the dealer Information  !!'
            });
            
            $scope.data.drFormCurrentStep = 1;
            
            
            if(error.code !== cordova.plugins.locationAccuracy.ERROR_USER_DISAGREED) {
                cordova.plugins.diagnostic.switchToLocationSettings();
            }
            
        }, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
        // }
        // else
        // {
        //     console.log('Could not get location');
        // }
    }
    
    
    
    $scope.noMoreItemsAvailable = false;
    
    $scope.myNetworkList = [];
    $scope.tmpMyNetworkList = [];
    $scope.data = {};
    $scope.getNetworkList = function(type, actionType,status,value)
    {
        $scope.myNetworkList = [];
        
        console.log($scope.networkTabActive);
        if($scope.data.type != type)
        {
            $scope.data.type = type;
            $scope.myNetworkList = [];
            $scope.noMoreItemsAvailable = false;
        }
        
        if($scope.data.type=='Dealer')
        {
            if($scope.data.status != status)
            {
                console.log(status);
                $scope.data.status=status;
                $scope.myNetworkList = [];
                $scope.noMoreItemsAvailable = false;
                
            }
        }
        
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        var data = {limit:$scope.myNetworkList.length,outstanding:value};
        
        console.log(data);
        
        myRequestDBService.sfaPostServiceRequest('/Distribution_Network/getNetworkList/'+type+'/'+status,data)
        .then(function(response) {
            console.log(response);
            
            if(response.status=='Success')
            {
                if(response.data.length==0)
                {
                    $scope.noMoreItemsAvailable = true;
                }
                
                $scope.myNetworkList = $scope.myNetworkList.concat(response.data);
                
                $scope.tmpMyNetworkList = $scope.myNetworkList;
            }
            else
            {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Something went wrong !!'
                });
                
                $scope.noMoreItemsAvailable = true;
                
            }
            
            // $scope.$broadcast('scroll.infiniteScrollComplete');
            
            $ionicLoading.hide();
            
            
        }, function (err) {
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Something went wrong !!'
            });
            console.error(err);
        });
    }
    
    
    $scope.filterNetworkList = function(search)
    {
        console.log(search);
        search = search.toLowerCase();
        
        $scope.myNetworkList = $scope.tmpMyNetworkList.filter(row => row.dr_name.toLowerCase().includes(search) || row.dr_code.toLowerCase().includes(search) || row.state_name.toLowerCase().includes(search) || row.district_name.toLowerCase().includes(search) || row.zone.toLowerCase().includes(search) || row.branch.toLowerCase().includes(search));
        
        console.log(searchArray);
        
    }
    
    $scope.getDrDetailData = function(drId) {
        
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
        });
        
        $scope.isRequestInProcess = true;
        
        myRequestDBService.getDrDetailData(drId)
        .then(function(response) {
            
            console.log(response);
            $ionicLoading.hide();
            $scope.isRequestInProcess = false;
            $scope.drDetail = response;
            myAllSharedService.drTypeFilterData.drDetail = JSON.parse(JSON.stringify($scope.drDetail));
            
            myAllSharedService.drTypeFilterData.canNewMeetingStart = response.checkInData.canNewMeetingStart;
            myAllSharedService.drTypeFilterData.activityId = response.checkInData.activityId;
            myAllSharedService.drTypeFilterData.drName = response.checkInData.drName;
            // myAllSharedService.drTypeFilterData.drId = response.checkInData.drId;
            
        }, function (err) {
            
            $ionicLoading.hide();
            $scope.isRequestInProcess = false;
            console.error(err);
        });
    }
    
    
    $scope.networkData = {}
    
    $scope.checkExistMobileNo = function(mobile)
    {
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
        });
        myRequestDBService.sfaPostServiceRequest('/Distribution_Network/checkExistMobileNo/'+mobile,'')
        .then(function (resp)
        {
            console.log(resp);
            
            $ionicLoading.hide();
            if(resp.message=='exist')
            {
                $scope.data.mobileExist = true;
                $scope.networkData = resp.data;
            }
            else
            {
                $scope.data.mobileExist = false;
            }
            
            $ionicLoading.hide();
        }, function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });
    }
    
    $scope.changeMobile=function()
    {
        console.log($scope.data);
        
        if($scope.data.customerMobile1.length==10)
        {
            if($scope.data.confirm_mobile == $scope.data.customerMobile1)
            {
                console.log("False");
                $scope.data.otpVerify = true;
            }
            else
            {
                $scope.data.otpVerify = false;
                $scope.checkExistMobileNo($scope.data.customerMobile1);
                
            }
        }
    }
    
    $scope.counter = 30;
    $scope.resend_OTP_Enable = function()
    {
        
        console.log("Counter ==>",$scope.counter);
        
        
        if($scope.counter > 0)
        {
            setTimeout(() => {
                $scope.counter--;
                console.log($scope.counter);
                $scope.resend_OTP_Enable();
                
            }, 1000);
            
        }
    }
    
    $scope.sendOTP = function()
    {
        $scope.data.otp = '';
        $scope.counter = 30;
        $scope.resend_OTP_Enable();
        
        // $scope.data.customerMobile1 = '9015084313';
        myRequestDBService.sfaPostServiceRequest('/App_SharedData/sendOTP',{mobile_no:$scope.data.customerMobile1})
        .then(function(response)
        {
            console.log(response);
            console.log(response.data.status);
            if(response.data.status=="success")
            {
                
                $scope.data.confirm_otp=response.confirm_otp;
                $scope.data.confirm_mobile=response.mobile;
                console.log($scope.data);
            }
            else
            {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Invalid Mobile No. or something went wrong !!'
                });
            }
        }, function (err) {
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Something went wrong !!'
            });
            console.error(err);
        });
    }
    
    
    $scope.onGoToNextStepHandler = function() 
    {
        if($scope.data.mobileExist)
        {
            $ionicPopup.alert({
                title: 'Error !',
                template: 'Entered mobile no alredy registered with another account,please enter another mobile no !!'
            });
            return;
        }
        else if($scope.selectedDr.length==0)
        {
            $ionicPopup.alert({
                title: 'Error !',
                template: 'Please select distributor to assign !!'
            });
            return;
        }
        else if($scope.mediaData.length==0)
        {
            $ionicPopup.alert({
                title: 'Error !',
                template: 'Counter Image Required,please click or select !!'
            }); 
            return;
            
        }
        
        else
        {
            $scope.data.distributor = $scope.selectedDr;
            
            if($scope.data.otpVerify && $scope.data.confirm_mobile == $scope.data.customerMobile1)
            {
                $scope.data.drFormCurrentStep = 2;
                if(!$scope.data.latitude && !$scope.data.longitude)
                {
                    console.log("function Call");
                    $scope.getCurrentLocation();
                }
                
            }
            else
            {
                $scope.data.otpVerify = false;
                $scope.data.otpModel.show();
                $scope.sendOTP();
            }
            
            console.log($scope.data.distributor);
        }
        
        
        
    }
    
    
    $scope.confirmOTP = function()
    {
        console.log($scope.data);
        
        if($scope.data.confirm_otp == $scope.data.otp)
        {
            console.log("in IF");
            $scope.data.otpVerify = true;
            $scope.counter = 0;
            $scope.data.otpModel.hide();
            $scope.data.drFormCurrentStep = 2;
            
            if(!$scope.data.latitude && !$scope.data.longitude)
            {
                console.log("function Call");
                $scope.getCurrentLocation();
            }
            else
            {
                console.log($scope.data.latitude ,$scope.data.longitude);
            }
            
            
        }
        else
        {
            $scope.data.otpVerify = false;
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Incorrect OTP, Please Enter Valid OTP.'
            });
        }
    }
    
    
    
    $scope.onSaveDrHandler = function() {
        
        if(!$scope.data.pincode) {
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Pincode required!'
            });
            return false;
        }
        else if(!$scope.data.street)
        {
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Please enter valid pincode !'
            });
            return false;
        }
        
        if($scope.search.brandName.length && $scope.search.categoryName.length)
        {
            $scope.data.brandList = $scope.search.brandName ;
            $scope.data.categoryList = $scope.search.categoryName ;
            
        }
        else
        {
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Brand & Category is required !'
            });
            return false;
        }
        
        $ionicPopup.confirm({
            
            title: 'Are You Sure, You Want to Save ?',
            buttons: [{
                text: 'YES',
                type: 'button-block button-outline button-stable',
                onTap: function (e) {
                    
                    $ionicLoading.show({
                        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
                    });
                    
                    // $scope.data.stateName = $scope.search.stateName.Value;
                    // $scope.data.districtName = $scope.search.districtName.Value;
                    
                    delete $scope.data.otpModel;
                    console.log($scope.data);
                    
                    // return;
                    myRequestDBService.sfaPostServiceRequest('/Distribution_Network/saveNetwork',$scope.data)
                    .then(function(response) {
                        console.log(response);
                        
                        if(response.msg=='success')
                        {
                            if($scope.mediaData.length > 0)
                            {
                                var options = {
                                    fileKey: "file",
                                    fileName: "image.jpg",
                                    chunkedMode: false,
                                    mimeType: "image/*",
                                };
                                for(let i=0;i<$scope.mediaData.length;i++)
                                {
                                    console.log($scope.mediaData[i].src);
                                    $cordovaFileTransfer.upload(serverURL+"/App_Customer/onUploadProfileImageData/"+response.inserted_id, $scope.mediaData[i].src, options)
                                    .then(function(result) {
                                        console.log(result);
                                        
                                        $ionicLoading.show({ template: 'Success!', noBackdrop: true, duration: 2000 });
                                    }, function(err) {
                                        $ionicLoading.hide();
                                        console.log("ERROR: " + JSON.stringify(err));
                                    }, function (progress) {
                                    });
                                }
                            }
                            $scope.mediaData=[];
                            
                            myAllSharedService.drTypeFilterData.drId = response.inserted_id;
                            
                            
                            $state.go('tab.distribution-network');
                        }
                        else
                        {
                            $ionicPopup.alert({
                                title: 'Error!',
                                template: response.msg
                            });
                        }
                        
                        $ionicLoading.hide();
                        
                        
                    }, function (err) {
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'Error!',
                            template: 'Please Check Your Internet conection !!'
                        });
                        console.error(err);
                    });
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
    
    
    $scope.updateNetworkAssign = function()
    {
        $scope.networkData.assignDistributor = $scope.selectedDr;
        
        $ionicPopup.confirm({
            
            title: 'Are You Sure, You Want to Save ?',
            buttons: [{
                text: 'YES',
                type: 'button-block button-outline button-stable',
                onTap: function (e) {
                    
                    $ionicLoading.show({
                        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
                    });
                    
                    myRequestDBService.sfaPostServiceRequest('/Distribution_Network/updateNetwork',$scope.networkData)
                    .then(function(response) {
                        console.log(response);
                        
                        if(response.status=='Success')
                        {
                            
                            $state.go('tab.distribution-network');
                        }
                        else
                        {
                            $ionicPopup.alert({
                                title: 'Error!',
                                template: 'Something went wrong !!'
                            });
                        }
                        
                        $ionicLoading.hide();
                        
                        
                    }, function (err) {
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'Error!',
                            template: 'Something went wrong !!'
                        });
                        console.error(err);
                    });
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
    
    $scope.gotoOrder = function(args,dr_id,dr_name)
    {
        console.log(dr_id);
        if(myAllSharedService.loginData.loginAccessLevel == 3)
        {
            $state.go('tab.lead-order-list');
        }
        else
        {
            myAllSharedService.drTypeFilterData.isInsideLead = 'No';
            myAllSharedService.drTypeFilterData.orderId = '';
            myAllSharedService.drTypeFilterData.orderCreatedBy = 'me';
            myAllSharedService.drTypeFilterData.dr_id = dr_id;
            myAllSharedService.drTypeFilterData.dr_name = dr_name;
            myAllSharedService.drTypeFilterData.referFrom ='network';
            
            if(args == 'primary')
            {
                myAllSharedService.drTypeFilterData.order_type = 'primary';
            }
            else
            {
                myAllSharedService.drTypeFilterData.order_type = 'secondary';
            }
            console.log(myAllSharedService.drTypeFilterData.order_type);
            $state.go('tab.sfa-order-list');
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
        
        console.log(targetArr);
        
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
            
            $scope.search.districtName = { Key: "Select District Name", Value: "" };
            $scope.onGetSearchSelectDataHandler('fetchDistrictData', '', 1);
        }
    });
    
    $scope.perameter=function()
    {
        cordova.plugins.diagnostic.getCameraAuthorizationStatus({
            successCallback: function(status) {
                
                console.log('1st'+status);
                
                if(status === cordova.plugins.diagnostic.permissionStatus.GRANTED){
                    
                    $scope.openGallary();
                    
                } else {
                    
                    cordova.plugins.diagnostic.requestCameraAuthorization({
                        successCallback: function(data_status) {
                            
                            console.log('2nd'+data_status);
                            
                            if(data_status != 'DENIED') {
                                $scope.openGallary();
                            }
                        },
                        errorCallback: function(error){
                            console.error(error);
                        },
                        externalStorage: true
                    });
                }
            },
            errorCallback: function(error){
                console.error("The following error occurred: "+error);
            },
            externalStorage: true
        });
    }
    
    // $scope.urlForImage = function (imageName) {
    
    //     console.log(imageName);
    
    //     var trueOrigin = cordova.file.dataDirectory + imageName;
    //     return trueOrigin;
    // }
    
    // $scope.openGallary = function() {
    
    
    //     cordova.plugins.diagnostic.requestExternalStorageAuthorization({
    //         successCallback: function (status) {
    
    //             console.log(status);
    
    //             $scope.mediaData = [];
    
    //             var options = {
    //                 maximumImagesCount: 1, // Max number of selected images, I'm using only one for this example
    //                 width: 500,
    //                 height: 500,
    //                 quality: 50  // Higher is better
    //             };
    
    
    //             window.imagePicker.hasReadPermission(
    //                 function (result) {
    
    //                     $cordovaImagePicker.getPictures(options).then(function (results) {
    //                         console.log(results);
    //                         for (var i = 0; i < results.length; i++) {
    //                             $scope.mediaData.push({
    //                                 src: results[i]
    //                             });
    //                         }
    //                         console.log($scope.mediaData);
    
    //                     }, function (error) {
    //                         console.log('Error: ' + JSON.stringify(error));    // In case of error
    //                     });
    //                 }
    //             )
    
    //     },
    //     errorCallback: function (error) {
    //         console.error("The following error occurred: " + error);
    //     },
    //     externalStorage: true
    // });
    
    // }
    
    
    $scope.openGallary = function () {
        
        $scope.mediaData = [];
        
        var options = {
            maximumImagesCount: 1, // Max number of selected images, I'm using only one for this example
            width: 500,
            height: 500,
            quality: 50  // Higher is better
        };
        
        $cordovaImagePicker.getPictures(options).then(function (results) {
            console.log(results);
            
            //Loop through acquired images
            for (var i = 0; i < results.length; i++) {
                $scope.mediaData.push({
                    src: results[i]
                });
            }
            console.log($scope.mediaData);
            
        }, function (error) {
            console.log('Error: ' + JSON.stringify(error));    // In case of error
        });
    }
    
    
    $scope.getPicture = function (options) {
        
        $scope.mediaData = [];
        
        var options = {
            quality : 50,
            targetWidth: 500,
            targetHeight: 500,
            saveToPhotoAlbum: false
        };
        
        Camera.getPicture(options).then(function(imageData) {
            
            var options = {
                fileKey: "image",
                fileName: "image.jpg",
                chunkedMode: false,
                mimeType: "image/*",
            };
            $scope.mediaData.push({
                src: imageData
                
            });
            console.log("****** Image");
            
            console.log(imageData);
            console.log($scope.mediaData);
            
        }, function(err) {
            
        })
    };
    
    
    
    $scope.mediaData = [];
    $scope.data.file = false;
    $scope.open_camera = function()
    {
        // if(!$scope.profile_data.dr_image) {
        var val = 'remove-pic';
        // } else {
        //     var val = '';
        // }
        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                { text: "<i class='icon ion-android-image'></i> Take Picture From Gallery"},
                { text: "<i class='icon ion-camera'></i> Open Camera" },
                { text: "<i class='icon ion-android-delete orange-color'></i> Remove Photo", className: val}
            ],
            cancelText: 'Cancel',
            cancel: function() {
                // add cancel code..
            },
            buttonClicked: function(index) {
                //return true;
                
                if(index === 0) { // Manual Button
                    $scope.perameter();
                }
                else if(index === 1){
                    $scope.getPicture();
                }
                
                else if(index === 2) {
                    // $scope.deletePicture();
                    $scope.data.file= true;
                }
                
                return true;
            }
        })
    }
    
    
    
    $scope.delete_img = function(index) {
        console.log("index");
        console.log(index);
        $scope.mediaData.splice(index,1);
    }
    
    $scope.delete_document = function(index)
    {
        $rootScope.documentFiles.splice(index,1)
    }
    
    $scope.getPincodeAddress = function()
    {
        var data = {pincode:$scope.data.pincode}
        
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        myRequestDBService.sfaPostServiceRequest('/App_SharedData/onGetPincodeDetail',data)
        .then(function(response)
        {
            console.log(response);
            $ionicLoading.hide();
            if(response.status=='success')
            {
                $scope.data.stateName = response.pincodeData.state_name;
                $scope.data.districtName = response.pincodeData.district_name;
                $scope.data.city = response.pincodeData.city;
                
                $scope.data.state_name = response.pincodeData.state_name;
                $scope.data.district_name = response.pincodeData.district_name;
                
            }
            else
            {
                $scope.data.stateName =null;
                $scope.data.districtName =null;
                $scope.data.district_name =null;
                $scope.data.state_name =null;
                $scope.data.city =null;
                $scope.data.street =null;
                
            }
            
        }, function (err) {
            
            console.error(err);
        });
    }
    
    
    // $scope.onSearchPincodeChangeHandler = function() {
    
    //     if(this.data.searchPincode && this.data.searchPincode.length == 6) {
    
    //         setTimeout(() => {
    
    //             $ionicLoading.show({
    //                 template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
    //             });
    
    //             myRequestDBService.get_pincode_Address($scope.data.searchPincode)
    //             .then(function (result)  {
    
    //                 setTimeout(() => {
    //                     $ionicLoading.hide();
    //                 }, 200);
    
    //                 console.log(result);
    
    //                 if(result.pincodeData && result.pincodeData['id']) {
    
    //                     const stateName = result.pincodeData.state_name;
    //                     const districtName = result.pincodeData.district_name;
    //                     const cityName = result.pincodeData.city;
    //                     const pincode = result.pincodeData.pincode;
    
    //                     $scope.search.stateName = { Key: stateName, Value: stateName };
    //                     $scope.onGetSearchSelectDataHandler('fetchDistrictData', '', 1);
    
    //                     setTimeout(() => {
    
    //                         $scope.search.districtName = { Key: districtName, Value: districtName };
    
    //                     }, 1000);
    
    //                     $scope.data.city = cityName;
    //                     $scope.data.pincode = pincode;
    
    //                     $scope.data.searchPincode = '';
    
    //                 } else {
    
    //                     $scope.search.stateName = { Key: "Select State Name *", Value: "" };
    //                     $scope.search.districtName = { Key: "Select District *", Value: "" };
    //                     $scope.data.city = '';
    //                     $scope.data.pincode = '';
    //                 }
    
    //             },function (err) {
    
    //                 $ionicLoading.hide();
    //                 console.error(err);
    //             })
    
    //         }, 500);
    
    //     } else {
    
    //         $scope.search.stateName = { Key: "Select State Name *", Value: "" };
    //         $scope.search.districtName = { Key: "Select District *", Value: "" };
    //         $scope.data.city = '';
    //         $scope.data.pincode = '';
    //     }
    // }
    
    $scope.onDownloadDocumentHandler = function(doc) {
        
        console.log(doc);
        $ionicPopup.confirm({
            
            title: 'Are You Sure, You Want to Download ?',
            buttons: [{
                text: 'YES',
                type: 'button-block button-outline button-stable',
                onTap: function (e) {
                    
                    $ionicLoading.show({
                        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
                    });
                    
                    let downloadCount = 0;
                    
                    for (let index = 0; index < doc.images.length; index++) {
                        
                        var url = $scope.uploadURL + doc.images[index].image_name;
                        console.log(url);
                        /* file:///data/data/com.ionicframework.projectionic787897/files/image.png */
                        var targetPath = cordova.file.externalRootDirectory + '/Okaya/' + doc.document_title + '/' + doc.images[index].image_name;
                        
                        var trustHosts = true;
                        var options = {};
                        
                        $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function(result) {
                            
                            console.log("result : " + JSON.stringify(result));
                            downloadCount++;
                            $ionicLoading.hide();
                            
                            if(doc.images.length == downloadCount) {
                                
                                
                                $ionicPopup.alert({
                                    title: 'Success!',
                                    template: 'Files downloaded into Okaya Folder of Storage Successfully!!'
                                });
                            }
                            
                        }, function(err) {
                            
                            console.log("error : " + JSON.stringify(err));
                            $ionicLoading.hide();
                            
                            downloadCount++;
                            if(doc.images.length == downloadCount) {
                                
                                
                                $ionicPopup.alert({
                                    title: 'Success!',
                                    template: 'Files downloaded into Okaya Folder of Storage Successfully!!'
                                });
                            }
                            
                        }, function (progress) {
                            
                            $ionicLoading.hide();
                            
                            $timeout(function () {
                                $scope.downloadProgress = (progress.loaded / progress.total) * 100;
                                console.log($scope.downloadProgress);
                            })
                        });
                    }
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
    
    
    $scope.latitude = myAllSharedService.lat;
    $scope.longitude = myAllSharedService.long;
    $scope.last_gps_add = myAllSharedService.last_gps;
    
    console.log($scope.latitude,$scope.longitude);
    $scope.updateLocation = function(dr_id) {
        
        
        
        myRequestDBService.get_gps_loc($scope.drDetail.drData.id)
        .then(function (result)  {
            
            setTimeout(() => {
                $ionicLoading.hide();
            }, 200);
            
            console.log(result);
            $scope.last_gps_add = result.data.gpsData.gps_address;
            myAllSharedService.last_gps = result.data.gpsData.gps_address;
            
            if (ionic.Platform.isAndroid()) {
                
                cordova.plugins.locationAccuracy.request(function(success) {
                    
                    var options = {
                        maximumAge: 5000,
                        timeout: 10000,
                        enableHighAccuracy: true
                    };
                    
                    $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
                        
                        console.log(position.coords.latitude+" "+position.coords.longitude);    
                        
                        // window.open("geo:#{position.coords.latitude},#{position.coords.longitude}?q=#{text}", '_system', 'location=yes');
                        
                        
                        $scope.latitude=position.coords.latitude;
                        $scope.longitude=position.coords.longitude;
                        myAllSharedService.latitude = result.data.gpsData.gps_address;
                        myAllSharedService.longitude = result.data.gpsData.gps_address;
                        
                        
                        myAllSharedService.lat = position.coords.latitude;
                        myAllSharedService.long = position.coords.longitude;
                        
                        if(myAllSharedService.lat && myAllSharedService.long)
                        {
                            $state.go('map-network');
                            
                        } 
                        
                    }, function(err) {
                        
                        console.log(err.code + ' ' + err.message);
                        console.log('Could not get location');
                    });
                    
                }, function(error) {
                    
                    if(error.code !== cordova.plugins.locationAccuracy.ERROR_USER_DISAGREED) {
                        cordova.plugins.diagnostic.switchToLocationSettings();
                    }
                    
                }, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
            }
            
            
            
        },function (err) {
            
            $ionicLoading.hide();
            console.error(err);
        })
    }
    
    
    $scope.latitude=myAllSharedService.lat;
    $scope.longitude=myAllSharedService.long;
    $scope.last_gps_add=myAllSharedService.last_gps;
    $scope.location=function(dr_id)
    {
        console.log(dr_id);
        $ionicLoading.show({
            template: '<span class="icon spin ion-loading-d"></span> Loading...'
        });
        console.log(dr_id);
        myRequestDBService.get_gps_loc(dr_id)
        .then(function (result)
        {
            $ionicLoading.hide();
            console.log(result);
            $scope.last_gps_add=result.data.gps_address;
            myAllSharedService.last_gps=result.data.gps_address;
            
            var options = {
                maximumAge: 5000,
                timeout: 10000,
                enableHighAccuracy: true
            };
            
            $cordovaGeolocation.getCurrentPosition(options).then(function(position){
                console.log(position.coords.latitude+" "+position.coords.longitude);
                
                $scope.latitude=position.coords.latitude;
                $scope.longitude=position.coords.longitude;
                
                myAllSharedService.lat=position.coords.latitude;
                myAllSharedService.long=position.coords.longitude;
                $state.go('tab.map-network');
            }, function(error){
                console.log("Could not get location");
            });
            
            
            
        },function (err) {
            console.error(err);
        })
        
    }
    
    $scope.showOnMap = function(lat,lng,address)
    {
        console.log(lat,lng);
        if(lat && lng)
        {
            // window.open("geo:#{lat},#{lng}?q=#{text}", '_system', 'location=yes');
            $window.open('geo:' + lat + ',' + lng + '?z=11&q=' + lat + ',' + lng + address, '_system', 'location=yes');
            
        }
        else
        {
            $ionicPopup.alert({
                title: 'Error !',
                template: 'No Location Found, please update location  !!'
            });
        }
    }
    
    $scope.add_loc = function() {
        
        console.log(locat+" "+$scope.latitude+" "+$scope.longitude);
        console.log(myAllSharedService.drTypeFilterData.drDetail);
        
        myRequestDBService.add_loc(myAllSharedService.drTypeFilterData.drDetail.drData.id,locat,$scope.latitude,$scope.longitude)
        .then(function (result) {
            
            $cordovaToast.show('Location Updated Successfully', 'short', 'bottom').then(function(success) {
                
            }, function (error) {
                
            });
            
            $scope.goToNetworkDetail(myAllSharedService.drTypeFilterData.drDetail.drData.id);
            
        },function (err) {
            
            $ionicLoading.hide();
            console.error(err);
        })
    }
    
    
    $scope.itemSelected = function(selected) {
        
        if (selected) {
            
            console.log(selected);
            $scope.goToNetworkDetail(selected.originalObject.drId);
            
        } else {
            
            console.log('cleared');
            $('#ex5_value').val();
        }
    }
    
    
    $scope.itemSelectedClear = function() {
        $scope.$broadcast('angucomplete-alt:clearInput');
    }
    
    $scope.onSetCurrentPageHandler = function() {
        
        $scope.currentPage = 1;
        $scope.checkInList = [];
        $scope.followUpList = [];
        
        $scope.onPageScrollTopHandler();
        $scope.noMoreListingAvailable = false;
    }
    
    $scope.onPageScrollTopHandler = function() {
        $ionicScrollDelegate.scrollTop();
    }
    
    
    /*listing of uploaded document and images of dr funt of prayag ctrl start*/
    $scope.dr_doc_imag={};
    $scope.dr_doc_imag = myAllSharedService.shareDr_imagDoc;
    console.log($scope.dr_doc_imag);
    // console.log($scope.dr_doc_imag[0].document_title);
    
    
    $scope.dr_img_doc_list = function (dr_id,type) {
        
        // $ionicLoading.show
        // ({
        //     template: '<span class="icon spin ion-loading-d"></span> Loading...'
        // });
        
        $rootScope.documentFiles = [];
        
        $ionicLoading.show({
            template: '<span class="icon spin ion-loading-d"></span> Loading...'
        });
        
        myRequestDBService.dr_img_doc_list(dr_id).then(function (result) {
            
            console.log(result);
            $scope.dr_doc_imag = result;
            console.log($scope.dr_doc_imag);
            
            myAllSharedService.shareDr_imagDoc = result;
            
            $state.go('tab.tab-imgdoc');
            
            $timeout(function () { $ionicLoading.hide(); }, 200);
            $ionicLoading.hide();
            
        },
        function (err) {
            $ionicLoading.hide();
            console.error(err);
        })
    }
    
    
    $scope.mediaData=[];
    $scope.myDocAddGallaryList =  myAllSharedService.shareDrimagDocDetails;
    
    $scope.dr_img_doc_details= function (dr_id,document_title,type) {
        
        $ionicLoading.show
        ({
            template: '<span class="icon spin ion-loading-d"></span> Loading...'
        });
        
        myRequestDBService.dr_img_doc_details(dr_id, document_title)
        .then(function (result)
        {
            console.log(result);
            $scope.myDocAddGallaryList = result;
            console.log($scope.myDocAddGallaryList);
            myAllSharedService.shareDr_imagDoc = result;
            myAllSharedService.shareDrimagDocDetails = result;
            
            $state.go('tab.gallery');
            
            
            $timeout(function () { $ionicLoading.hide(); }, 200);
            
        },
        function (err) {
            $ionicLoading.hide();
            console.error(err);
        })
    }
    
    
    $scope.onSeachActionHandler = function(type, target) {
        
        if(type == 'open') {
            
            $scope.isSearchBarOpen = true;
            
            setTimeout(() => {
                
                $('#searchData').focus();
                
            }, 1000);
        }
        
        if(type == 'close') {
            
            $scope.data.search = '';
            $scope.isSearchBarOpen = false;
            $scope.onSetCurrentPageHandler();
            
            if(target == 'followUp') {
                
                $scope.getFollowUpListData('onLoad')
            }
            
            if(target == 'checkIn') {
                
                $scope.getCheckInListData('onLoad')
            }
        }
    }
    
    
    /*Function to provide option either gallery or Camera start*/
    $scope.camera_click = function(src)
    {
        console.log(src);
        if(src == 1 || !$scope.myProfileDetail.image || src == 4) {
            var val = 'remove-pic';
        } else {
            var val = '';
        }
        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                { text: "<i class='icon ion-android-image'></i> Take Picture From Gallery"},
                { text: "<i class='icon ion-camera'></i> Open Camera" },
            ],
            cancelText: 'Cancel',
            cancel: function() {
                // add cancel code..
            },
            buttonClicked: function(index) {
                
                console.log(index);
                //return true;
                
                if(index === 0) { // Manual Button
                    $scope.perm(src);
                }
                else if(index === 1){
                    $scope.takePicture(src);
                }
                
                else if(index === 2) {
                    $scope.deletePicture(src);
                }
                
                return true;
                
            }
        })
    }
    /*Function to click pic ,picimagefromgallery and show images at front end
    task  call on submit button start*/
    $scope.mediaData = [];
    $scope.takePicture = function (srcc,options) {
        
        var options = {
            quality : 50,
            targetWidth: 500,
            targetHeight: 500,
            saveToPhotoAlbum: false
        };
        
        Camera.getPicture(options).then(function(imageData) {
            
            var options = {
                fileKey: "image",
                fileName: "image.jpg",
                chunkedMode: false,
                mimeType: "image/*",
            };
            
            $scope.mediaData.push({
                src: imageData
            });
            
            console.log(imageData);
            
            
        }, function(err) {
            
        })
    };
    
    // $scope.uploadurl=uploadURL;
    
    $scope.perm = function(src) {
        
        cordova.plugins.diagnostic.getCameraAuthorizationStatus({
            successCallback: function(status) {
                
                console.log('1st'+status);
                
                if(status === cordova.plugins.diagnostic.permissionStatus.GRANTED){
                    
                    $scope.getGallary(src);
                    
                } else {
                    
                    cordova.plugins.diagnostic.requestCameraAuthorization({
                        successCallback: function(data_status) {
                            
                            console.log('2nd'+data_status);
                            
                            if(data_status != 'DENIED') {
                                $scope.getGallary(src);
                            }
                            
                        },errorCallback: function(error) {
                            
                            console.error(error);
                        },
                        externalStorage: true
                    });
                }
            },
            errorCallback: function(error){
                console.error("The following error occurred: "+error);
            },
            externalStorage: true
        });
    }
    
    
    $scope.getGallary = function(src) {
        
        if(src == 2 || src == 3 || src == 4  || src == 7) {
            
            var options = {
                maximumImagesCount: 1, // Max number of selected images, I'm using only one for this example
                width: 500,
                height: 500,
                quality: 50  // Higher is better
            };
            
        } else  {
            
            var options = {
                maximumImagesCount: 10, // Max number of selected images, I'm using only one for this example
                width: 500,
                height: 500,
                quality: 50  // Higher is better
            };
        }
        
        $cordovaImagePicker.getPictures(options).then(function (results) {
            
            console.log(results);
            if(src==7) {
                
                $scope.mediaData = [];
            }
            //Loop through acquired images
            for (var i = 0; i < results.length; i++) {
                
                $scope.mediaData.push({
                    src: results[i]
                });
            }
            
            console.log($scope.mediaData);
            
        }, function(error) {
            console.log('Error: ' + JSON.stringify(error));    // In case of error
        });
    }
    
    /* Profile Delete Function Start*/
    $scope.deletePicture = function(src) {
        
        if(src == 2) {
            $scope.myProfileDetail.image = '';
            myAllSharedService.image ='';
            $scope.profile_update(1);
        }
    }
    /*Profile Delete Function End*/
    
    
    /*upload function start*/
    $scope.upload = function(type) {
        
        // $scope.ret_id=retailer_det;
        console.log($scope.data.title);
        
        if(!$scope.data.title)
        {
            $ionicPopup.alert({
                title: 'Warning !',
                template: 'Document title required,Please mention  !!'
            });
        } 
        else
        {
            var count=0;
            if($scope.mediaData.length) {
                
                
                
                angular.forEach($scope.mediaData, function(val, key) {
                    
                    var options = {
                        fileKey: "file",
                        fileName: "image.jpg",
                        chunkedMode: false,
                        mimeType: "image/*",
                    };
                    
                    $ionicLoading.show({
                        template: '<span class="icon spin ion-loading-d"></span> Loading...'
                    });
                    
                    $cordovaFileTransfer.upload(sfaServerURL+'/Distribution_Network/dr_image_data?drId='+myAllSharedService.drTypeFilterData.drDetail.drData.id + '&document_title=' + $scope.data.title,val.src, options).then(function(result) {
                        
                        console.log("SUCCESS: " + JSON.stringify(result));
                        
                        if($scope.mediaData.length == (count+1)) {
                            
                            console.log('length '+ $scope.mediaData.length);
                            console.log('file key '+ (count+1));
                            $scope.data=[];
                            $scope.mediaData=[];
                            $scope.dr_img_doc_list(myAllSharedService.drTypeFilterData.drDetail.drData.id,type);
                            
                            $timeout(function () {
                                
                                $ionicLoading.hide();
                                
                                $cordovaToast.show('Document/s Uploaded Successfully', 'short', 'bottom').then(function(success) {
                                    
                                    $state.go('tab.network-detail')
                                    
                                }, function (error) {
                                    
                                });
                                
                            }, 500);
                        }
                        
                        count++;
                        
                    }, function(err) {
                        
                        console.log("ERROR: " + JSON.stringify(err));
                        
                    }, function (progress) {
                        
                    });
                });
                
            }
            if($rootScope.documentFiles.length)
            {
                
                for (let i = 0; i < $rootScope.documentFiles.length; i++) 
                {
                    
                    var file = $rootScope.documentFiles[i];
                    console.dir(file); 
                    
                    var fd = new FormData();
                    fd.append('file', file);
                    
                    $ionicLoading.show({
                        template: '<span class="icon spin ion-loading-d"></span> Loading...'
                    });
                    
                    $http.post(sfaServerURL+"/Distribution_Network/dr_image_data?drId="+myAllSharedService.drTypeFilterData.drDetail.drData.id + '&document_title=' + $scope.data.title, fd, {
                        transformRequest: angular.identity,
                        headers: {'Content-Type': undefined}
                    })
                    .success(function(data){
                        console.log(data);
                        if(i==$rootScope.documentFiles.length-1)
                        {
                            console.log("true");
                            $rootScope.documentFiles = [];
                            
                            $scope.data={};
                            $scope.dr_img_doc_list(myAllSharedService.drTypeFilterData.drDetail.drData.id,type);
                            
                            $timeout(function () {
                                
                                $ionicLoading.hide();
                                
                                $cordovaToast.show('Document/s Uploaded Successfully', 'short', 'bottom').then(function(success) {
                                    
                                }, function (error) {
                                    
                                });
                                
                            }, 200);
                        }
                        
                        $ionicLoading.hide();
                        
                    })
                    .error(function(error) {
                        console.log(error);
                        $ionicLoading.hide();
                    });
                }
                
            }
            else
            {
                
                $ionicLoading.hide();
                $cordovaToast.show('Profile Picture Updated Successfully', 'short', 'bottom').then(function(success) {
                }, function (error) {
                });
                if(type=='1')
                {
                    $state.go('tab-ret.tab-imgdoc-ret');
                }
                else
                {
                    $state.go('tab-dist.tab-imgdoc-dist');
                }
            }
        }
        
        
    }
    
    
    $scope.categoryList = [];
    $scope.search.categoryName =[];
    $scope.selectedCategory =[];
    $scope.getAllCategorySegments = function()
    {
        
        myRequestDBService.sfaPostServiceRequest('/App_SharedData/getAllCategoryList')
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
        
        myRequestDBService.sfaPostServiceRequest('/App_SharedData/getAllBrandList',$scope.search.categoryName)
        .then(function(response)
        {
            console.log(response);
            $scope.brandList = response.brandList;
            console.log($scope.brandList);
            
            
        }, function (err) {
            
            console.error(err);
        });
    }
    
    $scope.getDocument = function()
    {
        console.log("tes");
    }
    
    $scope.All_distributors = [];
    $scope.get_distributor = function()
    {
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
            duration: 100
        });
        $scope.search.drName = [];
        $scope.All_distributors = [];
        console.log($scope.search.districtName);
        myRequestDBService.onGetPostRequest('/App_Expense/getDistributorData','')
        .then(function (resp)
        {
            console.log(resp);
            
            $scope.All_distributors = resp.data;
            console.log($scope.All_distributors);
            $ionicLoading.hide();
        }, function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });
    }
    
    
    $scope.search.drName = [];
    $scope.selectedDr = [];
    $scope.select_mul_dr = function(data)
    {
        console.log(data);
        
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
    /*upload function end*/
    
    
    if($location.path() == '/tab/distribution-network')
    {
        console.log(myAllSharedService);
        console.log(myAllSharedService.drTypeFilterData.networkTabActive);
        console.log(myAllSharedService.drTypeFilterData.outstanding);
        if($scope.networkTabActive==1)
        {
            $scope.getNetworkList('Distributor', '','',myAllSharedService.drTypeFilterData.outstanding);
        }
        else
        {
            $scope.getNetworkList('Dealer', '','Pending','');
        }
    }
    
    if($location.path() == '/tab/network-add')
    {
        $scope.data.type_name = 'Dealer';
        $scope.search.stateName = { Key: "Select State Name *", Value: "" };
        $scope.search.districtName = { Key: "Select District *", Value: "" };
        
        $scope.onGetSearchSelectDataHandler('fetchStateData', '', 1);
        console.log("Network Add");
        console.log($scope.networkTabActive);
        console.log($scope.data.type_name);
        
        console.log($scope.search.stateName);
        
        $scope.getAllCategorySegments();
        $scope.get_distributor();
        
        $ionicPopover.fromTemplateUrl('otp-varification', {
            scope: $scope,
        }).then(function(popovers) {
            $scope.data.otpModel = popovers;
        });
        
    }
    
    if($location.path() == '/tab/network-detail')
    {
        $scope.data.drId = myAllSharedService.drTypeFilterData.drId;
        console.log("Network Detail = >",$scope.data.drId);
        if($scope.data.drId)
        {
            $scope.getDrDetailData($scope.data.drId)
        }
    }
    
    // if($location.path() == '/tab/map-network')
    // {
    //     $scope.latitude=myAllSharedService.lat;
    //     $scope.longitude=myAllSharedService.lng;
    
    //     console.log("Map-Network");
    
    // }
    
    $scope.network_popover='';
    
    $ionicPopover.fromTemplateUrl('network-popover.html', {
        scope: $scope,
    }).then(function(popovers) {
        $scope.network_popover= popovers;
    });
    
    $scope.onShowNetworkPopover = function($event) 
    {
        
        console.log("test");
        // $scope.data.pjpID = pjpID;
        // // $scope.data.drId = drId;
        // // console.log($scope.data.followUpId);
        $scope.network_popover.show($event);
    }
    
    $scope.allImages = [];
    
    $scope.showImages = function(index,image) {
        
        $scope.allImages = [];
        $scope.allImages.push({image:image})
        $scope.activeSlide = index;
        $scope.showModal('templates/gallery-zoomview.html');
    };
    
    $scope.showModal = function(templateUrl) {
        $ionicModal.fromTemplateUrl(templateUrl, {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    }
    
    $scope.closeModal = function() {
        $scope.modal.hide();
        $scope.modal.remove()
    };
    
    $scope.updateSlideStatus = function(slide) {
        var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + slide).getScrollPosition().zoom;
        if (zoomFactor == $scope.zoomMin) {
            $ionicSlideBoxDelegate.enableSlide(true);
        } else {
            $ionicSlideBoxDelegate.enableSlide(false);
        }
    };
    
    $scope.initial_zoom=true;
    $scope.zoom= function(slide){
        if($scope.initial_zoom)
        {
            $ionicScrollDelegate.$getByHandle('scrollHandle' + slide).zoomBy(3,true);
            $scope.initial_zoom=false;
        }
        else
        {
            $ionicScrollDelegate.$getByHandle('scrollHandle' + slide).zoomBy(0.2,true);
            $scope.initial_zoom=true;
        }
    }
    
    $scope.suggestiveList = [];
    $scope.getSuggestiveData = function()
    {
        $scope.suggestiveList = [];
        
        if($scope.search.master_search.length)
        {
            myRequestDBService.sfaPostServiceRequest("/App_SharedData/getSuggestiveData",{search : $scope.search.master_search}).then(function(response) 
            {
                console.log(response);
                
                if(response.status=='Success')
                {
                    $scope.suggestiveList = response.data;
                    console.log($scope.suggestiveList);
                }  
            }, 
            function (err) 
            {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Something went wrong !!'
                });
                console.error(err);
            }); 
        }
        else
        {
            $scope.productPriceList = [];
            $scope.getStockData();
        }
        
    }
    
    
    $scope.goToEditPage =function()
    {
        myAllSharedService.drData = $scope.drDetail.drData;
        console.log(myAllSharedService.drData);
        
        $state.go('tab.network-edit');
        
    }
    
    $scope.productStock = [];
    $scope.getStockData = function()
    {
        $scope.suggestiveList = [];
        
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
            duration: 100
        });
        
        myRequestDBService.sfaPostServiceRequest('/App_SharedData/getProductStockData',{'productCode':$scope.search.product_code})
        .then(function(response)
        {
            console.log(response);
            $scope.productStock = response.data;
            
            $ionicLoading.hide();
        }, function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });
    }
    
    
    $scope.dailyPlanData = {};
    $scope.planData = {};
    $scope.getDailyActivityPlan = function(planDate)
    {
        
        console.log(planDate);
        
        console.log($scope.dailyPlanData.userId);
        
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
            duration: 100
        });
        
        var userID;
        var planFor;
        if($scope.planData.myplan)
        {
            
            userID = $scope.loginData.loginId;
            planFor = 'myPlan';
        }
        
        else
        {
            userID = $scope.dailyPlanData.userId;
            planFor = 'teamPlan';
            
        }
        
        var data = {'plan_date':planDate,'userId' :userID,'planFor':planFor};
        
        myRequestDBService.sfaPostServiceRequest('/DWR_Plan/getUserDailyPlan',data)
        .then(function(response)
        {
            const userId = $scope.dailyPlanData.userId; 
            $scope.dailyPlanData = response.data;
            $scope.dailyPlanData.userId = userId;
            console.log($scope.dailyPlanData.userId)
            
            $ionicLoading.hide();
        }, function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });
    }
    
    
    $scope.dailyPlan = [];
    $scope.productCategory = [];
    $scope.getAllProductCategory = function()
    {
        $scope.productCategory = [];
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
            duration: 100
        });
        
        myRequestDBService.sfaPostServiceRequest('/DWR_Plan/getAllProductCategory',)
        .then(function(response)
        {
            console.log(response);
            $scope.productCategory = response.data;
            
            $ionicLoading.hide();
        }, function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        }); 
    }
    
    $scope.getAssignProductCategory = function (dr_id, outstanding_plan)
    {
        console.log(dr_id)
        
        $scope.productCategory = [];
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
            duration: 100
        });
        
        $scope.distributorPlanData.dr_id = dr_id;
        
        console.log(outstanding_plan);
        
        if (outstanding_plan)
        {
            $scope.outStandingAge = [];
            for (var i = 0; i < outstanding_plan.length; i++) 
            {
                console.log(outstanding_plan[i]);
                if (outstanding_plan[i]['outstanding_30_60']!=0)
                {
                    $scope.outStandingAge.push('30-60');
                    $scope.distributorPlanData.outstandingAmount += outstanding_plan[i]['outstanding_30_60'];
                }
                if (outstanding_plan[i]['outstanding_60_90'] != 0)
                {
                    $scope.outStandingAge.push('60-90');
                    $scope.distributorPlanData.outstandingAmount += outstanding_plan[i]['outstanding_60_90'];
                    
                }
                if (outstanding_plan[i]['outstanding_90_120'] != 0)
                {
                    $scope.outStandingAge.push('90-120');
                    $scope.distributorPlanData.outstandingAmount += outstanding_plan[i]['outstanding_90_120'];
                    
                }
                if (outstanding_plan[i]['plus_60_outstanding'] != 0)
                {
                    $scope.outStandingAge.push('60+');
                    $scope.distributorPlanData.outstandingAmount += outstanding_plan[i]['plus_60_outstanding'];
                    
                }
                if (outstanding_plan[i]['plus_120_outstanding'] != 0) 
                {
                    $scope.outStandingAge.push('120+');
                    $scope.distributorPlanData.outstandingAmount += outstanding_plan[i]['plus_120_outstanding'];
                    
                }
            }
            
            console.log($scope.outStandingAge);
        }
        
        
        
        myRequestDBService.sfaPostServiceRequest('/DWR_Plan/getAssignCategory/'+dr_id,)
        .then(function(response)
        {
            console.log(response);
            $scope.productCategory = response.data;
            
            $ionicLoading.hide();
        }, function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        }); 
    }
    
    $scope.getSelectedDrPlan = function(dr_id)
    {
        console.log(dr_id);
        var index = $scope.distributorDailyCollectionPlan.findIndex(row=>row.id == dr_id);
        
        console.log(index);
        
        var outstanding = $scope.distributorDailyCollectionPlan[index]['outstanding_plan'];
        
        if (dr_id)
        {
            $scope.getAssignProductCategory(dr_id, outstanding);
        }
    }
    
    $scope.saveDealerPlan = function(type)
    {
        console.log($scope.productCategory);
        
        var data = {'plan_date':$scope.selectedDate,'dr_daily_plan':$scope.productCategory}
        
        $ionicPopup.confirm({
            
            title: 'Are You Sure, You Want to Save this plan ?',
            buttons: [{
                text: 'YES',
                type: 'button-block button-outline button-stable',
                onTap: function (e) {
                    
                    $ionicLoading.show({
                        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
                    });
                    myRequestDBService.sfaPostServiceRequest('/DWR_Plan/saveDailyDrPlan/'+type,data)
                    .then(function(response)
                    {
                        console.log(response);
                        
                        $scope.getDailyActivityPlan($scope.selectedDate);
                        
                        if(response.status=='Success')
                        {
                            $cordovaToast.show('Plan added successfully', 'short', 'bottom').then(function (success) {
                                
                            }, function (error) {
                                
                            });
                        }
                        else
                        {
                            $ionicPopup.alert({
                                title: 'Error!',
                                template: 'Something went wrong !!'
                            });
                        }
                        
                        $ionicLoading.hide();
                    }, function (err)
                    {
                        $ionicPopup.alert({
                            title: 'Error!',
                            template: 'Please Check Your Internet connection !!'
                        });
                        $ionicLoading.hide();
                        console.error(err);
                    });  
                    
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
    
    $scope.saveOutstandingPlan = function()
    {
        console.log($scope.productCategory);
        
        var data = {'plan_date':$scope.selectedDate,'outstanding_plan':$scope.filianOutStanding}
        
        $ionicPopup.confirm({
            
            title: 'Are You Sure, You Want to Save this plan?',
            buttons: [{
                text: 'YES',
                type: 'button-block button-outline button-stable',
                onTap: function (e) {
                    
                    $ionicLoading.show({
                        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
                    });
                    
                    myRequestDBService.sfaPostServiceRequest('/DWR_Plan/saveDailOutstandingPlan',data)
                    .then(function(response)
                    {
                        console.log(response);
                        $ionicLoading.hide();
                        $scope.getDailyActivityPlan($scope.selectedDate);
                        
                        if(response.status=='Success')
                        {
                            $cordovaToast.show('Plan added successfully', 'short', 'bottom').then(function (success) {
                                
                            }, function (error) {
                                
                            });
                        }
                        else
                        {
                            $ionicPopup.alert({
                                title: 'Error!',
                                template: 'Something went wrong !!'
                            });
                        }
                        
                    }, function (err)
                    {
                        $ionicPopup.alert({
                            title: 'Error!',
                            template: 'Please Check Your Internet connection !!'
                        });
                        $ionicLoading.hide();
                        console.error(err);
                    }); 
                    
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
    
    $scope.onUpdateDrHaldler = function()
    {
        console.log($scope.data);
        console.log($scope.selectedCategory);
        console.log($scope.selectedBrand);
        
        $scope.data.assign_brand = $scope.search.brandName ;
        $scope.data.assign_segment = $scope.search.categoryName ;
        
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        
        myRequestDBService.sfaPostServiceRequest('/Distribution_Network/update_dr_detail_data/',$scope.data)
        .then(function(response) {
            console.log(response);
            
            if(response.status=='Success')
            {
                $state.go('tab.network-detail');
                $cordovaToast.show('Detail Update Successfully', 'short', 'bottom').then(function(success) {
                    
                }, function (error) {
                    
                });
                
            }
            else
            {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Something went wrong !!'
                });
                
                $scope.noMoreItemsAvailable = true;
                
            }
            
            $scope.$broadcast('scroll.infiniteScrollComplete');
            
            $ionicLoading.hide();
            
            
        }, function (err) {
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Please check your internet connection !!'
            });
            console.error(err);
        });
        
    }
    
    if($location.path()=='/tab/network-edit')
    {
        $scope.getAllCategorySegments();
        $scope.getAllBrandList();
        
        console.log(myAllSharedService.drData);
        
        $scope.data = myAllSharedService.drData;
        
        for (var i = 0; i < $scope.data.assign_segment.length; i++) 
        {
            $scope.search.categoryName.push($scope.data.assign_segment[i]['category_name']);
            $scope.selectedCategory.push({"category_id":$scope.data.assign_segment[i]['id'],"category_name":$scope.data.assign_segment[i]['category_name']});
        }
        
        for (var j = 0; j < $scope.data.assign_brand.length; j++) 
        {
            $scope.search.brandName.push($scope.data.assign_brand[j]['brand_name']);
            $scope.selectedBrand.push({brand_name:$scope.data.assign_brand[j]['brand_name']})
        }
        
    }
    
    $scope.add_plan_popovers = '';
    $scope.add_distributor_plan_popovers = '';
    $scope.add_collection_popovers = '';
    $scope.addOutStandingPlan = '';
    
    $scope.outStandingAge = [
        '60+',
        '120+',
        '90-120',
        '60-90',
        '30-60'
    ];
    
    $scope.today = moment().format('YYYY-MM-DD');
    
    $scope.filianOutStanding = {};
    if($location.path()=='/tab/daily-plan-report')
    {
        
        $scope.selectedDate = moment().format('YYYY-MM-DD');
        
        console.log("DAILY PLAN ACTIVITY");
        $ionicPopover.fromTemplateUrl('add-dealer-plan', {
            scope: $scope,
        }).then(function(popovers) {
            $scope.add_plan_popovers = popovers;
        });
        
        $ionicPopover.fromTemplateUrl('add-distributor-plan', {
            scope: $scope,
        }).then(function(popovers) {
            $scope.add_distributor_plan_popovers = popovers;
        });
        
        $ionicPopover.fromTemplateUrl('add-outstanding-plan', {
            scope: $scope,
        }).then(function(popovers) {
            $scope.addOutStandingPlan = popovers;
        });
        
        $ionicPopover.fromTemplateUrl('add-collection.html', {
            scope: $scope,
        }).then(function(popovers) {
            $scope.add_collection_popovers = popovers;
        });
        
        
        console.log("DAILY PLAN ACTIVITY");
        $ionicPopover.fromTemplateUrl('daily-plan-popover.html', {
            scope: $scope,
        }).then(function(popovers) {
            $scope.plan_popovers = popovers;
        });
        
        $scope.planData.myplan = true;
        $scope.getDailyActivityPlan($scope.today);
    }
    
    
    if($location.path() == '/tab/stock')
    {
        $scope.getStockData();
    }
    
    
    $scope.onDateSelected = {};
    $scope.newPlanCreated = false;
    $scope.onDateChangeHandler = function(actionType) {
        
        console.log($scope.onDateSelected.date);
        
        if(actionType == 'previous') 
        {
            $scope.selectedDate = moment($scope.selectedDate).subtract(1, 'days').format('YYYY-MM-DD');
        }        
        else if(actionType == 'next') 
        {
            
            if(moment($scope.selectedDate).format('YYYY-MM-DD') >= moment().add(1, 'days').format('YYYY-MM-DD')) {
                return false;
            }
            
            $scope.selectedDate = moment($scope.selectedDate).add(1, 'days').format('YYYY-MM-DD');
        }
        else if(actionType=='jump')
        {
            $scope.selectedDate = moment($scope.onDateSelected.date).format('YYYY-MM-DD');
        }
        
        if(moment($scope.selectedDate).format('YYYY-MM-DD') == moment($scope.today).format('YYYY-MM-DD') || moment($scope.selectedDate).subtract(1,'days').format('YYYY-MM-DD') >= moment($scope.today).format('YYYY-MM-DD') ) 
        {
            $scope.newPlanCreated = true;
            
        }
        else
        {
            $scope.newPlanCreated = false;
            
        }
        
        if($location.path() == '/tab/collection-plan')
        {
            $scope.getDistributorCollectionPlan()
        }
        else if($location.path() == '/tab/daily-plan-report')
        {
            $scope.getDailyActivityPlan($scope.selectedDate);
        }
        else if ($location.path() == '/tab/collection-punch') 
        {
            $scope.getCollectionPunchData();
        }
        
    }
    
    $scope.assignUserListArray = [];
    $scope.getAssignUserList = function()
    {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        $scope.assignUserListArray = [];
        
        myRequestDBService.sfaPostServiceRequest('/DWR_Plan/getAssignUserList','')
        .then(function(response) {
            console.log(response);
            $ionicLoading.hide();
            
            if(response.status=='Success')
            {
                $scope.assignUserListArray = response.data;
            }
            else
            {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Please check your internet connection !!'
                });
            }
            
            
        }, function (err) {
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Please check your internet connection !!'
            });
            console.error(err);
        });
    }
    
    
    $scope.dailyPlanReport = function($event)
    {
        console.log("Open Popever");
        
        console.log($scope.plan_popovers);
        
        $scope.plan_popovers.show($event);
    }
    
    $scope.addDealerPlanModel = function($event)
    {
        console.log("Open Popever");
        
        console.log($scope.add_plan_popovers);
        
        $scope.add_plan_popovers.show($event);
    }
    
    
    $scope.addDistributorPlanModel = function($event)
    {
        console.log("Open Popever");
        
        console.log($scope.add_distributor_plan_popovers);
        
        $scope.add_distributor_plan_popovers.show($event);
    }
    
    $scope.addPlanModel = function($event)
    {
        console.log("Open Popever");
        
        console.log($scope.addOutStandingPlan);
        
        $scope.addOutStandingPlan.show($event);
    }
    
    
    $scope.addCollectionModel = function($event)
    {
        console.log("Open Popever");
        
        $scope.mediaData = [];
        $scope.getDistributorCollectionPlan();
        
        console.log($scope.add_collection_popovers);
        
        $scope.add_collection_popovers.show($event);
        
    }
    
    $scope.distributorPlanData = {};
    $scope.AssignDistributorList = [];
    $scope.getAssignDistributor = function()
    {
        
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        $scope.AssignDistributorList = [];
        
        myRequestDBService.sfaPostServiceRequest('/Distribution_Network/getAssignDistributor','')
        .then(function(response) {
            console.log(response);
            $ionicLoading.hide();
            
            
            if(response.status=='Success')
            {
                $scope.AssignDistributorList = response.data;
                console.log($scope.AssignDistributorList);
            }
            else
            {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Please check your internet connection !!'
                });
            }
            
        }, function (err) {
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Please check your internet connection !!'
            });
            console.error(err);
        });
    }
    
    $scope.distributorDailyCollectionPlan = [];
    $scope.getDistributorCollectionPlan = function()
    {
        
        $scope.distributorDailyCollectionPlan = [];
        // $scope.outStandingAge = [];
        $scope.filianOutStanding = {};
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
            duration: 100
        });
        
        $scope.distributorPlanData.outstandingAmount = 0
        
        var data = {'plan_date':$scope.selectedDate};
        
        myRequestDBService.sfaPostServiceRequest('/DWR_Plan/getDistributorCollectionPlan',data)
        .then(function(response)
        {
            console.log(response);
            
            if(response.status=='Success')
            {
                $scope.distributorDailyCollectionPlan = response.data;
                
                console.log($scope.distributorDailyCollectionPlan);
                
                // for (var i = 0; i < $scope.distributorDailyCollectionPlan.outstanding_plan.length; i++) 
                // {
                //     console.log($scope.distributorDailyCollectionPlan.outstanding_plan);
                //     if ($scope.distributorDailyCollectionPlan.outstanding_plan[i]['outstanding_30_60']!=0)
                //     {
                //         $scope.outStandingAge.push('30-60');
                //         $scope.distributorPlanData.outstandingAmount += $scope.distributorDailyCollectionPlan.outstanding_plan[i]['outstanding_30_60'];
                //     }
                //     if ($scope.distributorDailyCollectionPlan.outstanding_plan[i]['outstanding_60_90'] != 0)
                //     {
                //         $scope.outStandingAge.push('60-90');
                //         $scope.distributorPlanData.outstandingAmount += $scope.distributorDailyCollectionPlan.outstanding_plan[i]['outstanding_60_90'];
                
                //     }
                //     if ($scope.distributorDailyCollectionPlan.outstanding_plan[i]['outstanding_90_120'] != 0)
                //     {
                //         $scope.outStandingAge.push('90-120');
                //         $scope.distributorPlanData.outstandingAmount += $scope.distributorDailyCollectionPlan.outstanding_plan[i]['outstanding_90_120'];
                
                //     }
                //     if ($scope.distributorDailyCollectionPlan.outstanding_plan[i]['plus_60_outstanding'] != 0)
                //     {
                //         $scope.outStandingAge.push('60+');
                //         $scope.distributorPlanData.outstandingAmount += $scope.distributorDailyCollectionPlan.outstanding_plan[i]['plus_60_outstanding'];
                
                //     }
                //     if ($scope.distributorDailyCollectionPlan.outstanding_plan[i]['plus_120_outstanding'] != 0) 
                //     {
                //         $scope.outStandingAge.push('120+');
                //         $scope.distributorPlanData.outstandingAmount += $scope.distributorDailyCollectionPlan.outstanding_plan[i]['plus_120_outstanding'];
                
                //     }
                // }
                
                // console.log($scope.outStandingAge);
                
            }
            
            $ionicLoading.hide();
        }, function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });
    }
    
    
    $scope.saveDistributorCollectionPlan = function()
    {
        console.log($scope.productCategory);
        
        var data = {'plan_date':$scope.selectedDate,'outstanding_plan':$scope.filianOutStanding,'dr_id':$scope.distributorPlanData.dr_id}
        
        $ionicPopup.confirm({
            
            title: 'Are You Sure, You Want to Save this plan?',
            buttons: [{
                text: 'YES',
                type: 'button-block button-outline button-stable',
                onTap: function (e) {
                    
                    $ionicLoading.show({
                        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
                    });
                    
                    myRequestDBService.sfaPostServiceRequest('/DWR_Plan/saveDistribtorPlanData',data)
                    .then(function(response)
                    {
                        console.log(response);
                        $ionicLoading.hide();
                        $scope.getDistributorCollectionPlan();
                        
                        if(response.status=='Success')
                        {
                            $cordovaToast.show('Plan added successfully', 'short', 'bottom').then(function (success) {
                                
                            }, function (error) {
                                
                            });
                        }
                        else
                        {
                            $ionicPopup.alert({
                                title: 'Error!',
                                template: 'Something went wrong !!'
                            });
                        }
                        
                    }, function (err)
                    {
                        $ionicPopup.alert({
                            title: 'Error!',
                            template: 'Please Check Your Internet connection !!'
                        });
                        $ionicLoading.hide();
                        console.error(err);
                    }); 
                    
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
    
    $scope.saveCollectionPunchData = function()
    {
        
        if (!$scope.distributorPlanData.dr_id) {
            $ionicPopup.alert({
                title: 'Error !',
                template: 'Please select distributor !!'
            });
            return;
        }
        
        if (!$scope.distributorPlanData.category) {
            $ionicPopup.alert({
                title: 'Error !',
                template: 'Please select Segment !!'
            });
            return;
        }
        
        if (!$scope.distributorPlanData.amount) {
            $ionicPopup.alert({
                title: 'Error !',
                template: 'Please Enter Amount !!'
            });
            return;
        }
        
        if (!$scope.distributorPlanData.aging) {
            $ionicPopup.alert({
                title: 'Error !',
                template: 'Please select Ageing !!'
            });
            return;
        }
        
        if (!$scope.distributorPlanData.payment_mode) {
            $ionicPopup.alert({
                title: 'Error !',
                template: 'Please select Payment Mode !!'
            });
            return;
        }
        
        if (!$scope.distributorPlanData.transaction_details) {
            $ionicPopup.alert({
                title: 'Error !',
                template: 'Please select Refrence no !!'
            });
            return;
        }
        
        
        
        console.log($scope.distributorPlanData);
        
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        myRequestDBService.sfaPostServiceRequest('/DWR_Plan/saveOutstandingCollectionPunch',$scope.distributorPlanData)
        .then(function (response) {
            console.log(response);
            $ionicLoading.hide();
            $scope.getCollectionPunchData();
            
            if (response.status == 'Success') 
            {
                $scope.distributorPlanData = {};
                $scope.add_collection_popovers.hide()
                $cordovaToast.show('Plan added successfully', 'short', 'bottom').then(function (success) {
                    
                }, function (error) {
                    
                });
                
                if ($scope.mediaData.length > 0) {
                    var options = {
                        fileKey: "file",
                        fileName: "image.jpg",
                        chunkedMode: false,
                        mimeType: "image/*",
                    };
                    for (let i = 0; i < $scope.mediaData.length; i++) {
                        console.log($scope.mediaData[i].src);
                        $cordovaFileTransfer.upload(serverURL + "/App_Customer/uploadCollectionImage/" + response.insert_id + '/' + $scope.loginData.loginId, $scope.mediaData[i].src, options)
                        .then(function (result) {
                            console.log(result);
                            
                            $ionicLoading.show({ template: 'Success!', noBackdrop: true, duration: 2000 });
                        }, function (err) {
                            $ionicLoading.hide();
                            console.log("ERROR: " + JSON.stringify(err));
                        }, function (progress) {
                        });
                    }
                }
            }
            else {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Something went wrong !!'
                });
            }
            
        }, function (err) {
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Please Check Your Internet connection !!'
            });
            $ionicLoading.hide();
            console.error(err);
        }); 
    }
    
    
    $scope.getAssignDistributorListDataHandler = function (dr_id) 
    {
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
            duration: 100
        });
        var data = {
            dr_id: dr_id,
        };
        
        myRequestDBService.sfaPostServiceRequest('/App_Order/assignIB_Distributor', data)
        .then(function (result) {
            console.log(result);
            $scope.search.dealerName = [];
            
            $scope.AssignDistributorList = result.dr_list;
            
            fetchingRecords = false;
            
        }, function (errorMessage) {
            console.log(errorMessage);
            window.console.warn(errorMessage);
            $ionicLoading.hide();
            fetchingRecords = false;
        });
    }
    
    $scope.schemeBrand = [];
    
    $scope.enrollSchemeList = [];
    $scope.getEnrollSchemeList = function()
    {
        
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
            duration: 100
        });
        
        myRequestDBService.sfaPostServiceRequest('/Distribution_Network/getSfaEnrollSchemeList', '')
        .then(function (result) {
            console.log(result);
            $ionicLoading.hide();
            $scope.enrollSchemeList = result.data;
            
        }, function (errorMessage) {
            console.log(errorMessage);
            window.console.warn(errorMessage);
            $ionicLoading.hide();
        });
    }
    
    $scope.schemeArray = [];
    
    $scope.addSchemeToList = function()
    {

        if ($scope.schemeData.enroll_brand && $scope.schemeData.dr_data.Value && $scope.schemeData.scheme_id)
        {
            var existScheme = $scope.schemeArray.findIndex(row => row.brand == $scope.schemeData.enroll_brand && row.distributor_id == $scope.schemeData.dr_data.Value);
    
            if(existScheme != -1)
            {
                $scope.schemeArray.splice(existScheme,1)
                // $cordovaToast.show('Scheme Updated', 'short', 'bottom').then(function (success) {});
            }
           
            $scope.schemeArray.push({ 'distributor_name': $scope.schemeData.dr_data.Key, 'distributor_id': $scope.schemeData.dr_data.Value, 'brand': $scope.schemeData.enroll_brand, 'scheme': $scope.schemeData.scheme, 'scheme_id': $scope.schemeData.scheme_id });
    
            $scope.schemeData.dr_data = {}
            $scope.schemeData.dr_name = [];
            $scope.schemeData.enroll_brand = null;
            $scope.schemeData.scheme = null;
            $scope.schemeData.scheme_id = null;
        }
        else
        {
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Basic Field Required ..'
            });
        }

        
    }
    
    $scope.removeScheme = function(index)
    {
        
        $ionicPopup.confirm({
            
            title: 'Are you sure, You want to remove scheme ?',
            buttons: [{
                text: 'YES',
                type: 'button-block button-outline button-stable',
                onTap: function (e) {
                    
                    $scope.schemeArray.splice(index, 1);
                    
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
  
    $scope.single_select = function (item) {
        $scope.schemeData.dr_name = new Array();
        $scope.schemeData.dr_name.push(item.Key);
        console.log($scope.data.dr_name);   
        $scope.schemeData.dr_data = item;
        
        $scope.getDistributorBrand(item.Value);
        
    }
    
    $scope.getDistributorBrand = function(dr_id)
    {
        
        myRequestDBService.sfaPostServiceRequest('/Distribution_Network/getDistributorBrand/'+dr_id, '')
        .then(function (result) {
            console.log(result);
            $ionicLoading.hide();
            $scope.schemeBrand = result.data;
            $scope.getEnrollSchemeList();
            
        }, function (errorMessage) {
            console.log(errorMessage);
            window.console.warn(errorMessage);
            $ionicLoading.hide();
        });
        
    }
    
    
    $scope.schemeData = {};
    $scope.submitSchemeEnrollment = function()
    {
        $scope.schemeData.scheme = $scope.schemeArray
        console.log($scope.schemeData);
        if ($scope.schemeData.otp || $scope.data.confirm_otp)
        {
            if ($scope.schemeData.otp == $scope.data.confirm_otp)
            {
                
                $ionicLoading.show({
                    template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
                    duration: 100
                });
                
                myRequestDBService.sfaPostServiceRequest('/Distribution_Network/submitDealerEnrollScheme', $scope.schemeData)
                .then(function (result) {
                    console.log(result);
                    $ionicLoading.hide();
                    if (result.status = 'Success') {
                        myAllSharedService.drTypeFilterData.drId = $scope.schemeData.dr_id;
                        $state.go('tab.network-detail');
                    }
                    else
                    {
                        $ionicPopup.alert({
                            title: 'Error!',
                            template: result.message
                        });
                    }
                    
                }, function (errorMessage) {
                    console.log(errorMessage);
                        $ionicPopup.alert({
                            title: 'Error!',
                            template: 'Please check your internet connection..'
                        });
                    window.console.warn(errorMessage);
                    $ionicLoading.hide();
                });
            }
            else
            {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Enter Valid OTP !!'
                });
            }
        }
        else
        {
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Enter OTP !!'
            });
        }
        
    }
    
    $scope.getDrSchemeEnrollment = function()
    {
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
            duration: 100
        });
        
        myRequestDBService.sfaPostServiceRequest('/Distribution_Network/getDealerEnrollScheme', $scope.schemeData)
        .then(function (result) {
            console.log(result);
            $ionicLoading.hide();
            
            $scope.schemeArray = result.data;
            $scope.schemeData.inORP = result.isDealerInORP.orp_first_login;
            
        }, function (errorMessage) {
            console.log(errorMessage);
            window.console.warn(errorMessage);
            $ionicLoading.hide();
        });
    }
    
    $scope.dailyCollectionData = [];
    $scope.getCollectionPunchData = function()
    {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        var post_data = { plan_date: $scope.selectedDate}
        
        $scope.dailyCollectionData = [];
        myRequestDBService.sfaPostServiceRequest('/DWR_Plan/getDistributorCollection',post_data)
        .then(function (response) {
            console.log(response);
            $ionicLoading.hide();
            
            if (response.status == 'Success') 
            {
                $scope.dailyCollectionData = response.data;
            }
            else 
            {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Something went wrong !!'
                });
            }
            
        }, function (err) {
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Please Check Your Internet connection !!'
            });
            $ionicLoading.hide();
            console.error(err);
        });
    }
    
    $scope.gotoPage = function (id, dr_name, contact_mobile_no, page_name) {
        console.log(page_name);
        console.log(id, dr_name, contact_mobile_no, page_name);
        myRequestDBService.sfa_dr_id = id;
        myRequestDBService.dr_name = dr_name;
        myRequestDBService.contact_mobile_no = contact_mobile_no;
        console.log(myRequestDBService.dr_id);
        $state.go('tab.' + page_name);
        $scope.leadpopovers.hide();
    }
    
    if ($location.path() == '/tab/scheme_enroll')
    {
        $scope.schemeData.dr_id = myRequestDBService.sfa_dr_id;
        // $scope.data.customerMobile1 = '9015084313';
        $scope.data.customerMobile1 = myRequestDBService.contact_mobile_no;
        $scope.schemeData.otp_sent = false;
        $scope.getDrSchemeEnrollment();
        $scope.getAssignDistributorListDataHandler($scope.schemeData.dr_id);
        $scope.getEnrollSchemeList();
    }
    
    if($location.path() == '/tab/collection-plan')
    {
        $ionicPopover.fromTemplateUrl('add-collection', {
            scope: $scope,
        }).then(function (popovers) {
            $scope.add_collection_popovers = popovers;
        });
        $scope.selectedDate = moment().format('YYYY-MM-DD');
        $scope.getDistributorCollectionPlan();
        $scope.newPlanCreated = true;
    }
    
    if ($location.path() == '/tab/collection-punch') 
    {
        $scope.selectedDate = moment().format('YYYY-MM-DD');
        $ionicPopover.fromTemplateUrl('add-collection-punch', {
            scope: $scope,
        }).then(function (popovers) {
            $scope.add_collection_popovers = popovers;
        });
        // $scope.getAssignDistributor();
        $scope.getCollectionPunchData();
        
    }
    
    // var location = "https://maps.googleapis.com/maps/api/geocode/json?latlng=28.394892,77.3055795&key=AIzaSyD9OoPX-RFRqkhIuRsWOPj4xKnVelhRRK8&sensor=false"
    // var location = "https://maps.googleapis.com/maps/api/geocode/json?latlng=28.394892,77.3055795&key=AIzaSyC-zJ2C0pPCvsTnaV4wqZB1wWVPCCniJLE&sensor=false"
    
})