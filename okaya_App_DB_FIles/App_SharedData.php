<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');


header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Authorization, Content-Type, X-Auth-Token');

class App_SharedData extends MY_Controller
{
	public function __construct() {
		
		parent:: __construct();
		$this->load->helper("url");
		$this->load->library("pagination");
		$this->load->database();

		ini_set("pcre.backtrack_limit", "100000");
        ini_set("pcre.recursion_limit", "100000");

		$this->dateData = array('dateCreated' => date('Y-m-d'), 'dateTimeCreated' => date('Y-m-d H:i:s'));
	}


	public function onGetAssignedUserIdsData($userId, $organisationId, $type) {

		   $this->db->select('abq_organization.*');
		   $this->db->from('abq_organization');
		   $this->db->where('abq_organization.id', $organisationId);
		   $this->db->where('abq_organization.del', 0);
		   $organisationData = $this->db->get()->row_array();

		   $organisationName = strtolower($organisationData['name']) . '_org';

           $this->db->select('user_id');
		   $this->db->from('abq_user_assign');
		   $this->db->where('assign_to', $userId);
		   $this->db->where('del', 0);
		   $this->db->where($organisationName, 1);
		   $userAssignedData = $this->db->get()->result_array();

           $userIds = array();

           array_push($userIds, $userId);
		   foreach ($userAssignedData as $key => $row) {
		   	   array_push($userIds, $row['user_id']);
		   }

		   return $userIds;
	}


	public function onGetAssignedDrIdData($userIds, $organisationId) {

		   $this->db->select('abq_organization.*');
		   $this->db->from('abq_organization');
		   $this->db->where('abq_organization.id', $organisationId);
		   $this->db->where('abq_organization.del', 0);
		   $organisationData = $this->db->get()->row_array();

		   $organisationName = strtolower($organisationData['name']) . '_org';

		   $this->db->select('id as dr_id, type_id, status, dr_name');
		   $this->db->from('abq_dr');

           $this->db->group_start();

		       $this->db->where('assign_to IN ('.implode(",",$userIds).')');

		   $this->db->group_end();
		   $this->db->where('del', 0);
		   $this->db->where($organisationName, 1);

		   $assignData = $this->db->get()->result_array();


		   $this->db->select('dr_id, type_id, status, dr_name');
		   $this->db->from('abq_dr_inside_assign');

		   $this->db->group_start();

		       $this->db->where('user_id IN ('.implode(",",$userIds).')');

		   $this->db->group_end();

		   $this->db->where('del', 0);

		   $this->db->where($organisationName, 1);
		   $insideUserDrAssign = $this->db->get()->result_array();


		   $drAllData = array_unique(array_merge($assignData, $insideUserDrAssign), SORT_REGULAR);
		   $customerIds = array_column($drAllData, 'dr_id');

		    return array(

			   	   'drAllData' => $drAllData,
			   	   'customerIds' => $customerIds
		    );
	}



    public function onCheckIdExistInArray($array, $key, $val) {
		
	    foreach ($array as $item)
	        if (isset($item[$key]) && $item[$key] == $val)
	            return true;
	    return false;
    }



	public function getCheckInData() {

		$_POST = json_decode(file_get_contents('php://input'), true);

		$loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';
		$drId = isset($_POST['drId']) && $_POST['drId']  ? $_POST['drId'] : '';


		if(isset($loginData['loginType']) && isset($loginData['loginId']) && $loginData['loginType'] && $loginData['loginId'] )  {

			   $inputData = $_POST;

			   if(!isset($inputData['currentActiveTab']) || !$inputData['currentActiveTab']) {
			   	   $inputData['currentActiveTab'] = '';
			   }

               $userIds = $this->onGetAssignedUserIdsData($loginData['loginId'], $loginData['loginOrganisationId'],  $inputData['currentActiveTab']);


               if(COUNT($userIds) == 0) {
			        $userIds = [0];
	           }

	           if($drId) {

	           	   $assignedDrIds[] = $drId;

	           } else {


	               $assignedDrIds = $this->onGetAssignedDrIdData($userIds, $loginData['loginOrganisationId']);

	               $assignedDrIds = $assignedDrIds['customerIds'];
	           }


	           if(COUNT($assignedDrIds) == 0) {
			        $assignedDrIds = [0];
	           }

               $drMultiSplitDrArray = array_chunk($assignedDrIds, 500, true);

               $checkInData = array();

               foreach ($drMultiSplitDrArray as $splitKey => $splitDrArray) {

               	   $this->db->select('abq_dr_activity.*');
			       $this->db->from('abq_dr_activity');

			       if($inputData['currentActiveTab'] == 1) {
			          $this->db->where('abq_dr_activity.created_by IN ('.$loginData['loginId'].')');
			       } 

			       if($inputData['currentActiveTab'] == 2) {

			       	  if (($key = array_search($loginData['loginId'], $userIds)) !== false) {

						    array_splice($userIds, $key, 1);
					  }

			          $this->db->where('abq_dr_activity.created_by IN ('.implode(",",$userIds).')');
			       }

			       $this->db->where('abq_dr_activity.dr_id IN ('.implode(",",$splitDrArray).')');
	               $this->db->where('abq_dr_activity.del','0');

	               if(isset($inputData['drId']) && $inputData['drId']) {
	                   $this->db->where('abq_dr_activity.dr_id', $inputData['drId']);
	               }

	               if(isset($inputData['checkInDate']) && $inputData['checkInDate']) {

	                   $this->db->where('DATE(abq_dr_activity.date_created)', $inputData['checkInDate']);
	               }

	               if(isset($inputData['searchData']) && $inputData['searchData']) {

	                     $this->db->group_start();

	  	                   $this->db->like('abq_dr_activity.created_by_name', $inputData['searchData']);

	  	                   $this->db->or_like('abq_dr_activity.dr_name', $inputData['searchData']);

	  	                   $this->db->or_like('abq_dr_activity.mobile', $inputData['searchData']);

	  	                   $this->db->or_like('abq_dr_activity.dr_type_name', $inputData['searchData']);

	  	                 $this->db->group_end();
				   }

			       $this->db->order_by('abq_dr_activity.id', 'DESC');
						       
	               $resultData = $this->db->get()->result_array();

	               $checkInData = array_merge($checkInData, $resultData);

	               if(COUNT($checkInData) >= 50) {
	               	   break;
	               }
               }


               foreach ($checkInData as $key => $row) {
               	
               	      $checkInDateCreate = date_create($row['visit_start']);
               	      $checkInData[$key]['checkInDateInFormat'] = date_format($checkInDateCreate, 'd M Y');

               	      $checkInTimeCreate = date_create($row['visit_start']);
               	      $checkInData[$key]['checkInTimeInFormat'] = date_format($checkInTimeCreate, 'H:i A');

               	      $checkOutTimeCreate = date_create($row['visit_end']);
               	      $checkInData[$key]['checkOutTimeInFormat'] = date_format($checkOutTimeCreate, 'H:i A');

                      $this->db->select('abq_dr.street, abq_dr.state_name, abq_dr.district_name, abq_dr.city, abq_dr.pincode');
				      $this->db->from('abq_dr');
		              $this->db->where('abq_dr.id', $row['dr_id']);
		              $this->db->where('abq_dr.del','0');
		              $drData = $this->db->get()->row_array();

		              $checkInData[$key]['street'] = $drData['street'];
		              $checkInData[$key]['state_name'] = $drData['state_name'];
		              $checkInData[$key]['district_name'] = $drData['district_name'];
		              $checkInData[$key]['city'] = $drData['city'];
		              $checkInData[$key]['pincode'] = $drData['pincode'];
                }

                $this->db->select('abq_dr_activity.*');
		        $this->db->from('abq_dr_activity');
                $this->db->where('abq_dr_activity.created_by', $loginData['loginId']);
                $this->db->where('abq_dr_activity.activity_type', 'Meeting');
                $this->db->where('abq_dr_activity.del','0');
                $this->db->order_by('abq_dr_activity.id', 'DESC');
                $this->db->limit(1);
                $lastActivityData = $this->db->get()->row_array();

	            if(strtotime($lastActivityData['visit_start']) > strtotime($lastActivityData['visit_end']) ) {

		                $canNewMeetingStart = 'No';
		                $activityId = $lastActivityData['id'];
		                $drId = $lastActivityData['dr_id'];

		                if($lastActivityData['dr_id'] == '0') {

		                	  $drName = $lastActivityData['other_name'];

		                } else {

		                	  $drName = $lastActivityData['dr_name'];
		                }

	           } else {

		                $canNewMeetingStart = 'Yes';
		                $activityId = '';
		                $drName = '';
		                $drId = '';
	           }

	           $result = array(

                	 'checkInData' => $checkInData,
                	 'canNewMeetingStart' => $canNewMeetingStart,
                	 'activityId' => $activityId,
                	 'drName' => $drName,
                	 'drId' => $drId,
                	 'userIds' => $userIds
               );

               if(isset($inputData['targetPage']) && $inputData['targetPage'] == 'List') {

                    echo json_encode($result);

               } else {

               	   return $result;
               }


		} else {

			 $this->onReturnErrorMessage();
		}
	}


    public function onGetOrderData() {

        $_POST = json_decode(file_get_contents('php://input'), true);

        $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';
		$drId = isset($_POST['drId']) && $_POST['drId']  ? $_POST['drId'] : '';

		if(isset($loginData['loginType']) && isset($loginData['loginId']) && $loginData['loginType'] && $loginData['loginId'] )  {

			   $inputData = $_POST;

			   if(!isset($inputData['currentActiveTab']) || !$inputData['currentActiveTab']) {
			   	   $inputData['currentActiveTab'] = '';
			   }

               $userIds = $this->onGetAssignedUserIdsData($loginData['loginId'], $loginData['loginOrganisationId'],  $inputData['currentActiveTab']);

               if(COUNT($userIds) == 0) {
			         $userIds = [0];
	           }

	           if($drId) {

	           	    $assignedDrIds[] = $drId;

	           } else {

	           	    $assignedDrIds = $this->onGetAssignedDrIdData($userIds, $loginData['loginOrganisationId']);

                    $assignedDrIds = $assignedDrIds['customerIds'];
	           }


	           if(COUNT($assignedDrIds) == 0) {
			         $assignedDrIds = [0];
	           }

	           $drMultiSplitDrArray = array_chunk($assignedDrIds, 500, true);

               $orderData = array();

               foreach ($drMultiSplitDrArray as $splitKey => $splitDrArray) {

	               $this->db->select('abq_dr_order.*');
			       $this->db->from('abq_dr_order');

			       if($inputData['currentActiveTab'] == 1) {
			           $this->db->where('abq_dr_order.created_by IN ('.$loginData['loginId'].')');
			       } 

			       if($inputData['currentActiveTab'] == 2) {

			       	   if (($key = array_search($loginData['loginId'], $userIds)) !== false) {

						    array_splice($userIds, $key, 1);
					   }

			           $this->db->where('abq_dr_order.created_by IN ('.implode(",",$userIds).')');
			       }

			       $this->db->where('abq_dr_order.dr_id IN ('.implode(",",$splitDrArray).')');
	               $this->db->where('abq_dr_order.del','0');

	               if(isset($inputData['drId']) && $inputData['drId']) {
	                   $this->db->where('abq_dr_order.dr_id', $inputData['drId']);
	               }

	               if(isset($inputData['orderId']) && $inputData['orderId']) {
	                   $this->db->where('abq_dr_order.id', $inputData['orderId']);
	               }

	               if(isset($inputData['searchData']) && $inputData['searchData']) {

	                     $this->db->group_start();

	  	                   $this->db->like('abq_dr_order.created_by_name', $inputData['searchData']);

	  	                   $this->db->or_like('abq_dr_order.dr_name', $inputData['searchData']);

	  	                   $this->db->or_like('abq_dr_order.dr_type_name', $inputData['searchData']);

	  	                   $this->db->or_like('abq_dr_order.order_status', $inputData['searchData']);

	  	                 $this->db->group_end();
				   }

			       $this->db->order_by('abq_dr_order.id', 'DESC');
   
                   $resultData = $this->db->get()->result_array();


                   $checkInData = array_merge($orderData, $resultData);

	               if(COUNT($orderData) >= 50) {
	               	   break;
	               }
               }

               foreach ($orderData as $key => $row) {

               	   $dateCreated = date_create($row['date_created']);

               	   $orderData[$key]['dateCreatedInFormat'] = date_format($dateCreated, 'd M Y');

                  $this->db->select('abq_dr.*');
			      $this->db->from('abq_dr');
	              $this->db->where('abq_dr.id', $row['dr_id']);
	              $this->db->where('abq_dr.del','0');
	              $drData = $this->db->get()->row_array();

	              $orderData[$key]['dr_name'] = $drData['dr_name'];
	              $orderData[$key]['contact_name'] = $drData['contact_name'];
	              $orderData[$key]['contact_mobile_no'] = $drData['contact_mobile_no'];
	              $orderData[$key]['email'] = $drData['email'];
	              $orderData[$key]['type_id'] = $drData['type_id'];
	              $orderData[$key]['type_name'] = $drData['type_name'];

	              $orderData[$key]['street'] = $drData['street'];
	              $orderData[$key]['state_name'] = $drData['state_name'];
	              $orderData[$key]['district_name'] = $drData['district_name'];
	              $orderData[$key]['city'] = $drData['city'];
	              $orderData[$key]['pincode'] = $drData['pincode'];


	              $this->db->select('abq_dr.*');
			      $this->db->from('abq_dr');
	              $this->db->where('abq_dr.id', $row['delivery_from']);
	              $this->db->where('abq_dr.del','0');
	              $deliveryData = $this->db->get()->row_array();

	              $orderData[$key]['deliveryFromName'] = $deliveryData['dr_name'];
	              $orderData[$key]['deliveryFromMobile'] = $deliveryData['contact_mobile_no'];
	              $orderData[$key]['deliveryFromType'] = $deliveryData['type_name'];

	              $this->db->select('abq_dr_order_item.*');
			      $this->db->from('abq_dr_order_item');
	              $this->db->where('abq_dr_order_item.order_id', $row['id']);
	              $this->db->where('abq_dr_order_item.del','0');
	              $itemData = $this->db->get()->result_array();

	              $orderData[$key]['itemData'] = $itemData;
               }

               if(isset($inputData['targetPage']) && $inputData['targetPage'] == 'List') {
                   
                    $result = array(

                    	 'orderData' => $orderData
                    );

                    echo json_encode($result, JSON_NUMERIC_CHECK);

               } else {

               	      return $orderData;
               }


		} else {

			 $this->onReturnErrorMessage();
		}

 	}


	public function onGetQuotationData() {

        $_POST = json_decode(file_get_contents('php://input'), true);

        $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';

		if(isset($loginData['loginType']) && isset($loginData['loginId']) && $loginData['loginType'] && $loginData['loginId'] )  {

			   $inputData = $_POST;

               $userIds = $this->onGetAssignedUserIdsData($loginData['loginId'], $loginData['loginOrganisationId'], '');

               if(COUNT($userIds) == 0) {
			        $userIds = [0];
	           }

               $this->db->select('abq_dr_quotation.*');
		       $this->db->from('abq_dr_quotation');
               $this->db->where_in('abq_dr_quotation.created_by', $userIds);
               $this->db->where('abq_dr_quotation.del','0');

               if(isset($inputData['drId']) && $inputData['drId']) {
                   $this->db->where('abq_dr_quotation.dr_id', $inputData['drId']);
               }

               if(isset($inputData['quotationId']) && $inputData['quotationId']) {
                   $this->db->where('abq_dr_quotation.id', $inputData['quotationId']);
               }

               if(isset($inputData['searchData']) && $inputData['searchData']) {

                     $this->db->group_start();

  	                   $this->db->like('abq_dr_quotation.created_by_name', $inputData['searchData']);

  	                   $this->db->or_like('abq_dr_quotation.dr_name', $inputData['searchData']);

  	                   $this->db->or_like('abq_dr_quotation.dr_type_name', $inputData['searchData']);

  	                   $this->db->or_like('abq_dr_order.quotation_status', $inputData['searchData']);

  	                 $this->db->group_end();
			   }

			   $this->db->order_by('abq_dr_quotation.id', 'DESC');


               $newDB = clone $this->db;

			   $quotationCount = $newDB->get()->num_rows();

			   if(isset($inputData['pageLimit']) && $inputData['pageLimit']) {

			       $this->db->limit($inputData['pageLimit'], ($inputData['start'] - 1) * $inputData['pageLimit']);
			   }
					       
               $quotationData = $this->db->get()->result_array();

               foreach ($quotationData as $key => $row) {

               	   $dateCreated = date_create($row['date_created']);

               	   $quotationData[$key]['dateCreatedInFormat'] = date_format($dateCreated, 'd M Y');


           	      $this->db->select('abq_dr.*');
			      $this->db->from('abq_dr');
	              $this->db->where('abq_dr.id', $row['dr_id']);
	              $this->db->where('abq_dr.del','0');
	              $drData = $this->db->get()->row_array();

	              $quotationData[$key]['street'] = $drData['street'];
	              $quotationData[$key]['state_name'] = $drData['state_name'];
	              $quotationData[$key]['district_name'] = $drData['district_name'];
	              $quotationData[$key]['city'] = $drData['city'];
	              $quotationData[$key]['pincode'] = $drData['pincode'];

	               $this->db->select('abq_dr_quotation_item.*');
			       $this->db->from('abq_dr_quotation_item');
	               $this->db->where('abq_dr_quotation_item.quotation_id', $row['id']);
	               $this->db->where('abq_dr_quotation_item.del','0');
	               $itemData = $this->db->get()->result_array();

	               $quotationData[$key]['itemData'] = $itemData;
               }

               if(isset($inputData['targetPage']) && $inputData['targetPage'] == 'List') {
                   
                    $result = array(

                    	 'quotationData' => $quotationData,
                    	 'quotationCount' => $quotationCount
                    );

                    echo json_encode($result, JSON_NUMERIC_CHECK);

               } else {

               	      return $quotationData;
               }


		} else {

			 $this->onReturnErrorMessage();
		}

 	}


	public function onGetRequirementData() {

		$_POST = json_decode(file_get_contents('php://input'), true);

        $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';
		$drId = isset($_POST['drId']) && $_POST['drId']  ? $_POST['drId'] : '';

		if(isset($loginData['loginType']) && isset($loginData['loginId']) && $loginData['loginType'] && $loginData['loginId'] )  {

			   $inputData = $_POST;

               $userIds = $this->onGetAssignedUserIdsData($loginData['loginId'], $loginData['loginOrganisationId'], '');

               if(COUNT($userIds) == 0) {
			         $userIds = [0];
	           }

               // $assignedDrIds = $this->onGetAssignedDrIdData($userIds, $loginData['loginOrganisationId']);

               // $assignedDrIds = $assignedDrIds['customerIds'];

               $assignedDrIds[] = $drId;

	           if(COUNT($assignedDrIds) == 0) {
			         $assignedDrIds = [0];
	           }

               $this->db->select('abq_dr_requirement.*');
		       $this->db->from('abq_dr_requirement');
               $this->db->where_in('abq_dr_requirement.created_by', $userIds);
               $this->db->where_in('abq_dr_requirement.dr_id', $assignedDrIds);
               $this->db->where('abq_dr_requirement.del','0');

               if(isset($inputData['drId']) && $inputData['drId']) {
                   $this->db->where('abq_dr_requirement.dr_id', $inputData['drId']);
               }

               if(isset($inputData['searchData']) && $inputData['searchData']) {

                     $this->db->group_start();

  	                   $this->db->like('abq_dr_requirement.created_by_name', $inputData['searchData']);

  	                   $this->db->or_like('abq_dr_requirement.dr_name', $inputData['searchData']);

  	                   $this->db->or_like('abq_dr_requirement.dr_type_name', $inputData['searchData']);

  	                   $this->db->or_like('abq_dr_requirement.category', $inputData['searchData']);

  	                   $this->db->or_like('abq_dr_requirement.product_name', $inputData['searchData']);

  	                   $this->db->or_like('abq_dr_requirement.product_code', $inputData['searchData']);


  	                 $this->db->group_end();
			   }

			   $this->db->order_by('abq_dr_requirement.id', 'DESC');


               $newDB = clone $this->db;

			   $requirementCount = $newDB->get()->num_rows();

			   if(isset($inputData['pageLimit']) && $inputData['pageLimit']) {

			       $this->db->limit($inputData['pageLimit'], ($inputData['start'] - 1) * $inputData['pageLimit']);
			   }
					       
               $requirementData = $this->db->get()->result_array();

               foreach ($requirementData as $key => $row) {

               	   $dateCreate = date_create($row['date_created']);

               	   $requirementData[$key]['dateCreatedInFormat'] = date_format($dateCreate, 'd M Y');
               }

               if(isset($inputData['targetPage']) && $inputData['targetPage'] == 'List') {
                   
                    $result = array(

                    	 'requirementData' => $requirementData,
                    	 'requirementCount' => $requirementCount
                    );

                    echo json_encode($result);

               } else {

               	      return $requirementData;
               }


		} else {

			 $this->onReturnErrorMessage();
		}

	}


	public function getContactData() {

        $_POST = json_decode(file_get_contents('php://input'), true);

		$loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';

	 	if(isset($loginData['loginType']) && isset($loginData['loginId']) && $loginData['loginType'] && $loginData['loginId'] )  {

	 		  $inputData = $_POST;

	 		  $drId = $_POST['drId'];

	 		  $this->db->select('abq_dr_contact.*');
		      $this->db->from('abq_dr_contact');
              $this->db->where('abq_dr_contact.dr_id', $drId);
              $this->db->where('abq_dr_contact.del','0');
              $contactData = $this->db->get()->result_array();

              return $contactData;

	 	} else {


	 		  $this->onReturnErrorMessage();
	 	}

	}


	public function onGetFollowUpData() {

        $_POST = json_decode(file_get_contents('php://input'), true);

        $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';
		$drId = isset($_POST['drId']) && $_POST['drId'] ? $_POST['drId'] : '';


		if(isset($loginData['loginType']) && isset($loginData['loginId']) && $loginData['loginType'] && $loginData['loginId'] )  {

               $inputData = $_POST;

               if(!isset($inputData['currentActiveTab']) || !$inputData['currentActiveTab']) {
			   	   $inputData['currentActiveTab'] = '';
			   }


               $userIds = $this->onGetAssignedUserIdsData($loginData['loginId'], $loginData['loginOrganisationId'], $inputData['currentActiveTab']);

               if(COUNT($userIds) == 0) {
			         $userIds = [0];
	           }

	           if($drId) {

                  $assignedDrIds[] = $drId;

	           } else {

	           	     $assignedDrIds = $this->onGetAssignedDrIdData($userIds, $loginData['loginOrganisationId']);

                     $assignedDrIds = $assignedDrIds['customerIds'];
	           }


	           if(COUNT($assignedDrIds) == 0) {
			         $assignedDrIds = [0];
	           }

	           $drMultiSplitDrArray = array_chunk($assignedDrIds, 500, true);

               $followUpData = array();

               foreach ($drMultiSplitDrArray as $splitKey => $splitDrArray) {

	               $this->db->select('abq_lead_followup.*');
			       $this->db->from('abq_lead_followup');

			       if($inputData['currentActiveTab'] == 1) {
			           $this->db->where('assign_to IN ('.$loginData['loginId'].')');
			       } 

			       if($inputData['currentActiveTab'] == 2) {

			       	   if (($key = array_search($loginData['loginId'], $userIds)) !== false) {

						    array_splice($userIds, $key, 1);
					   }

			           $this->db->where('assign_to IN ('.implode(",",$userIds).')');
			       }

		           $this->db->where('dr_id IN ('.implode(",",$splitDrArray).')');

	               $this->db->where('abq_lead_followup.del','0');
	               $this->db->where('abq_lead_followup.followup_done_by = "0" ');

	               if(isset($drId) && $drId) {
	                   $this->db->where('abq_lead_followup.dr_id', $inputData['drId']);
	               }


	               if(isset($inputData['followUpDate']) && $inputData['followUpDate']) {

	                   $this->db->where('abq_lead_followup.followup_date <=', $inputData['followUpDate']);
	               }

	               if(isset($inputData['searchData']) && $inputData['searchData']) {

	                     $this->db->group_start();

	  	                   $this->db->like('abq_lead_followup.created_by_name', $inputData['searchData']);

	  	                   $this->db->or_like('abq_lead_followup.dr_name', $inputData['searchData']);

	  	                   $this->db->or_like('abq_lead_followup.dr_type_name', $inputData['searchData']);

	  	                 $this->db->group_end();
				   }

				   $this->db->order_by('abq_lead_followup.id', 'DESC');
					       
                   $resultData = $this->db->get()->result_array();

	               $followUpData = array_merge($followUpData, $resultData);
               }

               foreach ($followUpData as $key => $row) {

                    $followUpDateCreate = date_create($row['followup_date']);
			        $followUpData[$key]['followUpDateInFormat'] = date_format($followUpDateCreate, 'd M Y');

                    $this->db->select('abq_dr.*');
			        $this->db->from('abq_dr');
	                $this->db->where('abq_dr.id', $row['dr_id']);
	                $this->db->where('abq_dr.del','0');
	                $drData = $this->db->get()->row_array();

	                $followUpData[$key]['street'] = $drData['street'];
	                $followUpData[$key]['state_name'] = $drData['state_name'];
	                $followUpData[$key]['district_name'] = $drData['district_name'];
	                $followUpData[$key]['city'] = $drData['city'];
	                $followUpData[$key]['pincode'] = $drData['pincode'];
               }


               if(isset($inputData['targetPage']) && $inputData['targetPage'] == 'List') {
                   
	                    $result = array(

	                    	 'followUpData' => $followUpData
	                    );

	                    echo json_encode($result);

               } else {

               	   return $followUpData;
               }


		} else {


			 $this->onReturnErrorMessage();
		}

	}


	public function getDrAllTypeData($doReturn) {

          $this->db->select('abq_dr_type.id, abq_dr_type.type');
		  $this->db->from('abq_dr_type');
          $this->db->where('abq_dr_type.del','0');
          $typeData = $this->db->get()->result_array(); 

          if($doReturn === true) {

          	  return $typeData;

          } else {


          	  $result = array(
                   
                   'allTypeData' => $typeData
          	  );

          	  echo json_encode($result);
          }
	}


	public function getAllCategoryData() {

          $this->db->select('abq_dr_category.id, abq_dr_category.name');
		  $this->db->from('abq_dr_category');
          $this->db->where('abq_dr_category.del','0');
          $categoryData = $this->db->get()->result_array(); 

          $result = array(
              'categoryData' => $categoryData
          );

          echo json_encode($result);
	}


	public function getDrAllStatusData($doReturn) {

          $this->db->select('abq_dr_status.name');
		  $this->db->from('abq_dr_status');
          $this->db->where('abq_dr_status.del','0');
          $this->db->where('abq_dr_status.name != "Lead Bank"');
          $allStatusData = $this->db->get()->result_array(); 

          if($doReturn === true) {

          	  return $allStatusData;

          } else {


          	  $result = array(
                   
                   'allStatusData' => $allStatusData
          	  );

          	  echo json_encode($result);
          }
	}



	public function getCartItemData () {

        $targetData = json_decode($_GET['targetArr'], true);

        $searchKey_str = '';

        if($targetData['type'] == 'fetchCategoryData') {

             if(isset($_GET['searchKey']) && $_GET['searchKey']) {
                  $searchKey_str = "abq_product_category.category LIKE '".$_GET['searchKey']."%' AND";
             }

             $start = 50*($_GET['pageNumber']-1);

             $data_select = $this->db->query("SELECT DISTINCT abq_product_category.`category`, abq_product_category.`category` as Value FROM abq_product_category WHERE ".$searchKey_str." abq_product_category.`del`='0' ORDER BY abq_product_category.`category` ASC")->result_array();

             $r1 = array();
             $i = 0;

             foreach ($data_select as $key => $result) {

             	 $r1[$i]['Key'] = $result['category'];
                 $r1[$i]['Value'] = $result['Value'];
                 $i++;
             	
             }

             $totalRecords = $this->db->query("SELECT DISTINCT abq_product_category.`category` FROM abq_product_category  WHERE ".$searchKey_str." abq_product_category.`del`='0'")->num_rows();
        }


        if($targetData['type'] == 'fetchSubCategoryData') {

             if(isset($_GET['searchKey']) && $_GET['searchKey']) {

                  $searchKey_str = "abq_product_sub_category.sub_category LIKE '".$_GET['searchKey']."%' AND";
             }

             $start = 50*($_GET['pageNumber']-1);

             $data_select = $this->db->query("SELECT DISTINCT abq_product_sub_category.`sub_category`, abq_product_sub_category.`sub_category` as Value FROM abq_product_sub_category WHERE ".$searchKey_str." abq_product_sub_category.category = '".$targetData['categoryName']."' AND abq_product_sub_category.`del`='0' ORDER BY abq_product_sub_category.`sub_category` ASC")->result_array();

             $r1 = array();
             $i = 0;

             foreach ($data_select as $key => $result) {
             	 
             	 $r1[$i]['Key'] = $result['sub_category'];
                 $r1[$i]['Value'] = $result['Value'];
                 $i++;
             }


             $totalRecords = $this->db->query("SELECT DISTINCT abq_product_sub_category.`sub_category` FROM abq_product_sub_category  WHERE ".$searchKey_str." abq_product_sub_category.category = '".$targetData['categoryName']."' AND abq_product_sub_category.`del`='0'")->num_rows();
        }


        if($targetData['type'] == 'fetchProductData') {

             if(isset($_GET['searchKey']) && $_GET['searchKey']) {

                  $searchKey_str = "(abq_product.product_name LIKE '%".$_GET['searchKey']."%' OR abq_product.product_code LIKE '%".$_GET['searchKey']."%') AND";
             }


             $data_select = $this->db->query("SELECT abq_product.`product_name`, abq_product.`id` as Value, product_code, category, sub_category, price, id as product_id  FROM abq_product WHERE ".$searchKey_str." abq_product.category = '".$targetData['categoryName']."' AND abq_product.sub_category = '".$targetData['subCategoryName']."' AND abq_product.`del`='0' ORDER BY abq_product.`product_name` ASC")->result_array();


             $r1 = array(); $i = 0;

             foreach ($data_select as $key => $result) {

                 $r1[$i]['Key'] = $result['product_name'].' - (' . $result['product_code'] . ')';

                 $r1[$i]['Value'] = $result['Value'];
                 $r1[$i]['product_code'] = $result['product_code'];
                 $r1[$i]['product_name'] = $result['product_name'];

                 $r1[$i]['price'] = $result['price'];
                 $r1[$i]['product_id'] = $result['product_id'];

                 $i++;
             }

             $totalRecords = COUNT($r1);

        }

        $result=array('Records' => $r1,'TotalRecords' => $totalRecords, 'test'=>$_GET);
        echo json_encode($result, JSON_NUMERIC_CHECK);

	}


	public function onGetSearchSelectData() {

       $targetData = json_decode($_GET['targetArr'], true);

       $searchKey_str = '';
       if($targetData['type'] == 'fetchStateData') {

             if(isset($_GET['searchKey']) && $_GET['searchKey']) {
                  $searchKey_str = "abq_postal_master.state_name LIKE '".$_GET['searchKey']."%' AND";
             }


             $data_select = $this->db->query("SELECT DISTINCT abq_postal_master.`state_name`, abq_postal_master.`state_name` as Value FROM abq_postal_master WHERE ".$searchKey_str." abq_postal_master.`del`='0' ORDER BY abq_postal_master.`state_name` ASC")->result_array();

             $r1 = array();
             $i = 0;

             foreach ($data_select as $key => $result) {

             	 $r1[$i]['Key'] = $result['state_name'];
                 $r1[$i]['Value'] = $result['Value'];
                 $i++;
             	
             }

             $totalRecords = $this->db->query("SELECT DISTINCT abq_postal_master.`state_name` FROM abq_postal_master  WHERE ".$searchKey_str." abq_postal_master.`del`='0'")->num_rows();
       }


       if($targetData['type'] == 'fetchDistrictData') {

             if(isset($_GET['searchKey']) && $_GET['searchKey']) {
                  $searchKey_str = "abq_postal_master.district_name LIKE '".$_GET['searchKey']."%' AND";
             }

             $data_select = $this->db->query("SELECT DISTINCT abq_postal_master.`district_name`, abq_postal_master.`district_name` as Value FROM abq_postal_master WHERE ".$searchKey_str." abq_postal_master.state_name = '".$targetData['state_name']."' AND abq_postal_master.`del`='0' ORDER BY abq_postal_master.`district_name` ASC")->result_array();

             $r1 = array();
             $i = 0;

             foreach ($data_select as $key => $result) {
             	 
             	 $r1[$i]['Key'] = $result['district_name'];
                 $r1[$i]['Value'] = $result['Value'];
                 $i++;
             }


             $totalRecords = $this->db->query("SELECT DISTINCT abq_postal_master.`district_name` FROM abq_postal_master  WHERE ".$searchKey_str." abq_postal_master.state_name = '".$targetData['state_name']."' AND abq_postal_master.`del`='0'")->num_rows();
       }


       if($targetData['type'] == 'fetchInsideSalesData') {

       	      $loginData = $targetData['loginData'];

              $searchKey_str = '';
              if(isset($_GET['searchKey']) && $_GET['searchKey']) {

                  $searchKey_str = "(abq_user.name LIKE '%".$_GET['searchKey']."%' OR abq_user.contact_01 LIKE '%".$_GET['searchKey']."%')";
              }

              $start = 50*($_GET['pageNumber']-1);

              $this->db->select('abq_user.name, abq_user.id as Value, abq_user.contact_01');
			  $this->db->from('abq_user');
			  $this->db->where('abq_user.del', '0');
			  $this->db->where('abq_user.access_level', '3');
			  $this->db->where('abq_user.id != '.$loginData['loginId'].'');

			  if($searchKey_str) {
			     $this->db->where($searchKey_str);
			  }

			  $this->db->order_by('abq_user.name', 'ASC');
			  $this->db->group_by('abq_user.id');
			  $this->db->limit(50, $start);
		      $r1 = $this->db->get()->result_array();

              $r1 = array();
              foreach ($r1 as $key => $row) {
             	  $r1[$key]['Key'] = $row['name'] . ' - (' . $row['contact_01'] . ')';
              }

              $this->db->select('abq_user.id');
			  $this->db->from('abq_user');
			  $this->db->where('abq_user.del', '0');
			  $this->db->where('abq_user.access_level', '3');
			  $this->db->where('abq_user.id != '.$loginData['loginId'].'');

			  if($searchKey_str) {
			      $this->db->where($searchKey_str);
			  }

			  $this->db->order_by('abq_user.name', 'ASC');
			  $this->db->group_by('abq_user.id');
		      $totalRecords = $this->db->get()->num_rows();
       }

       if($targetData['type'] == 'fetchFieldSalesData') {

              $searchKey_str = '';
              if(isset($_GET['searchKey']) && $_GET['searchKey']) {

                  $searchKey_str = "(abq_user.name LIKE '%".$_GET['searchKey']."%' OR abq_user.contact_01 LIKE '%".$_GET['searchKey']."%')";
              }

              $start = 50*($_GET['pageNumber']-1);

              $this->db->select('abq_user.name, abq_user.id as Value, abq_user.contact_01');
			  $this->db->from('abq_user');
			  $this->db->where('abq_user.del', '0');
			  $this->db->where('abq_user.access_level', '4');
			  $this->db->limit(50, $start);

			  if($searchKey_str) {
			     $this->db->where($searchKey_str);
			  }

			  $this->db->order_by('abq_user.name', 'ASC');
			  $this->db->group_by('abq_user.id');
		      $r1 = $this->db->get()->result_array();

              $r1 = array();
              foreach ($r1 as $key => $row) {
             	  $r1[$key]['Key'] = $row['name'] . ' - (' . $row['contact_01'] . ')';
              }

              $this->db->select('abq_user.id');
			  $this->db->from('abq_user');
			  $this->db->where('abq_user.del', '0');
			  $this->db->where('abq_user.access_level', '4');

			  if($searchKey_str) {
			     $this->db->where($searchKey_str);
			  }

			  $this->db->order_by('abq_user.name', 'ASC');
			  $this->db->group_by('abq_user.id');
		      $totalRecords = $this->db->get()->num_rows();
       }

       $result=array('Records' => $r1,'TotalRecords' => $totalRecords, 'test'=>$_GET);
       echo json_encode($result);

	}


	public function onGetDeliveryByTypeList() {

          $this->db->select('abq_dr_type.id, abq_dr_type.type');
		  $this->db->from('abq_dr_type');

		  $this->db->group_start();
		          $this->db->where('abq_dr_type.type','Distributor');
		          $this->db->or_where('abq_dr_type.type','Dealer');
		  $this->db->group_end();

          $this->db->where('abq_dr_type.del','0');
          $typeData = $this->db->get()->result_array(); 

          $result = array(
                   
              'typeData' => $typeData
      	  );

      	  echo json_encode($result);
	}


	public function onGetTypeListForOrderCreate() {

          $this->db->select('abq_dr_type.id, abq_dr_type.type');
		  $this->db->from('abq_dr_type');

		  $this->db->group_start();
		          $this->db->where('abq_dr_type.type != "Distributor"');
		          $this->db->where('abq_dr_type.type != "Dealer"');
		  $this->db->group_end();

          $this->db->where('abq_dr_type.del','0');
          $typeData = $this->db->get()->result_array(); 

          $result = array(
                   
              'typeData' => $typeData
      	  );

      	  echo json_encode($result);
	}


	public function onSaveSummaryLogsData($loginData, $drId, $type, $description) {

			$logData = array(
				'date_created' => $this->dateData['dateTimeCreated'],
				'created_by' => $loginData['loginId'],
				'created_by_name' => $loginData['loginName'],
				'created_by_type' => $loginData['loginType'],
				'dr_id' => $drId ? $drId : '',
				'description' => $description,
			);

			$this->db->insert('abq_dr_summary',$logData);

			$updatedData = array(
				'last_activity_on' => $this->dateData['dateTimeCreated'],
				'last_activity_by' => $loginData['loginId'],
				'last_activity_by_name' => $loginData['loginName'],
				'last_activity_type' => $type ? $type : '',
				'last_activity_remark' => $description ? $description : '',
			);

			$this->db->where('abq_dr.id',$drId);
			$this->db->update('abq_dr', $updatedData);
	}

	public function onGetActivityTypesHandler() {

		 $_POST = json_decode(file_get_contents('php://input'), true);

		 $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';

		 if(isset($loginData['loginType']) && isset($loginData['loginId']) && $loginData['loginType'] && $loginData['loginId'] )  {

		 	   $this->db->select('abq_followup_type.name');
			   $this->db->from('abq_followup_type');
			   $this->db->where('abq_followup_type.del', 0);
			   $typeList = $this->db->get()->result_array();

			   $result = array(

			   	   'status' => 'success',
			   	   'typeList' => $typeList
			   );

			   echo json_encode($result);

		 } else {

               $this->onReturnErrorMessage();

		 }
	}


	public function onUpdateTypeInInsideAssignData() {

		   $this->db->select('id, dr_id');
		   $this->db->from('abq_dr_inside_assign');
		   $this->db->where('del', '0');
		   $insideAssignData = $this->db->get()->result_array();


		   foreach ($insideAssignData as $key => $row) {

		   	     $this->db->select('id, type_id');
			     $this->db->from('abq_dr');
			     $this->db->where('id', $row['dr_id']);
			     $this->db->where('del', '0');
			     $drData = $this->db->get()->row_array();

			     $updatedData = array(

			     	 'type_id' => $drData['type_id']
			     );

			     $this->db->where('id', $row['id']);
			     $this->db->update('abq_dr_inside_assign', $updatedData);
		   }
	}


    public function onReturnErrorMessage() {

    	    $resultData = array('status' => 'error', 'statusMessage' => 'You are not authorized to access this information!');

    	    echo json_encode($resultData);
    }
	
}

?>




