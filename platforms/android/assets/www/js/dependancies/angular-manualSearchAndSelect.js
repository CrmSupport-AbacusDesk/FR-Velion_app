angular.module('angular-search-and-select', []).directive('manualsearchandselect', function ($rootScope) {
    return {
        replace: true,
        restrict: 'E',
        scope: {
            values: "=",
            selecteditem: "=",
            key: "@",
            onscroll: "&",
            totalrecords: "="
        },
        templateUrl: 'js/dependancies/manualSearchandselect.html',
        link: function (scope, elm, attr) {

            scope.showList = false;
            scope.selectItem = function (item)
            {
                scope.selecteditem = item;
                scope.showList = false;
                $rootScope.showList = false;

                if(scope.$$nextSibling && scope.$$nextSibling.hasOwnProperty("pagenumber")) {
                    scope.$$nextSibling.pagenumber = 1;
                    console.log(scope.$$nextSibling.pagenumber);
                }
                i++;
            };

            scope.isActive = function (item)
            {
                return item[scope.key] === scope.selecteditem[scope.key];
            };

            scope.textChanged = function (searchKey) {
                console.log(searchKey);
                if (searchKey.length === 0 || searchKey.length > 2) {
                    scope.onscroll({
                        searchKey: searchKey,
                        pagenumber: 1
                    });
                }

            };

            scope.show = function () {
                scope.showList = !scope.showList;
                $rootScope.showList = scope.showList;

                console.log($rootScope.showList);
            };

            $rootScope.$on("refreshPageNumber", function() {
                scope.pagenumber = 1;
            });

            $rootScope.$on("documentClicked", function (inner, target) {
                console.log(target);
                var isSearchBox = ($(target[0]).is(".manualsearchandselect")) || ($(target[0]).parents(".manualsearchandselect").length > 0);

                if (!isSearchBox)
                    scope.$apply(function () {
                        scope.showList = false;
                    });
            });

            elm.find(".dropdown").bind('scroll', function () {
                var currentItem = $(this);
                if (currentItem.scrollTop() + currentItem.innerHeight() >= currentItem[0].scrollHeight) {

                    if (!scope.pagenumber) scope.pagenumber = 2;
                    else
                        scope.pagenumber = scope.pagenumber + 1;

                    scope.onscroll({
                        searchKey: scope.searchKey,
                        pagenumber: scope.pagenumber
                    });
                }
            });

        }
    };
});
