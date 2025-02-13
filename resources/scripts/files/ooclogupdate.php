<?php

$suffixID = $_POST["suffixID"];
$action = json_decode($_POST["actionJSON"]);

# Timestamp | User | Action | Details
$dataString = $action->timestamp . "," . $action->handle . "," . $action->action . ",\"" . str_replace("\"","\"\"",json_encode($action->details)) . "\"";

file_put_contents("../../../data/" . $suffixID . "/ooc_action_log.csv",PHP_EOL . $dataString,FILE_APPEND);