<?php

$servername = "localhost";
$username = "db_username";
$password = "db_password";
$dbname = "db_name";

$conn = mysqli_connect($servername,$username,$password,$dbname);

if(!$conn) {

die(" PROBLEM WITH CONNECTION : " . mysqli_connect_error());

}
  
?>