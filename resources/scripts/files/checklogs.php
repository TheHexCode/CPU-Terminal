<?php

$suffixID = $_GET["suffixID"];

if(!file_exists("../../../data/" . $suffixID . "/ooc_action_log.csv"))
{
    file_put_contents("../../../data/" . $suffixID . "/ooc_action_log.csv","Timestamp,User,Action,Details");
}

if(file_exists("../../../data/" . $suffixID . "/accesslog.json"))
{
    echo file_get_contents("../../../data/" . $suffixID . "/accesslog.json");
}
else
{
    file_put_contents("../../../data/" . $suffixID . "/accesslog.json","[]");

    echo "[]";
}