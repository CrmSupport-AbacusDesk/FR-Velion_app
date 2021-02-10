<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');


header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Authorization, Content-Type, X-Auth-Token');

require_once('App_SharedData.php');


class App_Order extends App_SharedData
{
	public function __construct() {
		
		parent:: __construct();
		$this->load->helper("url");
		$this->load->library("pagination");
		$this->load->database();
	}

	public function onSaveOrderHandler() {

		$_POST = json_decode(file_get_contents('php://input'), true);

        $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';

		if(isset($loginData['loginType']) && isset($loginData['loginId']) && $loginData['loginType'] &&  $loginData['loginId'])  {

			    $inputData = $_POST;

			    $this->db->select('abq_dr.id, abq_dr.dr_name, abq_dr.type_id, abq_dr.type_name');
			    $this->db->from('abq_dr');
			    $this->db->where('abq_dr.id', $inputData['drId']);
			    $this->db->where('abq_dr.del','0');
	            $drData = $this->db->get()->row_array();

	            $itemCount = COUNT($inputData['cartItemData']);

	            $deliveryById = $inputData['deliveryById'] ? $inputData['deliveryById'] : 0;


                $this->db->select('abq_dr_order.order_no');
			    $this->db->from('abq_dr_order');
			    $this->db->where('abq_dr_order.del','0');
			    $this->db->order_by('abq_dr_order.id', 'DESC');
	            $orderData = $this->db->get()->row_array();

	            if(isset($orderData['order_no']) && $orderData['order_no']) {

	            	  $orderNo = $orderData['order_no'] + 1;

	            } else {

	            	  $orderNo = 1001;
	            }


			    $insertData = array(

			    	 'date_created' => $this->dateData['dateTimeCreated'],
			    	 'created_by' => $loginData['loginId'],
			    	 'created_by_name' => $loginData['loginName'],
			    	 'created_by_type' => $loginData['loginType'],
			    	 'order_date' => $this->dateData['dateCreated'],
			    	 'order_no' => $orderNo,
			    	 'dr_id' => $drData['id'],
			    	 'dr_name' => $drData['dr_name'],
			    	 'type' => $drData['type_id'],
			    	 'dr_type_name' => $drData['type_name'],
			    	 'item_count' => COUNT($inputData['cartItemData']),
			    	 'item_total' => $inputData['cartSummaryData']['preDiscountTotal'],
			    	 'dis_amt' => $inputData['cartSummaryData']['discountAmount'],
			    	 'cgst_amt' => $inputData['cartSummaryData']['cgstAmount'],
			    	 'sgst_amt' => $inputData['cartSummaryData']['sgstAmount'],
			    	 'igst_amt' => $inputData['cartSummaryData']['igstAmount'],
			    	 'net_total' => $inputData['cartSummaryData']['itemFinalAmount'],
			    	 'order_status' => 'Pending',
			    	 'delivery_from' => $deliveryById
			    );


			    if($this->db->insert('abq_dr_order', $insertData)) {

                    $orderId = $this->db->insert_id();

                    foreach ($inputData['cartItemData'] as $key => $row) {

				   	    $itemRow = array(

				   	    	 'date_created' => $this->dateData['dateTimeCreated'],
				   	    	 'created_by' => $loginData['loginId'],
				   	    	 'created_by_type' => $loginData['loginType'],
				   	    	 'order_id' => $orderId,
				   	    	 'category' => $row['categoryName'],
				   	    	 'sub_category' => $row['subCategoryName'],
				   	    	 'product_name' => $row['productName'],
				   	    	 'product_code' => $row['productCode'],
				   	    	 'product_id' => $row['productId'],
				   	    	 'qty' => $row['qty'],
				   	    	 'rate' => $row['rate'],
				   	    	 'amount' => $row['qty'] * $row['rate'],
				   	    	 'dis_percent' => $row['discountPercent'],
				   	    	 'dis_amt' => $row['discountAmount'],
				   	    	 'item_total' => $row['discountedAmount'],
				   	    	 'cgst_percent' => $row['cgstPercent'],
				   	    	 'cgst_amount' => $row['cgstAmount'],
				   	    	 'sgst_percent' => $row['sgstPercent'],
				   	    	 'sgst_amount' => $row['sgstAmount'],
				   	    	 'igst_percent' => $row['igstPercent'],
				   	    	 'igst_amount' => $row['igstAmount'],
				   	    	 'item_net_total' => $row['itemFinalAmount'],
	                    );

	                    $this->db->insert('abq_dr_order_item', $itemRow);
			        }

			        $description = 'New Order Created';

			        $this->onSaveSummaryLogsData($loginData, $drData['id'], 'Order', $description);
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


	public function onSaveQuotationData() {

		$_POST = json_decode(file_get_contents('php://input'), true);

        $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';

		if(isset($loginData['loginType']) && isset($loginData['loginId']) && $loginData['loginType'] &&  $loginData['loginId'])  {

			  $inputData = $_POST;

			  $quotationId = '';
			  $itemCount = COUNT($inputData['cartItemData']);

			  if(isset($inputData['quoteId']) && $inputData['quoteId']) {

                  $quotationId = $inputData['quoteId'];
                  $quotationRemark = 'Quotation Updated!';

			  } else {

                     $quotationRemark = 'New Quotation Created!';

			  	     $this->db->select('abq_dr.id, abq_dr.dr_name, abq_dr.type_id, abq_dr.type_name');
				     $this->db->from('abq_dr');
				     $this->db->where('abq_dr.id', $inputData['drId']);
				     $this->db->where('abq_dr.del','0');
		             $drData = $this->db->get()->row_array();

				     $insertData = array(

				    	 'date_created' => $this->dateData['dateTimeCreated'],
				    	 'created_by' => $loginData['loginId'],
				    	 'created_by_name' => $loginData['loginName'],
				    	 'dr_id' => $drData['id'],
				    	 'dr_name' => $drData['dr_name'],
				    	 'type' => $drData['type_id'],
				    	 'item_count' => COUNT($inputData['cartItemData']),
				    	 'item_total' => $inputData['cartSummaryData']['preDiscountTotal'],
				    	 'dis_amt' => $inputData['cartSummaryData']['discountAmount'],
				    	 'cgst_amt' => $inputData['cartSummaryData']['cgstAmount'],
				    	 'sgst_amt' => $inputData['cartSummaryData']['sgstAmount'],
				    	 'igst_amt' => $inputData['cartSummaryData']['igstAmount'],
				    	 'net_total' => $inputData['cartSummaryData']['itemFinalAmount'],
				    	 'quotation_status' => 'Pending',
				    	 'quotation_remark' => $quotationRemark,
			         );


				     if($this->db->insert('abq_dr_quotation', $insertData)) {

	                     $quotationId = $this->db->insert_id();

	                     $updatedData = array(
	                          'quotation' => 1
			             );

		                $this->db->where('id', $drData['id']);
		                $this->db->update('abq_dr', $updatedData);
			         } 
			  }

		      if($quotationId) {

	                $this->db->where('quotation_id', $quotationId);
	                $this->db->delete('abq_dr_quotation_item');

	                foreach ($inputData['cartItemData'] as $key => $row) {

				   	    $itemRow = array(

				   	    	 'date_created' => $this->dateData['dateTimeCreated'],
				   	    	 'created_by' => $loginData['loginId'],
				   	    	 'created_by_type' => $loginData['loginType'],
				   	    	 'quotation_id' => $quotationId,
				   	    	 'category' => $row['categoryName'],
				   	    	 'sub_category' => $row['subCategoryName'],
				   	    	 'product_name' => $row['productName'],
				   	    	 'product_code' => $row['productCode'],
				   	    	 'product_id' => $row['productId'],
				   	    	 'qty' => $row['qty'],
				   	    	 'rate' => $row['rate'],
				   	    	 'amount' => $row['qty'] * $row['rate'],
				   	    	 'dis_percent' => $row['discountPercent'],
				   	    	 'dis_amt' => $row['discountAmount'],
				   	    	 'item_total' => $row['discountedAmount'],
				   	    	 'cgst_percent' => $row['cgstPercent'],
				   	    	 'cgst_amount' => $row['cgstAmount'],
				   	    	 'sgst_percent' => $row['sgstPercent'],
				   	    	 'sgst_amount' => $row['sgstAmount'],
				   	    	 'igst_percent' => $row['igstPercent'],
				   	    	 'igst_amount' => $row['igstAmount'],
				   	    	 'item_net_total' => $row['itemFinalAmount'],
	                    );

	                    $this->db->insert('abq_dr_quotation_item', $itemRow);

			        }

			        $this->onSaveSummaryLogsData($loginData, $inputData['drId'],'Quotation', $quotationRemark);

			        $this->onSendQuotationMailData($quotationId);
		   
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


	public function onSendQuotationMailData($quotationId) {

	     $this->db->select('abq_dr_quotation.*');
		 $this->db->from('abq_dr_quotation');
		 $this->db->where('id', $quotationId);
		 $this->db->where('del', 0);
		 $quotationData = $this->db->get()->row_array();

		 $this->db->select('abq_dr.*');
	     $this->db->from('abq_dr');
	     $this->db->where('abq_dr.id', $quotationData['dr_id']);
	     $this->db->where('abq_dr.del','0');
         $drData = $this->db->get()->row_array();


		 $this->db->select('abq_dr_quotation_item.*');
		 $this->db->from('abq_dr_quotation_item');
		 $this->db->where('quotation_id', $quotationId);
		 $this->db->where('del', 0);
		 $quotationItemData = $this->db->get()->result_array();

         $logo_url = "https://phpstack-83335-1084154.cloudwaysapps.com/assets/img/logo.jpg" ;    
	     
		 $config = Array(
			'protocol' => 'smtp',
			'smtp_host' => 'ssl://smtp.googlemail.com',
			'smtp_port' => 465,
			'smtp_user' => 'avtaar@abacusdesk.co.in',
			'smtp_pass' => 'abacusdesk@3212',
			'mailtype'  => 'html',
			'charset'   => 'iso-8859-1',
			'wordwrap' => TRUE
		 );

		 $this->load->library('email', $config);
		 $this->email->set_newline("\r\n");
		 $this->email->from('avtaar@abacusdesk.co.in', 'Okaya');
		 $this->email->to('avtaar@abacusdesk.co.in');
		 $this->email->subject('Quotation Okaya');
		 $this->email->attach($logo_url);
		 $cid = $this->email->attachment_cid($logo_url);

		 $html =
		 '<html lang="en">
		 <head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<meta http-equiv="X-UA-Compatible" content="ie=edge">
			<title>Document</title>
		 </head>
		 <body>
			<div style="width: 680px; margin: 0 auto; background: #f5fdff; font-size: 14px; border:1px #cff5ff solid; border-radius: 4px; font-family: calibri; padding: 10px; box-sizing: border-box;">
				<table style="table-layout: fixed; width: 100%;">
					<tr>
						<td style="text-align: left; vertical-align: top;">
						<img style="width: 100px; margin-bottom: 10px;" alt="photo1">
						<p style="padding: 0; margin: 0px;">'.$quotationData['created_by_name'].'</p>
						<p style="padding: 0; margin: 0px;">#QUO'.$quotationData['id'].'</p>
					</td>

					<td style="text-align: center; ">
						<h1 style="padding: 0; margin: 0px; font-size: 16px; margin-bottom: 20px;">Customer Information</h1>
						<p style="padding: 0; margin: 0px; font-weight: 600;">'.$quotationData['dr_name'].'</p>
						<p style="padding: 0; margin: 0px;"><strong>MOB &nbsp; : &nbsp;</strong> '.$drData['contact_mobile_no'].'</p>
					</td>
				</tr>
				<tr>
					<td colspan="2" style="vertical-align: top;">
						<h1 style="padding: 0; margin: 0px; font-size: 16px; text-decoration: underline; margin-top: 30px; letter-spacing: 1px;">QUOTATION SUMMARY :</h1>
					</td>
				</tr>
			</table>

			<table border="1" style="table-layout: fixed; width: 100%; border-collapse:collapse; background: #fff; margin-top: 20px; text-align: left;">
				<tr>
					<th style="width:40px; text-align: center; padding: 5px;">Sr No</th>
					<th style="padding: 5px;">Item Name</th>
					<th style="width:40px; text-align: center; padding: 5px;">Qty</th>
					<th style="width:40px; text-align: center; padding: 5px;">Rate &#x20B9;</th>
					<th style="width:60px; text-align: center; padding: 5px;">Amount &#x20B9;</th>
					<th style="width:60px; text-align: center; padding: 5px;">Discount &#x20B9;</th>
					<th style="width:50px; text-align: center; padding: 5px;">CGST</th>
					<th style="width:50px; text-align: center; padding: 5px;">SGST</th>
					<th style="width:50px; text-align: center; padding: 5px;">IGST</th>
					<th style="padding: 5px; width: 80px; text-align: right;">Item Total &#x20B9;</th>
				</tr>';

	     	$count=1;

	      	foreach ($quotationItemData as $key => $row) {

				$html.='
	                <tr>
	      				<th style="padding: 5px; text-align: center;">'.$count.'</th>
	      				<td style="padding: 5px; text-align: center;">'.$row['category'].', '.$row['sub_category'].', '.$row['product_name'].', '.$row['product_code'].'</td>
						<td style="width:40px; text-align: center; padding: 5px;">'.$row['qty'].'</td>
						<td style="width:40px; text-align: center; padding: 5px;">'.$row['rate'].'</td>
						<td style="width:60px; text-align: center; padding: 5px;">'.$row['amount'].'</td>
						<td style="width:60px; text-align: center; padding: 5px;">'.$row['dis_amt'].' ('.$row['dis_percent'].'%)</td>
						<td style="width:50px; text-align: center; padding: 5px;">'.round($row['cgst_amount'],2).'<br>('.round($row['cgst_percent'],2).' %)'.'</td>
						<td style="width:50px; text-align: center; padding: 5px;">'.round($row['sgst_amount'],2).'<br>('.round($row['sgst_percent'],2).' %)'.'</td>
						<td style="width:50px; text-align: center; padding: 5px;">'.round($row['igst_amount'],2).'<br>('.round($row['igst_percent'],2).' %)'.'</td>
						<td style="padding: 5px; width: 80px; text-align: right;">'.$row['item_net_total'].'</td>
	      			</tr>';

		        $count++;
	        }



			  $html.='</table>
						<table style="table-layout: fixed; width: 100%; border-collapse:collapse;  margin-top: 20px; text-align: left;">

							<tr>
								<td style="background : #f5fdff; padding: 5px; text-align: right; font-weight: 600;">Pre Discount Total (&#x20B9;)</td>
								<td style="background : #f5fdff; width: 180px; padding: 5px; text-align: right; font-weight: 600;"> '.$quotationData['item_total'].' </td>
							</tr>

							<tr>
								<td style="background : #f5fdff; padding: 5px; text-align: right; font-weight: 600;">Discount (&#x20B9;)</td>
								<td style="background : #f5fdff; width: 180px; padding: 5px; text-align: right; font-weight: 600;"> '.$quotationData['dis_amt'].' </td>
							</tr>
							
							<tr>
								<td style="background : #f5fdff; padding: 5px; text-align: right; font-weight: 600;">CGST (&#x20B9;)</td>
								<td style="background : #f5fdff; width: 180px; padding: 5px; text-align: right; font-weight: 600;">'.round($quotationData['cgst_amt'],2).'</td>
							</tr>

							<tr>
								<td style="background : #f5fdff; padding: 5px; text-align: right; font-weight: 600;">SGST (&#x20B9;)</td>
								<td style="background : #f5fdff; width: 180px; padding: 5px; text-align: right; font-weight: 600;">'.round($quotationData['sgst_amt'],2).'</td>
							</tr>

							<tr>
								<td style="background : #f5fdff; padding: 5px; text-align: right; font-weight: 600;">IGST (&#x20B9;)</td>
								<td style="background : #f5fdff; width: 180px; padding: 5px; text-align: right; font-weight: 600;">'.round($quotationData['igst_amt'],2).'</td>
							</tr>

							<tr>
								<td style="background : #f5fdff; padding: 5px; text-align: right; font-weight: 600;">Grand Total (&#x20B9;)</td>
								<td style="background : #f5fdff; width: 180px; padding: 5px; text-align: right; font-weight: 600;"> '.round($quotationData['net_total'],2).' </td>
							</tr>
						</table>
					</div>
				</body>
			</html>';
			// echo $html;
			
			$this->email->message($html);
			if($this->email->send())
			{
				$msg = "success";
			}
			else
			{
				// echo $this->email->print_debugger();
				$msg = "error";
			}
			
			$result = array('msg' => $msg);

	}



	public function onSaveRequirementData() {

		$_POST = json_decode(file_get_contents('php://input'), true);

        $loginData = $_POST && $_POST['loginData'] ? $_POST['loginData'] : '';

		if(isset($loginData['loginType']) && isset($loginData['loginId']) && $loginData['loginType'] &&  $loginData['loginId'])  {

			    $inputData = $_POST;

			    $this->db->select('abq_dr.id, abq_dr.dr_name, abq_dr.type_id, abq_dr.type_name');
			    $this->db->from('abq_dr');
			    $this->db->where('abq_dr.id', $inputData['drId']);
			    $this->db->where('abq_dr.del','0');
	            $drData = $this->db->get()->row_array();

			   foreach ($inputData['cartItemData'] as $key => $row) {


			   	    $updatedData = array(

			   	    	 'date_created' => $this->dateData['dateCreated'],
			   	    	 'created_by' => $loginData['loginId'],
			   	    	 'created_by_name' => $loginData['loginName'],
			   	    	 'created_by_type' => $loginData['loginAccessLevel'],
			   	    	 'dr_id' => $drData['id'],
			   	    	 'dr_name' => $drData['dr_name'],
			   	    	 'dr_type' => $drData['type_id'],
			   	    	 'dr_type_name' => $drData['type_name'],
			   	    	 'category' => $row['categoryName'],
			   	    	 'sub_category' => $row['subCategoryName'],
			   	    	 'product_name' => $row['productName'],
			   	    	 'product_code' => $row['productCode'],
			   	    	 'product_id' => $row['productId'],
			   	    	 'qty' => $row['qty']
                    );

                    $this->db->insert('abq_dr_requirement', $updatedData);

                    $updatedData = array(
                        'requirement' => 1
                    );

                    $this->db->where('id', $drData['id']);
                    $this->db->update('abq_dr', $updatedData);

                    $description = 'Requirement Updated';
			        $this->onSaveSummaryLogsData($loginData, $drData['id'],'Requirement Updated', $description);
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


    public function onReturnErrorMessage() {

    	    $resultData = array('status' => 'error', 'statusMessage' => 'You are not authorized to access this information!');

    	    echo json_encode($resultData);
    }
	
}

?>




