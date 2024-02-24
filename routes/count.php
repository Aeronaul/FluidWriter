<?php
$imgdir = dirname(getcwd()) . '/content/' . $_SESSION["story"] . '/img/';
$fi1 = new FilesystemIterator($imgdir);
$auddir = dirname(getcwd()) . '/content/' . $_SESSION["story"] . '/aud/';
$fi2 = new FilesystemIterator($auddir);

$arr = array ('img' => iterator_count($fi1),'aud' => iterator_count($fi2));
echo json_encode($arr);
