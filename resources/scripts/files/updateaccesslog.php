<?php

$suffixID = $_POST["suffixID"];
$newLog = $_POST["newLog"];

file_put_contents("../../../data/" . $suffixID . "/accesslog.json", $newLog);