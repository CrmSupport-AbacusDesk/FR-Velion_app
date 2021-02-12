

app.controller('orpCtrl', function ($scope, $ionicModal, $ionicModal, $ionicHistory,)
{
    $scope.goToBackPageHandler = function() {
        $ionicHistory.goBack();
    }
    
    // Model 1 Start
    $ionicModal.fromTemplateUrl('warranty_section_otp', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    $scope.otpOpenModel = function() {
        $scope.modal.show();
    };
    $scope.otpCloseModel = function() {
        $scope.modal.hide();
    };  
    // End
    
    
    // Model 2 Start
    $ionicModal.fromTemplateUrl('gift_otp', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(otpmodel) {
        $scope.otpmodel = otpmodel;
    });
    $scope.otpgiftOpenModel = function() {
        $scope.otpmodel.show();
    };
    $scope.otpgiftCloseModel = function() {
        $scope.otpmodel.hide();
    };  
    // 

    // Model 3 Start
    $ionicModal.fromTemplateUrl('pricelist_filter', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(pricelistmodel) {
        $scope.pricelistmodel = pricelistmodel;
    });
    $scope.pricelistOpenModel = function() {
        $scope.pricelistmodel.show();
    };
    $scope.pricelistCloseModel = function() {
        $scope.pricelistmodel.hide();
    };  
    // 
});