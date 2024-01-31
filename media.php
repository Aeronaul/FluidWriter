<?php
// echo '<pre>'; print_r($_GET); echo '</pre>';
// echo '<pre>'; print_r($_SERVER['DOCUMENT_ROOT']); echo '</pre>';
$name = $_GET['name'];
$type = $_GET['type'];

if ($type === 'img') {
    $files = glob($_SERVER['DOCUMENT_ROOT'] . "/content/" . $_SESSION["story"] . "/img/" . $name . ".*");
    header("Location: /content/" . $_SESSION["story"] . "/img/" . basename($files[0]));
} elseif ($type === 'aud') {
    $files = glob($_SERVER['DOCUMENT_ROOT'] . "/content/" . $_SESSION["story"] . "/aud/" . $name . ".*");
    header("Location: /content/" . $_SESSION["story"] . "/aud/" . basename($files[0]));
} 
?>