
var angularApp = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngMaterial','ngCordova','angular-search-and-select'])

angularApp.run(function ($ionicPlatform, myRequestDBService, myAllSharedService, $cordovaSQLite, $ionicPopup, $ionicLoading, $state, $ionicHistory, $timeout, $rootScope, $cordovaAppVersion) {
  
  $ionicPlatform.ready(function() {
    
    
    function onHideSplashHandler() {
      
      $timeout(function () {
        navigator.splashscreen.hide();
      }, 100);
    }
    
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    
    if (window.StatusBar) {
      
      StatusBar.show();
      StatusBar.backgroundColorByHexString("#253c71");
      StatusBar.overlaysWebView(false);
    }
    
    $ionicPlatform.registerBackButtonAction(function () {
      
      console.log($ionicHistory.currentStateName());
      
      if ($ionicHistory.currentStateName() == 'orp_login' || $ionicHistory.currentStateName() == 'orptab.orp_dashboard') {
        
        if(backbutton==0) {
          
          backbutton++;
          window.plugins.toast.showShortBottom('Press again to exit');
          $timeout(function(){backbutton=0;},2500);
          
        } else {
          
          ionic.Platform.exitApp();
        }
        
      }  else {
        
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
    
    if (window.cordova) {
      
      console.log("Notification Function Call");
      
      const push = PushNotification.init({
        android: {
          senderID: "358962269715",
          sound: "true",
          vibrate: "true",
          icon: "ic_stat_onesignal_default",
          iconColor: "#ed6c11",
          forceShow:"true"
        }
      });
      
      push.on('notification', data => {
        console.log(data);
        
      });
      
      push.on('notification', function(data) {
        
        console.log('notification event');
        if (data.additionalData.url) {
        } else {
          
        }
        console.log(data);
        
        $rootScope.notificationData = data.additionalData;
        
        console.log( $rootScope.notificationData );
        push.finish(function() {
          console.log('success');
        }, function() {
          console.log('error');
        });
      });
    }
    
    
    
    
    
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS "+dbTableName+" (id integer primary key,username text,password text, organisationId text)");
    
    var query ="SELECT username, password, organisationId FROM "+dbTableName+" ORDER BY id DESC LIMIT 1";
    
    console.log(db);
    console.log(query);
    $cordovaSQLite.execute(db, query).then(function(res) {
      console.log(res);
      
      if(res.rows.length > 0 && res.rows.item(0).username && res.rows.item(0).password) {
        
        $ionicLoading.show({
          template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
        });
        
        console.log(res.rows.item(0).organisationId );
        console.log(res.rows.item(0).organisationId != undefined);
        
        if(res.rows.item(0).organisationId != 'undefined' && res.rows.item(0).organisationId != null)
        {
          myRequestDBService.login(res.rows.item(0).username,res.rows.item(0).password, res.rows.item(0).organisationId)
          .then(function (result) {
            
            console.log(result);
            
            onHideSplashHandler()
            $ionicLoading.hide();
            
            const loginData = {};
            if (result.loginData.dr_code) {
              loginData.loginId = result.loginData.id;
              loginData.loginName = result.loginData.dr_name;
              loginData.loginType = result.loginData.type_name;
              $rootScope.loginType = result.loginData.type_name;
              loginData.loginTypeId = result.loginData.type_id;
              loginData.loginMobile = result.loginData.contact_mobile_no;
              loginData.contact_name = result.loginData.contact_name;
              loginData.orp = result.loginData.orp;
              loginData.orp_wallet_point = parseInt(result.loginData.orp_wallet_point);
              loginData.drCode = result.loginData.dr_code;
              loginData.state = result.loginData.state_name;
              loginData.district = result.loginData.district_name;
              loginData.isPasswordChange = result.loginData.isPasswordChange;
              myAllSharedService.loginData = loginData;
              console.log(myAllSharedService.loginData)
              $ionicLoading.show({ template: 'Loging Successfully!', noBackdrop: true, duration: 2000 });
              $rootScope.showBanner = 0;
              $state.go('orptab.orp_dashboard');
              if (window.cordova && ionic.Platform.isAndroid()) {
                console.log("Android");
                init(loginData.loginId);
              }
              if (window.cordova && ionic.Platform.isIOS()) {
                console.log("IOS");
                init(loginData.loginId);
              }
            }
            else if (result.loginData.emp_code) {
              loginData.loginId = result.loginData.id;
              loginData.loginType = 'Sales User';
              loginData.loginName = result.loginData.name;
              loginData.emp_code = result.loginData.emp_code;
              loginData.loginSubType = result.loginData.sales_user_type;
              loginData.loginMobile = result.loginData.contact_01;
              loginData.loginImage = result.loginData.image;
              loginData.loginAccessLevel = result.loginData.access_level;
              loginData.user_branch = result.loginData.user_branch;
              loginData.channelSalesLogin = true;
              myAllSharedService.loginData = loginData;
              $state.go('tab.dashboard');
            }
            else {
              $ionicLoading.hide();
              $state.go('orp_login');
              
              $ionicPopup.alert({
                title: 'Login failed!',
                template: 'Please check your credentials!'
              });
            }
          }, function (result) {
            
            onHideSplashHandler()
            $ionicLoading.hide();
            $state.go('orp_login');
          });
        }
        else
        {
          var data = {}
          data.username = res.rows.item(0).username;
          data.password = res.rows.item(0).password;
          
          myRequestDBService.orpPostServiceRequest('/ORP_Login/onValidateLogin',data).then(function (result)
          {
            console.log(result);
            onHideSplashHandler()
            $ionicLoading.hide();
            
            const loginData = {};
            
            if(result.status == 'error') {
              
              $state.go('orp_login');
              
            } else {
              
              if (result.loginData.dr_code) {
                loginData.loginId = result.loginData.id;
                loginData.loginName = result.loginData.dr_name;
                loginData.loginType = result.loginData.type_name;
                $rootScope.loginType = result.loginData.type_name;
                loginData.loginTypeId = result.loginData.type_id;
                loginData.loginMobile = result.loginData.contact_mobile_no;
                loginData.contact_name = result.loginData.contact_name;
                loginData.orp = result.loginData.orp;
                loginData.orp_wallet_point = parseInt(result.loginData.orp_wallet_point);
                loginData.drCode = result.loginData.dr_code;
                loginData.state = result.loginData.state_name;
                loginData.district = result.loginData.district_name;
                loginData.isPasswordChange = result.loginData.isPasswordChange;
                myAllSharedService.loginData = loginData;
                console.log(myAllSharedService.loginData)
                $ionicLoading.show({ template: 'Loging Successfully!', noBackdrop: true, duration: 2000 });
                $rootScope.showBanner = 0;
                $state.go('orptab.orp_dashboard');
                if (window.cordova && ionic.Platform.isAndroid()) {
                  console.log("Android");
                  init(loginData.loginId);
                }
                if (window.cordova && ionic.Platform.isIOS()) {
                  console.log("IOS");
                  init(loginData.loginId);
                }
              }
              else if (result.loginData.emp_code) {
                loginData.loginId = result.loginData.id;
                loginData.loginType = 'Sales User';
                loginData.loginName = result.loginData.name;
                loginData.emp_code = result.loginData.emp_code;
                loginData.loginSubType = result.loginData.sales_user_type;
                loginData.loginMobile = result.loginData.contact_01;
                loginData.loginImage = result.loginData.image;
                loginData.loginAccessLevel = result.loginData.access_level;
                loginData.user_branch = result.loginData.user_branch;
                loginData.channelSalesLogin = true;
                myAllSharedService.loginData = loginData;
                $state.go('tab.dashboard');
              }
              else {
                $ionicLoading.hide();
                $state.go('orp_login');
                
                $ionicPopup.alert({
                  title: 'Login failed!',
                  template: 'Please check your credentials!'
                });
              }
              
            }
          },
          function (result) {
            
            onHideSplashHandler()
            $ionicLoading.hide();
            
            // console.log(myAllSharedService);
            
            $state.go('orp_login');
            // $state.go('login');
          });
        }
        
        
      } else {
        
        onHideSplashHandler();
        
        $ionicLoading.hide();
        $state.go('orp_login');
        // $state.go('orp_dashboard');
        // $state.go('login');
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

  console.log("test provider");

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
        controller: 'customerCtrl'
      }
    }
  })
  
  .state('tab.lead-detail', {
    url: '/lead-detail',
    cache:false,
    views: {
      'tab_lead_list': {
        templateUrl: 'templates/lead-detail.html',
        controller: 'customerCtrl'
      }
    }
  })
  
  .state('tab.lead-activity-list', {
    url: '/lead-activity-list',
    cache:false,
    views: {
      'tab_lead_list': {
        templateUrl: 'templates/lead-activity-list.html',
        controller: 'customerCtrl'
      }
    }
  })
  
  
  .state('tab.lead-followup-list', {
    url: '/lead-followup-list',
    cache:false,
    views: {
      'tab_lead_list': {
        templateUrl: 'templates/lead-followup-list.html',
        controller: 'customerCtrl'
      }
    }
  })
  
  
  .state('tab.lead-requirement-list', {
    url: '/lead-requirement-list',
    cache:false,
    views: {
      'tab_lead_list': {
        templateUrl: 'templates/lead-requirement-list.html',
        controller: 'customerCtrl'
      }
    }
  })
  
  .state('tab.lead-requirement-add', {
    url: '/lead-requirement-add',
    cache:false,
    views: {
      'tab_lead_list': {
        templateUrl: 'templates/lead-requirement-add.html',
        controller: 'orderCtrl'
      }
    }
  })
  
  
  .state('tab.lead-order-list', {
    url: '/lead-order-list',
    cache:false,
    views: {
      'tab_lead_list': {
        templateUrl: 'templates/lead-order-list.html',
        controller: 'customerCtrl'
      }
    }
  })
  
  
  .state('tab.lead-quotation-list', {
    url: '/lead-quotation-list',
    cache:false,
    views: {
      'tab_lead_list': {
        templateUrl: 'templates/lead-quotation-list.html',
        controller: 'customerCtrl'
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
        controller: 'customerCtrl'
      }
    }
  })
  
  
  .state('tab.all-followup-list', {
    url: '/all-followup-list',
    cache:false,
    views: {
      'tab-all-followup-list': {
        templateUrl: 'templates/all-followup-list.html',
        controller: 'activityCtrl'
      }
    }
  })
  
  .state('tab.followup-add', {
    url: '/followup-add',
    cache:false,
    views: {
      'tab-all-followup-list': {
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
  
  // .state('tab.attendance', {
  //     url: '/attendance',
  //     cache:false,
  //     views: {
  //         'tab-menu': {
  //             templateUrl: 'templates/attendance.html',
  //             controller: 'loginCtrl'
  //         }
  //     }
  // })
  
  // .state('tab.all-order-list', {
  //     url: '/all-order-list',
  //     cache:false,
  //     views: {
  //         'tab-menu': {
  //             templateUrl: 'templates/all-order-list.html',
  //             controller: 'orderCtrl'
  //         }
  //     }
  // })
  // ///////// Yogesh ///////////
  .state('tab.sfa-order-list', {
    url: '/sfa-order-list',
    cache:false,
    views: {
      'tab-primary-order': {
        templateUrl: 'templates/okaya_sfa/sfa_pending_order.html',
        controller: 'SFA_BM'
      }
    }
  })
  
  .state('tab.primary-order-list', {
    url: '/primary-order-list',
    cache:false,
    views: {
      'tab-menu': {
        templateUrl: 'templates/okaya_sfa/sfa-order-list.html',
        controller: 'sfaOrderCtrl'
      }
    }
  })
  .state('tab.primary-order-detail', {
    url: '/primary-order-detail',
    cache:false,
    views: {
      'tab-menu': {
        templateUrl: 'templates/okaya_sfa/sfa-order-detail.html',
        controller: 'sfaOrderCtrl'
      }
    }
  })
  
  .state('tab.sfa-order-add', {
    url: '/sfa-order-add',
    cache:false,
    views: {
      'tab-menu': {
        templateUrl: 'templates/okaya_sfa/sfa_pending_order_add.html',
        controller: 'sfaOrderCtrl'
      }
    }
  })
  
  .state('tab.sfa_order_detail', {
    url: '/sfa_order_detail',
    cache: false,
    views: {
      'tab-menu': {
        templateUrl: 'templates/okaya_sfa/pending_order_detail.html',
        controller: 'SFA_BM'
      }
    }
  })
  
  .state('tab.stock', {
    url: '/stock',
    cache: false,
    views: {
      'tab.stock': {
        templateUrl: 'templates/okaya_sfa/stock.html',
        controller: 'networkController'
      }
    }
  })
  
  
  .state('orptab.sfa-order-add', {
    url: '/sfa-order-add',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/okaya_sfa/sfa-order-add.html',
        controller: 'sfaOrderCtrl'
      }
    }
  })
  
  .state('orptab.sfa-order-detail', {
    url: '/sfa-order-detail',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/okaya_sfa/sfa-order-detail.html',
        controller: 'sfaOrderCtrl'
      }
    }
  })
  
  
  /////////////////
  
  //////////// Bhanu///////////
  
  // .state('tab.SFA_LeaveApplicationlist', {
  //     url: '/SFA_LeaveApplicationlist',
  //     cache:false,
  //     views: {
  //         'tab-menu': {
  //             templateUrl: 'templates/okaya_sfa/SFA_LeaveApplicationlist.html',
  //             controller: 'leaveCtrl'
  //         }
  //     }
  // })
  // .state('tab.SFA_LeaveApplicationadd', {
  //     url: '/SFA_LeaveApplicationadd',
  //     cache:false,
  //     views: {
  //         'tab-menu': {
  //             templateUrl: 'templates/okaya_sfa/SFA_LeaveApplicationadd.html',
  //             controller: 'leaveCtrl'
  //         }
  //     }
  // })
  
  //////////////////////////////
  
  // .state('tab.customer-list', {
  //     url: '/customer-list',
  //     cache:false,
  //     views: {
  //         'tab-menu': {
  //             templateUrl: 'templates/customer-list.html',
  //             controller: 'customerCtrl'
  //         }
  //     }
  // })
  
  // .state('tab.order-detail', {
  //     url: '/order-detail',
  //     cache:false,
  //     views: {
  //         'tab-menu': {
  //             templateUrl: 'templates/order-detail.html',
  //             controller: 'orderCtrl'
  //         }
  //     }
  // })
  // .state('tab.order-add', {
  //     url: '/order-add',
  //     cache:false,
  //     views: {
  //         'tab-menu': {
  //             templateUrl: 'templates/order-add.html',
  //             controller: 'orderCtrl'
  //         }
  //     }
  // })
  
  .state('tab.add-lead', {
    url: '/add-lead',
    cache:false,
    views: {
      'tab-dashboard': {
        templateUrl: 'templates/add-lead.html',
        controller: 'customerCtrl'
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
  
  // .state('tab.travel', {
  //     url: '/travel',
  //     cache:false,
  //     views: {
  //         'tab-menu': {
  //             templateUrl: 'templates/travel.html',
  //             controller: 'expenseCtrl'
  //         }
  //     }
  // })
  // .state('tab.travel-add', {
  //     url: '/travel-add',
  //     cache:false,
  //     views: {
  //         'tab-menu': {
  //             templateUrl: 'templates/travel-add.html',
  //             controller: 'expenseCtrl'
  //         }
  //     }
  // })
  // .state('tab.travel-detail', {
  //     url: '/travel-detail',
  //     cache:false,
  //     views: {
  //         'tab-menu': {
  //             templateUrl: 'templates/travel-detail.html',
  //             controller: 'expenseCtrl'
  //         }
  //     }
  // })
  
  // .state('tab.travel-edit', {
  //     url: '/travel-edit',
  //     cache:false,
  //     views: {
  //         'tab-menu': {
  //             templateUrl: 'templates/travel-edit.html',
  //             controller: 'expenseCtrl'
  //         }
  //     }
  // })
  
  // .state('tab.expense', {
  //     url: '/expense',
  //     cache:false,
  //     views: {
  //         'tab-menu': {
  //             templateUrl: 'templates/expense.html',
  //             controller: 'expenseCtrl'
  //         }
  //     }
  // })
  // .state('tab.expense-add', {
  //     url: '/expense-add',
  //     cache:false,
  //     views: {
  //         'tab-menu': {
  //             templateUrl: 'templates/expense-add.html',
  //             controller: 'expenseCtrl'
  //         }
  //     }
  // })
  // .state('tab.expense-detail', {
  //     url: '/expense-detail',
  //     cache:false,
  //     views: {
  //         'tab-menu': {
  //             templateUrl: 'templates/expense-detail.html',
  //             controller: 'expenseCtrl'
  //         }
  //     }
  // })
  // .state('tab.expense-edit', {
  //     url: '/expense-edit',
  //     cache:false,
  //     views: {
  //         'tab-menu': {
  //             templateUrl: 'templates/expense-edit.html',
  //             controller: 'expenseCtrl'
  //         }
  //     }
  // })
  
  // .state('tab.organisation-setting', {
  //     url: '/organisation-setting',
  //     cache:false,
  //     views: {
  //         'tab-menu': {
  //             templateUrl: 'templates/organisation-setting.html',
  //             controller: 'loginCtrl'
  //         }
  //     }
  // })
  
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
  
  .state('tab.Electrician-list', {
    url: '/Electrician-list',
    cache:false,
    views: {
      'tab-menu': {
        templateUrl: 'templates/okaya_sfa/Electrician-list.html',
        controller: 'networkController'
      }
    }
  })
  
  .state('tab.Electrician-detail', {
    url: '/Electrician-detail',
    cache:false,
    views: {
      'tab-menu': {
        templateUrl: 'templates/okaya_sfa/Electrician-detail.html',
        controller: 'networkController'
      }
    }
  })
  
  
  // .state('tab.network-add', {
  //     url: '/network-add',
  //     cache:false,
  //     views: {
  //         'tab-menu': {
  //             templateUrl: 'templates/okaya_sfa/network-add.html',
  //             controller: 'networkController'
  //         }
  //     }
  // })
  
  
  .state('tab.network-detail', {
    url: '/network-detail',
    cache:false,
    views: {
      'tab.distribution-network': {
        templateUrl: 'templates/okaya_sfa/network-detail.html',
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
  
  // .state('tab.tab-imgdoc', {
  //     url: '/tab-imgdoc',
  //     cache:false,
  //     views: {
  //         'tab-menu': {
  //             templateUrl: 'templates/okaya_sfa/tab-imgdoc.html',
  //             controller: 'networkController'
  //         }
  //     }
  // })
  
  
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
  
  
  
  
  
  
  // ==================
  // ================== ORP App Data Start
  // ==================
  
  .state('orp_login', {
    url: '/orp_login',
    cache:false,
    templateUrl: 'templates/orp_app/orp_login.html',
    controller: 'orploginCtrl'
  })
  
  .state('orp_otp', {
    url: '/orp_otp',
    cache:false,
    templateUrl: 'templates/orp_app/orp_otp.html',
    controller: 'orploginCtrl'
  })
  
  .state('orptab.orp_forgotpassword', {
    url: '/orp_forgotpassword',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/orp_app/orp_forgotpassword.html',
        controller: 'orploginCtrl'
      }
    }
  })
  
  .state('orp_forgotpassword', {
    url: '/orp_forgotpassword',
    cache:false,
    templateUrl: 'templates/orp_app/orp_forgotpassword.html',
    controller: 'orploginCtrl'
  })
  
  .state('orp_registration', {
    url: '/orp_registration',
    cache:false,
    templateUrl: 'templates/orp_app/orp_registration.html',
    controller: 'orploginCtrl'
  })
  
  
  // tabs
  .state('orptab', {
    url: '/orptab',
    abstract: true,
    templateUrl: 'templates/orp_app/orptabs.html',
    controller: 'orpdashCtrl'
  })
  
  .state('orptab.orp_dashboard', {
    url: '/orp_dashboard',
    cache:false,
    views: {
      'orptab-orp-dashboard': {
        templateUrl: 'templates/orp_app/orp_dashboard.html',
        controller: 'orpdashCtrl'
      }
    }
  })
  
  .state('orptab.orp_scan', {
    url: '/orp_scan',
    cache:false,
    views: {
      'orptab-scan': {
        templateUrl: 'templates/orp_app/orp_scan.html',
        controller: 'scanCtrl'
      }
    }
  })
  
  
  .state('orptab.orp_dealerlist', {
    url: '/orp_dealerlist',
    cache:false,
    views: {
      'my-Retailer': {
        templateUrl: 'templates/orp_app/orp_dealerlist.html',
        controller: 'orpdashCtrl'
      }
    }
  })
  
  
  .state('orptab.orp_dealerdetail', {
    url: '/orp_dealerdetail',
    cache:false,
    views: {
      'my-Retailer': {
        templateUrl: 'templates/orp_app/orp_dealerdetail.html',
        controller: 'orpdashCtrl'
      }
    }
  })
  
  
  .state('orptab.orp_manual_serialno', {
    url: '/orp_manual_serialno',
    cache:false,
    views: {
      'orptab-scan': {
        templateUrl: 'templates/orp_app/orp_manual_serialno.html',
        controller: 'scanCtrl'
      }
    }
  })
  
  .state('orptab.orp_alert-message', {
    url: '/orp_alert-message',
    cache:false,
    views: {
      'orptab-scan': {
        templateUrl: 'templates/orp_app/orp_alert-message.html',
        controller: 'scanCtrl'
      }
    }
  })
  
  .state('orptab.orp_electrician_alert-message', {
    url: '/orp_electrician_alert-message',
    cache:false,
    views: {
      'orptab-scan': {
        templateUrl: 'templates/orp_app/orp_electrician_alert-message.html',
        controller: 'orpdashCtrl'
      }
    }
  })
  
  
  .state('orptab.orp_scan_purchase', {
    url: '/orp_scan_purchase',
    cache:false,
    views: {
      'orptab-scan': {
        templateUrl: 'templates/orp_app/orp_scan_purchase.html',
        controller: 'scanCtrl'
      }
    }
  })
  
  .state('orptab.orp_electrician_scan', {
    url: '/orp_electrician_scan',
    cache:false,
    views: {
      'orptab-scan': {
        templateUrl: 'templates/orp_app/orp_electrician_scan.html',
        controller: 'scanCtrl'
      }
    }
  })
  
  .state('orptab.orp_scan_sale', {
    url: '/orp_scan_sale',
    cache:false,
    views: {
      'orptab-scan': {
        templateUrl: 'templates/orp_app/orp_scan_sale.html',
        controller: 'scanCtrl'
      }
    }
  })
  
  .state('orptab.orp_warranty_otp', {
    url: '/orp_warranty_otp',
    cache:false,
    views: {
      'orptab-scan': {
        templateUrl: 'templates/orp_app/orp_warranty_otp.html',
        controller: 'orpCtrl'
      }
    }
  })
  
  
  .state('orptab.orp_wallet-history', {
    url: '/orp_wallet-history',
    cache:false,
    views: {
      'my-wallet': {
        templateUrl: 'templates/orp_app/orp_wallet-history.html',
        controller: 'scanCtrl'
      }
    }
  })
  
  .state('orptab.orp_wallet-detail', {
    url: '/orp_wallet-detail',
    cache:false,
    views: {
      'my-wallet': {
        templateUrl: 'templates/orp_app/orp_wallet-detail.html',
        controller: 'scanCtrl'
      }
    }
  })
  
  
  .state('orptab.orp_offerlist', {
    url: '/orp_offerlist',
    cache:false,
    views: {
      'offerlist': {
        templateUrl: 'templates/orp_app/orp_offerlist.html',
        controller: 'offerCtrl'
      }
    }
  })
  
  
  .state('orptab.orp_offerdetail', {
    url: '/orp_offerdetail',
    cache:false,
    views: {
      'offerlist': {
        templateUrl: 'templates/orp_app/orp_offerdetail.html',
        controller: 'offerCtrl'
      }
    }
  })
  
  .state('orptab.orp_term_condition', {
    url: '/orp_term_condition',
    cache:false,
    views: {
      'offerlist': {
        templateUrl: 'templates/orp_app/orp_term_condition.html',
        controller: 'offerCtrl'
      }
    }
  })
  
  
  .state('orptab.orp_giftdetail', {
    url: '/orp_giftdetail',
    cache:false,
    views: {
      'offerlist': {
        templateUrl: 'templates/orp_app/orp_giftdetail.html',
        controller: 'offerCtrl'
      }
    }
  })
  
  .state('orptab.orp_leaderboard', {
    url: '/orp_leaderboard',
    cache:false,
    views: {
      'leaderboard': {
        templateUrl: 'templates/orp_app/leaderboard.html',
        controller: 'offerCtrl'
      }
    }
  })
  
  .state('orptab.orp_menus', {
    url: '/orp_menus',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/orp_app/orp_menus.html',
        controller: 'orpCtrl'
      }
    }
  })
  .state('orptab.orp_notification', {
    url: '/orp_notification',
    cache:false,
    views: {
      'orptab-orp-dashboard': {
        templateUrl: 'templates/orp_app/orp_notification.html',
        controller: 'orpdashCtrl'
      }
    }
  })
  .state('orptab.orp_pricelist', {
    url: '/orp_pricelist',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/orp_app/orp_pricelist.html',
        controller: 'orpCtrl'
      }
    }
  })
  
  .state('orptab.orp_mystock', {
    url: '/orp_mystock',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/orp_app/orp_mystock.html',
        controller: 'orpdashCtrl'
      }
    }
  })
  
  .state('orptab.orp_warranty', {
    url: '/orp_warranty',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/orp_app/orp_warranty.html',
        controller: 'orpdashCtrl'
      }
    }
  })
  
  
  .state('orptab.orp_getreport', {
    url: '/orp_getreport',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/orp_app/orp_getreport.html',
        controller: 'orpCtrl'
      }
    }
  })
  
  
  .state('orptab.aging_report', {
    url: '/aging_report',
    cache: false,
    views: {
      'menus': {
        templateUrl: 'templates/okaya_sfa/aging_report.html',
        controller: 'orpCtrl'
      }
    }
  })
  
  .state('orptab.orp_account_statement', {
    url: '/orp_account_statement',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/orp_app/orp_account_statement.html',
        controller: 'orpCtrl'
      }
    }
  })
  
  .state('tab.orp_account_statement', {
    url: '/orp_account_statement',
    cache: false,
    views: {
      'tab.distribution-network': {
        templateUrl: 'templates/orp_app/sfa_account_statment.html',
        controller: 'SFA_BM'
      }
    }
  })
  
  .state('tab.user_report', {
    url: '/user_report',
    cache: false,
    views: {
      'tab-dashboard': {
        templateUrl: 'templates/okaya_sfa/user_report.html',
        controller: 'SFA_BM'
      }
    }
  })
  
  
  .state('orptab.commingSoon', {
    url: '/commingSoon',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/orp_app/commingSoon.html',
        controller: 'orpCtrl'
      }
    }
  })
  
  .state('orptab.orp_catalogue', {
    url: '/orp_catalogue',
    cache:false,
    views: {
      'catalogue': {
        templateUrl: 'templates/orp_app/orp_catalogue.html',
        controller: 'orpdashCtrl'
      }
    }
  })
  
  .state('orptab.orp_support', {
    url: '/orp_support',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/orp_app/orp_support.html',
        controller: 'orpCtrl'
      }
    }
  })
  
  .state('orptab.orp_contact', {
    url: '/orp_contact',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/orp_app/orp_contact_us.html',
        controller: 'orpCtrl'
      }
    }
  })
  
  .state('orptab.orp_primary_order', {
    url: '/orp_primary_order',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/okaya_sfa/sfa-order-list.html',
        controller: 'sfaOrderCtrl'
      }
    }
  })
  
  .state('orptab.orp_secondary_order', {
    url: '/orp_secondary_order',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/okaya_sfa/sfa-order-list.html',
        controller: 'sfaOrderCtrl'
      }
    }
  })
  
  .state('orptab.orp_pending_order', {
    url: '/orp_pending_order',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/okaya_sfa/pending-order-list.html',
        controller: 'sfaOrderCtrl'
      }
    }
  })
  
  .state('orptab.orp_pending_order_detail', {
    url: '/orp_pending_order_detail',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/orp_app/orp_pending_order_detail.html',
        controller: 'sfaOrderCtrl'
      }
    }
  })
  
  .state('orptab.orp_order_add', {
    url: '/orp_order_add',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/orp_app/orp_order_add.html',
        controller: 'orderCtrl'
      }
    }
  })
  
  .state('orptab.billing-list', {
    url: '/billing-list',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/okaya_sfa/billing-list.html',
        controller: 'sfaOrderCtrl'
      }
    }
  })
  
  .state('tab.sfa_billing_list', {
    url: '/sfa_billing_list',
    cache: false,
    views: {
      'tab-menu': {
        templateUrl: 'templates/okaya_sfa/sfa_billing_list.html',
        controller: 'SFA_BM'
      }
    }
  })
  .state('tab.sfa_billing_details', {
    url: '/sfa_billing_details',
    cache: false,
    views: {
      'tab-menu': {
        templateUrl: 'templates/okaya_sfa/sfa_billing_details.html',
        controller: 'SFA_BM'
      }
    }
  })
  
  .state('orptab.billing-detail', {
    url: '/billing-detail',
    cache:false,
    views:{
      'menus':{
        templateUrl: 'templates/okaya_sfa/billing-detail.html',
        controller: 'sfaOrderCtrl'
      }
    }
  })
  
  
  .state('orptab.orp_invoice', {
    url: '/orp_invoice',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/orp_app/orp_invoice.html',
        controller: 'orpCtrl'
      }
    }
  })
  
  .state('orptab.outstanding-details', {
    url: '/outstanding-details',
    cache:false,
    views:{
      'menus':{
        templateUrl: 'templates/okaya_sfa/outstanding-details.html',
        controller: 'surveyCtrl'
      }
    }
  })
  
  .state('orptab.Over-due', {
    url: '/Over-due',
    cache:false,
    views:{
      'menus':{
        templateUrl: 'templates/okaya_sfa/Over-due.html',
        controller: 'surveyCtrl'
      }
    }
  })
  
  .state('orptab.orp_faq', {
    url: '/orp_faq',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/orp_app/orp_faq.html',
        controller: 'orpCtrl'
      }
    }
  })
  
  .state('orptab.orp_survey-list', {
    url: '/orp_survey-list',
    cache: false,
    views: {
      'menus': {
        templateUrl: 'templates/orp_app/orp_survey-list.html',
        controller: 'surveyCtrl'
      }
    }
  })
  
  
  .state('orptab.orp_survey', {
    url: '/orp_survey',
    cache: false,
    views: {
      'menus': {
        templateUrl: 'templates/orp_app/orp_survey.html',
        controller: 'surveyCtrl'
      }
    }
  })
  
  .state('orptab.orp_profile', {
    url: '/orp_profile',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/orp_app/orp_profile.html',
        controller: 'orpCtrl'
      }
    }
  })
  
  .state('orptab.edit-profile', {
    url: '/edit-profile',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/orp_app/edit-profile.html',
        controller: 'orpCtrl'
      }
    }
  })
  
  
  .state('orptab.orp_gallery', {
    url: '/orp_gallery',
    cache:false,
    views: {
      'gallery': {
        templateUrl: 'templates/orp_app/orp_gallery.html',
        controller: 'galleryController'
      }
    }
  })
  
  .state('orptab.orp_event_images', {
    url: '/orp_event_images',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/orp_app/orp_event_images.html',
        controller: 'galleryController'
      }
    }
  })
  
  .state('orptab.orp_invoice_img', {
    url: '/orp_invoice_img',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/orp_app/orp_invoice_img.html',
        controller: 'orpCtrl'
      }
    }
  })
  
  
  .state('orptab.orp_history', {
    url: '/orp_history',
    cache:false,
    views: {
      'menus': {
        templateUrl: 'templates/orp_app/orp_history.html',
        controller: 'offerCtrl'
      }
    }
  })
  
  .state('orptab.orp_shipped_detail', {
    url: '/orp_shipped_detail',
    cache:false,
    views: {
      'history': {
        templateUrl: 'templates/orp_app/orp_shipped_detail.html',
        controller: 'offerCtrl'
      }
    }
  })
  
  
  // ==================
  // ================== ORP App Data End
  // ==================
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
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
        return list.length ? list : "Select an option";
      }
    }
  }
});
