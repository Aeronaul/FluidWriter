<?php
$uploaddir = getcwd();
$uploadfile = $uploaddir . '/content/' . $_SESSION["story"] . '/script.fld';
$fp = fopen($uploadfile, 'w');
fwrite($fp, file_get_contents('php://input'));
fclose($fp);
?>