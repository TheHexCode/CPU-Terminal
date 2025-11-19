<?php

require('dbConnect.php');

$targetType = $_POST["targetType"];
$targetID = $_POST["targetID"];
$effectName = $_POST["effectName"];
$effectValues = $_POST["effectValues"] ?? null;
$duration = $_POST["duration"] ?? null;
$termID = $_POST["termID"] ?? null;
$toggle = $_POST["toggle"];


$insertQuery = "INSERT INTO {$dbName}.!TABLE_NAME!
                            (!TARGET!_id, effect_name!VALUES_APPEND!!DURATION_APPEND!)
                    VALUES  (!TARGET_ID!, '!EFFECT_NAME!'!EFFECT_VALUES!!EFFECT_DURATION!)";

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
    case("session"):
    {
        $effectQuery = str_replace("!TABLE_NAME!", "sim_session_effects", $effectQuery);
        $effectQuery = str_replace("!TARGET!", "terminal", $effectQuery);
        $effectQuery = str_replace("!VALUES_APPEND!", "", $effectQuery);
        $effectQuery = str_replace("!DURATION_APPEND!", "", $effectQuery);
        $effectQuery = str_replace("!TARGET_ID!", $targetID, $effectQuery);
        $effectQuery = str_replace("!EFFECT_NAME!", $effect, $effectQuery);
        $effectQuery = str_replace("!EFFECT_VALUES!","", $effectQuery);
        $effectQuery = str_replace("!EFFECT_DURATION!", "", $effectQuery);
        break;
    }
    case("payload"):
    {
        $codeQuery = "SELECT * FROM {$dbName}.sim_active_codes";
        $codeStatement = $pdo->prepare($codeQuery);
        $codeStatement->execute();
        $activeCodes = $codeStatement->fetch(PDO::FETCH_ASSOC);

        switch($duration)
        {
            case("sim"):
            {
                $durationCode = "'" . $activeCodes["simCode"] . "'";
                break;
            }
            case("scene"):
            {
                $durationCode = "'" . $activeCodes["jobCode"] . "'";
                break;
            }
            case("term"):
            {
                $durationCode = "'" . $termID . "'";
                break;
            }
        }

        $effectQuery = str_replace("!TABLE_NAME!","sim_payload_effects",$effectQuery);
        $effectQuery = str_replace("!TARGET!", "user", $effectQuery);
        $effectQuery = str_replace("!VALUES_APPEND!", ", effect_values", $effectQuery);
        $effectQuery = str_replace("!DURATION_APPEND!", ", duration", $effectQuery);
        $effectQuery = str_replace("!TARGET_ID!", $targetID, $effectQuery);
        $effectQuery = str_replace("!EFFECT_NAME!", $effectName, $effectQuery);
        $effectQuery = str_replace("!EFFECT_VALUES!",", '$effectValues'", $effectQuery);
        $effectQuery = str_replace("!EFFECT_DURATION!", ", $durationCode", $effectQuery);
        break;
    }
}

$effectStatement = $pdo->prepare($effectQuery);
$effectStatement->execute();

echo "Success!";