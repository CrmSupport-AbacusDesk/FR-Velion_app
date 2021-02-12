app.controller('ORP_NetworkController', function($scope,$http,$location,$rootScope,$mdDialog, $mdToast, $routeParams, $timeout, FileUploader,mySharedService,$filter,$route,$rootScope, $mdSelect) {


    $scope.today_date = new Date().toISOString().slice(0,10); 
    console.log($scope.today_date);

    $scope.md_search = {};
    $scope.clearSearchTerm = function(action) {
        console.log('Action - '+action);
        $scope.md_search[action] = '';
    };
    window.mdSelectOnKeyDownOverride = function(event) {
        event.stopPropagation();
    };

    $scope.formatDate = function(date){
        return new Date(date)    
    }

    $scope.goBack =function()
    {
        window.history.back();
    }

    $scope.excelExport = function()
    {
        var blob = new Blob([document.getElementById('export_drdata').innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, "Okaya-"+$scope.filter.DrType+"-Network-List.xls");
    }



    $scope.downloadExcel = false;
    $scope.allNetworkList = [];
    $scope.getNetworkExcelList = function()
    {
        $rootScope.loadingImg = $rootScope.loadingImgSrc;
        $scope.DrType = $location.path() == '/orp_distributor_list'?'Distributor':$location.path() == '/orp_dealer_list'?'Dealer':'';
        $scope.filter.DrType = $scope.DrType;
        $http({
            method: 'POST',
            url: 'index.php/okaya_orp/network/donwloadLeadCSV/',
            data: {search: $scope.filter},
        }).then(function successCallback(resp) {
            console.log('******* EXCEL LISTING**********');
            console.log(resp.data);
            $scope.downloadExcel = true;
            // $scope.allNetworkList = resp.data.drData;
            $timeout(function () {
                $rootScope.loadingImg = '';
            }, 100);

        });
    }




    $scope.filter = {};
    $scope.sortData = function(action,sorting)
    {
        $scope.filter.sortingType = action;
        $scope.filter.sorting = sorting;
        $scope.getDrNetworkList($scope.pageLimit,$scope.start,$scope.filter.orp_status);
        console.log('filter',$scope.filter);
    }


    $scope.drList = [];
    $scope.filter = {};
    $scope.drCount = {};
    $scope.data_not_found = false;
    $scope.getDrNetworkList = function(limit,start,orp_status)
    {
        $scope.pageLimit = limit;
        $scope.start = start;
        $scope.filter.orp_status = orp_status;
        $scope.data_not_found = false;

        if($scope.filter.date_created)
        {
            $scope.filter.date_created = moment($scope.filter.date_created).format('YYYY-MM-DD');
        }

        if ($scope.filter.start_date && $scope.filter.end_date) 
        {
            $scope.filter.start_date = moment($scope.filter.start_date).format('YYYY-MM-DD');
            $scope.filter.end_date = moment($scope.filter.end_date).format('YYYY-MM-DD');
        }


        console.log('Limit - '+limit);
        console.log('Start - '+start);
        console.log('filter',$scope.filter);
        $scope.DrType = $location.path() == '/orp_distributor_list'?'Distributor':$location.path() == '/orp_dealer_list'?'Dealer':'';
        $scope.filter.DrType = $scope.DrType;
        
        $rootScope.loadingImg = $rootScope.loadingImgSrc;

        $http({
            method: 'POST',
            url: 'index.php/okaya_orp/network/getDrNetworkList/'+limit+'/'+start,
            data: {search: $scope.filter},
        }).then(function successCallback(resp) {
            console.log('******* NETWORK LISTING**********');
            console.log(resp);
            console.log(resp.data);
            $scope.drList  = resp.data.drData;
            // $scope.drCount = resp.data.drCount;
            $scope.drStatus = resp.data.status;
            $scope.downloadExcel = false;
            // var data = $filter('filter')($scope.drCount, {status:'Pending'}, true)[0];
            // $scope.totalRequestPending = data.count?data.count:0;

            mySharedService.NetworkFilter = $scope.filter;
            mySharedService.NetworkStart = $scope.start;
            mySharedService.NetworkPageLimit = $scope.pageLimit;

            if(!$scope.drList.length)
            {
                $scope.data_not_found = true;
            }
            drListCount();
            $timeout(function () {
                $rootScope.loadingImg = '';
            }, 300);
        });
    }

    $scope.clearFilter = function()
    {
      
        $scope.filter.start_date = undefined;
        $scope.filter.end_date = undefined;
        $scope.getDrNetworkList(50, 0, $scope.filter.orp_status)
    }



    $scope.NetworkFilter =  mySharedService.NetworkFilter;
    $scope.NetworkStart =  mySharedService.NetworkStart;
    $scope.NetworkPageLimit =  mySharedService.NetworkPageLimit;

    $scope.total_btn_arr = [];
    $scope.totalData = 0;
    $scope.total_btn = 0;
    function drListCount()
    {
        console.log('*** NetworkFilter ***');
        console.log($scope.filter);
        $http({
            method: 'POST',
            url: 'index.php/okaya_orp/network/getDrNetworkList/'+0+'/'+0+'/'+1,
            data: {search: $scope.filter},
        }).then(function successCallback(resp) {
            console.log(resp.data);
            $scope.totalData  = resp.data.drData;
            $scope.drCount = resp.data.drCount;
            $scope.drStatus = resp.data.status;

            console.log($scope.totalData);
            $scope.total_btn  = Math.ceil($scope.totalData/$scope.pageLimit);
            $scope.page_number = Math.ceil($scope.start/$scope.pageLimit) + 1;
            console.log($scope.total_btn);
            for (var i = 1;  i<= $scope.total_btn; i++) {
                $scope.num = [];
                $scope.num.push({'limit':$scope.pageLimit});
                $scope.num.push({'start':((i-1)*$scope.pageLimit)});
                $scope.total_btn_arr.push($scope.num);
            }
        });
    }


    if($location.path() == '/orp_distributor_list' || $location.path() == '/orp_dealer_list')
    {
        if(($scope.NetworkPageLimit) || ($scope.NetworkStart))
        {
            $scope.pageLimit = $scope.NetworkPageLimit;
            $scope.start = $scope.NetworkStart;
            $scope.filter = $scope.NetworkFilter;
            console.log('**** ASSIGN PAGE LIMIT AND START');
            console.log($scope.pageLimit);
            console.log($scope.start);
        }
        else
        {
            $scope.pageLimit = 50;
            $scope.start = 0;
        }
        $scope.filter = {};
        $scope.DrType = $location.path() == '/orp_distributor_list'?'Distributor':$location.path() == '/orp_dealer_list'?'Dealer':'';
        $scope.filter.DrType = $scope.DrType;
        $scope.getDrNetworkList($scope.pageLimit,$scope.start,'All');
    }


    $scope.getDrData = function(drId)
    {
        console.log('drId -'+drId);
        var data = $filter('filter')($scope.drList, {id:drId}, true)[0];
        $scope.data = Object.assign({},data);
    }


    var updateDrData_Temp = 0;
    $scope.updateDrData = function()
    {
        console.log('updateDrData',$scope.data);

        if(updateDrData_Temp == 0)
        {
            $http({
                method: 'POST',
                url: 'index.php/okaya_orp/network/updateDrData',
                data : {data : $scope.data},
            }).then(function successCallback(resp) {
                console.log(resp.data);
                if(resp.data.msg == 'success')
                {
                    swal("Success",resp.data.description, "success");
                    $(".model-close").trigger('click');
                    $('.modal-backdrop.fade.in').css('display','none');
                    updateDrData_Temp = 0;
                    $route.reload();
                }
                else{
                    var error = '';
                    for (let index = 0; index < resp.data.error.length; index++) {
                        error += resp.data.error[index]['message']+ ' ' ;  
                    }
                    swal("Error ",error, "error");
                    updateDrData_Temp = 0;
                }

            },error=>{
                console.log(error);
                updateDrData_Temp = 0;
            });
        }

    }


    $scope.distributorList = [];
    $scope.getDistributorList = function(user_id='')
    {
        if(user_id)
        {
            $scope.form.distributor_id = '';
        }
        $http({
            method: 'POST',
            url: 'index.php/okaya_orp/Network/getDistributorList',
            data : {user_id : user_id}
        }).then(function successCallback(resp) {
            console.log(resp);
            $scope.distributorList = resp.data.distributorData;
            console.log('distributorList',$scope.distributorList);
        },error=>{
            console.log(error);
        });
    }


    $scope.updateAssignDistributor = function(distributorId)
    {
        $scope.networkDetail.dr_id = $scope.networkDetail.id;
        console.log('networkDetail' ,$scope.networkDetail);

        $http({
            method: 'POST',
            url: 'index.php/okaya_sfa/Network/updateAssignDistributor',
            data:{data : $scope.networkDetail},
        }).then(function successCallback(resp) {
            console.log('******* Assign Distributor **********');
            console.log(resp);

            if(resp.data.msg == 'success')
            {
                swal("Success",resp.data.description, "success");
                $route.reload();
            }
            else
            {
                swal("Error ",'Something went wrong !!', "error");
            }

        },error=>{
            swal("Error ",'Something went wrong !!', "error");
        });
    }



    $scope.updateData = function()
    {
        console.log($scope.form);
        
        if($scope.form.orp_dobTemp)
        {
            $scope.form.orp_dob = moment($scope.form.orp_dobTemp).format('YYYY-MM-DD');
        }
        if($scope.form.orp_date_anniversaryTemp)
        {
            $scope.form.orp_date_anniversary = moment($scope.form.orp_date_anniversaryTemp).format('YYYY-MM-DD');
        }

        $rootScope.loadingImg = $rootScope.loadingImgSrc;
        $http({
            method: 'POST',
            url: 'index.php/okaya_orp/Network/updateNetworkBasicDetail',
            data: {data: $scope.form},
        }).then(function successCallback(resp) 
        {
            console.log('******* Update Network **********');
            console.log(resp);
            if(resp.data.msg == 'success')
            {
                swal("Success",resp.data.description, "success");
                $('.modal-backdrop.fade.in').css('display','none');
                $route.reload();
            }
            else{
                var error = '';
                for (let index = 0; index < resp.data.error.length; index++) {
                    error += resp.data.error[index]['message']+ ' ' ;  
                }
                swal("Error ",error, "error");
            }
            
            $timeout(function () {
                $rootScope.loadingImg = '';
            }, 100);
            
        },error=>{
            swal("Error ",'Something went wrong !!', "error");
            
        });
    }



    $scope.updateUserNamePassword = function()
    {
        console.log($scope.networkDetail);
        $http({
            method: 'POST',
            url: 'index.php/okaya_orp/Network/updateUserNamePassword',
            data:$scope.networkDetail
        }).then(function successCallback(resp) {
            console.log(resp);
            if(resp.data.msg == 'success')
            {
                swal("Success",resp.data.description, "success");
                $('.modal-backdrop.fade.in').css('display','none');
                
                $route.reload();
            }
            else{

                swal("Error ",'Something went wrong !!', "error");
            }
            $timeout(function () {
                $rootScope.loadingImg = '';
            }, 100);
            
        },error=>{
            swal("Error ",'Something went wrong !!', "error");
            
        });
    }


    $scope.updateAreaAssign = function()
    {
        console.log($scope.networkDetail);
        $http({
            method: 'POST',
            url: 'index.php/okaya_orp/Network/updateAreaAssign',
            data:$scope.networkDetail
        }).then(function successCallback(resp) {
            console.log(resp);
            if(resp.data.msg == 'success')
            {
                swal("Success",resp.data.description, "success");
                $('.modal-backdrop.fade.in').css('display','none');
                
                $route.reload();
            }
            else{

                swal("Error ",'Something went wrong !!', "error");
            }
            $timeout(function () {
                $rootScope.loadingImg = '';
            }, 100);
            
        },error=>{
            swal("Error ",'Something went wrong !!', "error");
            
        });
    }


    $scope.deleteDrData = function(id,index)    
    {
        $scope.data = $filter('filter')($scope.drList, {id:id}, true)[0];
        console.log($scope.data);
        var confirm = $mdDialog.confirm()
        .title('Delete')
        .textContent('Are you sure you want to delete?')
        .ok('Ok')
        .cancel('Cancel');
        $mdDialog.show(confirm).then(function()
          {$http({
            method: 'POST',
            url: 'index.php/okaya_orp/network/deleteDrData/',
            data : {'data' : $scope.data}
        }).then(function successCallback(resp) {
            console.log("Delete");
            console.log(resp);
            $scope.drList.splice(index,1);
            swal('Success','Data Deleted','success');
            $route.reload();
        });
    }, function() {
    });
    }



    $scope.activeTab = 'Detail';
    if($location.path() == '/orp_network_detail/'+$routeParams.drEcrptId)
    {
        getNetworkDetail($routeParams.drEcrptId);
    }

    $scope.networkDetail= {};
    $scope.distirctlist= [];
    function getNetworkDetail(id)
    {
        $rootScope.loadingImg = $rootScope.loadingImgSrc;

        $http({
            method: 'POST',
            url: 'index.php/okaya_orp/Network/getNetworkDetail/'+id,
        }).then(function successCallback(resp) {
            console.log('******* Network Detail **********');
            console.log(resp);
            
            $scope.networkDetail = resp.data.data;
            $scope.distirctlist = resp.data.distirctlist;

            console.log($scope.distirctlist);
            $scope.form = Object.assign({},$scope.networkDetail);
            console.log('networkDetail',$scope.networkDetail);
            
            $scope.form.orp_dobTemp= new Date($scope.form.orp_dob);
            $scope.form.orp_date_anniversaryTemp= new Date($scope.form.orp_date_anniversary);
            
            if($scope.networkDetail.type_name == 'Dealer')
            {
                $scope.getDistributorList('');
            }

            $timeout(function () {
                $rootScope.loadingImg = '';
            }, 300);

        },error=>{
            swal("Error ",'Something went wrong !!', "error");

        });
    }



    
    $scope.brandList = [];
    $scope.getAllBrandList = function()
    {
        console.log('form',$scope.form);
        console.log('networkDetail',$scope.networkDetail);
        
        
        $http({
            method: 'POST',
            url: 'index.php/okaya_orp/Network/getAllBrandList',
            data : {data : $scope.form}
        }).then(function successCallback(resp) {
            console.log(resp.data);
            $scope.brandList = resp.data.brandList;
            
            if($scope.brandList.length)
            {
                $scope.brandDataList = $scope.brandList.reduce(function(previous, current) {
                    if (previous.indexOf(current.category) === -1) {
                        previous.push(current.category);
                    }
                    console.log('previous',previous);
                    return previous;
                }, []);
            }
            
            console.log('brandDataList' ,$scope.brandDataList);
            
        },error=>{
            console.log(error);
        });
    }
    
    
    


    $scope.segmentsList = [];
    $scope.getAllCategorySegments = function()
    {
        $http({
            method: 'POST',
            url: 'index.php/okaya_orp/Network/getAllCategoryList',
        }).then(function successCallback(resp) {
            console.log(resp.data);
            $scope.segmentsList = resp.data.categoryList;
        },error=>{
            console.log(error);
        });
    }
    

    $scope.updateAssignSegment = function(assignSegments,assignBrand)
    {
        console.log('assignSegments',assignSegments);
        console.log('assignBrand',assignBrand);
        
        $http({
            method: 'POST',
            url: 'index.php/okaya_orp/Network/updateAssignSegment',
            data:{networkId:$scope.networkDetail.id,assignSegments:assignSegments,assignBrand:assignBrand}
        }).then(function successCallback(resp) {
            console.log(resp);
            
            if(resp.data.status == 'Success')
            {
                swal("Success",'Segment/Brand Update Successfully', "success");
                $route.reload();
            }
            else
            {
                swal("Error ",'Something went wrong !!', "error");
            }
            
            
        },error=>{
            swal("Error ",'Something went wrong !!', "error");
            
        });
    }



    $scope.stockData = [];
    $scope.stockFilter = {};
    $scope.stockCount =[];
    $scope.getNetworkStockList = function(id)
    {
        $rootScope.loadingImg = $rootScope.loadingImgSrc;

        $http({
            method: 'POST',
            url: 'index.php/okaya_orp/Network/getNetworkStockList/'+id,
            data : {search : $scope.stockFilter},
        }).then(function successCallback(resp) {
            console.log(resp);
            $scope.stockData = resp.data.stockData;
            $scope.stockCount = resp.data.stockCount;
            console.log('stockData',$scope.stockData);
            console.log('stockCount',$scope.stockCount);
            $timeout(function () {
                $rootScope.loadingImg = '';
            }, 300);

        },error=>{
            swal("Error ",'Something went wrong !!', "error");

        });
    }





    $scope.walletData = [];
    $scope.walletCount = [];
    $scope.walletFilter = {};
    $scope.getNetworkWalletHistoryList = function(id)
    {
        $rootScope.loadingImg = $rootScope.loadingImgSrc;
        $scope.walletFilter.type_name = $scope.networkDetail.type_name;

        $http({
            method: 'POST',
            url: 'index.php/okaya_orp/Network/getNetworkWalletHistoryList/'+id,
            data : {search : $scope.walletFilter},
        }).then(function successCallback(resp) {
            console.log(resp);
            $scope.walletData = resp.data.walletData;
            $scope.walletCount = resp.data.walletCount;
            console.log('walletData',$scope.walletData);
            $timeout(function () {
                $rootScope.loadingImg = '';
            }, 300);

        },error=>{
            swal("Error ",'Something went wrong !!', "error");

        });
    }



    $scope.supportData = [];
    $scope.supportFilter = {};
    $scope.getNetworkSupportList = function(id)
    {
        $rootScope.loadingImg = $rootScope.loadingImgSrc;

        $http({
            method: 'POST',
            url: 'index.php/okaya_orp/Network/getNetworkSupportList/'+id,
            data : {search : $scope.supportFilter},
        }).then(function successCallback(resp) {
            console.log(resp);
            $scope.supportData = resp.data.supportData;
            console.log('supportData',$scope.supportData);
            $timeout(function () {
                $rootScope.loadingImg = '';
            }, 300);

        },error=>{
            swal("Error ",'Something went wrong !!', "error");

        });
    }




    $scope.giftData = [];
    $scope.giftFilter = {};
    $scope.getNetworkGiftList = function(id)
    {
        $rootScope.loadingImg = $rootScope.loadingImgSrc;

        $http({
            method: 'POST',
            url: 'index.php/okaya_orp/Network/getNetworkGiftList/'+id,
            data : {search : $scope.giftFilter},
        }).then(function successCallback(resp) {
            console.log(resp);
            $scope.giftData = resp.data.giftData;
            console.log('giftData',$scope.giftData);
            $timeout(function () {
                $rootScope.loadingImg = '';
            }, 300);

        },error=>{
            swal("Error ",'Something went wrong !!', "error");

        });
    }

    $scope.stateList = [];
    $scope.getStateList = function() {
        $http({
            method: 'POST',
            url: 'index.php/okaya/user/getStateList',
        }).then(function successCallback(resp) {
            console.log("State List");
            console.log(resp.data);
            $scope.stateList = resp.data.stateData;
        }, error => {
            console.log(error);
        });
    }


});