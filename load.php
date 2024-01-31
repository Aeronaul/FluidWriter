<?php
$_SESSION["story"] = $_GET['story'];
$uploaddir = getcwd() . '/content/' . $_SESSION["story"];
if (!is_dir($uploaddir)) {
    mkdir($uploaddir);
    mkdir($uploaddir . '/img/');
    mkdir($uploaddir . '/aud/');
}
$uploadfile = $uploaddir . '/script.fld';
$file_content = file_get_contents($uploadfile);
echo json_encode($file_content);
?>