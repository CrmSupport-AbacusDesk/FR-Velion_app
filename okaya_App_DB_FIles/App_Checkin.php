<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');


header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Authorization, Content-Type, X-Auth-Token');

require_once('App_SharedData.php');

class App_Checkin extends App_SharedData
{
  	public function __construct() {
    		
    		parent:: __construct();
    		$this->load->helper("url");
    		$this->load->library("pagination");
    		$this->load->database();
  	}


    public function onSaveActivityHandler() {

         $_POST = json_decode(file_get_contents('php://input'), true);

         $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';

         if(isset($loginData['loginType']) && isset($loginData['loginId']) && $loginData['loginType'] && $loginData['loginId'] )  {

              $inputData = $_POST['checkInData'];

                         
              if($inputData['drId'] == 'Other') {

                  if(!isset($inputData['street']) || !$inputData['street']) {
                     $inputData['street'] = '';
                  }
            
                  $drData = array(

                      'date_created' => $this->dateData['dateCreated'],
                      'created_by' => $loginData['loginId'],
                      'created_by_name' => $loginData['loginName'],
                      'created_by_type' => $loginData['loginType'],
                      'dr_name' => $inputData['otherDrName'],
                      'contact_name' => '',
                      'contact_mobile_no' => $inputData['mobile'],
                      'type_id' => $inputData['typeId'],
                      'type_name' => $inputData['typeName'],
                      'email' => NULL,
                      'landline_no' => NULL,
                      'assign_to' => $loginData['loginId'],
                      'assign_to_name' => $loginData['loginName'],
                      'status' => 'Validate',
                      'last_activity_by' => $loginData['loginId'],
                      'last_activity_by_name' => $loginData['loginName'],
                      'last_activity_remark' => 'New Lead Created!',
                  );

                
                  if($this->db->insert('abq_dr', $drData)) {

                        $drId = $this->db->insert_id();

                        $this->db->select('abq_organization.id, abq_organization.name');
                        $this->db->from('abq_organization');
                        $this->db->where('abq_organization.del','0');
                        $this->db->where('abq_organization.id',  $loginData['loginOrganisationId']);
                        $organisationRow = $this->db->get()->row_array();

                        $updatedOrganisationData = array(

                          'date_created' => $this->dateData['dateTimeCreated'],
                          'created_by' => $loginData['loginId'],
                          'dr_id' => $drId,
                          'dr_name' => $inputData['otherDrName'],
                          'organisation_id' => $loginData['loginOrganisationId'],
                          'organisation_name' => $organisationRow['name']
                       );

                       $this->db->insert('abq_dr_organisation', $updatedOrganisationData);

                        $status = 'success';
                        $statusMessage = '';

                  } else {

                       $status = 'error';
                       $statusMessage = $this->db->error();

                       $statusMessage = str_replace("Duplicate entry","Already Exist In System,", $statusMessage['message']);
                  }

                  $result = array('status' => $status, 'statusMessage' => $statusMessage);

              } else {

                    $drId = $inputData['drId'];
                    $status = 'success';
              }


              if($status == 'success') {

                     if(isset($inputData['followUpId']) && $inputData['followUpId']) {

                          $followup_data = array(
                                'followup_done_on' =>  $this->dateData['dateTimeCreated'],
                                'followup_done_by' =>  $loginData['loginId'],
                                'followup_done_by_name' => $loginData['loginName'],
                                'followup_done_remark' => 'Activity Created',
                          );

                          $this->db->where('abq_lead_followup.id', $inputData['followUpId']);
                          $this->db->update('abq_lead_followup',$followup_data);

                          $this->db->select('abq_lead_followup.*');
                          $this->db->from('abq_lead_followup');
                          $this->db->where('abq_lead_followup.id', $inputData['followUpId']);
                          $followUpFetchData = $this->db->get()->row_array();

                          $description = $followUpFetchData['followup_type']." Followup Done Succesfully";     

                          $this->onSaveSummaryLogsData($loginData, $followUpFetchData['dr_id'],'Followup Done',$description);
                     } 


                     $this->db->select('abq_dr.id, abq_dr.dr_name, abq_dr.type_id, abq_dr.type_name, abq_dr.contact_mobile_no, abq_dr.status');
                     $this->db->from('abq_dr');
                     $this->db->where('abq_dr.id', $drId);
                     $this->db->where('abq_dr.del','0');
                     $drData = $this->db->get()->row_array();

                     $drId = $drData['id'];
                     $drName = $drData['dr_name'];
                     $drType = $drData['type_id'];
                     $drTypeName = $drData['type_name'];
                     $drMobile = $drData['contact_mobile_no'];
                     $drStatus = $drData['status'];

                     if($inputData['activityType'] != 'Meeting') {
                       
                           $startLat = '';
                           $startLng = '';
                           $remark = $inputData['remark'];
                     }

                     if($inputData['activityType'] == 'Meeting') {

                          $startLat = $inputData['lat'];
                          $startLng = $inputData['lng'];
                          $remark = '';
                     }


                     $updatedData = array(

                        'date_created' => $this->dateData['dateTimeCreated'],
                        'created_by' => $loginData['loginId'],
                        'created_by_name' => $loginData['loginName'],
                        'dr_id' => $drId,
                        'dr_name' => $drName,
                        'dr_type' => $drType,
                        'dr_type_name' => $drTypeName,
                        'mobile' => $drMobile,
                        'activity_type' => $inputData['activityType'],
                        'assigned_to' => $loginData['loginId'],
                        'visit_start' => $this->dateData['dateTimeCreated'],
                        'start_lat' => $startLat,
                        'start_lng' => $startLng,
                        'remark' => $remark,
                        'created_from' => 'App'
                     );

                     $this->db->insert('abq_dr_activity', $updatedData);

                     $lastQuery = $this->db->last_query();

                     if($inputData['activityType'] == 'Meeting') {

                              $updatedData = array(
                                    'meeting' => 1
                              );

                              $this->db->where('id', $drId);
                              $this->db->update('abq_dr', $updatedData);
                     }


                     $description = 'New Activity Created!';
                     $this->onSaveSummaryLogsData($loginData, $drId, 'Activity Created',$description);


                     if($drStatus != $inputData['status']) {

                         if(!isset($inputData['lostReason']) || !$inputData['lostReason']) {

                             $inputData['lostReason'] = '';
                         }

                         $updatedData = array(
                              'status' => $inputData['status'],
                              'status_on' => $this->dateData['dateTimeCreated'],
                              'status_by' => $loginData['loginId'],
                              'status_reason' => $inputData['lostReason'],
                              'last_activity_by' => $loginData['loginId'],
                              'last_activity_by_name' => $loginData['loginName'],
                              'last_activity_type' => 'Status Updated',
                              'last_activity_remark' => 'Status Updated To '.$inputData['status'].'',
                         );

                         $this->db->where('id', $drId);
                         $this->db->update('abq_dr', $updatedData);

                         $description = 'Lead Status Updated From '. $drStatus . ' to '. $inputData['status']. ' Succesfully';    

                         $this->onSaveSummaryLogsData($loginData, $drId,'Status Updated',$description);
                     }



                     if(isset($inputData['isFollowUp']) && $inputData['isFollowUp']) {


                         $updatedData = array(

                             'date_created' => $this->dateData['dateTimeCreated'],
                             'created_by' => $loginData['loginId'],
                             'created_by_name' => $loginData['loginName'],
                             'created_by_type' => $loginData['loginType'],
                             'dr_id' => $drData['id'],
                             'dr_name' =>  $drData['dr_name'],
                             'dr_type_name' => $drData['type_name'],
                             'followup_date' => $inputData['followUpDateInFormat'],
                             'followup_type' => $inputData['followUpType'],
                             'followup_remark' => $inputData['followUpDescription'],
                             'assign_to' => $loginData['loginId'],
                             'assign_to_name' => $loginData['loginName'],
                             'created_from' => 'App'
                         );

                         $this->db->insert('abq_lead_followup', $updatedData);

                         $description = 'New FollowUp Created Succesfully'; 
                         $this->onSaveSummaryLogsData($loginData, $drData['id'],'FollowUp Created',$description);
                     }


                     $result = array(

                        'status' => 'Success',
                        'statusMessage' => $lastQuery
                     );
              }

              echo json_encode($result);


         } else {

               $this->onReturnErrorMessage();
         }

    }


    public function onSaveVisitEndHandler() {

         $_POST = json_decode(file_get_contents('php://input'), true);
   
         $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';

         if(isset($loginData['loginType']) && isset($loginData['loginId']) && $loginData['loginType'] && $loginData['loginId'] )  {

              $inputData = $_POST['checkInData'];

              $updatedData = array(
                   
                    'visit_end' => $this->dateData['dateTimeCreated'],
                    'lat' => $inputData['lat'],
                    'lng' => $inputData['lng'],
                    'remark' => $inputData['description']
              );

              $this->db->where('id', $inputData['activityId']);
              $this->db->update('abq_dr_activity', $updatedData);

              if(isset($inputData['isFollowUp']) && $inputData['isFollowUp']) {

                         $this->db->select('abq_dr.id, abq_dr.dr_name, abq_dr.type_id, abq_dr.type_name, abq_dr.dr_name');
                         $this->db->from('abq_dr');
                         $this->db->where('abq_dr.id', $inputData['drId']);
                         $this->db->where('abq_dr.del','0');
                         $drData = $this->db->get()->row_array();

                         $updatedData = array(

                             'date_created' => $this->dateData['dateCreated'],
                             'created_by' => $loginData['loginId'],
                             'created_by_name' => $loginData['loginName'],
                             'created_by_type' => $loginData['loginType'],
                             'dr_id' => $drData['id'],
                             'dr_name' =>  $drData['dr_name'],
                             'dr_type_name' => $drData['type_name'],
                             'followup_date' => $inputData['followUpDateInFormat'],
                             'followup_type' => $inputData['followUpType'],
                             'followup_remark' => $inputData['followUpDescription'],
                             'assign_to' => $loginData['loginId'],
                             'assign_to_name' => $loginData['loginName'],
                             'created_from' => 'App'
                         );

                         $this->db->insert('abq_lead_followup', $updatedData);

                         $description = 'New FollowUp Created Succesfully'; 
                         $this->onSaveSummaryLogsData($loginData, $drData['id'],'FollowUp Created',$description);
              }

              $this->db->select('abq_dr.status');
              $this->db->from('abq_dr');
              $this->db->where('abq_dr.id', $inputData['drId']);
              $this->db->where('abq_dr.del','0');
              $drData = $this->db->get()->row_array();

              $drStatus = $drData['status'];

              if($drStatus != $inputData['status']) {

                     if(!isset($inputData['lostReason']) || !$inputData['lostReason']) {

                         $inputData['lostReason'] = '';
                     }


                     $updatedData = array(

                          'status' => $inputData['status'],
                          'status_on' => $this->dateData['dateTimeCreated'],
                          'status_by' => $loginData['loginId'],
                          'status_reason' => $inputData['lostReason'],
                          'last_activity_by' => $loginData['loginId'],
                          'last_activity_by_name' => $loginData['loginName'],
                          'last_activity_type' => 'Status Updated',
                          'last_activity_remark' => 'Status Updated To '.$inputData['status'].'',
                     );

                     $this->db->where('id', $inputData['drId']);
                     $this->db->update('abq_dr', $updatedData);

                     $description = 'Lead Status Updated From '. $drStatus . ' to '. $inputData['status']. ' Succesfully';    

                     $this->onSaveSummaryLogsData($loginData, $inputData['drId'],'Status Updated',$description);
              }


              $resultData = array(

                  'status' => 'Succcess',
                  'statusMessage' => ''
              );

              echo json_encode($resultData);

         } else {


            $this->onReturnErrorMessage();
         }
    }


    public function onSaveFollowUpData() {

          $_POST = json_decode(file_get_contents('php://input'), true);

          $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';

          if(isset($loginData['loginType']) && isset($loginData['loginId']) && $loginData['loginType'] && $loginData['loginId']) {

                 $inputData = $_POST['followUpData'];

                 $this->db->select('abq_dr.id, abq_dr.dr_name, abq_dr.type_id, abq_dr.type_name, abq_dr.dr_name');
                 $this->db->from('abq_dr');
                 $this->db->where('abq_dr.id', $inputData['drId']);
                 $this->db->where('abq_dr.del','0');
                 $drData = $this->db->get()->row_array();

                 if(isset($inputData['followUpId']) && $inputData['followUpId']) {

                      $updatedData = array(

                           'followup_date' => $inputData['followUpDateInFormat'],
                           'followup_type' => $inputData['followUpType'],
                           'followup_remark' => $inputData['description'],
                      );

                      $this->db->where('id', $inputData['followUpId']);
                      $this->db->update('abq_lead_followup', $updatedData);

                      $description = 'Followup Updated Succesfully';

                      $this->onSaveSummaryLogsData($loginData, $drData['id'], 'Followup Updated', $description);

                 } else {


                        $updatedData = array(

                           'date_created' => $this->dateData['dateTimeCreated'],
                           'created_by' => $loginData['loginId'],
                           'created_by_name' => $loginData['loginName'],
                           'dr_id' => $drData['id'],
                           'dr_name' =>  $drData['dr_name'],
                           'dr_type_name' => $drData['type_name'],
                           'followup_date' => $inputData['followUpDateInFormat'],
                           'followup_type' => $inputData['followUpType'],
                           'followup_remark' => $inputData['description'],
                           'assign_to' => $loginData['loginId'],
                           'assign_to_name' => $loginData['loginName'],
                           'created_from' => 'App'
                        );

                        $this->db->insert('abq_lead_followup', $updatedData);

                        $description = 'Followup Added Succesfully';       
                        $this->onSaveSummaryLogsData($loginData, $drData['id'], 'Followup Add', $description);
                 }


                 $result = array(

                    'status' => 'Success',
                    'statusMessage' => ''
                 );

                 echo json_encode($result);


          } else {

              $this->onReturnErrorMessage();
          }

    }


    public function onSaveFollowUpRemarkHandler() {

        $_POST = json_decode(file_get_contents('php://input'), true);

        $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';

        if(isset($loginData['loginType']) && isset($loginData['loginId']) && $loginData['loginType'] && $loginData['loginId']) {

              $inputData = $_POST;

              $followup_data = array(
                  'followup_done_on' =>  $this->dateData['dateTimeCreated'],
                  'followup_done_by' =>  $loginData['loginId'],
                  'followup_done_by_name' => $loginData['loginName'],
                  'followup_done_remark' => $inputData['remark'],
              );

              $this->db->where('abq_lead_followup.id', $inputData['followUpId']);
              $this->db->update('abq_lead_followup',$followup_data);

              $this->db->select('abq_lead_followup.*');
              $this->db->from('abq_lead_followup');
              $this->db->where('abq_lead_followup.id', $inputData['followUpId']);
              $remarkData = $this->db->get()->row_array();

              $description = $remarkData['followup_type']." Followup Done Succesfully";     

              $this->onSaveSummaryLogsData($loginData, $remarkData['dr_id'],'Followup Done',$description);

              $result = array('status' => 'success');

              echo json_encode($result);

         } else {

               $this->onReturnErrorMessage();
         }
    }


    public function onGetActivityIdDataHandler() {

          $_POST = json_decode(file_get_contents('php://input'), true);

          $loginId = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';

          if(isset($loginId['loginType']) && isset($loginId['loginId']) && $loginId['loginType'] && $loginId['loginId']) {

                 $inputData = $_POST;

                 $this->db->select('abq_dr_activity.*');
                 $this->db->from('abq_dr_activity');
                 $this->db->where('abq_dr_activity.id', $inputData['activityId']);
                 $activityData = $this->db->get()->row_array();

                 $visitStartTime = date_create($activityData['visit_start']);
                 $activityData['visitStartTimeInFormat'] = date_format($visitStartTime, 'H:i A');

                 $result = array(

                     'activityData' => $activityData
                 );


                 echo json_encode($result);


          }  else {

              $this->onReturnErrorMessage();
          }


    }

    public function onReturnErrorMessage() {

    	    $resultData = array('status' => 'error', 'statusMessage' => 'You are not authorized to access this information!');

    	    echo json_encode($resultData);
    }
	
}

?>




