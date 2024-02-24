<?php
$_SESSION["story"] = $_GET['story'];
$content_dir = dirname(getcwd()) . '/content/';
if (!is_dir($content_dir)) {
    mkdir($content_dir);
}
$upload_dir = $content_dir . $_SESSION["story"];
if (!is_dir($upload_dir)) {
    mkdir($upload_dir);
    mkdir($upload_dir . '/img/');
    mkdir($upload_dir . '/aud/');
}
$upload_file = $upload_dir . '/script.fld';
$file_content = file_get_contents($upload_file);
echo json_encode($file_content);