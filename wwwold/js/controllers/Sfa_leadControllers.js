app.controller('leadController', function ($scope, $ionicModal, $location, $ionicLoading, myRequestDBService, $ionicActionSheet, $cordovaImagePicker, Camera, $cordovaFileTransfer, $cordovaGeolocation, $cordovaToast, $window, $ionicPlatform, $ionicHistory, $stateParams, $ionicScrollDelegate, $ionicPopover, myAllSharedService, $state, $ionicPopup, searchSelect) {
    $scope.goToBackPageHandler = function () {
        $ionicHistory.goBack();
    }
    
    $scope.leadListFilter = false;
    $scope.lead_filter = {};
    $scope.drDetail = {};
    
    $scope.assignLeadTypeList = [];
    $scope.getAssignDrType = function()
    {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        var parameter = { function_name: 'getAssignLeadType' };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.assignLeadTypeList = response.data;
            console.log($scope.assignLeadTypeList);
            $ionicLoading.hide();
        });
    }
    
    $scope.leadStatusList = [];
    $scope.getLeadStatus = function () {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        var parameter = { function_name: 'getLeadStatus' };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.leadStatusList = response.data;
            console.log($scope.leadStatusList);
            $ionicLoading.hide();
        });
    }
    
    $scope.filter = function (value) {
        console.log($scope.leadListFilter);
        $scope.leadListFilter = value;
        $scope.lead_filter.type = 'dr_type';
        
    }
    
    console.log('welcome in lead controler');
    $scope.noMoreListingAvailable = false;
    
    // -------Lead List---------- //
    $scope.leadListData = [];
    
    $scope.getleadlist = function () {
        
        var statusFilter = [];
        var typeFilter = [];
        
        $scope.lead_filter.count = 0;
        
        for (let i = 0; i < $scope.leadStatusList.length; i++) 
        {
            if ($scope.leadStatusList[i]['check'])
            {
                statusFilter.push($scope.leadStatusList[i]['status_name']);
            }
        }
        
        for (let j = 0; j < $scope.assignLeadTypeList.length; j++) 
        {
            if($scope.assignLeadTypeList[j]['check'])
            {
                typeFilter.push($scope.assignLeadTypeList[j]['type_id']);
            }
            
        }
        
        
        if (statusFilter.length) {
            $scope.lead_filter.count++;
        }
        if (typeFilter.length) {
            $scope.lead_filter.count++;
        }
        
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        var filter = { 'filter' :$scope.lead_filter,'status': statusFilter, 'dr_type': typeFilter};
        
        var parameter = { function_name: 'getAssignLeadList', 'filter': filter };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.leadListData = response.data;
            console.log($scope.leadListData);
            $ionicLoading.hide();
        });
    }
    
    $scope.clearFilter = function()
    {
        $scope.leadStatusList = [];
        $scope.assignLeadTypeList = [];
        $scope.lead_filter ={};
        $scope.lead_filter.activeTab = 'Today';
        $scope.getAssignDrType();
        $scope.getLeadStatus();
        $scope.getleadlist();
    }
    
    if ($location.path() == '/tab/lead-list') {
        $scope.lead_filter.activeTab = 'All';
        $scope.lead_filter.leadFor = 'My';
        $scope.getleadlist();
        $scope.getAssignDrType();
        $scope.getLeadStatus();
    }
    // -------Lead List---------- //
    
    // -------Lead Add---------- //
    $scope.requiredata = [];
    $scope.data = {};
    $scope.getleadAdd = function () {
        
        console.log($scope.data);
        
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        $scope.data.requirement = $scope.requiredata;
        var parameter = { function_name: 'saveLeadData', 'data': $scope.data };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            
            $ionicLoading.hide();
            
            if (response.status == "Success") {
                console.log('Success');
                setTimeout(() => {
                    $state.go('tab.lead-list');
                    
                    $ionicPopup.alert({
                        title: 'Success',
                        template: 'Lead Added succesfully'
                    });
                    
                }, 500);
                
            }
        });
    }
    // -------Lead add---------- //
    
    // -------Lead Edit---------- //
    // $scope.requiredata = [];
    $scope.data = {};
    $scope.getleadedit = function () {
        console.log("called");
        console.log($scope.data);
        
        $scope.data=$scope.drData;
        console.log($scope.data);
        
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        $scope.data.requirement = $scope.requiredata;
        var parameter = { function_name: 'saveLeadData', 'data': $scope.data };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            
            
            $ionicLoading.hide();
            
            if (response.status == "Success") {
                console.log('Success');
                setTimeout(() => {
                    $state.go('tab.lead-list');
                    
                    $ionicPopup.alert({
                        title: 'Success',
                        template: 'Lead Added succesfully'
                    });
                    
                }, 500);
                
            }
        });
    }
    
    
    // -------Lead Edit---------- //
    
    
    // -------Lead Detail---------- //
    $scope.dr_id;
    $scope.leadDetailData = [];
    $scope.getleadDetail = function (id) {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        var parameter = { 'function_name': 'getSelectedLeadDetail', 'dr_id': id };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $ionicLoading.hide();
            
            $scope.leadDetailData = response.data;
            if (response.lastActivityData.canNewMeetingStart == 'Yes') {
                $scope.isNewMeetingStart = true;
                myRequestDBService.activityID = 0;
            }
            else {
                $scope.isNewMeetingStart = false;
                $scope.dr_data.dr_name = response.lastActivityData.dr_name;
                myRequestDBService.activityID = response.lastActivityData.id;
            }
            console.log($scope.leadDetailData);
        });
    }
    $scope.reasign_popovers = '';

    if ($location.path() == '/tab/lead-detail') {
        $scope.getleadDetail(myRequestDBService.dr_id);
        
        // ----------Resign Lead Start-------------//
        
        $ionicPopover.fromTemplateUrl('reasign-plan', {
            scope: $scope,
        }).then(function (popovers) {
            $scope.reasign_popovers = popovers;
        });
        
        // ----------Resign Lead End-------------//
    }
    // -------Lead Detail---------- //

    $scope.reasignLeadModel = function ($event) {
        console.log("Open Popever");
        
        console.log($scope.reasign_popovers);
        
        $scope.reasign_popovers.show($event);
    }
    
    
    // -------Lead Activity List---------- //
    $scope.dr_id;
    $scope.dr_data = {};
    $scope.leadActivityData;
    $scope.isNewMeetingStart = true;
    $scope.getLeadActivityList = function (id) {
        console.log(id);
        
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        var parameter = { 'function_name': 'getDrActivityList', 'dr_id': id };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.leadActivityData = response.data;
            if (response.lastActivityData.canNewMeetingStart=='Yes')
            {
                $scope.isNewMeetingStart = true;
                myRequestDBService.activityID = 0;
            }
            else
            {
                $scope.isNewMeetingStart = false;
                $scope.dr_data.dr_name = response.lastActivityData.dr_name;
                myRequestDBService.activityID = response.lastActivityData.id;
                
            }
            console.log($scope.leadActivityData);
            $ionicLoading.hide();
        });
    }
    
    $scope.getActivityDetail = function (activityId)
    {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        var parameter = { 'function_name': 'activityDetail', 'activityId': activityId };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.leadActivityData = response.data;
            
            $ionicLoading.hide();
        });
    }
    
    if ($location.path() == '/tab/lead-activity-list') {
        
        $scope.dr_data.dr_id = myRequestDBService.dr_id;
        $scope.dr_data.dr_name = myRequestDBService.dr_name;
        $scope.dr_data.contact_mobile_no = myRequestDBService.contact_mobile_no;
        console.log($scope.dr_data);
        $scope.getLeadActivityList(myRequestDBService.dr_id);
    }
    // -------Lead Activity List---------- //
    
    // -------Lead Followup List---------- //
    $scope.dr_id;
    $scope.leadFollowupData = [];
    $scope.getLeadFollowupList = function (id) {
        
        console.log(id);
        $scope.dr_id = id;
        
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        var parameter = { 'function_name': 'getDrFollowupList', 'dr_id': id };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.leadFollowupData = response.data;
            console.log($scope.leadFollowupData);
            $ionicLoading.hide();
        });
    }
    
    if ($location.path() == '/tab/lead-followup-list') {
        $scope.dr_data.dr_id = myRequestDBService.dr_id;
        $scope.dr_data.dr_name = myRequestDBService.dr_name;
        $scope.dr_data.contact_mobile_no = myRequestDBService.contact_mobile_no;
        console.log($scope.dr_data);
        $scope.getLeadFollowupList(myRequestDBService.dr_id);
    }
    // -------Lead Followup List---------- //
    
    // -------Lead Requirements List---------- //
    $scope.dr_id;
    $scope.leadRequirementData = [];
    $scope.getLeadRequirementList = function (id) {
        
        console.log(id);
        $scope.dr_id = id;
        
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        var parameter = { 'function_name': 'getDrRequirmentList', 'dr_id': id };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.leadRequirementData = response.data;
            console.log($scope.leadRequirementData);
            $ionicLoading.hide();
        });
    }
    
    if ($location.path() == '/tab/lead-requirement-list') {
        $scope.dr_data.dr_id = myRequestDBService.dr_id;
        $scope.dr_data.dr_name = myRequestDBService.dr_name;
        $scope.dr_data.contact_mobile_no = myRequestDBService.contact_mobile_no;
        console.log($scope.dr_data);
        $scope.getLeadRequirementList(myRequestDBService.dr_id);
    }
    // -------Lead Requirements List---------- //
    
    // -------Lead Quotation List---------- //
    $scope.dr_id;
    $scope.leadQuotationData = [];
    $scope.getLeadQuotationList = function (id) {
        
        console.log(id);
        $scope.dr_id = id;
        
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        var parameter = { 'function_name': 'getDrQuotationList', 'dr_id': id };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.leadQuotationData = response.data;
            console.log($scope.leadQuotationData);
            $ionicLoading.hide();
        });
    }
    
    if ($location.path() == '/tab/lead-quotation-list') {
        $scope.dr_data.dr_name = myRequestDBService.dr_name;
        $scope.dr_data.contact_mobile_no = myRequestDBService.contact_mobile_no;
        console.log($scope.dr_data);
        $scope.getLeadQuotationList(myRequestDBService.dr_id);
    }
    // -------Lead Quotation List---------- //
    
    // -------Lead Order List---------- //
    $scope.dr_id;
    $scope.leadOrderData = [];
    $scope.getLeadOrderList = function (id) {
        
        console.log(id);
        $scope.dr_id = id;
        
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        var parameter = { 'function_name': 'getDrOrderList', 'dr_id': id };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.leadOrderData = response.data;
            console.log($scope.leadOrderData);
            $ionicLoading.hide();
        });
    }
    
    $scope.submitRequirment = function()
    {
        console.log($scope.requiredata);
        
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        $scope.data.dr_id = $scope.drDetail.dr_id;
        $scope.data.requirement = $scope.requiredata;
        
        var parameter = { 'function_name': 'submitRequirement', 'data': $scope.data };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $ionicLoading.hide();
            
            if (response.status =='Success')
            {
                $ionicPopup.alert({
                    title: 'Success',
                    template: response.message
                });
                $state.go('tab.lead-requirement-list');
            }
            else{
                $ionicPopup.alert({
                    title: 'Error!',
                    template: result.message
                });
            }
        },error=>{
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Please Check Your Internet connection'
            });
            $ionicLoading.hide();
        });
        
    }
    
    if ($location.path() == '/tab/lead-order-list') {
        $scope.dr_data.dr_id = myRequestDBService.dr_id;
        $scope.dr_data.dr_name = myRequestDBService.dr_name;
        $scope.dr_data.contact_mobile_no = myRequestDBService.contact_mobile_no;
        $scope.dr_data.type_name = myRequestDBService.type_name;
        console.log($scope.dr_data);
        $scope.getLeadOrderList(myRequestDBService.dr_id);
    }
    // -------Lead Order List---------- //
    
    
    // -------Lead Quotation Detail---------- //
    $scope.quoteDetail = [];
    $scope.getLeadQuotationDetail = function (id) {
        
        console.log(id);
        $scope.dr_id = id;
        
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        var parameter = { 'function_name': 'getSelectedQuotationDetail', 'quotation_id': id };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.quoteDetail = response.data;
            console.log($scope.quoteDetail);
            $ionicLoading.hide();
            $scope.quoteDetail.term_condition = ngSanitize.trustAsHtml($scope.quoteDetail.term_condition);
        });
    }
    
    if ($location.path() == '/tab/lead-quotation-detail') {
        $scope.getLeadQuotationDetail(myRequestDBService.quotation_id);
    }
    // -------Lead Quotation Detail---------- //
    
    // -------Lead Order Detail---------- //
    $scope.dr_id;
    $scope.leadOrderDetail = [];
    $scope.getLeadOrderDetail = function (id) {
        
        console.log(id);
        $scope.dr_id = id;
        
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        var parameter = { 'function_name': 'getSelectedOrderDetail', 'order_id': id };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.leadOrderDetail = response.data;
            console.log($scope.leadOrderDetail);
            $ionicLoading.hide();
        });
    }
    
    if ($location.path() == '/tab/order-detail') {
        $scope.getLeadOrderDetail(myRequestDBService.order_id);
    }
    // -------Lead Order Detail---------- //
    
    $scope.typeList = [];
    $scope.getLeadType = function () {
        var parameter = { 'function_name': 'getLeadType' };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.typeList = response.data;
            console.log($scope.typeList);
        });
    }
    
    $scope.ProductCategoryList = [];
    $scope.getProductCategoryList = function () {
        var parameter = { function_name: 'getProductCategoryList' };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.ProductCategoryList = response.data;
            console.log($scope.ProductCategoryList);
        });
    }
    
    $scope.ProductSubCategoryList = [];
    $scope.getProductSubCategoryList = function (category) {
        var parameter = { function_name: 'getProductSubCategory', 'category': category };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.ProductSubCategoryList = response.data;
            console.log($scope.ProductSubCategoryList);
        });
    }
    
    $scope.ProductList = [];
    $scope.getProductList = function (category, sub_category) {
        var parameter = { function_name: 'getProductList', 'category': category, 'sub_category': sub_category };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.ProductList = response.data;
            console.log($scope.ProductList);
        });
    }
    
    $scope.activityTypeList = [];
    $scope.getActivityType = function () {
        var parameter = { function_name: 'getLeadActivityType'};
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.activityTypeList = response.data;
            console.log($scope.activityTypeList);
        });
    }
    
    $scope.leadCategoryList = [];
    $scope.getLeadCategoryList = function () {
        var parameter = { function_name: 'getLeadCategory' };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.leadCategoryList = response.data;
            console.log($scope.leadCategoryList);
        });
    }
    
    
    $scope.leadStatusList = [];
    $scope.getLeadStatus = function (category) {
        var parameter = { function_name: 'getLeadStatus','category':category };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.leadStatusList = response.data;
            console.log($scope.leadStatusList);
        });
    }
    
    $scope.leadReasonList = [];
    $scope.getReason = function (status) {
        var parameter = { function_name: 'getReason', 'status': status };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.leadReasonList = response.data;
            console.log($scope.leadReasonList);
        });
    }
    
    
    $scope.productDetails = function (id) {
        console.log(id);
        var index = $scope.ProductList.findIndex(row => row.id == id);
        
        console.log(index);
        console.log($scope.ProductList);
        
        if(index != -1)
        {
            $scope.data.product_code = $scope.ProductList[index]['product_code'];
            $scope.data.product_id = $scope.ProductList[index]['id'];
            $scope.data.product_name = $scope.ProductList[index]['product_name'];
        }
        
    }
    
    
    $scope.onRequirementAddToList = function () {
        
        console.log($scope.data);
        
        $scope.requiredata.push({
            categoryName: $scope.data.category,
            subcategoryName: $scope.data.sub_category,
            productName: $scope.data.product_name,
            qty: $scope.data.qty,
            product_code: $scope.data.product_code,
            product_id: $scope.data.product_id
        });
        
        
        $scope.data.product_name = '';
        $scope.data.qty = '';
        $scope.data.product_code = '';
        $scope.data.id = '';
        
        console.log($scope.requiredata);
    }
    
    $scope.listdelete = function (i) {
        $scope.requiredata.splice(i, 1);
    }
    
    $scope.pincodeData = [];
    $scope.getPincodeAddess = function (pincode) {
        var parameter = { function_name: 'getPincodeAddress', 'pincode': pincode };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.pincodeData = response.data;
            console.log($scope.pincodeData);
            
            if (response.status == 'Success') {
                $scope.data.state_name = $scope.pincodeData.state_name;
                $scope.data.district_name = $scope.pincodeData.district_name;
                $scope.data.city = $scope.pincodeData.city;
                $scope.data.area = $scope.pincodeData.area;
            }
            else {
                $scope.data.district_name = null;
                $scope.data.state_name = null;
                $scope.data.city = null;
                $scope.data.area = null;
                
            }
        });
    }
    
    
    
    $scope.onSaveActivityHandler = function (lat, lng) 
    {
        
        
        $scope.data.lat = lat;
        $scope.data.lng = lng;
        
        if ($scope.data.isFollowUp) {
            
            $scope.data.followUpDateInFormat = moment($scope.data.followUpDate).format('YYYY-MM-DD');
            
        } else {
            
            $scope.data.followUpDateInFormat = '';
            
        }
        
        console.log($scope.data);
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        
        var parameter = { function_name: 'submitActivity', 'data': $scope.data};
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            
            $ionicLoading.hide();
            if(response.status=='Success')
            {
                $state.go('tab.lead-activity-list');
            }
            else
            {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: result.message
                });
            }
        },error=>{
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Check Your Internet Connection !'
            });
        });
        
    }
    
    $scope.onSaveLeadFollowup = function()
    {
        $scope.data.dr_id = $scope.drDetail.dr_id;
        $scope.data.followUpDate = moment($scope.data.followUpDate).format('YYYY-MM-DD');
        
        console.log($scope.data);
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        
        var parameter = { function_name: 'submitLeadFollowup', 'data': $scope.data };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            
            $ionicLoading.hide();
            if (response.status == 'Success') {
                $state.go('tab.lead-followup-list');
            }
            else {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: result.message
                });
            }
        }, error => {
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Check Your Internet Connection !'
            });
        });
        
        
    }
    
    
    $scope.onSaveVisitEndHandler = function (lat, lng) {
        
        $scope.leadActivityData.lat = lat;
        $scope.leadActivityData.lng = lng;
        
        if ($scope.leadActivityData.isFollowUp) {
            
            $scope.leadActivityData.followUpDateInFormat = moment($scope.leadActivityData.followUpDate).format('YYYY-MM-DD');
            
        } else {
            
            $scope.leadActivityData.followUpDateInFormat = '';
            $scope.leadActivityData.followUpType = '';
        }
        
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        var parameter = { function_name: 'onSaveVisitEndHandler', 'data': $scope.leadActivityData };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            
            $ionicLoading.hide();
            if (response.status == 'Succcess') {
                $state.go('tab.lead-activity-list');
            }
            else {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: result.message
                });
            }
        }, error => {
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Check Your Internet Connection !'
            });
        });
    }
    
    
    
    $scope.onActivateGPSLocationForActivityHandler = function () {
        
        if ($scope.drDetail.dr_id != 0) {
            $scope.data.dr_id = $scope.drDetail.dr_id;
        }
        
        
        if ($location.path() == '/tab/add-activity' && (!$scope.data.dr_id)) {
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Coustmer Name Required!'
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
                    
                    if ($scope.data.activityType == 'Meeting' || $location.path() == '/tab/lead-meeting-end') 
                    {
                        console.log("in if");
                        
                        cordova.plugins.locationAccuracy.request(function (success) {
                            console.log("error");
                            var options = {
                                maximumAge: 5000,
                                timeout: 10000,
                                enableHighAccuracy: true
                            };
                            $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
                                if ($location.path() == '/tab/lead-meeting-end') {
                                    $scope.onSaveVisitEndHandler(position.coords.latitude, position.coords.longitude);
                                }
                                else {
                                    $scope.onSaveActivityHandler(position.coords.latitude, position.coords.longitude);
                                }
                            }, function (error) {
                                
                                if ($location.path() == '/tab/lead-meeting-end') {
                                    $scope.onSaveVisitEndHandler('', '');
                                }
                                else {
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
                    else {
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
    
    $scope.drOrderTypeData = [];
    $scope.onGetAllLeadType = function () {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        var parameter = { function_name: 'getLeadType' };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.drOrderTypeData = response.data;
            console.log($scope.drOrderTypeData);
            $ionicLoading.hide();
        });
    }
    
    $scope.allLeadData = [];
    $scope.getLeadDataonChangeLeadType = function (type) {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        var parameter = { function_name: 'getAssignLeadList', 'type_name': type };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.allLeadData = response.data;
            console.log($scope.allLeadData);
            $ionicLoading.hide();
        });
    }
    
    $scope.single_select = function (item) {
        console.log(item);
        $scope.data.dr_name = new Array();
        $scope.data.dr_name.push(item.Key);
        console.log($scope.data.dr_name);
        $scope.data.dr_id = item.id;
        
    }
    
    
    $scope.updateBasicDetail = function()
    {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        var parameter = { function_name: 'updateLeadDetail', 'data': $scope.data };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.allLeadData = response.data;
            
            if (response.status == "Success") {
                console.log('Success');
                $state.go('tab.lead-list');
                
                $ionicPopup.alert({
                    title: 'Success',
                    template: 'Lead Detail Updated succesfully'
                });
                
            }
            
            console.log($scope.allLeadData);
            $ionicLoading.hide();
        });
    }
    
    $scope.userList = [];
    $scope.getSfaUserList = function () {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });

        var parameter = { 'district': $scope.leadDetailData.district_name};
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getUserList", parameter).then(function (response) {
            console.log(response);
            $scope.userList = response.data;
           
            $ionicLoading.hide();
        });
    }

    $scope.single_select = function (item) {
        $scope.data.user_name = new Array();
        $scope.data.user_name.push(item.Key);
        console.log($scope.data.user_name);
        $scope.data.user_data = item;

    }

    $scope.reAssignLeadData = function()
    {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });

        $scope.data.dr_id = $scope.leadDetailData.id;
        $scope.data.dr_name = $scope.leadDetailData.dr_name;
        $scope.data.type_id = $scope.leadDetailData.type_id;
        $scope.data.status = $scope.leadDetailData.status;
        $scope.data.okaya_org = $scope.leadDetailData.okaya_org;
        $scope.data.nasaka_org = $scope.leadDetailData.nasaka_org;

        var parameter = { function_name: 'reAssignLead',data:$scope.data};

        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.userList = response.data;

            if (response.status=='Success')
            {
                $state.go('tab.lead-list');

                $ionicPopup.alert({
                    title: 'Success',
                    template: 'Lead reassign succesfully'
                });
            }

            $ionicLoading.hide();
        });
    }


    $scope.gotoPage = function (id, dr_name, contact_mobile_no, page_name, type_name)
    {
        console.log(page_name);
        console.log(id, dr_name, contact_mobile_no, page_name);
        myRequestDBService.dr_id = id;
        myRequestDBService.dr_name = dr_name;
        myRequestDBService.contact_mobile_no = contact_mobile_no;
        myRequestDBService.type_name = type_name;
        console.log(myRequestDBService.dr_id);
        $state.go('tab.' + page_name);
        $scope.leadpopovers.hide();
    }
    
    $scope.goToEditPage =function()
    {
        myAllSharedService.drData = $scope.leadDetailData;
        console.log(myAllSharedService.drData);
        
        $state.go('tab.lead-edit');
        
    }
    
    
    // $scope.GoToActivitylist = function (id, dr_name, contact_mobile_no) {
    //     myRequestDBService.dr_id = id;
    //     myRequestDBService.dr_name = dr_name;
    //     myRequestDBService.contact_mobile_no = contact_mobile_no;
    //     console.log(myRequestDBService.dr_id);
    //     $state.go('tab.lead-activity-list');
    // }
    
    $scope.onShowPopUpHandler = function ($event, drId, dr_name, contact_mobile_no, type_name) {
        $scope.data.dr_id = drId;
        $scope.data.dr_name = dr_name;
        $scope.data.contact_mobile_no = contact_mobile_no;
        $scope.data.type_name = type_name;
        $scope.data.followUpId = '';
        $scope.leadpopovers.show($event);
    }
    
    $ionicPopover.fromTemplateUrl('templates/popover.html',
    {
        scope: $scope,
    }).then(function (popovers) {
        $scope.leadpopovers = popovers;
    });
    // ----------Popover function End-------------//
    
    
    // ----------Date Format Start-------------//
    $scope.dateFormat = function (date) {
        return moment(date).format("DD MMM YYYY")
    }
    // ----------Date Format End-------------//
    
    $scope.onSeachActionHandler = function (type, actionType) {
        
        if (type == 'open') {
            $scope.isSearchBarOpen = true;
            setTimeout(() => {
                $('#searchData').focus();
            }, 1000);
        }
        
        if (type == 'close') {
            $scope.data.search = '';
            $scope.isSearchBarOpen = false;
            $scope.onSetCurrentPageHandler();
            $scope.getLeadOrderList($scope.data.typeId, $scope.data.typeName, $scope.data.typeStatus, actionType);
        }
    }
    
    if ($location.path() == '/tab/lead-add') {
        $scope.getleadAdd();
        $scope.getLeadType();
        $scope.getProductCategoryList(myRequestDBService.category, myRequestDBService.sub_category, myRequestDBService.product_name);
        
    }
    
    if ($location.path() == '/tab/lead-edit') {
        // $scope.getleadedit();
        $scope.getLeadType();    
        console.log(myAllSharedService.drData);
        
        $scope.data = myAllSharedService.drData;
        console.log($scope.data);    
    }
    
    
    
    if ($location.path() == '/tab/requirement-add') {
        $scope.drDetail.dr_id = myRequestDBService.dr_id;
        $scope.drDetail.dr_name = myRequestDBService.dr_name;
        $scope.drDetail.contact_mobile_no = myRequestDBService.contact_mobile_no;
        $scope.getProductCategoryList();
    }
    
    if ($location.path() == '/tab/add-lead-activity') {
        $scope.drDetail.dr_id = myRequestDBService.dr_id;
        $scope.drDetail.dr_name = myRequestDBService.dr_name;
        $scope.drDetail.contact_mobile_no = myRequestDBService.contact_mobile_no;
        if ($scope.drDetail.dr_id==0)
        {
            $scope.onGetAllLeadType();
        }
        $scope.getLeadCategoryList();
        $scope.getActivityType();
        // $scope.getProductCategoryList();
    }
    
    if ($location.path() == '/tab/add-lead-followup') {
        $scope.drDetail.dr_id = myRequestDBService.dr_id;
        $scope.drDetail.dr_name = myRequestDBService.dr_name;
        $scope.drDetail.contact_mobile_no = myRequestDBService.contact_mobile_no;
        $scope.getLeadCategoryList();
        $scope.getActivityType();
    }
    
    if ($location.path() =='/tab/lead-meeting-end')
    {
        myRequestDBService.activityID;
        $scope.getActivityDetail(myRequestDBService.activityID);
        $scope.getLeadCategoryList();
        $scope.getActivityType();
    }
    
    
    
});