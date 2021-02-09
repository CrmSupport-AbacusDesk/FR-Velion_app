<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Origin, Methods, Content-Type");

class Lead extends MY_Controller
{
	
	public function __construct() {
		parent:: __construct();
		// if(isset($_SESSION) && $_SESSION['uid']){
		// }else{
		// 	alert("Session Time Out");
		// 	exit;
		// }
		$this->load->helper("url");
		$this->load->library("pagination");
		$this->load->database();
	}



	public function getLeadTypeNavigation()
	{

		$assignedUserId = $this->getAssignedUser();


		$drIdArray = array();

		if(isset($_SESSION['uorg_id']) && $_SESSION['uorg_id'] != '')
		{

			$this->db->select('abq_dr_organisation.dr_id');
			$this->db->from('abq_dr_organisation');
			$this->db->where('abq_dr_organisation.organisation_id',$_SESSION['uorg_id']);
			$this->db->where('abq_dr_organisation.del','0');
			$this->db->group_by('abq_dr_organisation.dr_id');
			$organisation = $this->db->get()->result_array();

			foreach ($organisation as $key => $value) {
				$drIdArray[] = $value['dr_id'];
			}
		}


		$this->db->select('abq_dr_type.id, abq_dr_type.type');
		$this->db->from('abq_dr_type');
		$this->db->where('abq_dr_type.del','0');
		$this->db->order_by('abq_dr_type.type','ASC');
		$type = $this->db->get()->result_array();


		foreach ($type as $key => $value) {

			$type_name = strtolower(preg_replace('/\s+/', '', $value['type']));

			$this->db->select("IF(COUNT(abq_dr_lead.id),COUNT(abq_dr_lead.id),0)  as '".$type_name."_leadcount', IF(COUNT(abq_dr_network.id),COUNT(abq_dr_network.id),0)  as '".$type_name."_networkcount'");
			$this->db->from('abq_dr');
			
			$this->db->join('(SELECT id from abq_dr WHERE del = 0 AND lead = "1" AND status = "Lead Bank") as abq_dr_lead','abq_dr_lead.id = abq_dr.id','left');

			$this->db->join('(SELECT id from abq_dr WHERE del = 0 AND lead = "0" AND status = "Win") as abq_dr_network','abq_dr_network.id = abq_dr.id','left');

			$this->db->join('abq_dr_inside_assign','abq_dr_inside_assign.dr_id = abq_dr.id AND abq_dr_inside_assign.del = 0','left');

			$this->db->where('abq_dr.del','0');
			$this->db->where('abq_dr.type_name',$value['type']);


			if(isset($drIdArray) && sizeof($drIdArray) > 0)
			{
				$this->db->where_in('abq_dr.id',$drIdArray);
			}

			if(isset($assignedUserId) && sizeof($assignedUserId) > 0)
			{
				$this->db->group_start();
				$this->db->where_in('abq_dr.created_by',$assignedUserId);
				$this->db->or_where_in('abq_dr.assign_to',$assignedUserId);
				$this->db->or_where_in('abq_dr_inside_assign.user_id',$assignedUserId);
				$this->db->group_end();
			}

			$count = $this->db->get()->row_array();

			$type[$key]['leadcount'] = $count[$type_name.'_leadcount'];
			$type[$key]['networkcount'] = $count[$type_name.'_networkcount'];
		}


		$result = array('type' => $type);
		echo json_encode($result);	
	}





	public function getLeadType()
	{
		$this->db->select('abq_dr_type.id, abq_dr_type.type');
		$this->db->from('abq_dr_type');
		$this->db->where('abq_dr_type.del','0');
		$this->db->order_by('abq_dr_type.type','ASC');
		$type = $this->db->get()->result_array();

		$result = array('type' => $type);
		echo json_encode($result);	
	}

	public function getLeadCategory()
	{
		$this->db->select('abq_dr_category.id, abq_dr_category.name');
		$this->db->from('abq_dr_category');
		$this->db->where('abq_dr_category.del','0');
		$this->db->order_by('abq_dr_category.name','ASC');
		$category = $this->db->get()->result_array();

		$result = array('category' => $category);
		echo json_encode($result);	
	}



	public function getNetworkData($limit=50,$start=0,$temp='')
	{
		$_POST = json_decode(file_get_contents('php://input'), true);

		$drIdArray = array();

		if(isset($_SESSION['uorg_id']) && $_SESSION['uorg_id'] != '')
		{

			$this->db->select('abq_dr_organisation.dr_id');
			$this->db->from('abq_dr_organisation');
			$this->db->where('abq_dr_organisation.organisation_id',$_SESSION['uorg_id']);
			$this->db->where('abq_dr_organisation.del','0');
			$this->db->group_by('abq_dr_organisation.dr_id');
			$organisation = $this->db->get()->result_array();

			foreach ($organisation as $key => $value) {
				$drIdArray[] = $value['dr_id'];
			}
		}

		$network = $this->leadList($limit,$start,$temp,$drIdArray);


		$result = array('networkData' => $network);

		echo json_encode($result);
	}





	public function getLeadStatus()
	{
		$this->db->select('abq_dr_status.id, abq_dr_status.name');
		$this->db->from('abq_dr_status');
		$this->db->where('abq_dr_status.del','0');
		$this->db->order_by('abq_dr_status.name','ASC');
		$status = $this->db->get()->result_array();

		$result = array('status' => $status);
		echo json_encode($result);	
	}


	public function getLeadSource()
	{
		$this->db->select('abq_master_source.id, abq_master_source.name, abq_master_source.parent_id');
		$this->db->from('abq_master_source');
		$this->db->where('abq_master_source.del','0');
		$this->db->where('abq_master_source.name != "" ');
		$this->db->order_by('abq_master_source.name','ASC');
		$source = $this->db->get()->result_array();

		$result = array('source' => $source);
		echo json_encode($result);	
	}



	public function getDesignationList()
	{

		$userAccessLevel = array('3','4');
		$this->db->select('abq_role.id,abq_role.role_name');
		$this->db->from('abq_role');
		$this->db->where('abq_role.del','0');
		$this->db->where_in('abq_role.id',$userAccessLevel);
		$this->db->order_by('abq_role.role_name','ASC');
		$designation = $this->db->get()->result_array();

		$result = array('designation' => $designation);
		echo json_encode($result);	

	}




	public function getUserList()
	{
		$_POST = json_decode(file_get_contents('php://input'),true);

		$assignedUserId = $this->getAssignedUser();

		$organisation_id = isset($_SESSION['uorg_id'])?$_SESSION['uorg_id']:'';
		$access_level = array('3','4');

		$msg = 'not exist';
		$user = array();

		if($organisation_id)
		{
			$this->db->select('abq_user_organization.user_id');
			$this->db->from('abq_user_organization');
			$this->db->where('abq_user_organization.del','0');

			if(isset($assignedUserId) && sizeof($assignedUserId) > 0)
			{
				$this->db->group_start();
				$this->db->where_in('abq_user_organization.user_id',$assignedUserId);
				$this->db->group_end();
			}

			$this->db->where_in('abq_user_organization.user_role',$access_level);
			$this->db->where('abq_user_organization.organisation_id',$organisation_id);
			$assign_to_user_org = $this->db->get()->result_array();

			$user_id_array = array();
			foreach ($assign_to_user_org as $key => $value) {
				$user_id_array[] = $value['user_id'];
			}

			$this->db->select('abq_user.id, abq_user.name, abq_role.role_name, abq_user.access_level');
			$this->db->from('abq_user');
			$this->db->join('abq_role','abq_role.id = abq_user.access_level','left');
			$this->db->where('abq_user.del','0');
			$this->db->where_in('abq_user.id',$user_id_array);
			$this->db->order_by('abq_user.name','ASC');
			$user = $this->db->get()->result_array();

			if(is_array($user) && sizeof($user) > 0)
			{
				$msg = 'exist';
			}

		}

		$result = array('user' => $user, 'msg' => $msg);
		echo json_encode($result);

	}


	public function getFollowupType()
	{
		$this->db->select('abq_followup_type.id, abq_followup_type.name');
		$this->db->from('abq_followup_type');
		$this->db->where('abq_followup_type.del','0');
		$this->db->order_by('abq_followup_type.name','ASC');
		$this->db->group_by('abq_followup_type.name');
		$type = $this->db->get()->result_array();

		$result = array('type' => $type);
		echo json_encode($result);	
	}

	public function getStateList()
	{
		$this->db->select('abq_postal_master.id, abq_postal_master.state_name');
		$this->db->from('abq_postal_master');
		$this->db->where('abq_postal_master.del','0');
		$this->db->order_by('abq_postal_master.state_name','ASC');
		$this->db->group_by('abq_postal_master.state_name');
		$state = $this->db->get()->result_array();

		$result = array('state' => $state);
		echo json_encode($result);	
	}


	public function getDistrictList()
	{

		$_POST = json_decode(file_get_contents('php://input'), true);

		$this->db->select('abq_postal_master.id, abq_postal_master.district_name');
		$this->db->from('abq_postal_master');
		$this->db->where('abq_postal_master.del','0');

		if(isset($_POST['data']['state_name']) && $_POST['data']['state_name'] != '')
		{
			$this->db->where('abq_postal_master.state_name',$_POST['data']['state_name']);
		}

		$this->db->order_by('abq_postal_master.district_name','ASC');
		$this->db->group_by('abq_postal_master.district_name');
		$district = $this->db->get()->result_array();

		$result = array('district' => $district);
		echo json_encode($result);	
	}



	public function getLostReason()
	{
		$this->db->select('abq_lost_reason.id, abq_lost_reason.name');
		$this->db->from('abq_lost_reason');
		$this->db->where('abq_lost_reason.del','0');
		$this->db->order_by('abq_lost_reason.name','ASC');
		$this->db->group_by('abq_lost_reason.name');
		$reason = $this->db->get()->result_array();

		$result = array('reason' => $reason);
		echo json_encode($result);	
	}



	public function get_type_id($type_name='')
	{
		$type = $this->db->query('SELECT id FROM abq_dr_type WHERE del = 0 AND type = "'.$type_name.'" ')->row_array();
		return $type['id']?$type['id']:'' ;
	}




	public function addnew_lead()
	{
		$_POST = json_decode(file_get_contents('php://input'), true);

		if(isset($_POST['data']))
		{
			
			$lead_data = array(
				'date_created' => date('Y-m-d H:i:s'),
				'created_by' => isset($_SESSION['uid'])?$_SESSION['uid']:'',
				'created_by_name' => isset($_SESSION['uname'])?$_SESSION['uname']:'',
				'created_by_type' => isset($_SESSION['utype'])?$_SESSION['utype']:'',
				'lead' => true,
				'type_id' => $this->get_type_id(isset($_POST['data']['type_name'])?$_POST['data']['type_name']:''),
				'type_name' => isset($_POST['data']['type_name'])?$_POST['data']['type_name']:'',
				'dr_name' => isset($_POST['data']['dr_name'])?$_POST['data']['dr_name']:$_POST['data']['contact_name'],
				'contact_name' => isset($_POST['data']['contact_name'])?$_POST['data']['contact_name']:'',
				'contact_mobile_no' => isset($_POST['data']['contact_mobile_no'])?$_POST['data']['contact_mobile_no']:NULL,
				'secondary_mobile_no' => isset($_POST['data']['secondary_mobile_no'])?$_POST['data']['secondary_mobile_no']:NULL,
				'category' => isset($_POST['data']['category'])?$_POST['data']['category']:'',
				'email' => isset($_POST['data']['email'])?$_POST['data']['email']:NULL,
				'landline_no' => isset($_POST['data']['landline_no'])?$_POST['data']['landline_no']:NULL,
				'street' => isset($_POST['data']['street'])?$_POST['data']['street']:'',
				'state_name' => isset($_POST['data']['state_name'])?$_POST['data']['state_name']:'',
				'district_name' => isset($_POST['data']['district_name'])?$_POST['data']['district_name']:'',
				'city' => isset($_POST['data']['city'])?$_POST['data']['city']:'',
				'pincode' => isset($_POST['data']['pincode'])?$_POST['data']['pincode']:'',
				'description' => isset($_POST['data']['description'])?$_POST['data']['description']:'',
				'status' => isset($_POST['data']['status'])?$_POST['data']['status']:'',
				'source_id' => isset($_POST['data']['source_id'])?$_POST['data']['source_id']:'',
				'source_name' => isset($_POST['data']['source_name'])?$_POST['data']['source_name']:'',
			);

			$this->db->insert('abq_dr',$lead_data);
			$lead_id = $this->db->insert_id();

			error_reporting(0);
			$error = array();
			$error[] = $this->db->error();

			$ecrpt_id = $this->my_simple_crypt($lead_id);

			if(isset($lead_id) && $lead_id != '')
			{
				if(isset($_SESSION['uorg_id']) && $_SESSION['uorg_id'] != '')
				{
					$abq_dr_organization_data = array(
						'date_created' => date('Y-m-d H:i:s'),
						'created_by' => isset($_SESSION['uid'])?$_SESSION['uid']:'',
						'dr_id' => isset($lead_id)?$lead_id:'',
						'dr_name' => isset($_POST['data']['dr_name'])?$_POST['data']['dr_name']:'',
						'organisation_id' =>  isset($_SESSION['uorg_id'])?$_SESSION['uorg_id']:'',
						'organisation_name' =>  $this->get_org_name($_SESSION['uorg_id']),
					);

					$query = $this->db->insert('abq_dr_organisation',$abq_dr_organization_data);
				}		

				if(isset($_POST['contact']) && sizeof($_POST['contact']) > 0)
				{

					for ($i=0; $i < sizeof($_POST['contact']); $i++) { 

						$abq_dr_contact_data = array(
							'date_created' => date('Y-m-d H:i:s'),
							'created_by' => isset($_SESSION['uid'])?$_SESSION['uid']:'',
							'dr_id' => isset($lead_id)?$lead_id:'',
							'name' => isset($_POST['contact'][$i]['name'])?$_POST['contact'][$i]['name']:'',
							'email' => isset($_POST['contact'][$i]['contact_email'])?$_POST['contact'][$i]['contact_email']:'',
							'designation' => isset($_POST['contact'][$i]['designation'])?$_POST['contact'][$i]['designation']:'',
							'mobile' => isset($_POST['contact'][$i]['mobile'])?$_POST['contact'][$i]['mobile']:'',
						);

						$query = $this->db->insert('abq_dr_contact',$abq_dr_contact_data);
					}

				} 

			}



			if(isset($_SESSION['access_level']) && $_SESSION['access_level'] == '3')
			{
				$abq_dr_inside_assign_data = array(
					'date_created' => date('Y-m-d H:i:s'),
					'created_by' => isset($_SESSION['uid'])?$_SESSION['uid']:'',
					'created_by_name' => isset($_SESSION['uname'])?$_SESSION['uname']:'',
					'dr_id' => isset($lead_id)?$lead_id:'',
					'dr_name' => isset($_POST['data']['dr_name'])?$_POST['data']['dr_name']:'',
					'user_id' =>  isset($_SESSION['uid'])?$_SESSION['uid']:'',
					'user_name' =>  isset($_SESSION['uname'])?$_SESSION['uname']:'',
					'user_role' =>  $this->get_user_role($_SESSION['uid'])
				);

				$query = $this->db->insert('abq_dr_inside_assign',$abq_dr_inside_assign_data);
			}


			$description = $_POST['data']['type_name']." Lead Added Succesfully";		
			$this->addLeadSummary($lead_id,'Lead Add',$description);

			foreach ($error as $key => $value) {
				if($value['code'] == 0) {
					$msg = 'success';
				}
				else {
					$msg = 'error';
				}
			}


			$result = array('msg' => $msg,'ecrpt_id' => $ecrpt_id,'error' => $error);
			echo json_encode($result);	

		}
		else
		{
			$this->onReturnErrorMessage();
		}

	}





	public function addLeadSummary($lead_id,$type,$description)
	{
		$summary_data = array(
			'date_created' => date('Y-m-d H:i:s'),
			'created_by' => isset($_SESSION['uid'])?$_SESSION['uid']:'',
			'created_by_name' => isset($_SESSION['uname'])?$_SESSION['uname']:'',
			'created_by_type' => isset($_SESSION['utype'])?$_SESSION['utype']:'',
			'dr_id' => isset($lead_id)?$lead_id:'',
			'description' => $description,
		);

		$this->db->insert('abq_dr_summary',$summary_data);


		$activityData = array(
			'last_activity_on' => date('Y-m-d H:i:s'),
			'last_activity_by' => isset($_SESSION['uid'])?$_SESSION['uid']:'',
			'last_activity_by_name' => isset($_SESSION['uname'])?$_SESSION['uname']:'',
			'last_activity_type' => isset($type)?$type:'',
			'last_activity_remark' => isset($description)?$description:'',
		);

		$this->db->where('abq_dr.id',$lead_id);
		$this->db->update('abq_dr',$activityData);

		return true;
	}




	public function updateLeadData()
	{
		$_POST = json_decode(file_get_contents('php://input'), true);

		if(isset($_POST))
		{

			$this->db->select('abq_dr.*');
			$this->db->from('abq_dr');
			$this->db->where('abq_dr.del','0');
			$this->db->where('abq_dr.id',$_POST['data']['id']);
			$detail = $this->db->get()->row_array();

			if(isset($_POST['action']) && $_POST['action'] == 'field_assign_user')
			{
				$lead_data = array(
					'assign_to' => isset($_POST['data']['assign_to'])?$_POST['data']['assign_to']:'',
					'assign_to_name' => isset($_POST['data']['assign_to_name'])?$_POST['data']['assign_to_name']:'',
					'assigned' => 1,
					'validate' => 1,
				);

				$this->db->where('abq_dr.id',$_POST['data']['id']);
				$this->db->update('abq_dr',$lead_data);


				if(isset($detail['assign_to']) && $detail['assign_to'] != '0')
				{
					$description = 'Assigned to '.$_POST['data']['assign_to_name']." from ".$detail['assign_to_name']." Succesfully";		
				}
				else
				{
					$description = 'Assigned to '.$_POST['data']['assign_to_name']." Succesfully";	
				}

			}



			if(isset($_POST['action']) && $_POST['action'] == 'inside_assign_user')
			{

				if(isset($_POST['data']['assign_to_inside']) && sizeof($_POST['data']['assign_to_inside']) > 0)
				{
					$update_inside_user  = array(
						'del' => '1',
					);
					$this->db->where('abq_dr_inside_assign.dr_id',$_POST['data']['id']);
					$this->db->update('abq_dr_inside_assign',$update_inside_user);

					for ($i=0; $i < sizeof($_POST['data']['assign_to_inside']) ; $i++) 
					{ 

						$abq_dr_inside_assign_data = array(
							'date_created' => date('Y-m-d H:i:s'),
							'created_by' => isset($_SESSION['uid'])?$_SESSION['uid']:'',
							'created_by_name' => isset($_SESSION['uname'])?$_SESSION['uname']:'',
							'dr_id' => isset($_POST['data']['id'])?$_POST['data']['id']:'',
							'dr_name' => isset($_POST['data']['dr_name'])?$_POST['data']['dr_name']:'',
							'user_id' =>  isset($_POST['data']['assign_to_inside'][$i])?$_POST['data']['assign_to_inside'][$i]:'',
							'user_name' =>  $this->get_user_name($_POST['data']['assign_to_inside'][$i]),
							'user_role' =>  $this->get_user_role($_POST['data']['assign_to_inside'][$i]),
						);

						$query = $this->db->insert('abq_dr_inside_assign',$abq_dr_inside_assign_data);

						$description = $this->get_user_name($_POST['data']['assign_to_inside'][$i])." Assigned  Succesfully";	


						$lead_data = array(
							'assigned' => 1,
							'validate' => 1,
						);

						$this->db->where('abq_dr.id',$_POST['data']['id']);
						$this->db->update('abq_dr',$lead_data);

					}
				}

			}



			if(isset($_POST['action']) && $_POST['action'] == 'status')
			{

				$status = isset($_POST['data']['status'])?$_POST['data']['status']:'';
				if($status == 'Win')
				{ 
					$lead = 0; 
				}
				else
				{
					$lead = 1; 
				}

				$lead_data = array(
					'status' => isset($_POST['data']['status'])?$_POST['data']['status']:'',
					'validate' => 1,
					'lead' => $lead,
					'status_on' => date('Y-m-d H:i:s'),
					'status_by' => isset($_SESSION['uid'])?$_SESSION['uid']:'',
					'status_reason' => isset($_POST['data']['status_reason'])?$_POST['data']['status_reason']:'',
					'status_description' => isset($_POST['data']['status_description'])?$_POST['data']['status_description']:'',
				);

				$this->db->where('abq_dr.id',$_POST['data']['id']);
				$this->db->update('abq_dr',$lead_data);

				
				if(isset($detail['status']) && $detail['status'] != '')
				{
					$description = 'Status Updated to '.$_POST['data']['status']." from ".$detail['status']." Succesfully";		
				}
				else
				{
					$description = 'Status Updated to '.$_POST['data']['status']." Succesfully";	
				}

			}



			if(isset($_POST['action']) && $_POST['action'] == 'organisation')
			{

				if(isset($_POST['data']['organisation']) && sizeof($_POST['data']['organisation']) > 0)
				{
					$update_org_user  = array(
						'del' => '1',
					);
					$this->db->where('abq_dr_organisation.dr_id',$_POST['data']['id']);
					$this->db->update('abq_dr_organisation',$update_org_user);

					for ($i=0; $i < sizeof($_POST['data']['organisation']) ; $i++) 
					{ 

						$abq_dr_organization_data = array(
							'date_created' => date('Y-m-d H:i:s'),
							'created_by' => isset($_SESSION['uid'])?$_SESSION['uid']:'',
							'dr_id' => isset($_POST['data']['id'])?$_POST['data']['id']:'',
							'dr_name' => isset($_POST['data']['dr_name'])?$_POST['data']['dr_name']:'',
							'organisation_id' =>  isset($_POST['data']['organisation'][$i])?$_POST['data']['organisation'][$i]:'',
							'dr_cust' => 1,
							'organisation_name' =>  $this->get_org_name($_POST['data']['organisation'][$i]),
						);

						$query = $this->db->insert('abq_dr_organisation',$abq_dr_organization_data);

					}
				}

				$description = "Organisation Updated  Succesfully";	

			}




			if(isset($_POST['action']) && $_POST['action'] == 'organisation_single')
			{
				if(isset($_POST['data']['organisation_id']))
				{
					$update_org_user  = array(
						'del' => '1',
					);
					$this->db->where('abq_dr_organisation.dr_id',$_POST['data']['id']);
					$this->db->update('abq_dr_organisation',$update_org_user);

					$abq_dr_organization_data = array(
						'date_created' => date('Y-m-d H:i:s'),
						'created_by' => isset($_SESSION['uid'])?$_SESSION['uid']:'',
						'dr_id' => isset($_POST['data']['id'])?$_POST['data']['id']:'',
						'dr_name' => isset($_POST['data']['dr_name'])?$_POST['data']['dr_name']:'',
						'organisation_id' =>  isset($_POST['data']['organisation_id'])?$_POST['data']['organisation_id']:'',
						'organisation_name' =>  $this->get_org_name($_POST['data']['organisation_id']),
					);

					$query = $this->db->insert('abq_dr_organisation',$abq_dr_organization_data);
				}

				$description = "Organisation Updated  Succesfully";	
			}


			if(isset($_POST['action']) && $_POST['action'] == 'basic')
			{

				$lead_data = array(
					'type_id' => $this->get_type_id(isset($_POST['data']['type_name'])?$_POST['data']['type_name']:''),
					'type_name' => isset($_POST['data']['type_name'])?$_POST['data']['type_name']:'',
					'dr_name' => isset($_POST['data']['dr_name'])?$_POST['data']['dr_name']:'',
					'contact_name' => isset($_POST['data']['contact_name'])?$_POST['data']['contact_name']:'',
					'contact_mobile_no' => isset($_POST['data']['contact_mobile_no'])?$_POST['data']['contact_mobile_no']:NULL,
					'secondary_mobile_no' => isset($_POST['data']['secondary_mobile_no'])?$_POST['data']['secondary_mobile_no']:NULL,
					'category' => isset($_POST['data']['category'])?$_POST['data']['category']:'',
					'email' => isset($_POST['data']['email'])?$_POST['data']['email']:NULL,
					'landline_no' => isset($_POST['data']['landline_no'])?$_POST['data']['landline_no']:NULL,
					'street' => isset($_POST['data']['street'])?$_POST['data']['street']:'',
					'state_name' => isset($_POST['data']['state_name'])?$_POST['data']['state_name']:'',
					'district_name' => isset($_POST['data']['district_name'])?$_POST['data']['district_name']:'',
					'city' => isset($_POST['data']['city'])?$_POST['data']['city']:'',
					'pincode' => isset($_POST['data']['pincode'])?$_POST['data']['pincode']:'',
					'description' => isset($_POST['data']['description'])?$_POST['data']['description']:'',
					'status' => isset($_POST['data']['status'])?$_POST['data']['status']:'',
					'source_id' => isset($_POST['data']['source_id'])?$_POST['data']['source_id']:'',
					'source_name' => isset($_POST['data']['source_name'])?$_POST['data']['source_name']:'',
				);


				$this->db->where('abq_dr.id',$_POST['data']['id']);
				$this->db->update('abq_dr',$lead_data);

				$description = 'Basic Details Updated';
			}

			error_reporting(0);
			$error = array();
			$error[] = $this->db->error();

			$this->addLeadSummary($_POST['data']['id'],'Lead Assigned',$description);

			foreach ($error as $key => $value) {
				if($value['code'] == 0) {
					$msg = 'success';
				}
				else {
					$msg = 'error';
				}
			}

			$result = array('msg' => $msg,'error' => $error, 'description' => $description);
			echo json_encode($result);	
		}
		else
		{
			$this->onReturnErrorMessage();
		}

	}








	public function get_org_name($org_id='')
	{
		$org = $this->db->query('SELECT name FROM abq_organization WHERE del = 0 AND id = "'.$org_id.'" ')->row_array();

		return $org['name']?$org['name']:'' ;
	}

	public function get_user_name($user_id='')
	{
		$user = $this->db->query('SELECT name FROM abq_user WHERE del = 0 AND id = "'.$user_id.'" ')->row_array();

		return $user['name']?$user['name']:'' ;
	}

	public function get_user_role($user_id='')
	{
		$user = $this->db->query('SELECT access_level FROM abq_user WHERE del = 0 AND id = "'.$user_id.'" ')->row_array();

		return $user['access_level']?$user['access_level']:'' ;
	}




	public function submitRequirement()	
	{
		$_POST = json_decode(file_get_contents('php://input'),true);



		if(isset($_POST['data']))
		{
			$msg = 'error';

			for ($i=0; $i < sizeof($_POST['data']); $i++) { 

				if(isset($_POST['data'][$i]['id']) && isset($_POST['data'][$i]['dr_id']))
				{

					$abq_dr_requirement_data = array(
						'qty' => isset($_POST['data'][$i]['qty'])?$_POST['data'][$i]['qty']:'',
					);

					$this->db->where('abq_dr_requirement.id',$_POST['data'][$i]['id']);
					$query = $this->db->update('abq_dr_requirement',$abq_dr_requirement_data);
				}
				else{
					$abq_dr_requirement_data = array(
						'date_created' => date('Y-m-d H:i:s'),
						'created_by' => isset($_SESSION['uid'])?$_SESSION['uid']:'',
						'created_by_name' => isset($_SESSION['uname'])?$_SESSION['uname']:'',
						'created_by_type' => isset($_SESSION['utype'])?$_SESSION['utype']:'',
						'dr_id' => isset($_POST['form']['id'])?$_POST['form']['id']:'',
						'dr_name' => isset($_POST['form']['dr_name'])?$_POST['form']['dr_name']:'',
						'dr_type' => isset($_POST['form']['type_id'])?$_POST['form']['type_id']:'',
						'dr_type_name' => isset($_POST['form']['type_name'])?$_POST['form']['type_name']:'',
						'category' => isset($_POST['data'][$i]['category'])?$_POST['data'][$i]['category']:'',
						'sub_category' => isset($_POST['data'][$i]['sub_category'])?$_POST['data'][$i]['sub_category']:'',
						'product_id' => isset($_POST['data'][$i]['product_id'])?$_POST['data'][$i]['product_id']:'',
						'product_name' => isset($_POST['data'][$i]['product_name'])?$_POST['data'][$i]['product_name']:'',
						'product_code' => isset($_POST['data'][$i]['product_code'])?$_POST['data'][$i]['product_code']:'',
						'qty' => isset($_POST['data'][$i]['qty'])?$_POST['data'][$i]['qty']:'',
					);

					$query = 	$this->db->insert('abq_dr_requirement',$abq_dr_requirement_data);
				}

			}



			if(isset($_POST['form']['id']) && $_POST['form']['id'] != '')
			{
				$lead_data = array(
					'requirement' => 1,
				);
				$this->db->where('abq_dr.id',$_POST['form']['id']);
				$this->db->update('abq_dr',$lead_data);
			}

			$description = "Requirement Updated";
			$this->addLeadSummary($_POST['form']['id'],'Requirement Updated',$description);

			if($query)
			{
				$msg = 'success';
			}


			$result = array('msg' => $msg);

			echo json_encode($result);
		}

		else
		{
			$this->onReturnErrorMessage();
		}

	}





	public function submitContactDetail()	
	{
		$_POST = json_decode(file_get_contents('php://input'),true);

		if(isset($_POST['data']))
		{
			$msg = 'error';


			$delData = array(
				'del' => '1',
			);

			$this->db->where('abq_dr_contact.dr_id',$_POST['form']['id']);
			$query = $this->db->update('abq_dr_contact',$delData);			


			for ($i=0; $i < sizeof($_POST['data']); $i++) { 

				if(isset($_POST['data'][$i]['dr_id']) && isset($_POST['data'][$i]['dr_id']))
				{

					$abq_dr_contact_data = array(
						'name' => isset($_POST['data'][$i]['name'])?$_POST['data'][$i]['name']:'',
						'email' => isset($_POST['data'][$i]['contact_email'])?$_POST['data'][$i]['contact_email']:'',
						'designation' => isset($_POST['data'][$i]['designation'])?$_POST['data'][$i]['designation']:'',
						'mobile' => isset($_POST['data'][$i]['mobile'])?$_POST['data'][$i]['mobile']:'',
						'del' => '0',
					);

					$this->db->where('abq_dr_contact.id',$_POST['data'][$i]['id']);
					$query = $this->db->update('abq_dr_contact',$abq_dr_contact_data);
				}
				else
				{

					$abq_dr_contact_data = array(
						'date_created' => date('Y-m-d H:i:s'),
						'created_by' => isset($_SESSION['uid'])?$_SESSION['uid']:'',
						'dr_id' => isset($_POST['form']['id'])?$_POST['form']['id']:'',
						'name' => isset($_POST['data'][$i]['name'])?$_POST['data'][$i]['name']:'',
						'email' => isset($_POST['data'][$i]['contact_email'])?$_POST['data'][$i]['contact_email']:'',
						'designation' => isset($_POST['data'][$i]['designation'])?$_POST['data'][$i]['designation']:'',
						'mobile' => isset($_POST['data'][$i]['mobile'])?$_POST['data'][$i]['mobile']:'',
					);

					$query = $this->db->insert('abq_dr_contact',$abq_dr_contact_data);
				}

				error_reporting(0);
				$error = array();
				$error[] = $this->db->error();
			}


			foreach ($error as $key => $value) {
				if($value['code'] == 0) {
					$msg = 'success';
					$description = "Contact Details Updated";
					$this->addLeadSummary($_POST['form']['id'],'Contact Details Updated',$description);
				}
				else {
					$msg = 'error';
				}
			}

			$result = array('msg' => $msg,'error' => $error);

			echo json_encode($result);
		}

		else
		{
			$this->onReturnErrorMessage();
		}

	}




	public function deleteLeadData()
	{
		$_POST = json_decode(file_get_contents('php://input'),true);
		$data = array('del'=> 1);
		$this->db->where('id', $_POST['id']);
		$query = $this->db->update('abq_dr', $data);

		$description = 'Lead Deleted';	
		$this->addLeadSummary($_POST['id'],'Lead Deleted',$description);

		$msg = 'success';
		if(!$query)
		{
			$msg = 'error';
		}

		$result = array('msg' => $msg);
		echo json_encode($result);
	}



	public function leadList($limit,$start,$temp='',array $drIdArray)
	{


		$assignedUserId = $this->getAssignedUser();

		$last_query = '';
		$this->db->select('abq_dr.*, DATE(abq_dr.last_activity_on) as last_activity_date');
		$this->db->from('abq_dr');
		$this->db->join('abq_dr_inside_assign','abq_dr_inside_assign.dr_id = abq_dr.id AND abq_dr_inside_assign.del = 0','left');
		$this->db->where('abq_dr.del','0');

		if(isset($_POST['search']['status']) && $_POST['search']['status'] != '')
		{
			$this->db->where('abq_dr.status',$_POST['search']['status']);
		}

		if(isset($_POST['search']['lead']) && $_POST['search']['lead'] != '')
		{
			$this->db->where('abq_dr.lead',$_POST['search']['lead']);
		}

		if(isset($_POST['search']['type']) && $_POST['search']['type'] != '')
		{
			$this->db->where('abq_dr.type_name',$_POST['search']['type']);
		}
		
		if(isset($_POST['dr_type_name']) && $_POST['dr_type_name'] != '')
		{
			$this->db->where('abq_dr.type_name',$_POST['dr_type_name']);
		}

		if(isset($_POST['search']['category']) && $_POST['search']['category'] != '')
		{
			$this->db->where('abq_dr.category',$_POST['search']['category']);
		}

		if(isset($_POST['search']['source_name']) && $_POST['search']['source_name'] != '')
		{
			$this->db->where('abq_dr.source_name',$_POST['search']['source_name']);
		}


		if(isset($_POST['search']['qualified']) && $_POST['search']['qualified'] != '')
		{
			foreach ($_POST['search']['qualified'] as $key => $value) {
				$this->db->where('abq_dr.'.$key,$value);
			}
		}


		if(isset($drIdArray) && sizeof($drIdArray) > 0)
		{
			$this->db->where_in('abq_dr.id',$drIdArray);
		}


		if(isset($_POST['search']['dr_name']) && $_POST['search']['dr_name'] != '')
		{
			$this->db->like('abq_dr.dr_name',$_POST['search']['dr_name']);
		}


		if(isset($_POST['search']['assign_to']) && $_POST['search']['assign_to'] != '')
		{
			$this->db->where('abq_dr.assign_to',$_POST['search']['assign_to']);
		}

		if(isset($_POST['search']['assign_to_name']) && $_POST['search']['assign_to_name'] != '')
		{
			$this->db->like('abq_dr.assign_to_name',$_POST['search']['assign_to_name']);
		}


		if(isset($_POST['search']['address']) && $_POST['search']['address'] != '')
		{
			$this->db->group_start();
			$this->db->like('abq_dr.state_name',$_POST['search']['address']);
			$this->db->or_like('abq_dr.district_name',$_POST['search']['address']);
			$this->db->group_end();
		}


		if(isset($_POST['search']['master_search']) && $_POST['search']['master_search'] != '')
		{
			$this->db->group_start();
			$this->db->like('abq_dr.state_name',$_POST['search']['master_search']);
			$this->db->or_like('abq_dr.district_name',$_POST['search']['master_search']);
			$this->db->or_like('abq_dr.dr_name',$_POST['search']['master_search']);
			$this->db->or_like('abq_dr.contact_name',$_POST['search']['master_search']);
			$this->db->or_like('abq_dr.contact_mobile_no',$_POST['search']['master_search']);
			$this->db->or_like('abq_dr.email',$_POST['search']['master_search']);
			$this->db->group_end();
		}


		if(isset($assignedUserId) && sizeof($assignedUserId) > 0)
		{
			$this->db->group_start();
			$this->db->where_in('abq_dr.created_by',$assignedUserId);
			$this->db->or_where_in('abq_dr.assign_to',$assignedUserId);
			$this->db->or_where_in('abq_dr_inside_assign.user_id',$assignedUserId);
			$this->db->where('abq_dr.assign_to != "0" ');
			$this->db->group_end();
		}


		$this->db->group_by('abq_dr.id');
		$this->db->order_by('abq_dr.id','DESC');
		$this->db->limit($limit,$start);
		if($temp)
		{
			$lead_list = $this->db->get()->num_rows();
			$last_query = $this->db->last_query();
		}
		else{
			$lead_list = $this->db->get()->result_array();

			foreach($lead_list as $key => $value)
			{
				$lead_list[$key]['ecrpt_id'] =  $this->my_simple_crypt($value['id']);

				if($value['last_activity_date'])
				{
					$start_date = strtotime(date('Y-m-d')); 
					$end_date = strtotime($value['last_activity_date']); 
					$days_left = ($start_date - $end_date)/60/60/24; 
					$lead_list[$key]['last_activity_days']  = $days_left." Days";
				}
				else
				{
					$lead_list[$key]['last_activity_days']  = "N/A"; 
				}

				$this->db->select('abq_dr_requirement.*');
				$this->db->from('abq_dr_requirement');
				$this->db->where('abq_dr_requirement.del','0');
				$this->db->where('abq_dr_requirement.dr_id',$value['id']);
				$this->db->order_by('abq_dr_requirement.id','DESC');
				$requirement = $this->db->get()->result_array();
				$lead_list[$key]['requirement'] =  $requirement;

			}
		}

		return $lead_list;

	}






	public function getLeadList($limit,$start,$temp='')
	{

		$_POST = json_decode(file_get_contents('php://input'),true);

		$assignedUserId = $this->getAssignedUser();

		$drIdArray = array();

		if(isset($_SESSION['uorg_id']) && $_SESSION['uorg_id'] != '')
		{

			$this->db->select('abq_dr_organisation.dr_id');
			$this->db->from('abq_dr_organisation');
			$this->db->where('abq_dr_organisation.organisation_id',$_SESSION['uorg_id']);
			$this->db->where('abq_dr_organisation.del','0');
			$this->db->group_by('abq_dr_organisation.dr_id');
			$organisation = $this->db->get()->result_array();

			foreach ($organisation as $key => $value) {
				$drIdArray[] = $value['dr_id'];
			}
		}

		$lead_list = $this->leadList($limit,$start,$temp,$drIdArray);

		$last_query = $this->db->last_query();


		$lead_count = $this->getLeadCount(isset($_POST['search']['type'])?$_POST['search']['type']:'', $drIdArray);

		$qualified_status = array('0'=> 'validate' ,'1' => 'notassigned','2' => 'assigned','3' => 'meeting','4' => 'requirement','5' => 'quotation','6' => 'negotation');

		foreach ($qualified_status as $key => $value) {

			$this->db->select("abq_dr.id as dr_id,abq_dr.id as  ".$value."_count ");
			$this->db->from('abq_dr');
			$this->db->join('abq_dr_inside_assign','abq_dr_inside_assign.dr_id = abq_dr.id AND abq_dr_inside_assign.del = 0','left');
			$this->db->where('abq_dr.del','0');
			$this->db->where('abq_dr.lead','1');
			if(isset($_POST['search']['type']) && $_POST['search']['type'] != '')
			{
				$this->db->where('abq_dr.type_name',$_POST['search']['type']);
			}
			if(isset($drIdArray) && sizeof($drIdArray) >0)
			{
				$this->db->where_in('abq_dr.id',$drIdArray);
			}
			$this->db->where('abq_dr.status','Qualified');
			$this->db->where('abq_dr.'.$value,'1');

			if(isset($assignedUserId) && sizeof($assignedUserId) > 0)
			{
				$this->db->group_start();
				$this->db->where_in('abq_dr.created_by',$assignedUserId);
				$this->db->or_where_in('abq_dr.assign_to',$assignedUserId);
				$this->db->or_where_in('abq_dr_inside_assign.user_id',$assignedUserId);
				$this->db->group_end();
			}

			$count = $this->db->get()->num_rows();
			$qualifiedCount[$value] = $count[$value.'_count'];

		}


		$result = array('leadData' => $lead_list, 'leadCount' => $lead_count, 'qualified_status' => $qualified_status, 'qualifiedCount' => $qualifiedCount, 'dr_id_array' => $drIdArray);

		echo json_encode($result,JSON_NUMERIC_CHECK);

	}




	public function getLeadCount($type,array $drIdArray)
	{

		$assignedUserId = $this->getAssignedUser();

		$this->db->select('abq_dr_status.id, abq_dr_status.name');
		$this->db->from('abq_dr_status');
		$this->db->where('abq_dr_status.del','0');
		$this->db->order_by('abq_dr_status.name','ASC');
		$status = $this->db->get()->result_array();		

		foreach ($status as $key => $value) {

			$status = strtolower(preg_replace('/\s+/', '', $value['name']));

			$this->db->select("abq_dr.id as dr_id,IF(COUNT(abq_dr.id),COUNT(abq_dr.id),0) as  ".$status."_count ");
			$this->db->from('abq_dr');
			$this->db->join('abq_dr_inside_assign','abq_dr_inside_assign.dr_id = abq_dr.id AND abq_dr_inside_assign.del = 0','left');
			$this->db->where('abq_dr.del','0');
			$this->db->where('abq_dr.type_name',$type);

			if(isset($drIdArray) && sizeof($drIdArray) > 0)
			{
				$this->db->where_in('abq_dr.id',$drIdArray);
			}

			$this->db->where('abq_dr.status',$value['name']);

			if(isset($assignedUserId) && sizeof($assignedUserId) > 0)
			{
				$this->db->group_start();
				$this->db->where_in('abq_dr.created_by',$assignedUserId);
				$this->db->or_where_in('abq_dr.assign_to',$assignedUserId);
				$this->db->or_where_in('abq_dr_inside_assign.user_id',$assignedUserId);
				$this->db->group_end();
			}

			$count = $this->db->get()->row_array();
			$data[$status] = $count[$status.'_count'];
			$last_query = $this->db->last_query();

		}
		return $data;
	}






	public function getLeadDetail($ecrpt_id)
	{
		$id = $this->my_simple_crypt($ecrpt_id,"d");

		$this->db->select('abq_dr.*, DATE(abq_dr.last_activity_on) as last_activity_date');
		$this->db->from('abq_dr');
		$this->db->where('abq_dr.del','0');
		$this->db->where('abq_dr.id',$id);
		$detail = $this->db->get()->row_array();

		if($detail['last_activity_date'])
		{
			$start_date = strtotime(date('Y-m-d')); 
			$end_date = strtotime($detail['last_activity_date']); 
			$days_left = ($start_date - $end_date)/60/60/24; 
			$detail['last_activity_days']  = $days_left." Days";
		}
		else
		{
			$detail['last_activity_days']  = "N/A"; 
		}


		$this->db->select('GROUP_CONCAT(DISTINCT CONCAT(abq_dr_organisation.organisation_name) SEPARATOR ", ") as organisation');
		$this->db->from('abq_dr_organisation');
		$this->db->where('abq_dr_organisation.del','0');
		$this->db->where('abq_dr_organisation.dr_id',$id);
		$dr_organisation = $this->db->get()->row_array();

		$detail['organisation_name'] = $dr_organisation['organisation'];


		$this->db->select('abq_dr_organisation.organisation_id');
		$this->db->from('abq_dr_organisation');
		$this->db->where('abq_dr_organisation.del','0');
		$this->db->where('abq_dr_organisation.dr_id',$id);
		$organisation = $this->db->get()->result_array();

		$detail['organisation']= array();

		foreach ($organisation as $key => $value) {
			$detail['organisation'][] = $value['organisation_id'];
		}



		$this->db->select('GROUP_CONCAT(DISTINCT CONCAT(abq_dr_inside_assign.user_name) SEPARATOR ", ") as assign_to_inside_name');
		$this->db->from('abq_dr_inside_assign');
		$this->db->where('abq_dr_inside_assign.del','0');
		$this->db->where('abq_dr_inside_assign.dr_id',$id);
		$inside_assign = $this->db->get()->row_array();

		$detail['assign_to_inside_name'] = $inside_assign['assign_to_inside_name'];


		$this->db->select('abq_dr_inside_assign.user_id');
		$this->db->from('abq_dr_inside_assign');
		$this->db->where('abq_dr_inside_assign.del','0');
		$this->db->where('abq_dr_inside_assign.dr_id',$id);
		$inside_users = $this->db->get()->result_array();

		$detail['assign_to_inside']= array();

		foreach ($inside_users as $key => $value) {
			$detail['assign_to_inside'][] = $value['user_id'];
		}


		$this->db->select('abq_dr_organisation.organisation_id');
		$this->db->from('abq_dr_organisation');
		$this->db->where('abq_dr_organisation.del','0');
		$this->db->where('abq_dr_organisation.dr_id',$id);
		$organisation = $this->db->get()->row_array();

		$detail['organisation_id']= $organisation['organisation_id'];

		$this->db->select('abq_dr_summary.*');
		$this->db->from('abq_dr_summary');
		$this->db->where('abq_dr_summary.del','0');
		$this->db->where('abq_dr_summary.dr_id',$id);
		$this->db->order_by('abq_dr_summary.id','DESC');
		$summary = $this->db->get()->result_array();


		$this->db->select('abq_dr_activity.*');
		$this->db->from('abq_dr_activity');
		$this->db->where('abq_dr_activity.del','0');
		$this->db->where('abq_dr_activity.dr_id',$id);
		$this->db->order_by('abq_dr_activity.id','DESC');
		$activity = $this->db->get()->result_array();


		$this->db->select('abq_lead_followup.*');
		$this->db->from('abq_lead_followup');
		$this->db->where('abq_lead_followup.del','0');
		$this->db->where('abq_lead_followup.dr_id',$id);
		$this->db->order_by('abq_lead_followup.id','DESC');
		$followup = $this->db->get()->result_array();


		$this->db->select('abq_dr_requirement.*');
		$this->db->from('abq_dr_requirement');
		$this->db->where('abq_dr_requirement.del','0');
		$this->db->where('abq_dr_requirement.dr_id',$id);
		$this->db->order_by('abq_dr_requirement.id','DESC');
		$requirement = $this->db->get()->result_array();


		$this->db->select('abq_dr_contact.*');
		$this->db->from('abq_dr_contact');
		$this->db->where('abq_dr_contact.del','0');
		$this->db->where('abq_dr_contact.dr_id',$id);
		$this->db->order_by('abq_dr_contact.id','DESC');
		$contact = $this->db->get()->result_array();


		$this->db->select('abq_dr_quotation.*');
		$this->db->from('abq_dr_quotation');
		$this->db->where('abq_dr_quotation.del','0');
		$this->db->where('abq_dr_quotation.dr_id',$id);
		$this->db->order_by('abq_dr_quotation.id','DESC');
		$quotation = $this->db->get()->result_array();

		foreach ($quotation as $key => $value) {
			$quotation[$key]['ecrpt_id'] = $this->my_simple_crypt($value['id']);
		}


		$this->db->select('abq_dr_order.*');
		$this->db->from('abq_dr_order');
		$this->db->where('abq_dr_order.del','0');
		$this->db->where('abq_dr_order.dr_id',$id);
		$this->db->order_by('abq_dr_order.id','DESC');
		$order = $this->db->get()->result_array();

		foreach ($order as $key => $value) {
			$order[$key]['ecrpt_id'] = $this->my_simple_crypt($value['id']);
		}


		$result = array('leadDetail' => $detail, 'summaryData' => $summary, 'activityData' => $activity, 'followupData' => $followup, 'quotationData' => $quotation, 'requirementData' => $requirement, 'orderData' => $order, 'contactData' => $contact);
		echo json_encode($result);

	}




	public function getMasterSearchResult($limit,$start,$temp='')
	{
		$_POST = json_decode(file_get_contents('php://input'),true);

		$drIdArray = array();

		if(isset($_SESSION['uorg_id']) && $_SESSION['uorg_id'] != '')
		{

			$this->db->select('abq_dr_organisation.dr_id');
			$this->db->from('abq_dr_organisation');
			$this->db->where('abq_dr_organisation.organisation_id',$_SESSION['uorg_id']);
			$this->db->where('abq_dr_organisation.del','0');
			$this->db->group_by('abq_dr_organisation.dr_id');
			$organisation = $this->db->get()->result_array();

			foreach ($organisation as $key => $value) {
				$drIdArray[] = $value['dr_id'];
			}
		}


		$resultData = $this->leadList($limit,$start,$temp,$drIdArray);

		$result = array('resultData' => $resultData);

		echo json_encode($result);

	}


}

?>