<?php
// echo '<pre>'; print_r($_FILES); echo '</pre>';
// echo '<pre>'; print_r($_POST); echo '</pre>';
// echo phpinfo();
$basedir = $_SERVER['DOCUMENT_ROOT'] . '/content/' . $_SESSION["story"];
$filename = explode("/", $_FILES['file']['type']);
$uploaddir = $basedir . '/img/';
$uploadfile = $uploaddir . basename($_FILES['file']['name']);
$uploaddir2 = $basedir . '/aud/';
$uploadfile2 = $uploaddir2 . basename($_FILES['file']['name']);
$check = getimagesize($_FILES["file"]["tmp_name"]);
if($check !== false) {
  echo "File is an image - " . $check["mime"] . ".\n";
  if (move_uploaded_file($_FILES['file']['tmp_name'], $uploadfile)) {
      echo "File is valid, and was successfully uploaded.\n";
  } else {
      echo "Upload failed!\n";
  }    
} else if ($filename[0] === "audio" || $filename[0] === "video") {
  echo "File is an audio/video - " . $_FILES['file']['type'] . ".\n";
  if (move_uploaded_file($_FILES['file']['tmp_name'], $uploadfile2)) {
      echo "File is valid, and was successfully uploaded.\n";
  } else {
      echo "Upload failed!\n";
  }    
}