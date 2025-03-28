<?php

require('dbConnect.php');

$entryID = $_GET["id"];
$newState = $_GET["newState"];

$entry_query = $pdo->query("SELECT * FROM CPU_Terminal.dbo.entries WHERE id={$entryID}");
$entry = ($entry_query->fetchAll(PDO::FETCH_ASSOC))[0];

$iconFilepath = "../../schemas/icons.json";
$iconFile = fopen($iconFilepath,"r");
$iconSchema = json_decode(fread($iconFile,filesize($iconFilepath)),true);
fclose($iconFile);

$newEntry = array();

$newEntry["terminal_id"] = $entry["terminal_id"];

if($entry["type"] === "ice")
{
    $newEntry["title"] = '<span class="entrySecret' . ($newState === "unwrap" ? " sprung" : " disarmed") . '">' . $entry["title"] . '</span>';

    if(json_decode($entry["contents"]))
    {
        $implodedContents = implode("<br/>",json_decode($entry["contents"]));
    }
    else
    {
        $implodedContents = $entry["contents"];
    }

    $newEntry["contents"] = '<span class="entrySecret' . ($newState === "unwrap" ? " sprung" : " disarmed") . '">' . $implodedContents . '</span>';

    $newEntry["access"] = 'Unwrap: <button class="accessButton" data-enabled="false" disabled="" ">N/A</button>';
    $newEntry["modify"] = 'Break: <button class="modifyButton" data-enabled="false" disabled="" ">N/A</button>';
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
                            'Access: <button class="accessButton" data-enabled="true" data-id=' . $entry["id"] . ' onclick="entryAction(this)">' . $entry["access"] . ' Tag' . ((intval($entry["access"]) === 1) ? '' : 's') . '</button>' :
                            'Access: <button class="accessButton" data-enabled="false" disabled="" ">N/A</button>';

    $newEntry["modify"] = ($stateGuide["modify"]["enabled"]) ?
                            'Modify: <button class="modifyButton" data-enabled="true" data-id=' . $entry["id"] . ' onclick="entryAction(this)">' . $entry["modify"] . ' Tag' . ((intval($entry["modify"]) === 1) ? '' : 's') . '</button>' :
                            'Modify: <button class="modifyButton" data-enabled="false" disabled="" ">N/A</button>';
}

echo json_encode($newEntry);