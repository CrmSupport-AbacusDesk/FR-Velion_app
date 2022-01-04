app.controller('orpCtrl', function ($scope, $ionicModal,$location,$timeout,$ionicLoading,myRequestDBService,$ionicActionSheet, $cordovaImagePicker, Camera, $cordovaFileTransfer, $cordovaGeolocation, $cordovaToast, $window, $ionicPlatform, $ionicHistory, $stateParams, $ionicScrollDelegate, $ionicPopover,myAllSharedService,$state,$ionicPopup,searchSelect )
{

  // screen.lockOrientation("portrait")
  screen.orientation.lock('portrait');
// //  allow user rotate
      screen.orientation.unlock();

  // set to either landscape

  $scope.goToBackPageHandler = function() {
    console.log('back button');
    $ionicHistory.goBack();
    
  }
  $scope.data = {};
  $scope.data.cancel_check = [];
  $scope.loginData = myAllSharedService.loginData;
  console.log($scope.loginData);
  $scope.orpURL = rootURL+'/uploads';
  $scope.uploadURL = uploadURL;
  $scope.todayDate = new Date().toISOString().slice(0,10)
  $scope.maxdate = new Date(new Date().setFullYear(new Date().getFullYear() -18)).toISOString().slice(0,10);
  $scope.dash_filter = {};
  $scope.documentType = '';
  $scope.search = {};
  $scope.suportData = {};
  $scope.productCategoryList = [];
  
  $scope.scrollToTop = function()
  {
    console.log("scroll");
    $ionicScrollDelegate.scrollTop();
    
    console.log($ionicScrollDelegate.scrollTop());
  }
  
  
  $scope.toCapitalize = function(value,variable)
  {
    // value = value.toLowerCase();
    // value = value.charAt(0).toUpperCase() + value.slice(1);
    console.log(value);
    
    value =  (!!value) ? value.split(' ').map(function(wrd){return wrd.charAt(0).toUpperCase() + wrd.substr(1).toLowerCase();}).join(' ') : '';
    if(value)
    {
      $scope.loginUserDetail[variable] = value;
    }
  }
  
  $scope.toUpperCase = function(value,variable)
  {
    value = value.toUpperCase();
    console.log(value);
    $scope.loginUserDetail[variable] = value;
  }
  
  let fetchingRecords = false;
  
  $scope.onGetSearchSelectDataHandler = function (type_info, searchKey, pagenumber) {
    
    console.log("Search select");
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
      }
      
      if (type_info == 'fetchDistrictData') {
        
        $scope.totalDistrictRecords = result.TotalRecords;
        $scope.districtList = result.Records;
        
      }
      
      fetchingRecords = false;
      
    }, function (errorMessage) {
      
      console.log(errorMessage);
      window.console.warn(errorMessage);
      fetchingRecords = false;
    });
  };
  
  $scope.getProductCategory = function()
  {
    $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
    });
    
    myRequestDBService.orpPostServiceRequest("/ORP_Controller/getProductCategory","").then(function(response)
    {
      console.log(response);
      
      $scope.productCategoryList = response.data;
      
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
  
  
  $scope.supportHistoryList = [];
  $scope.getSupportHistory = function()
  {
    $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
    });
    
    $scope.supportHistoryList = [];
    
    myRequestDBService.orpPostServiceRequest("/ORP_Controller/getSupportHistoryList","").then(function(response)
    {
      console.log(response);
      
      $scope.supportHistoryList = response.data;
      
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
  
  $scope.saveSupportData = function()
  {
    console.log($scope.suportData);
    
    
    if(!$scope.suportData.category)
    {
      $ionicPopup.alert({
        title: 'Error!',
        template: 'Select a complaint category !!'
      });
    }
    else if(!$scope.suportData.remark)
    {
      $ionicPopup.alert({
        title: 'Error!',
        template: 'Complaint remark required !!'
      });
    }
    else
    {
      
      $ionicLoading.show({
        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
      });
      
      myRequestDBService.orpPostServiceRequest("/ORP_Controller/saveSupportData",{data:$scope.suportData}).then(function(response)
      {
        console.log($scope.mediaData);
        console.log(response);
        
        if($scope.mediaData.length)
        {
          var count = 0;
          angular.forEach($scope.mediaData, function(val, key)
          {
            $ionicLoading.show
            ({
              template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
            });
            
            var options = {
              
              fileKey: "file",
              fileName: "image.jpg",
              chunkedMode: false,
              mimeType: "image/*",
            };
            
            count++;
            
            $cordovaFileTransfer.upload(orpServerURL+'/ORP_Controller/saveSupportDocument/' + response.inserted_id, val.src, options ).then(function(result) {
              
              
              
              console.log("SUCCESS: " + JSON.stringify(result));
              
              if(count==$scope.mediaData.length)
              {
                $scope.getSupportHistory();
                $ionicLoading.hide();
                $scope.mediaData = [];
                $cordovaToast.show('Invoice Image Added Successfully', 'short', 'bottom').then(function (success) {
                  
                }, function (error) {
                  
                });
                
              }
              
              
            }, function(err) {
              
              $ionicLoading.hide();
              console.log("ERROR: " + JSON.stringify(err));
              
              $cordovaToast.show('Something Went Wrong, Try Later!', 'short', 'bottom').then(function (success) {
                
              }, function (error) {
                
              });
            });
          });
          
        }
        else
        {
          $scope.getSupportHistory();
          $ionicLoading.hide();
          
        }
        
        console.log(response);
        
        $scope.suportData ={};
        
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
    
    
    
  }
  
  
  $scope.faqList = [];
  $scope.getFAQList = function()
  {
    
    $scope.faqList = [];
    
    $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
    });
    
    myRequestDBService.orpPostServiceRequest("/ORP_Controller/get_faq_list",'').then(function(response)
    {
      console.log(response);
      
      $scope.faqList = response.data;
      
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
  
  $scope.activeFAQ_Section = function(index,row_status)
  {
    console.log(row_status);
    
    for (let i = 0; i < $scope.faqList.length; i++)
    {
      $scope.faqList[i]['active'] = false;
    }
    
    $scope.faqList[index]['active']=row_status;
  }
  $scope.mediaData = [];
  $scope.newsEventImagesData  = [];
  
  $scope.onImageTypeHandler = function (docType) {
    
    console.log(docType);
    $scope.documentType = docType;
    if(docType=='profile')
    {
      $scope.mediaData = [];
    }
    
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
  
  
  $scope.invoiceHistoryData = [];
  $scope.getInvoiceHistory = function()
  {
    $scope.mediaData = [];
    $scope.search.dealer = { Key: "Select Dealer Name", Value: "" }
    
    $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
    });
    
    myRequestDBService.orpPostServiceRequest("/ORP_Controller/getInvoiceHistory",'').then(function(response)
    {
      console.log(response);
      
      $scope.invoiceHistoryData = response.data;
      
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
  
  
  $scope.removeInvoice = function(invoiceId)
  {
    $ionicPopup.confirm({
      
      title: 'Are You Sure, You Want to Delete ?',
      buttons: [{
        text: 'YES',
        type: 'button-block button-outline button-stable',
        onTap: function (e) {
          $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
          });
          
          myRequestDBService.orpPostServiceRequest('/ORP_Controller/removeInvoice/'+invoiceId,'')
          .then(function (result) {
            
            $ionicLoading.hide();
            console.log(result);
            if(result.status == 'Success')
            {
              $scope.getInvoiceHistory();
              $ionicLoading.show({ template: 'Invoice Deleted.', noBackdrop: true, duration: 2000 });
            }
            else
            {
              $ionicPopup.alert({
                title: 'Error!',
                template: result.statusMessage
              });
              
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
  
  $scope.delete_img = function(index) {
    console.log("index");
    console.log(index);
    $scope.mediaData.splice(index,1);
  }
  
  $scope.remove_image = function(document_id,document_name,index)
  {
    $ionicPopup.confirm({
      
      title: 'Are You Sure, You Want to Delete ?',
      buttons: [{
        text: 'YES',
        type: 'button-block button-outline button-stable',
        onTap: function (e) {
          
          
          myRequestDBService.orpPostServiceRequest('/ORP_Controller/remove_document/' + document_id + '/' + document_name, '')
          .then(function (result) {
            
            $scope.loginUserDetail.document.splice(index,1)
            
            console.log(result);
            
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
  
  $scope.delete_check = function (dr_id,document_name) {
    $ionicPopup.confirm({
      
      title: 'Are You Sure, You Want to Delete ?',
      buttons: [{
        text: 'YES',
        type: 'button-block button-outline button-stable',
        onTap: function (e) {
          
          
          myRequestDBService.orpPostServiceRequest('/ORP_Controller/remove_check/' + dr_id + '/' + document_name, '')
          .then(function (result) {
            
            $scope.loginUserDetail.cancel_check_image = null;
            
            console.log(result);
            
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
  
  $scope.remove_check = function (index) {
    console.log("index");
    console.log(index);
    $scope.data.cancel_check.splice(index, 1);
  }
  
  
  
  $scope.uploadImageData = function() {
    
    if($scope.mediaData.length)
    {
      $ionicLoading.show
      ({
        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
      });
      
      angular.forEach($scope.mediaData, function(val, key) {
        
        var options = {
          
          fileKey: "file",
          fileName: "image.jpg",
          chunkedMode: false,
          mimeType: "image/*",
        };
        
        $cordovaFileTransfer.upload(orpServerURL+'/ORP_Controller/onUploadProfileImageData/' + $scope.loginData.loginId, val.src, options ).then(function(result) {
          
          console.log("SUCCESS: " + JSON.stringify(result));
          
          $ionicLoading.hide();
          $scope.getLoginUserDetail();
          
          $cordovaToast.show('Profile Image Updated Successfully', 'short', 'bottom').then(function (success) {
            
          }, function (error) {
            
          });
          
        }, function(err) {
          
          $ionicLoading.hide();
          console.log("ERROR: " + JSON.stringify(err));
          
          $cordovaToast.show('Something Went Wrong, Try Later!', 'short', 'bottom').then(function (success) {
            
          }, function (error) {
            
          });
        });
      });
    }
    else
    {
      $ionicLoading.hide();
      
    }
  }
  
  
  $scope.uploadInvoiceData = function() {
    
    console.log($scope.mediaData);
    console.log("Invoice Upload");
    if($scope.loginData.loginTypeId == '12')
    {
      $scope.search.dealer.Value = $scope.loginData.loginTypeId;
      $scope.search.dealer.Key = $scope.loginData.loginName;
    }
    
    console.log($scope.search.dealer);
    if(!$scope.search.dealer.Value)
    {
      $ionicPopup.alert({
        title: 'Error!',
        template: 'Dealer name required,please select a dealer !!'
      });
    }
    else if($scope.mediaData.length==0)
    {
      $ionicPopup.alert({
        title: 'Error!',
        template: 'Please select an attachment !!'
      });
    }
    else
    {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
      });
      
      myRequestDBService.orpPostServiceRequest("/ORP_Controller/saveInvoice",$scope.search.dealer).then(function(response)
      {
        console.log(response);
        
        
        if(response.status=='Success')
        {
          var count = 0;
          
          angular.forEach($scope.mediaData, function(val, key)
          {
            $ionicLoading.show
            ({
              template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
            });
            
            var options = {
              
              fileKey: "file",
              fileName: "image.jpg",
              chunkedMode: false,
              mimeType: "image/*",
            };
            
            count++;
            
            $cordovaFileTransfer.upload(orpServerURL+'/ORP_Controller/saveInvoiceDocumnet/' + response.inserted_id, val.src, options ).then(function(result) {
              
              
              
              console.log("SUCCESS: " + JSON.stringify(result));
              
              if(count==$scope.mediaData.length)
              {
                $scope.getInvoiceHistory();
                $ionicLoading.hide();
                $cordovaToast.show('Invoice Image Added Successfully', 'short', 'bottom').then(function (success) {
                  
                }, function (error) {
                  
                });
                
              }
              
              
            }, function(err) {
              
              $ionicLoading.hide();
              console.log("ERROR: " + JSON.stringify(err));
              
              $cordovaToast.show('Something Went Wrong, Try Later!', 'short', 'bottom').then(function (success) {
                
              }, function (error) {
                
              });
            });
          });
        }
        
        // $ionicLoading.hide();
        
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
  }
  
  
  $scope.assignDealerList = [];
  $scope.getAssignDealerList = function(key)
  {
    console.log(key);
    
    $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
    });
    
    myRequestDBService.orpPostServiceRequest("/ORP_Controller/getAssignDealer",{search:key}).then(function(response)
    {
      console.log(response);
      
      $scope.assignDealerList = response.data;
      
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
  
  $scope.filterCounter = 0;
  $scope.productPriceList = [];
  $scope.getProductPriceList = function()
  {
    
    if(($scope.search.brand && $scope.search.brand.length) ||  ($scope.search.category && $scope.search.category.length))
    {
      $scope.filterCounter = 1;
    }
    else if(($scope.search.brand && $scope.search.brand.length) ||  ($scope.search.category && $scope.search.category.length))
    {
      $scope.filterCounter = 2;
    }
    else
    {
      $scope.filterCounter = 0;
    }
    
    $scope.suggestiveList = [];
    
    $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
    });
    
    myRequestDBService.orpPostServiceRequest("/ORP_Controller/getPriceList",{search:$scope.search}).then(function(response)
    {
      console.log(response);
      
      $scope.productPriceList = response.data;
      
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
  
  
  $scope.distinctBrandList = [];
  $scope.getProductBrandList = function()
  {
    $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
    });
    
    myRequestDBService.orpPostServiceRequest("/ORP_Controller/getBrandList",'').then(function(response)
    {
      console.log(response);
      
      $scope.distinctBrandList = response.data;
      
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
  
  $scope.distinctCategoryList = [];
  
  $scope.getProductCategoryList = function()
  {
    $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
    });
    
    myRequestDBService.orpPostServiceRequest("/ORP_Controller/getCategoryList",'').then(function(response)
    {
      console.log(response);
      
      $scope.distinctCategoryList = response.data;
      
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
  
  $scope.filterSelected = function(value)
  {
    $scope.search.selected = value;
  }
  
  
  $scope.suggestiveList = [];
  $scope.getSuggestiveData = function()
  {
    $scope.suggestiveList = [];
    
    if($scope.search.master_search.length)
    {
      console.log("In");
      myRequestDBService.orpPostServiceRequest("/ORP_Controller/getSuggestiveData",{search : $scope.search.master_search}).then(function(response)
      {
        console.log(response);
        
        if(response.status=='Success')
        {
          $scope.suggestiveList = response.data;
        }
        
        
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
    else
    {
      console.log("In else");
      
      $scope.search.master_search= '';
      $scope.search.product_code='';
      $scope.suggestiveList=[];
      $scope.productPriceList = [];
      $scope.getProductPriceList();
    }
    
  }
  
  $scope.applyFilter = function()
  {
    $scope.search.brand = [];
    $scope.search.category = [];
    for (var i = 0; i < $scope.distinctBrandList.length; i++)
    {
      if($scope.distinctBrandList[i]['selectedBrand']==true)
      {
        $scope.search.brand.push($scope.distinctBrandList[i]['brand']);
      }
    }
    
    for (var i = 0; i < $scope.distinctCategoryList.length; i++)
    {
      if($scope.distinctCategoryList[i]['selectedCategory']==true)
      {
        $scope.search.category.push($scope.distinctCategoryList[i]['category']);
      }
    }
    
    console.log($scope.search);
    
    $scope.getProductPriceList();
  }
  
  $scope.clearFilter = function()
  {
    $scope.search.brand = [];
    $scope.search.category = [];
    $scope.getProductBrandList();
    $scope.getProductCategoryList();
    $scope.getProductPriceList();
    
  }
  
  
  $scope.goToInvoiceImagePage = function(document,dealer)
  {
    myAllSharedService.document = document;
    myAllSharedService.dealerName = dealer;
    
    $state.go('orptab.orp_invoice_img');
    
  }
  
  
  $scope.showImages = function(index,val) {
    
    console.log(val);
    $scope.newsEventImagesData = val;
    $scope.activeSlide = index;
    $scope.showModal('templates/gallery-zoomview.html');
  };
  
  $scope.showModal = function(templateUrl) {
    $ionicModal.fromTemplateUrl(templateUrl, {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  }
  
  $scope.closeModal = function() {
    $scope.modal.hide();
    $scope.modal.remove()
  };
  
  $scope.updateSlideStatus = function(slide) {
    var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + slide).getScrollPosition().zoom;
    if (zoomFactor == $scope.zoomMin) {
      $ionicSlideBoxDelegate.enableSlide(true);
    } else {
      $ionicSlideBoxDelegate.enableSlide(false);
    }
  };
  
  $scope.initial_zoom=true;
  $scope.zoom= function(slide){
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
  
  
  
  
  // Model 1 Start
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
  // End
  
  
  // Model 2 Start
  $ionicModal.fromTemplateUrl('gift_otp', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(otpmodel) {
    $scope.otpmodel = otpmodel;
  });
  $scope.otpgiftOpenModel = function() {
    $scope.otpmodel.show();
  };
  $scope.otpgiftCloseModel = function() {
    $scope.otpmodel.hide();
  };
  //
  
  // Model 3 Start
  $ionicModal.fromTemplateUrl('pricelist_filter', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(pricelistmodel) {
    $scope.pricelistmodel = pricelistmodel;
  });
  $scope.pricelistOpenModel = function() {
    $scope.pricelistmodel.show();
  };
  $scope.pricelistCloseModel = function() {
    $scope.pricelistmodel.hide();
  };
  
  
  $scope.data.type = 'inStock';
  
  $scope.getStockData = function()
  {
    
    $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
    });
    
    myRequestDBService.orpPostServiceRequest("/ORP_Controller/getStockData",$scope.data).then(function(response)
    {
      console.log(response);
      
      // $scope.loginUserDetail = response.data;
      
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
  
  // $scope.search.drName = [];
  // $scope.selectedDr = [];
  
  // $scope.select_mul_dr = function(data)
  // {
  //     console.log(data)
  //     var idx = $scope.search.drName.findIndex(row=>row == data.Key);
  //     if(idx == -1)
  //     {
  //         $scope.search.drName.push(data.Key);
  //     }
  //     else
  //     {
  //         $scope.search.drName.splice(idx,1);
  //     }
  
  //     var idx2 = $scope.selectedDr.findIndex(row=>row.dr_name == data.Key);
  //     if(idx2 == -1)
  //     {
  //         $scope.selectedDr.push({"dr_id":data.id,"dr_name":data.Key});
  //     }
  //     else
  //     {
  //         $scope.selectedDr.splice(idx2,1);
  //     }
  
  //     console.log($scope.search.drName);
  //     console.log($scope.selectedDr);
  // }
  
  $scope.categoryList = [];
  $scope.search.categoryName =[];
  $scope.selectedCategory =[];
  $scope.getAllCategorySegments = function()
  {
    
    myRequestDBService.orpPostServiceRequest('/App_SharedData/getAllCategoryList')
    .then(function(response)
    {
      console.log(response);
      $ionicLoading.hide();
      $scope.categoryList = response.categoryList;
      
    }, function (err) {
      
      console.error(err);
    });
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
  
  
  $scope.brandList = [];
  $scope.search.brandName =[];
  $scope.selectedBrand =[];
  
  $scope.getAllBrandList = function()
  {
    $scope.brandList = [];
    
    myRequestDBService.orpPostServiceRequest('/App_SharedData/getAllBrandList',$scope.search.categoryName)
    .then(function(response)
    {
      console.log(response);
      $scope.brandList = response.brandList;
      console.log($scope.brandList);
      
      
    }, function (err) {
      
      console.error(err);
    });
  }
  
  $scope.select_mul_brand = function (data)
  {
    console.log(data.category)
    var idx = $scope.search.brandName.findIndex(row=>row == data.Key);
    if(idx == -1)
    {
      $scope.search.brandName.push(data.Key);
    }
    else
    {
      $scope.search.brandName.splice(idx,1);
    }
    
    var idx2 = $scope.selectedBrand.findIndex(row=>row.brand_name == data.Key);
    if(idx2 == -1)
    {
      $scope.selectedBrand.push({"brand_name":data.Key});
    }
    else
    {
      $scope.selectedBrand.splice(idx2,1);
    }
    
    console.log($scope.search.brandName)
    
    //   $scope.getAllBrandList();
  };
  
  $scope.onSearchPincodeChangeHandler = function(pincode)
  {
    console.log(pincode.length);
    if(pincode.length==6)
    {
      console.log("in if");
      $ionicLoading.show({
        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
      });
      
      myRequestDBService.sfaPostServiceRequest("/App_SharedData/onGetPincodeDetail/",{pincode:pincode}).then(function(response)
      {
        console.log(response);
        $ionicLoading.hide();
        
        if(response.pincodeData && response.pincodeData['id']) {
          
          console.log("pincode");
          
          $scope.loginUserDetail.state_name = response.pincodeData.state_name;
          $scope.loginUserDetail.district_name = response.pincodeData.district_name;
          $scope.loginUserDetail.city = response.pincodeData.city;
          $scope.loginUserDetail.pincode = response.pincodeData.pincode;
          
        } else {
          
          $scope.loginUserDetail.state_name = '';
          $scope.loginUserDetail.district_name = '';
          $scope.loginUserDetail.city = '';
        }
        
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
    else
    {
      
      $scope.loginUserDetail.state_name = '';
      $scope.loginUserDetail.district_name = '';
      $scope.loginUserDetail.city = '';
    }
  }
  
  $scope.loginUserDetail = {};
  $scope.getLoginUserDetail = function()
  {
    
    $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
    });
    
    myRequestDBService.orpPostServiceRequest("/ORP_Controller/getLoginUserDetail",'').then(function(response)
    {
      console.log(response);
      $ionicLoading.hide();
      $scope.loginUserDetail = response.data;
      
      $scope.Bank_data.acc_holder_name = $scope.loginUserDetail.acc_holder_name;
      $scope.Bank_data.acc_no  =$scope.loginUserDetail.acc_no;
      $scope.Bank_data.acc_type =$scope.loginUserDetail.acc_type;
      $scope.Bank_data.ifsc_code =$scope.loginUserDetail.ifsc_code;
      $scope.Bank_data.cancel_check =$scope.loginUserDetail.cancel_check_image;
      console.log($scope.loginUserDetail.cancel_check_image);
      // $scope.data.cancel_check.push({src : $scope.loginUserDetail.cancel_check_image});
      // console.log($scope.data.cancel_check);
      
      // $scope.documenetData = response.data.document;
      // console.log($scope.documenetData);
      if($location.path() == '/orptab/edit-profile')
      {
        $scope.search.categoryName = [];
        $scope.selectedCategory = [];
        
        $scope.loginUserDetail.orp_dob = new Date($scope.loginUserDetail.orp_dob);
        $scope.loginUserDetail.orp_date_anniversary = new Date($scope.loginUserDetail.orp_date_anniversary);
        
        for (var i = 0; i < $scope.loginUserDetail.deals_category.length; i++)
        {
          $scope.search.categoryName.push($scope.loginUserDetail.deals_category[i]['category_name']);
          $scope.selectedCategory.push({"category_id":$scope.loginUserDetail.deals_category[i]['id'],"category_name":$scope.loginUserDetail.deals_category[i]['category_name']});
        }
        
        for (var j = 0; j < $scope.loginUserDetail.deals_brand.length; j++)
        {
          $scope.search.brandName.push($scope.loginUserDetail.deals_brand[j]['brand_name']);
          $scope.selectedBrand.push({brand_name:$scope.loginUserDetail.deals_brand[j]['brand_name']})
        }
        
        if($scope.search.categoryName.length)
        {
          $scope.getAllBrandList();
        }
        
      }
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
  
  $scope.dr_list = [];
  $scope.order_no = 0;
  $scope.get_dr_list = function()
  {
    console.log($scope.order_type);
    
    myRequestDBService.get_dr_list({order_type:$scope.order_type})
    .then(function(resp)
    {
      console.log(resp);
      $scope.dr_list = resp.dr_list;
      $scope.order_no = resp.order_no.order_no;
    });
  }
  
  
  $scope.tmpOrderList = [];
  $scope.getOrderListData = function(targetSRC) {
    
    if(!$scope.data.search && targetSRC != 'scroll')
    {
      $ionicLoading.show({
        template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
      });
    }
    $scope.isRequestInProcess = true;
    
    var requestPost = {
      order_type:$scope.order_type,
      searchData:$scope.data.search,
      start:$scope.currentPage,
      pageLimit:$scope.pageSize,
      createdBy:$scope.data.orderCreatedBy,
      targetPage: 'List',
      drId:$scope.data.dr_id
    }
    
    myRequestDBService.sfaPostServiceRequest('/App_Order/order_list',requestPost)
    .then(function(response)
    {
      console.log(response);
      const result = response.orderData;
      console.log(result);
      if(!$scope.data.search && targetSRC != 'scroll') {
        $ionicLoading.hide();
      }
      for (let index = 0; index < result.length; index++) {
        
        const isExist = $scope.orderList.findIndex(row => row.id == result[index].id);
        if(isExist === -1) {
          $scope.orderList = $scope.orderList.concat(result);
        }
      }
      
      $scope.tmpOrderList = $scope.orderList;
      myAllSharedService.drTypeFilterData.orderList = $scope.orderList;
      $scope.isRequestInProcess = false;
      
      if(targetSRC == 'onLoad' || targetSRC == 'onRefresh') {
        $scope.onPageScrollTopHandler();
      }
      if(targetSRC == 'scroll') {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
      if(targetSRC == 'onRefresh')
      {
        $scope.$broadcast('scroll.refreshComplete');
        $cordovaToast.show('Refreshed Successfully', 'short', 'bottom').then(function (success) {
        }, function (error) {
        });
      }
      if(!result || result.length == 0) {
        $scope.noMoreListingAvailable = true;
      }
      $scope.currentPage += 1;
    }, function (err)
    {
      $ionicLoading.hide();
      $scope.isRequestInProcess = false;
      console.error(err);
    });
    
  }
  $scope.onGoToOrderAddHandler = function()
  {
    if($location.path() == '/orptab/orp_primary_order') {
      console.log($scope.order_type);
      myAllSharedService.drTypeFilterData.isInsideLead = 'No';
      myAllSharedService.drTypeFilterData.orderId = '';
      myAllSharedService.drTypeFilterData.order_type = $scope.order_type;
      $state.go('orptab.orp_order_add');
      // console.log("Add Primary Order");
    }
    else{
      console.log($scope.order_type);
      myAllSharedService.drTypeFilterData.order_type = $scope.order_type;
      $state.go('orptab.orp_order_add');
      // console.log("Add secondary Order");
    }
  }
  
  if($location.path()=='/orptab/orp_order_add'){
    console.log($scope.order_type);
    $scope.order_type=myAllSharedService.drTypeFilterData.order_type;
    console.log($scope.order_type);
    // $scope.getOrderListData('onLoad');
    $scope.get_dr_list();
    
  }
  
  
  
  
  $scope.onUpdateDrHaldler = function()
  {
    // if($scope.search.categoryName.length==0 || $scope.search.brandName.length==0)
    console.log($scope.search);
    if($scope.search.categoryName.length==0 && $scope.loginUserDetail.type_name!="Electrician")
    {
      $ionicPopup.alert({
        title: 'Error!',
        template: 'Division is required !!'
      });
      return;
    }
    
    if ($scope.loginUserDetail.document.length==0 && $scope.mediaData.length==0)
    {
      $ionicPopup.alert({
        title: 'Error!',
        template: 'Document is required !!'
      });
      return;
    }
    
    
    $ionicPopup.confirm({
      
      title: 'Are You Sure, You Want to Update ?',
      buttons: [{
        text: 'YES',
        type: 'button-block button-outline button-stable',
        onTap: function (e) {
          $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
          });
          
          
          $scope.loginUserDetail.selectedCategory = $scope.selectedCategory;
          $scope.loginUserDetail.selectedBrand = $scope.selectedBrand;
          
          if($scope.loginUserDetail.orp_dob)  {
            $scope.loginUserDetail.orp_dob = moment($scope.loginUserDetail.orp_dob).format('YYYY-MM-DD');
          }
          
          if($scope.loginUserDetail.orp_date_anniversary) {
            $scope.loginUserDetail.orp_date_anniversary = moment($scope.loginUserDetail.orp_date_anniversary).format('YYYY-MM-DD');
          }
          
          myRequestDBService.orpPostServiceRequest('/ORP_Login/onUpdateDrData',$scope.loginUserDetail)
          .then(function (result) {
            
            $ionicLoading.hide();
            console.log(result);
            console.log(result.inserted_id);
            if(result.status == 'success')
            {
              
              if ($scope.mediaData.length) {
                $ionicLoading.show
                ({
                  template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
                });
                
                angular.forEach($scope.mediaData, function (val, key) {
                  
                  var options = {
                    
                    fileKey: "file",
                    fileName: "image.jpg",
                    chunkedMode: false,
                    mimeType: "image/*",
                  };
                  $scope.insert_id = $scope.loginUserDetail.id;
                  console.log($scope.insert_id);
                  $cordovaFileTransfer.upload(orpServerURL + '/ORP_Controller/onUploadDocumentImageData/' + $scope.insert_id + '/' + val.doc_type + '/' + val.doc_number, val.src, options).then(function (result) {
                    
                    console.log("SUCCESS: " + JSON.stringify(result));
                    
                    $ionicLoading.hide();
                    // $scope.getLoginUserDetail();
                    
                    $cordovaToast.show('Document Image Uploaded Successfully', 'short', 'bottom').then(function (success) {
                      
                    }, function (error) {
                      
                    });
                    
                  }, function (err) {
                    
                    $ionicLoading.hide();
                    console.log("ERROR: " + JSON.stringify(err));
                    
                    $cordovaToast.show('Something Went Wrong, Try Later!', 'short', 'bottom').then(function (success) {
                      
                    }, function (error) {
                      
                    });
                  });
                });
              }
              if ($scope.data.cancel_check && $scope.data.cancel_check.length) {
                angular.forEach($scope.data.cancel_check, function (val, key) {
                  var options = {
                    
                    fileKey: "file",
                    fileName: "image.jpg",
                    chunkedMode: false,
                    mimeType: "image/*",
                  };
                  $scope.insert_id = $scope.loginUserDetail.id;
                  $cordovaFileTransfer.upload(orpServerURL + '/ORP_Controller/UPDATE_CENCEL_CHECK/' + $scope.insert_id, val.src, options).then(function (result) {
                    console.log("SUCCESS: " + JSON.stringify(result));
                  });
                });
              }
              else {
                $ionicLoading.hide();
              }
              
              $ionicLoading.show({ template: 'Information updated!', noBackdrop: true, duration: 2000 });
              $state.go('orptab.orp_profile');
            }
            else
            {
              $ionicPopup.alert({
                title: 'Error!',
                template: result.statusMessage
              });
              
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
  
  $scope.AssignExecutiveList=[];
  
  $scope.getAssignedExecutive = function()
  {
    $ionicLoading.show({
      template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
      duration: 3000
    });
    
    myRequestDBService.orpPostServiceRequest("/Dashboard_Controller/assignExectative",'').then(function(response)
    {
      console.log(response);
      
      $scope.AssignExecutiveList=response.data;
      
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
  
  
  $scope.docList;
  $scope.getDocList = function()
  {
    $scope.docList = [];
    
    myRequestDBService.getdoclist()
    .then(function(response)
    {
      console.log(response);
      $scope.docList = response.data;
      console.log($scope.docList);
      
      
    }, function (err) {
      
      console.error(err);
    });
  }
  
  $scope.goToEditProfile = function()
  {
    console.log("edit");
    $state.go('orptab.edit-profile');
    
  }
  
  
  $scope.openPdf = function()
  {
    console.log("test");
    var openurl = cordova.InAppBrowser.open('https://docs.google.com/viewer?url=http://okayapower.com/img/pdf/Okaya_Inverter%20battery_flyer.pdf&embedded=true&toolbar=0&navpanes=0&scrollbar=0', '_blank');
  }
  
  
  if($location.path() == '/orptab/orp_support')
  {
    
    $scope.getProductCategory();
    $scope.getSupportHistory();
  }
  
  $scope.order_type='';
  if($location.path() == '/orptab/orp_primary_order')
  {
    console.log("Primary order");
    $scope.order_type='Primary';
    $scope.getOrderListData('onLoad');
    
  }
  
  if($location.path() == '/orptab/orp_secondary_order')
  {
    console.log("Secondary order");
    $scope.order_type="Secondary";
    $scope.getOrderListData('onLoad');
    
  }
  
  if($location.path() == '/orptab/orp_faq')
  {
    
    $scope.getFAQList();
  }
  
  if($location.path() == '/orptab/orp_contact')
  {
    
    $scope.getAssignedExecutive();
  }
  
  
  if($location.path() == '/orptab/orp_profile' || $location.path() == '/orptab/edit-profile')
  {
    
    $scope.getLoginUserDetail();
    
    $scope.getDocList();
    
    if($location.path()=='/orptab/edit-profile')
    {
      $scope.getAllCategorySegments();
      
    }
    
    $ionicLoading.hide();
    $ionicPopover.fromTemplateUrl('add-remark', {
      scope: $scope,
    }).then(function(popovers) {
      $scope.remarkModel = popovers;
    });
    
    $ionicPopover.fromTemplateUrl('add-status', {
      scope: $scope,
    }).then(function(popovers) {
      $scope.data.statusModel = popovers;
    });
    
  }
  
  if($location.path() == '/orptab/orp_invoice')
  {
    $scope.search.dealer = { Key: "Select Dealer Name", Value: "" };
    $scope.getAssignDealerList();
    $scope.getInvoiceHistory();
    
    $ionicPopover.fromTemplateUrl('add-status', {
      scope: $scope,
    }).then(function(popovers) {
      $scope.data.statusModel = popovers;
    });
    
  }
  
  $scope.dealerName = '';
  if($location.path() == '/orptab/orp_invoice_img')
  {
    $scope.newsEventImagesData = myAllSharedService.document;
    $scope.dealerName = myAllSharedService.dealerName;
    
    $ionicPopover.fromTemplateUrl('add-status', {
      scope: $scope,
    }).then(function(popovers) {
      $scope.data.statusModel = popovers;
    });
    
    console.log($scope.dealerName);
    
  }
  
  if($location.path() == '/orptab/orp_pricelist')
  {
    $scope.getProductPriceList();
    $scope.getProductBrandList();
    $scope.getProductCategoryList();
  }
  
  $('#contact_mobile_no').on('input', function() {
    $(this).val($(this).val().replace(/[^0-9]/gi, ''));
  });
  
  $('#email').on('input', function() {
    $(this).val($(this).val().replace(/[^a-zA-Z@._0-9]/gi, ''));
  });
  
  $('#gst_no').on('input', function() {
    $(this).val($(this).val().replace(/[^a-zA-Z0-9]/gi, ''));
  });
  
  $('#orp_pan_no').on('input', function() {
    $(this).val($(this).val().replace(/[^a-zA-Z0-9]/gi, ''));
  });
  
  $('#orp_pol_cert_no').on('input', function() {
    $(this).val($(this).val().replace(/[^a-zA-Z0-9]/gi, ''));
  });
  
  $('#pincode').on('input', function() {
    $(this).val($(this).val().replace(/[^0-9]/gi, ''));
  });
  
  $scope.imageSRC = '';
  $scope.openModel = function(src)
  {
    $scope.imageSRC = src;
    console.log('BUTTON')
    $scope.data.statusModel.show();
    
  }
  
  
  $scope.ACCOUNT_STATEMENT=[];
  $scope.opening_balance={};
  $scope.GET_ACCOUNT_STATEMENT = function()
  {
    $ionicLoading.show({
      template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
      duration: 3000
    });
    
    if($scope.dash_filter.date_from && $scope.dash_filter.date_to)
    {
      $scope.dash_filter.datefrom = moment($scope.dash_filter.date_from).format("YYYY-MM-DD");
      $scope.dash_filter.dateto = moment($scope.dash_filter.date_to).format("YYYY-MM-DD");
    }
    
    myRequestDBService.orpPostServiceRequest("/Dashboard_Controller/GET_ACCOUNT_STATEMENT",$scope.dash_filter).then(function(response)
    {
      console.log(response);
      
      $scope.ACCOUNT_STATEMENT=response.data;
      $scope.opening_balance=response.opening_balance;
      console.log($scope.ACCOUNT_STATEMENT);
      console.log($scope.opening_balance);
      
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
  
  if($location.path() == '/orptab/orp_account_statement')
  {
    $scope.dash_filter.type = 'Transaction';
    $scope.dash_filter.transaction = 'All';
  }
  
  $scope.clear_data  = function()
  {
    $scope.cartSummaryData = {};
    $scope.cartItemData = [];
    myAllSharedService.drTypeFilterData.orderData = {};
  }
  
  $scope.downloadPdf = function(pdfName,title)
  {
    console.log('step 1');
    var pdf_url = "http://microtek.abacusdesk.com/uploads/account-statement.pdf";
    
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
      pdf_url, '','application/pdf');
      
      
    }
    
    
    
    $scope.downloadAccountStatement = function() {
      
      $ionicLoading.show({
        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
      });
      myRequestDBService.orpPostServiceRequest('/Dashboard_Controller/GENRATE_PDF',$scope.dash_filter).then(function (result)
      {
        console.log(result);
        $ionicLoading.hide();
        // if(result.msg == 'success')
        // {
        
        $scope.downloadPdf();
        // }
      }, function (err)
      {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Error!',
          template: 'Something went wrong !!'
        });
        console.error(err);
      });
      
    }
    
    
    $scope.AddtoList = function ()
    {
      console.log('added to list');
    }
    
    $scope.EmptyBillingCatagory = function ()
    {
      myAllSharedService.type_of_invoice = undefined;
      myAllSharedService.category = undefined;
      console.log('Empty catagory');
    }
    
    
    $scope.GET_AGEING_REPORT = function()
    {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
      });
      myRequestDBService.orpPostServiceRequest('/Invoice/EXPORT_AGEING_REPORT', '').then(function (result) {
        console.log(result);
        $ionicLoading.hide();
        
        window.open(result.URL);
        
      }, function (err) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Error!',
          template: 'Something went wrong !!'
        });
        console.error(err);
      });
    }
    
    $scope.AgeingReportData = [];
    
    $scope.GET_AGEING_LIST = function () {
      
      // screen.lockOrientation("landscape")
      // set to either landscape
      screen.orientation.lock('landscape');

      // allow user rotate
      // screen.orientation.unlock();

      // access current orientation
      console.log('Orientation is ' + screen.orientation.type);
      
      $ionicLoading.show({
        template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
      });
      myRequestDBService.orpPostServiceRequest('/Invoice/GET_AGEING_REPORT_LIST/' + $scope.loginData.drCode, '').then(function (result) {
        console.log(result);
        $ionicLoading.hide();
        $scope.AgeingReportData = result.data;
        
      }, function (err) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Error!',
          template: 'Something went wrong !!'
        });
        console.error(err);
      });
      
    }
    
    
    $scope.Bank_data={};
    $scope.saveBankDetails = function () {
      $scope.Bank_data.loginId = $scope.loginData.loginId;
      
      //----upload Form data -----
      
      $ionicPopup.confirm({
        
        title: "Are You Sure, You Wouldn't be able to change Account Details in future.",
        buttons: [{
          text: 'YES',
          type: 'button-block button-outline button-stable',
          onTap: function (e) {
            
            $ionicLoading.show({
              template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
            });
            
            myRequestDBService.save_BankDetails('/ORP_Login/UPDATE_BANK_DETAIL',$scope.Bank_data).then(function (result)
            {
              $ionicLoading.hide();
              console.log(result);
              $scope.remarkModel.hide();
              console.log(result.msg);
              
              if(result.msg == "success"){
                
                //----upload image -----
                if($scope.data.cancel_check.length){
                  console.log('cheque started upload');
                  angular.forEach($scope.data.cancel_check, function (val, key) {
                    var options = {
                      
                      fileKey: "file",
                      fileName: "image.jpg",
                      chunkedMode: false,
                      mimeType: "image/*",
                    };
                    $scope.insert_id = $scope.loginUserDetail.id;
                    $cordovaFileTransfer.upload(orpServerURL + '/ORP_Controller/UPDATE_CENCEL_CHECK/' + $scope.insert_id, val.src, options).then(function (result) {
                      console.log("SUCCESS: " + JSON.stringify(result));
                      console.log('cheque upload successfully');
                      $scope.getLoginUserDetail();
                    });
                  });
                }else{
                  $scope.getLoginUserDetail();
                }
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
          }
        }, {
          
          text: 'NO',
          type: 'button-block button-outline button-stable',
          onTap: function (e) {
            
            console.log('You Are Not Sure');
          }
        }]
        
      });
      console.log($scope.Bank_data);
    }
    
    
    if ($location.path() == '/orptab/aging_report') {
      
      $scope.GET_AGEING_LIST();
      
    }
    
    
  });
  