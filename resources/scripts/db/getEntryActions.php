<?php

require('dbConnect.php');

$entryID = $_GET["id"];
$playerAction = $_GET["action"];

$entry_query = $pdo->query("SELECT * FROM CPU_Terminal.dbo.entries WHERE id={$entryID}");
$entry = ($entry_query->fetchAll(PDO::FETCH_ASSOC))[0];

$iconFilepath = "../../schemas/icons.json";
$iconFile = fopen($iconFilepath,"r");
$iconSchema = json_decode(fread($iconFile,filesize($iconFilepath)),true);
fclose($iconFile);

$action = $iconSchema[$entry["icon"]]["types"][$entry["type"]][$entry["state"]][$playerAction];

if($action["enabled"])
{
    $options = json_encode($action["actions"]);
}
else
{
    $options = false;
}

echo $options;