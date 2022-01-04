

app.controller('galleryController', function ($sce,$scope, $rootScope, searchSelect, $state, myRequestDBService, $ionicLoading, $cordovaSQLite, $ionicPopup, $ionicScrollDelegate, $timeout, $ionicActionSheet, $cordovaImagePicker, Camera, $cordovaFileTransfer, $cordovaGeolocation, $cordovaToast, $location, $window, $ionicPlatform, $ionicHistory, $ionicModal,$stateParams, $ionicScrollDelegate, $ionicPopover,$ionicSlideBoxDelegate,myAllSharedService)
{
    $scope.goToBackPageHandler = function() {
        console.log("do Back");
        $ionicHistory.goBack();
    }
    $scope.zoomMin = 1;
    $scope.dbURL = rootURL+'/uploads';

    $scope.orpURL = $scope.dbURL+'/orp/';
    console.log($scope.dbURL);


    $scope.galleryActiveTab = 1;
    $scope.productVideoDataList = [];

    $scope.trustSrc = function(url) {

        var video_id = url.split('v=')[1].split('&')[0];
        return $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + video_id);

    }

    $scope.sendRequest = true;

    console.log("Welcome to Gallery");

    $scope.getProductVideoList = function()
    {
        $scope.sendRequest = true;
        $scope.productVideoDataList=[];

        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });

        myRequestDBService.orpPostServiceRequest("/ORP_Gallery/getProductVideo","").then(function(response)
        {
            console.log(response);

            $scope.sendRequest =false;
            $scope.productVideoDataList = response.data;

            $ionicLoading.hide();

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

    $scope.newsEventImagesData=[];
    $scope.getNewsEventImages = function()
    {
        $scope.sendRequest = true;
        $scope.newsEventImagesData=[];

        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });

        myRequestDBService.orpPostServiceRequest("/ORP_Gallery/getNewsEventImagesData","").then(function(response)
        {
            console.log(response);
            $scope.sendRequest =false;
            $scope.newsEventImagesData = response.data;

            $ionicLoading.hide();

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


    // myAllSharedService.eventImageData = [];
    $scope.getEventImages = function(id,title,description)
    {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });



        myRequestDBService.orpPostServiceRequest("/ORP_Gallery/getEnevtImages/"+id,"").then(function(response)
        {
            console.log(response);

            myAllSharedService.eventImageData = response.data;
            myAllSharedService.title = title;
            myAllSharedService.description = description;

            if(myAllSharedService.eventImageData.length)
            {
                $state.go('orptab.orp_event_images');
            }

            $ionicLoading.hide();

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

    $scope.orpTestimonalsData=[];
    $scope.getOrpTestimonalsData = function()
    {
        $scope.sendRequest =true;
        $scope.orpTestimonalsData=[];

        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });

        myRequestDBService.orpPostServiceRequest("/ORP_Gallery/getOrpTestimonalsData","").then(function(response)
        {
            $scope.sendRequest = false
            console.log(response);

            $scope.orpTestimonalsData = response.data;

            $ionicLoading.hide();

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

    $scope.tvc_image_list=[];
    $scope.GET_TVC_IMAGE_DATA = function()
    {
        $scope.tvc_image_list=[];
        $scope.sendRequest = true;
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });

        myRequestDBService.orpPostServiceRequest("/ORP_Gallery/get_tvc_image_list","").then(function(response)
        {
            $scope.sendRequest = false;
            console.log(response);

            $scope.tvc_image_list = response.data;
            $scope.newsEventImagesData = response.data;

            $ionicLoading.hide();

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

    if($location.path() == '/orptab/orp_gallery')
    {

        $scope.getProductVideoList();

    }


    $scope.showImages = function(index) {
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


    if($location.path() == '/orptab/orp_event_images')
    {

        console.log("Test");
        console.log(myAllSharedService.eventImageData);
        $scope.newsEventImagesData=myAllSharedService.eventImageData;
        $scope.data.title = myAllSharedService.title;
        $scope.data.description = myAllSharedService.description;
    }


    //
});
