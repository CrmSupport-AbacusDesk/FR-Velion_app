<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');


header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Authorization, Content-Type, X-Auth-Token');

require_once('App_SharedData.php');

class App_Login extends App_SharedData
{
	public function __construct() {
		
		parent:: __construct();
		$this->load->helper("url");
		$this->load->library("pagination");
		$this->load->database();
	}


	public function onValidateLogin() {

	        $inputData = json_decode(file_get_contents('php://input'), true);

			if(isset($inputData['username']) && isset($inputData['password']) &&  $inputData['username'] &&  $inputData['password'])  {

                  $this->db->select('abq_user.*');
				  $this->db->from('abq_user');
				  $this->db->where('abq_user.del', '0');

				  $this->db->group_start();

				    $this->db->where('abq_user.access_level', '3');
				    $this->db->or_where('abq_user.access_level', '4');

				  $this->db->group_end();

				  $this->db->where('abq_user.username', $inputData['username']);
				  $this->db->where('abq_user.password', $inputData['password']);
			      $resultData = $this->db->get()->row_array();

			      $this->db->select('abq_role.role_name');
				  $this->db->from('abq_role');
				  $this->db->where('abq_role.id', $resultData['access_level']);
				  $this->db->where('abq_role.del', '0');
			      $roleData = $this->db->get()->row_array();

			      $resultData['loginType'] = $roleData['role_name'];

			      if(isset($resultData['id']) && $resultData['id']) {

			      	    if(!isset($inputData['organisationId']) || !$inputData['organisationId']) {

			      	    	    $this->db->select('abq_user_organization.organisation_id');
							    $this->db->from('abq_user_organization');
							    $this->db->where('abq_user_organization.user_id',  $resultData['id']);
							    $this->db->where('abq_user_organization.del', '0');
						        $organisationRow = $this->db->get()->row_array();

						        if(isset($organisationRow['organisation_id']) && $organisationRow['organisation_id']) {

						            $resultData['organisationId'] = $organisationRow['organisation_id'];

						        } else {

		                            $resultData['organisationId'] = 0;
						        }

			      	    } else {

                              $resultData['organisationId'] = $inputData['organisationId'];
			      	    }


			      	    $userIds = $this->onGetAssignedUserIdsData($resultData['id'], $resultData['organisationId'],  2);

		                if(COUNT($userIds) === 0) {
					        $resultData['isTeamExist'] = 'No';
			            } else {
			            	 $resultData['isTeamExist'] = 'Yes';
			            }

			      	    $outputData = array(

				      	   	  'status' => 'success',
				      	   	  'statusMessage' => '',
				      	   	  'loginData' => $resultData
			      	    );

			      } else {

                        $outputData = array(

			      	   	  'status' => 'error',
			      	   	  'statusMessage' => 'Invalid Username and Password!',
			      	   	  'loginData' => []
			      	   );
			      }

			      echo json_encode($outputData);

	        } else {

                 $this->onReturnErrorMessage();
	        }
	}


    public function onUserDetailHandler() {

    	  $_POST = json_decode(file_get_contents('php://input'), true);
           
          $inputData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';

		  if(isset($inputData['loginType']) && isset($inputData['loginId']) && $inputData['loginType'] &&  $inputData['loginId'])  {
                    
                $this->db->select('abq_user.*');
			    $this->db->from('abq_user');
			    $this->db->where('abq_user.del','0');
			    $this->db->where('abq_user.id', $inputData['loginId']);
	            $userData = $this->db->get()->row_array();

	            $result = array(

	            	'userData' => $userData
	            );

	            echo json_encode($result);

		  } else {

		  	   $this->onReturnErrorMessage();
		  }
    }


    public function onGetUserOrganisationData() {

    	  $_POST = json_decode(file_get_contents('php://input'), true);
           
          $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';

		  if(isset($loginData['loginType']) && isset($loginData['loginId']) && $loginData['loginType'] &&  $loginData['loginId'])  {
                    
                $this->db->select('abq_user_organization.*');
			    $this->db->from('abq_user_organization');
			    $this->db->where('abq_user_organization.del','0');
			    $this->db->where('abq_user_organization.user_id', $loginData['loginId']);
	            $organisationData = $this->db->get()->result_array();

	            foreach ($organisationData as $key => $row) {

            	     $userIds = $this->onGetAssignedUserIdsData($loginData['loginId'], $row['organisation_id'],  2);

                     $isTeamExist = '';
	                 if(COUNT($userIds) == 0) {

				         $isTeamExist = 'No';

		             } else {

		            	 $isTeamExist = 'Yes';
		             }

		             $organisationData[$key]['isTeamExist'] = $isTeamExist;
	            }

	            $result = array(

	            	'organisationData' => $organisationData
	            );

	            echo json_encode($result);

		  } else {

		  	   $this->onReturnErrorMessage();
		  }
    }


    public function onUploadProfileImageData($loginId) {

            if($_FILES['file']['tmp_name']) {

			    $imageName = uniqid().''.$loginId.".jpg";

			    move_uploaded_file($_FILES['file']['tmp_name'], $_SERVER["DOCUMENT_ROOT"] . 'uploads/' . $imageName);

			     $updatedData = array(
                                    'image' => $imageName
       	       	     	        );

                 $this->db->where('id', $loginId);
	           	 $this->db->update('abq_user', $updatedData);

	           	 echo json_encode('success');
			}
    }



    public function onReturnErrorMessage() {

    	    $resultData = array('status' => 'error', 'statusMessage' => 'You are not authorized to access this information!');

    	    echo json_encode($resultData);
    }
	
}

?>




