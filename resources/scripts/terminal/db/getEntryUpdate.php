<?php

require('dbConnect.php');


$entryID = $_GET["id"];
$newState = $_GET["newState"];
// OPTIONAL
$userID = $_GET["userID"] ?? null;
$action = $_GET["action"] ?? null;

$entryQuery = " SELECT * FROM {$dbName}.sim_entries 
                WHERE id=:entryID";

$entryStatement = $pdo->prepare($entryQuery);
$entryStatement->execute([':entryID' => $entryID]);
$entry = $entryStatement->fetch(PDO::FETCH_ASSOC);

$iconFilepath = "../../schemas/icons.json";
$iconFile = fopen($iconFilepath,"r");
$iconSchema = json_decode(fread($iconFile,filesize($iconFilepath)),true);
fclose($iconFile);

$newEntry = array();

//$newEntry["terminal_id"] = $entry["terminal_id"];
$newEntry["userID"] = intval($userID);
$newEntry["entryID"] = intval($entryID);
$newEntry["action"] = $action;
$newEntry["entryPath"] = "#" . $entry["icon"] . "-" . $entry["path"];

if($entry["type"] === "ice")
{
    $newEntry["title"] = '<span class="entrySecret' . ($newState === "break" ? " sprung" : " disarmed") . '">' . $entry["title"] . '</span>';

    if(json_decode($entry["contents"]))
    {
        $implodedContents = implode("<br/>",json_decode($entry["contents"]));
    }
    else
    {
        $implodedContents = $entry["contents"];
    }

    $newEntry["contents"] = '<span class="entrySecret' . ($newState === "break" ? " sprung" : " disarmed") . '">' . $implodedContents . '</span>';

    $newEntry["access"] = 'Break: <button class="accessButton" data-enabled="false" disabled="">N/A</button>';
    $newEntry["modify"] = 'Sleaze: <button class="modifyButton" data-enabled="false" disabled="">N/A</button>';
}
else
{
    $stateGuide = $iconSchema[$entry["icon"]]["types"][$entry["type"]][$newState];

    $stateFormat = array_key_exists("formatting", $stateGuide) ? " ".$stateGuide["formatting"] : "";

    if($stateGuide["title"] === false)
    {
        $newEntry["title"] = '<span class="entryMasking">&nbsp;</span>';
    }
    elseif($stateGuide["title"] === true)
    {
        $newEntry["title"] = '<span class="entrySecret' . $stateFormat . '">' . $entry["title"] . '</span>';
    }
    else
    {
        $newEntry["title"] = '<span class="entrySecret' . $stateFormat . '">' . $stateGuide["title"] . '</span>';
    }

    if($stateGuide["contents"] === false)
    {
        $newEntry["contents"] = '<span class="entryMasking">&nbsp;</span>';
    }
    elseif($stateGuide["contents"] === true)
    {
        if(json_decode($entry["contents"]))
        {
            $implodedContents = implode("<br/>",json_decode($entry["contents"]));
        }
        else
        {
            $implodedContents = $entry["contents"];
        }

        $newEntry["contents"] = '<span class="entrySecret' . $stateFormat . '">' . $implodedContents . '</span>';
    }
    else
    {
        $newEntry["contents"] = '<span class="entrySecret' . $stateFormat . '">' . $stateGuide["contents"] . '</span>';
    }

    $newEntry["access"] = ($stateGuide["access"]["enabled"]) ?
                            'Access: <button class="accessButton" data-enabled="true" data-id=' . $entry["id"] . ' onclick="takeAction(this)">' . $entry["access"] . ' Tag' . ((intval($entry["access"]) === 1) ? '' : 's') . '</button>' :
                            'Access: <button class="accessButton" data-enabled="false" disabled="">N/A</button>';

    $newEntry["modify"] = ($stateGuide["modify"]["enabled"]) ?
                            'Modify: <button class="modifyButton" data-enabled="true" data-id=' . $entry["id"] . ' onclick="takeAction(this)">' . $entry["modify"] . ' Tag' . ((intval($entry["modify"]) === 1) ? '' : 's') . '</button>' :
                            'Modify: <button class="modifyButton" data-enabled="false" disabled="">N/A</button>';
}

echo json_encode($newEntry);