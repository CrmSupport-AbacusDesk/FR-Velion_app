app.controller('surveyCtrl', function($scope, $ionicModal, $location, $ionicLoading, myRequestDBService, $ionicActionSheet, $cordovaImagePicker, Camera, $cordovaFileTransfer, $cordovaGeolocation, $cordovaToast, $window, $ionicPlatform, $ionicHistory, $stateParams, $ionicScrollDelegate, $ionicPopover, myAllSharedService, $state, $ionicPopup, searchSelect) {

  $scope.goToBackPageHandler = function() {
    $ionicHistory.goBack();
  }

  console.log('welcome in survey controler');

  $scope.surveyListData = [];
  $scope.getsurveylist = function() {
    $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
    });

    myRequestDBService.orpPostServiceRequest("/Survey/surveyList", '').then(function(response) {
      console.log(response);
      $scope.surveyListData=response.data;
      console.log($scope.surveyListData);
      $ionicLoading.hide();
    });
  }

  $scope.survey_id;
  $scope.survey_title;

  $scope.getsurveyquestion = function(id) {
    console.log(id);
    $scope.survey_id = id;

    $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner><p>Loading...</p>'
    });

    myRequestDBService.orpPostServiceRequest("/Survey/surveyQuestionList",{"survey_id":id}).then(function(response) {
      console.log(response);
      $scope.surveyQuestionData=response.data;
      $ionicLoading.hide();

      if ($scope.surveyQuestionData.length) {
        $scope.checkcount()
      }

      console.log($scope.surveyQuestionData)
    });
  }


  $scope.onsurvey = function(data) {
    if ($scope.questionCheckCount == 0) {
      $ionicPopup.alert({
        title: 'Error',
        template: 'Please fill atleat one question.'
      });
      return;
    }
    console.log(data);
    myRequestDBService.orpPostServiceRequest("/Survey/saveSurveyAnswer",{"question" : $scope.surveyQuestionData,survey_id:$scope.survey_id}).then(function(response) {
      console.log(response);

      if($scope.surveyQuestionData != "")
      {
        setTimeout(() =>
        {
          $state.go('orptab.orp_survey-list');

          $ionicPopup.alert({
            title: 'Success',
            template: 'Answer filled succesfully'
          });

        }, 500);
      }
    });
  }

  $scope.questionCheckCount = 0;
  $scope.checkcount = function()
  {
    $scope.questionCheckCount = 0;

    for (let i = 0; i < $scope.surveyQuestionData.length; i++)
    {
      console.log($scope.surveyQuestionData[i]['answer']);

      for (let j = 0; j < $scope.surveyQuestionData[i]['answer'].length; j++)
      {
        console.log($scope.surveyQuestionData[i]['answer'][j]['ischeck']);

        if ($scope.surveyQuestionData[i]['answer'][j]['ischeck'])
        {
          $scope.questionCheckCount++;
          console.log($scope.questionCheckCount);
          break;
        }
      }
    }
  }

  $scope.categoryList;
  $scope.categoryClass;
  $scope.categoryList = function() {

    myRequestDBService.orpPostServiceRequest("/Dashboard_Controller/GET_DISTRIBUTOR_ASSIGN_CATEGORY"+"").then(function(response) {
      console.log(response);

      $scope.categoryList = response.data;
      console.log($scope.categoryList);

      if(myAllSharedService.category){
        $scope.categoryClass = myAllSharedService.category
      }else{
      $scope.categoryClass = $scope.categoryList[0].division;
      }

      $scope.getOutstanding_details($scope.categoryClass);
    });
  }

  $scope.outstandingData;
  $scope.getOutstanding_details = function(division) {

    $scope.categoryClass=division;
    myRequestDBService.orpPostServiceRequest("/Dashboard_Controller/GET_DISTRIBUTOR_OUTSTANDING/"+division,"").then(function(response) {
      console.log(response);

      $scope.outstandingData = response;

      Highcharts.chart('container', {
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie'
        },
        title: {
          text: ''
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        accessibility: {
          point: {
            valueSuffix: '%'
          }
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>'
            }
          }
        },
        series: [{
          name: 'Outstanding',
          colorByPoint: true,
          data: $scope.outstandingData
        }]
      });

    });
  }



  $scope.gotoBillingPage = function(day_from,day_to,outstandingdata){

    myAllSharedService.date_To = moment().subtract(day_from, 'days').format('YYYY-MM-DD');
    myAllSharedService.date_From = moment().subtract(day_to, 'days').format('YYYY-MM-DD');

    myAllSharedService.category = outstandingdata;

    myAllSharedService.agingFrom = day_from;
    myAllSharedService.agingTo = day_to;
    myAllSharedService.type_of_invoice = "Outstanding";
    $state.go('orptab.billing-list');

  }

  $scope.overDue_data;
  $scope.getoverDue_details = function() {

    myRequestDBService.orpPostServiceRequest("/Dashboard_Controller/GET_DISTRIBUTOR_OVERDUE"+"").then(function(response) {
      console.log(response);

      $scope.overDue_data = response.data;

      Highcharts.chart('container', {
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie'
        },
        title: {
          text: ''
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        accessibility: {
          point: {
            valueSuffix: '%'
          }
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>'
            }
          }
        },
        series: [{
          name: 'Over Due',
          colorByPoint: true,
          data: $scope.overDue_data
        }]
      });

    });
  }

  $scope.gotoBillingPageFromOverdue = function(catagory){

    myAllSharedService.type_of_invoice ='Overdue';
    myAllSharedService.catagory =catagory;

    console.log(myAllSharedService.type_of_invoice);
    console.log(myAllSharedService.catagory);

    $state.go('orptab.billing-list');

  }



  $scope.gotoQuestionPage = function (id,survey_title)
  {
    myRequestDBService.survey_id = id;
    myRequestDBService.survey_title = survey_title;
    $state.go("orptab.orp_survey");

  }


  if ($location.path() == '/orptab/orp_survey-list') {
    $scope.getsurveylist();
    $scope.surveyQuestionData = [];

  }

  if ($location.path() == '/orptab/orp_survey') {

    $scope.survey_title = myRequestDBService.survey_title;
    $scope.getsurveyquestion(myRequestDBService.survey_id);
  }

  if ($location.path() == '/orptab/outstanding-details') {
    $scope.categoryList();
    // $state.go('orptab.billing-list');


  }
  if ($location.path() == '/orptab/Over-due') {

    $scope.getoverDue_details();

  }

  // Highcharts.chart('container', {
  //   chart: {
  //     plotBackgroundColor: null,
  //     plotBorderWidth: null,
  //     plotShadow: false,
  //     type: 'pie'
  //   },
  //   title: {
  //     text: ''
  //   },
  //   tooltip: {
  //     pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
  //   },
  //   accessibility: {
  //     point: {
  //       valueSuffix: '%'
  //     }
  //   },
  //   plotOptions: {
  //     pie: {
  //       allowPointSelect: true,
  //       cursor: 'pointer',
  //       dataLabels: {
  //         enabled: true,
  //         format: '<b>{point.name}</b>: {point.percentage:.1f} %'
  //       }
  //     }
  //   },
  //   series: [{
  //     name: 'Brands',
  //     colorByPoint: true,
  //     data: [{
  //       name: '30 ',
  //       y: 10000000.41,
  //       sliced: true,
  //       selected: true
  //     }, {
  //       name: '0 ',
  //       y: 85678546
  //     }, {
  //       name: '45',
  //       y: 34546689
  //     }]
  //   }]
  // });

  // $scope.surveyQuestion = [
  //     { question: 'What is Lorem Ipsum?', answer: [{ answer: 'Lorem Ipsum is simply dummy text.' }, { answer: 'Industries standard dummy text ever since the 1500s.' }, { answer: 'Its popularised.' }] },
  //     { question: 'What is Okaya?', answer: [{ answer: 'Okaya is simply Battery Company.' }, { answer: 'Battery has been standard dummy.' }, { answer: 'Popularised.' }] },
  //     { question: 'What is Ipsum?', answer: [{ answer: 'Ipsum is dummy text.' }, { answer: 'Ipsum has been the industries ever since the 1500s.' }, { answer: 'It was to Populer.' }] },
  // ];
});
