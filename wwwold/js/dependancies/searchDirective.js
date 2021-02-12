app.service("searchSelect", ['$http', '$q', function ($http, $q) {
    //searchdirective

        // var urlBase = 'http://countrylistapi.apphb.com/api/';
        return ({
            onGetSearchSelectData : onGetSearchSelectData,
            onGetDrTypeDataHandler : onGetDrTypeDataHandler,
            getCartItemData: getCartItemData
        });


        function onGetSearchSelectData(targetArr, searchKey, pageNumber) {

             console.log(targetArr);

             var deferred = $q.defer();
             var request = $http({
                 method: "get",
                 url: serverURL + "/App_SharedData/onGetSearchSelectData",
                 params: { targetArr: targetArr, searchKey: searchKey, pageNumber: pageNumber }
             });

             return (request.then(handleSuccess, handleError));
        }
        

        function onGetDrTypeDataHandler(targetArr, searchKey, pageNumber) {

            console.log(targetArr);

            var myUrl = '';

            if(targetArr.networkType==2)
            {
                myUrl = sfaServerURL + "/Distribution_Network/getAssignNetworkList";
            }
            else if(targetArr.networkType==1)
            {
                myUrl = serverURL + "/App_Customer/onGetDrListData";
            }

            var deferred = $q.defer();
            var request = $http({
                method: "get",
                url: myUrl,
                params: {
                    targetArr: targetArr
                }
            });

            return (request.then(handleSuccess, handleError));
        }


        function getCartItemData(targetArr, searchKey, pageNumber,loginData) {

            var deferred = $q.defer();
            var request = $http({
                method: "get",
                // old
                // url: serverURL + "/App_SharedData/getCartItemData",
                
                // new
                url: serverURL + "/App_SharedData/getItemData",
                params: { targetArr: targetArr, searchKey: searchKey, pageNumber: pageNumber,loginData:loginData }
            });

            return (request.then(handleSuccess, handleError));
        }
        

        function handleError(response) {

            if (
                !angular.isObject(response.data) ||
                !response.data.message
                ) {
                return ($q.reject("An unknown error occurred."));
            }
            return ($q.reject(response.data.message));
        }


        function handleSuccess(response) {
            return (response.data);
        }
}]);

