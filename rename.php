<?php
$old_name = $_SERVER['DOCUMENT_ROOT'] . "/content/" . $_GET['from'];
$new_name = $_SERVER['DOCUMENT_ROOT'] . "/content/" . $_GET['to'];
rename($old_name, $new_name);