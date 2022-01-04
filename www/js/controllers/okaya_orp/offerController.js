app.controller('offerCtrl', function ($scope, $rootScope, searchSelect, $ionicModal, $state, myRequestDBService, myAllSharedService, myRequestDBService, $ionicLoading, $cordovaSQLite, $ionicPopup, $ionicScrollDelegate, $timeout, $ionicActionSheet, $cordovaImagePicker, Camera, $cordovaFileTransfer, $cordovaGeolocation, $cordovaToast, $location, $window, $ionicPlatform, $ionicHistory, $ionicModal,$stateParams, $ionicPopover)
{
    $scope.loginData = myAllSharedService.loginData;
    console.log(myAllSharedService);
    $scope.offer_list = [];
    $scope.history_list_data ={};
    $scope.offer_data = myAllSharedService.offer_data;
    $scope.gift_data = myAllSharedService.gift_data;
    $scope.history_data = myAllSharedService.history_data;
    $scope.data = {};
    $scope.isRequestInProcess;
    $scope.uploadURL = uploadURL+'orp/';
    $scope.LeadBoarduploadURL = uploadURL;
    $scope.offerCollapseActive = false;
    $scope.offerLoop=[1,2,3,4,5,6,7,8,9,10];



    $scope.goToBackPageHandler = function()
    {
        $ionicHistory.goBack();
        console.log('back');
    }


    $scope.getOfferList = function()
    {
        $scope.isRequestInProcess = true;

        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
        });

        myRequestDBService.orpPostServiceRequest('/Offer_Controller/offer_list').then(function (result)
        {
            $ionicLoading.hide();
            console.log(result);
            $scope.offer_list = result.outputData;
            $scope.isRequestInProcess = false;

        },
        function (err)
        {
            $ionicLoading.hide();
            console.error(err);
            $scope.isRequestInProcess = false;

        });
    }

    $scope.offerDetail = function(id)
    {
        // myAllSharedService.dealer_data = {};
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
        });

        console.log(id);
        myRequestDBService.orpPostServiceRequest('/Offer_Controller/offer_detail',id).then(function (result)
        {
            $ionicLoading.hide();
            console.log(result);
            $scope.offer_data = result.offer_data;
            $scope.offer_data.orp_wallet_point = parseInt(result.offer_data.orp_wallet_point);
            console.log($scope.offer_data);
            myAllSharedService.offer_data = $scope.offer_data;

            $state.go('orptab.orp_offerdetail');

        },
        function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });

    }

    $scope.giftDetail = function(id)
    {
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
        });

        console.log(id);
        let data = {
            offer_id : $scope.offer_data.id,
            gift_id : id,

        };
        myRequestDBService.orpPostServiceRequest('/Offer_Controller/gift_detail',data).then(function (result)
        {
            $ionicLoading.hide();
            console.log(result);
            $scope.gift_data = result.gift_data;
            $scope.gift_data.point = parseInt(result.gift_data.point);
            console.log($scope.gift_data);
            myAllSharedService.gift_data = $scope.gift_data;

            $state.go('orptab.orp_giftdetail');

        },
        function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });

    }

    $scope.todaysDate= new Date();

    $scope.dateFormat = function(date)
    {
        return moment(date).format("DD MMM YYYY")
    }

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

    $scope.sendRedeemRequest = function()
    {

        console.log($scope.offer_data);

        // return;

        let data = {
            offer_id : $scope.offer_data.id,
            offer_name : $scope.offer_data.title,
            offer_points: $scope.offer_data.balancepoint,
            wallet_point: parseInt($scope.offer_data.balancepoint) - parseInt($scope.offer_data.bonuspoint.bonus_point),
            bonus_point: $scope.offer_data.bonuspoint.bonus_point,
            coupon_scan_count: $scope.offer_data.scanDetail.total_scan_coupon,
        };


        myRequestDBService.orpPostServiceRequest('/Offer_Controller/send_redeem_request',data).then(function (result)
        {
            $ionicLoading.hide();
            console.log(result);
            if(result.msg == 'success')
            {
                $scope.otpgiftCloseModel();

                setTimeout(() =>
                {
                    $state.go('orptab.orp_dashboard');

                    $ionicPopup.alert({
                        title: 'Success',
                        template: 'Redeem Request Sent Successfully!'
                    });

                }, 500);

            }
        },
        function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });

    }

    $scope.getOTP = function ()
    {
        console.log("function call");
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });

        myRequestDBService.orpPostServiceRequest('/Offer_Controller/get_otp',$scope.data).then(function (result)
        {
            console.log(result);
            $ionicLoading.hide();
            if (result.status == 'success')
            {
                $scope.data.otpCode = result.otpCode;
            }
        });

    }

    $scope.checkOtp = function()
    {
        console.log($scope.data);
        if ($scope.data.otp == $scope.data.otpCode)
        {
            $scope.sendRedeemRequest();
        }
        else
        {
            $ionicPopup.alert({
                title: 'Error!',
                template: 'OTP is Not Correct!'
            });
        }
    }

    $scope.redeemRequest = function()
    {
        $ionicPopup.confirm({

            title: 'Are You Sure, You Want to Send Redeem Request ?',
            buttons: [{
                text: 'YES',
                type: 'button-block button-outline button-stable',
                onTap: function (e)
                {
                    console.log($scope.loginData);
                    $scope.getOTP();
                    $scope.otpgiftOpenModel();
                }},
                {
                    text: 'NO',
                    type: 'button-block button-outline button-stable',
                    onTap: function (e) {
                        console.log('You Are Not Sure');
                    }
                }]
            });
        }

        $scope.getHistoryList = function()
        {
            $scope.isRequestInProcess = true;

            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
            });

            myRequestDBService.orpPostServiceRequest('/Offer_Controller/history_list').then(function (result)
            {
                $ionicLoading.hide();
                console.log(result);
                $scope.history_list_data = result.outputData;
                console.log($scope.history_list);
                $scope.isRequestInProcess = false;

            },
            function (err)
            {
                $ionicLoading.hide();
                console.error(err);
                $scope.isRequestInProcess = false;

            });
        }

        $scope.getHistoryDetail = function(id)
        {
            // myAllSharedService.dealer_data = {};
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
            });

            console.log(id);
            myRequestDBService.orpPostServiceRequest('/Offer_Controller/history_detail',id).then(function (result)
            {
                $ionicLoading.hide();
                console.log(result);
                $scope.history_data = result.history_data;
                console.log($scope.history_data);
                myAllSharedService.history_data = $scope.history_data;

                $state.go('orptab.orp_shipped_detail');
            },
            function (err)
            {
                $ionicLoading.hide();
                console.error(err);
            });

        }

        $scope.changeStatus = function(id)
        {
            $ionicPopup.confirm({

                title: 'Are You Sure, You Want to Change Status ?',
                buttons: [{
                    text: 'YES',
                    type: 'button-block button-outline button-stable',
                    onTap: function (e)
                    {
                        myRequestDBService.orpPostServiceRequest('/Offer_Controller/change_status',id).then(function (result)
                        {
                            console.log(result);
                            if(result.msg == 'success')
                            {

                                $ionicPopup.alert({
                                    title: 'Success!',
                                    template: 'Status Changed Successfully!!'
                                });

                                $state.go('tab.Electrician-list');
                            }
                            else
                            {
                                $ionicPopup.alert({
                                    title: 'Error!',
                                    template: 'Status Not Changed!Try Again Later'
                                });
                            }
                        },
                        function (err)
                        {
                            $ionicLoading.hide();
                            console.error(err);
                        });

                    }},
                    {
                        text: 'NO',
                        type: 'button-block button-outline button-stable',
                        onTap: function (e) {
                            console.log('You Are Not Sure');
                        }
                    }]
                });
            }

            function MyCtrl($scope, $ionicSlideBoxDelegate) {
                $scope.nextSlide = function() {
                    $ionicSlideBoxDelegate.next();
                }
            }

            $scope.BonusDetails = [];
            $scope.getBonusDetails = function()
            {
                $ionicLoading.show({
                    template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
                });

                console.log( $scope.loginData);
                let data = {
                    logindata: $scope.loginData
                };
                myRequestDBService.orpPostServiceRequest('/Offer_Controller/GET_BONUS_PROCESS',data).then(function (result)
                {
                    $ionicLoading.hide();
                    var rangeCompletionPercent;
                    var rangeCompletion;
                    var slabranges;
                    console.log(result);
                    $scope.BonusDetails = result.data;
                    console.log($scope.BonusDetails);
                    // for(i = 0 ; i < $scope.BonusDetails.length;i++){
                    //   console.log('run 1');
                    //   $scope.BonusDetails[i].scan_count['total_scan'] = 76;
                    //   for(j = 0 ; j < $scope.BonusDetails[i].slab.length;j++){
                    //   console.log('run 2');
                    //   console.log('run 3 / '+$scope.BonusDetails[i].scan_count['total_scan']);
                    //   console.log('run 4 / '+$scope.BonusDetails[i].slab[j].range_end);
                    //   slabranges =$scope.BonusDetails[i].slab[j].range_end==0?$scope.BonusDetails[i].slab[j].range_start:$scope.BonusDetails[i].slab[j].range_end;
                    //     rangeCompletion=Math.round(($scope.BonusDetails[i].scan_count['total_scan']/slabranges)*100)
                    //     console.log(rangeCompletion);
                    //     if(rangeCompletion>100){
                    //       rangeCompletion = 100;
                    //     }
                    //     $scope.BonusDetails[i].slab[j].rangeCompletion=  rangeCompletion;
                    //     if(rangeCompletion<100){
                    //       console.log($scope.BonusDetails);
                    //       return;
                    //     }
                      // }
                    // }

                    for(i = 0 ; i < $scope.BonusDetails.length;i++){

                      // $scope.BonusDetails[0].scan_count['total_scan'] = 150;
                      // $scope.BonusDetails[1].scan_count['total_scan'] = 145;

                      for(j = 0 ; j < $scope.BonusDetails[i].slab.length;j++){

                        slabranges =$scope.BonusDetails[i].slab[j].range_start;
                        console.log('slab ranges / '+ slabranges);

                        // console.log('run 1');
                        // console.log($scope.BonusDetails[i].scan_count['total_scan']);
                        // console.log($scope.BonusDetails[i].slab[$scope.BonusDetails[i].slab.length-1].range_start);

                        if(parseInt($scope.BonusDetails[i].scan_count['total_scan'])>=parseInt($scope.BonusDetails[i].slab[$scope.BonusDetails[i].slab.length-1].range_start)){
                          console.log('run 2');
                            for(k=0 ; k<$scope.BonusDetails[i].slab.length ; k++){
                              $scope.BonusDetails[i].slab[k].rangeCompletion= true;
                              $scope.BonusDetails[i].slab[k].rangeCompletionPercent= 100;
                            }
                            break;
                        }

                        console.log('run 3');
                        console.log($scope.BonusDetails[i].scan_count['total_scan']);
                        console.log($scope.BonusDetails[i].slab[j].range_start);
                        if(parseInt($scope.BonusDetails[i].scan_count['total_scan'])<parseInt($scope.BonusDetails[i].slab[j].range_start)){

                          console.log('total scan point / '+$scope.BonusDetails[i].scan_count['total_scan']);
                          console.log('ranges / '+$scope.BonusDetails[i].slab[j].range_start);

                          if(slabranges==0){

                            console.log('slabrange / 0');
                            continue;

                          }else{

                          var rangedifference = slabranges - $scope.BonusDetails[i].slab[j-1].range_start;
                          var pointdifference =  $scope.BonusDetails[i].scan_count['total_scan'] - $scope.BonusDetails[i].slab[j-1].range_start;
                          console.log('rangedifference - '+rangedifference);
                          console.log('pointdifference - '+pointdifference);


                          rangeCompletionPercent=Math.round((pointdifference/rangedifference)*100);
                          console.log('range Completion / '+rangeCompletionPercent);

                          for(m=0;m<j-1;m++){

                            $scope.BonusDetails[i].slab[m].rangeCompletionPercent= 100;
                            console.log('100  / ranges less than total point %' + $scope.BonusDetails[i].slab[m].range_start );

                          }
                          for(n=0;n<j;n++){

                            $scope.BonusDetails[i].slab[n].rangeCompletion = true;
                            console.log('true  / rangeCompletion ' + $scope.BonusDetails[i].slab[n].range_start );

                          }

                          $scope.BonusDetails[i].slab[j-1].rangeCompletionPercent =  rangeCompletionPercent;
                          console.log('last range completion ' + $scope.BonusDetails[i].slab[j-1].range_start+ " + "+ $scope.BonusDetails[i].slab[j-1].rangeCompletionPercent +"%");
                          console.log($scope.BonusDetails);
                          break;

                          }
                        }

                      }

                    }
                    console.log($scope.BonusDetails);

                },
                function (err)
                {
                    $ionicLoading.hide();
                    console.error(err);
                });

            }

            $scope.sub_count = [];
            $scope.ScanHistory = function (row){
              $scope.sub_count = row;
              console.log($scope.sub_count);
            }

            if($location.path() == '/orptab/orp_offerdetail')
            {
                $ionicPopover.fromTemplateUrl('scan_hist', {
                    scope: $scope,
                }).then(function (popovers) {
                    $scope.data.scan_history = popovers;
                });
                $scope.getBonusDetails();

            }

            $scope.ActiveCategory = 'Week';
            $scope.LeaderboardData=[];
            $scope.LeaderboardThree_data=[];
            $scope.LeaderboardRest_data=[];
            $scope.loadingdata=false;
            $scope.getLeaderboardData = function (catagory){

              $scope.LeaderboardData=[];
              $scope.LeaderboardThree_data=[];
              $scope.LeaderboardRest_data=[];

              console.log(catagory);
              $scope.ActiveCategory=catagory;
              $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
            });

            $scope.loadingdata=false;
            console.log(catagory);
            myRequestDBService.orpPostServiceRequest('/ORP_Controller/GET_TOP_ELECTRICIAN_DASHBOARD/'+ catagory,"").then(function (result)
            {
                $ionicLoading.hide();
                console.log(result);
                $scope.loadingdata=true;
                $scope.LeaderboardData = result.data;
                for(var i=0; i<$scope.LeaderboardData.length;i++){
                if(i<3){
                  console.log('less than 3');
                  $scope.LeaderboardThree_data.push($scope.LeaderboardData[i]);
                  console.log($scope.LeaderboardThree_data);
                } else{
                  console.log('more than 3');
                  $scope.LeaderboardRest_data.push($scope.LeaderboardData[i]);
                  console.log($scope.LeaderboardRest_data);
                }
                }

                console.log($scope.LeaderboardData);

            },
            function (err)
            {
                $ionicLoading.hide();
                console.error(err);
            });
            }

            if($location.path() == '/orptab/orp_leaderboard'){

              $scope.getLeaderboardData('Week');

            }

        })
