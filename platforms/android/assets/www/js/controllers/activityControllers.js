app.controller('activityCtrl', function ($scope, $rootScope, searchSelect, $state, myRequestDBService, myAllSharedService, $ionicLoading, $cordovaSQLite, $ionicPopup, $ionicScrollDelegate, $timeout, $ionicActionSheet, $cordovaImagePicker, Camera, $cordovaFileTransfer, $cordovaGeolocation, $cordovaToast, $location, $window, $ionicPlatform, $ionicHistory, $ionicModal,$stateParams, $ionicScrollDelegate, $ionicPopover) {
    
    $scope.loginData = myAllSharedService.loginData;
    $scope.isRequestInProcess;
    $scope.followUpList = [];
    $scope.checkInList = [];
    $scope.drTypeList = [];
    $scope.drList = [];
    
    $scope.activityIdData = {};
    
    $scope.data = {};
    $scope.data.isInsideLead = myAllSharedService.drTypeFilterData.isInsideLead;
    
    $scope.search = {};
    $scope.form = {};
    
    $scope.currentPage = 1;
    $scope.pageSize = 5;
    //   $scope.getLeadCategory();
    $scope.currentDate = moment().format('YYYY-MM-DD');
    $scope.selectedDate = moment().format('YYYY-MM-DD');
    
    $scope.isSearchBarOpen = false;
    
    
    $scope.currentActiveTabForActivity =  myAllSharedService.drTypeFilterData.currentActiveTabForActivity ? myAllSharedService.drTypeFilterData.currentActiveTabForActivity : 1;
    
    $scope.currentActiveTabForFollowUp = myAllSharedService.drTypeFilterData.currentActiveTabForFollowUp ? myAllSharedService.drTypeFilterData.currentActiveTabForFollowUp : 1;
    
    console.log(myAllSharedService.drTypeFilterData.currentActiveTabForActivity);
    
    $scope.noMoreListingAvailable = false;
    
    
    $scope.goToNetworkDetail = function(drId)
    {
        myAllSharedService.drTypeFilterData.drId = drId;
        $state.go('tab.network-detail');
    }
    
    $scope.checkNetworkType = function()
    {
        console.log($scope.data.networkType);
        
        $scope.drList = [];
        
        if($scope.data.networkType==2)
        {
            $scope.drTypeList = [{id:12,type:'Dealer'},{id:6,type:'Distributor'},];
        }
        else
        {
            $scope.getDrAllTypeData();
        }
    }
    
    $scope.onActivateGPSLocationForActivityHandler = function()
    {
        
        if($location.path() == '/tab/add-activity' && (!$scope.search.drName || !$scope.search.drName.Value))
        {
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Company Name Required!'
            });
            return false;
        }
        
        console.log("In Function");
        
        $ionicPopup.confirm({
            
            title: 'Are You Sure, You Want to Save Activity ?',
            buttons: [{
                
                text: 'YES',
                type: 'button-block button-outline button-stable',
                onTap: function (e) {
                    
                    $ionicLoading.show({
                        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
                    });
                    
                    if($scope.data.activityType == 'Meeting' || $location.path() == '/tab/activity-meeting-end')
                    {
                        console.log("in if");
                        // if (ionic.Platform.isAndroid()) 
                        // {
                        cordova.plugins.locationAccuracy.request(function (success)
                        {
                            console.log("error");
                            var options = {
                                maximumAge: 5000,
                                timeout: 10000,
                                enableHighAccuracy: true
                            };
                            $cordovaGeolocation.getCurrentPosition(options).then(function (position)
                            {
                                if($location.path() == '/tab/activity-meeting-end')
                                {
                                    $scope.onSaveVisitEndHandler(position.coords.latitude, position.coords.longitude);
                                }
                                else
                                {
                                    $scope.onSaveActivityHandler(position.coords.latitude, position.coords.longitude);
                                }
                            }, function (error) {
                                
                                if($location.path() == '/tab/activity-meeting-end')
                                {
                                    $scope.onSaveVisitEndHandler('', '');
                                }
                                else
                                {
                                    $scope.onSaveActivityHandler('', '');
                                }
                                console.log("Could not get location");
                            });
                        }, function (error) {
                            console.log("error");
                            $ionicLoading.hide();
                            $ionicPopup.alert({
                                title: 'Error!',
                                template: 'To continue, Activate GPS Location!'
                            });
                        }, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
                    }
                    else
                    {
                        console.log("else in if");
                        $ionicLoading.hide();
                        $scope.onSaveActivityHandler('', '');
                        
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
    
    $scope.onSaveActivityHandler = function (lat, lng) {
        
        const isIndex = $scope.drTypeList.findIndex(row => row.id == $scope.data.typeId);
        console.log(isIndex);
        
        if(isIndex != -1)
        {
            $scope.data.typeName = $scope.drTypeList[isIndex].type;
        }
        $scope.data.drId = $scope.search.drName.Value;
        
        $scope.data.lat = lat;
        $scope.data.lng = lng;
        
        if($scope.data.isFollowUp) {
            
            $scope.data.followUpDateInFormat = moment($scope.data.followUpDate).format('YYYY-MM-DD');
            
        } else {
            
            $scope.data.followUpDateInFormat = '';
            
        }
        
        console.log($scope.data);
        
        myRequestDBService.onSaveActivityHandler($scope.data)
        .then(function (result)
        {
            console.log(result);
            $ionicLoading.hide();
            
            if(result.status == 'error') {
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: result.statusMessage
                });
                
            } else {
                
                $ionicHistory.goBack();
                
                
                $cordovaToast.show('Saved Successfully', 'short', 'bottom').then(function (success) {
                    
                }, function (error) {
                    
                });
                
                myAllSharedService.drTypeFilterData.checkInList = '';
                myAllSharedService.drTypeFilterData.followUpList = '';
                
            }
            
        }, function (err) {
            
            console.error(err);
            $ionicLoading.hide();
        })
    }
    
    
    $scope.onSaveVisitEndHandler = function (lat, lng) 
    {
        
        $scope.data.lat = lat;
        $scope.data.lng = lng;
        
        if($scope.data.isFollowUp) {
            
            $scope.data.followUpDateInFormat = moment($scope.data.followUpDate).format('YYYY-MM-DD');
            
        } else {
            
            $scope.data.followUpDateInFormat = '';
            $scope.data.followUpType = '';
        }
        
        myRequestDBService.onSaveVisitEndHandler($scope.data).then(function (result) {
            
            console.log(result);
            $ionicLoading.hide();
            
            if(result.status == 'error') {
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: result.statusMessage
                });
                
            } else {
                
                myAllSharedService.drTypeFilterData.checkInList = '';
                myAllSharedService.drTypeFilterData.followUpList = '';
                
                $state.go('tab.all-activity-list');
                
            }
            
        }, function (err) {
            
            console.error(err);
            $ionicLoading.hide();
        })
    }
    
    
    $scope.onSaveFollowUpHandler = function () {
        console.log($scope.search);
        
        
        if(!$scope.search.drName || !$scope.search.drName.Value) {
            
            $ionicPopup.alert({
                title: 'Error!',
                template: 'result.statusMessage'
            });
            
            return false;
        }
        
        $ionicPopup.confirm({
            
            title: 'Are You Sure, You Want to Start FollowUp ?',
            buttons: [{
                
                text: 'YES',
                type: 'button-block button-outline button-stable',
                onTap: function (e) {
                    
                    $ionicLoading.show({
                        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
                    });
                    
                    if(($scope.data.followUpId && $scope.data.followUpId != '0') || $scope.data.isInsideLead == 'Yes') {
                        
                        $scope.data.typeName = '';
                        
                    } else {
                        
                        const isIndex = $scope.drTypeList.findIndex(row => row.id == $scope.data.typeId);
                        
                        $scope.data.typeName = $scope.drTypeList[isIndex].type;
                        $scope.data.drId = $scope.search.drName.Value;
                    }
                    
                    
                    
                    $scope.data.followUpDateInFormat = moment($scope.data.followUpDate).format('YYYY-MM-DD');
                    
                    myRequestDBService.onSaveFollowUpHandler($scope.data).then(function (result) {
                        
                        console.log(result);
                        $ionicLoading.hide();
                        
                        if(result.status == 'error') {
                            
                            $ionicPopup.alert({
                                title: 'Error!',
                                template: result.statusMessage
                            });
                            
                        } else {
                            
                            $cordovaToast.show('Saved Successfully', 'short', 'bottom').then(function (success) {
                                
                            }, function (error) {
                                
                            });
                            
                            myAllSharedService.drTypeFilterData.checkInList = '';
                            myAllSharedService.drTypeFilterData.followUpList = '';
                            
                            $ionicHistory.goBack();
                            
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
    
    
    $scope.getDrAllTypeData = function ()  {
        
        myRequestDBService.getDrAllTypeData().then(function(result) {
            
            console.log(result);
            
            $scope.drTypeList = result.allTypeData;
            console.log($scope.drTypeList);
            
            $scope.drList = [];
            
        }, function (err) {
            
            console.error(err);
        });
    }
    
    
    let fetchingRecords = false;
    $scope.onGetDrTypeDataHandler = function (type_info, searchKey, pagenumber) {
        
        if(!searchKey) {
            
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
            });
        }
        
        if (fetchingRecords) return;
        fetchingRecords = true;
        
        var targetArr = {  typeId: $scope.data.typeId,
            typeName: $scope.data.typeName,
            loginData: $scope.loginData,
            searchData: searchKey,
            networkType: $scope.data.networkType,
            start: pagenumber,
            pageLimit: 40
        };
        
        console.log(targetArr);
        
        searchSelect.onGetDrTypeDataHandler(targetArr, searchKey, pagenumber)
        .then(function (result)
        {
            $ionicLoading.hide();
            console.log(result);
            $scope.totalDrRecords = 0;
            $scope.drList = result.leadData;
            
            for (let index = 0; index < $scope.drList.length; index++)
            {
                let drName = $scope.drList[index].dr_name;
                if($scope.drList[index].dr_code)  {
                    drName += ' (' + $scope.drList[index].dr_code + ')';
                }
                
                $scope.drList[index].contact_mobile_no =   $scope.drList[index].contact_mobile_no ?  $scope.drList[index].contact_mobile_no: $scope.drList[index].sfa_contact_no;
                
                $scope.drList[index].Key = drName  + ' - (' + $scope.drList[index].contact_mobile_no + ')';
                $scope.drList[index].Value = $scope.drList[index].id;
            }
            
            /* We Don't want to give other option in case of followup Add, So this condition applies!  */
            
            if($location.path() == '/tab/add-activity') {
                
                $scope.drList.push({
                    Key: 'Other',
                    Value: 'Other'
                });
            }
            fetchingRecords = false;
        }, function (errorMessage) {
            console.log(errorMessage);
            window.console.warn(errorMessage);
            fetchingRecords = false;
            if(!searchKey) {
                $ionicLoading.hide();
            }
        });
    };
    
    
    $scope.onDrTypeChangeHandler = function() {
        
        const isIndex = $scope.drTypeList.findIndex(row => row.id == $scope.data.typeId);
        const typeName = $scope.drTypeList[isIndex].type;
        $scope.data.typeName = typeName;
        
        $scope.search.drName = { Key: "Select " + typeName + ' *', Value: "" };
        $scope.onGetDrTypeDataHandler('', '', 1);
    }
    
    
    $scope.$watch('search.drName', function (newValue, oldValue) {
        
        if (newValue && newValue.Value && newValue.Value != oldValue.Value) {
            
            console.log('Go');
            console.log($scope.search.drName);
            
            if($scope.search.drName.Value == 'Other') {
                $scope.data.status = '';
            } else {
                $scope.data.status = $scope.search.drName.status;
            }
        }
    });
    
    
    $scope.onGetActivityIdDataHandler = function()
    {
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
        });
        
        myRequestDBService.onGetActivityIdDataHandler($scope.data.activityId)
        .then(function(result)
        {
            console.log(result);
            $ionicLoading.hide();
            
            $scope.activityIdData = result.activityData;
            $scope.data.drId = result.activityData.dr_id;
            console.log($scope.activityIdData);
            
        }, function (err) {
            
            console.error(err);
            $ionicLoading.hide();
        });
    }
    
    
    $scope.getCheckInListData = function(targetSRC) {
        
        if(!$scope.data.search && targetSRC != 'scroll') {
            
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
            });
        }
        $scope.isRequestInProcess = true;
        
        myRequestDBService.getCheckInListData($scope.currentActiveTabForActivity, $scope.selectedDate, $scope.data.search, $scope.currentPage, $scope.pageSize)
        .then(function(response)
        {
            console.log(response);
            
            const result = response.checkInData;
            myAllSharedService.drTypeFilterData.canNewMeetingStart = response.canNewMeetingStart;
            myAllSharedService.drTypeFilterData.activityId = response.activityId;
            myAllSharedService.drTypeFilterData.drName = response.drName;
            myAllSharedService.drTypeFilterData.drId = response.drId;
            myAllSharedService.drTypeFilterData.lead = response.lead;
            $scope.data.canNewMeetingStart = response.canNewMeetingStart;
            $scope.data.activityId = response.activityId;
            $scope.data.drName = response.drName;
            
            console.log(result);
            
            if(!$scope.data.search && targetSRC != 'scroll') {
                $ionicLoading.hide();
            }
            
            for (let index = 0; index < result.length; index++) {
                
                const isExist = $scope.checkInList.findIndex(row => row.id == result[index].id);
                if(isExist === -1) {
                    $scope.checkInList = $scope.checkInList.concat(result);
                }
            }
            
            myAllSharedService.drTypeFilterData.checkInList = $scope.checkInList;
            myAllSharedService.drTypeFilterData.checkInSelectedDate = $scope.selectedDate;
            
            $scope.isRequestInProcess = false;
            
            if(targetSRC == 'onLoad' || targetSRC == 'onRefresh') {
                $scope.onPageScrollTopHandler();
            }
            
            if(targetSRC == 'scroll') {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
            
            if(targetSRC == 'onRefresh') {
                
                $scope.$broadcast('scroll.refreshComplete');
                
                $cordovaToast.show('Refreshed Successfully', 'short', 'bottom').then(function (success) {
                    
                }, function (error) {
                    
                });
            }
            
            if(!result || result.length == 0) {
                $scope.noMoreListingAvailable = true;
            }
            
            console.log($scope.checkInList);
            
            $scope.currentPage += 1;
            
        }, function (err) {
            
            $ionicLoading.hide();
            $scope.isRequestInProcess = false;
            console.error(err);
        });
    }
    
    $scope.getFollowUpListData = function(targetSRC) {
        
        if(!$scope.data.search && targetSRC != 'scroll') {
            
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
            });
        }
        
        $scope.isRequestInProcess = true;
        
        myRequestDBService.getFollowUpListData($scope.currentActiveTabForFollowUp, $scope.selectedDate, $scope.data.search, $scope.currentPage, $scope.pageSize)
        .then(function(response)
        {
            
            console.log(response);
            
            const result = response.followUpData;
            
            console.log(result);
            
            if(!$scope.data.search && targetSRC != 'scroll') {
                $ionicLoading.hide();
            }
            
            for (let index = 0; index < result.length; index++) {
                
                const isExist = $scope.followUpList.findIndex(row => row.id == result[index].id);
                if(isExist === -1) {
                    $scope.followUpList = $scope.followUpList.concat(result);
                }
            }
            
            myAllSharedService.drTypeFilterData.followUpList = $scope.followUpList;
            myAllSharedService.drTypeFilterData.followUpSelectedDate = $scope.selectedDate;
            
            $scope.isRequestInProcess = false;
            
            if(targetSRC == 'onLoad' || targetSRC == 'onRefresh') {
                $scope.onPageScrollTopHandler();
            }
            
            if(targetSRC == 'scroll') {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
            
            if(targetSRC == 'onRefresh') {
                
                $scope.$broadcast('scroll.refreshComplete');
                
                $cordovaToast.show('Refreshed Successfully', 'short', 'bottom').then(function (success) {
                    
                }, function (error) {
                    
                });
            }
            
            if(!result || result.length == 0) {
                $scope.noMoreListingAvailable = true;
            }
            
            $scope.currentPage += 1;
            
        }, function (err) {
            
            $ionicLoading.hide();
            $scope.isRequestInProcess = false;
            console.error(err);
        });
    }
    
    $scope.allPJP_List = [];
    $scope.tmpPJPList = [];
    
    $scope.getAllPJP_List = function(date)
    {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        date = moment(date).format('YYYY-MM-DD');
        
        myRequestDBService.onGetPostRequest('/App_Expense/get_pjp_list/'+date,'')
        .then(function(response) {
            
            $ionicLoading.hide();
            
            console.log(response);
            $scope.allPJP_List = response.data;
            $scope.tmpPJPList = $scope.allPJP_List
            
            myAllSharedService.drTypeFilterData.canNewMeetingStart = response.meeting.canNewMeetingStart;
            myAllSharedService.drTypeFilterData.activityId = response.meeting.activityId;
            myAllSharedService.drTypeFilterData.drName = response.meeting.drName;
            myAllSharedService.drTypeFilterData.drId = response.meeting.drId;
            $scope.data.canNewMeetingStart = response.meeting.canNewMeetingStart;
            $scope.data.activityId = response.meeting.activityId;
            $scope.data.drName = response.meeting.drName;
            
            
        }, function (err) {
            $ionicLoading.hide();
            
            
            console.error(err);
        });
    }
    
    
    $scope.PJP_List_Filter = function(search)
    {
        search = search.toLowerCase();
        
        console.log(search);
        
        $scope.allPJP_List = $scope.tmpPJPList.filter(row=>row.drName.toLowerCase().includes(search) || row.mobile_no.toLowerCase().includes(search) || row.status.toLowerCase().includes(search) || row.type_name.toLowerCase().includes(search));
        
    }
    
    
    $scope.onGetActivityTypesHandler = function() {
        
        myRequestDBService.onGetActivityTypesHandler()
        .then(function(response)
        {
            console.log(response);
            $scope.activityTypeList = response.typeList;
        }, function (err)
        {
            console.error(err);
        });
    }
    
    $scope.getDrAllStatusData = function()
    {
        myRequestDBService.getDrAllStatusData()
        .then(function(response)
        {
            console.log(response);
            $scope.statusList = response.allStatusData;
        }, function (err)
        {
            console.error(err);
        });
    }
    
    $scope.leadCategory = [];
    
    $scope.getLeadCategory = function()
    {
        
        myRequestDBService.onGetPostRequest('/App_Checkin/getLeadCategory','').then(function(response) {
            
            console.log(response);
            
            $scope.leadCategory = response.category;
            
        }, function (err) {
            
            console.error(err);
        });
        
    }
    
    
    $scope.onSaveFollowUpRemarkHandler = function() {
        
        if(!$scope.data.remark) {
            
            return false;
            
        } else {
            
            $scope.data.remarkModel.hide();
            
            setTimeout(() => {
                
                $ionicPopup.confirm({
                    
                    title: 'Are You Sure, You Want to Save Remark ?',
                    buttons: [{
                        
                        text: 'YES',
                        type: 'button-block button-outline button-stable',
                        onTap: function (e) {
                            
                            $ionicLoading.show({
                                template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
                            });
                            
                            myRequestDBService.onSaveFollowUpRemarkHandler($scope.data.followUpId, $scope.data.remark).then(function(response) {
                                
                                $ionicLoading.hide();
                                
                                $scope.followUpList = [];
                                $scope.getFollowUpListData('onLoad');
                                
                                setTimeout(() => {
                                    
                                    $ionicPopup.alert({
                                        title: 'Success!',
                                        template: 'FollowUp Closed Successfully!'
                                    });
                                    
                                }, 500);
                                
                            }, function (err) {
                                
                                console.error(err);
                                $ionicLoading.hide();
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
                
            });
            
        }
    }
    
    
    
    $scope.getDistributionNetworkData = function()
    {
        console.log($scope.data);
        
    }
    
    
    
    $scope.getDrDetailData = function(drId)
    {
        console.log(drId);
        myRequestDBService.getDrDetailData(drId)
        .then(function(response)
        {
            console.log(response);
            $scope.drDetail = response;
            myAllSharedService.drTypeFilterData.drDetail = JSON.parse(JSON.stringify( $scope.drDetail));
            
            $scope.data.typeId = $scope.drDetail.drData.type_id;
            
            if($location.path() != '/tab/followup-add') {
                
                $scope.data.followUpType = $scope.drDetail.nextFollowUpData.followup_type;
                $scope.data.followUpDate = new Date($scope.drDetail.nextFollowUpData.followup_date);
                $scope.data.description = $scope.drDetail.nextFollowUpData.followup_remark;
            }
            
            $scope.data.drId = drId;
            $scope.search.drName = { Key: $scope.drDetail.drData.dr_name, Value: $scope.drDetail.drData.id };
            
            $scope.data.status = $scope.drDetail.drData.status;
            $scope.data.category = $scope.drDetail.drData.category;
            $scope.getStatusReason($scope.data.status);
        },function (err)
        {
            console.error(err);
        });
    }
    
    
    if($location.path() == '/tab/all-activity-list') {
        
        // if(myAllSharedService.drTypeFilterData.checkInList) {
        
        //     $scope.checkInList = myAllSharedService.drTypeFilterData.checkInList;
        //     $scope.selectedDate = myAllSharedService.drTypeFilterData.checkInSelectedDate;
        
        // } else {
        
        $scope.getCheckInListData('onLoad');
        // }
    }
    
    
    if($location.path() == '/tab/all-followup-list') {
        
        // if(myAllSharedService.drTypeFilterData.followUpList) {
        
        //     $scope.followUpList = myAllSharedService.drTypeFilterData.followUpList;
        //     $scope.selectedDate = myAllSharedService.drTypeFilterData.followUpSelectedDate;
        
        
        // } else {
        
        $scope.getFollowUpListData('onLoad');
        // }
    }
    
    
    if($location.path() == '/tab/add-activity' || $location.path()  == '/tab/activity-meeting-end')
    {
        console.log(myAllSharedService.drTypeFilterData);
        
        $scope.data.canNewMeetingStart = myAllSharedService.drTypeFilterData.canNewMeetingStart;
        $scope.data.activityId = myAllSharedService.drTypeFilterData.activityId;
        $scope.data.drName = myAllSharedService.drTypeFilterData.drName;
        $scope.data.drId = myAllSharedService.drTypeFilterData.drId;
        $scope.data.lead = myAllSharedService.drTypeFilterData.lead;
        
        console.log($scope.data);
        if($location.path() == '/tab/add-activity' && myAllSharedService.drTypeFilterData.isInsideLead == 'No') {
            
            $scope.data.followUpId = myAllSharedService.drTypeFilterData.followUpId;
            $scope.data.drId = myAllSharedService.drTypeFilterData.drId;
            $scope.data.networkType = '1';
            
            $scope.getDrAllTypeData();
            $scope.onGetActivityTypesHandler();
            $scope.getDrAllStatusData();
            $scope.getLeadCategory();
            
            
        }
        else if($location.path() == '/tab/add-activity' && myAllSharedService.drTypeFilterData.isInsideLead == 'Yes')
        {
            $scope.data.followUpId = myAllSharedService.drTypeFilterData.followUpId;
            $scope.data.drId = myAllSharedService.drTypeFilterData.drId;
            
            if(myAllSharedService.drTypeFilterData.isFromPJP)
            {
                $scope.data.activityType = myAllSharedService.drTypeFilterData.action;
                $scope.data.isFromPJP = true;
                $scope.data.pjp_id = myAllSharedService.drTypeFilterData.pjpID;
            }
            
            $scope.getDrAllTypeData();
            $scope.getDrDetailData($scope.data.drId);
            $scope.onGetActivityTypesHandler();
            $scope.getDrAllStatusData();
            $scope.getLeadCategory();
            
        }
        else if($location.path() == '/tab/activity-meeting-end')
        {
            
            $scope.onGetActivityIdDataHandler();
            $scope.getDrDetailData($scope.data.drId);
            $scope.onGetActivityTypesHandler();
            $scope.getDrAllStatusData();
        }
        
    }
    
    
    if($location.path() == '/tab/followup-add') {
        
        $scope.data.followUpId = myAllSharedService.drTypeFilterData.followUpId;
        $scope.data.drId = myAllSharedService.drTypeFilterData.drId;
        $scope.data.networkType = '1';
        
        console.log($scope.data.followUpId);
        if(myAllSharedService.drTypeFilterData.isInsideLead == 'Yes')
        {
            $scope.getDrDetailData($scope.data.drId);
        }
        else
        {
            $scope.getDrAllTypeData();
        }
        
        $scope.onGetActivityTypesHandler();
    }
    
    
    $scope.activeTab = 'PJP';
    
    
    $scope.onDateChangeHandler = function(actionType, target) {
        
        if(actionType == 'previous') {
            $scope.selectedDate = moment($scope.selectedDate).subtract(1, 'days').format('YYYY-MM-DD');
        }
        
        if(actionType == 'next') {
            
            if(target == 'checkIn' && moment($scope.selectedDate).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                return false;
            }
            
            $scope.selectedDate = moment($scope.selectedDate).add(1, 'days').format('YYYY-MM-DD');
        }
        
        $scope.onSetCurrentPageHandler();
        
        if(target == 'followUp') {
            $scope.followUpList = [];
            $scope.getFollowUpListData('onLoad');
        }
        
        if(target == 'checkIn') {
            $scope.checkInList = [];
            $scope.getCheckInListData('onLoad');
        }
        
        if(target == 'PJP') {
            $scope.allPJP_List = [];
            $scope.getAllPJP_List($scope.selectedDate);
        }
    }
    
    
    $scope.onModifyTypeHandler = function(type, target) {
        
        $scope.onSetCurrentPageHandler();
        
        if(target == 'followUp') {
            
            $scope.currentActiveTabForFollowUp = type;
            myAllSharedService.drTypeFilterData.currentActiveTabForFollowUp = type;
            
            $scope.followUpList = [];
            $scope.getFollowUpListData('onLoad');
        }
        
        if(target == 'checkIn') {
            
            $scope.currentActiveTabForActivity = type;
            myAllSharedService.drTypeFilterData.currentActiveTabForActivity = type;
            
            $scope.checkInList = [];
            $scope.getCheckInListData('onLoad');
        }
    }
    
    $scope.onSeachActionHandler = function(type, target) {
        
        
        console.log(target);
        
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
    
    $scope.goToBackPageHandler = function() {
        $ionicHistory.goBack();
    }
    
    $scope.getRoundAmountHandler = function(val) {
        return val.toFixed(2);
    }
    
    $ionicPopover.fromTemplateUrl('followup-popover.html', {
        scope: $scope,
    }).then(function(popovers) {
        $scope.popovers = popovers;
    });
    
    $ionicPopover.fromTemplateUrl('PJP-popover.html', {
        scope: $scope,
    }).then(function(popovers) {
        $scope.pjp_popovers = popovers;
    });
    
    $scope.onShowFollowUpOptionModelHandler = function($event, followUpId, drId) {
        
        $scope.data.followUpId = followUpId;
        $scope.data.drId = drId;
        console.log($scope.data.followUpId);
        $scope.popovers.show($event);
    }
    
    $scope.onShowPJPModelHandler = function($event,pjp_data) {
        
        $scope.data.pjpID = pjp_data.id;
        $scope.data.pjpType = pjp_data.TravelType;
        $scope.data.networkName = pjp_data.networkName;
        $scope.data.type_name = pjp_data.type_name;
        $scope.data.drId = pjp_data.drId;
        // $scope.data.drId = drId;
        console.log($scope.data);
        
        $scope.pjp_popovers.show($event);
    }
    
    if($location.path() == '/tab/all-followup-list') {
        
        $ionicPopover.fromTemplateUrl('add-remark', {
            scope: $scope,
        }).then(function(popovers) {
            $scope.data.remarkModel = popovers;
        });
    }
    
    $scope.onGoToActionHandler = function(type)
    {
        if(type == 'addActivity')
        {
            myAllSharedService.drTypeFilterData.isInsideLead = 'No';
            myAllSharedService.drTypeFilterData.drId = '';
            myAllSharedService.drTypeFilterData.followUpId = '';
            $state.go('tab.add-activity');
        }
        else if(type == 'followUpAddRemark')
        {
            myAllSharedService.drTypeFilterData.isInsideLead = 'Yes';
            myAllSharedService.drTypeFilterData.followUpId = $scope.data.followUpId;
            myAllSharedService.drTypeFilterData.drId = $scope.data.drId;
            $scope.data.remarkModel.show();
        }
        else if(type == 'followUpAddActivity')
        {
            myAllSharedService.drTypeFilterData.isInsideLead = 'Yes';
            myAllSharedService.drTypeFilterData.followUpId = $scope.data.followUpId;
            myAllSharedService.drTypeFilterData.drId = $scope.data.drId;
            $state.go('tab.add-activity');
        }
        else if(type == 'addFollowUp')
        {
            myAllSharedService.drTypeFilterData.isInsideLead = 'No';
            myAllSharedService.drTypeFilterData.drId = '';
            myAllSharedService.drTypeFilterData.followUpId = '';
            $state.go('tab.followup-add');
        }
        else if(type == 'editFollowUp')
        {
            myAllSharedService.drTypeFilterData.isInsideLead = 'Yes';
            console.log($scope.data.followUpId);
            myAllSharedService.drTypeFilterData.followUpId = $scope.data.followUpId;
            myAllSharedService.drTypeFilterData.drId = $scope.data.drId;
            console.log(myAllSharedService.drTypeFilterData);
            
            $state.go('tab.followup-add');
        }
        
        $scope.popovers.hide();
    }
    
    
    $scope.closePJP = function(pjpType,action)
    {
        $scope.pjp_popovers.hide();
        
        console.log(pjpType,action);
        if(pjpType=='Area')
        {
            $ionicPopup.confirm({
                
                title: 'Are You Sure, You Want to Close ?',
                buttons: [{
                    
                    text: 'YES',
                    type: 'button-block button-outline button-stable',
                    onTap: function (e) {
                        $ionicLoading.show({
                            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
                        });
                        
                        myRequestDBService.onGetPostRequest('/App_Expense/closePJP/'+$scope.data.pjpID,'')
                        .then(function(response) {
                            
                            if(response.status=='Success')
                            {
                                $scope.getAllPJP_List($scope.selectedDate);
                            }
                            $ionicLoading.hide();
                            
                            
                        });
                        console.log("Yes");
                        
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
        else
        {
            
            console.log($scope.data);
            myAllSharedService.drTypeFilterData = $scope.data;
            myAllSharedService.drTypeFilterData.isInsideLead = 'Yes';
            myAllSharedService.drTypeFilterData.isFromPJP = true;
            myAllSharedService.drTypeFilterData.action = action;
            myAllSharedService.drTypeFilterData.pjpID = $scope.data.pjpID;
            
            $state.go('tab.add-activity');
        }
        
    }
    
    $scope.reasonList = [];
    
    $scope.getStatusReason = function(status)
    {
        console.log(status);
        
        myRequestDBService.onGetPostRequest('/App_Checkin/onGetStatusReasonData',status)
        .then(function(response) {
            
            console.log(response);
            $scope.reasonList = response.reason;
            
        }, function (err) {
            
            console.error(err);
        });
    }
    
    
    
    if($location.path() == '/tab/PJP') {
        
        date = new Date();
        // $scope.data.canNewMeetingStart = myAllSharedService.drTypeFilterData.canNewMeetingStart;
        
        console.log($scope.data.canNewMeetingStart);
        
        $scope.getAllPJP_List(date);
        
        $ionicPopover.fromTemplateUrl('add-remark', {
            scope: $scope,
        }).then(function(popovers) {
            $scope.data.remarkModel = popovers;
        });
    }
    
    
})







