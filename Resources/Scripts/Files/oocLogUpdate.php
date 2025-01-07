<?php

$suffixID = $_POST["suffixID"];
$action = $_POST["actionJSON"];

echo "console.log(". $action .");";

# Timestamp | User | Action | Details
$dataString = $action->timestamp . "," . $action->handle . "," . $action->action . "," . $action->details;

file_put_contents("../../../Data/" . $suffixID . "/OOC_Action_Log.csv",PHP_EOL . $dataString,FILE_APPEND);