<?php
$abbr_dir = dirname(getcwd()) . '/abbreviations.json';
$file_content = file_get_contents($abbr_dir);
echo json_encode($file_content);