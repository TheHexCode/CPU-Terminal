<?php

require('dbConnect.php');

$entryID = $_GET["id"];
$entryState = $_GET["state"];
$playerAction = $_GET["action"];

$entry_query = $pdo->query("SELECT * FROM {$dbName}.sim_entries WHERE id={$entryID}");
$entry = $entry_query->fetch(PDO::FETCH_ASSOC);

$iconFilepath = "../../../schemas/icons.json";
$iconFile = fopen($iconFilepath,"r");
$iconSchema = json_decode(fread($iconFile,filesize($iconFilepath)),true);
fclose($iconFile);

$action = $iconSchema[$entry["icon"]]["types"][$entry["type"]][$entryState][$playerAction];

if($action["enabled"])
{
    $actionButtons = array();

    foreach($action["actions"] as $button)
    {
        if($button["state"] === "previous")
        {
            $button["state"] = $entry["previous"];
        }

        array_push($actionButtons, $button);
    }

    $options = json_encode($actionButtons);
}
else
{
    $options = false;
}

echo $options;