
app.controller('dashboardCtrl', function ($scope, $rootScope, searchSelect, $ionicModal, $state, myRequestDBService, myAllSharedService, myRequestDBService, $ionicLoading, $cordovaSQLite, $ionicPopup, $ionicScrollDelegate, $timeout, $ionicActionSheet, $cordovaImagePicker, Camera, $cordovaFileTransfer, $cordovaGeolocation, $cordovaToast, $location, $window, $ionicPlatform, $ionicHistory, $ionicModal,$stateParams, $ionicPopover,$cordovaAppVersion) {

    $scope.goToBackPageHandler = function () {
        $ionicHistory.goBack();
    }
    
    $scope.isRequestInProcess;
    $scope.dashboardData = {};
    $scope.loginData = myAllSharedService.loginData;
    $scope.data = {};
    $scope.data.showMoreCustomerCount = false;
    $rootScope.isAttendanceStart  = myAllSharedService.loginData.startAttendance;
    console.log($rootScope.isAttendanceStart);
    // myAllSharedService.loginData.startAttendance = false;
    // $rootScope.isAttendanceStart = false;
    $scope.uploadURL = uploadURL;
    console.log($scope.loginData);
    
    // $scope.currentTime = new Date();
    
    // console.log(moment($scope.currentTime).format('HH:mm'));
    
    // $scope.currentTime  = moment($scope.currentTime).format('h:mm:s')
    // console.log($scope.currentTime);
    // $scope.leadTabActive = false;
  
    
})





