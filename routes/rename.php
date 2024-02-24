<?php
$old_name = dirname(getcwd()) . "/content/" . $_GET['from'];
$new_name = dirname(getcwd()) . "/content/" . $_GET['to'];
rename($old_name, $new_name);