<?php

$suffixID = $_GET["suffixID"];

if(!file_exists("../../../Data/" . $suffixID . "/OOC_Action_Log.csv"))
{
    file_put_contents("../../../Data/" . $suffixID . "/OOC_Action_Log.csv","");
}

if(file_exists("../../../Data/" . $suffixID . "/accessLog.json"))
{
    echo file_get_contents("../../../Data/" . $suffixID . "/accessLog.json");
}
else
{
    file_put_contents("../../../Data/" . $suffixID . "/accessLog.json","[]");

    echo "[]";
}