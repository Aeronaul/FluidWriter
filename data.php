<?php 
$directory = getcwd() . '/content/*';
echo json_encode(glob($directory))
?>