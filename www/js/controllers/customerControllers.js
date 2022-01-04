app.controller('customerCtrl', function ($scope, $rootScope, searchSelect, $ionicModal, $state, myRequestDBService, myAllSharedService, $ionicLoading, $cordovaSQLite, $ionicPopup, $timeout, $ionicActionSheet, $cordovaImagePicker, Camera, $cordovaFileTransfer, $cordovaGeolocation, $cordovaToast, $location, $window, $ionicPlatform, $ionicHistory, $ionicModal,$stateParams, $ionicScrollDelegate, $ionicPopover) {
    
    $scope.loginData = myAllSharedService.loginData;
    $scope.isRequestInProcess;
    $scope.drStatusCountData = [];
    $scope.drList = [];
    $scope.typeList = [];
    $scope.mediaData = [];
    
    $scope.categoryList = [];
    $scope.subCategoryList = [];
    $scope.productList = [];
    
    $scope.cartItemData = [];
    $scope.cartSummaryData = {};
    
    $scope.isSearchActive = false;
    
    $scope.data = {
        
        typeId: '',
        companyName: '',
        customerName: '',
        customerMobile1: '',
        customerMobile2: '',
        landlineNo: '',
        email: '',
        website: '',
        category: '',
        status: '',
        lostReason: '',
        street: '',
        city: '',
        pincode: '',
        contactName: '',
        contactMobile: '',
        contactDesignation: '',
        contactEmail: ''
    };
    
    $scope.search = {};
    
    $scope.insideSalesList = [];
    $scope.fieldSalesList = [];
    
    $scope.dbInsideSelectedList = [];
    $scope.insideSalesSelectedList = [];
    
    $scope.data.drFormCurrentStep = 1;
    
    $scope.currentPage = 1;
    $scope.pageSize = 30;
    
    $scope.isSearchBarOpen = false;
    $scope.noMoreListingAvailable = false;
    
    $scope.serverURL = serverURL;
    
    $scope.onSaveDrHandler = function() {
        
        $ionicPopup.confirm({
            
            title: 'Are You Sure, You Want to Save Lead ?',
            buttons: [{
                text: 'YES',
                type: 'button-block button-outline button-stable',
                onTap: function (e) {
                    $ionicLoading.show({
                        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
                    });
                    
                    // commented
                    const isIndex = $scope.typeList.findIndex(row => row.id == $scope.data.typeId);
                    $scope.data.typeName = $scope.typeList[isIndex].type;
                    
                    $scope.data.stateName = $scope.search.stateName.Value;
                    $scope.data.districtName = $scope.search.districtName.Value;
                    
                    $scope.data.insideSalesSelectedData = $scope.insideSalesSelectedList;
                    $scope.data.fieldAgentId = $scope.search.fieldAgentName.Value;
                    $scope.data.typeName = $scope.typeList[isIndex].type;
                    
                    if(myAllSharedService.drTypeFilterData.drId) {
                        
                        $scope.data.drId = myAllSharedService.drTypeFilterData.drId;
                        
                    } else {
                        
                        $scope.data.drId = '';
                        
                    }
                    
                    $scope.data.followUpDateInFormat = moment($scope.data.followUpDate).format('YYYY-MM-DD');
                    
                    for (let key in $scope.data) {
                        
                        console.log(key);
                        if ($scope.data.hasOwnProperty(key) && !$scope.data[key]) {
                            $scope.data[key] = '';
                        }
                    }

                    console.log($scope.data);
                    
                    
                    myRequestDBService.onSaveDrHandler($scope.data, $scope.cartItemData)
                    .then(function (result) {
                        
                        $ionicLoading.hide();
                        console.log(result);
                        console.log(result.inserted_id);
                        console.log($scope.mediaData);
                        if(result.status == 'error')  {
                            
                            $ionicPopup.alert({
                                title: 'Error!',
                                template: result.statusMessage
                            });
                            
                        } else {
                            
                            // $scope.inserted_id = '125777';
                            console.log($scope.mediaData);
                            
                            if($scope.mediaData.length > 0) {
                                
                                var options = {
                                    fileKey: "file",
                                    fileName: "image.jpg",
                                    chunkedMode: false,
                                    mimeType: "image/*",
                                };
                                
                                for(let i=0;i<$scope.mediaData.length;i++) {
                                    
                                    console.log($scope.mediaData[i].src);
                                    $cordovaFileTransfer.upload(serverURL+"/App_Customer/dr_image_data/"+result.inserted_id, $scope.mediaData[i].src, options).then(function(result) {
                                        
                                        console.log(result);
                                        
                                        $ionicLoading.show({ template: 'Success!', noBackdrop: true, duration: 2000 });
                                        
                                    }, function(err) {
                                        
                                        $ionicLoading.hide();
                                        console.log("ERROR: " + JSON.stringify(err));
                                        
                                    }, function (progress) {
                                        
                                    });
                                }
                            }
                            
                            $scope.mediaData = [];
                            $state.go('tab.lead-counter');
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
    
    let fetchingRecords = false;
    
    $scope.onGetCartItemDataHandler = function (typeInfo, searchKey, pagenumber) {
        
        if(!searchKey) {
            
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
            });
        }
        
        if (fetchingRecords) return;
        fetchingRecords = true;
        
        var targetArr = {
            type: typeInfo,
            categoryName: $scope.search.categoryName.Value,
            subCategoryName: $scope.search.subCategoryName.Value,
            product: $scope.search.product
        };
        
        console.log(targetArr);
        
        searchSelect.getCartItemData(targetArr, searchKey, pagenumber,$scope.loginData)
        .then(function (result) {
            
            $ionicLoading.hide();
            console.log(result);
            
            console.log(pagenumber);
            if (pagenumber === 1) {
                
                if (typeInfo == 'fetchCategoryData') {
                    
                    $scope.totalCategoryRecords = result.TotalRecords;
                    $scope.cartCategoryList = result.Records;
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
            
            console.log($scope.categoryList);
            
            fetchingRecords = false;
            
        }, function (errorMessage) {
            
            console.log(errorMessage);
            window.console.warn(errorMessage);
            fetchingRecords = false;
        });
        
    };
    
    
    $scope.onAddToCartHandler = function(targetType) {
        
        let isInputEmpty = false;
        let emptyMsg = '';
        
        if(!$scope.search.categoryName || !$scope.search.categoryName.Value) {
            
            isInputEmpty = true;
            emptyMsg = 'Category Required!';
            
        } else  if(!$scope.search.subCategoryName || !$scope.search.subCategoryName.Value) {
            
            isInputEmpty = true;
            emptyMsg = 'Sub Category Required!';
            
        } else  if(!$scope.search.product || !$scope.search.product.Value) {
            
            isInputEmpty = true;
            emptyMsg = 'Product Required!';
            
        } else  if(!$scope.data.qty || $scope.data.qty < 0 || $scope.data.qty == 0) {
            
            isInputEmpty = true;
            emptyMsg = 'Qty Required!';
        }
        
        if(isInputEmpty) {
            
            $ionicPopup.alert({
                title: 'Error!',
                template: emptyMsg
            });
            
        } else {
            
            console.log($scope.search.drName);
            
            const isIndex = $scope.cartItemData.findIndex(row => row.productId == $scope.search.product.Value);
            
            console.log(isIndex, $scope.productList);
            
            if(isIndex === -1) {
                
                $scope.cartItemData.push({
                    
                    categoryName: $scope.search.categoryName.Value,
                    subCategoryName: $scope.search.subCategoryName.Value,
                    productName: $scope.search.product.product_name,
                    productCode: $scope.search.product.product_code,
                    productId: $scope.search.product.product_id,
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
            $scope.data.qty = 1;
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
    
    
    $scope.$watch('search.categoryName', function (newValue, oldValue) {
        
        if (newValue && newValue.Value && newValue.Value != oldValue.Value) {
            
            console.log('Go');
            console.log($scope.search.categoryName);
            
            $scope.search.subCategoryName = { Key: "Select Sub Category", Value: "" };
            $scope.search.product = { Key: "Select Product", Value: "" };
            
            $scope.subCategoryList = [];
            $scope.productList = [];
            
            $scope.onGetCartItemDataHandler('fetchSubCategoryData', '', 1);
        }
    });
    
    $scope.$watch('search.subCategoryName', function (newValue, oldValue) {
        
        if (newValue && newValue.Value && newValue.Value != oldValue.Value) {
            
            console.log('Go');
            console.log($scope.search.categoryName);
            console.log($scope.search.subCategoryName);
            
            $scope.search.product = { Key: "Select Product", Value: "" };
            $scope.productList = [];
            
            $scope.onGetCartItemDataHandler('fetchProductData', '', 1);
        }
    });
    
    if($location.path() == '/tab/add-lead') {
        
        $scope.search.categoryName = { Key: "Select Category", Value: "" };
        $scope.search.subCategoryName = { Key: "Select Sub Category", Value: "" };
        $scope.search.product = { Key: "Select Product", Value: "" };
        
        $scope.onGetCartItemDataHandler('fetchCategoryData', '' , 1);
    }
    
    
    $scope.onGoToNextStepHandler = function()
    {
        console.log($scope.attachment.length);
        
        if($scope.data.drFormCurrentStep == 1) {
            
            
            $scope.data.source_id = 0;
            $scope.data.source_name = '';
            for (let index = $scope.sourceList.length - 1; index >= 0; index--) {
                if($scope.sourceList[index].selectedId) {
                    $scope.data.source_id = $scope.sourceList[index].selectedId
                    const isIndex = $scope.sourceList[index].itemData.findIndex(row => row.id == $scope.sourceList[index].selectedId);
                    $scope.data.source_name = $scope.sourceList[index].itemData[isIndex].name;
                    break;
                }
            }
            
            if($scope.data.source_id==0)
            {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Lead Source Required!'
                });
                
                return;
            }
            else
            {
                $scope.data.drFormCurrentStep = 2;

            }
            
            
        } else if($scope.data.drFormCurrentStep == 2) {
            
            if(!$scope.search.stateName.Value) {
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'State Required!'
                });
                
                return false;
            }
            
            if(!$scope.search.districtName.Value) {
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'District Required!'
                });
                
                return false;
            }
            
            let isAnyContactInfoFilled = false;
            let isAnyContactEmpty = false;
            
            if($scope.data.contactName || ($scope.data.contactMobile && $scope.data.contactMobile != 'null') || $scope.data.contactDesignation || $scope.data.contactEmail) {
                isAnyContactInfoFilled = true;
            }
            
            if(!$scope.data.contactName || (!$scope.data.contactMobile || $scope.data.contactMobile == 'null') || !$scope.data.contactDesignation || !$scope.data.contactEmail) {
                isAnyContactEmpty = true;
            }
            
            console.log($scope.data.contactName, $scope.data.contactMobile, $scope.data.contactDesignation, $scope.data.contactEmail);
            if(isAnyContactInfoFilled && isAnyContactEmpty) {
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Contact Information Incomplete!'
                });
                
                return false;
            }
            
            $scope.data.drFormCurrentStep = 3;
        }
        
        console.log($scope.drFormCurrentStep);
    }
    
    $scope.onTypeClickHandler = function(typeId, typeName, typeStatus, typeCount) {
        
        myAllSharedService.drTypeFilterData.typeId = typeId;
        myAllSharedService.drTypeFilterData.typeName = typeName;
        myAllSharedService.drTypeFilterData.typeStatus = typeStatus;
        myAllSharedService.drTypeFilterData.typeCount = typeCount;
        
        $state.go('tab.lead-list');
    }
    
    
    $scope.getDrStatusWiseData = function() {
        
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
        });
        
        $scope.isRequestInProcess = true;
        
        myRequestDBService.getDrStatusWiseData()
        .then(function(result) {
            console.log(result);
            $ionicLoading.hide();
            $scope.isRequestInProcess = false;
            $scope.drStatusCountData = result.leadData;
            myAllSharedService.drTypeFilterData.drStatusCountData = result.leadData;
            console.log($scope.drStatusCountData);
        },function (err) {
            $ionicLoading.hide();
            $scope.isRequestInProcess = false;
            console.error(err);
        });
    }
    
    $scope.getDrListData = function(typeId, typeName, typeStatus, targetSRC) {
        
        if(!$scope.data.search && targetSRC != 'scroll') {
            
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
            });
        }
        
        $scope.data.typeId = typeId;
        
        $scope.isRequestInProcess = true;
        
        myRequestDBService.getDrListData(typeId, typeName, typeStatus, $scope.data.search, $scope.currentPage, $scope.pageSize)
        .then(function(response)
        {
            console.log(response);
            console.log($scope.data);
            
            const result = JSON.parse(JSON.stringify(response.leadData));
            console.log(result);
            if(!$scope.data.search && targetSRC != 'scroll') {
                $ionicLoading.hide();
            }
            for (let index = 0; index < result.length; index++) {
                
                const isExist = $scope.drList.findIndex(row => row.id == result[index].id);
                if(isExist === -1) {
                    $scope.drList = $scope.drList.concat(result);
                }
            }
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
            
            console.log(result);
            
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
    
    
    $scope.getDrAllStatusData = function ()  {
        
        myRequestDBService.getDrAllStatusData().then(function(result) {
            
            console.log(result);
            
            $scope.statusList = result.allStatusData;
            console.log($scope.statusList);
            
        }, function (err) {
            
            console.error(err);
        });
    }
    
    
    $scope.getDrAllTypeData = function ()
    {
        myRequestDBService.getDrAllTypeData().then(function(result)
        {
            console.log(result);
            $scope.typeList = result.allTypeData;
            console.log($scope.typeList);
        }, function (err) {
            console.error(err);
        });
    }
    
    
    $scope.getAllCategoryData = function ()
    {
        myRequestDBService.getAllCategoryData()
        .then(function(result)
        {
            console.log(result);
            $scope.categoryList = result.categoryData;
            console.log($scope.categoryData);
        }, function (err) {
            console.error(err);
        });
    }
    
    $scope.getDrDetailData = function(drId) {
        
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
        });
        
        $scope.isRequestInProcess = true;
        
        myRequestDBService.getDrDetailData(drId)
        .then(function(response) {
            
            console.log(response);
            $ionicLoading.hide();
            $scope.isRequestInProcess = false;
            $scope.drDetail = response;
            myAllSharedService.drTypeFilterData.drDetail = JSON.parse(JSON.stringify($scope.drDetail));
            
            myAllSharedService.drTypeFilterData.canNewMeetingStart = response.checkInData.canNewMeetingStart;
            myAllSharedService.drTypeFilterData.activityId = response.checkInData.activityId;
            myAllSharedService.drTypeFilterData.drName = response.checkInData.drName;
            $scope.data.typeStatus = response.drData.status;
            
        }, function (err) {
            
            $ionicLoading.hide();
            $scope.isRequestInProcess = false;
            console.error(err);
        });
    }
    
    
    $scope.onGetSearchSelectDataHandler = function (type_info, searchKey, pagenumber) {
        
        if(!searchKey)
        {
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
            });
        }
        
        if (fetchingRecords) return;
        fetchingRecords = true;
        
        var targetArr = { type: type_info, state_name: $scope.search.stateName.Value, loginData: $scope.loginData };
        
        console.log(targetArr);
        
        searchSelect.onGetSearchSelectData(targetArr, searchKey, pagenumber)
        .then(function (result)
        {
            console.log(result);
            $ionicLoading.hide();
            if (type_info == 'fetchStateData')
            {
                $scope.totalStateRecords = result.TotalRecords;
                $scope.stateList = result.Records;
            }
            if (type_info == 'fetchDistrictData')
            {
                $scope.totalDistrictRecords = result.TotalRecords;
                $scope.districtList = result.Records;
            }
            if (type_info == 'fetchInsideSalesData')
            {
                $scope.totalInsideSalesRecords = result.TotalRecords;
                $scope.insideSalesList = $scope.insideSalesList.concat(result.Records);
            }
            if (type_info == 'fetchFieldSalesData')
            {
                $scope.totalFieldSalesRecords = result.TotalRecords;
                $scope.fieldSalesList = $scope.fieldSalesList.concat(result.Records);
            }
            fetchingRecords = false;
        },function (errorMessage)
        {
            console.log(errorMessage);
            window.console.warn(errorMessage);
            fetchingRecords = false;
        });
    };
    
    $scope.$watch('search.stateName', function (newValue, oldValue) {
        
        if (newValue && newValue.Value && newValue.Value != oldValue.Value) {
            
            console.log('Go');
            console.log($scope.search.stateName);
            
            $scope.search.districtName = { Key: "Select District Name", Value: "" };
            $scope.onGetSearchSelectDataHandler('fetchDistrictData', '', 1);
        }
    });
    
    
    $scope.open_camera = function()
    {
        // if(!$scope.profile_data.dr_image) {
        var val = 'remove-pic';
        // } else {
        //     var val = '';
        // }
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
            buttonClicked: function(index) {
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
    
    $scope.getPicture = function (options) {
        
        var options = {
            quality : 50,
            targetWidth: 500,
            targetHeight: 500,
            saveToPhotoAlbum: false
        };
        
        Camera.getPicture(options).then(function(imageData) {
            
            var options = {
                fileKey: "image",
                fileName: "image.jpg",
                chunkedMode: false,
                mimeType: "image/*",
            };
            $scope.mediaData.push({
                src: imageData
                
            });
            console.log("****** Image");
            
            console.log(imageData);
            console.log($scope.mediaData);
            
        }, function(err) {
            
        })
    };
    
    $scope.perameter=function()
    {
        cordova.plugins.diagnostic.getCameraAuthorizationStatus({
            successCallback: function(status) {
                
                console.log('1st'+status);
                
                if(status === cordova.plugins.diagnostic.permissionStatus.GRANTED){
                    
                    $scope.openGallary();
                    
                } else {
                    
                    cordova.plugins.diagnostic.requestCameraAuthorization({
                        successCallback: function(data_status) {
                            
                            console.log('2nd'+data_status);
                            
                            if(data_status != 'DENIED') {
                                $scope.openGallary();
                            }
                        },
                        errorCallback: function(error){
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
    
    $scope.openGallary = function() {
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
    
    $scope.delete_img = function(index) {
        console.log("index");
        console.log(index);
        $scope.mediaData.splice(index,1);
    }
    
    $scope.getQuoteDetailData = function() {
        
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
        });
        
        myRequestDBService.onGetQuotationData($scope.data.quoteId).then(function(response) {
            
            console.log(response);
            
            $scope.quoteDetail = response.quotationData[0];
            myAllSharedService.drTypeFilterData.quoteDetail = response.quotationData[0];
            
            $ionicLoading.hide();
            
        }, function (err) {
            
            $ionicLoading.hide();
            console.error(err);
        });
    }
    
    
    $scope.onGoToQuotationDetailPage = function(quotationId) {
        
        myAllSharedService.drTypeFilterData.quoteId = quotationId;
        $state.go('tab.lead-quotation-detail');
    }
    
    $scope.attachment = [];
    
    $scope.onGetLeadDataForAutoFillDataHandler = function() {
        
        myRequestDBService.onGetLeadDataForAutoFillDataHandler($scope.data.drId).then(function(response) {
            
            console.log(response);
            
            const leadData = response.leadData;
            const insideSalesData =  response.insideSalesData;
            
            $scope.data.typeId = leadData.type_id;
            $scope.data.companyName = leadData.dr_name;
            $scope.data.customerName = leadData.contact_name;
            $scope.data.email = leadData.email;
            
            $scope.data.website = leadData.website;
            $scope.data.category = leadData.category;
            $scope.data.landlineNo = leadData.landline_no;
            
            $scope.data.customerMobile1 = leadData.contact_mobile_no;
            $scope.data.customerMobile2 = leadData.secondary_mobile_no;
            
            $scope.data.street = leadData.street;
            $scope.data.city = leadData.city;
            $scope.data.pincode = leadData.pincode;
            $scope.data.status = leadData.status;
            $scope.data.lostStatus = leadData.status_reason;
            $scope.attachment = response.attachments;
            if(leadData.assign_to && leadData.assign_to != '0') {
                
                $scope.search.fieldAgentName = {
                    Key: leadData.assign_to_name ,
                    Value: leadData.assign_to
                };
            }
            
            $scope.data.dbInsideSelectedList = insideSalesData;
            
            $scope.search.stateName = { Key: leadData.state_name, Value: leadData.state_name };
            
            setTimeout(() => {
                
                $scope.search.districtName = {
                    Key: leadData.district_name,
                    Value: leadData.district_name
                };
                
            }, 2000);
            
            $scope.onGetSearchSelectDataHandler('fetchDistrictData', '', 1);
            
            
        }, function (err) {
            
            $ionicLoading.hide();
            $scope.isRequestInProcess = false;
            console.error(err);
        });
        
    }
    
    
    $scope.onCloseLeadHandler = function()
    {
        $scope.leadpopovers.hide();
        $scope.popovers.hide();
        $ionicPopup.confirm({
            title: 'Are You Sure, You Want to Qualify this Lead ?',
            buttons: [{
                text: 'YES',
                type: 'button-block button-outline button-stable',
                onTap: function (e)
                {
                    $ionicLoading.show({
                        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
                    });
                    myRequestDBService.onCloseLeadHandler($scope.data)
                    .then(function (result)
                    {
                        console.log(result);
                        $ionicLoading.hide();
                        $state.go('tab.lead-list');
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
    
    
    $scope.hard_delete = function(index,data)
    {
        myRequestDBService.hard_delete(data)
        .then(function(response) {
            console.log(response);
            setTimeout(() => {
                $ionicPopup.alert({
                    title: 'Success!',
                    template: 'Deleted Successfully!'
                });
            }, 500);
        }, function (err) {
            
            console.error(err);
            $ionicLoading.hide();
        });
        $scope.attachment.splice(index,1);
    }
    
    $scope.showModal = function(templateUrl) {
        $ionicModal.fromTemplateUrl(templateUrl, {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    }
    
    $scope.closeModal = function() {
        $scope.modal.remove()
    };
    
    $scope.zoomMin = 1;
    $scope.showImages = function(index,img_val) {
        $scope.activeSlide = index;
        $scope.img_val=img_val;
        console.log(uploadURL+img_val);
        
        $scope.showModal('templates/zoom.html');
    }
    
    $scope.range = function(min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) {
            input.push(i);
        }
        return input;
    }
    
    $scope.initial_zoom=true;
    $scope.zoom= function(slide)
    {
        console.log(slide);
        console.log($scope.initial_zoom);
        
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
                                $scope.getDrDetailData($scope.data.drId);
                                
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
    
    $scope.onGoToDrDetail = function(drId) {
        
        myAllSharedService.drTypeFilterData.drId = drId;
        $state.go('tab.lead-detail');
    }
    
    $scope.onGoToOrderDetailPage = function(orderId) {
        
        myAllSharedService.drTypeFilterData.orderId = orderId;
        $state.go('tab.order-detail');
    }
    
    
    $scope.onStatusClickHandler = function(typeStatus) {
        
        $scope.data.typeStatus = typeStatus;
        $scope.getDrListData($scope.data.typeId, $scope.data.typeName, $scope.data.typeStatus, 'onLoad');
    }
    
    
    $scope.dateFormat = function(date)
    {
        return moment(date).format("DD MMM YYYY")
    }
    
    $scope.onSeachActionHandler = function(type , actionType) {
        
        if(type == 'open')
        {
            $scope.isSearchBarOpen = true;
            setTimeout(() => {
                $('#searchData').focus();
            }, 1000);
        }
        
        if(type == 'close')
        {
            $scope.data.search = '';
            $scope.isSearchBarOpen = false;
            $scope.onSetCurrentPageHandler();
            $scope.getDrListData($scope.data.typeId, $scope.data.typeName, $scope.data.typeStatus, actionType);
        }
    }
    
    
    $scope.itemSelected = function(selected) {
        
        if (selected) {
            
            console.log(selected);
            
            myAllSharedService.drTypeFilterData.drId = selected.originalObject.drId;
            
            myAllSharedService.drTypeFilterData.typeId = selected.originalObject.type_id;
            myAllSharedService.drTypeFilterData.typeName = selected.originalObject.type_name;
            myAllSharedService.drTypeFilterData.typeStatus = selected.originalObject.status;
            myAllSharedService.drTypeFilterData.typeCount = '';
            
            $state.go('tab.lead-detail');
            
        } else {
            
            console.log('cleared');
            $('#ex5_value').val();
        }
    }
    
    
    $scope.itemSelectedClear = function() {
        $scope.$broadcast('angucomplete-alt:clearInput');
    }
    
    
    $scope.onAddToInsideSalesListHandler = function() {
        
        if(!$scope.search.insideAgentName || !$scope.search.insideAgentName.Value) {
            
            $ionicPopup.alert({
                title: 'Error!',
                template: 'No User Selected!'
            });
            
        } else {
            
            
            const isDBExist = $scope.dbInsideSelectedList.findIndex(row => row.userId == $scope.search.insideAgentName.Value);
            
            const isIndex = $scope.insideSalesSelectedList.findIndex(row => row.userId == $scope.search.insideAgentName.Value);
            
            if(isDBExist === -1 && isIndex === -1) {
                
                $scope.insideSalesSelectedList.push({
                    
                    userId: $scope.search.insideAgentName.Value,
                    userName: $scope.search.insideAgentName.Key
                });
                
            } else {
                
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'User Already Exist To List!'
                });
                
            }
        }
        
        $scope.search.insideAgentName = { Key: "Select Inside Sales User", Value: "" };
    }
    
    
    $scope.sourceList = [];
    
    
    $scope.getLeadSource = function(parentId, index)
    {
        console.log(status);
        
        if(index || index === 0) {
            console.log("hello index");
            
            $scope.sourceList.length = index + 1;
        }
        
        var data = {'parent_id' : parentId}
        
        myRequestDBService.onGetPostRequest('/App_Customer/getLeadSource',data)
        .then(function(response) {
            
            console.log(response);
            
            if(response.source.length)
            {
                $scope.sourceList.push({
                    parentId: parentId,
                    itemData: JSON.parse(JSON.stringify(response.source)),
                    selectedId: '',
                });
            }
            
            
        }, function (err) {
            
            console.error(err);
        });
    }
    
    
    $scope.onDeleteInsideAgentHandler = function(index) {
        
        $ionicPopup.confirm({
            
            title: 'Are You Sure, You Want to Delete ?',
            buttons: [{
                
                text: 'YES',
                type: 'button-block button-outline button-stable',
                onTap: function (e) {
                    
                    $scope.insideSalesSelectedList.spilice(index, 1);
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
    
    
    $scope.onShowPopUpHandler = function($event, drId, type)
    {
        $scope.data.drId = drId;
        $scope.data.followUpId = '';
        $scope.leadpopovers.show($event)
    }
    
    
    $scope.onGoToActionHandler = function(type) {
        
        if(type == 'leadAddActivity') {
            
            myAllSharedService.drTypeFilterData.isInsideLead = 'Yes';
            myAllSharedService.drTypeFilterData.drId =  $scope.data.drId;
            myAllSharedService.drTypeFilterData.followUpId = '';
            
            $state.go('tab.add-activity');
            
        } else if(type == 'leadAddFollowUp') {
            
            myAllSharedService.drTypeFilterData.isInsideLead = 'Yes';
            myAllSharedService.drTypeFilterData.followUpId = '';
            myAllSharedService.drTypeFilterData.drId = $scope.data.drId;
            
            $state.go('tab.followup-add');
            
        } else if(type == 'leadAddQuotation') {
            
            myAllSharedService.drTypeFilterData.isInsideLead = 'Yes';
            
            myAllSharedService.drTypeFilterData.quoteId = '';
            $scope.data.quoteId = '';
            myAllSharedService.drTypeFilterData.drId = $scope.data.drId;
            
            $state.go('tab.lead-quotation-add');
            
        } else if(type == 'leadAddOrder') {
            
            myAllSharedService.drTypeFilterData.isInsideLead = 'Yes';
            myAllSharedService.drTypeFilterData.orderId = '';
            myAllSharedService.drTypeFilterData.drId = $scope.data.drId;
            
            $state.go('tab.order-add');
            
        } else if(type == 'followUpAddRemark') {
            
            myAllSharedService.drTypeFilterData.isInsideLead = 'Yes';
            myAllSharedService.drTypeFilterData.followUpId = $scope.data.followUpId;
            myAllSharedService.drTypeFilterData.drId = $scope.data.drId;
            
            $scope.data.remarkModel.show();
            
        } else if(type == 'followUpAddActivity') {
            
            myAllSharedService.drTypeFilterData.isInsideLead = 'Yes';
            
            myAllSharedService.drTypeFilterData.followUpId = $scope.data.followUpId;
            myAllSharedService.drTypeFilterData.drId = $scope.data.drId;
            
            $state.go('tab.add-activity');
            
        } else if(type == 'editFollowUp') {
            
            myAllSharedService.drTypeFilterData.isInsideLead = 'Yes';
            
            myAllSharedService.drTypeFilterData.followUpId = $scope.data.followUpId;
            myAllSharedService.drTypeFilterData.drId = $scope.data.drId;
            
            $state.go('tab.followup-add');
            
        } else if(type == 'leadActivityList') {
            
            myAllSharedService.drTypeFilterData.isInsideLead = 'Yes';
            
            myAllSharedService.drTypeFilterData.followUpId = $scope.data.followUpId;
            myAllSharedService.drTypeFilterData.drId = $scope.data.drId;
            
            $state.go('tab.lead-activity-list');
            
        } else if(type == 'leadRequirementList') {
            
            myAllSharedService.drTypeFilterData.isInsideLead = 'Yes';
            
            myAllSharedService.drTypeFilterData.followUpId = $scope.data.followUpId;
            myAllSharedService.drTypeFilterData.drId = $scope.data.drId;
            
            $state.go('tab.lead-requirement-list');
            
        } else if(type == 'LeadQuotationList') {
            
            myAllSharedService.drTypeFilterData.isInsideLead = 'Yes';
            
            myAllSharedService.drTypeFilterData.followUpId = $scope.data.followUpId;
            myAllSharedService.drTypeFilterData.drId = $scope.data.drId;
            
            $state.go('tab.lead-quotation-list');
            
        } else if(type == 'leadEdit')
        {
            myAllSharedService.drTypeFilterData.drId = $scope.data.drId;
            $state.go('tab.add-lead');
        }
        
        $scope.leadpopovers.hide();
        $scope.popovers.hide();
    }
    
    $scope.onShowFollowUpOptionModelHandler = function($event, followUpId, drId) {
        
        $scope.data.followUpId = followUpId;
        $scope.data.drId = drId;
        console.log($scope.data.followUpId);
        $scope.popovers.show($event);
    }
    
    
    if($location.path() == '/tab/lead-quotation-detail') {
        
        $scope.data.quoteId = myAllSharedService.drTypeFilterData.quoteId;
        $scope.drDetail = myAllSharedService.drTypeFilterData.drDetail;
        
        $scope.getQuoteDetailData();
    }
    
    
    if($location.path() == '/tab/lead-counter')
    {
        $scope.getDrStatusWiseData();
    }
    
    
    if($location.path() == '/tab/lead-list' || $location.path() == '/tab/customer-list') {
        
        console.log(myAllSharedService.drTypeFilterData);
        
        $scope.data.typeId = myAllSharedService.drTypeFilterData.typeId;
        $scope.data.typeName = myAllSharedService.drTypeFilterData.typeName;
        $scope.data.typeStatus = myAllSharedService.drTypeFilterData.typeStatus;
        $scope.data.typeCount = myAllSharedService.drTypeFilterData.typeCount;
        
        console.log($scope.data);
        $scope.getDrAllStatusData();
        $scope.getDrListData($scope.data.typeId, $scope.data.typeName, $scope.data.typeStatus, 'onLoad');
    }
    
    if($location.path() == '/tab/add-lead') {
        
        $scope.search.stateName = { Key: "Select State Name *", Value: "" };
        $scope.search.districtName = { Key: "Select District Name *", Value: "" };
        
        $scope.search.insideAgentName = { Key: "Select Inside Sales User ", Value: "" };
        $scope.search.fieldAgentName = { Key: "Select Field Sales User ", Value: "" };
        
        $scope.getDrAllTypeData();
        $scope.getAllCategoryData();
        $scope.getLeadSource('','');
        
        setTimeout(() => {
            $scope.onGetSearchSelectDataHandler('fetchInsideSalesData', '', 1);
            setTimeout(() => {
                $scope.onGetSearchSelectDataHandler('fetchFieldSalesData', '', 1);
                setTimeout(() => {
                    $scope.onGetSearchSelectDataHandler('fetchStateData', '', 1);
                }, 500);
            }, 200);
        });
        
        $scope.getDrAllStatusData();
        
        $scope.data.drId = myAllSharedService.drTypeFilterData.drId;
        
        if($scope.data.drId) {
            
            $scope.onGetLeadDataForAutoFillDataHandler();
            
        }
    }
    
    
    if($location.path() == '/tab/lead-detail' || $location.path() == '/tab/lead-activity-list' || $location.path() == '/tab/lead-followup-list' || $location.path() == '/tab/lead-requirement-list' || $location.path() == '/tab/lead-quotation-list' || $location.path() == '/tab/lead-order-list') {
        
        $scope.data.drId = myAllSharedService.drTypeFilterData.drId;
        
        console.log($scope.data.drId);
        $scope.getDrDetailData($scope.data.drId);
    }
    
    
    $ionicPopover.fromTemplateUrl('templates/popover.html', {
        scope: $scope,
    }).then(function(popovers) {
        $scope.leadpopovers = popovers;
    });
    
    $ionicPopover.fromTemplateUrl('followup-popover.html', {
        scope: $scope,
    }).then(function(popovers) {
        $scope.popovers = popovers;
    });
    
    
    if($location.path() == '/tab/lead-followup-list') {
        
        $ionicPopover.fromTemplateUrl('add-remark', {
            scope: $scope,
        }).then(function(popovers) {
            $scope.data.remarkModel = popovers;
        });
    }
    
    
    $scope.onSetCurrentPageHandler = function() {
        
        $scope.currentPage = 1;
        $scope.drList = [];
        
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
    
})




