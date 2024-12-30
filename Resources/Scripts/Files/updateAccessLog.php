<?php

$suffixID = $_POST["suffixID"];
$newLog = $_POST["newLog"];

file_put_contents("..\\..\\Data\\" . $suffixID . "\\accessLog.json", $newLog);

?>