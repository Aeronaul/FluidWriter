<?php 
$directory = dirname(getcwd()) . '/content/[!_]*';
echo json_encode(glob($directory, GLOB_ONLYDIR));