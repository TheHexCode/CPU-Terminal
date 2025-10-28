<?php

require('dbConnect.php');

$targetType = $_POST["targetType"];
$targetID = $_POST["targetID"];
$effect = $_POST["effect"];
$duration = $_POST["duration"] ?? null;
$toggle = $_POST["toggle"];


$insertQuery = "INSERT INTO {$dbName}.!TABLE_NAME!
                            (!TARGET!_id, effect_name!DURATION_APPEND!)
                    VALUES  (!TARGET_ID!, '!EFFECT_NAME!'!EFFECT_DURATION!)";

$removeQuery = "DELETE FROM {$dbName}.!TABLE_NAME!
                WHERE !TARGET!_id = !TARGET_ID!
                    AND effect = '!EFFECT_NAME!'";

if($toggle)
{
    $effectQuery = $insertQuery;
}
else
{
    $effectQuery = $removeQuery;
}

switch($targetType)
{
    case("terminal"):
    {
        $effectQuery = str_replace("!TABLE_NAME!", "sim_session_effects", $effectQuery);
        $effectQuery = str_replace("!TARGET!", "terminal", $effectQuery);
        $effectQuery = str_replace("!DURATION_APPEND!", "", $effectQuery);
        $effectQuery = str_replace("!TARGET_ID!", $targetID, $effectQuery);
        $effectQuery = str_replace("!EFFECT_NAME!", $effect, $effectQuery);
        $effectQuery = str_replace("!EFFECT_DURATION!", "", $effectQuery);
        break;
    }
    case("user"):
    {
        $effectQuery = str_replace("!TABLE_NAME!","sim_payload_effects",$effectQuery);
        $effectQuery = str_replace("!TARGET!", "user", $effectQuery);
        $effectQuery = str_replace("!DURATION_APPEND!", ", duration", $effectQuery);
        $effectQuery = str_replace("!TARGET_ID!", $targetID, $effectQuery);
        $effectQuery = str_replace("!EFFECT_NAME!", $effect, $effectQuery);
        $effectQuery = str_replace("!EFFECT_DURATION!", ", '$duration'", $effectQuery);
        break;
    }
}

$effectStatement = $pdo->prepare($effectQuery);
$effectStatement->execute();

echo "Success!";