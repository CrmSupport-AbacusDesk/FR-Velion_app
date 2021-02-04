app.controller('leaveCtrl', function ($scope, $rootScope, searchSelect, $ionicModal, $state, myRequestDBService, myAllSharedService, $ionicLoading, $cordovaSQLite, $ionicPopup, $timeout, $ionicActionSheet, $cordovaImagePicker, Camera, $cordovaFileTransfer, $cordovaGeolocation, $cordovaToast, $location, $window, $ionicPlatform, $ionicHistory, $ionicModal,$stateParams, $ionicScrollDelegate, $ionicPopover) {

    $scope.loginData = myAllSharedService.loginData;
    $scope.isRequestInProcess;
    $scope.orderList = [];


    $scope.onGetLeaveApplicationHandler = function() {

        $scope.isRequestInProcess = true;

        myRequestDBService.onGetLeaveApplicationHandler($scope.currentActiveTab, $scope.data.search, $scope.currentPage, $scope.pageSize).then(function(response) {

            console.log(response);
            $scope.userLeaveList = response.userLeaveList;
            console.log($scope.userLeaveList);

        }, function (err) {

            $ionicLoading.hide();
            $scope.isRequestInProcess = false;
            console.error(err);
      });

    }

    $scope.leave_data = {};
    $scope.onSubmitLeaveApplication = function(){

        console.log($scope.leave_data);

        myRequestDBService.onSubmitLeaveApplication($scope.leave_data)
        .then(function(response) {

            console.log(response);

            $ionicLoading.hide();
            $state.go('tab.SFA_LeaveApplicationlist');


            $cordovaToast.show('Leave Application Saved Successfully', 'short', 'bottom').then(function (success) {

            }, function (error) {

            });

        });

    }

    $scope.userLeaveDelete = function(leaveid){

        $ionicPopup.confirm({

            title: 'Are You Sure, You Want to Delete leave ?',
            buttons: [{

              text: 'YES',
              type: 'button-block button-outline button-stable',
              onTap: function (e) {

                myRequestDBService.userLeaveDelete(leaveid)
                    .then(function(response) {

                   $scope.userLeaveList.splice(leaveid, 1);
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

        // myRequestDBService.userLeaveDelete(leaveid)
        // .then(function(response) {

        //     console.log(response);
        //     $ionicLoading.hide();
        //     $state.go('tab.SFA_LeaveApplicationlist');

        //     $cordovaToast.show('Leave Application Deleted Successfully', 'short', 'bottom').then(function (success) {

        //     }, function (error) {

        //     });


        // });

    }



})
