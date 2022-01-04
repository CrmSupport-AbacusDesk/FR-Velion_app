app.controller('orpdashCtrl', function ($scope, $rootScope, searchSelect, $ionicModal, $state, myRequestDBService, myAllSharedService, myRequestDBService, $ionicLoading, $cordovaSQLite, $ionicPopup, $ionicScrollDelegate, $timeout, $ionicActionSheet, $cordovaImagePicker, Camera, $cordovaFileTransfer, $cordovaGeolocation, $cordovaToast, $location, $window, $ionicPlatform, $ionicHistory, $ionicModal,$stateParams, $ionicPopover,$cordovaAppVersion, $ionicSlideBoxDelegate)
{

  $scope.loginData = myAllSharedService.loginData;
  myAllSharedService.code_list = []
  myAllSharedService.customer_data = {}
  myAllSharedService.dealer_data ={};
  $scope.uploadURL = uploadURL;
  $rootScope.current_app_version;
  $scope.isSearchBarOpen = false;
  $scope.my_dealer_data =  myAllSharedService.my_dealer_data;
  $scope.data = {} ;
  $scope.warranty_data = {} ;
  $scope.my_stock = [] ;
  $scope.data.type = "inStock";
  $scope.awak=false;

  $scope.goToBackPageHandler = function() {
    console.log('back');
    console.log($ionicHistory.goBack());
    $ionicHistory.goBack();
  }


  if(ionic.Platform.isAndroid() && $location.path() == '/orptab/orp_dashboard') {
    console.log('*** GET VERSION NUMBER CALLED ***');

    myRequestDBService.orpPostServiceRequest('/Dashboard_Controller/getVersion')
    .then(function(response) {

      console.log(response);
      googleStoreVersion = response.google_store_version;

      if(googleStoreVersion)
      {

        $cordovaAppVersion.getVersionNumber().then(function (version)
        {
          console.log(version);
          console.log(googleStoreVersion);
          appVersion = version;

          if(googleStoreVersion!==version)
          {
            console.log('Google Store Version not Equals to App Version');
            versionerr(googleStoreVersion,appVersion);
            $ionicPlatform.registerBackButtonAction(function(e)
            {
              //This will restrict the user to close the popup by pressing back key
              console.log('Registration Back Button Called');
              e.preventDefault();
            },401);
          };

        });
      }



      console.log(googleStoreVersion);
    }, function (err) {
      $ionicLoading.hide();


      console.error(err);
    });


    versionerr = function(newv,oldv) {

      $ionicPopup.confirm({

        title: 'Update Available',
        template: "A newer version("+newv+") of this app is available for download. Please update it from PlayStore ! ",
        subTitle: 'current version : '+oldv,
        buttons: [{

          text: 'Exit',
          type: 'button-block button-outline button-stable',
          onTap: function (e) {
            ionic.Platform.exitApp();

          }

        }, {


          text: 'Update',
          type: 'button-block button-outline button-stable',
          onTap: function (e) {
            console.log('You Are Not Sure');
            console.log("okaya update");
            $window.open("https://play.google.com/store/apps/details?id=com.abacus.loyaltymicrotek", '_system');
            ionic.Platform.exitApp();
          }
        }]

      });

    }
  }


  // if (ionic.Platform.isAndroid()) {

  //   $cordovaAppVersion.getVersionNumber().then(function (version) {
  //     console.log(version);
  //     appVersion = version;
  //     $rootScope.current_app_version = version;
  //     myRequestDBService.orpPostServiceRequest('/Dashboard_Controller/update_dr_version/' + appVersion)
  //     .then(function (response) {
  //       console.log(response);
  //     }, function (err) {
  //       console.error(err);
  //     });

  //   });

  // }

  $scope.data.myStock = 'inStock';

  $scope.getStockData = function()
  {

    $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
    });

    myRequestDBService.orpPostServiceRequest("/Dashboard_Controller/getStockData",$scope.data).then(function(response)
    {
      console.log(response);

      // $scope.loginUserDetail = response.data;

      $scope.my_stock = response.mystock;
      $scope.data.instock = response.instock;
      $scope.data.outstock = response.outstock;
      $ionicLoading.hide();

    },
    function (err)
    {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'Error!',
        template: 'Something went wrong !!'
      });
      console.error(err);
    });
  }

  $scope.showAlert = function()
  {
    $ionicPopup.alert({
      title: 'Error!',
      template: 'Dealer Purchase currently unavailable  !!'
    });
  }

  $scope.notification_data=[];
  $scope.getnotificationList = function()
  {

    $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
    });

    myRequestDBService.orpPostServiceRequest("/Dashboard_Controller/getnotificationList",$scope.data).then(function(response)
    {
      console.log(response);

      // $scope.loginUserDetail = response.data;


      $scope.notification_data = response.notification_data;
      $ionicLoading.hide();

    },
    function (err)
    {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'Error!',
        template: 'Something went wrong !!'
      });
      console.error(err);
    });
  }

  $scope.Offerslidesdata=[];
  $scope.OfferSlides = function (evt){
    $scope.Offerslidesdata=[];
    myRequestDBService.orpPostServiceRequest('/Dashboard_Controller/GET_NOTIFICATION_BANNER', '').then(function (result) {
      console.log(result);
      $scope.Offerslidesdata = result.data;
      $scope.data.offerSlideModel.show();
      $rootScope.showBanner ++;
      console.log($rootScope.showBanner);
    })
  }


  let i;
  $scope.showslider = false;
  $scope.getDasboardData = function()
  {
    $scope.dashboard_data.home_banner = [];
    $ionicLoading.show({
      template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
    });

    myRequestDBService.orpPostServiceRequest('/Dashboard_Controller/get_dr_data',$scope.data).then(function (result)
    {
      $scope.showslider = true;

      console.log(result);
      $ionicLoading.hide();
      $scope.dashboard_data.dr_data = result.dr_data;
      $scope.dashboard_data.wallet_point = result.wallet_point;
      $scope.dashboard_data.dr_data.orp_wallet_point = parseInt($scope.dashboard_data.dr_data.orp_wallet_point);
      $scope.dashboard_data.offer_data = result.offer_data;
      $scope.dashboard_data.home_banner = result.home_banner;
      $scope.dashboard_data.outstanding=parseInt(result.dr_data.credit_exposure);
      $scope.dashboard_data.credit_limit=parseInt(result.dr_data.credit_limit);
      $scope.dashboard_data.over_due=parseInt(result.dr_data.over_due);

      console.log($scope.dashboard_data);

      console.log($scope.loginData.loginType);

      if($scope.loginData.loginType =='Electrician' && $rootScope.showBanner == 0){
        console.log('slider running');
        $scope.OfferSlides();
      }
      // $scope.awak=false;
      // $scope.passwordChangePopup();

    }, function (err) {

      $ionicLoading.hide();
      console.error(err);
    });
  }

  $scope.offerDetail = function (id) {
    // myAllSharedService.dealer_data = {};
    $ionicLoading.show({
      template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
    });

    console.log(id);
    myRequestDBService.orpPostServiceRequest('/Offer_Controller/offer_detail', id).then(function (result) {
      $ionicLoading.hide();
      console.log(result);
      $scope.offer_data = result.offer_data;
      $scope.offer_data.orp_wallet_point = parseInt(result.offer_data.orp_wallet_point);
      console.log($scope.offer_data);
      myAllSharedService.offer_data = $scope.offer_data;

      $state.go('orptab.orp_offerdetail');

    },
    function (err) {
      $ionicLoading.hide();
      console.error(err);
    });

  }



  $scope.goToPage = function(stateName,type)
  {
    console.log(stateName);

    console.log($scope.dashboard_data.dr_data);

    // if($scope.dashboard_data.dr_data.orp_status == 'Approved'  && $scope.dashboard_data.dr_data.is_kyc_done == 1)
    if($scope.dashboard_data.dr_data.orp_status == 'Approved')
    {

      console.log("test");
      console.log(type);
      myAllSharedService.activity = type;
      console.log( myAllSharedService.activity);
      $state.go(stateName);
    }
    // else if($scope.dashboard_data.dr_data.orp_status == 'Pending'  || $scope.dashboard_data.dr_data.is_kyc_done == 0)
    else if($scope.dashboard_data.dr_data.orp_status == 'Pending')
    {
      // if(!$scope.dashboard_data.dr_data.acc_no)
      // {
      //   console.log($scope.dashboard_data.dr_data.acc_no);
      //   var alertPopup = $ionicPopup.alert({
      //     title: 'Pending!',
      //     template: 'Please fill your bank details!'

      //   })
      //   alertPopup.then(function(res) {
      //     // $state.go('orptab.edit-profile');
      //     $scope.data.remarkModel.show();
      //   });
      // }
      // else
      if($scope.dashboard_data.dr_data.orp_status == 'Pending')
      {
        $ionicPopup.alert({
          title: 'Pending!',
          template: 'Your Account is Under Verification!'
        })
      }
      //  else if($scope.dashboard_data.dr_data.is_kyc_done == 0)
      // {
      //   if($scope.dashboard_data.dr_data.is_kyc_done == 0){
      //     $ionicPopup.alert({
      //       title: 'Pending!',
      //       template: 'Please Complete Your KYC Details!'
      //     })
      //   }

      // }
    }
    else if($scope.dashboard_data.dr_data.orp_status == 'Rejected')
    {
      $ionicPopup.alert({
        title: 'Rejected!',
        template: 'Your Account is Rejected!'
      })

    }
  }

  $scope.logout = function()
  {
    var query = "DELETE From "+dbTableName;
    $cordovaSQLite.execute(db, query).then(function(res) {
      myAllSharedService.loginData = {};
      myAllSharedService.drTypeFilterData.dashboardData = {};
      $state.go('orp_login');
    });
  }


  $scope.search_filter={};
  $scope.getDealerList = function()
  {
    console.log($scope.search_filter.searchData);
    $scope.dealer_list = [];

    $ionicLoading.show({
      template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
    });

    let data={};
    data.search=$scope.search_filter.searchData;
    data.activity = 'distributor'
    myRequestDBService.orpPostServiceRequest('/Dashboard_Controller/dealer_list',data).then(function (result)
    {
      $ionicLoading.hide();
      console.log(result);
      $scope.dealer_list = result.outputData;
      console.log($scope.dealer_list);
    },
    function (err)
    {
      $ionicLoading.hide();
      console.error(err);
    });
  }

  $scope.dealerData = function(id)
  {
    myAllSharedService.my_dealer_data = {};
    $ionicLoading.show({
      template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
    });

    $scope.data.id = id;
    console.log($scope.data);
    myRequestDBService.orpPostServiceRequest('/Dashboard_Controller/dealer_data',$scope.data).then(function (result)
    {
      $ionicLoading.hide();
      console.log(result);
      $scope.my_dealer_data = result.dr_data;
      console.log($scope.my_dealer_data);
      myAllSharedService.my_dealer_data = $scope.my_dealer_data;

      console.log("state_hit");
      $state.go('orptab.orp_dealerdetail');
      console.log("state_change");

    },
    function (err)
    {
      $ionicLoading.hide();
      console.error(err);
    });
  }

  $scope.getWarrantyData = function()
  {
    console.log($scope.data);
    console.log($scope.data.mobile_search.length);
    // $scope.warranty_data= {};

    if($scope.data.mobile_search)
    {
      $ionicLoading.show({
        template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
      });

      console.log($scope.data);

      myRequestDBService.orpPostServiceRequest('/Dashboard_Controller/getWarrantyData',$scope.data).then(function (result)
      {
        $ionicLoading.hide();
        console.log(result);
        $scope.warranty_data = result;
      },
      function (err)
      {
        $ionicLoading.hide();
        console.error(err);
      });

    }

  }

  $scope.catalogueList = [];

  $scope.getCataloguePdf = function()
  {
    $ionicLoading.show({
      template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
    });

    console.log();

    myRequestDBService.orpPostServiceRequest('/Dashboard_Controller/getCataloguePdf').then(function (result)
    {
      $ionicLoading.hide();
      console.log(result);
      $scope.catalogueList = result;
    },
    function (err)
    {
      $ionicLoading.hide();
      console.error(err);
    });

  }

  $scope.openCataloguePdf = function(pdfName,title)
  {

    // pdfName = "invoice.pdf";
    console.log(pdfName);
    console.log(title);

    upload_url = "http://microtek.abacusdesk.com/uploads/orp/catalogue_pdf/";
    // 'http://microtek.abacusdesk.com/uploads/orp/42802.pdf'

    if(pdfName)
    {

      $ionicLoading.show({
        template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
      });
      console.log("In pdf");
      DocumentViewer.previewFileFromUrlOrPath(
        function ()
        {
          console.log('success');
          $timeout(function () {
            $ionicLoading.hide();
          }, 1000);
        },
        function (error)
        {

          $timeout(function () {
            $ionicLoading.hide();
          }, 1000);

          console.log("In pdf");

          if (error == 53) {

            var alertPopup = $ionicPopup.alert({
              title: 'Message!',
              template: 'No Document Handler Found!'
            });

            console.log('No app that handles this file type.');
          }
          else if (error == 2)
          {
            console.log('Invalid link');

            var alertPopup = $ionicPopup.alert({
              title: 'Message!',
              template: 'PDF Not Found!'
            });
          }
        },
        upload_url + pdfName, title,'application/pdf');

        console.log(upload_url + pdfName);

      }
      else
      {
        $ionicLoading.hide();

        $ionicLoading.hide();

        var alertPopup = $ionicPopup.alert({
          title: 'Message!',
          template: 'PDF Not Found!'
        });
      }
    }


    $scope.shmemeEnrolled = function(schemeData)
    {
      $ionicPopup.confirm({

        title: 'Are You Sure, You Want to Enroll under this scheme ?',
        buttons: [{
          text: 'YES',
          type: 'button-block button-outline button-stable',
          onTap: function (e)
          {
            console.log(schemeData);
            $ionicLoading.show({
              template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
            });

            var data = { 'scheme': schemeData }

            myRequestDBService.orpPostServiceRequest('/Dashboard_Controller/updateSchemeEnrolled', data).then(function (result) {
              $ionicLoading.hide();
              console.log(result);
              $scope.getDasboardData();
            },
            function (err) {
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



    $scope.dateFormat = function(date)
    {
      return moment(date).format("DD MMM YYYY")
    }

    $scope.dateTimeFormat = function(date)
    {
      return moment(date).format("DD MMM YYYY h:mm A")
    }

    setTimeout(function(){
      console.log("bye-bye");
      $ionicSlideBoxDelegate.update();
      $scope.sliderLoading = false;
      console.log($scope.sliderLoading)
    },1000);

    $scope.result_data = myAllSharedService.result_data;
    // $scope.result_data = {};

    $scope.startScan = function(type,code,orp_status,is_kyc_done)
    {
      console.log(type);
      console.log( myAllSharedService.activity);
      myAllSharedService.result_data = {}

      // if(orp_status == 'Approved' && is_kyc_done == 1)
      if (orp_status == 'Approved')
      {
        myAllSharedService.activity = type;
        console.log( myAllSharedService.activity);

        if(type == 'scan')
        {
          cordova.plugins.barcodeScanner.scan(function (result)
          {
            console.log(result.text);
            $scope.data.text = result.text
            if($scope.data.activity == 'dealer_purchase')
            $scope.data.distributor_id = $scope.dealer_data.id

            myAllSharedService.code_list.findIndex(row => row.coupon_code ==  $scope.data.text)

            if(result.text)
            {
              myRequestDBService.orpPostServiceRequest('/Scan_Controller/electricianScan',$scope.data).then(function (result)
              {
                console.log(result);
                if(result.status == 'success')
                {
                  myAllSharedService.result_data = result;
                  $scope.result_data = result;
                  console.log($scope.result_data);
                  myAllSharedService.code_list.push($scope.result_data.outputData);
                  console.log(myAllSharedService);

                  $state.go('orptab.orp_electrician_alert-message');

                }
                else
                {
                  myAllSharedService.result_data = result;
                  $scope.result_data = result;
                  console.log(myAllSharedService.result_data);

                  $state.go('orptab.orp_electrician_alert-message');
                }
              })
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
      }
      // else if(orp_status == 'Pending' || orp_status == 'Suspect' || is_kyc_done==0)
      else if (orp_status == 'Pending' || !$scope.dashboard_data.dr_data.acc_no)
      {
        if(!$scope.dashboard_data.dr_data.acc_no)
        {
          console.log(!$scope.dashboard_data.dr_data.acc_no);
          var alertPopup = $ionicPopup.alert({
            title: 'Pending!',
            template: 'Please fill your bank details!'

          })
          alertPopup.then(function(res) {
            // $state.go('orptab.edit-profile');
            $scope.data.remarkModel.show();
          });
        }
        else if($scope.dashboard_data.dr_data.orp_status == 'Pending')
        {
          $ionicPopup.alert({
            title: 'Pending!',
            template: 'Your Account is Under Verification!'
          })
        }
        // else if($scope.dashboard_data.dr_data.is_kyc_done == 0)
        // {
        //   if($scope.dashboard_data.dr_data.is_kyc_done == 0){
        //     $ionicPopup.alert({
        //       title: 'Pending!',
        //       template: 'Please Complete Your Kyc Details!'
        //     })
        //   }

        // }


      }
      else if(orp_status == 'Reject')
      {
        $ionicPopup.alert({
          title: 'Rejected!',
          template: 'Your Account is Rejected!'
        })

      }


    }

    $scope.onSeachActionHandler = function(type) {

      console.log('run');

      if(type == 'open') {

        $scope.isSearchBarOpen = true;

        setTimeout(() => {

          $('#searchData').focus();

        }, 1000);
      }

      if(type == 'close') {

        $scope.data.search = '';
        $scope.isSearchBarOpen = false;
      }
    }

    $scope.single_select = function (item) {
      console.log(item);
      $scope.data.user_name = new Array();
      $scope.data.user_name.push(item.Key);
      console.log($scope.data.user_name);
      $scope.data.user_data = item;
      $scope.dealerData(item.id);
    }

    $scope.dash_filter={};
    $scope.dashboardFilter = false;
    $scope.filter = function (value) {
      console.log('filter');
      $scope.dashboardFilter = value;
    }

    $scope.clearFilter = function()
    {
      console.log('clear start');
      // $scope.dash_filter.date_from = null;
      // $scope.dash_filter.date_to = null;
      // $scope.dash_filter.transaction = null;
      // $scope.dash_filter.type = null;
      console.log('clear end');

    }

    $scope.giftSelected = function(){

      $scope.dashboard_data.offer_data.forEach(function(offer){
        console.log(offer);


      })

    }

    $scope.onImageTypeHandler = function (docType) {

      console.log(docType);
      $scope.documentType = docType;

      $ionicActionSheet.show({
        buttons: [
          { text: "<i class='icon ion-android-image'></i> Take Picture From Gallery" },
          { text: "<i class='icon ion-camera'></i> Open Camera" }
        ],
        cancelText: 'Cancel',
        cancel: function () {

        },
        buttonClicked: function (index) {

          if (index === 0) {

            $scope.onGetImageAccessPermissionHandler('gallaryPicture');

          } else if (index === 1) {

            $scope.onGetImageAccessPermissionHandler('cameraPicture');
          }

          return true;
        }

      })

    }

    $scope.onGetImageAccessPermissionHandler = function(actionType) {

      cordova.plugins.diagnostic.requestCameraAuthorization({
        successCallback: function (data_status) {

          if(actionType == 'cameraPicture') {
            $scope.onTakePictureFromCameraHandler();
          }

          if(actionType == 'gallaryPicture') {
            $scope.getGallaryImageHandler();
          }

        }, errorCallback: function (error) {

          console.error(error);

        }, externalStorage: true

      });
    }


    $scope.onTakePictureFromCameraHandler = function() {

      var options = {

        quality: 50,
        targetWidth: 500,
        targetHeight: 500,
        saveToPhotoAlbum: false
      };

      Camera.getPicture(options).then(function (imageData) {

        console.log(imageData);

        if ($scope.documentType =='cancel_check')      {
          $scope.data.cancel_check = [];
          $scope.data.cancel_check.push({
            src: imageData,
          });
        }
        else{
          $scope.mediaData.push({
            src: imageData,
            doc_type: $scope.data.doc_type,
            doc_number: $scope.data.document_no
          });
        }



        $scope.data.doc_type = undefined;
        $scope.data.document_no = undefined;
        console.log($scope.documentType);

        console.log($scope.mediaData);

        if($scope.documentType == 'profile')
        {
          console.log($scope.documentType);
          $scope.uploadImageData();
        }

      }, function (err) {


      });
    }


    $scope.getGallaryImageHandler = function() {

      var options = {

        // maximumImagesCount: 1,
        width: 500,
        height: 500,
        quality: 50
      };

      $cordovaImagePicker.getPictures(options).then(function (results) {

        console.log(results);

        for (var i = 0; i < results.length; i++) {

          if ($scope.documentType == 'cancel_check') {
            $scope.data.cancel_check = [];
            $scope.data.cancel_check.push({
              src: results[i],
            });
          }
          else
          {
            $scope.mediaData.push({
              src: results[i],
              doc_type: $scope.data.doc_type,
              doc_number: $scope.data.document_no
            });
          }

        }

        $scope.data.doc_type = undefined;
        $scope.data.document_no = undefined;

        console.log($scope.mediaData);
        console.log($scope.documentType);

        if($scope.documentType == 'profile')
        {
          console.log($scope.documentType);

          $scope.uploadImageData();

        }


      }, function (error) {

        console.log('Error: ' + JSON.stringify(error));
      });
    }


    $scope.imageSRC = '';
    $scope.openModel = function(src)
    {
      $scope.imageSRC = src;
      console.log('BUTTON')
      $scope.data.statusModel.show();

    }

    $scope.Bank_data={};
    $scope.saveBankDetails = function () {
      $scope.Bank_data.loginId = $scope.loginData.loginId;

      //----upload Form data -----

      $ionicLoading.show({
        template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
      });

      myRequestDBService.save_BankDetails('/ORP_Login/UPDATE_BANK_DETAIL',$scope.Bank_data).then(function (result)
      {
        $ionicLoading.hide();
        console.log(result);
        $scope.data.remarkModel.hide();

        if(result.msg == "success"){

          //----upload image -----

          angular.forEach($scope.data.cancel_check, function (val, key) {
            var options = {

              fileKey: "file",
              fileName: "image.jpg",
              chunkedMode: false,
              mimeType: "image/*",
            };
            $scope.insert_id = $scope.dashboard_data.dr_data.id;
            $cordovaFileTransfer.upload(orpServerURL + '/ORP_Controller/UPDATE_CENCEL_CHECK/' + $scope.insert_id, val.src, options).then(function (result) {
              console.log("SUCCESS: " + JSON.stringify(result));
            });
          });

          $scope.getDasboardData();

          $cordovaToast.show('Bank Details Saved Successfully', 'short', 'center').then(function (success) {

          }, function (error) {

          });
        }else {

          $ionicPopup.alert({
            title: 'Pending!',
            template: 'This Account No. already exists! Please Enter Other Account No.'
          })
        }
      },
      function (err)
      {
        $ionicLoading.hide();
        console.error(err);
      });

      console.log($scope.Bank_data);
    }

    $scope.checkValidCoupon = function()
    {
      $ionicLoading.show({
        template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
      });


      $scope.data.manual_code = 1;
      myRequestDBService.orpPostServiceRequest('/Scan_Controller/electricianScan', $scope.data).then(function (result) {
        console.log(result);
        $ionicLoading.hide();
        if (result.status == 'success') {
          myAllSharedService.result_data = result;
          $scope.result_data = result;
          console.log($scope.result_data);
          myAllSharedService.code_list.push($scope.result_data.outputData);
          console.log(myAllSharedService);

          $state.go('orptab.orp_electrician_alert-message');

        }
        else {
          myAllSharedService.result_data = result;
          $scope.result_data = result;
          console.log(myAllSharedService.result_data);

          $state.go('orptab.orp_electrician_alert-message');
        }
      })

    }

    $scope.delete_img = function (index) {
      console.log("index");
      console.log(index);
      $scope.data.cancel_check.splice(index, 1);
    }

    //   $scope.passwordChangePopup = function(){
    //     if($scope.dashboard_data.dr_data.isPasswordChange == 0)
    //     {
    //       $ionicPopup.confirm({

    //         title: 'Please Change Your Password',
    //         buttons: [{
    //           text: 'YES',
    //           type: 'button-block button-outline button-stable',
    //           onTap: function (e)
    //           {
    //             $ionicLoading.show({
    //               template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
    //             });
    //             console.log(e);
    //             $ionicLoading.hide();
    //             // $scope.awak=false;
    //             $state.go('orptab.orp_forgotpassword');
    //             console.log('working');
    //           }

    //         }
    //         //   , {

    //         //     // text: 'NOT NOW',
    //         //     type: 'button-block button-outline button-stable',
    //         //     onTap: function (e) {
    //         //       console.log(e);
    //         //       // $scope.awak=false;
    //         //       console.log('You Are Not Sure');
    //         //     }
    //         //   }
    //       ]

    //     });
    //   }
    // }


    if($location.path() == '/orptab/orp_dashboard')
    {
      $scope.dealer_list = [];
      $scope.dashboard_data = {};
      // $scope.loginData.isPasswordChange == 0 ? $scope.new_login() : '';

      // $scope.dashboard_data.dr_data.isPasswordChange = $scope.dashboard_data.dr_data.isPasswordChange ? 1 : $scope.new_login();

      $scope.getDasboardData();

      $ionicPopover.fromTemplateUrl('add-remark', {
        scope: $scope,
      }).then(function(popovers) {
        $scope.data.remarkModel = popovers;
      });

      $ionicPopover.fromTemplateUrl('offerPopover', {
        scope: $scope,
      }).then(function(popovers) {
        $scope.data.offerSlideModel = popovers;
      });

      $ionicPopover.fromTemplateUrl('manual_code', {
        scope: $scope,
      }).then(function (popovers) {
        $scope.data.manual_code = popovers;
      });

    }


    $scope.overdueRedirect = function (){

      // $state.go('orptab.Over-due');

    }

    $scope.OutstandingRedirect = function (){

      // $state.go('orptab.outstanding-details');
      // myAllSharedService.category = undefined;

    }

    $scope.fotoUrl = function(adres) {
      var photourl = uploadURL + adres;
      return photourl;
    }

    $scope.gotoURL = function(adres) {
      var photourl = uploadURL + adres;
      return photourl;
    }

    $scope.onGoToRootPageHandler = function (targetPage) {

      console.log(targetPage);
      if (targetPage == 'HOME') {
        $state.go('orptab.orp_dashboard');
        myAllSharedService.drTypeFilterData.detail.sec_detail = 'not_visited';
        myAllSharedService.drTypeFilterData.detail.prim_detail = 'not_visited';
        myAllSharedService.drTypeFilterData.detail.billing_detail = 'not_visited';
        myAllSharedService.drTypeFilterData.detail.pend_detail = 'not_visited';
      }
      if (targetPage == 'SCHEME') {
        $state.go('orptab.orp_offerlist');
        myAllSharedService.drTypeFilterData.detail.sec_detail = 'not_visited';
        myAllSharedService.drTypeFilterData.detail.prim_detail = 'not_visited';
        myAllSharedService.drTypeFilterData.detail.billing_detail = 'not_visited';
        myAllSharedService.drTypeFilterData.detail.pend_detail = 'not_visited';
      }
      if (targetPage == 'LEADERBOARD') {
        $state.go('orptab.orp_leaderboard');
        myAllSharedService.drTypeFilterData.detail.sec_detail = 'not_visited';
        myAllSharedService.drTypeFilterData.detail.prim_detail = 'not_visited';
        myAllSharedService.drTypeFilterData.detail.billing_detail = 'not_visited';
        myAllSharedService.drTypeFilterData.detail.pend_detail = 'not_visited';
      }

      if (targetPage == 'CATALOGUE') {
        $state.go('orptab.orp_catalogue');
        myAllSharedService.drTypeFilterData.detail.sec_detail = 'not_visited';
        myAllSharedService.drTypeFilterData.detail.prim_detail = 'not_visited';
        myAllSharedService.drTypeFilterData.detail.billing_detail = 'not_visited';
        myAllSharedService.drTypeFilterData.detail.pend_detail = 'not_visited';
      }

      if (targetPage == 'GALLERY') {
        $state.go('orptab.orp_gallery');
        myAllSharedService.drTypeFilterData.detail.sec_detail = 'not_visited';
        myAllSharedService.drTypeFilterData.detail.prim_detail = 'not_visited';
        myAllSharedService.drTypeFilterData.detail.billing_detail = 'not_visited';
        myAllSharedService.drTypeFilterData.detail.pend_detail = 'not_visited';
      }


    }


  })
