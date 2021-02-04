angular.module('starter.services', [])


.service('myRequestDBService',function($q, $http,$state, myAllSharedService, $ionicLoading, $ionicPopup) {
    
    return {
        
        /*login function  start*/
        login: function(username, password, organisationId) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_Login/onValidateLogin", {
                
                'username':username,
                'password':password,
                'organisationId' : organisationId
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                if (response.data.status == 'success') {
                    
                    console.log("User 1st login successful: ");
                    deferred.resolve(response.data);
                    
                } else {
                    
                    console.log("User 1st login failed: Wrong Username And Password !");
                    deferred.reject(response.data);
                }
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            
            promise.error = function (fn) {
                
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* login function end*/
        
        
        /*Dashboard function  start*/
        getDashboardData: function(username, password) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            // $http.post(serverURL+"/App_Dashboard/onGetDashboardData", {
            $http.post(serverURL+"/App_Dashboard/getDashboardData", {
                
                'loginData' : myAllSharedService.loginData
                
            }, {timeout: 25000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            
            promise.error = function (fn) {
                
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Dashboard function end*/
        
        
        /* attendance status function start */
        
        getAttendanceStatus: function() {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+ '/App_Dashboard/getAttendanceStatus', {
                
                'loginData' : myAllSharedService.loginData
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                
                if (response) {
                    
                    deferred.resolve(response.data);
                    
                } else {
                    
                    deferred.reject(response.data);
                    
                }
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                deferred.reject(error);
            });
            
            promise.success = function (fn) {
                
                promise.then(fn);
                return promise;
            };
            
            promise.error = function (fn) {
                
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* attendance status function end*/
        
        /*Start Attendance start*/
        
        onStartAttendHandler: function(lng,lat) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(serverURL + '/App_Dashboard/startUserAttendance', {
                
                loginData: myAllSharedService.loginData,
                lat:lat,
                lng:lng
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on response: " + JSON.stringify(error));
                deferred.reject(error);
                
            });
            
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        
        /*Start Attendence end*/
        
        
        /*Stop Attendance start*/
        
        onStopAttendHandler: function(attendId, lng, lat) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL + '/App_Dashboard/stopUserAttendance', {
                
                loginData: myAllSharedService.loginData,
                attendId:attendId,
                lat:lat,
                lng:lng
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on response: " + JSON.stringify(error));
                deferred.reject(error);
                
            });
            
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        
        /*Stop Attendence end*/
        
        
        /*Lead Status Wise Count function  start*/
        getDrStatusWiseData: function(username, password) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_Customer/getDrStatusWiseData",
            {
                'loginData' : myAllSharedService.loginData
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            
            promise.error = function (fn) {
                
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Lead Status function end*/
        
        
        /*Dr List Wise Count function  start*/
        getDrListData: function(typeId, typeName, typeStatus, searchData, currentPage, pageSize) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_Customer/onGetDrListData", {
                
                loginData : myAllSharedService.loginData,
                typeId: typeId,
                typeName: typeName,
                status: typeStatus,
                searchData: searchData,
                start: currentPage,
                pageLimit: pageSize
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            
            promise.error = function (fn) {
                
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Dr List function end*/
        
        
        /*DR Detail function  start*/
        getDrDetailData: function(drId) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            // $http.post(serverURL+"/App_Customer/getDrDetail", {
            $http.post(serverURL+"/App_Customer/getDetail", {
                
                loginData : myAllSharedService.loginData,
                drId: drId
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            
            promise.error = function (fn) {
                
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* DR Detail function end*/
        
        
        /* All Dr Stautus List function  start*/
        getDrAllStatusData: function() {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_SharedData/getDrAllStatusData/0", {
                
                loginData : myAllSharedService.loginData,
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            
            promise.error = function (fn) {
                
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* All Dr Status List function end*/
        
        /* All Dr Type List function  start*/
        getDrAllTypeData: function(typeId, typeName, status) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_SharedData/getDrAllTypeData/0", {
                
                loginData : myAllSharedService.loginData,
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            
            promise.error = function (fn) {
                
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* All Dr Status List function end*/
        
        
        /* All Category List function  start*/
        getAllCategoryData: function(typeId, typeName, status) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_SharedData/getAllCategoryData", {
                
                loginData : myAllSharedService.loginData,
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            
            promise.error = function (fn) {
                
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* All Category List function end*/
        
        
        /* All Order Dr Type List function  start*/
        onGetTypeListForOrderCreateHandler: function(typeId, typeName, status) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_SharedData/onGetTypeListForOrderCreate", {
                
                loginData : myAllSharedService.loginData,
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            
            promise.error = function (fn) {
                
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* All Order Dr Type List function end*/
        
        
        /* All Delivery By Type List function  start*/
        onGetDeliveryByTypeListHandler: function(typeId, typeName, status) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_SharedData/onGetDeliveryByTypeList", {
                
                loginData : myAllSharedService.loginData,
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            
            promise.error = function (fn) {
                
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* All Delivery By Type List function end*/
        
        
        /*Attendance List  function  start*/
        getOrderListData: function(currentActiveTab, searchData, currentPage, pageSize) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_SharedData/onGetOrderData", {
                
                loginData : myAllSharedService.loginData,
                currentActiveTab: currentActiveTab,
                searchData: searchData,
                start: currentPage,
                pageLimit: pageSize,
                targetPage: 'List',
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            
            promise.error = function (fn) {
                
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Order List function end*/
        
        
        /*CheckIn List Wise Count function  start*/
        getCheckInListData: function(currentActiveTab, selectedDate, searchData, currentPage, pageSize) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_SharedData/getCheckInData", {
                
                loginData : myAllSharedService.loginData,
                currentActiveTab: currentActiveTab,
                checkInDate: selectedDate,
                searchData: searchData,
                start: currentPage,
                pageLimit: pageSize,
                targetPage: 'List'
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            
            promise.error = function (fn) {
                
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* CheckIn List function end*/
        
        /*Follow Up List Wise Count function  start*/
        getFollowUpListData: function(currentActiveTab, selectedDate, searchData, currentPage, pageSize) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_SharedData/getFollowUpData", {
                // $http.post(serverURL+"/App_SharedData/onGetFollowUpData", {
                
                loginData : myAllSharedService.loginData,
                currentActiveTab: currentActiveTab,
                followUpDate: selectedDate,
                searchData: searchData,
                start: currentPage,
                pageLimit: pageSize,
                targetPage: 'List'
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            
            promise.error = function (fn) {
                
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Follow Up List function end*/
        
        
        /*Attendance List  function  start*/
        onGetAttendanceListHandler: function(attendMonth) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_Dashboard/getAttendanceData", {
                
                loginData : myAllSharedService.loginData,
                attendMonth: attendMonth,
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            
            promise.error = function (fn) {
                
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Attendance List function end*/
        
        
        /*Activity Id Data List  function  start*/
        onGetActivityIdDataHandler: function(activityId) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_Checkin/onGetActivityIdDataHandler", {
                
                loginData : myAllSharedService.loginData,
                activityId: activityId,
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            
            promise.error = function (fn) {
                
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Activity Id Data function end*/
        
        
        /*Get Quote Data List  function  start*/
        onGetQuotationData: function(quotationId) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_SharedData/onGetQuotationData", {
                
                loginData : myAllSharedService.loginData,
                quotationId: quotationId,
                targetPage: 'List'
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            
            promise.error = function (fn) {
                
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Get Quote Data function end*/
        
        
        /*Get Order Data List  function  start*/
        onGetOrderData: function(orderId) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            // $http.post(serverURL+"/App_SharedData/onGetOrderData", {
            $http.post(serverURL+"/App_SharedData/onOrderData", {
                
                loginData : myAllSharedService.loginData,
                orderId: orderId,
                targetPage: 'List'
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            
            promise.error = function (fn) {
                
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Get Order Data function end*/
        
        
        /*Get Activity Type Data List  function  start*/
        onGetActivityTypesHandler: function(quotationId) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_SharedData/onGetActivityTypesHandler", {
                
                loginData : myAllSharedService.loginData,
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            
            promise.error = function (fn) {
                
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Get Activity Type Data function end*/
        
        
        /*Get DR Id Data List  function  start*/
        onGetLeadDataForAutoFillDataHandler: function(drId) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_Customer/onGetLeadDataForAutoFillData", {
                
                loginData : myAllSharedService.loginData,
                drId: drId
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            
            promise.error = function (fn) {
                
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Get DR Id Data function end*/
        
        hard_delete: function(data) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_Customer/hard_delete",
            {
                loginData : myAllSharedService.loginData,
                data: data
                
            },{timeout: 30000})
            .then(function (response) {
                console.log(response);
                deferred.resolve(response.data);
            },function (error)
            {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn) {
                
                promise.then(null, fn);
                return promise;
            };
            return promise;
        },
        
        /*Save DR Data function  start*/
        onSaveDrHandler: function(drData, cartItemData) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_Customer/onSubmitDrData", {
                
                loginData : myAllSharedService.loginData,
                drId: drData.drId,
                drName: drData.companyName,
                contact_name: drData.customerName,
                customerMobile1: drData.customerMobile1,
                customerMobile2: drData.customerMobile2,
                typeId: drData.typeId,
                typeName: drData.typeName,
                landlineNo: drData.landlineNo,
                email: drData.email,
                website: drData.website,
                category: drData.category,
                status: drData.status,
                lostReason: drData.lostReason,
                street: drData.street,
                stateName: drData.stateName,
                districtName: drData.districtName,
                city: drData.city,
                pincode: drData.pincode,
                insideSalesSelectedData: drData.insideSalesSelectedData,
                fieldAgentId: drData.fieldAgentId,
                contactName: drData.contactName,
                contactMobile: drData.contactMobile,
                contactDesignation: drData.contactDesignation,
                contactEmail: drData.contactEmail,
                cartItemData: cartItemData,
                sourceId : drData.source_id,
                sourceName : drData.source_name
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /*  Save DR function end */
        
        
        /*Close Lead Data function  start*/
        onCloseLeadHandler: function(drData) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_Customer/onCloseLeadData", {
                
                loginData: myAllSharedService.loginData,
                drId: drData.drId,
                status: 'Win',
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /*  Close Lead function end */
        
        onSaveOrder: function(cartItemData, cartSummaryData) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/okaya_sfa/App_Order/onSaveOrder", {
                
                loginData : myAllSharedService.loginData,
                cartItemData: cartItemData,
                cartSummaryData: cartSummaryData
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        
        onOrderDeatil: function(orderId) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/okaya_sfa/App_Order/onOrderDeatil", {
                
                loginData : myAllSharedService.loginData,
                orderId: orderId,
                targetPage: 'List'
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            
            promise.error = function (fn) {
                
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        
        getOrderList: function(order_type, searchData, currentPage, pageSize,createdBy)
        {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(serverURL+"/okaya_sfa/App_Order/order_list",
            {
                loginData : myAllSharedService.loginData,
                order_type: order_type,
                searchData: searchData,
                start: currentPage,
                pageLimit: pageSize,
                targetPage: 'List',
                createdBy:createdBy
            }).then(function (response)
            {
                console.log(response);
                deferred.resolve(response.data);
            }, function (error)
            {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                deferred.reject(error);
            });
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn) {
                
                promise.then(null, fn);
                return promise;
            };
            return promise;
        },
        
        getOrderData: function(targetArr, searchKey, pageNumber) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/okaya_sfa/App_Order/getOrderData",
            {
                loginData: myAllSharedService.loginData,
                targetArr: targetArr,
                searchKey: searchKey,
                pageNumber: pageNumber,
                
            }).then(function (response)
            {
                console.log(response);
                deferred.resolve(response.data);
            }, function (error) {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                deferred.reject(error);
            });
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            return promise;
        },
        
        getDistributor: function(order_type) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/okaya_sfa/App_Order/getDistributors",
            {
                loginData: myAllSharedService.loginData,
                order_type:order_type
            }).then(function (response)
            {
                console.log(response);
                deferred.resolve(response.data);
            }, function (error) {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                deferred.reject(error);
            });
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            return promise;
        },
        
        get_dr_list: function(data) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/okaya_sfa/App_Order/get_dr_lists",
            {
                loginData: myAllSharedService.loginData,
                data:data
            }).then(function (response)
            {
                console.log(response);
                deferred.resolve(response.data);
            }, function (error) {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                deferred.reject(error);
            });
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            return promise;
        },
        
        
        /*Save Activity Data function  start*/
        onSaveActivityHandler: function(checkInData) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_Checkin/onSaveActivityHandler", {
                
                loginData : myAllSharedService.loginData,
                checkInData: checkInData
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /*  Save DR function end */
        
        
        /*Save End Visit Data function  start*/
        onSaveVisitEndHandler: function(checkInData) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_Checkin/onSaveVisitEndHandler", {
                
                loginData : myAllSharedService.loginData,
                checkInData: checkInData
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /*  Save End Visit function end */
        
        
        /*Save Requirement Data function  start*/
        onSaveRequirementHandler: function(drId, cartItemData) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_Order/onSaveRequirementData", {
                
                loginData : myAllSharedService.loginData,
                drId: drId,
                cartItemData: cartItemData
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /*  Save Requirement function end */
        
        
        /*Save Quotation Data function  start*/
        onSaveQuotationHandler: function(drId, cartItemData,cartSummaryData, quoteId) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_Order/onSaveQuotationData", {
                
                loginData : myAllSharedService.loginData,
                drId: drId,
                quoteId: quoteId,
                cartItemData: cartItemData,
                cartSummaryData: cartSummaryData
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /*  Save Quotation function end */
        
        
        /*Save Order Data function  start*/
        onSaveOrderHandler: function(drId, deliveryById ,shipping, cartItemData,cartSummaryData) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_Order/onSaveOrderHandler", {
                
                loginData : myAllSharedService.loginData,
                drId: drId,
                deliveryById: deliveryById,
                shipping:shipping,
                cartItemData: cartItemData,
                cartSummaryData: cartSummaryData
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /*  Save Order function end */
        
        
        /*Save FollowUp Data function  start*/
        
        onSaveFollowUpHandler: function(followUpData) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_Checkin/onSaveFollowUpData", {
                
                loginData : myAllSharedService.loginData,
                followUpData: followUpData
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /*  Save FollowUp function end */
        
        
        /*Save FollowUp Remark Data function  start*/
        
        onSaveFollowUpRemarkHandler: function(followUpId, remark) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_Checkin/onSaveFollowUpRemarkHandler", {
                
                loginData : myAllSharedService.loginData,
                followUpId: followUpId,
                remark: remark,
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /*  Save FollowUp Remark function end */
        
        
        
        
        /*Profile Data  function  start*/
        onUserDetailHandler: function()
        {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_Login/onUserDetailHandler", {
                
                loginData : myAllSharedService.loginData,
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /*  Profile Data function end */
        
        
        /*Organisation Data  function  start*/
        onGetUserOrganisationHandler: function() {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+"/App_Login/onGetUserOrganisationData", {
                
                loginData : myAllSharedService.loginData,
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        
        onGetPostRequest: function(fn_name,data)
        {
            
            console.log(fn_name);
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(serverURL+fn_name,{
                
                loginData: myAllSharedService.loginData,
                status: data,
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        
        sfaPostServiceRequest: function(fn_name,data)
        {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            $http.post(sfaServerURL+fn_name,{
                
                loginData: myAllSharedService.loginData,
                data: data,
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
                
            }, function (error) {
                
                $ionicLoading.hide();
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /*  One post request function end */
        
        /* Get Leave Application Start */
        onGetLeaveApplicationHandler: function() {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(serverURL+"/App_Leave/onGetUserLeaveApplicationData", {
                
                loginData : myAllSharedService.loginData,
                
            }, {timeout: 30000}).then(function (response) {
                
                console.log(response.data.userLeaveList);
                deferred.resolve(response.data);
                
            });
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Get Leave Application End */
        /* Submit Leave Application Start */
        onSubmitLeaveApplication: function(leaveData) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(serverURL+"/App_Leave/onSubmitLeaveApplication",
            {
                loginData : myAllSharedService.loginData,
                leaveData : leaveData,
            },{timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response);
            });
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Submit Leave Application End */
        /* Leave Application Delete Start*/
        userLeaveDelete: function(leaveId) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(serverURL+"/App_Leave/userLeaveDelete",
            {
                leaveId : leaveId,
            },{timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response);
            });
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Leave Application Delete End */
        
        /* Travel List Start*/
        getTravelList: function(travelPlanStatus, planType) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(serverURL+"/App_Expense/getTravelList",
            {
                loginData : myAllSharedService.loginData,
                travelPlanStatus : travelPlanStatus,
                planType : planType
                
            },{timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response);
            });
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Travel List End */
        
        edit_plan: function(travelPlanId) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(serverURL+"/App_Expense/edit_plan",
            {
                travelPlanId : travelPlanId
                
            },{timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response);
            });
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        
        /* Travel Detail Start*/
        getTravelPlanDetail: function(travelPlanId) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(serverURL+"/App_Expense/getTravelPlanDetail",
            {
                travelPlanId : travelPlanId
                
            },{timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response);
            });
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Travel Detail End */
        
        /* Expense List Start*/
        getExpenseList: function(expenseStatus, planType) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(serverURL+"/App_Expense/getExpenseList",
            {
                loginData : myAllSharedService.loginData,
                expenseStatus : expenseStatus,
                planType : planType
                
            },{timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response);
            });
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Expense List End */
        
        /* Expense Detail Start*/
        getExpenseDetail: function(expenseId) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(serverURL+"/App_Expense/getExpenseDetail",
            {
                expenseId : expenseId
                
            },{timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response);
            });
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Expense Detail End */
        
        /* State List Start*/
        getState: function() {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(serverURL+"/App_Expense/getState",
            {
                
            },{timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response);
            });
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* State List End */
        
        /* District List Start*/
        getDistrict: function(state) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(serverURL+"/App_Expense/getDistrict",
            {
                state : state
                
            },{timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response);
            });
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* District List End */
        
        /* City List Start*/
        getCity: function(district) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(serverURL+"/App_Expense/getCity",
            {
                district : district
                
            },{timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response);
            });
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* City List End */
        
        /* Distributor List Start*/
        getDistributorData: function() {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(serverURL+"/App_Expense/getDistributorData",
            {
                
            },{timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response);
            });
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Distributor List End */
        
        /* Submit Travel Plan Start*/
        submitTravel: function(travelData) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(serverURL+"/App_Expense/submitTravel",
            {
                travelData : travelData,
                loginData : myAllSharedService.loginData
                
            },{timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response);
            });
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };            
            return promise;
        },
        /* Submit Travel Plan End */
        
        get_journy_data: function(area,travel_id) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(serverURL+"/App_Expense/get_journy_data",
            {
                area : area,
                travel_id : travel_id,
                loginData : myAllSharedService.loginData
                
            },{timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response);
            });
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };            
            return promise;
        },
        
        /* Travel Modes Start*/
        getTravelModes: function() {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(serverURL+"/App_Expense/getTravelModes",
            {
                loginData : myAllSharedService.loginData
                
            },{timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response);
            });
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Travel Modes End */
        
        /* Add Expense Start*/
        submitExpense: function(expenseData) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(serverURL+"/App_Expense/submitExpense",
            {
                loginData : myAllSharedService.loginData,
                expenseData : expenseData
                
            },{timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response);
            });
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Add Expense End */
        
        /* Change Status Start*/
        saveStatus: function(statusData) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(serverURL+"/App_Expense/saveStatus",
            {
                loginData : myAllSharedService.loginData,
                statusData : statusData
                
            },{timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response);
            });
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Change Status End */
        
        /* Change Expense Status Start*/
        saveExpStatus: function(statusData) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(serverURL+"/App_Expense/saveExpStatus",
            {
                loginData : myAllSharedService.loginData,
                statusData : statusData
                
            },{timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response);
            });
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Change Expense Status End */
        
        /* Edit Expense Start*/
        EditExpense: function(expData, expType, expenseId) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(serverURL+"/App_Expense/EditExpense",
            {
                loginData : myAllSharedService.loginData,
                expData : expData,
                expType : expType,
                expenseId : expenseId
                
            },{timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response);
            });
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Edit Expense End */
        
        /* Check Travel Plan Start*/
        checkTravelPlan: function(travelData) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(serverURL+"/App_Expense/checkTravelPlan",
            {
                loginData : myAllSharedService.loginData,
                travelData : travelData
                
            },{timeout: 30000}).then(function (response) {
                
                console.log(response);
                deferred.resolve(response);
            });
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /* Check Travel Plan End */
        
        /*Add Location function start*/
        add_loc: function(dr_id,loc,lat,lng) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(sfaServerURL+"/Distribution_Network/add_loc",
            {
                'dr_id':dr_id,
                'loc':loc,
                'lat':lat,
                'lng':lng
                
            }).then(function (response) {
                deferred.resolve(response);
            }, function (error) {
                console.log("Server Error on response: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /*Add Location function End*/
        
        /*Get GPS Location function start*/
        get_gps_loc: function(dr_id) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(sfaServerURL+"/Distribution_Network/get_gps_loc",
            {
                'dr_id':dr_id,
                
            }).then(function (response) {
                deferred.resolve(response);
            }, function (error) {
                console.log("Server Error on response: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        /*Get GPS Location function End*/
        
        /*Retailer img_doic list function of service start*/
        
        dr_img_doc_list: function(dr_id)
        {
            var deferred = $q.defer();
            var promise = deferred.promise;
            console.log(dr_id);
            $http.post(sfaServerURL+"/Distribution_Network/get_dr_imgdoc",
            {
                'dr_id':dr_id
                
            }).then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
            }, function (error) {
                console.log("Server Error on response: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        
        /*Retailer img_doic list function of service end*/
        
        /* dr img_doc_details list function of service start*/
        dr_img_doc_details: function(dr_id,document_title) {
            
            var deferred = $q.defer();
            var promise = deferred.promise;
            console.log(dr_id);
            
            $http.post(sfaServerURL+"/Distribution_Network/dr_img_doc_details",
            {
                'dr_id':dr_id,
                'document_title':document_title
            })
            .then(function (response) {
                
                console.log(response);
                deferred.resolve(response.data);
            }, function (error) {
                console.log("Server Error on response: " + JSON.stringify(error));
                deferred.reject(error);
            });
            
            promise.success = function (fn)
            {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn)
            {
                promise.then(null, fn);
                return promise;
            };
            
            return promise;
        },
        
        /* dr img_doc_details list function of service end*/
        
        get_pincode_Address: function(pincode)
        {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(serverURL+"/okaya_sfa/App_SharedData/onGetPincodeDetail", {
                pincode: pincode
            }, {timeout: 30000}).then(function (response) {
                console.log(response);
                deferred.resolve(response.data);
            }, function (error) {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            };
            return promise;
        },
        
        get_cities: function(districts)
        {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(sfaServerURL+"/App_SharedData/get_cities", {
                districts: districts
            }, {timeout: 30000}).then(function (response) {
                console.log(response);
                deferred.resolve(response.data);
            }, function (error) {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Check Internet Connection, Try Again!'
                });
                console.log("Server Error on 1st login: " + JSON.stringify(error));
                deferred.reject(error);
            });
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            };
            return promise;
        },
    }
})


.factory('myAllSharedService', function() {
    
    var mySharedService = {};
    
    mySharedService.loginData = {};
    mySharedService.drTypeFilterData = {};
    
    mySharedService.lat='';
    mySharedService.long='';
    mySharedService.last_gps='';
    
    mySharedService.shareDr_imagDoc = '';
    mySharedService.shareDrimagDocDetails = '';
    
    mySharedService.expense = {};
    mySharedService.travel = {};
    return mySharedService;
})


.factory('Camera', function($q) {
    
    return {
        getPicture: function(options) {
            var q = $q.defer();
            
            navigator.camera.getPicture(function(result) {
                q.resolve(result);
            }, function(err) {
                q.reject(err);
            }, options);
            
            return q.promise;
        }
    }
})

.directive('replace', function() {
    return {
        require: 'ngModel',
        scope: {
            regex: '@replace',
            with: '@with'
        },
        link: function(scope, element, attrs, model) {
            model.$parsers.push(function(val) {
                if (!val) { return; }
                var regex = new RegExp(scope.regex);
                var replaced = val.replace(regex, scope.with);
                if (replaced !== val) {
                    model.$setViewValue(replaced);
                    model.$render();
                }
                return replaced;
            });
        }
    };
})


.directive("limitTo", [function() {
    return {
        restrict: "A",
        link: function(scope, elem, attrs) {
            var limit = parseInt(attrs.limitTo);
            angular.element(elem).on("keypress", function(e) {
                if (this.value.length == limit) e.preventDefault();
            });
        }
    }
}])


.directive('stringToNumber', function () {
    
    return {
        
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            
            ngModel.$parsers.push(function (value) {
                return '' + value;
            });
            
            ngModel.$formatters.push(function (value) {
                return parseFloat(value);
            });
        }
    };
})

.directive('fileModel', ['$parse', '$rootScope', function ($parse, $rootScope) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    console.log('hello');

                    for (let index = 0; index < element[0].files.length; index++) {
                        // const element = array[index];
                        modelSetter(scope, element[0].files[index]);

                        $rootScope.documentFiles =  $rootScope.documentFiles ? $rootScope.documentFiles : Array();
                        $rootScope.documentFiles.push(element[0].files[index]);
                    
                        
                    }
                    console.log(element);
                    console.log($rootScope.documentFiles);
                });
            });
        }
    };
}])

