var app = angular.module('starter.controllers', ["ngTouch", "angucomplete-alt"])

app.controller('loginCtrl', function ($scope, $rootScope, searchSelect, $ionicModal, $state, myRequestDBService, myAllSharedService, $ionicLoading, $cordovaSQLite, $ionicPopup, $timeout, $ionicActionSheet, $cordovaImagePicker, Camera, $cordovaFileTransfer, $cordovaGeolocation, $cordovaToast, $location, $window, $ionicPlatform, $ionicHistory, $ionicModal,$stateParams, $ionicScrollDelegate, $ionicPopover) {
      
      $scope.loginData = myAllSharedService.loginData;
      console.log(myAllSharedService.loginData);
      
      $scope.data = {};
      $scope.userData = {};
      $scope.attendanceList = [];
      $scope.mediaData = [];
      $scope.uploadURL = uploadURL;
      
      $scope.activeStape = 1;
      
      $scope.organisationData = [];
      
      $scope.selectedMonth = moment().format('YYYY-MM-DD');
      $scope.isRequestInProcess;
      
      $scope.login = function () {
            console.log("function call");
            $ionicLoading.show({
                  template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
            });
            
            myRequestDBService.login($scope.loginData.username, $scope.loginData.password, '')
            .then(function (result) {
                  console.log(result);
                  var query = "INSERT INTO " + dbTableName + " (username,password,organisationId) VALUES (?,?,?)";
                  $cordovaSQLite.execute(db, query, [$scope.loginData.username, $scope.loginData.password, 0]).then(function (resultData) {
                        $ionicLoading.hide();
                        console.log(resultData);
                        const loginData = {};
                        
                        loginData.loginId = result.loginData.id;
                        loginData.loginName = result.loginData.name;
                        loginData.emp_code = result.loginData.emp_code;
                        // loginData.loginType = result.loginData.loginType;
                        loginData.loginSubType = result.loginData.sales_user_type;
                        // loginData.software_access = result.loginData.software_access;
                        // loginData.designation = result.loginData.designation;
                        // loginData.designation_id = result.loginData.designation_id;
                        loginData.loginMobile = result.loginData.contact_01;
                        loginData.loginImage = result.loginData.image;
                        loginData.loginAccessLevel = result.loginData.access_level;
                        loginData.user_branch = result.loginData.user_branch;
                        // loginData.loginOrganisationId = result.loginData.organisationId;
                        // loginData.loginTeamExist = result.loginData.isTeamExist;
                        // loginData.department = result.loginData.department;
                        // if(result.loginData.department.includes("CHANNEL SALE"))
                        // {
                              loginData.channelSalesLogin = true;
                        // }
                        // else
                        // {
                        //       loginData.channelSalesLogin = false;
                        // }
                        myAllSharedService.loginData = loginData;
                        $state.go('tab.dashboard');
                        
                  }, function (err) {
                        
                        $ionicLoading.hide();
                        console.error(err);
                  });
                  
                  
            }, function (resultData) {
                  
                  $ionicLoading.hide();
                  $state.go('login');
                  
                  $ionicPopup.alert({
                        title: 'Login failed!',
                        template: 'Please check your credentials!'
                  });
            });
      }
      
      $scope.goToStep = function(step)
      {
            console.log(step);
            $scope.activeStape = step;
      }
      
      $scope.loginUser = {};
      $scope.validateEmpId_Mobile_no = function()
      {
            console.log($scope.loginUser);
            
            if($scope.loginUser.mobile_no && $scope.loginUser.emp_id)
            {
                  
                  $ionicLoading.show({
                        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
                  });
                  
                  myRequestDBService.onGetPostRequest('/App_Login/validateMobileEmpId',$scope.loginUser)
                  .then(function(response) {
                        
                        console.log(response);
                        
                        $ionicLoading.hide();
                        
                        if(response.status=='Success')
                        {
                              $scope.loginUser.otp = response.data.otp;
                              $scope.loginUser.confirmOTP = response.data.confirmOTP;
                              $scope.loginUser.userId = response.data.id;
                              $scope.activeStape = 2;
                              
                        }
                        else
                        {
                              $ionicPopup.alert({
                                    title: 'Error!',
                                    template: response.message
                              });
                        }
                        
                        
                        
                  }, function (err) {
                        
                        $ionicLoading.hide();
                        
                        console.error(err);
                        $ionicPopup.alert({
                              title: 'Error!',
                              template: 'Something went wrong !!'
                        });
                  });
            }
            else
            {
                  $ionicPopup.alert({
                        title: 'Error!',
                        template: 'Please enter Mobile no. & Employee ID'
                  });
            }
            
      }
      
      $scope.eightCharectorValidation = false
      $scope.numberContainesValidation = false
      $scope.checkValidation =function(password)
      {
            
            if(password.length >= 8)
            {
                  $scope.eightCharectorValidation = true;
            }
            else
            {
                  $scope.eightCharectorValidation = false;
                  
            }
            if(password.match(/[0-9]/))
            {
                  $scope.numberContainesValidation = true
            }
            else
            {
                  $scope.numberContainesValidation = false
                  
            }
            
            
      }
      
      $scope.verifyOTP= function()
      {
            if($scope.loginUser.otp == $scope.loginUser.confirmOTP)
            {
                  $scope.activeStape = 3;
            }
            else
            {
                  $ionicPopup.alert({
                        title: 'Success',
                        template: 'Please Enter Valid OTP !!'
                  });
            }
      }
      
      $scope.changePassword = function()
      {
            console.log($scope.loginUser);
            
            if($scope.loginUser.new_password.length>=8)
            {
                  if($scope.loginUser.new_password == $scope.loginUser.confirm_password)
                  {
                        $ionicLoading.show({
                              template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
                        });
                        
                        myRequestDBService.onGetPostRequest('/App_Login/changePassword',$scope.loginUser)
                        .then(function(response) {
                              
                              console.log(response);
                              
                              $ionicLoading.hide();
                              
                              
                              if(response.status=='Success')
                              {
                                    $ionicPopup.alert({
                                          title: 'Success',
                                          template: 'Password Change Successfully !!'
                                    });
                                    
                                    $state.go('login');
                                    
                              }
                              
                              
                        }, function (err) {
                              
                              $ionicLoading.hide();
                              
                              console.error(err);
                              $ionicPopup.alert({
                                    title: 'Error!',
                                    template: 'Something went wrong !!'
                              });
                        });
                        
                        
                  }
                  else
                  {
                        $ionicPopup.alert({
                              title: 'Error',
                              template: 'Password & Confirm Password Not Match'
                        });
                  }
            }
            else
            {
                  $ionicPopup.alert({
                        title: 'Error',
                        template: 'Password Should be 8 Character !!'
                  });
            }
      }
      
      $scope.onGetAttendanceListHandler = function() {
            
            $ionicLoading.show({
                  template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
            });
            
            const attendMonth = moment($scope.selectedMonth).format('YYYY-MM');
            
            console.log(attendMonth);
            
            myRequestDBService.onGetAttendanceListHandler(attendMonth)
            .then(function (result) {
                  
                  console.log(result);
                  
                  $ionicLoading.hide();
                  $scope.attendanceList = result.attendanceData;
                  
                  for (let index = 0; index < $scope.attendanceList.length; index++) {
                        
                        let applyClass = '';
                        if($scope.attendanceList[index].attendStartTimeInFormat && !$scope.attendanceList[index].attendStartTimeInFormat) {
                              
                              applyClass = 'continue';
                              
                        } else if($scope.selectedMonth != $scope.attendanceList[index].attend_Date && $scope.attendanceList[index].status == 'Absent') {
                              
                              applyClass = 'absent';
                              
                        } else if($scope.selectedMonth != $scope.attendanceList[index].attend_Date && $scope.attendanceList[index].status == 'Present') {
                              
                              applyClass = 'done';
                              
                        } else if($scope.selectedMonth != $scope.attendanceList[index].attend_Date && $scope.attendanceList[index].status == 'Holiday') {
                              
                              applyClass = 'holiday';
                        }
                        
                        $scope.attendanceList[index].applyClass = applyClass;
                  }
                  
            }, function (resultData) {
                  $ionicLoading.hide();
            });
      }
      
      
      $scope.onImageTypeHandler = function () {
            
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
                  
                  quality: 50,
                  targetWidth: 500,
                  targetHeight: 500,
                  saveToPhotoAlbum: false
            };
            
            Camera.getPicture(options).then(function (imageData) {
                  
                  console.log(imageData);
                  
                  $scope.mediaData.push({
                        src: imageData
                  });
                  
                  console.log($scope.mediaData);
                  
                  if($scope.mediaData.length)
                  {
                        $scope.uploadImageData();
                  }
                  
                  
            }, function (err) {
                  
                  
            });
      }
      
      
      $scope.getGallaryImageHandler = function() {
            
            var options = {
                  
                  maximumImagesCount: 1,
                  width: 500,
                  height: 500,
                  quality: 50
            };
            
            $cordovaImagePicker.getPictures(options).then(function (results) {
                  
                  console.log(results);
                  
                  for (var i = 0; i < results.length; i++) {
                        
                        $scope.mediaData.push({
                              src: results[i]
                        });
                  }
                  
                  console.log($scope.mediaData);
                  
                  if($scope.mediaData.length)
                  {
                        $scope.uploadImageData();
                  }
                  
                  
            }, function (error) {
                  
                  console.log('Error: ' + JSON.stringify(error));
            });
      }
      
      
      $scope.uploadImageData = function() {
            
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
                  
                  $cordovaFileTransfer.upload(serverURL+'/App_Login/onUploadProfileImageData/' + $scope.loginData.loginId, val.src, options ).then(function(result) {
                        
                        console.log("SUCCESS: " + JSON.stringify(result));
                        
                        $ionicLoading.hide();
                        $scope.onUserDetailHandler();
                        
                        $cordovaToast.show('Profile Image Updated Successfully', 'short', 'bottom').then(function (success) {
                              
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
      
      
      $scope.onUserDetailHandler = function () {
            
            $ionicLoading.show({
                  template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
            });
            
            myRequestDBService.onUserDetailHandler().then(function (result) {
                  
                  console.log(result);
                  $ionicLoading.hide();
                  
                  $scope.userData = result.userData;
                  // $scope.loginData.loginImage = result.userData.image;
                  // myAllSharedService.loginData.loginImage = result.userData.image;
                  
                  // console.log($scope.user_profile);
                  
            }, function (err) {
                  
                  console.error(err);
                  $ionicLoading.hide();
            })
      }
      
      $scope.onUpdateOrganisationHandler = function() {
            
            myAllSharedService.drTypeFilterData.drStatusCountData = '';
            myAllSharedService.drTypeFilterData.dashboardData = '';
            myAllSharedService.drTypeFilterData.checkInList = '';
            myAllSharedService.drTypeFilterData.followUpList = '';
            myAllSharedService.drTypeFilterData.orderList = '';
            
            myAllSharedService.loginData.loginOrganisationId = $scope.data.organisationId;
            
            const isIndex = $scope.organisationData.findIndex(row => row.organisation_id == $scope.data.organisationId);
            
            if(isIndex != -1) {
                  
                  myAllSharedService.loginData.loginTeamExist = $scope.organisationData[isIndex].isTeamExist;
            }
            
            $scope.loginData = myAllSharedService.loginData;
            
            $cordovaSQLite.execute(db, "UPDATE "+dbTableName+" SET organisationId = " + $scope.data.organisationId + "");
            
            var query ="SELECT username, password, organisationId FROM "+dbTableName+" ORDER BY id DESC LIMIT 1";
            
            $cordovaSQLite.execute(db, query).then(function(res) {
                  
                  console.log(res);
            });
            
            $ionicPopup.alert({
                  title: 'Success!',
                  template: 'Organisation Updated Successfully!'
            });
      }
      
      
      $scope.onGetUserOrganisationHandler = function () {
            
            $ionicLoading.show({
                  template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
            });
            
            myRequestDBService.onGetUserOrganisationHandler().then(function (result) {
                  
                  console.log(result);
                  $ionicLoading.hide();
                  
                  $scope.organisationData = result.organisationData;
                  $scope.data.organisationId = myAllSharedService.loginData.loginOrganisationId;
                  
                  console.log($scope.data.organisationId);
                  console.log($scope.organisationData);
                  
            }, function (err) {
                  
                  console.error(err);
                  $ionicLoading.hide();
            })
      }
      
      
      if($location.path() == '/tab/organisation-setting') {
            
            $scope.onGetUserOrganisationHandler();
      }
      
      if ($location.path() == '/tab/profile') {
            $scope.onUserDetailHandler();
      }
      
      
      if($location.path() == '/tab/attendance') {
            $scope.onGetAttendanceListHandler();
      }
      
      
      $scope.onSetCurrentPageHandler = function() {
            
            $scope.currentPage = 1;
            $scope.followUpList = [];
            
            $scope.onPageScrollTopHandler();
            
            $scope.noMoreListingAvailable = false;
      }
      
      $scope.onPageScrollTopHandler = function() {
            
            $ionicScrollDelegate.scrollTop();
      }
      
      
      
      $scope.getPincodeAddress = function(pincode)
      {
            if(pincode.length==6)
            {
                  $ionicLoading.show({
                        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
                  });
                  myRequestDBService.sfaPostServiceRequest('/App_SharedData/onGetPincodeDetail',{pincode:pincode})
                  .then(function(response)
                  {
                        console.log(response);
                        $ionicLoading.hide();
                        if(response.status=='success')
                        {
                              $scope.userData.state_name = response.pincodeData.state_name
                              $scope.userData.district_name = response.pincodeData.district_name
                              $scope.userData.city = response.pincodeData.city
                        }
                        else
                        {
                              $scope.userData.state_name =null;
                              $scope.userData.district_name =null;
                              $scope.userData.city =null;                
                        }
                        
                  }, function (err) {
                        
                        console.error(err);
                  });
            }
            else
            {
                  $scope.userData.state_name =null;
                  $scope.userData.district_name =null;
                  $scope.userData.city =null;     
            }
      }
      
      $scope.onMonthChangeHandler = function(actionType) {
            
            if(actionType == 'previous') {
                  $scope.selectedMonth = moment($scope.selectedMonth).subtract(1, 'months').format('YYYY-MM-DD');
            }
            
            if(actionType == 'next') {
                  
                  let isEqualToCurrentMonth = false;
                  
                  if(moment($scope.selectedMonth).format('YYYY-MM') == moment().format('YYYY-MM')) {
                        isEqualToCurrentMonth = true;
                  }
                  
                  if(isEqualToCurrentMonth) {
                        return false;
                  } else {
                        $scope.selectedMonth = moment($scope.selectedMonth).add(1, 'months').format('YYYY-MM-DD');
                  }
            }
            
            
            $scope.onSetCurrentPageHandler();
            $scope.onGetAttendanceListHandler();
      }
      
      $scope.updateUserDetail = function()
      {
            console.log($scope.userData);
            
            
            $ionicLoading.show({
                  template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
            });
            myRequestDBService.onGetPostRequest("/App_Login/updateUserDetail",$scope.userData)
            .then(function(response)
            {
                  console.log(response);
                  $ionicLoading.hide();
                  if(response.status=='Success')
                  {
                        $state.go('tab.dashboard');
                        $cordovaToast.show('Profile Detail Updated Successfully', 'short', 'bottom')

                  }
                  else
                  {
                        $ionicPopup.alert({
                                    title: 'Error!',
                                    template: response.message
                              });            
                  }
                  
            }, function (err) {
                  
                  console.error(err);
            });
      }
      
      if($location.path() == '/tab/edit-profile') {
            
            $scope.onUserDetailHandler();
      }
      
      
})





