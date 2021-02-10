<?php

class MY_Controller extends CI_Controller {

	public function __construct() {

		header("Access-Control-Allow-Origin: *");
		header("Access-Control-Allow-Methods: POST");
		header("Access-Control-Allow-Headers: Origin, Methods, Content-Type");

		$this->dateData = array('dateCreated' => date('Y-m-d'), 'dateTimeCreated' => date('Y-m-d H:i:s'));

		parent::__construct();

		if (!isset($_SESSION))  {
			session_start();
		}

	}

	
	public function notification($registration_token,$name,$msg,$id,$title)
	{
		
		// define( 'API_ACCESS_KEY','fdjHGdA6Cxg:APA91bGweaX8lV3HIqAh_c5Kkvabe1Q6FiL_9s8BbWqLSrgMgz8fhZHHJUvOmFiBTN0wP9_rNOpyDjGGT-ZyLKUhgMlUTnLhHtZCEzcetUADVaH1afPoP2H7PE6kOW_uHEdyzjWiAkmD');
		$registrationIds = array( $registration_token );
		// prep the bundle

		$senderId='428358686890';
		// $apiKey='AIzaSyBTHobm96Rslnd4Da3wdneQUvX2WoJ43Xs';
		$url='http://fcm.googleapis.com/fcm/send';

		// $msg = array ('msg'=> $msg, 'title'=> $title);


		$message  = array
		(
			'message' 	=> $msg,
			'title'		=> $title,
			'sound' => 1,
			'src' => $title,
			'id' => $id,
		);

		
		
		$fields = array('registration_ids'=>$registrationIds,'data'=>$message);

		// private static $API_ACCESS_KEY = 'AIzaSyDG3fYAj1uW7VB-wejaMJyJXiO5JagAsYI';

		// AAAAY7wq2Ko:APA91bEqg1-OdhBa_AP9foSPRaZWlBf_XeqNJyh1JHdlz67Rdv7_ievoC-A4LnMAE_i2rHE6HznDHi74P6BpinCU2WLJClXLic8q6fiEEYmTDKlldk2f1j-0hRACpawko4z8wp2hnIV0
		$headers = array
		('Authorization: key=' . 'AAAAY7wq2Ko:APA91bEqg1-OdhBa_AP9foSPRaZWlBf_XeqNJyh1JHdlz67Rdv7_ievoC-A4LnMAE_i2rHE6HznDHi74P6BpinCU2WLJClXLic8q6fiEEYmTDKlldk2f1j-0hRACpawko4z8wp2hnIV0',
			'Content-Type: application/json'
		);

// print_r($fields);die();

		$ch = curl_init();
		curl_setopt( $ch,CURLOPT_URL, $url );
		curl_setopt( $ch,CURLOPT_POST, true );
		curl_setopt( $ch,CURLOPT_HTTPHEADER, $headers );
		curl_setopt( $ch,CURLOPT_RETURNTRANSFER, true );
		curl_setopt( $ch,CURLOPT_SSL_VERIFYPEER, false );
		curl_setopt( $ch,CURLOPT_POSTFIELDS, json_encode( $fields ) );
		$result = curl_exec($ch );
		curl_close( $ch );
		// echo $result;

	}




	function my_simple_crypt( $string, $action = 'e' ) {
// you may change these values to your own
		$secret_key = 'my_simple_secret_key';
		$secret_iv = 'my_simple_secret_iv';

		$output = false;
		$encrypt_method = "AES-256-CBC";
		$key = hash( 'sha256', $secret_key );
		$iv = substr( hash( 'sha256', $secret_iv ), 0, 16 );

		if( $action == 'e' ) {
			$output = base64_encode( openssl_encrypt( $string, $encrypt_method, $key, 0, $iv ) );
		}
		else if( $action == 'd' ){
			$output = openssl_decrypt( base64_decode( $string ), $encrypt_method, $key, 0, $iv );
		}

		return $output;
	}







}