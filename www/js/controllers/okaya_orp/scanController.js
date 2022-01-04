app.controller('scanCtrl', function ($scope, $rootScope, searchSelect, $ionicModal, $state, myRequestDBService, myAllSharedService, myRequestDBService, $ionicLoading, $cordovaSQLite, $ionicPopup, $ionicScrollDelegate, $timeout, $ionicActionSheet, $cordovaImagePicker, Camera, $cordovaFileTransfer, $cordovaGeolocation, $cordovaToast, $location, $window, $ionicPlatform, $ionicHistory, $ionicModal,$stateParams, $ionicPopover)
{
  $scope.data = {};
  $scope.data.activity = myAllSharedService.activity
  $scope.result_data = myAllSharedService.result_data;
  $scope.dealer_data = myAllSharedService.dealer_data;
  $scope.code_list = myAllSharedService.code_list;
  $scope.manual_codes = myAllSharedService.manual_codes;
  $scope.dealer_list = []
  $scope.customer_type = []
  $scope.loginData = myAllSharedService.loginData;
  $scope.customer_data = myAllSharedService.customer_data;
  $scope.currentDate =  moment().format('YYYY-MM-DD');
  $scope.isRequestInProcess;
  
  
  console.log( $scope.currentDate);
  
  
  $scope.goToBackPageHandler = function() {
    $ionicHistory.goBack();
  }
  
  
  $scope.getManualCode = function()
  {
    myAllSharedService.manual_codes = [];
    $scope.isRequestInProcess = true;
    
    $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
    });
    
    $scope.data.dr_id = $scope.dealer_data.id;
    
    myRequestDBService.orpPostServiceRequest('/Scan_Controller/getManualCode',$scope.data).then(function (result)
    {
      $ionicLoading.hide();
      
      console.log(result);
      let codes = result.outputData;
      //  $scope.manual_codes = codes.filter(row => row.coupon_code != );
      if(codes.length > 0)
      {
        for(let i =0;i< codes.length;i++)
        {
          let index =  $scope.code_list.findIndex(row => row.coupon_code == codes[i].coupon_code);
          if(index == -1)
          myAllSharedService.manual_codes.push(codes[i]);
        }
      }
      
      $scope.manual_codes = myAllSharedService.manual_codes ;
      
      console.log($scope.manual_codes);
      $scope.isRequestInProcess = false;
      
    },
    function (err)
    {
      console.error(err);
      $ionicLoading.hide();
      $scope.isRequestInProcess = false;
      
    })
    
  }
  
  
  $scope.startScan = function(type,code)
  {
    console.log(type);
    console.log( myAllSharedService.activity);
    myAllSharedService.result_data = {}
    
    cordova.plugins.barcodeScanner.scan(function (result)
    {
      console.log(result);
      if($scope.data.activity == 'dealer_purchase')
      $scope.data.distributor_id = $scope.dealer_data.id
      
      var serial_no_array = result.text.split(/\r\n/);
      var tmp_array = [];      
      console.log(result.text);
      
      let index = -1;
      
      console.log($scope.code_list);

      for (let i = 0; i < serial_no_array.length; i++) 
      {
        console.log(serial_no_array[i].split("\r").join(""));

        var tmp_string = serial_no_array[i].split("\r").join("");

        if (tmp_string !="")
        {
          index = $scope.code_list.findIndex(row => String(row.coupon_code) == String(tmp_string));
          
          console.log(index);
  
          if(index == -1)
          {
            tmp_array.push(serial_no_array[i]);
            
            console.log(serial_no_array[i]);
          }
        }

        
      }
      
      console.log(tmp_array);
      
      
      if (tmp_array.length)
      {
        $scope.data.text = tmp_array.join("\n");
        
        console.log($scope.data.text);
        
        if ($scope.data.text)
        {
          $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
          });

          myRequestDBService.orpPostServiceRequest('/Scan_Controller/DMS_COUPON_SCAN',$scope.data).then(function (result)
          {
            console.log(result);
            $scope.result_data = result;
            
            if(result.status == 'Success')
            {
              $scope.code_list = $scope.code_list.concat($scope.result_data.outputData);
              myAllSharedService.code_list = $scope.code_list ;
              console.log(myAllSharedService);
              
              // $state.go('orptab.orp_alert-message');
              $scope.scanSuccessOpenModel();

              $ionicLoading.hide();
            }
            else
            {
              // myAllSharedService.result_data = result;
              $scope.result_data = result;
              // console.log(myAllSharedService.result_data);
              $scope.scanSuccessOpenModel();

              $ionicLoading.hide();
              
              // $state.go('orptab.orp_alert-message');
            }
          })
        }
      }
      else
      {
        $scope.result_data.status = 'Error';
        $scope.result_data.error_message = "Already Scan";
        $scope.scanSuccessOpenModel();
        
      }
      
    },
    function (error) {
      // alert("Scanning failed: " + error);
      $ionicLoading.hide();
    },
    {
      showTorchButton: true, // iOS and Android
      prompt: "Scan Your QRCode", // Android
    })
    
    
  }
  
  console.log($scope.result_data)
  console.log($scope.dealer_list);
  
  $scope.saveDistributorSale = function()
  {
    console.log($scope.dealer_data);
    
    if($scope.dealer_data.date)
    {
      $ionicPopup.confirm({
        
        title: 'Are You Sure, You Want to Save ?',
        buttons: [{
          text: 'YES',
          type: 'button-block button-outline button-stable',
          onTap: function (e) {
            $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
            });
            
            let inputData ={}
            inputData.code_list = $scope.code_list
            inputData.dealer_id =$scope.dealer_data.id;
            inputData.dealer_code =$scope.dealer_data.dr_code;
            inputData.date = moment($scope.dealer_data.date).format('YYYY-MM-DD')
            inputData.dealer_name = $scope.dealer_data.dr_name;
            inputData.activity =  $scope.data.activity;
            
            console.log(inputData);
            
            myRequestDBService.orpPostServiceRequest('/Scan_Controller/save_distributor_sale',inputData).then(function (result)
            {
              $ionicLoading.hide();
              console.log(result);
              if(result.msg == 'success')
              {
                // $ionicLoading.show({ template: 'Scanning Successful!', noBackdrop: true, duration: 2000 });
                $state.go('orptab.orp_dashboard');
                
                $ionicPopup.alert({
                  title: 'Success',
                  template: 'Scanning Successful!'
                });
                
              }
              else
              {
                $ionicPopup.alert({
                  title: 'Scanning failed!',
                  template: 'Please Try Again!'
                });
              }
              
            },
            function (err)
            {
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
    else
    {
      $ionicPopup.alert({
        title: 'Error!',
        template: 'Select Date!'
      })
    }
    
  }
  
  console.log($scope.customer_data);
  
  $scope.saveDealerSale = function(warranty)
  {
    console.log($scope.customer_data);
    console.log($scope.data);
    
    $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
    });
    
    let inputData ={}
    inputData.code_list = $scope.code_list
    inputData.customer_data = $scope.customer_data;
    
    var index = $scope.customer_type.findIndex(row => row.id == inputData.customer_data.type_id)
    inputData.customer_data.type = $scope.customer_type[index].type
    inputData.warranty_update = warranty == '1'?1:0;
    
    inputData.activity =  $scope.data.activity;
    console.log(inputData);
    
    myRequestDBService.orpPostServiceRequest('/Scan_Controller/save_dealer_sale',inputData).then(function (result)
    {
      $ionicLoading.hide();
      console.log(result);
      if(result.msg == 'success')
      {
        $scope.otpCloseModel();
        //  $ionicLoading.show({ template: 'Scanning Successful!', noBackdrop: true, duration: 2000 });
        
        setTimeout(() =>
        {
          $state.go('orptab.orp_dashboard');
          
          $ionicPopup.alert({
            title: 'Success',
            template: 'Scanning Successful!'
          });
          
        }, 500);
      }
      else
      {
        $ionicPopup.alert({
          title: 'Scanning failed!',
          template: 'Please Try Again!'
        });
      }
      
    },
    function (err)
    {
      console.error(err);
      $ionicLoading.hide();
    })
    
  }
  
  $ionicModal.fromTemplateUrl('warranty_section_otp', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  
  $scope.otpOpenModel = function() {
    $scope.modal.show();
  };
  $scope.otpCloseModel = function() {
    $scope.modal.hide();
  };
  
  
  $scope.getOTP = function ()
  {
    console.log("function call");
    $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
    });
    
    myRequestDBService.orpPostServiceRequest('/Scan_Controller/get_otp',$scope.customer_data.mobile_no).then(function (result)
    {
      console.log(result);
      $ionicLoading.hide();
      if (result.status == 'success')
      {
        $scope.data.otpCode = result.otpCode;
      }
    });
  }
  
  $scope.checkOtp = function()
  {
    console.log($scope.data);
    if ($scope.data.otp == $scope.data.otpCode)
    {
      $scope.saveDealerSale('1');
    }
    else
    {
      $ionicPopup.alert({
        title: 'Error!',
        template: 'OTP is Not Correct!'
      });
    }
  }
  
  $scope.openWarrantySection = function()
  {
    var error = 0;
    
    if($scope.code_list.length > 0)
    {
      for(let i= 0;i< $scope.code_list.length;i++)
      {
        if($scope.code_list[i].sale_date)
        {
          $scope.code_list[i].sale_date =  moment($scope.code_list[i].sale_date).format('YYYY-MM-DD');
        }
        else
        {
          error++ ;
        }
      }
      if(error == 0)
      {
        
        $ionicPopup.confirm({
          
          title: 'Are You Sure, You Want to Save ?',
          buttons: [{
            text: 'YES',
            type: 'button-block button-outline button-stable',
            onTap: function (e)
            {
              console.log($scope.loginData);
              console.log($scope.customer_data.type_id);
              if($scope.customer_data.type_id == '1')
              {
                $scope.getOTP();
                $scope.otpOpenModel();
              }
              if($scope.customer_data.type_id != '1')
              {
                
                $scope.saveDealerSale('2');
                console.log($scope.customer_data);
                
              }
              
            }},
            {
              text: 'NO',
              type: 'button-block button-outline button-stable',
              onTap: function (e) {
                console.log('You Are Not Sure');
              }
            }]
          });
        }
        else
        {
          $ionicPopup.alert({
            title: 'Error!',
            template: 'Select Date of Sale for All!'
          })
        }
      }
      else
      {
        $ionicPopup.alert({
          title: 'Error!',
          template: 'No Product Scanned!'
        })
      }
    }
    
    
    let fetchingRecords = false;
    $scope.search = {}
    
    
    $scope.onGetSearchSelectDataHandler = function (type_info, searchKey, pagenumber)
    {
      
      if(!searchKey) {
        
        $ionicLoading.show({
          template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
          duration: 3000
        });
      }
      
      if (fetchingRecords) return;
      fetchingRecords = true;
      
      var targetArr = { type: type_info, state_name: $scope.search.stateName.Value, loginData: $scope.loginData };
      
      console.log(targetArr);
      
      searchSelect.onGetSearchSelectData(targetArr, searchKey, pagenumber).then(function (result) {
        
        console.log(result);
        
        if (type_info == 'fetchStateData') {
          
          $scope.totalStateRecords = result.TotalRecords;
          $scope.stateList = result.Records;
          
          // myAllSharedService.customer_data.address =''
          // myAllSharedService.customer_data.districtName = '';
          // myAllSharedService.customer_data.pincode = '';
          
          // $scope.customer_data.address =''
          // $scope.customer_data.districtName = '';
          // $scope.customer_data.pincode = '';
          
          
        }
        
        if (type_info == 'fetchDistrictData') {
          
          $scope.totalDistrictRecords = result.TotalRecords;
          $scope.districtList = result.Records;
          
          // myAllSharedService.customer_data.address =''
          // myAllSharedService.customer_data.pincode = '';
          
          // $scope.customer_data.address =''
          // $scope.customer_data.districtName = '';
          // $scope.customer_data.pincode = '';
          
        }
        
        fetchingRecords = false;
        
      }, function (errorMessage) {
        
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
    
    
    $scope.getData = function()
    {
      $ionicLoading.show({
        template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
        duration: 3000
      });
      myRequestDBService.orpPostServiceRequest('/Scan_Controller/dealer_list',$scope.data).then(function (result)
      {
        $ionicLoading.hide();
        console.log(result);
        $scope.dealer_list = result.outputData;
        console.log($scope.dealer_list);
      })
      
    }
    
    $scope.dealerData = function(id)
    {
      // console.log($scope.dealer_data.id);
      myAllSharedService.code_list = $scope.code_list = [];
      console.log(id);
      $ionicLoading.show({
        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
      });
      
      // var index = $scope.dealer_list.findIndex(row => row.id == id);
      // console.log(index);
      
      // $scope.dealer_data = $scope.dealer_list[index] ;
      // myAllSharedService.dealer_data = $scope.dealer_data
      // console.log($scope.dealer_data);
      
      // setTimeout(() => {
      //   $ionicLoading.hide();
      //  }, 1000);
      
      myRequestDBService.orpPostServiceRequest('/Scan_Controller/dealer_data',id).then(function (result)
      {
        $ionicLoading.hide();
        console.log(result);
        $scope.dealer_data = result.dr_data;
        console.log($scope.dealer_data);
        myAllSharedService.dealer_data = $scope.dealer_data;
      },
      function (err)
      {
        $ionicLoading.hide();
        console.error(err);
      });
    }
    
    $scope.customerData = function(value)
    {
      
      console.log($scope.search);
      console.log($scope.search.stateName.Value);
      
      myAllSharedService.customer_data = $scope.customer_data;
      
      if($scope.search.stateName.Value != '')
      {
        myAllSharedService.customer_data.stateName = $scope.search.stateName.Value
        console.log($scope.customer_data);
      }
      if($scope.search.districtName.Value != '')
      {
        myAllSharedService.customer_data.districtName = $scope.search.districtName.Value
      }
      
      $scope.customer_data = myAllSharedService.customer_data ;
      
      console.log($scope.customer_data);
      console.log(myAllSharedService);
      
      
      if($scope.customer_data.mobile_no && value == '1')
      {
        myRequestDBService.orpPostServiceRequest('/Scan_Controller/get_customer_data',$scope.customer_data).then(function (result)
        {
          console.log(result);
          
          if(result.status == 'exist')
          {
            var data = result.outputData;
            console.log(data);
            
            myAllSharedService.customer_data.id = data.id
            myAllSharedService.customer_data.type_id = data.type_id
            myAllSharedService.customer_data.customer_name = data.name
            myAllSharedService.customer_data.mobile_no =parseInt(data.mobile)
            myAllSharedService.customer_data.address = data.address
            myAllSharedService.customer_data.stateName = data.state
            myAllSharedService.customer_data.districtName = data.district
            myAllSharedService.customer_data.pincode = parseInt(data.pincode);
            
            
            $scope.search.stateName = { Key: data.state, Value: data.state };
            $scope.search.districtName = { Key: data.district, Value: data.district };
            
            // $scope.onGetSearchSelectDataHandler('fetchDistrictData',data.state, 1);
            
            setTimeout(() => {
              $scope.onGetSearchSelectDataHandler('fetchDistrictData',data.state, 1);
              $scope.search.districtName = { Key: data.district, Value: data.district };
              
            },200);
            
            $scope.customer_data = myAllSharedService.customer_data
            
            // $ionicPopup.alert({
            //   title: 'Exist!',
            //   template: 'Customer Exist With This Number!'
            // });
          }
          else
          {
            myAllSharedService.customer_data.id = ''
            // myAllSharedService.customer_data.type_id =''
            myAllSharedService.customer_data.customer_name =''
            myAllSharedService.customer_data.address =''
            myAllSharedService.customer_data.stateName = ''
            myAllSharedService.customer_data.districtName = '';
            myAllSharedService.customer_data.pincode = '';
            
            $scope.search.stateName = { Key: "Select State Name *", Value: "" };
            $scope.search.districtName = { Key: "Select District Name *", Value: "" };
            
            $scope.customer_data = myAllSharedService.customer_data ;
            
            // $ionicPopup.alert({
            //   title: 'Does Not Exist!',
            //   template: 'No Customer Found With This Number!'
            // });
          }
          
        })
      }
      console.log($scope.customer_data);
      console.log(myAllSharedService.customer_data);
      
    }
    
    $scope.getType = function()
    {
      myRequestDBService.orpPostServiceRequest('/Scan_Controller/customer_type',$scope.data).then(function (result)
      {
        console.log(result);
        $scope.customer_type = result.outputData;
        console.log($scope.customer_type);
      })
      
    }
    
    
    $scope.onSearchPincodeChangeHandler = function()
    {
      
      console.log($scope.customer_data.pincode)
      console.log($scope.customer_data.pincode.length)
      
      if($scope.customer_data.pincode) {
        
        setTimeout(() => {
          
          $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
          });
          
          console.log($scope.customer_data.pincode)
          
          myRequestDBService.orpPostServiceRequest('/App_SharedData/onGetPincodeDetail',$scope.customer_data).then(function (result)
          {
            
            setTimeout(() => {
              $ionicLoading.hide();
            }, 200);
            
            console.log(result);
            
            if(result.pincodeData && result.pincodeData['id']) {
              
              const stateName = result.pincodeData.state_name;
              const districtName = result.pincodeData.district_name;
              const pincode = result.pincodeData.pincode;
              
              console.log(districtName);
              
              $scope.search.stateName = { Key: stateName, Value: stateName };
              myAllSharedService.customer_data.pincode = parseInt(result.pincodeData.pincode)
              myAllSharedService.customer_data.stateName = result.pincodeData.state_name
              myAllSharedService.customer_data.districtName = result.pincodeData.district_name
              // $scope.onGetSearchSelectDataHandler('fetchDistrictData',stateName, 1);
              
              // $scope.search.districtName = { Key: districtName, Value: districtName };
              
              setTimeout(() => {
                $scope.onGetSearchSelectDataHandler('fetchDistrictData',stateName, 1);
                
                $scope.search.districtName = { Key: districtName, Value: districtName };
                
                
                //  $scope.customerData();
                
              }, 500);
              // $scope.data.searchPincode = '';
              
            } else {
              
              $scope.search.stateName = { Key: "Select State Name *", Value: "" };
              $scope.search.districtName = { Key: "Select District *", Value: "" };
              $scope.customer_data.pincode = '';
            }
            
          },function (err) {
            
            $ionicLoading.hide();
            console.error(err);
          })
          
        }, 500);
        
      } else {
        
        $scope.search.stateName = { Key: "Select State Name *", Value: "" };
        $scope.search.districtName = { Key: "Select District *", Value: "" };
        //      $scope.data.pincode = '';
      }
    }
    
    
    $scope.getWalletData = function()
    {
      
      myAllSharedService.wallet_data ={};
      
      console.log("function call");
      $ionicLoading.show({
        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
      });
      console.log($scope.data);
      myRequestDBService.orpPostServiceRequest('/Scan_Controller/wallet_data',$scope.data).then(function (result)
      {
        console.log(result);
        $ionicLoading.hide();
        if (result.msg == 'success')
        {
          $scope.wallet_data = result.outputData;
          console.log($scope.wallet_data);
          $scope.coupan_list = $scope.wallet_data.scan_counpon_data;
          console.log($scope.coupan_list);
          $scope.wallet_data.total = 0;
          $scope.wallet_data.type = $scope.data.type;
          for(let i =0;i < $scope.wallet_data.category_data.length ;i++)
          {
            $scope.wallet_data.total = $scope.wallet_data.total + parseInt($scope.wallet_data.category_data[i].category_point);
          }
          
          myAllSharedService.wallet_data = $scope.wallet_data;
        }
      });
      
    }
    
    $scope.dateFilter = false;
    $scope.getCategoryWiseData = function(category)
    {
      
      myAllSharedService.wallet_list = [];
      myAllSharedService.category = category;;
      $ionicLoading.show({
        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
      });
      
      
      $scope.data.category = myAllSharedService.category;
      
      if($scope.data.date_from && $scope.data.date_to)
      {
        $scope.data.date_from = moment($scope.data.date_from).format("YYYY-MM-DD");
        $scope.data.date_to = moment($scope.data.date_to).format("YYYY-MM-DD");
      }
      
      myRequestDBService.orpPostServiceRequest('/Scan_Controller/category_wallet_data',$scope.data).then(function (result)
      {
        console.log(result);
        $ionicLoading.hide();
        if(result.msg == 'success')
        {
          $scope.wallet_list = result.outputData;
          $scope.wallet_data.total = 0;
          for(let i =0;i < $scope.wallet_list.length ;i++)
          {
            $scope.wallet_data.total = $scope.wallet_data.total + parseInt($scope.wallet_list[i].points);
          }
          
          myAllSharedService.wallet_list = $scope.wallet_list;
          
          console.log($scope.wallet_list);
          console.log(myAllSharedService.wallet_list);
          
          $state.go('orptab.orp_wallet-detail');
          
        }
      });
      
    }
    
    
    if($location.path() == '/orptab/orp_scan_sale') {
      
      
      if(myAllSharedService.customer_data != {})
      {
        $scope.search.stateName = { Key: $scope.customer_data.stateName, Value: $scope.customer_data.stateName };
        $scope.search.districtName = { Key:$scope.customer_data.districtName, Value:$scope.customer_data.districtName };
      }
      else
      {
        $scope.search.stateName = { Key: "Select State Name *", Value: "" };
        $scope.search.districtName = { Key: "Select District Name *", Value: "" };
      }
      
      
      $scope.onGetSearchSelectDataHandler('fetchStateData', '', 1);
      $scope.getType();
      
      $ionicPopover.fromTemplateUrl('scan-success-model', {
        scope: $scope,
      }).then(function (popovers) {
        $scope.data.remarkModel = popovers;
      });
      
      
    }
    
    if($location.path() == '/orptab/orp_scan_purchase')
    {
      $scope.getData();
      $ionicPopover.fromTemplateUrl('scan-success-model', {
        scope: $scope,
      }).then(function (popovers) {
        $scope.data.remarkModel = popovers;
      });
      
      
    }
    
    $scope.scanSuccessOpenModel = function () {
      $scope.data.remarkModel.show();
    };
    $scope.scanSuccessCloseModel = function () {
      $scope.data.remarkModel.hide();
    };
    
    if($location.path() == '/orptab/orp_wallet-history')
    {
      $scope.wallet_list = [];
      $scope.wallet_data = {};
      if($scope.loginData.loginType == "Electrician")
      {
        $scope.data.type = "electrician_scan";
      }
      else{
        
        $scope.data.type = "purchase";
        
      }
      console.log($scope.loginData);
      $scope.getWalletData();
    }
    
    
    $scope.select_mul_category = function (data)
    {
      console.log(data.category)
      var idx = $scope.search.categoryName.findIndex(row=>row == data.Key);
      if(idx == -1)
      {
        $scope.search.categoryName.push(data.Key);
      }
      else
      {
        $scope.search.categoryName.splice(idx,1);
      }
      
      var idx2 = $scope.selectedCategory.findIndex(row=>row.category_name == data.Key);
      if(idx2 == -1)
      {
        $scope.selectedCategory.push({"category_id":data.id,"category_name":data.Key});
      }
      else
      {
        $scope.selectedCategory.splice(idx2,1);
      }
      
      if($scope.search.categoryName.length==0)
      {
        $scope.search.brandName =[];
        $scope.selectedBrand =[];
      }
      
      console.log($scope.search.categoryName)
      
      $scope.getAllBrandList();
    };
    
    // $scope.single_select = function (item) {
    //   console.log(item);
    
    //   $scope.dealer_data.id = item.id
    //   $scope.dealer_data.selectid = new Array(item.dr_name);
    //   $scope.dealer_data.selectdata = item;
    
    //   // ng-model = "dealer_data.id"; required ng-change="dealerData(dealer_data.id)"
    
    //   // $scope.data.user_name = new Array();
    //   // $scope.data.user_name.push(item.Key);
    //   // console.log($scope.data.user_name);
    //   // $scope.data.user_data = item;
    // }
    
    $scope.single_select = function (item) {
      console.log(item);
      $scope.data.user_name = new Array();
      $scope.data.user_name.push(item.Key);
      console.log($scope.data.user_name);
      $scope.data.user_data = item;
      $scope.dealerData(item.id);
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
    
    
    
    if($location.path() == '/orptab/orp_wallet-detail')
    {
      $scope.wallet_data = myAllSharedService.wallet_data;
      $scope.wallet_list = myAllSharedService.wallet_list ;
      
      console.log($scope.wallet_list);
      console.log(myAllSharedService.wallet_list);
      
    }
    
    $scope.dateFormat = function(date)
    {
      return moment(date).format("DD MMM YYYY")
    }
    
    $scope.dateTimeFormat = function(date)
    {
      return moment(date).format("DD MMM YYYY h:mm A")
    }
    
    $ionicPlatform.registerBackButtonAction(function(e){
      $state.go('orptab.orp_dashboard');
    }, 101);
    
  })
  