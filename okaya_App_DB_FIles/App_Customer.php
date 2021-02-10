<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Authorization, Content-Type, X-Auth-Token');

require_once('App_SharedData.php');

class App_Customer extends App_SharedData
{
	public function __construct() {
		
		parent:: __construct();
		$this->load->helper("url");
		$this->load->library("pagination");
		$this->load->database();
	}


	public function getDrStatusWiseData() {

		  $_POST = json_decode(file_get_contents('php://input'), true);

          $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';

		  if(isset($loginData['loginType']) && isset($loginData['loginId']) && $loginData['loginType'] && $loginData['loginId'] )  {

		  	   $inputData = $_POST;

			   $assignedUserIds = $this->onGetAssignedUserIdsData($loginData['loginId'], $loginData['loginOrganisationId'] , '');

			   if(COUNT($assignedUserIds) == 0) {
			       $assignedUserIds = [0];
	           }

			   $assignedDrIds = $this->onGetAssignedDrIdData($assignedUserIds, $loginData['loginOrganisationId']);

			   $assignedDrData = $assignedDrIds['drAllData'];

	           if(COUNT($assignedDrIds['customerIds']) == 0) {
	          	  $assignedDrIds = [0];
	           }
              
               $typeData = $this->getDrAllTypeData(true);
               $statusData = $this->getDrAllStatusData(true);
            

               $drTempData = $assignedDrData;
               
               $leadData = array();

	           foreach ($typeData as $key => $row) {

	          	      $index = COUNT($leadData);

	          	      $leadData[$index]['typeId'] = $row['id'];
	          	      $leadData[$index]['typeName'] = $row['type'];
	          	      $leadData[$index]['typeStatusData'] = array();

                      $typeCount = 0;


	          	      foreach ($statusData as $statusKey => $statusRow) {
                            
                            $count = 0;
                            $i = 0;
	          	      	    while ($i < COUNT($drTempData)) {

	          	      	    	 if(isset($drTempData[$i]) && $drTempData[$i]['type_id'] == $row['id'] && $drTempData[$i]['status'] == $statusRow['name']) {

	          	      	    	 	  $count ++;
	          	      	    	 }

	          	      	    	 $i++;  
	          	      	    }

						   $statusTotalCount = $count;

						   $statusResultData = array();

				           $statusIndex = COUNT($leadData[$index]['typeStatusData']);

                           $leadData[$index]['typeStatusData'][$statusIndex]['statusName'] = $statusRow['name'];

                           $leadData[$index]['typeStatusData'][$statusIndex]['statusTotalCount'] = $statusTotalCount;

                           $typeCount += $statusTotalCount;
	          	      }

	          	      $leadData[$index]['typeCount'] = $typeCount;
	           }


	           $result  = array(
                  
                   'leadData' => $leadData
	           );

	           echo json_encode($result);

	      } else {

	      	    $this->onReturnErrorMessage();
	      }
	}


	public function onGetDrListData() {

    	  $_POST = json_decode(file_get_contents('php://input'), true);

          $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';
          $inputData = $_POST;

          if(!$loginData) {

               $targetData = json_decode($_GET['targetArr'], true);

               $loginData = $targetData['loginData'];
               $inputData = $targetData;
          }

		  if(isset($loginData['loginType']) && isset($loginData['loginId']) && $loginData['loginType'] && $loginData['loginId'] )  {


			   $assignedUserIds = $this->onGetAssignedUserIdsData($loginData['loginId'], $loginData['loginOrganisationId'], '');

			   if(COUNT($assignedUserIds) == 0) {
			        $assignedUserIds = [0];
	           }


	           $drResultData = $this->onGetAssignedDrIdData($assignedUserIds, $loginData['loginOrganisationId']);

			   $assignedDrData = $drResultData['drAllData'];

           
                $i = 0;
                $drIdFinalData = array();

	      	    while ($i < COUNT($assignedDrData)) {

	      	    	if(isset($assignedDrData[$i]['type_id']) && $assignedDrData[$i]['type_id'] == $inputData['typeId'] && (!isset($inputData['status']) || $assignedDrData[$i]['status'] == $inputData['status'])) {

	      	    	 	if(isset($inputData['searchData']) && $inputData['searchData']) {

	      	    	 		  if (strpos(strtolower($assignedDrData[$i]['dr_name']), strtolower($inputData['searchData'])) !== false) {

                    	         $drIdFinalData[] =  $assignedDrData[$i]['dr_id'];

	      	    	 		  }
                          
	                    } else {

	                    	  $drIdFinalData[] =  $assignedDrData[$i]['dr_id'];
	                    }

	      	        }

	      	        if(COUNT($drIdFinalData) >= 50) {

	      	        	  break;
	      	        }

	      	        $i++;  
	      	    }

	      	    if(COUNT($drIdFinalData) == 0) {

	      	    	  $drIdFinalData = [0];
	      	    }

	      	    $this->db->select('abq_dr.*');
		        $this->db->from('abq_dr');
                $this->db->where('abq_dr.id IN ('.implode(",",$drIdFinalData).')');
                $this->db->where('abq_dr.del','0');
		        $leadData = $this->db->get()->result_array();
	 
	            $result  = array(
                  
                   'leadData' => $leadData
	            );

	            echo json_encode($result);

	      } else {

	      	    $this->onReturnErrorMessage();
	      }
    }
    


	public function getDrDetail() {

		$_POST = json_decode(file_get_contents('php://input'), true);

		$inputData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';
		$drId = isset($_POST['drId']) && $_POST['drId']  ? $_POST['drId'] : '';

		if(isset($inputData['loginType']) && isset($inputData['loginId']) && $inputData['loginType'] && $inputData['loginId'] && $drId )  {

			  $this->db->select('abq_dr.*');
		      $this->db->from('abq_dr');
              $this->db->where_in('abq_dr.id', $drId);
              $this->db->where('abq_dr.del','0');
              $leadData = $this->db->get()->row_array();

              $leadCreateDate = date_create($leadData['date_created']);
              $leadData['createdDateInFormat'] = date_format($leadCreateDate, 'd M Y');

              $contactData = $this->getContactData();
			  $checkInData = $this->getCheckInData();
			  $followUpData = $this->onGetFollowUpData();
              $requirementData = $this->onGetRequirementData();
              $quotationData = $this->onGetQuotationData();
              $orderData = $this->onGetOrderData();

              $followUpCount = COUNT($followUpData);

              if($followUpCount > 0) {
                     
                  $nextFollowUpData = $followUpData[$followUpCount-1];
 
              } else {
 
                   $nextFollowUpData  = array();
              	   $nextFollowUpData['followUpDateInFormat'] = '';
              }

              $resultData = array(

                 'drData' => $leadData,
                 'contactData' => $contactData,
              	 'checkInData' => $checkInData,
              	 'nextFollowUpData' => $nextFollowUpData,
              	 'followUpData' => $followUpData,
              	 'requirementData' => $requirementData,
              	 'quotationData' => $quotationData,
              	 'orderData' => $orderData
              );

              echo json_encode($resultData);
         
		} else {

			 $this->onReturnErrorMessage();
		}

	}


	public function onSubmitDrData() {

		$_POST = json_decode(file_get_contents('php://input'), true);

	    $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';

		if(isset($loginData['loginType']) && isset($loginData['loginId']) && $loginData['loginType'] && $loginData['loginId'] )  {

            $inputData = $_POST;

            $checkDuplicacyData = $this->onValidateLeadDuplicacyHandler($inputData);

			if($checkDuplicacyData['isDuplicateFound']) {

				$status = 'error';
				$statusMessage = $checkDuplicacyData['errorMsg'];


			} else {

				if(!isset($inputData['street']) || !$inputData['street']) {

                    $inputData['street'] = '';
                }

	            $this->db->select('abq_master_source.id, abq_master_source.name');
		        $this->db->from('abq_master_source');
	            $this->db->where('abq_master_source.name', 'Cold Call');
	            $this->db->where('abq_master_source.del','0');
	            $sourceData = $this->db->get()->row_array();

	            if(!isset($sourceData['id']) || !$sourceData['id']) {

	                $sourceId = 0;
	    	        $sourceName = '';

	            } else {
	                
	                $sourceId = $sourceData['id'];
	    	        $sourceName = $sourceData['name'];
	            }

	            if(!isset($inputData['landlineNo']) || !$inputData['landlineNo'] || $inputData['landlineNo'] == 'null') {
	            	 $inputData['landlineNo'] = NULL;
	            }

	            if(!isset($inputData['customerMobile2']) || !$inputData['customerMobile2'] || $inputData['customerMobile2'] == 'null') {
	            	 $inputData['customerMobile2'] = NULL;
	            }

	            if(!isset($inputData['email']) || !$inputData['email']) {
	            	 $inputData['email'] = NULL;
	            }

                if(isset($inputData['drId']) && $inputData['drId']) {

                	  if(!isset($inputData['lostReason']) || !$inputData['lostReason']) {
                	  	  $inputData['lostReason'] = '';
                	  }

	            	  $this->db->select('abq_dr.status');
				      $this->db->from('abq_dr');
		              $this->db->where('abq_dr.id', $inputData['drId']);
		              $this->db->where('abq_dr.del','0');
		              $leadData = $this->db->get()->row_array();

		              $leadPreviousStatus = $leadData['status'];

	            	  $drData = array(

							'dr_name' => $inputData['drName'],
							'contact_name' => $inputData['contact_name'],
							'contact_mobile_no' => $inputData['customerMobile1'],
							'secondary_mobile_no' => $inputData['customerMobile2'],
							'type_id' => $inputData['typeId'],
							'type_name' => $inputData['typeName'],
							'email' => $inputData['email'],
							'category' => $inputData['category'],
							'website' => $inputData['website'],
							'landline_no' => $inputData['landlineNo'],
							'source_id' => $sourceId,
							'source_name' => $sourceName,
							'street' => $inputData['street'],
							'state_name' => $inputData['stateName'],
							'district_name' => $inputData['districtName'],
							'city' => $inputData['city'],
							'pincode' => $inputData['pincode'],
							'last_activity_by' => $loginData['loginId'],
							'last_activity_by_name' => $loginData['loginName'],
							'last_activity_remark' => 'Lead Updated!',
				        );

	                    $this->db->where('id', $inputData['drId']);
				        if($this->db->update('abq_dr', $drData)) {

				             if($leadPreviousStatus != $inputData['status']) {

			              	      $updatedData = array(
		                              'status' => $inputData['status'],
		                              'status_on' => $this->dateData['dateTimeCreated'],
					             	  'status_by' => $loginData['loginId'],
					             	  'status_reason' => $inputData['lostReason'],
					             	  'last_activity_by' => $loginData['loginId'],
					             	  'last_activity_by_name' => $loginData['loginName'],
					             	  'last_activity_type' => 'Status Updated',
					             	  'last_activity_remark' => 'Status Updated From '. $leadPreviousStatus . ' to '. $inputData['status']. ' Succesfully',
		                          );

		                          $this->db->where('id', $inputData['drId']);
		                          $this->db->update('abq_dr', $updatedData);

		                          $description = 'Lead Status Updated From '. $leadPreviousStatus . ' to '. $inputData['status']. ' Succesfully';    
	 
		                          $this->onSaveSummaryLogsData($loginData, $inputData['drId'],'Status Updated', $description);
				             }

				             $this->onUpdatedLeadContactData();

			                 $this->onUpdatedLeadAssignData();

	                         $status = 'success';
						     $statusMessage = '';

				        } else {
	                         
	                         $status = 'error';
						     $statusMessage = $this->db->error();

						     $statusMessage = str_replace("Duplicate entry","Already Exist In System,", $statusMessage['message']);
				        }

	            } else {

	            	    if(!isset($inputData['status']) || !$inputData['status']) {

                            $inputData['status'] = 'Validate';
	            	    }
	            	    

	                 	$drData = array(

							'date_created' => $this->dateData['dateTimeCreated'],
							'created_by' => $loginData['loginId'],
							'created_by_name' => $loginData['loginName'],
							'created_by_type' => $loginData['loginType'],
							'lead' => 1,
							'dr_name' => $inputData['drName'],
							'contact_name' => $inputData['contact_name'],
							'contact_mobile_no' => $inputData['customerMobile1'],
							'secondary_mobile_no' => $inputData['customerMobile2'],
							'type_id' => $inputData['typeId'],
							'type_name' => $inputData['typeName'],
							'email' => $inputData['email'],
							'category' => $inputData['category'],
							'website' => $inputData['website'],
							'landline_no' => $inputData['landlineNo'],
							'source_id' => $sourceId,
							'source_name' => $sourceName,
							'street' => $inputData['street'],
							'state_name' => $inputData['stateName'],
							'district_name' => $inputData['districtName'],
							'city' => $inputData['city'],
							'pincode' => $inputData['pincode'],
							'status' => $inputData['status'],
							'validate' => 1,
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
			                    'dr_name' => $inputData['drName'],
			                    'organisation_id' => $loginData['loginOrganisationId'],
			                    'organisation_name' => $organisationRow['name']
						     );

						     $this->db->insert('abq_dr_organisation', $updatedOrganisationData);

						     $description = $inputData['typeName'] . ' Lead Added Succesfully';

				             $this->onSaveSummaryLogsData($loginData, $drId, 'Lead Created',$description);

				             $_POST['drId'] = $drId;

				             $this->onUpdatedLeadContactData();
			                 $this->onUpdatedLeadAssignData();


					         $status = 'success';
						     $statusMessage = '';

						} else {

						     $status = 'error';
						     $statusMessage = $this->db->error();

						     $statusMessage = str_replace("Duplicate entry","Already Exist In System,", $statusMessage['message']);
						}
	            }

			}

			$result = array('status' => $status, 'statusMessage' => $statusMessage);
			echo json_encode($result);
		}
    }


    public function onValidateLeadDuplicacyHandler($inputData) {

		$this->db->select('abq_dr_contact.id, abq_dr_contact.dr_id');
		$this->db->from('abq_dr_contact');
		$this->db->where('abq_dr_contact.del','0');

		if(isset($inputData['drId']) && $inputData['drId']) {
			$this->db->where('abq_dr_contact.dr_id != '.$inputData['drId'].'');
		}

		$this->db->group_start();

		    if($inputData['email']) {

			   $this->db->where('abq_dr_contact.email', $inputData['email']);

		    }

			$this->db->or_where('abq_dr_contact.mobile', $inputData['customerMobile1']);

			if($inputData['customerMobile2']) {

			   $this->db->or_where('abq_dr_contact.mobile', $inputData['customerMobile2']);
			}

		$this->db->group_end();

		$contactResultData = $this->db->get()->row_array();

		$isCustomerTableDuplicateFound = false;
		$isContactTableDuplicateFound = false;
		$errorMsg = '';

		if(isset($contactResultData['id']) && $contactResultData['id']) {

			$isContactTableDuplicateFound = true;

			$this->db->select('abq_dr.id, abq_dr.dr_name');
			$this->db->from('abq_dr');
			$this->db->where('abq_dr.id', $contactResultData['dr_id']);
			$this->db->where('abq_dr.del','0');
			$inputData = $this->db->get()->row_array();

			$errorMsg = 'Duplicacy With '. $inputData['dr_name'];
		}

		if(isset($inputData['contacName']) && $inputData['contacName']) {

                $this->db->select('abq_dr.id, abq_dr.dr_name');
				$this->db->from('abq_dr');
				$this->db->where('abq_dr.del','0');

				$this->db->group_start();

					$this->db->where('abq_dr.email', $inputData['contactEmail']);
					$this->db->or_where('abq_dr.contact_mobile_no', $inputData['contactMobile']);
					$this->db->or_where('abq_dr.secondary_mobile_no', $inputData['contactMobile']);

				$this->db->group_end();

				$customerResultData = $this->db->get()->row_array();

				if(isset($customerResultData['id']) && $customerResultData['id']) {

					$isCustomerTableDuplicateFound = true;

					$this->db->select('abq_dr.id, abq_dr.dr_name');
					$this->db->from('abq_dr');
					$this->db->where('abq_dr.id', $customerResultData['id']);
					$this->db->where('abq_dr.del','0');
					$inputData = $this->db->get()->row_array();

					$errorMsg = 'Duplicacy With '. $inputData['dr_name'];
				}
		}

		if($isCustomerTableDuplicateFound || $isContactTableDuplicateFound) {

			$resultData = array(

				'isDuplicateFound' => true,
				'errorMsg' => $errorMsg
			);

		} else {

			$resultData = array(

				'isDuplicateFound' => false,
				'errorMsg' => ''
			);
		}

		return $resultData;
	}


    public function onUpdatedLeadAssignData() {

    	$_POST = json_decode(file_get_contents('php://input'), true);

        $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';

		if(isset($loginData['loginType']) && isset($loginData['loginId']) && $loginData['loginType'] && $loginData['loginId'] )  {

	          $inputData = $_POST;

	          if($loginData['loginAccessLevel'] == '4') {

	          	    $updatedData = array(

	          	   	   	'assign_to' => $loginData['loginId'],
						'assign_to_name' => $loginData['loginName'],
						'assigned' => 1 
					);

                    $this->db->where('id', $inputData['drId']);
	          	    $this->db->update('abq_dr', $updatedData);

	          	    $description = 'Assigned to '. $loginData['loginName']. ' Succesfully';    

		            $this->onSaveSummaryLogsData($loginData, $inputData['drId'],'Field Agent Assigned', $description);


	          } else if($loginData['loginAccessLevel'] == '3') {

			          $this->db->select('abq_dr.assign_to, abq_dr.assign_to_name, abq_dr.status');
				      $this->db->from('abq_dr');
		              $this->db->where('abq_dr.id', $inputData['drId']);
		              $this->db->where('abq_dr.del','0');
		              $leadData = $this->db->get()->row_array();

		              $leadPreviousAssignTo = $leadData['assign_to'];
		              $leadPreviousAssignName = $leadData['assign_to_name'];

			    	  if(isset($inputData['fieldAgentId']) && $inputData['fieldAgentId'] && ($leadPreviousAssignTo != $inputData['fieldAgentId'])) {

			         	     $this->db->select('abq_user.id, abq_user.name');
					         $this->db->from('abq_user');
			                 $this->db->where('abq_user.id', $inputData['fieldAgentId']);
			                 $this->db->where('abq_user.del','0');
			                 $fieldAgentData = $this->db->get()->row_array();

			             	  $updatedData = array(
			                      'assign_to' => $fieldAgentData['id'],
			                      'assign_to_name' => $fieldAgentData['name'],
				             	  'assigned' => 1,
				             	  'last_activity_by' => $loginData['loginId'],
				             	  'last_activity_by_name' => $loginData['loginName'],
				             	  'last_activity_type' => 'Field Agent Assigned',
				             	  'last_activity_remark' => 'Field Agent Assigned to '. $fieldAgentData['name']. ' Succesfully',
			                  );

			                  $this->db->where('id', $inputData['drId']);
			                  $this->db->update('abq_dr', $updatedData);

			                  if($leadPreviousAssignName) {
                                 
                                  $description = 'Lead Field Agent Updated From '. $leadPreviousAssignName . ' to '. $fieldAgentData['name']. ' Succesfully';

			                  } else {

			                  	   $description = 'Field Agent '. $fieldAgentData['name']. ' Assigned Succesfully';
			                  }
			                    
			                  $this->onSaveSummaryLogsData($loginData, $inputData['drId'],'Assigned', $description);
			          }

			          $loggedUserRow = array(
                         
                          'userId' => $loginData['loginId'],
                          'userName' => $loginData['loginName']
			          );

			          array_push($inputData['insideSalesSelectedData'], $loggedUserRow);

			          $assignedNamesForLog = '';

		              foreach ($inputData['insideSalesSelectedData'] as $key => $row) {

	               	       $this->db->select('abq_dr_inside_assign.id');
					       $this->db->from('abq_dr_inside_assign');
			               $this->db->where('abq_dr_inside_assign.user_id', $row['userId']);
			               $this->db->where('abq_dr_inside_assign.user_role', 3);
			               $this->db->where('abq_dr_inside_assign.del','0');
			               $insideSaleExist = $this->db->get()->row_array();

			               if(!isset($insideSaleExist['id']) || !$insideSaleExist['id'] ) {

			               	    $this->db->select('abq_user.name, abq_user.access_level');
						        $this->db->from('abq_user');
				                $this->db->where('abq_user.id', $row['userId']);
				                $this->db->where('abq_user.del','0');
				                $userData = $this->db->get()->row_array();

			                    $updatedData = array(

			                 	   	   'date_created' => $this->dateData['dateTimeCreated'],
			                 	   	   'created_by' => $loginData['loginId'],
			                 	   	   'created_by_name' => $loginData['loginName'],
			                 	   	   'dr_id' => $inputData['drId'],
			                 	   	   'dr_name' => $inputData['drName'],
			                 	   	   'user_id' => $row['userId'],
			                 	   	   'user_name' => $userData['name'],
			                 	   	   'user_role' => $userData['access_level']
			         	        );
			          
			         	        $this->db->insert('abq_dr_inside_assign', $updatedData);

			         	        if($assignedNamesForLog) {

			         	            $assignedNamesForLog .= ', ' .$userData['name'];
			         	        } else {

			         	            $assignedNamesForLog = $userData['name'];
			         	        }
			               }
		              }


                      if($assignedNamesForLog) {

                      	  $description = 'Assigned To '.$assignedNamesForLog. ' Succesfully';   
  
		                  $this->onSaveSummaryLogsData($loginData, $inputData['drId'],'Inside Sales Agent Assigned', $description);
                      }
			   }


        } else {

               $this->onReturnErrorMessage();
        }
    }


    public function onUpdatedLeadContactData() {

    	$_POST = json_decode(file_get_contents('php://input'), true);

        $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';

		if(isset($loginData['loginType']) && isset($loginData['loginId']) && $loginData['loginType'] && $loginData['loginId'] )  {

	          $inputData = $_POST;

	          if($inputData['contactName']) {

          	       $this->db->select('abq_dr_contact.id');
		           $this->db->from('abq_dr_contact');
                   $this->db->where('abq_dr_contact.dr_id', $inputData['drId']);
                   $this->db->where('abq_dr_contact.mobile', $inputData['contactMobile']);
                   $this->db->where('abq_dr_contact.del','0');
                   $contactData = $this->db->get()->row_array();

                   if(!isset($contactData['id']) || !$contactData['id']) {

                     	   $updatedData = array(
                             
	                             'date_created' => $this->dateData['dateTimeCreated'],
	                             'created_by' => $loginData['loginId'],
	                             'dr_id' => $inputData['drId'],
	                             'name' => $inputData['contactName'],
	                             'email' => $inputData['contactEmail'],
	                             'designation' => $inputData['contactDesignation'],
	                             'mobile' => $inputData['contactMobile'],
						  );
			          	  
			          	  $this->db->insert('abq_dr_contact', $updatedData);

			          	  $description = 'New Contact Added Successfully!';    
	                      $this->onSaveSummaryLogsData($loginData, $inputData['drId'],'Contact Added', $description);
                   }
                  
	          }


        } else {

               $this->onReturnErrorMessage();
        }
    }


    public function onGetLeadDataForAutoFillData() {

    	  $_POST = json_decode(file_get_contents('php://input'), true);

		  $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';

		  if(isset($loginData['loginType']) && isset($loginData['loginId']) && $loginData['loginType'] && $loginData['loginId'] )  {

		  	  $inputData = $_POST;

			  $this->db->select('abq_dr.*');
		      $this->db->from('abq_dr');
              $this->db->where('abq_dr.id', $inputData['drId']);
              $this->db->where('abq_dr.del','0');
              $leadData = $this->db->get()->row_array();

              $leadData['contact_mobile_no'] = (int)$leadData['contact_mobile_no'];
              $leadData['secondary_mobile_no'] = (int)$leadData['secondary_mobile_no'];

              if($leadData['assign_to'] && $leadData['assign_to'] != '0') {

              	   $this->db->select('abq_user.contact_01');
			       $this->db->from('abq_user');
	               $this->db->where('abq_user.id', $leadData['assign_to']);
	               $this->db->where('abq_user.del','0');
	               $fieldAgentData = $this->db->get()->row_array();

	               if(isset($fieldAgentData['id']) && $fieldAgentData['id']) {

	               	   $leadData['assign_to_name'] = $leadData['assign_to_name'] . ' - ' . $fieldAgentData['contact_01'];
	               }

              }

              $this->db->select('abq_dr_inside_assign.*');
		      $this->db->from('abq_dr_inside_assign');
              $this->db->where('abq_dr_inside_assign.dr_id', $leadData['id']);
              $this->db->where('abq_dr_inside_assign.user_role', 3);
              $this->db->where('abq_dr_inside_assign.del','0');
              $insideSalesData = $this->db->get()->result_array();

              foreach ($insideSalesData as $key => $row) {

          	       $this->db->select('abq_user.contact_01');
			       $this->db->from('abq_user');
	               $this->db->where('abq_user.id', $row['user_id']);
	               $this->db->where('abq_user.del','0');
	               $userData = $this->db->get()->row_array();

	               $insideSalesData[$key]['mobile'] = $userData['contact_01'];   
              }

              $result = array(
                   
                    'leadData' => $leadData,
                    'insideSalesData' => $insideSalesData
              );

              echo json_encode($result);

          } else {


          	  $this->onReturnErrorMessage();

          }
    }


    public function onCloseLeadData() {

            $_POST = json_decode(file_get_contents('php://input'), true);
            
            $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';

			if(isset($loginData['loginType']) && isset($loginData['loginId']) && $loginData['loginType'] && $loginData['loginId'])  {

	             $inputData = $_POST;

	             $updatedData = array(

	             	 'status' => 'Win',
	             	 'status_on' => $this->dateData['dateTimeCreated'],
	             	 'status_by' => $loginData['loginId'],
	             	 'status_reason' => '',
	             	 'last_activity_by' => $loginData['loginId'],
	             	 'last_activity_by_name' => $loginData['loginName'],
	             	 'last_activity_type' => 'Status Updated',
	             	 'last_activity_remark' => 'Status Updated To Win!',
	             );

	             $this->db->where('id', $inputData['drId']);
	             $this->db->update('abq_dr', $updatedData);

	             $description = 'Status Updated To Win!';
                 $this->onSaveSummaryLogsData($loginData, $inputData['drId'], 'Status Updated',$description);

	             $result = array(

	             	 'status' => 'success',
	             	 'statusMessage' => ''
	             );

	             echo json_encode($result);


	        } else {

	        	 $this->onReturnErrorMessage();
	        }
    }


    public function onGetSearchLeadFromAllTypesData() {

			$searchData = $_GET['searchData'];

			$loginId = $_GET['loginId'];
			$organisationId = $_GET['organisationId'];
			$typeId = isset($_GET['typeId']) && $_GET['typeId'] ? $_GET['typeId'] : '';

			$assignedUserIds = $this->onGetAssignedUserIdsData($loginId, $organisationId, '');

		    if(COUNT($assignedUserIds) == 0) {
		        $assignedUserIds = [0];
            }

		    $assignedDrIds = $this->onGetAssignedDrIdData($assignedUserIds, $organisationId);

            $assignedDrIds = $assignedDrIds['customerIds'];

            if(COUNT($assignedDrIds) == 0) {
          	    $assignedDrIds = [0];
            }


            $drMultiSplitDrArray = array_chunk($assignedDrIds, 500, true);

            $drData = array();

            foreach ($drMultiSplitDrArray as $splitKey => $splitDrArray) {

            	    $this->db->select('abq_dr.*');
			        $this->db->from('abq_dr');
				    $this->db->where('abq_dr.del','0');
		            $this->db->where('abq_dr.id IN ('.implode(",",$splitDrArray).')');

		            if($typeId) {
				       $this->db->where('abq_dr.type_id', $typeId);
		            }

			        $this->db->group_start();

				        $this->db->like('abq_dr.dr_name', $searchData);
				        $this->db->or_like('abq_dr.contact_name', $searchData);
				        $this->db->or_like('abq_dr.contact_mobile_no', $searchData);
				        $this->db->or_like('abq_dr.secondary_mobile_no', $searchData);

				    $this->db->group_end();

			        $resultData = $this->db->get()->result_array();

			        $drData = array_merge($drData, $resultData);
            }

			

	        $i = 0;
	        $searchList = array();

	        foreach ($drData as $key => $row) {

		    	  $searchList[$i] = $row;
		    	  $searchList[$i]['drId'] = $row['id'];

		    	  if($row['secondary_mobile_no']) {

					  $searchList[$i]['searchName'] = $row['dr_name'] .' - (' . $row['contact_mobile_no'] . ', ' . $row['secondary_mobile_no'] . ')';

		    	  } else {

					  $searchList[$i]['searchName'] = $row['dr_name'] . '- (' . $row['contact_mobile_no'] . ')';
		    	  }

				  $i++;
	        }


			echo json_encode(array('searchList' =>$searchList));
    }



    public function onReturnErrorMessage() {

    	    $resultData = array('status' => 'error', 'statusMessage' => 'You are not authorized to access this information!');

    	    echo json_encode($resultData);
    }
	
}

?>




