
app.controller('orderCtrl', function ($scope, $rootScope, searchSelect, $ionicModal, $state, myRequestDBService, myAllSharedService, $ionicLoading, $cordovaSQLite, $ionicPopup, $timeout, $ionicActionSheet, $cordovaImagePicker, Camera, $cordovaFileTransfer, $cordovaGeolocation, $cordovaToast, $location, $window, $ionicPlatform, $ionicHistory, $ionicModal,$stateParams, $ionicScrollDelegate, $ionicPopover) {
    
    $scope.loginData = myAllSharedService.loginData;
    $scope.isRequestInProcess;
    $scope.orderList = [];
    
    $scope.data = {};
    $scope.search = {};
    
    $scope.data.isInsideLead = myAllSharedService.drTypeFilterData.isInsideLead;
    
    $scope.categoryList = [];
    $scope.subCategoryList = [];
    $scope.productList = [];
    
    $scope.drList = [];
    $scope.drDeliveryByList = [];
    
    
    $scope.cartItemData = [];
    $scope.cartSummaryData = {};
    $scope.drDetail = myAllSharedService.drTypeFilterData.drDetail;
    
    
    $scope.drOrderTypeData = [];
    $scope.deliveryByTypeList = [];
    
    $scope.currentPage = 1;
    $scope.pageSize = 5;
    
    $scope.currentDate = moment().format('YYYY-MM-DD');
    $scope.selectedDate = moment().format('YYYY-MM-DD');
    
    $scope.isSearchBarOpen = false;
    $scope.currentActiveTab = 1;
    $scope.noMoreListingAvailable = false;
    
    
    // $scope.addOtherAddress = function()
    // {
    //     $scope.data.otherAddresModel.show();
    // }
    
    // $scope.shippingAddressAction = function()
    // {
    
    //     console.log('test');
    
    //     if($scope.data.address==0)
    //     {
    //         $scope.addOtherAddress();
    //     }
    //     else if($scope.data.address == 'Current')
    //     {
    //         console.log($scope.data);
    
    //     }
    //     else
    //     {
    //         var index = $scope.dealerShippingAddress.findIndex(row=>row.id==$scope.data.address);
    
    //         $scope.data.state_name = $scope.dealerShippingAddress[index]['shipping_state'];
    //         $scope.data.shippingAddress = $scope.dealerShippingAddress[index]['address'];
    
    //         console.log($scope.data);
    
    //     }
    
    
    // }
    

    if($location.path() == 'billing-list') {
        
        console.log("hello");
        // $scope.data.orderId = myAllSharedService.drTypeFilterData.orderId;
        // $scope.getOrderDetailData();
    }
    
    $scope.dealerShippingAddress = [];
    $scope.drShippingArray = [{'address':'Other','id':0}];
    $scope.getDetail = function(id)
    {
        
        $scope.shippingForm.drId = id;
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        myRequestDBService.onGetPostRequest('/App_Order/getdrDetail',{dr_id:id})
        .then(function(response) {
            console.log(response);
            
            var tmpShippingArray = [];
            
            tmpShippingArray = response.data.shipping_address;
            $scope.dealerShippingAddress = response.data.shipping_address;
            
            $scope.drShippingArray.push({'address':'Current Address','id':'Current'});
            
            for (var i = 0; i < tmpShippingArray.length; i++)
            {
                $scope.drShippingArray.push({'address':tmpShippingArray[i]['shipping_street']+' '+tmpShippingArray[i]['shipping_city']+' '+tmpShippingArray[i]['shipping_district']+' '+tmpShippingArray[i]['shipping_state']+' '+tmpShippingArray[i]['shipping_pincode'],id:tmpShippingArray[i]['id']})
            }
            
            $scope.data.address='Current';
            $scope.data.shippingAddress=response.data.street +' '+response.data.city +' '+response.data.district_name +' '+response.data.state_name +' '+response.data.pincode;
            
            
            console.log($scope.drShippingArray);
            
            $ionicLoading.hide();
            
            
        }, function (err) {
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Something went wrong !!'
            });
            console.error(err);
        });
        
        console.log($scope.shippingForm);
        
    }
    
    
    $scope.onAddToCartHandler = function(targetType) {
        
        let isInputEmpty = false;
        let emptyMsg = '';
        
        if(!$scope.data.category) {
            
            isInputEmpty = true;
            emptyMsg = 'Category Required!';
            
        } else  if(!$scope.data.sub_category ) {
            
            isInputEmpty = true;
            emptyMsg = 'Sub Category Required!';
            
        } else  if(!$scope.data.product_id) {
            
            isInputEmpty = true;
            emptyMsg = 'Product Required!';
            
        } else  if(!$scope.data.qty || $scope.data.qty < 0 || $scope.data.qty == 0) {
            
            isInputEmpty = true;
            emptyMsg = 'Qty Required!';
        }
        
        
        // if(targetType != 'Requirement') {
        
        //     if(!$scope.data.amount || $scope.data.rate < 0 || $scope.data.rate == 0) {
        
        //         isInputEmpty = true;
        //         emptyMsg = 'Amount Required!';
        //     }
        
        
        //     if(!$scope.data.gstPercent || $scope.data.gstPercent < 0 || $scope.data.gstPercent == 0) {
        
        //         isInputEmpty = true;
        //         emptyMsg = 'GST Required!';
        //     }
        
        //     if(!$scope.data.rate || $scope.data.rate < 0 || $scope.data.rate == 0) {
        
        //         isInputEmpty = true;
        //         emptyMsg = 'Rate Required!';
        //     }
        // }
        
        if(isInputEmpty) {
            
            $ionicPopup.alert({
                title: 'Error!',
                template: emptyMsg
            });
            
        } else {
            
            console.log($scope.data.dr_name);
            
            const isIndex = $scope.cartItemData.findIndex(row => row.productId == $scope.data.product_id);
            
            console.log(isIndex, $scope.productList);
            
            if(isIndex === -1) {
                
                $scope.cartItemData.push({
                    
                    categoryName: $scope.data.category,
                    subCategoryName: $scope.data.sub_category,
                    productName: $scope.data.product_name,
                    productCode: $scope.data.product_code,
                    productId: $scope.data.product_id,
                    qty: $scope.data.qty,
                    rate: $scope.data.rate,
                    amount: $scope.data.qty * $scope.data.rate,
                    discountPercent: $scope.data.discountPercent ? $scope.data.discountPercent : 0,
                    discountAmount : $scope.data.discountAmount ? $scope.data.discountAmount : 0,
                    discountedAmount: $scope.data.discountedAmount ? $scope.data.discountedAmount : 0,
                    cgstPercent: $scope.data.cgstPercent,
                    cgstAmount: $scope.data.cgstAmount,
                    sgstPercent: $scope.data.sgstPercent,
                    sgstAmount: $scope.data.sgstAmount,
                    igstPercent: $scope.data.igstPercent,
                    igstAmount: $scope.data.igstAmount,
                    itemGstAmount : $scope.data.itemGstAmount,
                    itemFinalAmount: $scope.data.itemFinalAmount
                });
                
            } else {
                
                $scope.cartItemData[isIndex].qty = $scope.data.qty;
                $scope.cartItemData[isIndex].rate = $scope.data.rate;
                $scope.cartItemData[isIndex].amount = $scope.data.qty * $scope.data.rate;
                
                $scope.cartItemData[isIndex].discount = $scope.data.discountPercent;
                $scope.cartItemData[isIndex].discountAmount = $scope.data.discountAmount;
                $scope.cartItemData[isIndex].discountedAmount = $scope.data.discountedAmount;
                
                $scope.cartItemData[isIndex].cgstPercent = $scope.data.cgstPercent;
                $scope.cartItemData[isIndex].cgstAmount = $scope.data.cgstAmount;
                $scope.cartItemData[isIndex].sgstPercent = $scope.data.sgstPercent;
                $scope.cartItemData[isIndex].sgstAmount = $scope.data.sgstAmount;
                $scope.cartItemData[isIndex].igstPercent = $scope.data.igstPercent;
                $scope.cartItemData[isIndex].igstAmount = $scope.data.igstAmount;
                $scope.cartItemData[isIndex].itemGstAmount = $scope.data.itemGstAmount;
                $scope.cartItemData[isIndex].itemFinalAmount = $scope.data.itemFinalAmount;
                
            }
            
            console.log($scope.cartItemData);
            
            $scope.search.product = { Key: "Select Product", Value: "" };
            $scope.data.product_id = 0;
            $scope.data.qty = 0;
            $scope.data.rate = 0;
            $scope.data.amount = 0;
            
            $scope.data.discountPercent = 0;
            $scope.data.discountAmount = 0;
            
            $scope.data.discountedAmount = 0;
            
            $scope.data.cgstPercent = 0;
            $scope.data.cgstAmount = 0;
            
            $scope.data.sgstPercent = 0;
            $scope.data.sgstAmount = 0;
            
            $scope.data.igstPercent = 0;
            $scope.data.igstAmount = 0;
            
            $scope.data.itemGstAmount = 0;
            $scope.data.itemFinalAmount = 0;
            
            $scope.onCalculateSummaryTotalDataHandler();
            
            console.log($scope.cartItemData);
            
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
    
    $scope.onCalculateItemTotalHandler = function(targetType) {
        
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
        
        if($scope.data.qty) {
            qty = $scope.data.qty;
        }
        
        if($scope.data.rate) {
            rate = $scope.data.rate;
        }
        
        if($scope.data.discountPercent) {
            discountPercent = $scope.data.discountPercent;
        }
        
        
        
        if($scope.data.gstPercent) {
            gstPercent = $scope.data.gstPercent;
        }
        
        $scope.data.amount = qty * rate;
        $scope.data.discountAmount = $scope.data.amount * (discountPercent/100);
        $scope.data.discountedAmount = $scope.data.amount - $scope.data.discountAmount;
        
        console.log($scope.data.state_name);
        
        let stateName;
        if(targetType == 'Quotation') {
            stateName = $scope.data.state_name;
        }
        
        if(targetType == 'Order') {
            stateName = $scope.data.state_name;
        }
        
        if(stateName == 'DELHI') {
            
            let gstPercentApply = gstPercent/2;
            
            cgstPercent = gstPercentApply;
            cgstAmount = amount * (cgstPercent/100);
            
            sgstPercent = gstPercentApply;
            sgstAmount = $scope.data.discountedAmount * (sgstPercent/100);
            
            igstPercent = 0;
            igstAmount = 0;
            
        } else {
            
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
                    
                    console.log(myAllSharedService.drTypeFilterData.drId);
                    console.log($scope.cartItemData);
                    console.log($scope.cartSummaryData);
                    console.log($scope.data.quoteId);
                    
                    
                    myRequestDBService.onSaveQuotationHandler(myAllSharedService.drTypeFilterData.drId, $scope.cartItemData, $scope.cartSummaryData, $scope.data.quoteId)
                    .then(function(result)
                    {
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
    
    
    // $scope.onSaveOrderHandler = function() {
    
    //     // if(!$scope.search.deliveryByName || !$scope.search.deliveryByName.Value) {
    
    //     //     $ionicPopup.alert({
    //     //         title: 'Error!',
    //     //         template: 'Delivery By Required!'
    //     //     });
    
    //     //     return false;
    //     // }
    
    //     $ionicPopup.confirm({
    
    //         title: 'Are You Sure, You Want to Save Order ?',
    //         buttons: [{
    
    //             text: 'YES',
    //             type: 'button-block button-outline button-stable',
    //             onTap: function (e) {
    
    //                 $ionicLoading.show({
    //                     template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
    //                 });
    //                 console.log($scope.data.shippingAddress);
    
    //                 myRequestDBService.onSaveOrderHandler($scope.search.drName.Value, $scope.search.deliveryByName,$scope.data.shippingAddress, $scope.cartItemData, $scope.cartSummaryData)
    //                 .then(function(result)
    //                 {
    //                     console.log(result);
    //                     $ionicLoading.hide();
    //                     $ionicHistory.goBack();
    //                     $cordovaToast.show('Order Saved Successfully', 'short', 'bottom').then(function (success) {
    //                     }, function (error) {
    //                     });
    //                 }, function (err) {
    //                     $ionicLoading.hide();
    //                     console.error(err);
    //                 });
    //             }
    //         }, {
    //             text: 'NO',
    //             type: 'button-block button-outline button-stable',
    //             onTap: function (e) {
    //                 console.log('You Are Not Sure');
    //             }
    //         }]
    
    //     });
    
    // }
    
    
    // $scope.getOrderListData = function(targetSRC) {
    
    //     if(!$scope.data.search && targetSRC != 'scroll') {
    
    //         $ionicLoading.show({
    //             template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
    //         });
    //     }
    
    //     $scope.isRequestInProcess = true;
    
    //     myRequestDBService.getOrderListData($scope.currentActiveTab, $scope.data.search, $scope.currentPage, $scope.pageSize).then(function(response) {
    
    //         console.log(response);
    
    //         const result = response.orderData;
    
    //         console.log(result);
    
    //         if(!$scope.data.search && targetSRC != 'scroll') {
    //             $ionicLoading.hide();
    //         }
    
    //         for (let index = 0; index < result.length; index++) {
    
    //             const isExist = $scope.orderList.findIndex(row => row.id == result[index].id);
    //             if(isExist === -1) {
    //                 $scope.orderList = $scope.orderList.concat(result);
    //             }
    //         }
    
    //         myAllSharedService.drTypeFilterData.orderList = $scope.orderList;
    
    //         $scope.isRequestInProcess = false;
    
    //         if(targetSRC == 'onLoad' || targetSRC == 'onRefresh') {
    //             $scope.onPageScrollTopHandler();
    //         }
    
    //         if(targetSRC == 'scroll') {
    //             $scope.$broadcast('scroll.infiniteScrollComplete');
    //         }
    
    //         if(targetSRC == 'onRefresh') {
    
    //             $scope.$broadcast('scroll.refreshComplete');
    
    //             $cordovaToast.show('Refreshed Successfully', 'short', 'bottom').then(function (success) {
    
    //             }, function (error) {
    
    //             });
    //         }
    
    //         if(!result || result.length == 0) {
    //             $scope.noMoreListingAvailable = true;
    //         }
    
    //         console.log($scope.orderList);
    
    //         $scope.currentPage += 1;
    
    //     }, function (err) {
    
    //         $ionicLoading.hide();
    //         $scope.isRequestInProcess = false;
    //         console.error(err);
    //     });
    
    // }
    
    
    // $scope.stateList = [];
    // $scope.districtList = [];
    
    // $scope.onGetSearchSelectDataHandler = function (type_info, searchKey, pagenumber) {
    
    //     console.log("function cal");
    
    
    //     if(!searchKey)
    //     {
    //         $ionicLoading.show({
    //             template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
    //         });
    //     }
    
    //     if (fetchingRecords) return;
    //     fetchingRecords = true;
    
    //     var targetArr = { type: type_info, state_name: $scope.search.stateName.Value, loginData: $scope.loginData };
    
    //     console.log(targetArr);
    
    //     searchSelect.onGetSearchSelectData(targetArr, searchKey, pagenumber)
    //     .then(function (result)
    //     {
    //         console.log(result);
    //         $ionicLoading.hide();
    //         if (type_info == 'fetchStateData')
    //         {
    //             $scope.totalStateRecords = result.TotalRecords;
    //             $scope.stateList = result.Records;
    //         }
    //         if (type_info == 'fetchDistrictData')
    //         {
    //             $scope.totalDistrictRecords = result.TotalRecords;
    //             $scope.districtList = result.Records;
    //         }
    
    //         fetchingRecords = false;
    //     },function (errorMessage)
    //     {
    //         console.log(errorMessage);
    //         window.console.warn(errorMessage);
    //         fetchingRecords = false;
    //     });
    // };
    
    // let fetchingRecords = false;
    
    // $scope.onGetCartItemDataHandler = function (typeInfo, searchKey, pagenumber) {
    
    //     if(!searchKey) {
    
    //         $ionicLoading.show({
    //             template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
    //         });
    //     }
    
    //     if (fetchingRecords) return;
    //     fetchingRecords = true;
    
    //     var targetArr = {
    //         type: typeInfo,
    //         categoryName: $scope.search.categoryName.Value,
    //         subCategoryName: $scope.search.subCategoryName.Value,
    //         product: $scope.search.product
    //     };
    
    //     console.log(targetArr);
    
    //     searchSelect.getCartItemData(targetArr, searchKey, pagenumber,$scope.loginData)
    //     .then(function (result) {
    
    //         $ionicLoading.hide();
    //         console.log(result);
    //         if (pagenumber === 1) {
    
    //             if (typeInfo == 'fetchCategoryData') {
    
    //                 $scope.totalCategoryRecords = result.TotalRecords;
    //                 $scope.categoryList = result.Records;
    //             }
    
    //             if (typeInfo == 'fetchSubCategoryData') {
    
    //                 $scope.totalSubCategoryRecords = result.TotalRecords;
    //                 $scope.subCategoryList = result.Records;
    //             }
    
    
    //             if (typeInfo == 'fetchProductData') {
    
    //                 $scope.totalProductRecords = result.TotalRecords;
    //                 $scope.productList = result.Records;
    //             }
    //         }
    
    //         fetchingRecords = false;
    
    //     }, function (errorMessage) {
    
    //         console.log(errorMessage);
    //         window.console.warn(errorMessage);
    //         fetchingRecords = false;
    //     });
    
    // };
    
    // $scope.$watch('search.categoryName', function (newValue, oldValue) {
    
    //     if (newValue && newValue.Value && newValue.Value != oldValue.Value) {
    
    //         console.log('Go');
    //         console.log($scope.search.categoryName);
    
    //         $scope.search.subCategoryName = { Key: "Select Sub Category", Value: "" };
    //         $scope.search.product = { Key: "Select Product", Value: "" };
    
    //         $scope.subCategoryList = [];
    //         $scope.productList = [];
    
    //         $scope.onGetCartItemDataHandler('fetchSubCategoryData', '', 1);
    //     }
    // });
    
    
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
    
    // $scope.$watch('search.product', function (newValue, oldValue) {
    
    //     if (newValue && newValue.Value && newValue.Value != oldValue.Value) {
    
    //         console.log('Go');
    //         if($location.path() == '/tab/lead-quotation-add' || $location.path() == '/tab/order-add') {
    //             $scope.data.qty = 1;
    //             $scope.data.rate = $scope.search.product.price;
    //             $scope.data.amount = $scope.search.product.price;
    //             $scope.onGetSearchSelectDataHandler('fetchStateData', '', 1);
    
    //             $ionicPopover.fromTemplateUrl('add-address', {
    //                 scope: $scope,
    //             }).then(function(popovers) {
    //                 $scope.data.otherAddresModel = popovers;
    //             });
    //         }
    //     }
    // });
    
    // $scope.$watch('search.stateName', function (newValue, oldValue) {
    
    //     if (newValue && newValue.Value && newValue.Value != oldValue.Value) {
    
    //         console.log('Go');
    //         console.log($scope.search.stateName);
    
    //         $scope.search.districtName = { Key: "Select District", Value: "" };
    //         $scope.onGetSearchSelectDataHandler('fetchDistrictData', '', 1);
    //     }
    // });
    
    // $scope.$watch('search.drName', function (newValue, oldValue) {
    
    //     if (newValue && newValue.Value && newValue.Value != oldValue.Value) {
    
    //         console.log('Go');
    //         console.log($scope.search.drName);
    
    //         $scope.getDetail($scope.search.drName.Value);
    
    //     }
    // });
    
    // $scope.onGetDrTypeDataHandler = function (type_info, searchKey, pagenumber) {
    
    //     if(!searchKey) {
    
    //         $ionicLoading.show({
    //             template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
    //         });
    //     }
    
    //     if (fetchingRecords) return;
    //     fetchingRecords = true;
    
    //     let typeId = '';
    //     let typeName = '';
    
    //     if(type_info == 'orderFor') {
    
    //         typeId = $scope.data.typeId;
    //         typeName = $scope.data.typeName;
    
    //     } else if( type_info == 'orderDeliveryBy') {
    
    //         typeId = $scope.data.deliveryByTypeId;
    //         typeName = $scope.data.deliveryByTypeName;
    //     }
    
    //     var targetArr = {
    //         typeId: typeId,
    //         typeName: typeName,
    //         loginData: $scope.loginData,
    //         searchData: searchKey,
    //         networkType:1
    //     };
    
    //     console.log(targetArr);
    
    //     searchSelect.onGetDrTypeDataHandler(targetArr, searchKey, pagenumber)
    //     .then(function (result)
    //     {
    //         console.log(result);
    //         $ionicLoading.hide();
    //         let updatedDrData = result.leadData;
    
    //         for (let index = 0; index < updatedDrData.length; index++) {
    
    //             updatedDrData[index].Key = updatedDrData[index].dr_name + ' - (' + updatedDrData[index].contact_mobile_no + ')';
    
    //             updatedDrData[index].Value = updatedDrData[index].id;
    //         }
    
    //         if(type_info == 'orderFor') {
    
    //             $scope.drList = updatedDrData;
    //             $scope.totalDrRecords = 0;
    
    //         } else if( type_info == 'orderDeliveryBy') {
    
    //             $scope.drDeliveryByList = updatedDrData;
    //             $scope.totalDeliveryByDrRecords = 0;
    //         }
    
    //         fetchingRecords = false;
    
    //     }, function (errorMessage) {
    
    //         console.log(errorMessage);
    //         window.console.warn(errorMessage);
    //         fetchingRecords = false;
    //     });
    // };
    
    
    $scope.onGetAllLeadType = function()
    {
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
    
    
    $scope.categoryListData = [];
    $scope.onGetProductCategoryList = function () {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        var parameter = { function_name: 'getProductCategoryList' };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.categoryListData = response.data;
            console.log($scope.categoryListData);
            $ionicLoading.hide();
        });
    }
    
    
    $scope.subCategoryData = [];
    $scope.onGetSubcategoryList = function () {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        var parameter = { function_name: 'getProductSubCategory','category':$scope.data.category };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.subCategoryData = response.data;
            console.log($scope.subCategoryData);
            $ionicLoading.hide();
        });
    }
    
    $scope.productListData = [];
    $scope.onGetProductList = function () {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        var parameter = { function_name: 'getProductList', 'category': $scope.data.category, 'sub_category': $scope.data.sub_category };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.productListData = response.data;
            console.log($scope.productListData);
            $ionicLoading.hide();
        });
    }
    
    
    $scope.allLeadData = [];
    $scope.getLeadDataonChangeLeadType = function(type)
    {
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        var parameter = { function_name: 'getAssignLeadList','type_name':type };
        myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
            console.log(response);
            $scope.allLeadData = response.data;
            console.log($scope.allLeadData);
            $ionicLoading.hide();
        }); 
    }
    
    
    $scope.single_select = function(item)
    {
        $scope.data.dr_name = new Array();
        $scope.data.dr_name.push(item.Key);
        console.log($scope.data.dr_name);
        
        $scope.data.dr_data = item;
        
    }
    
    $scope.onGetDeliveryByTypeListHandler = function() {
        
        myRequestDBService.onGetDeliveryByTypeListHandler()
        .then(function(response)
        {
            console.log(response);
            $scope.deliveryByTypeList = response.typeData;
        }, function (err) {
            console.error(err);
        });
    }
    
    
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
    
    $scope.getOrderDetailData = function() {
        
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
        });
        
        myRequestDBService.onGetOrderData($scope.data.orderId)
        .then(function(response)
        {
            console.log(response);
            $scope.orderDetail = response.orderData[0];
            $ionicLoading.hide();
        }, function (err) {
            $ionicLoading.hide();
            console.error(err);
        });
    }
    
    
    $scope.getDrDetailData = function(drId)
    {
        myRequestDBService.getDrDetailData(drId)
        .then(function(response) {
            console.log(response);
            $scope.drDetail = response;
            myAllSharedService.drTypeFilterData.drDetail = JSON.parse(JSON.stringify( $scope.drDetail));
            
            $scope.data.typeId = $scope.drDetail.drData.type_id;
            $scope.search.drName = { Key: $scope.drDetail.drData.dr_name, Value: $scope.drDetail.drData.id };
        }, function (err) {
            console.error(err);
        });
    }
    
    
    $scope.onSaveLeadOrderData = function()
    {
        
        var orderData = {};
        
        if ($scope.drDetail.dr_id)
        {
            orderData.dr_name = $scope.drDetail.dr_name;
            orderData.dr_id = $scope.drDetail.dr_id;
        }
        else
        {
            orderData.dr_name = $scope.data.dr_data.Key;
            orderData.dr_id = $scope.data.dr_data.Value;
        }
        orderData.dispatch_by_name = $scope.data.dispatch_by_name;
        orderData.dispatch_by_id = $scope.data.dispatch_by_id;
        orderData.orderDetail = $scope.cartSummaryData;
        orderData.order_item = $scope.cartItemData;

        $ionicPopup.confirm({
            
            title: 'Are You Sure, You Want to Save Order ?',
            buttons: [{
                
                text: 'YES',
                type: 'button-block button-outline button-stable',
                onTap: function (e) {
                    
                    $ionicLoading.show({
                        template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
                    });
                    // console.log($scope.data.shippingAddress);
                    
                    var parameter = { function_name: 'submitOrder', 'data': orderData};
                    myRequestDBService.sfaPostServiceRequest("/Okaya_LMS/getPostData", parameter).then(function (response) {
                        console.log(response);
                        if(response.status=='Success')
                        {
                            $state.go('tab.lead-order-list');
                        }
                        // $scope.drOrderTypeData = response.data;
                        // console.log($scope.drOrderTypeData);
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
        
        
        
    }
    
    $scope.onGoToOrderAddHandler = function() {
        
        myAllSharedService.drTypeFilterData.isInsideLead = 'No';
        myAllSharedService.drTypeFilterData.orderId = '';
        myAllSharedService.drTypeFilterData.drId = '';
        
        $state.go('tab.order-add');
    }
    
    if($location.path() == '/tab/order-detail') {
        
        $scope.data.orderId = myAllSharedService.drTypeFilterData.orderId;
        $scope.getOrderDetailData();
    }
    
    
    $scope.onGoToOrderDetailPage = function(orderId) {
        
        myAllSharedService.drTypeFilterData.orderId = orderId;
        $state.go('tab.order-detail');
    }
    
    
    
    if($location.path() == '/tab/all-order-list') {
        
        $scope.getOrderListData('onLoad');
    }
    
    
    $scope.slectedProductInformation = function(product_id)
    {
        
        var index = $scope.productListData.findIndex(row=>row.id == product_id);
        
        $scope.data.rate = $scope.productListData[index].price;
        $scope.data.product_name = $scope.productListData[index].product_name;
        $scope.data.product_code = $scope.productListData[index].product_code;
        $scope.data.qty = 1;
        
        $scope.onCalculateItemTotalHandler();
    }
    $scope.drDetail = {};
    if ($location.path() == '/tab/order-add')
    {
        $scope.drDetail.dr_id = myRequestDBService.dr_id;
        $scope.drDetail.dr_name = myRequestDBService.dr_name;
        $scope.drDetail.contact_mobile_no = myRequestDBService.contact_mobile_no;
        $scope.data.type = myRequestDBService.type_name;
        $scope.onGetAllLeadType();
        $scope.onGetProductCategoryList();
        
    }
    
    
    $scope.orderDispatchByData = [];
    
    $scope.onDeliveryByTypeChangeHandler = function (dispatchBy) {
        
       
        $scope.orderDispatchByData = [];
        
        var url;
        
        if (dispatchBy=='Dealer')
        {
            url = 'getDealerData';
        }
        else
        {
            url = "getDistributorData";
        }
        
        if(dispatchBy != 'Company')
        {
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
                duration: 100
            });
            
            myRequestDBService.onGetPostRequest('/App_Expense/' + url, '')
            .then(function (result) {
                console.log(result);
                $scope.search.dealerName = [];
                
                $scope.orderDispatchByData = result.data;
                
                fetchingRecords = false;
                
            }, function (errorMessage) {
                console.log(errorMessage);
                window.console.warn(errorMessage);
                $ionicLoading.hide();
                fetchingRecords = false;
            });
        }
        
    }

    $scope.dispatch_by_select = function (item) {
        console.log(item);
        $scope.data.dispatch_by = new Array();
        $scope.data.dispatch_by.push(item.Key);
        console.log($scope.data.dispatch_by);
        $scope.data.dispatch_by_id = item.Value;
        $scope.data.dispatch_by_name = item.Key;

    }
    
    
    
    $scope.onModifyTypeHandler = function(type) {
        
        $scope.currentActiveTab = type;
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
            $scope.onSetCurrentPageHandler();
            
            $scope.getOrderListData('onLoad');
        }
    }
    
    $scope.shippingForm = {};
    
    $scope.submitAddress = function()
    {
        
        $scope.shippingForm.state = $scope.search.stateName.Value;
        $scope.shippingForm.district = $scope.search.districtName.Value;
        $scope.shippingForm.city = $scope.data.city;
        $scope.shippingForm.pincode = $scope.data.pincode;
        $scope.shippingForm.street = $scope.data.street;
        
        $scope.data.otherAddresModel.hide();
        
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
        });
        
        myRequestDBService.onGetPostRequest('/App_Order/addShippingAddress',$scope.shippingForm)
        .then(function(response) {
            console.log(response);
            
            if(response.status=='Success')
            {
                $scope.data.state_name = $scope.shippingForm.state_name;
                $scope.drShippingArray.push({id:response.insertId,address:$scope.shippingForm.street+' '+$scope.shippingForm.city+' '+$scope.shippingForm.district+' '+$scope.shippingForm.state+' '+$scope.shippingForm.pincode});
                
                $scope.data.address = response.insertId;
                $scope.data.shippingAddress = $scope.shippingForm.street+' '+$scope.shippingForm.city+' '+$scope.shippingForm.district_name+' '+$scope.shippingForm.state_name+' '+$scope.shippingForm.pincode;
                
                console.log($scope.data);
            }
            else
            {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Something went wrong !!'
                });
            }
            
            $ionicLoading.hide();
            
            
        }, function (err) {
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Something went wrong !!'
            });
            console.error(err);
        });
        
        console.log($scope.shippingForm);
        
    }
    
    
    $scope.test =function()
    {
        console.log("test");
        
    }
    $scope.onSetCurrentPageHandler = function() {
        
        $scope.currentPage = 1;
        $scope.orderList = [];
        
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
    
    
    
    // $scope.onGetTypeListForOrderCreateHandler = function() {
    
    //     myRequestDBService.getDrAllTypeData()
    //     .then(function(response) {
    //         console.log(response);
    //         $scope.drOrderTypeData = response.allTypeData;
    //     }, function (err) {
    //         console.error(err);
    //     });
    // }
    
    
    // $scope.onDrTypeChangeHandler = function() {
    
    //     const isIndex = this.drOrderTypeData.findIndex(row => row.id == $scope.data.typeId);
    //     $scope.data.typeName = this.drOrderTypeData[isIndex].type;
    
    //     $scope.search.drName = { Key: "Select "+$scope.data.typeName+"*", Value: "" };
    //     $scope.onGetDrTypeDataHandler('orderFor', '', 1);
    // }
    
    
    // if($location.path() == '/tab/lead-requirement-add' || $location.path() == '/tab/lead-quotation-add' || $location.path() == '/tab/order-add') {
    
    //     $scope.search.categoryName = { Key: "Select Category", Value: "" };
    //     $scope.search.subCategoryName = { Key: "Select Sub Category", Value: "" };
    //     $scope.search.product = { Key: "Select Product", Value: "" };
    //     $scope.search.stateName = { Key: "Select State *", Value: "" };
    //     $scope.search.districtName = { Key: "Select District *", Value: "" };
    
    //     $scope.onGetCartItemDataHandler('fetchCategoryData', '' , 1);
    //     setTimeout(() => {
    //         $scope.onGetSearchSelectDataHandler('fetchStateData', '', 1);
    //     }, 500);
    
    //     if($location.path() == '/tab/order-add') {
    
    //         $scope.search.drName = { Key: "Select Company *", Value: "" };
    
    //         $scope.onGetTypeListForOrderCreateHandler();
    //         $scope.onGetDeliveryByTypeListHandler();
    
    //         $scope.data.drId = myAllSharedService.drTypeFilterData.drId;
    
    //         if(myAllSharedService.drTypeFilterData.isInsideLead == 'Yes') {
    //             $scope.getDrDetailData($scope.data.drId);
    //         }
    
    //         $ionicPopover.fromTemplateUrl('add-address', {
    //             scope: $scope,
    //         }).then(function(popovers) {
    //             $scope.data.otherAddresModel = popovers;
    //         });
    //     }
    
    //     if($location.path() == '/tab/lead-quotation-add') {
    
    //         $scope.data.quoteId = myAllSharedService.drTypeFilterData.quoteId;
    
    //         if(myAllSharedService.drTypeFilterData.quoteId)
    //         {
    //             $scope.quoteDetail = myAllSharedService.drTypeFilterData.quoteDetail;
    //             console.log($scope.quoteDetail);
    
    //             $scope.quoteDetail.itemData.forEach(itemRow => {
    
    //                 $scope.search.categoryName = {Key: itemRow.category, Value: itemRow.category};
    //                 $scope.search.subCategoryName = {Key: itemRow.sub_category, Value: itemRow.sub_category};
    
    //                 const productKey = itemRow['product_name'] + ' - (' + itemRow['product_code'] + ')';
    //                 $scope.search.product = {
    
    //                     Key: productKey,
    //                     Value: itemRow.product_id,
    //                     product_name: itemRow.product_name,
    //                     product_code: itemRow.product_code,
    //                     product_id: itemRow.product_id
    //                 };
    
    //                 $scope.data.gstPercent = itemRow.cgst_percent+itemRow.sgst_percent+itemRow.igst_percent;
    //                 $scope.data.qty = itemRow.qty;
    //                 $scope.data.rate = itemRow.rate;
    //                 $scope.data.discount = itemRow.dis_percent;
    //                 $scope.data.amount = itemRow.item_total;
    
    //                 $scope.data.cgstPercent = itemRow.cgst_percent;
    //                 $scope.data.cgstAmount = itemRow.cgst_amount;
    //                 $scope.data.sgstPercent = itemRow.sgst_percent;
    //                 $scope.data.sgstAmount = itemRow.sgst_amount;
    //                 $scope.data.igstPercent = itemRow.igst_percent;
    //                 $scope.data.igstAmount = itemRow.igst_amount;
    //                 $scope.data.itemFinalAmount = itemRow.item_net_total;
    //                 $scope.data.discountPercent = itemRow.dis_percent
    //                 $scope.data.discountAmount = itemRow.dis_amt
    //                 $scope.data.discountedAmount = itemRow.item_total
    
    //                 console.log(itemRow);
    
    //                 console.log($scope.data);
    
    //                 $scope.onAddToCartHandler('Quotation');
    
    //             });
    
    //             setTimeout(() => {
    
    //                 $scope.search.categoryName = { Key: "Select Category", Value: "" };
    //                 $scope.search.subCategoryName = { Key: "Select Sub Category", Value: "" };
    //                 $scope.search.product = { Key: "Select Product", Value: "" };
    
    //             }, 2000);
    
    //         }
    //     }
    // }
    
})





