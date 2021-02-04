
var angularApp = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngMaterial','ngCordova','angular-search-and-select','chart.js'])

angularApp.run(function ($ionicPlatform, myRequestDBService, myAllSharedService, $cordovaSQLite, $ionicPopup, $ionicLoading, $state, $ionicHistory, $timeout, $rootScope, $cordovaAppVersion) {
    
    $ionicPlatform.ready(function() {
        
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        
        if (window.StatusBar) {
            
            StatusBar.show();
            StatusBar.backgroundColorByHexString("#469e50");
            StatusBar.overlaysWebView(false);
        }
        
        $ionicPlatform.registerBackButtonAction(function () {
            
            if ($ionicHistory.currentStateName() === 'tab.dashboard' || $ionicHistory.currentStateName() === 'login') {
                
                if(backbutton==0) {
                    
                    backbutton++;
                    window.plugins.toast.showShortBottom('Press again to exit');
                    $timeout(function(){backbutton=0;},2500);
                    
                } else {
                    
                    ionic.Platform.exitApp();
                }
                
            }  else if ($ionicHistory.currentStateName() === 'tab.lead-counter' || $ionicHistory.currentStateName() === 'tab.menu' || $ionicHistory.currentStateName() === 'tab.all-followup-list' || $ionicHistory.currentStateName() === 'tab.all-activity-list') {
                
                $state.go('tab.dashboard');
                
            } else {
                
                navigator.app.backHistory();
            }
            
        }, 100);
        
        
        if (window.cordova) {
            
            db =$cordovaSQLite.openDB({ name:  "my.app" , iosDatabaseLocation: 'default' });
            console.log("Android");
            
        } else {
            
            db = window.openDatabase("my.app",'1','my',1024 * 1024 * 100);
            console.log("browser");
        }
        
        
        
        function onHideSplashHandler() {
            
            $timeout(function () {
                navigator.splashscreen.hide();
            }, 100);
        }
        
        
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS "+dbTableName+" (id integer primary key,username text,password text, organisationId text)");
        
        var query ="SELECT username, password, organisationId FROM "+dbTableName+" ORDER BY id DESC LIMIT 1";
        
        $cordovaSQLite.execute(db, query).then(function(res) {
            
            if(res.rows.length > 0 && res.rows.item(0).username && res.rows.item(0).password) {
                
                $ionicLoading.show({
                    template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
                });
                
                myRequestDBService.login(res.rows.item(0).username,res.rows.item(0).password, res.rows.item(0).organisationId)
                .then(function (result) {
                    
                    console.log(result);
                    
                    onHideSplashHandler()
                    $ionicLoading.hide();
                    
                    const loginData = {};
                    
                    loginData.loginId = result.loginData.id;
                    loginData.loginName = result.loginData.name;
                    // loginData.loginType = result.loginData.loginType;
                    // loginData.loginSubType = result.loginData.sales_user_type;
                    // loginData.software_access = result.loginData.software_access;
                    // loginData.designation = result.loginData.designation;
                    // loginData.designation_id = result.loginData.designation_id;
                    loginData.emp_code = result.loginData.emp_code;
                    loginData.loginMobile = result.loginData.contact_01;
                    loginData.loginImage = result.loginData.image;
                    // loginData.loginAccessLevel = result.loginData.access_level;
                    // loginData.loginOrganisationId = res.rows.item(0).organisationId;
                    // loginData.loginTeamExist = result.loginData.isTeamExist;
                    // loginData.department = result.loginData.department;
                    
                    // if(result.loginData.department.includes("CHANNEL SALE"))
                    // {
                    //     loginData.channelSalesLogin = true;
                    // }
                    // else
                    // {
                    //     loginData.channelSalesLogin = false;
                    // }
                    
                    // if (window.cordova && ionic.Platform.isAndroid()) {
                    //     console.log("Android");
                    //     init(loginData.loginId);
                    // }
                    
                    // if (window.cordova && ionic.Platform.isIOS()) {
                    //     console.log("IOS");
                    //     init(loginData.loginId);
                    // }
                    
                    // console.log(loginData.loginOrganisationId);
                    myAllSharedService.loginData = loginData;
                    $state.go('tab.dashboard');
                    
                }, function (result) {
                    
                    onHideSplashHandler()
                    $ionicLoading.hide();
                    
                    $state.go('login');
                });
                
            } else {
                
                onHideSplashHandler();
                
                $ionicLoading.hide();
                $state.go('login');
            }
            
        }, function (err) {
            
            console.error(err);
            onHideSplashHandler();
            
        });
        
    });
    
})


.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
    
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider
    
    
    .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html',
        controller: 'dashCtrl'
    })
    
    .state('login', {
        url: '/login',
        cache:false,
        templateUrl: 'templates/login.html',
        controller : 'loginCtrl'
    })
    
    .state('change-password', {
        url: '/change-password',
        cache:false,
        templateUrl: 'templates/change-password.html',
        controller: 'loginCtrl'
    })
    
    
    .state('tab.dashboard', {
        url: '/dashboard',
        cache:false,
        views: {
            'tab-dashboard': {
                templateUrl: 'templates/dashboard.html',
                controller: 'dashCtrl'
            }
        }
    })
    
    .state('tab.lead-counter', {
        url: '/lead-counter',
        cache:false,
        views: {
            'tab_lead_list': {
                templateUrl: 'templates/lead-counter.html',
                controller: 'customerCtrl'
            }
        }
    })
    
    .state('tab.lead-list', {
        url: '/lead-list',
        cache:false,
        views: {
            'tab_lead_list': {
                templateUrl: 'templates/lead-list.html',
                controller: 'leadController'
            }
        }
    })
    
    .state('tab.lead-detail', {
        url: '/lead-detail',
        cache:false,
        views: {
            'tab_lead_list': {
                templateUrl: 'templates/lead-detail.html',
                controller: 'leadController'
            }
        }
    })
    
    .state('tab.lead-activity-list', {
        url: '/lead-activity-list',
        cache:false,
        views: {
            'tab_lead_list': {
                templateUrl: 'templates/lead-activity-list.html',
                controller: 'leadController'
            }
        }
    })
    
        .state('tab.sfa_dr_activity', {
            url: '/sfa_dr_activity',
            cache: false,
            views: {
                'tab_lead_list': {
                    templateUrl: 'templates/okaya_sfa/sfa_dr_activity.html',
                    controller: 'customerCtrl'
                }
            }
        })

        .state('tab.sfa_dr_followup', {
            url: '/sfa_dr_followup',
            cache: false,
            views: {
                'tab_lead_list': {
                    templateUrl: 'templates/okaya_sfa/sfa_dr_followup.html',
                    controller: 'customerCtrl'
                }
            }
        })


    .state('tab.lead-meeting-end', {
        url: '/lead-meeting-end',
        cache: false,
        views: {
            'tab_lead_list': {
                templateUrl: 'templates/lead-meeting-end.html',
                controller: 'leadController'
            }
        }
    })
    
    
    .state('tab.lead-followup-list', {
        url: '/lead-followup-list',
        cache:false,
        views: {
            'tab_lead_list': {
                templateUrl: 'templates/lead-followup-list.html',
                controller: 'leadController'
            }
        }
    })
    
    
    .state('tab.lead-requirement-list', {
        url: '/lead-requirement-list',
        cache:false,
        views: {
            'tab_lead_list': {
                templateUrl: 'templates/lead-requirement-list.html',
                controller: 'leadController'
            }
        }
    })
    
    // .state('tab.lead-requirement-add', {
    //     url: '/lead-requirement-add',
    //     cache:false,
    //     views: {
    //         'tab_lead_list': {
    //             templateUrl: 'templates/lead-requirement-add.html',
    //             controller: 'orderCtrl'
    //         }
    //     }
    // })
    
    .state('tab.requirement-add', {
        url: '/requirement-add',
        cache:false,
        views: {
            'tab_lead_list': {
                templateUrl: 'templates/add-lead-requirment.html',
                controller: 'leadController'
            }
        }
    })
    
    .state('tab.add-lead-followup', {
        url: '/add-lead-followup',
        cache:false,
        views: {
            'tab_lead_list': {
                templateUrl: 'templates/add-lead-followup.html',
                controller: 'leadController'
            }
        }
    })
    
    .state('tab.add-lead-activity', {
        url: '/add-lead-activity',
        cache:false,
        views: {
            'tab_lead_list': {
                templateUrl: 'templates/add-lead-activity.html',
                controller: 'leadController'
            }
        }
    })
    
    
    .state('tab.lead-order-list', {
        url: '/lead-order-list',
        cache:false,
        views: {
            'tab_lead_list': {
                templateUrl: 'templates/lead-order-list.html',
                controller: 'leadController'
            }
        }
    })
    
    
    .state('tab.lead-quotation-list', {
        url: '/lead-quotation-list',
        cache:false,
        views: {
            'tab_lead_list': {
                templateUrl: 'templates/lead-quotation-list.html',
                controller: 'leadController'
            }
        }
    })
    
    
    .state('tab.lead-quotation-add', {
        url: '/lead-quotation-add',
        cache:false,
        views: {
            'tab_lead_list': {
                templateUrl: 'templates/lead-quotation-add.html',
                controller: 'orderCtrl'
            }
        }
    })
    .state('tab.lead-quotation-detail', {
        url: '/lead-quotation-detail',
        cache:false,
        views: {
            'tab_lead_list': {
                templateUrl: 'templates/lead-quotation-detail.html',
                controller: 'leadController'
            }
        }
    })
    
    
    .state('tab.all-followup-list', {
        url: '/all-followup-list',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/all-followup-list.html',
                controller: 'activityCtrl'
            }
        }
    })
    
    .state('tab.followup-add', {
        url: '/followup-add',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/followup-add.html',
                controller: 'activityCtrl'
            }
        }
    })
    
    .state('tab.all-activity-list', {
        url: '/all-activity-list',
        cache:false,
        views: {
            'tab-all-activity-list': {
                templateUrl: 'templates/all-activity-list.html',
                controller: 'activityCtrl'
                
            }
        }
    })
    
    .state('tab.menu', {
        url: '/menu',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/menu.html',
                controller: 'dashCtrl'
            }
        }
    })
    
    .state('tab.attendance', {
        url: '/attendance',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/attendance.html',
                controller: 'loginCtrl'
            }
        }
    })
    
    .state('tab.all-order-list', {
        url: '/all-order-list',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/all-order-list.html',
                controller: 'orderCtrl'
            }
        }
    })
    ///////// Yogesh ///////////
    .state('tab.sfa-order-list', {
        url: '/sfa-order-list',
        cache:false,
        views: {
            'tab-primary-order': {
                templateUrl: 'templates/okaya_sfa/sfa-order-list.html',
                controller: 'sfaOrderCtrl'
            }
        }
    })
    
    .state('tab.sfa-order-add', {
        url: '/sfa-order-add',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/okaya_sfa/sfa-order-add.html',
                controller: 'sfaOrderCtrl'
            }
        }
    })
    
    .state('tab.sfa-order-detail', {
        url: '/sfa-order-detail',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/okaya_sfa/sfa-order-detail.html',
                controller: 'sfaOrderCtrl'
            }
        }
    })
    /////////////////
    
    //////////// Bhanu///////////
    
    .state('tab.SFA_LeaveApplicationlist', {
        url: '/SFA_LeaveApplicationlist',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/okaya_sfa/SFA_LeaveApplicationlist.html',
                controller: 'leaveCtrl'
            }
        }
    })
    .state('tab.SFA_LeaveApplicationadd', {
        url: '/SFA_LeaveApplicationadd',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/okaya_sfa/SFA_LeaveApplicationadd.html',
                controller: 'leaveCtrl'
            }
        }
    })
    
    .state('tab.PJP', {
        url: '/PJP',
        cache:false,
        views: {
            'tab-pjp': {
                templateUrl: 'templates/okaya_sfa/pjpList.html',
                controller: 'activityCtrl'
            }
        }
    })
    
    //////////////////////////////
    
    .state('tab.customer-list', {
        url: '/customer-list',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/customer-list.html',
                controller: 'customerCtrl'
            }
        }
    })
    
    .state('tab.order-detail', {
        url: '/order-detail',
        cache:false,
        views: {
            'tab_lead_list': {
                templateUrl: 'templates/order-detail.html',
                controller: 'leadController'
            }
        }
    })
    
    
    .state('tab.order-add', {
        url: '/order-add',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/order-add.html',
                controller: 'orderCtrl'
            }
        }
    })
    
    .state('tab.lead-add', {
        url: '/lead-add',
        cache:false,
        views: {
            'tab-dashboard': {
                templateUrl: 'templates/add-lead.html',
                controller: 'leadController'
            }
        }
    })

    .state('tab.lead-edit', {
        url: '/lead-edit',
        cache:false,
        views: {
            'tab-dashboard': {
                templateUrl: 'templates/edit-lead.html',
                controller: 'leadController'
            }
        }
    })
    
    
    .state('tab.add-activity', {
        url: '/add-activity',
        cache:false,
        views: {
            'tab-all-activity-list': {
                templateUrl: 'templates/addActivity.html',
                controller: 'activityCtrl'
            }
        }
    })
    
    
    .state('tab.activity-meeting-end', {
        url: '/activity-meeting-end',
        cache:false,
        views: {
            'tab-all-activity-list': {
                templateUrl: 'templates/activity-meeting-end.html',
                controller: 'activityCtrl'
            }
        }
    })
    
    
    .state('tab.profile', {
        url: '/profile',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/profile.html',
                controller: 'loginCtrl'
            }
        }
    })
    
    .state('tab.edit-profile', {
        url: '/edit-profile',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/okaya_sfa/edit-profile.html',
                controller: 'loginCtrl'
            }
        }
    })
    
    
    .state('tab.travel', {
        url: '/travel',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/travel.html',
                controller: 'expenseCtrl'
            }
        }
    })


    ///ankit

.state('tab.report-dashboard', {
    url: '/report-dashboard',
    cache:false,
    views: {
        'tab-menu': {
            templateUrl: 'templates/report-dashboard.html',
            controller: 'dashboardCtrl'
        }
    }
})

///ankit

    .state('tab.travel-add', {
        url: '/travel-add',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/travel-add.html',
                controller: 'expenseCtrl'
            }
        }
    })
    .state('tab.travel-detail', {
        url: '/travel-detail',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/travel-detail.html',
                controller: 'expenseCtrl'
            }
        }
    })
    
    .state('tab.travel-edit', {
        url: '/travel-edit',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/travel-edit.html',
                controller: 'expenseCtrl'
            }
        }
    })
    
    .state('tab.expense', {
        url: '/expense',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/expense.html',
                controller: 'expenseCtrl'
            }
        }
    })
    .state('tab.expense-add', {
        url: '/expense-add',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/expense-add.html',
                controller: 'expenseCtrl'
            }
        }
    })
    .state('tab.expense-detail', {
        url: '/expense-detail',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/expense-detail.html',
                controller: 'expenseCtrl'
            }
        }
    })
    .state('tab.expense-edit', {
        url: '/expense-edit',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/expense-edit.html',
                controller: 'expenseCtrl'
            }
        }
    })
    
    .state('tab.organisation-setting', {
        url: '/organisation-setting',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/organisation-setting.html',
                controller: 'loginCtrl'
            }
        }
    })
    
    .state('tab.distribution-network', {
        url: '/distribution-network',
        cache:false,
        views: {
            'tab.distribution-network': {
                templateUrl: 'templates/okaya_sfa/distribution-network-list.html',
                controller: 'networkController'
            }
        }
    })
    
    .state('tab.stock', {
        url: '/stock',
        cache:false,
        views: {
            'tab.stock': {
                templateUrl: 'templates/okaya_sfa/stock.html',
                controller: 'networkController'
            }
        }
    })
    
    .state('tab.daily-plan-report', {
        url: '/daily-plan-report',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/okaya_sfa/daily-plan-report.html',
                controller: 'networkController'
            }
        }
    })
    
    
    .state('tab.collection-report', {
        url: '/collection-report',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/okaya_sfa/collection-report.html',
                controller: 'networkController'
            }
        }
    })
    
    .state('tab.collection-punch', {
        url: '/collection-punch',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/okaya_sfa/collection-punch.html',
                controller: 'networkController'
            }
        }
    })
    
    .state('tab.collection-plan', {
        url: '/collection-plan',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/okaya_sfa/collection-plan.html',
                controller: 'networkController'
            }
        }
    })
    
    .state('tab.network-add', {
        url: '/network-add',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/okaya_sfa/network-add.html',
                controller: 'networkController'
            }
        }
    })
    
    .state('tab.network-edit', {
        url: '/network-edit',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/okaya_sfa/network-edit.html',
                controller: 'networkController'
            }
        }
    })
    
    
    .state('tab.network-detail', {
        url: '/network-detail',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/okaya_sfa/network-detail.html',
                controller: 'networkController'
            }
        }
    })
    
    
    .state('tab.scheme_enroll', {
        url: '/scheme_enroll',
        cache: false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/okaya_sfa/scheme_enroll.html',
                controller: 'networkController'
            }
        }
    })
    
    .state('map-network', {
        url: '/map-network',
        templateUrl: 'templates/okaya_sfa/point-loc-network.html',
        cache:false,
        controller: 'networkController'
    })
    
    .state('tab.map-network', {
        url: '/map-network',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/okaya_sfa/point-loc-network.html',
                controller: 'networkController'
            }
        }
    })
    
    .state('tab.tab-imgdoc', {
        url: '/tab-imgdoc',
        cache:false,
        views: {
            'tab-menu': {
                templateUrl: 'templates/okaya_sfa/tab-imgdoc.html',
                controller: 'networkController'
            }
        }
    })
    
    
    .state('tab.gallery', {
        url: '/gallery-ret',
        cache:false,
        views: {
            'tab-imgdoc': {
                templateUrl: 'templates/okaya_sfa/gallery.html',
                controller: 'networkController'
            }
        }
    })
    
    
    // $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    
    // var param = function(obj) {
    //   var query = '',
    //   name, value, fullSubName, subName, subValue, innerObj, i;
    
    //   for (name in obj) {
    //     value = obj[name];
    
    //     if (value instanceof Array) {
    //       for (i = 0; i < value.length; ++i) {
    //         subValue = value[i];
    //         fullSubName = name + '[' + i + ']';
    //         innerObj = {};
    //         innerObj[fullSubName] = subValue;
    //         query += param(innerObj) + '&';
    //       }
    //     }
    //     else if (value instanceof Object) {
    //       for (subName in value) {
    //         subValue = value[subName];
    //         fullSubName = name + '[' + subName + ']';
    //         innerObj = {};
    //         innerObj[fullSubName] = subValue;
    //         query += param(innerObj) + '&';
    //       }
    //     }
    //     else if (value !== undefined && value !== null) query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    //   }
    
    //   return query.length ? query.substr(0, query.length - 1) : query;
    // };
    
    // $httpProvider.defaults.transformRequest = [function(data) {
    //     return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    // }];
    
})


.config(function($ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.views.forwardCache(false);
});


app.directive("searchableMultiselect", function($timeout) {
    return {
        templateUrl: 'js/dependancies/manualSearchandselect.html',
        
        restrict: 'AE',
        scope: {
            displayAttr: '@',
            selectedItems: '=',
            allItems: '=',
            readOnly: '=',
            removeItem: '&',
            addItem: '&',
        },
        link: function(scope, element, attrs) {
            element.bind('click', function (e) {
                e.stopPropagation();
            });
            
            scope.width = element[0].getBoundingClientRect();
            
            scope.updateSelectedItems = function(obj)
            {
                console.log(obj);
                
                var selectedObj;
                var index;
                for (i = 0; typeof scope.selectedItems !== 'undefined' && i < scope.selectedItems.length; i++)
                {
                    if (scope.selectedItems[i].toUpperCase() === obj.Key.toUpperCase())
                    {
                        selectedObj = scope.selectedItems[i];
                        index = i;
                        break;
                    }
                }
                console.log(selectedObj);
                
                if ( typeof selectedObj === 'undefined' )
                {
                    scope.addItem({item: obj});
                }
                else
                {
                    scope.addItem({item: obj});
                }
            };
            
            scope.isItemSelected = function(item)
            {
                if ( typeof scope.selectedItems === 'undefined' ) return false;
                var tmpItem;
                for (i=0; i < scope.selectedItems.length; i++) {
                    tmpItem = scope.selectedItems[i];
                    if ( typeof tmpItem !== 'undefined'
                    &&	typeof tmpItem !== 'undefined'
                    &&	typeof item[scope.displayAttr] !== 'undefined'
                    &&	tmpItem.toUpperCase() === item[scope.displayAttr].toUpperCase() ) {
                        return true;
                    }
                }
                return false;
            };
            
            scope.commaDelimitedSelected = function() {
                var list = "";
                angular.forEach(scope.selectedItems, function (item, index) {
                    list += item;
                    if (index < scope.selectedItems.length - 1) list += ', ';
                });
                return list.length ? list : "Nothing Selected";
            }
        }
    }
});