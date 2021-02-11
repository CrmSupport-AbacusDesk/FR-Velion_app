app.controller('ORP_InvoiceController', function($scope,$http,$location,$rootScope,$mdDialog, $mdToast, $routeParams, $timeout, FileUploader,mySharedService,$filter,$route,$rootScope, $mdSelect) {

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

    $scope.goBack =function()
    {
        window.history.back();
    }
    $scope.formatDate = function(date){
        return new Date(date)    
    }

    $scope.filter = {};
    $scope.sortData = function(action,sorting)
    {
        $scope.filter.sortingType = action;
        $scope.filter.sorting = sorting;
        $scope.filter.sortingActive = action+'_'+sorting;
        $scope.getInvoiceList($scope.pageLimit,$scope.start);
        console.log('filter',$scope.filter);
    }



    $scope.invoiceList = [];
    $scope.filter = {};
    $scope.data_not_found = false;
    $scope.getInvoiceList = function(limit,start,filter)
    {
        $scope.pageLimit = limit;
        $scope.start = start;
        $scope.data_not_found = false;

        if($scope.filter.date_created)
        {
            $scope.filter.date_created = moment($scope.filter.date_created).format('YYYY-MM-DD');
        }

        console.log('Limit - '+limit);
        console.log('Start - '+start);
        console.log($scope.filter);

        $rootScope.loadingImg = $rootScope.loadingImgSrc;

        $http({
            method: 'POST',
            url: 'index.php/okaya_orp/invoice/getInvoiceList/'+limit+'/'+start,
            data: {search: $scope.filter},
        }).then(function successCallback(resp) {
            console.log('******* LISTING**********');
            console.log(resp);
            console.log(resp.data);
            $scope.invoiceList  = resp.data.drData;
            mySharedService.InvoiceFilter = $scope.filter;
            mySharedService.InvoiceStart = $scope.start;
            mySharedService.InvoicePageLimit = $scope.pageLimit;

            if(!$scope.invoiceList.length)
            {
                $scope.data_not_found = true;
            }
            invoiceListCount();
            $timeout(function () {
                $rootScope.loadingImg = '';
            }, 300);
        });
    }



    $scope.InvoiceFilter =  mySharedService.InvoiceFilter;
    $scope.InvoiceStart =  mySharedService.InvoiceStart;
    $scope.InvoicePageLimit =  mySharedService.InvoicePageLimit;

    $scope.total_btn_arr = [];
    $scope.totalData = 0;
    $scope.total_btn = 0;
    function invoiceListCount()
    {
        console.log($scope.filter);
        $http({
            method: 'POST',
            url: 'index.php/okaya_orp/invoice/getInvoiceList/'+0+'/'+0+'/'+1,
            data: {search: $scope.filter},
        }).then(function successCallback(resp) {
            console.log(resp.data);
            $scope.totalData  = resp.data.data;
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


    if($location.path() == '/orp_invoice_list')
    {
        if(($scope.InvoicePageLimit) || ($scope.InvoiceStart))
        {
            $scope.pageLimit = $scope.InvoicePageLimit;
            $scope.start = $scope.InvoiceStart;
            $scope.filter = $scope.InvoiceFilter;
            console.log('**** ASSIGN PAGE LIMIT AND START');
            console.log($scope.pageLimit);
            console.log($scope.start);
        }
        else
        {
            $scope.pageLimit = 50;
            $scope.start = 0;
        }
        $scope.getInvoiceList($scope.pageLimit,$scope.start);
    }


    $scope.deleteData = function(id,index)
    {
        $scope.data = $filter('filter')($scope.invoiceList, {id:id}, true)[0];
        console.log($scope.data);
        var confirm = $mdDialog.confirm()
        .title('Delete')
        .textContent('Are you sure you want to delete?')
        .ok('Ok')
        .cancel('Cancel');
        $mdDialog.show(confirm).then(function()
            {$http({
                method: 'POST',
                url: 'index.php/okaya_orp/invoice/deleteData/',
                data : {'data' : $scope.data}
            }).then(function successCallback(resp) {
                console.log("Delete");
                console.log(resp);
                $scope.invoiceList.splice(index,1);
                swal('Success','Invoice Data Deleted','success');
                $route.reload();
            });
        }, function() {
        });
    }

    $scope.viewInvoice = function(id)
    {
     var data = $filter('filter')($scope.invoiceList, {id:id}, true)[0];
     $scope.invoiceData = Object.assign({},data);
     console.log('invoiceData',$scope.invoiceData);
 }

});