<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Authorization, Content-Type, X-Auth-Token');

require_once('App_SharedData.php');

class App_Dashboard extends App_SharedData
{
	public function __construct() {
		
		parent:: __construct();
		$this->load->helper("url");
		$this->load->library("pagination");
		$this->load->database();
	}

	public function onGetDashboardData() {

		    $_POST = json_decode(file_get_contents('php://input'), true);

	        $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';

			if(isset($loginData['loginType']) && isset($loginData['loginId']) &&  $loginData['loginType'] &&  $loginData['loginId'])  {

				      $inputData = $_POST;

				      $assignedUserIds = $this->onGetAssignedUserIdsData($loginData['loginId'], $loginData['loginOrganisationId'], '');

				      if(COUNT($assignedUserIds) == 0) {
			          	  $assignedUserIds = [0];
			          }

			          $assignedDrIds = $this->onGetAssignedDrIdData($assignedUserIds, $loginData['loginOrganisationId']);

                      $assignedDrIds = $assignedDrIds['customerIds'];

			          if(COUNT($assignedDrIds) == 0) {
			          	  $assignedDrIds = [0];
			          }

				      $this->db->select('abq_dr_type.id, abq_dr_type.type');
					  $this->db->from('abq_dr_type');
					  $this->db->where('abq_dr_type.del','0');
					  $typeData = $this->db->get()->result_array();

                      $drCountData = array();

                      $drMultiSplitDrArray = array_chunk($assignedDrIds, 500, true);

					  foreach ($typeData as $key => $row) {

                           $typeCountData = 0;

	          	      	   foreach ($drMultiSplitDrArray as $splitKey => $splitDrArray) {

	          	      	  	   $this->db->select('abq_dr.id');
						       $this->db->from('abq_dr');
							   $this->db->where('abq_dr.id IN ('.implode(",",$splitDrArray).')');
							   $this->db->where('abq_dr.type_id', $row['id']);
							   $this->db->where('abq_dr.status', 'Win');
							   $this->db->where('abq_dr.del','0');
							   $resultCount = $this->db->get()->num_rows();

							   $typeCountData += $resultCount;
					  	   }

					  	   $typeRow = array(

	                           	  'typeId' => $row['id'],
	                           	  'typeName' => $row['type'],
	                           	  'typeStatus' => 'Win',
	                           	  'typeCount' => $typeCountData
	                        );

	                        array_push($drCountData, $typeRow);
					  }


                      $todayMeetingCount = 0;
                      $todayFollowUpCount = 0;
                      $todayQuotationCount = 0;

					  // foreach ($drMultiSplitDrArray as $splitKey => $splitDrArray) {

						  $this->db->select('abq_dr_activity.id');
						  $this->db->from('abq_dr_activity');
						  $this->db->where('abq_dr_activity.created_by IN ('.implode(",",$assignedUserIds).')');
					      // $this->db->where('abq_dr_activity.dr_id IN ('.implode(",",$splitDrArray).')');

						  $this->db->where('DATE(abq_dr_activity.date_created)', $this->dateData['dateCreated']);

						  $this->db->where('abq_dr_activity.del','0');
						  $meetingResultCount = $this->db->get()->num_rows();

						  $todayMeetingCount += $meetingResultCount;


						  $this->db->select('abq_lead_followup.id');
						  $this->db->from('abq_lead_followup');

						  $this->db->where('abq_lead_followup.assign_to IN ('.implode(",",$assignedUserIds).')');
					      // $this->db->where('abq_lead_followup.dr_id IN ('.implode(",",$splitDrArray).')');

						  $this->db->where('DATE(abq_lead_followup.followup_done_on)', $this->dateData['dateCreated']);

						  $this->db->where('abq_lead_followup.followup_done_by != "0"');
						  $this->db->where('abq_lead_followup.del','0');

						  $followUpResultCount = $this->db->get()->num_rows();

						  $todayFollowUpCount += $followUpResultCount;


						  $this->db->select('abq_dr_quotation.id');
						  $this->db->from('abq_dr_quotation');

						  $this->db->where('abq_dr_quotation.created_by IN ('.implode(",",$assignedUserIds).')');
					      // $this->db->where('abq_dr_quotation.dr_id IN ('.implode(",",$splitDrArray).')');

						  $this->db->where('DATE(abq_dr_quotation.date_created)', $this->dateData['dateCreated']);
						  $this->db->where('abq_dr_quotation.del','0');
						  $quotationResultCount = $this->db->get()->num_rows();

						  $todayQuotationCount += $quotationResultCount;
						  
				      // }


					  $outputData = array(

			      	   	  'status' => 'success',
			      	   	  'statusMessage' => '',
			      	   	  'drCountData' => $drCountData,
			      	   	  'todayMeetingCount' => $todayMeetingCount,
			      	   	  'todayFollowUpCount' => $todayFollowUpCount,
			      	   	  'todayQuotationCount' => $todayQuotationCount
	      	          );


			          echo json_encode($outputData);


	        } else {

                   $this->onReturnErrorMessage();
	        }
	}


	public function searchInArray($searchVal, $array, $colName) { 
  
        // Iterating over main array 
	    foreach ($array as $key => $row) { 
	  
		      if($row[$colName] == $searchVal) {

                    return $key;
		      }    
	    } 
	      
	    return null; 
    } 


	public function getAttendanceData() {

		    $_POST = json_decode(file_get_contents('php://input'), true);

	        $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';
               
            if(isset($loginData['loginId']) && isset($loginData['loginType']) && $loginData['loginId'] && $loginData['loginType']) {

            	    $inputData = $_POST;

                    $this->db->select('abq_attendance.*');
					$this->db->from('abq_attendance');
					$this->db->where('abq_attendance.user_id', $loginData['loginId']);

				    $this->db->like('abq_attendance.attend_date', $inputData['attendMonth']);

					$this->db->where('abq_attendance.del', 0);
				    $this->db->order_by('abq_attendance.id', 'DESC');

					$resultData = $this->db->get()->result_array();


                    $month =  date('m', strtotime($inputData['attendMonth'] . '-01'));
                    $year =  date('Y', strtotime($inputData['attendMonth'] . '-01'));

                    if(date('m') == $month) {

                        $monthDays = date('d');

                    } else {

				        $monthDays = cal_days_in_month(CAL_GREGORIAN,$month, $year);
                    }

				    $from = $inputData['attendMonth'] . '-01';
				    $to = $inputData['attendMonth'] . '-' . $monthDays;

					$begin = new DateTime( $from );
			        $end   = new DateTime( $to );

			        $attendData  = array();

			        for($i = $end; $i >= $begin; $i->modify('-1 day')) {

			            $dateToCheck = $i->format('Y-m-d');

			            $day = date('D', strtotime($dateToCheck));

			            $foundIndex = $this->searchInArray($dateToCheck, $resultData, 'attend_date');

                        if($foundIndex === null) {

                        	  $count = COUNT($attendData);

                        	  $attendDateCreate = date_create($dateToCheck);
							  $attendDateInFormat = date_format($attendDateCreate, 'd M');

							  if($day == 'Sun') {
							  	  $status = 'Holiday';
							  } else {
							  	 $status = 'Absent';
							  }

                              $attendData[$count] = array(
                                  
                                   'attend_Date' => $dateToCheck,
                                   'attendDateInFormat' => $attendDateInFormat,
                                   'attendStartTimeInFormat' => '',
                                   'attendStopTimeInFormat' => '',
                                   'day' => $day,
                                   'status' => $status
                              );

                        } else {

	                    	   $attendDateCreate = date_create($resultData[$foundIndex]['attend_date']);
							   $attendDateInFormat = date_format($attendDateCreate, 'd M');

							   $attendStartDateTime = $resultData[$foundIndex]['attend_date'] . ' ' . $resultData[$foundIndex]['start_time'];
							   $attendStartDateTimeCreate = date_create($attendStartDateTime);
							   $attendStartTimeInFormat = date_format($attendStartDateTimeCreate, 'H:i A');

		                       if($resultData[$foundIndex]['stop_time'] != '00:00:00') {

			                          $attendStopDateTime = $resultData[$foundIndex]['attend_date'] . ' ' . $resultData[$foundIndex]['stop_time'];

									  $attendStopDateTimeCreate = date_create($attendStopDateTime);

									  $attendStopTimeInFormat = date_format($attendStopDateTimeCreate, 'H:i A');

			                   } else {

			                         $attendStopTimeInFormat = '';
			                   }

			                   $attendIndex = COUNT($attendData);

                               $attendData[$attendIndex] = array(
                                   
                                   'attend_Date' => $dateToCheck,
                                   'attendDateInFormat' => $attendDateInFormat,
                                   'attendStartTimeInFormat' => $attendStartTimeInFormat,
                                   'attendStopTimeInFormat' => $attendStopTimeInFormat,
                                   'day' => $day,
                                   'status' => 'Present'
                               );

                        }
			        }
					

					$result = array(
						'attendanceData' => $attendData
					);

					echo json_encode($result);

            } else {

            	   $this->onReturnErrorMessage();
            }
    }



	public function getAttendanceStatus() {

		     $_POST = json_decode(file_get_contents('php://input'), true);

	         $inputData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';

	         if(isset($inputData['loginId']) && $inputData['loginId']) {
 
	                $this->db->select('abq_attendance.id as attend_id, abq_attendance.start_time, abq_attendance.stop_time');
					$this->db->from('abq_attendance');
					$this->db->where('abq_attendance.user_id', $inputData['loginId']);
					$this->db->where('DATE(abq_attendance.attend_date)', date('Y-m-d'));
					$this->db->where('abq_attendance.del', 0);
					$this->db->order_by('abq_attendance.id', 'DESC');

					$result = $this->db->get()->row_array();

					if(!isset($result['attend_id']) || !$result['attend_id']) {

                         $result = array();
                         $result['attend_id'] = '';
                         $result['start_time'] = '';
                         $result['stop_time'] = '';
					}

					if($result['stop_time'] == '00:00:00') {

						  $result['stop_time'] = '';
					}

					echo json_encode($result);

	         } else {

                    $this->onReturnErrorMessage();
	         }
    }


    public function startUserAttendance() {

    	    $_POST = json_decode(file_get_contents('php://input'), true);

	        $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';

	        if(isset($loginData['loginId']) && isset($loginData['loginType']) && $loginData['loginId'] && $loginData['loginType']) {

	        	  $inputData = $_POST;

                  $insertData = array(

                         'date_created' => $this->dateData['dateTimeCreated'],
                         'attend_date' => $this->dateData['dateCreated'],
                         'user_id' => $loginData['loginId'],
                         'user_name' => $loginData['loginName'],
                         'start_time' => date('H:i:s'),
                         'start_lat' => $inputData['lat'],
                         'start_lng' => $inputData['lng']
                  );

                  $this->db->insert('abq_attendance', $insertData);

                  $attend_id = $this->db->insert_id();

                  $result = array('status' => 'Success', 'attendId' => $attend_id);
		          echo json_encode($result);

	        } else {

                  $this->onReturnErrorMessage();
	        }
    }


    public function stopUserAttendance() {

    	$_POST = json_decode(file_get_contents('php://input'), true);

        $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';

        if(isset($loginData['loginId']) && $loginData['loginId']) {

        	  $inputData  = $_POST;

              $updatedData = array(

                     'stop_time' => date('H:i:s'),
                     'stop_lat' => $inputData['lat'],
                     'stop_lng' => $inputData['lng'],
                     'stop_address' => '',
              );

              $this->db->where('abq_attendance.id', $inputData['attendId']);		
	          $this->db->update('abq_attendance', $updatedData);

              $result = array('status' => 'Success', 'last_query' => $this->db->last_query());
	          echo json_encode($result);

        } else {

              $this->onReturnErrorMessage();
        }
    }


    public function onReturnErrorMessage() {

    	    $resultData = array('status' => 'error', 'statusMessage' => 'You are not authorized to access this information!');

    	    echo json_encode($resultData);
    }
	
}

?>




