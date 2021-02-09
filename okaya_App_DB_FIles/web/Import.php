<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Import extends CI_Controller {
	
	/**
	* Index Page for this controller.
	*
	* Maps to the following URL
	* 		http://example.com/index.php/welcome
	*	- or -
	* 		http://example.com/index.php/welcome/index
	*	- or -
	* Since this controller is set as the default controller in
	* config/routes.php, it's displayed at http://example.com/
	*
	* So any other public methods not prefixed with an underscore will
	* map to /index.php/welcome/<method_name>
	* @see https://codeigniter.com/user_guide/general/urls.html
	*/
	
	
	function __Construct()
	{
	    ini_set('max_execution_time', '0');
		parent::__Construct ();
		$this->load->database(); 
	}
	
	public function index()
	{
		$this->load->view('templates/home');
	}
	
	
	
	
	public function importProductData()
	{
		
		$downloadPath = $_FILES["file"]["tmp_name"];
		
		$this->importProductcsv($downloadPath);
		
	}
	
	
	public function get_org_id($org_name='')
	{
		$org = $this->db->query('SELECT id FROM abq_organization WHERE del = 0 AND name = "'.$org_name.'" ')->row_array();
		return $org['id']?$org['id']:'' ;
	}
	
	
	public function importProductcsv($downloadPath)
	{
		
		if(filesize($downloadPath) > 0)
		{
			$count = 1;
			
			$file = fopen($downloadPath, "r"); 
			
			echo "<a href=''>GO BACK</a>";
			$table = "<table><tr><th>S. No.</th><th>Product Code</th><th>Status</th></tr>";
			
			while ( ( $uploadData = fgetcsv($file, 10000, ",") ) !== FALSE)
			{
				
				if($count == 1 && $uploadData[0] != 'Product Name' )
				{  
					echo "Please upload correct file";
					echo "<script>alert('Please upload correct file!') ; window.location.href = '#'</script>";
				}
				else
				{
					
					if( $count > 1 && $uploadData[0] != 'Product Name' )  
					{
						/// Product Category Add Section Start
						
						$this->db->select('id');
						$this->db->from('abq_product_category');
						$this->db->like('abq_product_category.category',str_replace(["'"], "", trim($uploadData[2])));
						$this->db->where('abq_product_category.del','0');
						$product_category_data = $this->db->get()->row_array();
						
						if(!(is_array($product_category_data) && sizeof($product_category_data) > 0 )) 
						{
							
							$data = array(
								'date_created'  =>   date('Y-m-d H:i:s'),
								'created_by' => isset($_SESSION['uid'])?$_SESSION['uid']:'',
								'category' => str_replace(["'"], "", trim($uploadData[2])),
								'organisation_id' => $this->get_org_id(str_replace(["'"], "", trim($uploadData[4]))),
								'del' => '0',
							);
							
							$sql = $this->db->insert('abq_product_category', $data);
							$insert_id = $this->db->insert_id();
							
						}
						
						/// Product Category Add Section End
						
						
						/// Product Sub Category Add Section Start
						
						$this->db->select('id');
						$this->db->from('abq_product_sub_category');
						$this->db->like('abq_product_sub_category.category',str_replace(["'"], "", trim($uploadData[2])));
						$this->db->like('abq_product_sub_category.sub_category',str_replace(["'"], "", trim($uploadData[3])));
						$this->db->where('abq_product_sub_category.del','0');
						$product_sub_category_data = $this->db->get()->row_array();
						
						
						if(!(is_array($product_sub_category_data) && sizeof($product_sub_category_data) > 0 )) 
						{
							
							$data = array(
								'date_created'  =>   date('Y-m-d H:i:s'),
								'created_by' => isset($_SESSION['uid'])?$_SESSION['uid']:'',
								'category' => str_replace(["'"], "", trim($uploadData[2])),
								'sub_category' => str_replace(["'"], "", trim($uploadData[3])),
								'organisation_id' => $this->get_org_id(str_replace(["'"], "", trim($uploadData[4]))),
								'del' => '0',
							);
							
							$sql = $this->db->insert('abq_product_sub_category', $data);
						}
						
						
						/// Product Sub Category Add Section End
						
						
						$this->db->select('id');
						$this->db->from('abq_product');
						$this->db->like('abq_product.product_code',str_replace(["'"], "", trim($uploadData[1])));
						$this->db->where('abq_product.del','0');
						$product_data = $this->db->get()->row_array();
						
						if(((is_array($product_data) && sizeof($product_data) > 0) ))
						{
							
							$table .= "<tr><td>".($count-1)."</td><td>".str_replace(["'"], "", trim($uploadData[1]))."</td><td>Updated</td></tr>";
							
							
							$data = array(
								'category' => str_replace(["'"], "", trim($uploadData[2])),
								'sub_category' => str_replace(["'"], "", trim($uploadData[3])),
								'product_name' => str_replace(["'"], "", trim($uploadData[0])),
								'product_code' => str_replace(["'"], "", trim($uploadData[1])),
								'price' => str_replace(["'"], "", trim($uploadData[5])),
								'del' => '0',
							);
							
							$this->db->where('product_code', str_replace(["'"," "], "", trim($uploadData[1])));
							$sql =  $this->db->update('abq_product', $data);
						}
						
						
						else
						{
							
							$table .= "<tr><td>".($count-1)."</td><td>".str_replace(["'"], "", trim($uploadData[1]))."</td><td>Imported</td></tr>";
							
							
							$data = array(
								'date_created'  =>   date('Y-m-d H:i:s'),
								'created_by'  =>   isset($_SESSION['uid'])?$_SESSION['uid']:'',
								'category' => str_replace(["'"], "", trim($uploadData[2])),
								'sub_category' => str_replace(["'"], "", trim($uploadData[3])),
								'product_name' => str_replace(["'"], "", trim($uploadData[0])),
								'product_code' => str_replace(["'"], "", trim($uploadData[1])),
								'price' => str_replace(["'"], "", trim($uploadData[5])),
								'del' => '0',
							);
							
							
							$sql = $this->db->insert('abq_product', $data);
							$product_id = $this->db->insert_id();
							
							if($product_id)
							{
								$organisation_product_data = array(
									'date_created'  =>   date('Y-m-d H:i:s'),
									'created_by'  =>   isset($_SESSION['uid'])?$_SESSION['uid']:'',
									'product_id' => isset($product_id)?$product_id:'',
									'organisation_id' => $this->get_org_id(str_replace(["'"], "", trim($uploadData[4]))),
									'organisation_name' => str_replace(["'"], "", trim($uploadData[4])),
									'del' => '0',
								);
							}
							
							$sql = $this->db->insert('abq_product_organization', $organisation_product_data);
							$product_id = $this->db->insert_id();
							
						}
					}
					
				}
				$count++;
			}
			
			
			$table .= "</table>";
			echo $table;
			
			echo "<a href=''>GO BACK</a>";
			
		}  
		
		
		fclose($file);
	}
	
	public function importDesignationData()
	{
		
		$downloadPath = $_FILES["file"]["tmp_name"];
		
		$this->importdesignationcsv($downloadPath);
		
	}
	public function importdesignationcsv($downloadPath)
	{
		
		if(filesize($downloadPath) > 0)
		{
			$count = 1;
			
			$file = fopen($downloadPath, "r"); 
			
			echo "<a href=''>GO BACK</a>";
			$table = "<table><tr><th>S. No.</th><th>Product Code</th><th>Status</th></tr>";
			
			while ( ( $uploadData = fgetcsv($file, 10000, ",") ) !== FALSE)
			{
				
				
				if( $count > 1 && $uploadData[0] != 'Desgnation' )  
				{
					
					print_r($uploadData[0]);
					
					$data_array = array(
						'created_by'=>1,
						'created_date'=>date('Y-m-d H:i:s'),
						'designation'=>$uploadData[0]
					);
					$this->db->insert('abq_designation',$data_array);
					
				}
				
				
				$count++;
			}
			
			
			$table .= "</table>";
			echo $table;
			
			echo "<a href=''>GO BACK</a>";
			
		}  
		
		
		fclose($file);
	}
	
	public function importUserData()
	{
		
		$downloadPath = $_FILES["file"]["tmp_name"];
		
		$this->importUsercsv($downloadPath);
		
	}
	public function importUsercsv($downloadPath)
	{
		
		if(filesize($downloadPath) > 0)
		{
			$count = 1;
			
			$file = fopen($downloadPath, "r"); 
			
			echo "<a href=''>GO BACK</a>";
			$table = "<table><tr><th>S. No.</th><th>Product Code</th><th>Status</th></tr>";
			
			while ( ( $uploadData = fgetcsv($file, 10000, ",") ) !== FALSE)
			{
				
				
				if( $count > 1 && $uploadData[0] != 'Desgnation' )  
				{
					
					// print_r($uploadData[0]);
					
					$data_array = array(
						'created_by'=>1,
						'date_created'=>date('Y-m-d H:i:s'),
						'name'=>isset($uploadData[0])?$uploadData[0]:'',
						'contact_01'=>isset($uploadData[2])?$uploadData[2]:'',
						'emp_code'=>isset($uploadData[5])?$uploadData[5]:'',
						'email'=>$uploadData[6] ?$uploadData[6]:NULL,
						'access_level'=>3,
						'sales_user_type'=>'Inside Sales Executive',
						'username'=>isset($uploadData[5])?$uploadData[5]:'',
						'zone'=>isset($uploadData[7])?$uploadData[7]:'',
						'designation'=>isset($uploadData[3])?$uploadData[3]:'',
						'password'=>isset($uploadData[2])?$uploadData[2]:'',
					);
					$status=$this->db->insert('abq_user',$data_array);
					
					$last_query=$this->db->last_query();
					
					
					// echo $last_query;
					
					// die;
					// print_r($data_array);
					
					print_r($status);
					
				}
				
				
				$count++;
				// print_r($count);
				
			}
			
			
			$table .= "</table>";
			echo $table;
			
			echo "<a href=''>GO BACK</a>";
			
		}  
		
		
		fclose($file);
	}
	
	public function importFieldUserData()
	{
		
		$downloadPath = $_FILES["file"]["tmp_name"];
		
		$this->importFieldUsercsv($downloadPath);
		
	}
	public function importFieldUsercsv($downloadPath)
	{
		
		if(filesize($downloadPath) > 0)
		{
			$count = 1;
			
			$file = fopen($downloadPath, "r"); 
			
			echo "<a href=''>GO BACK</a>";
			$table = "<table><tr><th>S. No.</th><th>Product Code</th><th>Status</th></tr>";
			
			while ( ( $uploadData = fgetcsv($file, 10000, ",") ) !== FALSE)
			{
				
				
				if( $count > 1 && $uploadData[0] != 'Desgnation' )  
				{
					
					$data_array = array(
						'created_by'=>1,
						'date_created'=>date('Y-m-d H:i:s'),
						'name'=>isset($uploadData[0])?$uploadData[0]:'',
						'contact_01'=>isset($uploadData[2])?$uploadData[2]:'',
						'emp_code'=>isset($uploadData[7])?$uploadData[7]:'',
						'access_level'=>4,
						'sales_user_type'=>'Field Sales Executive',
						'username'=>isset($uploadData[7])?$uploadData[7]:'',
						'zone'=>isset($uploadData[6])?$uploadData[6]:'',
						'designation'=>isset($uploadData[3])?$uploadData[3]:'',
						'password'=>isset($uploadData[2])?$uploadData[2]:'',
					);
					$status=$this->db->insert('abq_user',$data_array);
					
					
				}
				
				
				$count++;
				// print_r($count);
				
			}
			
			
			$table .= "</table>";
			echo $table;
			
			echo "<a href=''>GO BACK</a>";
			
		}  
		
		
		fclose($file);
	}
	
	public function test()
	{
		$this->db->select('abq_user.access_level,abq_user.name,abq_user.id');
		$this->db->from('abq_user');
		$this->db->like('abq_user.name','sonu');
		$this->db->where('abq_user.del',0);
		
		$assignUser = $this->db->get()->row_array();
	}
	public function importAssignUserData()
	{
		
		$downloadPath = $_FILES["file"]["tmp_name"];
		
		$this->importAssignUsercsv($downloadPath);
		
	}
	public function importAssignUsercsv($downloadPath)
	{
		
		echo "function call";
		if(filesize($downloadPath) > 0)
		{
			$count = 1;
			
			$file = fopen($downloadPath, "r"); 
			
			echo "<a href=''>GO BACK</a>";
			$table = "<table><tr><th>S. No.</th><th>Product Code</th><th>Status</th></tr>";
			
			while ( ( $uploadData = fgetcsv($file, 10000, ",") ) !== FALSE)
			{
				
				echo "in loop";
				if( $count > 1 && $uploadData[0] != 'EMPLOYEE NAME' )  
				{
					
					echo "in if";
					$this->db->select('abq_user.id');
					$this->db->from('abq_user');
					$this->db->where('abq_user.name',$uploadData[0]);
					$this->db->where('abq_user.del', 0);
					
					$userId=$this->db->get()->row_array();
					
					$this->db->select('abq_user.id,abq_user.name,abq_user.sales_user_type');
					$this->db->from('abq_user');
					$this->db->where('abq_user.name',$uploadData[2]);
					$this->db->where('abq_user.del', 0);
					
					
					$assignUser=$this->db->get()->row_array();
					
					$this->db->select('id');
					$this->db->from('abq_user_assign');
					$this->db->where('abq_user_assign.user_id',$userId['id']);
					$this->db->where('abq_user_assign.assign_to',$assignUser['id']);
					
					$exist=$this->db->get()->row_array();
					
					
					if(isset($userId['id']) && $userId['id'] && isset($assignUser['id']) && $assignUser['id'] && $userId['id'] != $assignUser['id']) {
						
						echo "in 2nd if";
						if(isset($exist['id']) && $exist['id'])
						{
							echo "already Exist";
						}
						else{
							$data_array= array(
								'date_created'=>date('Y-m-d H:i:s'),
								'created_by'=>1,
								'user_id'=>$userId['id'],
								'assign_to'=>$assignUser['id'],
								'assign_to_name'=>$assignUser['name'],
								'assign_to_role'=>$assignUser['sales_user_type']
							);
							
							$this->db->insert('abq_user_assign',$data_array);
							
							echo "test";
							
						}
						
					}
				}
				
				
				$count++;
				// print_r($count);
				
			}
			
			
			$table .= "</table>";
			echo $table;
			
			echo "<a href=''>GO BACK</a>";
			
		}  
		
		
		fclose($file);
	}
	
	public function importAlternateUserData()
	{
		
		$downloadPath = $_FILES["file"]["tmp_name"];
		
		$this->importAlternateUsercsv($downloadPath);
		
	}
	public function importAlternateUsercsv($downloadPath)
	{
		
		if(filesize($downloadPath) > 0)
		{
			$count = 1;
			
			$file = fopen($downloadPath, "r"); 
			
			echo "<a href=''>GO BACK</a>";
			$table = "<table><tr><th>S. No.</th><th>Product Code</th><th>Status</th></tr>";
			
			while ( ( $uploadData = fgetcsv($file, 10000, ",") ) !== FALSE)
			{
				
				
				if( $count > 1 && $uploadData[0] != 'Desgnation' )  
				{
					
					$data_array = array(
						'created_by'=>1,
						'date_created'=>date('Y-m-d H:i:s'),
						'name'=>isset($uploadData[0])?$uploadData[0]:'',
						'designation'=>isset($uploadData[1])?$uploadData[1]:'',
						'contact_01'=>isset($uploadData[6])?$uploadData[6]:'',
						'emp_code'=>isset($uploadData[5])?$uploadData[5]:'',
						'access_level'=>3,
						'sales_user_type'=>'Inside Sales Executive',
						'username'=>isset($uploadData[5])?$uploadData[5]:'',
						'zone'=>'NORTH-1',
						'password'=>isset($uploadData[6])?$uploadData[6]:'',
						'state_name'=>isset($uploadData[7])?$uploadData[7]:'',
						'district_name'=>isset($uploadData[8])?$uploadData[8]:'',
						'street'=>isset($uploadData[9])?$uploadData[9]:'',
					);
					$status=$this->db->insert('abq_user',$data_array);
					
					$insert_id = $this->db->insert_id();
					
					if((isset($insert_id) && $insert_id !='') &&(isset($uploadData[3]) && $uploadData[3] != ''))
					{
						$okaya_user=array(
							'date_created'=>date('Y-m-d H:i:s'),
							'created_by'=>1,
							'user_id'=>$insert_id,
							'user_name'=>$uploadData[0],
							'user_role'=>3,
							'organisation_id'=>1,
							'organisation_name'=>'Okaya',
							'last_updated'=>date('Y-m-d H:i:s')
						);
						
						$this->db->insert('abq_user_organization',$okaya_user);
					}
					if((isset($insert_id) && $insert_id !='') && (isset($uploadData[4]) && $uploadData[4] != ''))
					{
						$nasaka_user=array(
							'date_created'=>date('Y-m-d H:i:s'),
							'created_by'=>1,
							'user_id'=>$insert_id,
							'user_name'=>$uploadData[0],
							'user_role'=>3,
							'organisation_id'=>2,
							'organisation_name'=>'Nasaka',
							'last_updated'=>date('Y-m-d H:i:s')
						);
						
						$this->db->insert('abq_user_organization',$nasaka_user);
					}
					
					
				}
				
				
				$count++;
				// print_r($count);
				
			}
			
			
			$table .= "</table>";
			echo $table;
			
			echo "<a href=''>GO BACK</a>";
			
		}  
		
		
		fclose($file);
	}
	
	public function importStatusReasonData()
	{
		
		$downloadPath = $_FILES["file"]["tmp_name"];
		
		$this->importStatusReasoncsv($downloadPath);
		
	}
	public function importStatusReasoncsv($downloadPath)
	{
		
		if(filesize($downloadPath) > 0)
		{
			$count = 1;
			
			$file = fopen($downloadPath, "r"); 
			
			echo "<a href=''>GO BACK</a>";
			$table = "<table><tr><th>S. No.</th><th>Product Code</th><th>Status</th></tr>";
			
			while ( ( $uploadData = fgetcsv($file, 10000, ",") ) !== FALSE)
			{
				
				
				if( $count > 1 && $uploadData[0] != 'Desgnation' )  
				{
					$data_array = array(
						'status'=>isset($uploadData[0])?$uploadData[0]:'',
						'name'=>isset($uploadData[1])?$uploadData[1]:''
					);
					$status=$this->db->insert('abq_lost_reason',$data_array);
					
					$insert_id = $this->db->insert_id();
					
					echo $insert_id;
				}
				
				
				echo "<br>";
				
				$count++;
				
			}
			
			
			$table .= "</table>";
			echo $table;
			
			echo "<a href=''>GO BACK</a>";
			
		}  
		
		
		fclose($file);
	}
	
	public function importOldLeadData()
	{
		
		$downloadPath = $_FILES["file"]["tmp_name"];
		
		$this->importOldLeadcsv($downloadPath);
		
	}
	
	public function importOldLeadcsv($downloadPath)
	{
		
		if(filesize($downloadPath) > 0)
		{
			$count = 1;
			
			$file = fopen($downloadPath, "r"); 
			
			echo "<a href=''>GO BACK</a>";
			$table = "<table><tr><th>S. No.</th><th>Product Code</th><th>Status</th></tr>";
			
			while ( ( $uploadData = fgetcsv($file, 10000, ",") ) !== FALSE)
			{
				
				
				if( $count > 1 && $uploadData[0] != 'S.N.' )  
				{
					
					/*********************************************************************/
					$this->db->select('abq_dr_type.id,abq_dr_type.type');
					$this->db->from('abq_dr_type');
					$this->db->where('abq_dr_type.del',0);
					$this->db->like('abq_dr_type.type',$uploadData[11]);
					
					$dr_type=$this->db->get()->row_array();
					
					if(isset($dr_type['id']) && $dr_type['id']!='')
					{
						$type_id=$dr_type['id'];
						$type_name=$dr_type['type'];
					}
					else
					{
						
						$segment_array = array(
							'date_created'=>date('Y-m-d H:i:s'),
							'type'=>$uploadData[11]
						);
						
						$this->db->insert('abq_dr_type',$segment_array);
						
						$type_id=$this->db->insert_id();
						$type_name=$uploadData[11];
					}
					
					/*********************************************************************/
					
					
					if(isset($uploadData[7]) && $uploadData[7]!='')
					{
						$existState=$uploadData[7];
					}
					elseif(isset($uploadData[8]) && $uploadData[8]!='')
					{
						$existState=$uploadData[8];
					}
					else
					{
						$existState=NULL;
					}
					
					if(isset($existState) && $existState!=NULL)
					{
						$this->db->select('abq_postal_master.state_name');
						$this->db->from('abq_postal_master');
						$this->db->like('abq_postal_master.state_name',$existState);
						
						$fetchState=$this->db->get()->row_array();
						
					}
					
					/*********************************************************************/
					
					$this->db->select('abq_dr_category.name');
					$this->db->from('abq_dr_category');
					$this->db->like('abq_dr_category.name',$uploadData[24]);
					
					$existCategory=$this->db->get()->row_array();
					
					if(isset($existCategory['name']) && $existCategory['name']!='')
					{
						$category=$existCategory['name'];
					}
					else
					{
						$category_array = array(
							'date_created'=>date('Y-m-d H:i:s'),
							'name'=>$uploadData[24]
						);
						
						$this->db->insert('abq_dr_category',$category_array);
						
						$category=$uploadData[24];
					}
					
					/************************************************************************** */
					
					$dateCreated = date_create($uploadData[2]);
					$dateInFormat = date_format($dateCreated, 'Y-m-d H:i:s');
					
					$leadArray = array(
						'date_created'=> $dateInFormat,
						'created_by'=>1,
						'created_by_type'=>'Admin',
						'created_by_name'=>'Admin',
						'lead'=>1,
						'type_id'=>$type_id,
						'type_name'=>$type_name,
						'dr_name'=>$uploadData[3]?$uploadData[3]:NULL,
						'dr_code'=>$uploadData[4]?$uploadData[4]:NULL,
						'contact_name'=>$uploadData[15]?$uploadData[15]:NULL,
						'contact_mobile_no'=>$uploadData[16]?$uploadData[16]:NULL,
						'category'=>$category ? $category : NULL,
						'email'=>$uploadData[18]?$uploadData[18]:NULL,
						'landline_no' => NULL,
						'street'=>$uploadData[6]?$uploadData[6]:NULL,
						'okaya_org' => 1,
						'state_name'=>isset($fetchState['state_name']) && $fetchState['state_name'] ? $fetchState['state_name'] : NULL,
						'status'=>'Validate',
						'source_name'=>$uploadData[13]?$uploadData[13]:NULL
					);
					
					if($this->db->insert('abq_dr',$leadArray)) 
					{
						
						$inserted_drId = $this->db->insert_id();
						
						$this->db->select('abq_user.access_level,abq_user.name,abq_user.id');
						$this->db->from('abq_user');
						$this->db->where('LOWER(abq_user.name)',strtolower($uploadData[5]));
						$this->db->where('abq_user.del',0);
						
						$assignUser = $this->db->get()->row_array();
						
						
						
						if(isset($assignUser['access_level']) && $assignUser['access_level']!='')
						{
							if($assignUser['access_level']=='4')
							{
								$assignUserArray = array(
									'assign_to_name'=>$assignUser['name'],
									'assign_to'=>$assignUser['id']
								);
								
								$this->db->set($assignUserArray);
								$this->db->where('abq_dr.id',$inserted_drId);
								$this->db->update('abq_dr');
							}
							else
							{
								
								$dateCreated = date_create($uploadData[2]);
								$dateInFormat = date_format($dateCreated, 'Y-m-d H:i:s');
								
								$assignUserArray = array(
									'date_created'=> $dateInFormat,
									'created_by'=>1,
									'created_by_name'=>'Admin',
									'dr_id'=>$inserted_drId,
									'dr_name'=>$uploadData[3],
									'type_id'=>$type_id,
									'status' => 'Validate',
									'okaya_org' => 1,
									'user_id'=>$assignUser['id'],
									'user_name'=>$assignUser['name'],
									'user_role'=>3
								);
								
								$this->db->insert('abq_dr_inside_assign',$assignUserArray);
							}
						}
						
					} else {
						
						$errorData = $this->db->error();
						
						$errorCode = $errorData['code'];
						
						if($errorCode == '1062') {
							
							echo $uploadData[3] . ' - ' . $uploadData[4]. ' - ' . $uploadData[16]. "<br>" . $errorData['message'] . "<br><br>";
							
						} else {
							
							// echo $this->db->last_query();
							// die();
							
						}
						
						//  echo $uploadData[3] . ' - ' . $uploadData[4]. "<br>";
					}
					
					
					// echo $inserted_drId;
					
					
					/*********************************************************************/
					
					
				}
				
				
				echo "<br>";
				
				$count++;
				
			}
			
			
			$table .= "</table>";
			echo $table;
			
			echo "<a href=''>GO BACK</a>";
			
		}  
		
		
		fclose($file);
	}
	
	public function assignOrgnation()
	{
		
		$this->db->select('abq_dr.id,abq_dr.dr_name');
		$this->db->from('abq_dr');
		$this->db->where('abq_dr.del',0);
		
		$result_data=$this->db->get()->result_array();
		
		if(sizeof($result_data))
		{
			for ($i=0; $i < sizeof($result_data); $i++) { 
				
				$okaya_user=array(
					'date_created'=>date('Y-m-d H:i:s'),
					'created_by'=>1,
					'dr_id'=>$result_data[$i]['id'],
					'dr_name'=>$result_data[$i]['dr_name'],
					'organisation_id'=>1,
					'organisation_name'=>'Okaya',
					'last_updated'=>date('Y-m-d H:i:s')
				);
				
				
				if($this->db->insert('abq_dr_organisation',$okaya_user)) 
				{
					
					echo "Success" . "<br>";
					
				} 
				else 
				{
					
					$errorData = $this->db->error();
					
					$errorCode = $errorData['code'];
					
					print_r( $errorData );
					
					echo $errorCode. "<br>";
				}
				
				// die();
				
			}
		}
	}
	

	public function assignUserOrgnation()
	{
		
		$this->db->select('abq_user.id,abq_user.name,abq_user.access_level');
		$this->db->from('abq_user');
		$this->db->where('abq_user.del',0);
		
		$result_data=$this->db->get()->result_array();
		
		
		if(sizeof($result_data))
		{
			for ($i=0; $i < sizeof($result_data); $i++) { 
				
				$this->db->select('abq_user_organization.user_id');
				$this->db->from('abq_user_organization');
				$this->db->where('abq_user_organization.user_id',$result_data[$i]['id']);
				$this->db->where('abq_user_organization.del',0);
				
				$existUser = $this->db->get()->row_array();
				
				if(!isset($existUser['user_id']) || !$existUser['user_id'])
				{
					$okaya_user=array(
						'date_created'=>date('Y-m-d H:i:s'),
						'created_by'=>1,
						'user_id'=>$result_data[$i]['id'],
						'user_name'=>$result_data[$i]['name'],
						'user_role'=>$result_data[$i]['access_level'],
						'organisation_id'=>1,
						'organisation_name'=>'Okaya',
						'last_updated'=>date('Y-m-d H:i:s')
					);
					
					
					if($this->db->insert('abq_user_organization',$okaya_user)) 
					{
						
						echo "Success";
						
					} 
					else 
					{
						
						$errorData = $this->db->error();
						
						$errorCode = $errorData['code'];
						
						print_r( $errorData );
						
						echo $errorCode. "<br>";
					}
				}
				
				
				
				// die();
				
			}
		}
		
	}


	public function testData() {


		   sleep(12000000);
	}
	
	
	// ADMIN UPLOAD EXCEL CLOSED 
	
	
	
	
}
