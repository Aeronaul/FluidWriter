<?php
// echo '<pre>'; print_r($_SESSION); echo '</pre>';
// echo '<pre>'; print_r($_SERVER['DOCUMENT_ROOT']); echo '</pre>';
$name = $_GET['name'];
$type = $_GET['type'];

if ($type === 'img') {
    $files = glob(dirname(getcwd()) . "/content/" . $_SESSION["story"] . "/img/" . $name . ".*");
    header("Location: /content/" . $_SESSION["story"] . "/img/" . basename($files[0]));
} elseif ($type === 'aud') {
    $files = glob(dirname(getcwd()) . "/content/" . $_SESSION["story"] . "/aud/" . $name . ".*");
    header("Location: /content/" . $_SESSION["story"] . "/aud/" . basename($files[0]));
} elseif ($type === 'cimg') {
    $files = glob(dirname(getcwd()) . "/shared/img/" . $name . ".*");
    header("Location: " . substr($files[0], strlen(dirname(getcwd()))));
} elseif ($type === 'caud') {
    $files = glob(dirname(getcwd()) . "/shared/aud/" . $name . ".*");
    header("Location: " . substr($files[0], strlen(dirname(getcwd()))));
}