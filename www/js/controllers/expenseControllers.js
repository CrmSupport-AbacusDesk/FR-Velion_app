
app.controller('expenseCtrl', function ($scope, $rootScope, searchSelect, $ionicModal, $state, myRequestDBService, myAllSharedService, $ionicLoading, $cordovaSQLite, $ionicPopup, $timeout, $ionicActionSheet, $cordovaImagePicker, Camera, $cordovaFileTransfer, $cordovaGeolocation, $cordovaToast, $location, $window, $ionicPlatform, $ionicHistory, $ionicModal,$stateParams, $ionicScrollDelegate, $ionicPopover)
{
    
    $scope.loginData = myAllSharedService.loginData;
    
    $scope.form = {};
    $scope.travel = {};
    $scope.form.TravelType = 'Area';
    $scope.travelData = [];
    $scope.expense = {};
    $scope.travelForm = {};
    $scope.travelStatus = {};
    $scope.expStatus = {};
    $scope.expEditTravel = {};
    $scope.expEditHotel = {};
    $scope.expEditFood = {};
    $scope.expEditLocalConv = {};
    $scope.expEditMiscExp = {};
    $scope.travelPlanExist = false;
    $scope.expEditData = {};
    $scope.classActive = false;
    $scope.search = {};
    
    let currentDate = new Date();
    $scope.minMonthDate = moment().format('YYYY-MM') + '-01';
    $scope.maxMonthDate = moment().add(3, 'months').format('YYYY-MM') + '-31';
    $scope.expenseMaxDate = moment().format('YYYY-MM-DD');
    
    $rootScope.expImgUrl = uploadURL + 'expense';
    
    $scope.getTravelList = function(status)
    {
        if(myAllSharedService.expense.modelPlanType)
        {
            var modelPlanType = myAllSharedService.expense.modelPlanType;
        }
        else
        {
            var modelPlanType = 'myTravelPlan';
        }
        
        $scope.travelPlanStatus = status;
        
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        myRequestDBService.getTravelList($scope.travelPlanStatus, modelPlanType)
        .then(function (resp)
        {
            console.log(resp);
            $ionicLoading.hide();
            $scope.travelPlanData = resp.data.travel;
        }, function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });
    }
    
    $scope.onModifyTypeHandler = function(type)
    {
        myAllSharedService.expense.modelPlanType = type;
        $rootScope.modelPlanType = type;
        $scope.getTravelList('Pending');
    }
    
    if($location.path() == '/tab/travel')
    {
        myAllSharedService.expense.modelPlanType = 'myTravelPlan';
        $rootScope.modelPlanType = 'myTravelPlan';
        $scope.getTravelList('Pending');
    }
    
    // $scope.sorted_arr = [];
    $scope.sorted_arr = [];
    $scope.group_by_date = function(array)
    {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        $ionicLoading.hide();
        console.log(array);
        var tmp_arr = {};
        for(let i=0;i<array.length;i++)
        {
            if(i==0)
            {
                var new_date = array[i]['visitDate'];
                tmp_arr[new_date] = []
                tmp_arr[new_date].push(array[i]);
            }
            else
            {
                
                if(array[i]['visitDate'] in tmp_arr)
                {
                    tmp_arr[new_date].push(array[i]);
                }
                else
                {
                    var new_date = array[i]['visitDate'];
                    tmp_arr[new_date] = []
                    tmp_arr[new_date].push(array[i]);
                }
            }
        }
        
        $scope.sorted_arr = [];
        angular.forEach(tmp_arr, function (value, key)
        { 
            $scope.sorted_arr.push({date:key,data:value});
        }); 
        
        console.log($scope.sorted_arr);        
    }
    
    $scope.travel = myAllSharedService.travel.trvel_data;
    $scope.travelData = myAllSharedService.travel.travel_area;
    if($scope.travelData && $scope.travelData.length > 0)
    {
        $scope.group_by_date($scope.travelData);
    }
    
    console.log($scope.travel);
    if($scope.travel && $scope.travel.startDate !='')
    {
        $scope.travel.startDate = new Date($scope.travel.startDate);
    }
    if($scope.travel && $scope.travel.endDate !='')
    {
        $scope.travel.endDate = new Date($scope.travel.endDate);
    }
    
    $scope.edit_plan = function(travelPlanId)
    {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        myRequestDBService.edit_plan(travelPlanId)
        .then(function (resp)
        {
            console.log(resp);
            myAllSharedService.travel.travel_area = resp.data.area_list;
            myAllSharedService.travel.trvel_data = resp.data.tra_data;
            console.log(myAllSharedService.travel.trvel_data);
            
            $ionicLoading.hide();
            $state.go('tab.travel-edit');
        }, function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });
    }
    
    
    $scope.travelPlanDetail = myAllSharedService.travel.travelPlanDetail;
    if($scope.travelPlanDetail && $scope.travelPlanDetail.travelArea.length > 0)
    {
        $scope.group_by_date($scope.travelPlanDetail.travelArea);
    }
    console.log(myAllSharedService.travel.travelPlanDetail);
    console.log($scope.travelPlanDetail);
    
    $scope.getTravelPlanDetail = function(travelPlanId)
    {
        myAllSharedService.expense.travelPlanDetail = {};
        
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        myRequestDBService.getTravelPlanDetail(travelPlanId)
        .then(function (resp)
        {
            $ionicLoading.hide();
            console.log(resp);
            $scope.travelPlanDetail = resp.data;
            myAllSharedService.travel.travelPlanDetail = resp.data;
            $state.go('tab.travel-detail');
        }, function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });
    }
    
    $scope.getExpenseList = function(status)
    {
        if(myAllSharedService.expense.modelPlanType)
        {
            var modelPlanType = myAllSharedService.expense.modelPlanType;
        }
        else
        {
            var modelPlanType = 'myTravelPlan';
        }
        
        $scope.expensePlanStatus = status;
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        myRequestDBService.getExpenseList($scope.expensePlanStatus,modelPlanType).then(function (resp)
        {
            $ionicLoading.hide();
            $scope.expenseListData = resp.data.expense;
        }, function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });
    }
    
    if($location.path() == '/tab/expense')
    {
        $scope.getExpenseList('Pending');
        myAllSharedService.expense.travelPlanId = '';
        myAllSharedService.expense.modelPlanType = '';
        $rootScope.modelPlanType = '';
    }
    
    
    $scope.expenseDetail = myAllSharedService.expense.expenseDetail;
    $scope.detail_type = myAllSharedService.expense.detail_type;
    $scope.getExpenseDetail = function(expenseId)
    {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        myRequestDBService.getExpenseDetail(expenseId)
        .then(function (resp)
        {
            $ionicLoading.hide();
            console.log(resp);
            $scope.expenseDetail = resp.data.expense;
            myAllSharedService.expense.expenseDetail = resp.data.expense;
            $state.go('tab.expense-detail');
        }, function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });
    }
    
    $scope.journy_list = [];
    
    $scope.get_journy_data = function()
    {
        myRequestDBService.get_journy_data($scope.travelPlanDetail.travelArea,$scope.travelPlanDetail.id)
        .then(function (resp)
        {
            console.log(resp);
            $scope.journy_list = resp.data.activity_list;
            if($scope.journy_list.length > 0)
            {
                $scope.group_by_date($scope.journy_list);
            }
        });
    }
    
    $scope.change_detail_type = function(type)
    {
        myAllSharedService.expense.detail_type = type;
        $scope.detail_type = type;
        if(type == 'journy')
        {
            $scope.get_journy_data();
        }
        else
        {
            $scope.group_by_date($scope.travelPlanDetail.travelArea);
        }
    }
    
    $scope.getState = function()
    {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        myRequestDBService.getState().then(function (resp)
        {
            $ionicLoading.hide();
            console.log(resp);
            
            $scope.stateList = resp.data;
            
        }, function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });
    }
    
    $scope.getDistrict = function(state)
    {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        myRequestDBService.getDistrict(state).then(function (resp)
        {
            $ionicLoading.hide();
            console.log(resp);
            $scope.districtList = resp.data;
        }, function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });
    }
    
    $scope.getCity = function(district)
    {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        myRequestDBService.getCity(district).then(function (resp)
        {
            $ionicLoading.hide();
            console.log(resp);
            
            $scope.cityList = resp.data;
            
        }, function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });
    }
    
    $scope.getDistributorData = function()
    {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        myRequestDBService.getDistributorData()
        .then(function (resp)
        {
            $ionicLoading.hide();
            console.log(resp);
            $scope.distributorData = resp.data;
        }, function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });
    }
    
    $scope.max_date = '';
    $scope.min_date = '';
    
    $scope.checkTravelPlan = function()
    {
        if($scope.travel.startDate) $scope.travel.startDate = moment($scope.travel.startDate).format('YYYY-MM-DD');
        if($scope.travel.endDate) $scope.travel.endDate = moment($scope.travel.endDate).format('YYYY-MM-DD');
        
        console.log($scope.travel.endDate);
        
        if($scope.travel.startDate && $scope.travel.endDate)
        {
            myRequestDBService.checkTravelPlan($scope.travel).then(function (resp)
            {
                $ionicLoading.hide();
                console.log(resp);
                
                if(resp.data.id)
                {
                    $scope.travelPlanExist = true;
                }
                else
                {
                    $scope.travelPlanExist = false;
                }
                
            }, function (err)
            {
                $ionicLoading.hide();
                console.error(err);
            });
        }
    }    
    
    $scope.addPlan = function()
    {
        if(!$scope.form.visitDate)
        {
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Please Select Visit Date!',
            });
            return;
        }
        
        if($scope.form.TravelType == 'Area')
        {
            if(!$scope.search.stateName.Value)
            {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Please Select State!',
                });
                return;
            }
            
            if(!$scope.search.districtName.length)
            {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Please Select District!',
                });
                return;
            }
            
            if(!$scope.search.city.length)
            {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Please Select City!',
                });
                return;
            }
            
            if(!$scope.form.remark)
            {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Please Insert Purpose of visit!',
                });
                return;
            }
            
            if($scope.selectedCity.length > 0)
            {
                $scope.selectedCity.forEach(element => {
                    var tmp_obj={};
                    if($scope.form.TravelType == 'Area')
                    {
                        tmp_obj.state = element.state;
                        tmp_obj.district = element.district;
                        tmp_obj.city = element.city;
                        tmp_obj.remark = $scope.form.remark;
                        tmp_obj.TravelType = $scope.form.TravelType;
                        tmp_obj.visitDate = moment($scope.form.visitDate).format("YYYY-MM-DD");
                    }
                    if($scope.travelData.length == 0)
                    {
                        $scope.travelData.unshift(tmp_obj);
                    }
                    else
                    {
                        var index =  $scope.travelData.find(row=> row.state == tmp_obj.state && row.district == tmp_obj.district && row.city == tmp_obj.city && row.visitDate == tmp_obj.visitDate );
                        if(index == undefined)
                        {
                            $scope.travelData.unshift(tmp_obj);
                        }
                    }
                });
            }
            
        }
        if($scope.form.TravelType == 'Party')
        {
            if(!$scope.search.drName.length)
            {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Please Select Distributor!',
                });
                return;
            }
            
            if(!$scope.form.remark)
            {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Please Insert Purpose of visit!',
                });
                return;
            }
            
            if($scope.selectedDr.length > 0)
            {
                $scope.selectedDr.forEach(data => {
                    var tmp_obj={};
                    tmp_obj.drId = data.dr_id;
                    tmp_obj.drName = data.dr_name;
                    tmp_obj.remark = $scope.form.remark;
                    tmp_obj.TravelType = $scope.form.TravelType;
                    tmp_obj.visitDate = moment($scope.form.visitDate).format("YYYY-MM-DD");
                    console.log(data);
                    
                    if($scope.travelData.length == 0)
                    {
                        $scope.travelData.unshift(tmp_obj);
                    }
                    else
                    {
                        var index =  $scope.travelData.find(row=> row.drId == tmp_obj.drId && row.visitDate == tmp_obj.visitDate );
                        if(index == undefined)
                        {
                            $scope.travelData.unshift(tmp_obj);
                        }
                    }
                });
            }
        }
        
        var tmp_travelData = $scope.form.TravelType;
        $scope.form = {};
        $scope.form.TravelType = tmp_travelData;
        $scope.search.city = [];
        console.log($scope.travelData);
        
        $scope.group_by_date($scope.travelData);
    }
    
    $scope.removeTravelArea = function(index)
    {
        $ionicPopup.confirm({
            title: 'Are You Sure, You Want to Delete Item ?',
            buttons: [{
                
                text: 'YES',
                type: 'button-block button-outline button-stable',
                onTap: function (e) {
                    $scope.travelData.splice(index,1);
                    $scope.group_by_date($scope.travelData);
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
    
    $scope.submitTravel = function()
    {
        if($scope.travel.id)
        {
            var msg = 'Are You Sure, You Want to Update Travel Details?'
        }
        else
        {
            var msg = 'Are You Sure, You Want to Add Travel Details?'
        }
        
        $ionicPopup.confirm({
            title: msg,
            buttons: [{
                text: 'YES',
                type: 'button-block button-outline button-stable',
                onTap: function (e) {
                    $ionicLoading.show({
                        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
                    });
                    
                    if($scope.travel.startDate && $scope.travel.endDate)
                    {
                        $scope.travel.startDate = moment($scope.travel.startDate).format('YYYY-MM-DD');
                        $scope.travel.endDate = moment($scope.travel.endDate).format('YYYY-MM-DD');
                    }
                    
                    $scope.travel.travelArea = $scope.travelData;
                    myRequestDBService.submitTravel($scope.travel)
                    .then(function (resp)
                    {
                        console.log(resp);
                        
                        $ionicLoading.hide();
                        if($scope.travel.id)
                        {
                            $cordovaToast.show('Travel Plan Updated Successfully', 'short', 'bottom').then(function (success) {
                            }, function (error) {
                            });
                        }
                        else
                        {
                            $cordovaToast.show('Travel Plan Added Successfully', 'short', 'bottom').then(function (success) {
                            }, function (error) {
                            });
                        }
                        
                        if(resp.data.approval_users.length == 0)
                        {
                            $cordovaToast.show("You don't have Senior for Approval", 'short', 'bottom').then(function (success) {
                            }, function (error) {
                            });
                        }
                        
                        $state.go('tab.travel');
                        
                    }, function (err)
                    {
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
    
    $scope.getTravelModes = function()
    {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        myRequestDBService.getTravelModes().then(function (resp)
        {
            $ionicLoading.hide();
            $scope.travelMode = resp.data;
            
        }, function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });
    }
    
    if($location.path() == '/tab/expense-add')
    {
        $scope.getTravelModes();
        $scope.expense.travelPlanId = myAllSharedService.expense.travelPlanId;
        
        if($scope.expense.travelPlanId)
        {
            $scope.expense.expType = 'Outstation Travel';
        }
        else
        {
            $scope.expense.expType = 'Local Conveyance Travel';
        }
    }
    
    
    $scope.travelInfo = [];
    $scope.hotelForm = {};
    $scope.hotelInfo = [];
    $scope.foodForm = {};
    $scope.foodInfo = [];
    $scope.localConvForm = {};
    $scope.localConvInfo = [];
    $scope.miscExpForm = {};
    $scope.miscExpInfo = [];
    $scope.expense.hotelAmt = 0;
    $scope.expense.travelEntitlementAmt = 0;
    $scope.expense.foodAmt = 0;
    $scope.expense.localConvAmt = 0;
    $scope.expense.miscExpAmt = 0;
    $scope.expense.totalAmt = 0;
    $scope.mediaData = [];
    
    $scope.addTravel = function()
    {
        if($scope.travelForm.arrivalDate) $scope.travelForm.arrivalDate = moment($scope.travelForm.arrivalDate).format('YYYY-MM-DD');
        if($scope.travelForm.arrivalTime) $scope.travelForm.arrivalTime = moment($scope.travelForm.arrivalTime).format('h:mm a');
        if($scope.travelForm.depatureDate) $scope.travelForm.depatureDate = moment($scope.travelForm.depatureDate).format('YYYY-MM-DD');
        if($scope.travelForm.depatureTime) $scope.travelForm.depatureTime = moment($scope.travelForm.depatureTime).format('h:mm a');
        
        $scope.travelInfo.push($scope.travelForm);
        $scope.expense.travelEntitlementAmt += parseInt($scope.travelForm.arrivalAmount) + parseInt($scope.travelForm.depatureAmount);
        $scope.expense.totalAmt += parseInt($scope.travelForm.arrivalAmount) + parseInt($scope.travelForm.depatureAmount);
        
        $scope.travelForm = {};
    }
    
    $scope.addHotel = function()
    {
        if($scope.hotelForm.checkInDate) $scope.hotelForm.checkInDate = moment($scope.hotelForm.checkInDate).format('YYYY-MM-DD');
        if($scope.hotelForm.checkOutDate) $scope.hotelForm.checkOutDate = moment($scope.hotelForm.checkOutDate).format('YYYY-MM-DD');
        
        $scope.hotelInfo.push($scope.hotelForm);
        $scope.expense.hotelAmt += parseInt($scope.hotelForm.amount);
        $scope.expense.totalAmt += parseInt($scope.hotelForm.amount);
        
        $scope.hotelForm = {};
    }
    
    $scope.addFood = function()
    {
        if($scope.foodForm.date) $scope.foodForm.date = moment($scope.foodForm.date).format('YYYY-MM-DD');
        
        $scope.foodInfo.push($scope.foodForm);
        $scope.expense.foodAmt += parseInt($scope.foodForm.amount);
        $scope.expense.totalAmt += parseInt($scope.foodForm.amount);
        
        $scope.foodForm = {};
    }
    
    $scope.calculateTravelAmount = function()
    {
        if($scope.localConvForm.travelClass == 'Car')
        {
            $scope.localConvForm.amount = parseInt($scope.localConvForm.distance) * parseInt($scope.travelMode.car);
        }
        
        if($scope.localConvForm.travelClass == 'Bike')
        {
            $scope.localConvForm.amount = parseInt($scope.localConvForm.distance) * parseInt($scope.travelMode.bike);
        }
    }
    
    $scope.addLocalConv = function()
    {
        if($scope.localConvForm.date) $scope.localConvForm.date = moment($scope.localConvForm.date).format('YYYY-MM-DD');
        
        $scope.localConvInfo.push($scope.localConvForm);
        $scope.expense.localConvAmt += parseInt($scope.localConvForm.amount);
        $scope.expense.totalAmt += parseInt($scope.localConvForm.amount);
        
        $scope.localConvForm = {};
    }
    
    $scope.addMiscExp = function()
    {
        if($scope.miscExpForm.date) $scope.miscExpForm.date = moment($scope.miscExpForm.date).format('YYYY-MM-DD');
        
        $scope.miscExpInfo.push($scope.miscExpForm);
        $scope.expense.miscExpAmt += parseInt($scope.miscExpForm.amount);
        $scope.expense.totalAmt += parseInt($scope.miscExpForm.amount);
        
        $scope.miscExpForm = {};
    }
    
    $scope.rmMiscExp = function(index, amt)
    {
        $scope.miscExpInfo.splice(index,1);
        $scope.expense.miscExpAmt -= parseInt(amt);
        $scope.expense.totalAmt -= parseInt(amt);
    }
    
    $scope.rmLocalConvExp = function(index, amt)
    {
        $scope.localConvInfo.splice(index,1);
        $scope.expense.localConvAmt -= parseInt(amt);
        $scope.expense.totalAmt -= parseInt(amt);
    }
    
    $scope.rmFoodExp = function(index, amt)
    {
        $scope.foodInfo.splice(index,1);
        $scope.expense.foodAmt -= parseInt(amt);
        $scope.expense.totalAmt -= parseInt(amt);
    }
    
    $scope.rmHotelExp = function(index, amt)
    {
        $scope.hotelInfo.splice(index,1);
        $scope.expense.hotelAmt -= parseInt(amt);
        $scope.expense.totalAmt -= parseInt(amt);
    }
    
    $scope.rmTravelExp = function(index, deptAmt, arrAmt)
    {
        $scope.travelInfo.splice(index,1);
        $scope.expense.travelEntitlementAmt -= parseInt(deptAmt) + parseInt(arrAmt);
        $scope.expense.totalAmt -= parseInt(deptAmt) + parseInt(arrAmt);
    }
    
    
    
    
    $scope.open_camera = function()
    {
        var val = 'remove-pic';
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
            buttonClicked: function(index)
            {
                //return true;
                
                if(index === 0) { // Manual Button
                    $scope.perameter();
                }
                else if(index === 1){
                    $scope.getPicture();
                }
                
                else if(index === 2) {
                    $scope.deletePicture();
                }
                return true;
            }
        })
    }
    
    $scope.getPicture = function (options)
    {
        var options = {
            quality : 50,
            targetWidth: 500,
            targetHeight: 500,
            saveToPhotoAlbum: false
        };
        
        Camera.getPicture(options).then(function(imageData)
        {
            var options = {
                fileKey: "image",
                fileName: "image.jpg",
                chunkedMode: false,
                mimeType: "image/*",
            };
            $scope.mediaData.push({
                src: imageData
            });
        }, function(err) {
        })
    };
    
    $scope.perameter=function()
    {
        cordova.plugins.diagnostic.getCameraAuthorizationStatus({
            successCallback: function(status) {
                if(status === cordova.plugins.diagnostic.permissionStatus.GRANTED)
                {
                    $scope.openGallary();
                }
                else
                {
                    cordova.plugins.diagnostic.requestCameraAuthorization({
                        successCallback: function(data_status)
                        {
                            if(data_status != 'DENIED')
                            {
                                $scope.openGallary();
                            }
                        },
                        errorCallback: function(error)
                        {
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
    
    $scope.openGallary = function()
    {
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
            
        }, function(error) {
            console.log('Error: ' + JSON.stringify(error));    // In case of error
        });
    }
    
    $scope.delete_img = function(index)
    {
        console.log("index");
        console.log(index);
        $scope.mediaData.splice(index,1);
    }
    
    
    $scope.submitExpense = function()
    {
        console.log($scope.expense.travelPlanId);
        
        $scope.expense.billImage = $scope.mediaData;
        $scope.expense.travel = $scope.travelInfo;
        $scope.expense.hotel = $scope.hotelInfo;
        $scope.expense.food = $scope.foodInfo;
        $scope.expense.localConv = $scope.localConvInfo;
        $scope.expense.miscExp = $scope.miscExpInfo;
        
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        myRequestDBService.submitExpense($scope.expense).then(function (resp)
        {
            $ionicLoading.hide();
            console.log(resp);
            
            $scope.uploadBills(resp.data.expenseId);
            
            $state.go('tab.expense');
            
        }, function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });
        
        
        
    }
    
    
    $scope.goToAddExp = function(travelId)
    {
        console.log(travelId);
        $scope.travelIdForExp = travelId;
        myAllSharedService.expense.travelPlanId = travelId;
        $state.go('tab.expense-add');
    }
    
    $scope.goToExpDetail = function(expenseId)
    {
        console.log(expenseId);
        $scope.getExpenseDetail(expenseId);
    }
    
    $scope.uploadBills = function(expenseId)
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
                console.log(expenseId);
                
                $cordovaFileTransfer.upload(serverURL+"/App_Expense/expenseImage?id="+expenseId, $scope.mediaData[i].src, options)
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
    }
    
    $scope.updateBills = function(expenseId)
    {
        $scope.uploadBills(expenseId);
        $scope.getExpenseDetail(expenseId);
    }
    
    $scope.changeStatus = function(statusType,approval_id)
    {
        $scope.data.statusModel.show();
        $scope.data.statusType = statusType;
        $scope.data.approval_id = approval_id;
    }
    
    if($location.path() == '/tab/travel-detail')
    {
        $ionicPopover.fromTemplateUrl('add-status', {
            scope: $scope,
        }).then(function(popovers) {
            $scope.data.statusModel = popovers;
        });
        
        myAllSharedService.expense.detail_type = 'plan';
        $scope.detail_type = 'plan';
    }
    
    $scope.saveStatus = function(travelPlanId)
    {
        
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        $scope.travelStatus.travelPlanId = travelPlanId;
        $scope.travelStatus.statusType = $scope.data.statusType;
        $scope.travelStatus.approval_id = $scope.data.approval_id;
        
        console.log($scope.travelStatus);
        
        myRequestDBService.saveStatus($scope.travelStatus).then(function (resp)
        {
            $ionicLoading.hide();
            console.log(resp);
            
            $scope.data.statusModel.hide();
            $scope.travelStatus = {};
            $scope.getTravelPlanDetail(travelPlanId);
        }, function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });
    }
    
    $scope.changeExpStatus = function(statusType)
    {
        $scope.data.expStatusModel.show();
        $scope.data.expStatusType = statusType;
    }
    
    if($location.path() == '/tab/expense-detail')
    {
        $ionicPopover.fromTemplateUrl('add-status', {
            scope: $scope,
        }).then(function(popovers) {
            $scope.data.expStatusModel = popovers;
        });
    }
    
    $scope.saveExpStatus = function(expenseId)
    {
        $scope.expStatus.expenseId = expenseId;
        $scope.expStatus.statusType = $scope.data.expStatusType;
        
        myRequestDBService.saveExpStatus($scope.expStatus).then(function (resp)
        {
            $ionicLoading.hide();
            console.log(resp);
            $scope.data.expStatusModel.hide();
            $scope.expStatus = {};
            $scope.getExpenseDetail(expenseId);
        }, function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });
    }
    
    
    $scope.expEditType = myAllSharedService.expense.expEditType;
    $scope.expenseId = myAllSharedService.expense.expenseId;
    
    $scope.goToExpEdit = function(expenseType, expenseId)
    {
        $scope.expEditType = expenseType;
        myAllSharedService.expense.expEditType = expenseType;
        myAllSharedService.expense.expenseId = expenseId;
        $state.go('tab.expense-edit');
    }
    
    if($location.path() == '/tab/expense-edit')
    {
        $scope.getTravelModes();
    }
    
    $scope.calculateEditTravelAmount = function()
    {
        if($scope.expEditLocalConv.travelClass == 'Car')
        {
            $scope.expEditLocalConv.amount = parseInt($scope.expEditLocalConv.distance) * parseInt($scope.travelMode.car);
        }
        
        if($scope.expEditLocalConv.travelClass == 'Bike')
        {
            $scope.expEditLocalConv.amount = parseInt($scope.expEditLocalConv.distance) * parseInt($scope.travelMode.bike);
        }
    }
    
    $scope.EditExpense = function(expType)
    {
        if(expType == 'travel')
        {
            if($scope.expEditTravel.arrivalDate) $scope.expEditTravel.arrivalDate = moment($scope.expEditTravel.arrivalDate).format('YYYY-MM-DD');
            if($scope.expEditTravel.arrivalTime) $scope.expEditTravel.arrivalTime = moment($scope.expEditTravel.arrivalTime).format('h:mm a');
            if($scope.expEditTravel.depatureDate) $scope.expEditTravel.depatureDate = moment($scope.expEditTravel.depatureDate).format('YYYY-MM-DD');
            if($scope.expEditTravel.depatureTime) $scope.expEditTravel.depatureTime = moment($scope.expEditTravel.depatureTime).format('h:mm a');
            $scope.expEditData = $scope.expEditTravel;
        }
        else if(expType == 'hotel')
        {
            if($scope.expEditHotel.checkInDate) $scope.expEditHotel.checkInDate = moment($scope.expEditHotel.checkInDate).format('YYYY-MM-DD');
            if($scope.expEditHotel.checkOutDate) $scope.expEditHotel.checkOutDate = moment($scope.expEditHotel.checkOutDate).format('YYYY-MM-DD');
            $scope.expEditData = $scope.expEditHotel;
        }
        else if(expType == 'food')
        {
            if($scope.expEditFood.date) $scope.expEditFood.date = moment($scope.expEditFood.date).format('YYYY-MM-DD');
            $scope.expEditData = $scope.expEditFood;
        }
        else if(expType == 'localConv')
        {
            if($scope.expEditLocalConv.date) $scope.expEditLocalConv.date = moment($scope.expEditLocalConv.date).format('YYYY-MM-DD');
            $scope.expEditData = $scope.expEditLocalConv;
        }
        else if(expType == 'miscExp')
        {
            if($scope.expEditMiscExp.date) $scope.expEditMiscExp.date = moment($scope.expEditMiscExp.date).format('YYYY-MM-DD');
            $scope.expEditData = $scope.expEditMiscExp;
        }
        
        myRequestDBService.EditExpense($scope.expEditData,expType,$scope.expenseId).then(function (resp)
        {
            $ionicLoading.hide();
            console.log(resp);
            
            $scope.expEditTravel = {};
            $scope.expEditHotel = {};
            $scope.expEditFood = {};
            $scope.expEditLocalConv = {};
            $scope.expEditMiscExp = {};
            $scope.expEditData = {};
            
            $state.go('tab.expense');
        }, function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });
    }
    
    let fetchingRecords = false;
    
    $scope.onGetSearchSelectDataHandler = function (type_info, searchKey, pagenumber)
    {
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
                console.log($scope.districtList);
            }
            
            fetchingRecords = false;
            
            console.log($scope.stateList);
            
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
            
            // $scope.search.districtName = { Key: "Select District Name", Value: "" };
            $scope.search.districtName = [];
            $scope.districtList = [];
            $scope.Allcities = [];
            $scope.onGetSearchSelectDataHandler('fetchDistrictData', '', 1);
        }
    });
    
    
    
    if($location.path() == '/tab/travel-add' || $location.path() == '/tab/travel-edit')
    {
        if($location.path() == '/tab/travel-add')
        {
            $scope.travelData = [];
            $scope.travel = {};
            $scope.group_by_date($scope.travelData);
        }
        $scope.getDistributorData();
        $scope.search.stateName = { Key: "Select State Name *", Value: "" };
        $scope.search.districtName = { Key: "Select District Name *", Value: "" };
        $scope.onGetSearchSelectDataHandler('fetchStateData', '', 1);
        console.log("Travel Add");
        
        console.log($scope.search.stateName);
    }
    
    $ionicPopover.fromTemplateUrl('travel-popover.html', {
        scope: $scope,
    }).then(function(popovers) {
        $scope.popovers = popovers;
    });
    
    $scope.onShowModel = function($event, modelType)
    {
        $scope.data.modelType = modelType;
        $scope.popovers.show($event);
    }
    
    $scope.goToPlan = function(planType)
    {
        myAllSharedService.expense.modelPlanType = planType;
        $rootScope.modelPlanType = planType;
        
        if($scope.data.modelType == 'travel') $scope.getTravelList('Pending');
        if($scope.data.modelType == 'expense') $scope.getExpenseList('Pending');
        $scope.popovers.hide();
    }
    
    $scope.goToBackPage = function()
    {
        $ionicHistory.goBack();
    }
    
    $scope.Allcities = [];
    $scope.get_cities = function()
    {
        $scope.search.city = [];
        $scope.Allcities = [];
        console.log($scope.search.districtName);
        myRequestDBService.get_cities($scope.search.districtName)
        .then(function (resp)
        {
            $scope.Allcities = resp.cities;
            console.log($scope.Allcities);
            $ionicLoading.hide();
        }, function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });
    }
    
    $scope.search.districtName = [];
    
    $scope.select_mul_district = function (data)
    {
        var idx = $scope.search.districtName.findIndex(row=>row == data.Key);
        if(idx == -1)
        {
            $scope.search.districtName.push(data.Key);
        }
        else
        {
            $scope.search.districtName.splice(idx,1);
        }
        $scope.get_cities();
    };
    
    $scope.remove_mul_district = function (data)
    {
        var idx = $scope.search.districtName.indexOf(data);
        $scope.search.districtName.splice(idx,1);
        $scope.get_cities();
    };
    
    $scope.search.city = [];  
    $scope.selectedCity = []  ;
    $scope.select_mul_city = function (data)
    {
        var idx = $scope.search.city.findIndex(row=>row == data.Key);
        if(idx == -1)
        {
            $scope.search.city.push(data.Key);
        }
        else
        {
            $scope.search.city.splice(idx,1);
        }
        
        var idx2 = $scope.selectedCity.findIndex(row=>row.city == data.Key);
        if(idx2 == -1)
        {
            $scope.selectedCity.push({"state":data.state_name,"district":data.district_name,"city":data.Key});
        }
        else
        {
            $scope.selectedCity.splice(idx2,1);
        }
    };
    
    $scope.remove_mul_city = function (data)
    {
        console.log(data);
        var idx = $scope.search.city.indexOf(data);
        $scope.search.city.splice(idx,1);
        $scope.selectedCity.splice(idx,1);
    };
    
    $scope.search.drName = [];
    $scope.selectedDr = [];
    $scope.select_mul_dr = function(data)
    {
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
    
    $scope.remove_mul_district = function (data)
    {
        var idx = $scope.search.drName.indexOf(data);
        $scope.search.drName.splice(idx,1);
        $scope.selectedDr.splice(idx,1);
    };
    
    $scope.All_distributors = [];
    $scope.get_distributor = function()
    {
        $scope.search.drName = [];
        $scope.All_distributors = [];
        console.log($scope.search.districtName);
        myRequestDBService.getDistributorData()
        .then(function (resp)
        {
            $scope.All_distributors = resp.data;
            console.log($scope.All_distributors);
            $ionicLoading.hide();
        }, function (err)
        {
            $ionicLoading.hide();
            console.error(err);
        });
    }
})





