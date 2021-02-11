
app.controller('sfaOrderCtrl', function ($scope, $rootScope, searchSelect, $ionicModal, $state, myRequestDBService, myAllSharedService, $ionicLoading, $cordovaSQLite, $ionicPopup, $timeout, $ionicActionSheet, $cordovaImagePicker, Camera, $cordovaFileTransfer, $cordovaGeolocation, $cordovaToast, $location, $window, $ionicPlatform, $ionicHistory, $ionicModal,$stateParams, $ionicScrollDelegate, $ionicPopover) {
    
    $scope.loginData = myAllSharedService.loginData;
    $scope.isRequestInProcess;
    $scope.orderList = [];
    
    $scope.data = {};
    $scope.search = {};
    
    $scope.data.isInsideLead = myAllSharedService.drTypeFilterData.isInsideLead;
    $rootScope.isAttendanceStart  = myAllSharedService.loginData.startAttendance;
    
    $scope.categoryList = [];
    $scope.subCategoryList = [];
    $scope.productList = [];
    
    $scope.drList = [];
    $scope.drDeliveryByList = [];
    $scope.tmpbillingList = [];
    
    
    $scope.cartItemData = [];
    $scope.cartSummaryData = {};
    $scope.drDetail = myAllSharedService.drTypeFilterData.drDetail;
    
    $scope.drOrderTypeData = [];
    $scope.deliveryByTypeList = [];
    
    $scope.currentPage = 1;
    $scope.pageSize = 20;
    $scope.billinglist=[];
    $scope.billingdetail=[];
    // $scope.currentDate =  new Date();
    $scope.currentDate = moment().format('YYYY-MM-DD');
    $scope.minDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
    
    $scope.isSearchBarOpen = false;
    $scope.order_type = myAllSharedService.drTypeFilterData.order_type;
    $scope.noMoreListingAvailable = false;
    
    let fetchingRecords = false;
    
    $scope.changeStatus = function(statusType)
    {
        console.log(statusType);
        
        $scope.data.statusModel.show();
        $scope.data.statusType = statusType;
    }
    

    if($location.path() == '/tab/billing-detail') {
        
        console.log("hello");
        console.log(myAllSharedService.billingdetail);
        $scope.data = myAllSharedService.billingdetail;
        console.log($scope.data);
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
        });
        fetchingRecords = true;

        myRequestDBService.orpPostServiceRequest('/invoice/getInvoiceDetail',$scope.data)
        .then(function (result)
        {
            console.log(result);
            $ionicLoading.hide();

            $scope.billingdetail = result.data;
            console.log($scope.billingdetail);
            fetchingRecords = false;
            
        }, function (errorMessage) {
            console.log(errorMessage);
            window.console.warn(errorMessage);
            $ionicLoading.hide();
            fetchingRecords = false;
        });
    }


    $scope.filterBillingList = function(search)
    {
        search = search.toLowerCase();
        $scope.tmpbillingList=$scope.billinglist;
        console.log($scope.billinglist);
        
        console.log(search);
        $scope.billinglist = [];
        console.log($scope.billinglist);
      console.log($scope.tmpbillingList);

        $scope.billinglist = $scope.tmpbillingList.filter(row=>row.customer_code.includes(search) || row.customr_name.toLowerCase().includes(search) || row.sale_order_no.includes(search) || row.bill_doc.includes(search));

        console.log($scope.billinglist);
       

        console.log(searchArray);

    }

$scope.billinglistdata = function () {
    fetchingRecords = true;
    $ionicLoading.show({
        template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
    });
    myRequestDBService.orpPostServiceRequest('/invoice/getInvoiceList','')
    .then(function (result)
    {
        console.log(result);
        
        $scope.billinglist = result.data;
        $ionicLoading.hide();

        fetchingRecords = false;
        
    }, function (errorMessage) {
        console.log(errorMessage);
        window.console.warn(errorMessage);
        $ionicLoading.hide();
        fetchingRecords = false;
    });
}

    if($location.path() == '/tab/billing-list') {
        
        console.log("hello");
        // $scope.data.orderId = myAllSharedService.drTypeFilterData.orderId;
        $scope.billinglistdata();
        // fetchingRecords = true;
        // $ionicLoading.show({
        //     template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
        // });
        // myRequestDBService.orpPostServiceRequest('/invoice/getInvoiceList','')
        // .then(function (result)
        // {
        //     console.log(result);
            
        //     $scope.billinglist = result.data;
        //     $ionicLoading.hide();

        //     fetchingRecords = false;
            
        // }, function (errorMessage) {
        //     console.log(errorMessage);
        //     window.console.warn(errorMessage);
        //     $ionicLoading.hide();
        //     fetchingRecords = false;
        // });
    }

    if($location.path() == '/tab/sfa-order-add')
    {
        {
            var label
            
            if($scope.order_type=='secondary')
            {
                label = 'Dealer';
            }
            else
            {
                label = 'Distributor';
            }
            $scope.itemList = [];
            
            $scope.search.categoryName = { Key: "Select Category", Value: "" };
            $scope.search.subCategoryName = { Key: "Select Sub Category", Value: "" };
            $scope.search.product = { Key: "Select Product", Value: "" };
            $scope.search.dr_name = { Key: "Select "+label, Value: "" };
            $scope.search.assign_dr_name = { Key: "Select Distributor", Value: "" };
            
            $scope.data.payment_type = 'cash';
            console.log(myAllSharedService.drTypeFilterData.orderData);
            
            if(myAllSharedService.drTypeFilterData.orderData && myAllSharedService.drTypeFilterData.orderData.order_type != undefined) {
                
                myAllSharedService.drTypeFilterData.referFrom = null;
                $scope.cartSummaryData = {};
                $scope.order_type = myAllSharedService.drTypeFilterData.orderData.order_type;
                $scope.data = myAllSharedService.drTypeFilterData.orderData;
                $scope.search.dr_name = { Key: $scope.data.dr_name, Value: $scope.data.dr_id };
                $scope.data.order_date = new Date($scope.data.order_date);
                $scope.get_dr_list();
                console.log($scope.search);
                console.log($scope.cartItemData);
                $scope.data.dr_id = $scope.data.dr_id;
                $scope.data.basicAmount = $scope.data.item_total;
                $scope.data.grandTatal = $scope.data.net_total;
                $scope.data.netAmount = $scope.data.sub_total;
                $scope.data.sgstAmount = $scope.data.sgst_amt;
                $scope.data.igstAmount = $scope.data.igst_amt;
                $scope.data.cgstAmount = $scope.data.cgst_amt;
                $scope.data.discountedAmount = $scope.data.dis_amt;
                $scope.data.order_id = $scope.data.id;
                $scope.data.payment_type = $scope.data.payment_type;
                
                $scope.onGetCartItemDataHandler('fetchCategoryData', '' , 1);
                
                
                if($scope.data.dr_id && $scope.order_type=='secondary')
                {
                    $scope.getAssignDistributor();
                    $scope.getDistributor();
                    
                }
                $scope.cartItemData = [];
                
                $scope.data.itemData.forEach(element => {
                    $scope.cartItemData.push({
                        warranty: element.warranty,
                        categoryName: element.category,
                        subCategoryName: element.sub_category,
                        productName: element.product_name,
                        productCode: element.product_code,
                        qty: element.qty,
                        rate: element.rate,
                        discount: element.dis_percent,
                        discountAmount : element.dis_amt,
                        igst: element.igst_percent,
                        cgst: element.cgst_percent,
                        sgst: element.sgst_percent,
                        cgstAmount: element.cgst_amount,
                        sgstAmount: element.sgst_amount,
                        igstAmount: element.igst_amount,
                        subTotal : element.amount,
                        netTotal : element.item_total,
                        grandTotal : element.item_net_total,
                    });
                    
                });
                
                $scope.cartSummaryData.order_id = $scope.data.id;
                $scope.cartSummaryData.discountAmount = $scope.data.dis_amt;
                $scope.cartSummaryData.discountedAmount = $scope.data.item_total;
                $scope.cartSummaryData.cgstAmount = $scope.data.cgst_amt;
                $scope.cartSummaryData.sgstAmount = $scope.data.sgst_amt;
                $scope.cartSummaryData.igstAmount = $scope.data.igst_amt
                $scope.cartSummaryData.itemFinalAmount = $scope.data.net_total;
                
            } 
            else if(myAllSharedService.drTypeFilterData.dr_id && myAllSharedService.drTypeFilterData.referFrom =='network')
            {
                $scope.data.order_date = new Date();
                $scope.get_dr_list();
                console.log("welcome");
                $scope.data.dr_id = $scope.data.dr_id;
                $scope.search.dr_name = { Key: myAllSharedService.drTypeFilterData.dr_name, Value:myAllSharedService.drTypeFilterData.dr_id };
                
            }
            else {
                myAllSharedService.drTypeFilterData.referFrom = null;
                $scope.data.order_date = new Date();
                $scope.get_dr_list();
            }
            
            console.log($scope.data);
        }
    }
    
    $scope.onGetCartItemDataHandler = function (typeInfo, searchKey, pagenumber) {
        
        if(!searchKey) {
            
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
                duration: 100
            });
        }
        
        if (fetchingRecords) return;
        fetchingRecords = true;
        
        var targetArr = {
            type: typeInfo,
            categoryName: $scope.search.categoryName.Value,
            subCategoryName: $scope.search.subCategoryName.Value,
            product: $scope.search.product,
            dr_id:$scope.data.dr_id ? $scope.data.dr_id : 0
        };
        
        console.log(targetArr);
        
        myRequestDBService.getOrderData(targetArr, searchKey, pagenumber)
        .then(function (result)
        {
            console.log(result);
            if (pagenumber === 1) {
                
                if (typeInfo == 'fetchCategoryData') {
                    
                    $scope.totalCategoryRecords = result.TotalRecords;
                    $scope.categoryList = result.Records;
                }
                
                if (typeInfo == 'fetchSubCategoryData') {
                    
                    $scope.totalSubCategoryRecords = result.TotalRecords;
                    $scope.subCategoryList = result.Records;
                }
                
                
                if (typeInfo == 'fetchProductData') {
                    
                    $scope.totalProductRecords = result.TotalRecords;
                    $scope.productList = result.Records;
                }
            }
            
            fetchingRecords = false;
            
        }, function (errorMessage) {
            console.log(errorMessage);
            window.console.warn(errorMessage);
            $ionicLoading.hide();
            fetchingRecords = false;
        });
        
    };
    
    $scope.onDrNameHandler = function (searchKey) {
        
        if(!searchKey) {
            
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
                duration: 100
            });
        }
        
        if (fetchingRecords) return;
        fetchingRecords = true;
        
        var data = {
            search: searchKey,
            order_type: $scope.order_type,
        };
        
        // console.log(targetArr);
        
        myRequestDBService.sfaPostServiceRequest('/App_Order/get_dr_lists',data)
        .then(function (result)
        {
            console.log(result);
            
            $scope.dr_list = result.dr_list;
            
            fetchingRecords = false;
            
        }, function (errorMessage) {
            console.log(errorMessage);
            window.console.warn(errorMessage);
            $ionicLoading.hide();
            fetchingRecords = false;
        });
        
    };
    
    $scope.onSearchDrNameHandler = function (searchKey) {
        
        if(!searchKey) {
            
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
                duration: 100
            });
        }
        
        if (fetchingRecords) return;
        fetchingRecords = true;
        
        var data = {
            search: searchKey,
            dr_id: $scope.data.dr_id,
        };
        
        // console.log(targetArr);
        
        myRequestDBService.sfaPostServiceRequest('/App_Order/assignDistributor',data)
        .then(function (result)
        {
            console.log(result);
            
            $scope.assignDistributor = result.dr_list;
            
            fetchingRecords = false;
            
        }, function (errorMessage) {
            console.log(errorMessage);
            window.console.warn(errorMessage);
            $ionicLoading.hide();
            fetchingRecords = false;
        });
        
    };
    
    
    $scope.assignDistributor = [];
    
    
    $scope.getAssignDistributor = function()
    {
        $scope.search.assign_dr_name = { Key: "Select Distributor", Value: "" };
        
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
        });
        
        var data={dr_id:$scope.data.dr_id}
        
        
        myRequestDBService.sfaPostServiceRequest('/App_Order/assignDistributor',data)
        .then(function(response) {
            
            console.log(response);
            
            if(response.status=='Success')
            {
                $scope.assignDistributor = response.dr_list;
                $ionicLoading.hide();
                console.log($scope.assignDistributor);
                
                if($scope.data.order_id)
                {
                    $scope.search.assign_dr_name = { Key: $scope.data.dispatch_by_name, Value: $scope.data.dispatch_by };
                }
                // $scope.data.statusModel.hide();
                
            }
            
            
        }, function (err) {
            
            console.error(err);
        }); 
        
    }
    
    
    $scope.dis_list = [];
    $scope.getDistributor = function()
    {
        myRequestDBService.getDistributor($scope.order_type)
        .then(function(resp)
        {
            console.log(resp);
            $scope.dis_list = resp.dis_list;
        });
    }
    
    $scope.edit_order = function(orderId,orderData)
    {
        myAllSharedService.drTypeFilterData.orderId = orderId;
        myAllSharedService.drTypeFilterData.orderData = orderData;
        
        $scope.getDrDetailData(orderData.dr_id);
        console.log(orderData);
        
        $state.go("tab.sfa-order-add");
    }
    
    $scope.getDrDetailData = function(drId) {
        
        console.log(drId);
        
        myRequestDBService.getDrDetailData(drId).then(function(response)
        {
            console.log(response);
            if(response.status!='error')
            {
                $scope.drDetail = response;
                myAllSharedService.drTypeFilterData.drDetail = JSON.parse(JSON.stringify( $scope.drDetail));
                
                $scope.data.typeId = $scope.drDetail.drData.type_id;
                $scope.search.drName = { Key: $scope.drDetail.drData.dr_name, Value: $scope.drDetail.drData.id };
                $scope.search.drDetail = $scope.drDetail.drData;
                console.log($scope.search.drDetail);
            }
            else
            {
                $scope.search.drDetail = {};
            }
        }, function (err) {
            
            console.error(err);
        });
    }
    
    $scope.dr_list = [];
    $scope.order_no = 0;
    $scope.get_dr_list = function()
    {
        console.log($scope.order_type);
        
        myRequestDBService.get_dr_list({order_type:$scope.order_type})
        .then(function(resp)
        {
            console.log(resp);
            $scope.dr_list = resp.dr_list;
            $scope.order_no = resp.order_no.order_no;
        });
    }
    
    $scope.clear_data  = function()
    {
        $scope.cartSummaryData = {};
        $scope.cartItemData = [];
        myAllSharedService.drTypeFilterData.orderData = {};
    }
    
    if($location.path() == '/tab/sfa-order-add')
    {
       
        {
            
            
            var label
            
            if($scope.order_type=='secondary')
            {
                label = 'Dealer';
            }
            else
            {
                label = 'Distributor';
            }
            $scope.itemList = [];
            
            $scope.search.categoryName = { Key: "Select Category", Value: "" };
            $scope.search.subCategoryName = { Key: "Select Sub Category", Value: "" };
            $scope.search.product = { Key: "Select Product", Value: "" };
            $scope.search.dr_name = { Key: "Select "+label, Value: "" };
            $scope.search.assign_dr_name = { Key: "Select Distributor", Value: "" };
            
            $scope.data.payment_type = 'cash';
            console.log(myAllSharedService.drTypeFilterData.orderData);
            
            if(myAllSharedService.drTypeFilterData.orderData && myAllSharedService.drTypeFilterData.orderData.order_type != undefined) {
                
                myAllSharedService.drTypeFilterData.referFrom = null;
                $scope.cartSummaryData = {};
                $scope.order_type = myAllSharedService.drTypeFilterData.orderData.order_type;
                $scope.data = myAllSharedService.drTypeFilterData.orderData;
                $scope.search.dr_name = { Key: $scope.data.dr_name, Value: $scope.data.dr_id };
                $scope.data.order_date = new Date($scope.data.order_date);
                $scope.get_dr_list();
                console.log($scope.search);
                console.log($scope.cartItemData);
                $scope.data.dr_id = $scope.data.dr_id;
                $scope.data.basicAmount = $scope.data.item_total;
                $scope.data.grandTatal = $scope.data.net_total;
                $scope.data.netAmount = $scope.data.sub_total;
                $scope.data.sgstAmount = $scope.data.sgst_amt;
                $scope.data.igstAmount = $scope.data.igst_amt;
                $scope.data.cgstAmount = $scope.data.cgst_amt;
                $scope.data.discountedAmount = $scope.data.dis_amt;
                $scope.data.order_id = $scope.data.id;
                $scope.data.payment_type = $scope.data.payment_type;
                
                $scope.onGetCartItemDataHandler('fetchCategoryData', '' , 1);
                
                
                if($scope.data.dr_id && $scope.order_type=='secondary')
                {
                    $scope.getAssignDistributor();
                    $scope.getDistributor();
                    
                }
                $scope.cartItemData = [];
                
                $scope.data.itemData.forEach(element => {
                    $scope.cartItemData.push({
                        warranty: element.warranty,
                        categoryName: element.category,
                        subCategoryName: element.sub_category,
                        productName: element.product_name,
                        productCode: element.product_code,
                        qty: element.qty,
                        rate: element.rate,
                        discount: element.dis_percent,
                        discountAmount : element.dis_amt,
                        igst: element.igst_percent,
                        cgst: element.cgst_percent,
                        sgst: element.sgst_percent,
                        cgstAmount: element.cgst_amount,
                        sgstAmount: element.sgst_amount,
                        igstAmount: element.igst_amount,
                        subTotal : element.amount,
                        netTotal : element.item_total,
                        grandTotal : element.item_net_total,
                    });
                    
                });
                
                $scope.cartSummaryData.order_id = $scope.data.id;
                $scope.cartSummaryData.discountAmount = $scope.data.dis_amt;
                $scope.cartSummaryData.discountedAmount = $scope.data.item_total;
                $scope.cartSummaryData.cgstAmount = $scope.data.cgst_amt;
                $scope.cartSummaryData.sgstAmount = $scope.data.sgst_amt;
                $scope.cartSummaryData.igstAmount = $scope.data.igst_amt
                $scope.cartSummaryData.itemFinalAmount = $scope.data.net_total;
                
            } 
            else if(myAllSharedService.drTypeFilterData.dr_id && myAllSharedService.drTypeFilterData.referFrom =='network')
            {
                $scope.data.order_date = new Date();
                $scope.get_dr_list();
                console.log("welcome");
                $scope.data.dr_id = $scope.data.dr_id;
                $scope.search.dr_name = { Key: myAllSharedService.drTypeFilterData.dr_name, Value:myAllSharedService.drTypeFilterData.dr_id };
                
            }
            else {
                myAllSharedService.drTypeFilterData.referFrom = null;
                $scope.data.order_date = new Date();
                $scope.get_dr_list();
            }
            
            console.log($scope.data);
        }
    }
    
    $scope.onGoToOrderAddHandler = function()
    {
        if($location.path() == '/tab/sfa-order-list') {
            
            myAllSharedService.drTypeFilterData.isInsideLead = 'No';
            myAllSharedService.drTypeFilterData.orderId = '';




        }
        
        myAllSharedService.drTypeFilterData.order_type = $scope.order_type;
        $state.go('tab.sfa-order-add');
    }
    
    $scope.tmpOrderList = [];
    $scope.getOrderListData = function(targetSRC) {
        
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
            });
        // if(!$scope.data.search && targetSRC != 'scroll')
        // {
        // }
        $scope.isRequestInProcess = true;
        
        myRequestDBService.orpPostServiceRequest('/invoice/getPendingOrderList','')
        .then(function(response)
        {
            $ionicLoading.hide();
            console.log(response);
            const result = response.data;
            console.log(result);
            $scope.orderList=result;
            $scope.tmpOrderList = $scope.orderList;
            myAllSharedService.drTypeFilterData.orderList = $scope.orderList;
            $scope.isRequestInProcess = false;
            
            if(targetSRC == 'onLoad' || targetSRC == 'onRefresh') {
                $scope.onPageScrollTopHandler();
            }
            if(targetSRC == 'scroll') {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
            if(targetSRC == 'onRefresh')
            {
                $scope.$broadcast('scroll.refreshComplete');
                $cordovaToast.show('Refreshed Successfully', 'short', 'bottom').then(function (success) {
                }, function (error) {
                });
            }
            if(!result || result.length == 0) {
                $scope.noMoreListingAvailable = true;
            }
            $scope.currentPage += 1;
        }, function (err)
        {
            $ionicLoading.hide();
            $scope.isRequestInProcess = false;
            console.error(err);
        });
        
    }
    
  
    

    $scope.filterOrderListList = function(search)
    {
        search = search.toLowerCase();
        
        console.log(search);
        $scope.orderList = [];
        console.log($scope.orderList);

      console.log($scope.tmpOrderList);

        $scope.orderList = $scope.tmpOrderList.filter(row=>row.dr_code.includes(search) || row.order_no.toLowerCase().includes(search) || row.dr_name.toLowerCase().includes(search));

        console.log($scope.orderList);
       

        console.log(searchArray);

    }

    if($location.path() == '/tab/sfa-order-list')
    {
        console.log("hello1");
        console.log(myAllSharedService.drTypeFilterData);
        if(myAllSharedService.drTypeFilterData.order_type != undefined)
        {
            $scope.order_type = myAllSharedService.drTypeFilterData.order_type;
            $scope.data.orderCreatedBy = myAllSharedService.drTypeFilterData.orderCreatedBy;
            if(myAllSharedService.drTypeFilterData.referFrom=='network')
            {
                $scope.data.dr_id = myAllSharedService.drTypeFilterData.drId;
                
            }
        }
        else
        {
            $scope.order_type = 'primary';
            $scope.data.orderCreatedBy = 'me';
        }
        $scope.getOrderListData('onLoad');
    }

    if($location.path() == '/tab/billing-detail')
    {console.log("hello");
        console.log(myAllSharedService.drTypeFilterData);
        if(myAllSharedService.drTypeFilterData.order_type != undefined)
        {
            $scope.order_type = myAllSharedService.drTypeFilterData.order_type;
            $scope.data.orderCreatedBy = myAllSharedService.drTypeFilterData.orderCreatedBy;
            if(myAllSharedService.drTypeFilterData.referFrom=='network')
            {
                $scope.data.dr_id = myAllSharedService.drTypeFilterData.drId;
                
            }
        }
        else
        {
            $scope.order_type = 'primary';
            $scope.data.orderCreatedBy = 'me';
        }
        $scope.getOrderListData('onLoad');
    }
    
    $scope.check_val = function()
    {
        console.log($scope.data.discountPercent);
        console.log($scope.data.gstPercent);
        
        if($scope.data.discountPercent != null && $scope.data.discountPercent != undefined)
        {
            if($scope.data.discountPercent > 100)
            {
                $scope.data.discountPercent = 100;
            }
        }
        
        if($scope.data.gstPercent != null && $scope.data.gstPercent != undefined)
        {
            if($scope.data.gstPercent > 100)
            {
                $scope.data.gstPercent = 100;
            }
        }
    }
    $scope.data.totalItemQty = 0;
    $scope.data.basicAmount = 0;
    $scope.data.discountAmount = 0;
    $scope.data.discountedAmount = 0;
    $scope.data.cgstAmount = 0;
    $scope.data.sgstAmount = 0;
    $scope.data.igstAmount = 0;
    $scope.data.itemGstAmount = 0;
    $scope.data.netAmount = 0;
    $scope.calculateOrderAmount = function(orderArray = [])
    {
        $scope.data.totalItemQty = 0;
        $scope.data.basicAmount = 0;
        $scope.data.discountedAmount = 0;
        $scope.data.cgstAmount = 0;
        $scope.data.sgstAmount = 0;
        $scope.data.igstAmount = 0;
        $scope.data.netAmount = 0;
        $scope.data.grandTatal = 0;
        
        for (var i = 0; i < orderArray.length; i++) 
        {
            $scope.data.totalItemQty = parseInt(orderArray[i]['qty'])+$scope.data.totalItemQty;
            $scope.data.basicAmount = parseFloat(orderArray[i]['subTotal']) + $scope.data.basicAmount;
            $scope.data.netAmount = parseFloat(orderArray[i]['netTotal']) + parseFloat($scope.data.netAmount);
            $scope.data.subToatlAmount = parseFloat(orderArray[i]['netTotal']) + $scope.data.subToatlAmount;
            $scope.data.discountedAmount = parseFloat(orderArray[i]['discountAmount']) + parseFloat($scope.data.discountedAmount);
            $scope.data.cgstAmount = parseFloat(orderArray[i]['cgstAmount'])+parseFloat($scope.data.cgstAmount);
            $scope.data.sgstAmount = parseFloat(orderArray[i]['sgstAmount'])+parseFloat($scope.data.sgstAmount);
            $scope.data.igstAmount = parseFloat(orderArray[i]['igstAmount'])+parseFloat($scope.data.igstAmount);
            $scope.data.grandTatal = parseFloat(orderArray[i]['grandTotal']) + parseFloat($scope.data.grandTatal);
        }
        
        console.log($scope.data.netAmount);
        
        
    }
    
    $scope.onAddToCartHandler = function(targetType) {
        
        console.log(targetType);
        console.log($scope.data.item);
        
        for (var i = 0; i < $scope.data.item.length; i++) 
        {
            var index = $scope.itemList.findIndex(row=>row.Key==$scope.data.item[i]);
            
            var itemrate=$scope.itemList[index]['price'] ? $scope.itemList[index]['price'] : 0;
            var itemqty=$scope.itemList[index]['qty'] ? $scope.itemList[index]['qty'] : 1;
            var itemSubtotal = parseFloat(itemrate) * parseInt(itemqty);
            var gst = $scope.itemList[index]['gst'] ? $scope.itemList[index]['gst'] : 0;
            var itemIgst = $scope.itemList[index]['gst'] ? $scope.itemList[index]['gst'] : 0;
            var itemCgst = $scope.itemList[index]['gst'] ? $scope.itemList[index]['gst']/2 :0;
            var itemSgst = $scope.itemList[index]['gst'] ? $scope.itemList[index]['gst']/2 : 0;
            var itemdiscount = $scope.itemList[index]['discount'] ? $scope.itemList[index]['discount'] : 0;
            var itemdiscountAmount = parseFloat(itemSubtotal)*parseInt(itemdiscount)/100;
            var itemIgstAmount = parseFloat(itemSubtotal) * itemIgst/100;
            var itemCgstAmount = parseFloat(itemSubtotal) * itemCgst/100;
            var itemSgstAmount = parseFloat(itemSubtotal) * itemSgst/100;
            var itemNettotal=parseFloat(itemSubtotal) - parseFloat(itemdiscountAmount);
            
            
            console.log(index);
            var idx = $scope.cartItemData.findIndex(row=>row.productCode==$scope.itemList[index]['product_code']);
            
            if(idx == -1)
            {
                $scope.cartItemData.push({
                    categoryName:$scope.itemList[index]['category'],
                    subCategoryName:$scope.itemList[index]['sub_category'],
                    productName:$scope.itemList[index]['product_name'],
                    productCode:$scope.itemList[index]['product_code'],
                    productId:$scope.itemList[index]['id'],
                    qty:itemqty,
                    discount:itemdiscount,
                    gst:gst,
                    rate:itemrate,
                    igst:itemIgst,
                    cgst:itemCgst,
                    sgst:itemSgst,
                    subTotal:itemSubtotal,
                    discountAmount:itemdiscountAmount,
                    netTotal : itemNettotal,
                    igstAmount:itemIgstAmount,
                    cgstAmount:itemCgstAmount,
                    sgstAmount:itemSgstAmount,
                    grandTotal:parseFloat(itemNettotal) - (parseFloat(itemIgstAmount)+ parseFloat(itemCgstAmount) + parseFloat(itemSgstAmount)),
                    warranty:$scope.itemList[index]['warranty'],
                });
            }
            
        }
        
        $scope.data.item = [];
        
        console.log($scope.cartItemData);
        
        
        $scope.calculateOrderAmount($scope.cartItemData);
        
    }
    
    
    $scope.calculateItemTotal = function(itemArray = [])
    {
        console.log(itemArray);
        
        for (var i = 0; i < itemArray.length; i++) 
        {
            itemArray[i]['subTotal'] = parseFloat(itemArray[i]['rate']) * parseInt(itemArray[i]['qty']);
            itemArray[i]['igst'] = parseInt(itemArray[i]['gst']);
            itemArray[i]['cgst'] = itemArray[i]['gst']!=0 ? parseInt(itemArray[i]['gst'])/2:0;
            itemArray[i]['sgst'] = itemArray[i]['gst']!=0 ? parseInt(itemArray[i]['gst'])/2:0;
            itemArray[i]['igstAmount'] = parseFloat(itemArray[i]['subTotal']) * itemArray[i]['igst']/100;
            itemArray[i]['cgstAmount'] = parseFloat(itemArray[i]['subTotal']) * itemArray[i]['cgst']/100;
            itemArray[i]['sgstAmount'] = parseFloat(itemArray[i]['subTotal']) * itemArray[i]['sgst']/100;
            itemArray[i]['discountAmount'] = parseFloat(itemArray[i]['subTotal'])*parseInt(itemArray[i]['discount'])/100;
            itemArray[i]['netTotal'] = parseFloat(itemArray[i]['subTotal']) - parseFloat(itemArray[i]['discountAmount']);
            itemArray[i]['grandTotal'] = parseFloat(itemArray[i]['netTotal']) - (parseFloat(itemArray[i]['igstAmount'])+ parseFloat(itemArray[i]['cgstAmount']) + parseFloat(itemArray[i]['sgstAmount']));
        }
        
        $scope.calculateOrderAmount(itemArray);
        
    }
    
    $scope.removeItem = function(index)
    {
        $scope.cartItemData.splice(index,1);
        console.log($scope.cartItemData);
        $scope.calculateItemTotal($scope.cartItemData);
        
        
        
    }
    
    $scope.calculateOrder = function()
    {
        
        console.log($scope.cartItemData);
        
        $scope.calculateItemTotal($scope.cartItemData);
    }
    $scope.submitSfaOrderData = function()
    {
        $scope.data.order_type  = $scope.order_type;
        $scope.data.order_date  = moment($scope.data.order_date).format('YYYY-MM-DD');
        $scope.data.itemArray  = $scope.cartItemData;
        console.log($scope.data);
        
        if($scope.data.dr_id)
        {
            if($scope.order_type=='secondary' && !$scope.data.dispatch_by)
            {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: "Distributor not selected !!"
                });
                return;
            }
            
            if($scope.data.itemArray.length==0)
            {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: "No any item add in cart!"
                });
                return;
            }
            else
            {
                
                $ionicPopup.confirm({
                    
                    title: 'Are You Sure, You Want to Submit ?',
                    buttons: [{
                        
                        text: 'YES',
                        type: 'button-block button-outline button-stable',
                        onTap: function (e) {
                            
                            $ionicLoading.show({
                                template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
                            });
                            
                            myRequestDBService.sfaPostServiceRequest('/App_Order/onSubmitOrder',$scope.data)
                            .then(function(response) 
                            {
                                if(response.status=='Success')
                                {
                                    $ionicLoading.hide();
                                    $state.go('tab.sfa-order-list');
                                    $cordovaToast.show('Order Saved Successfully', 'short', 'bottom').then(function (success) {
                                    }, function (error) {
                                    });
                                }
                                console.log(response);
                                
                            }, function (err) {
                                
                                $ionicPopup.alert({
                                    title: 'Error!',
                                    template: 'Something went wrong !!'
                                });
                                
                                console.error(err);
                            });
                            
                            
                        }
                    },
                    {
                        
                        text: 'NO',
                        type: 'button-block button-outline button-stable',
                        onTap: function (e) {
                            console.log('You Are Not Sure');
                        }
                    }]
                });
                
            }
            
        }
        else
        {
            $ionicPopup.alert({
                title: 'Error!',
                template: (($scope.order_type == 'primary') ? 'Distributor' : 'Dealer')+" Does Not Selected!"
            });
            return;
        }
        
        
        
        
        
    }
    
    $scope.onCalculateSummaryTotalDataHandler = function() {
        
        $scope.cartSummaryData.itemCount = $scope.cartItemData.length;
        
        $scope.cartSummaryData.preDiscountTotal = 0;
        $scope.cartSummaryData.discountAmount = 0;
        
        $scope.cartSummaryData.discountedAmount = 0;
        
        $scope.cartSummaryData.cgstAmount = 0;
        $scope.cartSummaryData.sgstAmount = 0;
        $scope.cartSummaryData.igstAmount = 0;
        $scope.cartSummaryData.itemGstAmount = 0;
        
        $scope.cartSummaryData.itemFinalAmount = 0;
        
        for (let index = 0; index < $scope.cartItemData.length; index++) {
            
            $scope.cartSummaryData.preDiscountTotal += $scope.cartItemData[index].amount;
            $scope.cartSummaryData.discountAmount += $scope.cartItemData[index].discountAmount;
            
            $scope.cartSummaryData.discountedAmount += $scope.cartItemData[index].discountedAmount;
            
            $scope.cartSummaryData.cgstAmount += $scope.cartItemData[index].cgstAmount;
            $scope.cartSummaryData.sgstAmount += $scope.cartItemData[index].sgstAmount;
            $scope.cartSummaryData.igstAmount += $scope.cartItemData[index].igstAmount;
            
            $scope.cartSummaryData.itemGstAmount += $scope.cartItemData[index].itemGstAmount;
            $scope.cartSummaryData.itemFinalAmount += $scope.cartItemData[index].itemFinalAmount;
        }
    }
    
    $scope.onCalculateItemTotalHandler = function(targetType)
    {
        
        console.log($scope.data.dr_id);
        console.log(myAllSharedService.drTypeFilterData.drDetail);
        if(myAllSharedService.drTypeFilterData.drDetail.drData)
        {
            $scope.search.drDetail = myAllSharedService.drTypeFilterData.drDetail.drData;
        }
        
        
        let qty = 0;
        let rate = 0;
        let discountPercent = 0;
        let gstPercent = 0;
        let cgstPercent = 0;
        let sgstPercent = 0;
        let igstPercent = 0;
        let cgstAmount = 0;
        let sgstAmount = 0;
        let igstAmount = 0;
        
        if($scope.data.qty)
        {
            qty = $scope.data.qty;
        }
        
        if($scope.data.rate)
        {
            rate = $scope.data.rate;
        }
        
        if($scope.data.discountPercent)
        {
            discountPercent = $scope.data.discountPercent;
        }
        
        if($scope.data.gstPercent)
        {
            gstPercent = $scope.data.gstPercent;
        }
        
        $scope.data.amount = qty * rate;
        $scope.data.discountAmount = $scope.data.amount * (discountPercent/100);
        $scope.data.discountedAmount = $scope.data.amount - $scope.data.discountAmount;
        
        let stateName;
        if(targetType == 'Quotation') {
            stateName = $scope.drDetail.drData.state_name;
        }
        
        if(targetType == 'Order') {
            console.log($scope.search);
            
            if($scope.search.drDetail == undefined || !$scope.search.drDetail.state_name)
            {
                if($scope.search.drDetail == undefined)
                {
                    $ionicPopup.alert({
                        title: 'Error!',
                        template: 'Please Select '+(($scope.order_type == 'primary') ? 'Distributor' : 'Dealer')+'!'
                    });
                }
                else
                {
                    $ionicPopup.alert({
                        title: 'Error!',
                        template: (($scope.order_type == 'primary') ? 'Distributor' : 'Dealer')+"'s State Does Not Exists!"
                    });
                }
            }
            else
            {
                stateName = $scope.search.drDetail.state_name;
            }
        }
        
        if(stateName == 'DELHI')
        {
            let gstPercentApply = gstPercent/2;
            
            cgstPercent = gstPercentApply;
            cgstAmount = amount * (cgstPercent/100);
            
            sgstPercent = gstPercentApply;
            sgstAmount = $scope.data.discountedAmount * (sgstPercent/100);
            
            igstPercent = 0;
            igstAmount = 0;
            
        }
        else
        {
            let gstPercentApply = gstPercent;
            console.log(gstPercentApply);
            
            cgstPercent = 0;
            cgstAmount = 0;
            
            sgstPercent = 0;
            sgstAmount = 0;
            
            igstPercent = gstPercentApply;
            igstAmount = $scope.data.discountedAmount * (igstPercent/100);
        }
        
        $scope.data.cgstPercent = cgstPercent;
        $scope.data.cgstAmount = cgstAmount;
        
        $scope.data.sgstPercent = sgstPercent;
        $scope.data.sgstAmount = sgstAmount;
        
        $scope.data.igstPercent = igstPercent;
        $scope.data.igstAmount = igstAmount;
        
        $scope.data.itemGstAmount = $scope.data.cgstAmount + $scope.data.sgstAmount + $scope.data.igstAmount;
        
        $scope.data.itemFinalAmount = $scope.data.discountedAmount + $scope.data.itemGstAmount;
        console.log($scope.data);
    }
    
    
    $scope.onDeleteFromCartHandler = function(index) {
        
        $ionicPopup.confirm({
            
            title: 'Are You Sure, You Want to Delete Item ?',
            buttons: [{
                
                text: 'YES',
                type: 'button-block button-outline button-stable',
                onTap: function (e) {
                    
                    $scope.cartItemData.splice(index, 1);
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
    
    
    $scope.onSaveRequirementHandler = function() {
        
        $ionicPopup.confirm({
            
            title: 'Are You Sure, You Want to Save Requirement ?',
            buttons: [{
                
                text: 'YES',
                type: 'button-block button-outline button-stable',
                onTap: function (e) {
                    
                    $ionicLoading.show({
                        template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
                    });
                    
                    myRequestDBService.onSaveRequirementHandler(myAllSharedService.drTypeFilterData.drId, $scope.cartItemData).then(function(result) {
                        
                        console.log(result);
                        
                        $ionicLoading.hide();
                        $state.go('tab.lead-requirement-list');
                        
                        
                        $cordovaToast.show('Requirement Saved Successfully', 'short', 'bottom').then(function (success) {
                            
                        }, function (error) {
                            
                        });
                        
                    }, function (err) {
                        
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
    
    
    $scope.onSaveQuotationHandler = function() {
        
        $ionicPopup.confirm({
            
            title: 'Are You Sure, You Want to Save Quotation ?',
            buttons: [{
                
                text: 'YES',
                type: 'button-block button-outline button-stable',
                onTap: function (e) {
                    
                    $ionicLoading.show({
                        template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
                    });
                    
                    myRequestDBService.onSaveQuotationHandler(myAllSharedService.drTypeFilterData.drId, $scope.cartItemData, $scope.cartSummaryData, $scope.data.quoteId).then(function(result) {
                        
                        console.log(result);
                        
                        $ionicLoading.hide();
                        $state.go('tab.lead-quotation-list');
                        
                        $cordovaToast.show('Quotation Saved Successfully', 'short', 'bottom').then(function (success) {
                            
                        }, function (error) {
                            
                        });
                        
                    }, function (err) {
                        
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
    
    $scope.onSaveOrderHandler = function() {
        
        if($scope.order_type == 'secondary' && !$scope.data.dispatch_by) {
            
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Distributor Required!'
            });
            
            return false;
        }
        
        $ionicPopup.confirm({
            
            title: 'Are You Sure, You Want to Save Order ?',
            buttons: [{
                
                text: 'YES',
                type: 'button-block button-outline button-stable',
                onTap: function (e) {
                    
                    $ionicLoading.show({
                        template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
                    });
                    
                    $scope.cartSummaryData.order_date = $scope.data.order_date;
                    
                    if($scope.cartSummaryData.order_date)
                    {
                        $scope.cartSummaryData.order_date = moment($scope.cartSummaryData.order_date).format('YYYY-MM-DD');
                    }
                    
                    $scope.cartSummaryData.dr_id = $scope.data.dr_id;
                    $scope.cartSummaryData.dispatch_by = $scope.data.dispatch_by_name;
                    $scope.cartSummaryData.order_no = $scope.order_no;
                    $scope.cartSummaryData.order_type = $scope.order_type;
                    
                    myRequestDBService.onSaveOrder($scope.cartItemData, $scope.cartSummaryData).then(function(result)
                    {
                        console.log(result);
                        $ionicLoading.hide();
                        // $ionicHistory.goBack();
                        $state.go('tab.sfa-order-list');
                        $cordovaToast.show('Order Saved Successfully', 'short', 'bottom').then(function (success) {
                        }, function (error) {
                        });
                    }, function (err) {
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
    
    
    
    $scope.itemList = [];
    $scope.getItemList = function(value)
    {
        console.log(value);
        
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
        });
        
        var data = {category:value}
        $scope.itemList = [];
        myRequestDBService.sfaPostServiceRequest('/App_Order/getItemList',data)
        .then(function(response) {
            
            console.log(response);
            $ionicLoading.hide();
            
            if(response.status=='Success')
            {
                
                $scope.itemList = response.data;
            }
            
            
        }, function (err) {
            
            console.error(err);
        });
    }
    
    
    $scope.orderData={};
    $scope.saveStatus = function()
    {
        
        if($scope.orderData.status=='Reject' && !$scope.orderData.reason)
        {
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Reason Required!'
            });
            return;
        }
        else
        {
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
            });
            
            
            myRequestDBService.sfaPostServiceRequest('/App_Order/saveOrderStatus',$scope.orderData)
            .then(function(response) {
                
                console.log(response);
                
                if(response.status=='Success')
                {
                    $ionicLoading.hide();
                    $scope.data.statusModel.hide();
                    $scope.getOrderDetailData();
                    
                }
                
                
            }, function (err) {
                
                console.error(err);
            });
        }
        
        
    }
    
    
    
    $scope.$watch('search.dr_name', function (newValue, oldValue) {
        
        if (newValue && newValue.Value && newValue.Value != oldValue.Value) {
            
            console.log(newValue);
            
            $scope.data.dr_id = newValue.Value;
            $scope.data.dr_name = newValue.Key;
            $scope.data.type_name = newValue.type_name;
            
            $scope.onGetCartItemDataHandler('fetchCategoryData', '' , 1)
            
            if($scope.order_type=='secondary')
            {
                $scope.getAssignDistributor();
            }
            //     // $scope.search.subCategoryName = { Key: "Select Sub Category", Value: "" };
            //     // $scope.search.product = { Key: "Select Product", Value: "" };
            
            //     // $scope.subCategoryList = [];
            //     // $scope.productList = [];
            
            //     // $scope.getItemList(newValue.Value);
        }
    });
    
    $scope.$watch('search.assign_dr_name', function (newValue, oldValue) {
        
        if (newValue && newValue.Value && newValue.Value != oldValue.Value) {
            
            console.log(newValue);
            
            $scope.data.dispatch_by = newValue.Value;
            $scope.data.dispatch_by_name = newValue.Key;
            
        }
    });
    
    
    $scope.$watch('search.categoryName', function (newValue, oldValue) {
        
        if (newValue && newValue.Value && newValue.Value != oldValue.Value) {
            
            console.log(newValue);
            $scope.getItemList(newValue.Value);
            // console.log($scope.search.categoryName);
            
            // $scope.search.subCategoryName = { Key: "Select Sub Category", Value: "" };
            // $scope.search.product = { Key: "Select Product", Value: "" };
            
            // $scope.subCategoryList = [];
            // $scope.productList = [];
            
        }
    });
    
    
    // $scope.$watch('search.subCategoryName', function (newValue, oldValue) {
    
    //     if (newValue && newValue.Value && newValue.Value != oldValue.Value) {
    
    //         console.log('Go');
    //         console.log($scope.search.categoryName);
    //         console.log($scope.search.subCategoryName);
    
    //         $scope.search.product = { Key: "Select Product", Value: "" };
    //         $scope.productList = [];
    
    //         $scope.onGetCartItemDataHandler('fetchProductData', '', 1);
    //     }
    // });
    
    $scope.$watch('search.product', function (newValue, oldValue) {
        
        if (newValue && newValue.Value && newValue.Value != oldValue.Value) {
            
            console.log('Go');
            if($location.path() == '/tab/lead-quotation-add' || $location.path() == '/tab/order-add') {
                $scope.data.qty = 1;
                $scope.data.rate = $scope.search.product.price;
                $scope.data.amount = $scope.search.product.price;
            }
        }
    });
    
    
    $scope.onGetDrTypeDataHandler = function (type_info, searchKey, pagenumber) {
        
        if(!searchKey) {
            
            // $ionicLoading.show({
            //     template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
            //     duration: 3000
            // });
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
            });
        }
        
        if (fetchingRecords) return;
        fetchingRecords = true;
        
        let typeId = '';
        let typeName = '';
        
        if(type_info == 'orderFor') {
            
            typeId = $scope.data.typeId;
            typeName = $scope.data.typeName;
            
        } else if( type_info == 'orderDeliveryBy') {
            
            typeId = $scope.data.deliveryByTypeId;
            typeName = $scope.data.deliveryByTypeName;
        }
        
        var targetArr = {
            typeId: typeId,
            typeName: typeName,
            loginData: $scope.loginData,
            searchData: searchKey,
        };
        
        console.log(targetArr);
        
        searchSelect.onGetDrTypeDataHandler(targetArr, searchKey, pagenumber)
        .then(function (result) {
            console.log(result);
            $ionicLoading.hide();
            let updatedDrData = result.leadData;
            
            for (let index = 0; index < updatedDrData.length; index++) {
                
                updatedDrData[index].Key = updatedDrData[index].dr_name + ' - (' + updatedDrData[index].contact_mobile_no + ')';
                
                updatedDrData[index].Value = updatedDrData[index].id;
            }
            
            if(type_info == 'orderFor') {
                
                $scope.drList = updatedDrData;
                $scope.totalDrRecords = 0;
                
            } else if( type_info == 'orderDeliveryBy') {
                
                $scope.drDeliveryByList = updatedDrData;
                $scope.totalDeliveryByDrRecords = 0;
            }
            
            fetchingRecords = false;
            
        }, function (errorMessage) {
            
            console.log(errorMessage);
            window.console.warn(errorMessage);
            fetchingRecords = false;
        });
    };
    
    
    
    $scope.onGetTypeListForOrderCreateHandler = function() {
        
        myRequestDBService.onGetTypeListForOrderCreateHandler().then(function(response) {
            
            console.log(response);
            $scope.drOrderTypeData = response.typeData;
            
        }, function (err) {
            
            console.error(err);
        });
    }
    
    
    $scope.onDrTypeChangeHandler = function() {
        
        const isIndex = this.drOrderTypeData.findIndex(row => row.id == $scope.data.typeId);
        $scope.data.typeName = this.drOrderTypeData[isIndex].type;
        
        $scope.search.drName = { Key: "Select "+$scope.data.typeName+"*", Value: "" };
        $scope.onGetDrTypeDataHandler('orderFor', '', 1);
    }
    
    
    $scope.onGetDeliveryByTypeListHandler = function() {
        
        myRequestDBService.onGetDeliveryByTypeListHandler().then(function(response) {
            
            console.log(response);
            $scope.deliveryByTypeList = response.typeData;
            
        }, function (err) {
            
            console.error(err);
        });
    }
    
    
    
    $scope.getOrderDetailData = function() {
        
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
        });
        
console.log( $scope.data.orderId);
        myRequestDBService.orpPostServiceRequest('/invoice/getPendingOrderDetail',$scope.data.orderId).then(function(response) {
            
            console.log(response.data);
            
            $scope.orderDetail = response.data;
            
            $ionicLoading.hide();
            
        }, function (err) {
            
            $ionicLoading.hide();
            console.error(err);
        });
    }
    
    
    
    
    
    
    if($location.path() == '/tab/sfa-order-detail') {
        
        $scope.data.orderId = myAllSharedService.drTypeFilterData.orderId;
        $scope.getOrderDetailData();
        
        // $ionicPopover.fromTemplateUrl('add-status', {
        //     scope: $scope,
        // }).then(function(popovers) {
        //     $scope.data.statusModel = popovers;
        // });
    }
    
    
    $scope.onGoToOrderDetailPage = function(orderId)
    {
        myAllSharedService.drTypeFilterData.orderId = orderId;
        $state.go('tab.sfa-order-detail');
    }

    $scope.onGoToBillingDetailPage = function(orderId)
    {
        myAllSharedService.billingdetail = orderId;
        $state.go('tab.billing-detail');
    }
    
    
    if($location.path() == '/tab/lead-requirement-add' || $location.path() == '/tab/lead-quotation-add') {
        
        $scope.search.categoryName = { Key: "Select Category", Value: "" };
        $scope.search.subCategoryName = { Key: "Select Sub Category", Value: "" };
        $scope.search.product = { Key: "Select Product", Value: "" };
        
        $scope.onGetCartItemDataHandler('fetchCategoryData', '' , 1);
        
        if($location.path() == '/tab/order-add') {
            
            $scope.search.drName = { Key: "Select Company *", Value: "" };
            
            $scope.onGetTypeListForOrderCreateHandler();
            $scope.onGetDeliveryByTypeListHandler();
            
            console.log('Rectangle');
            $scope.data.drId = myAllSharedService.drTypeFilterData.drId;
            
            console.log(myAllSharedService.drTypeFilterData.isInsideLead);
            
            if(myAllSharedService.drTypeFilterData.isInsideLead == 'Yes') {
                $scope.getDrDetailData($scope.data.drId);
            }
        }
        
        if($location.path() == '/tab/lead-quotation-add') {
            
            $scope.data.quoteId = myAllSharedService.drTypeFilterData.quoteId;
            
            if(myAllSharedService.drTypeFilterData.quoteId) {
                
                $scope.quoteDetail = myAllSharedService.drTypeFilterData.quoteDetail;
                
                $scope.quoteDetail.itemData.forEach(itemRow => {
                    
                    $scope.search.categoryName = {Key: itemRow.category, Value: itemRow.category};
                    $scope.search.subCategoryName = {Key: itemRow.sub_category, Value: itemRow.sub_category};
                    
                    const productKey = itemRow['product_name'] + ' - (' + itemRow['product_code'] + ')';
                    $scope.search.product = {
                        
                        Key: productKey,
                        Value: itemRow.product_id,
                        product_name: itemRow.product_name,
                        product_code: itemRow.product_code,
                        product_id: itemRow.product_id
                    };
                    
                    $scope.data.qty = itemRow.qty;
                    $scope.data.rate = itemRow.rate;
                    $scope.data.discount = itemRow.dis_percent;
                    $scope.data.amount = itemRow.item_total;
                    
                    $scope.onAddToCartHandler('Quotation');
                    
                });
                
                setTimeout(() => {
                    
                    $scope.search.categoryName = { Key: "Select Category", Value: "" };
                    $scope.search.subCategoryName = { Key: "Select Sub Category", Value: "" };
                    $scope.search.product = { Key: "Select Product", Value: "" };
                    
                }, 2000);
                
            }
        }
    }
    
    
    $scope.onModifyTypeHandler = function(type)
    {
        $scope.data.orderCreatedBy = type;
        $scope.onSetCurrentPageHandler();
        $scope.getOrderListData('onLoad');
    }
    
    
    $scope.onSeachActionHandler = function(type) {
        
        if(type == 'open') {
            
            $scope.isSearchBarOpen = true;
            
            setTimeout(() => {
                
                $('#searchData').focus();
                
            }, 1000);
        }
        
        if(type == 'close') {
            
            $scope.data.search = '';
            $scope.isSearchBarOpen = false;
            // $scope.onSetCurrentPageHandler();
            $scope.billinglistdata();

            $scope.getOrderListData('onLoad');
        }
    }
    
    $scope.onSetCurrentPageHandler = function()
    {
        $scope.currentPage = 1;
        $scope.orderList = [];
        $scope.onPageScrollTopHandler();
        $scope.noMoreListingAvailable = false;
    }
    
    $scope.onPageScrollTopHandler = function()
    {
        $ionicScrollDelegate.scrollTop();
    }
    
    $scope.goToBackPageHandler = function() 
    {
        $ionicHistory.goBack();
    }
    
    
    $scope.data.item = [];
    $scope.addItemInList = function (value) {
        console.log(value);
        
        var idx = $scope.data.item.findIndex(row=>row==value.Key)
        if(idx != -1)
        {
            $scope.data.item.splice(idx,1);
        }
        else
        {
            $scope.data.item.push(value.Key)
        }
        console.log($scope.data.item);
        
    };
    
    $scope.removeItemFromList = function (value) {
        console.log(value);
        
        var idx = $scope.data.item.indexOf(value);
        $scope.data.item.splice(idx,1);
    };
    
    $scope.getRoundAmountHandler = function(val) {
        if(val!=0)
        {
            return val.toFixed(2);
        }
        else
        {
            return val;
        }
    }
    
    setTimeout(() => {
        
        console.log('last console');
        console.log($scope.data);
        
        
    }, 5000);
    
    
    
    
})





