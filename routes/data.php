<?php 
$directory = dirname(getcwd()) . '/content/*';
echo json_encode(glob($directory));