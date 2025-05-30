<?php

require('dbConnect.php');


$entryID = $_GET["id"];
$newState = $_GET["newState"];
// OPTIONAL
$actionUser = $_GET["actionUser"] ?? null;
$userID = $_GET["userID"] ?? null;
$action = $_GET["action"] ?? null;

$entryQuery = " SELECT * FROM {$dbName}.sim_entries 
                WHERE id=:entryID";

$entryStatement = $pdo->prepare($entryQuery);
$entryStatement->execute([':entryID' => $entryID]);
$entry = $entryStatement->fetch(PDO::FETCH_ASSOC);

$iconFilepath = "../../../schemas/icons.json";
$iconFile = fopen($iconFilepath,"r");
$iconSchema = json_decode(fread($iconFile,filesize($iconFilepath)),true);
fclose($iconFile);

$newEntry = array();

//$newEntry["terminal_id"] = $entry["terminal_id"];
$newEntry["actionUser"] = intval($actionUser);
$newEntry["userID"] = intval($userID);
$newEntry["entryID"] = intval($entryID);
$newEntry["action"] = $action;
$newEntry["entryPath"] = "#" . $entry["icon"] . "-" . $entry["path"];

if($entry["type"] === "ice")
{
    $newEntry["title"] = '<span class="entrySecret' .
                            (((($actionUser === null) || ($actionUser === $userID)) && ($newState === "break")) ? ' sprung backstroke" data-text="' . $entry["title"] . '"' : ' disarmed"') .
                        '>' . $entry["title"] . '</span>';

    if(json_decode($entry["contents"]))
    {
        $spannedContents = "";

        foreach(json_decode($entry["contents"]) as $entryContent)
        {
            $spannedContents .= "<span" .
                                    (((($actionUser === null) || ($actionUser === $userID)) && ($newState === "break")) ? " class='backstroke' data-text='" . $entryContent . "'" : "") .
                                ">" . $entryContent . "</span>";
        }
    }
    else
    {
        $spannedContents = $entry["contents"];
    }

    $newEntry["contents"] = '<span class="entrySecret' . (((($actionUser === null) || ($actionUser === $userID)) && ($newState === "break")) ? " sprung" : " disarmed") . '">' . $spannedContents . '</span>';

    $newEntry["access"] = 'Break: <button class="accessButton" data-enabled="false" disabled="">N/A</button>';
    $newEntry["modify"] = 'Sleaze: <button class="modifyButton" data-enabled="false" disabled="">N/A</button>';
}
else
{
    if($newState === "previous")
    {
        $newState = $entry["previous"];
    }

    $stateGuide = $iconSchema[$entry["icon"]]["types"][$entry["type"]][$newState];

    if($entry["type"] === "trap")
    {
        if((($actionUser === null) || ($actionUser === $userID)) && ($newState !== "disarmed"))
        {
            $stateFormat = " sprung";
        }
        else
        {
            $stateFormat = " disarmed";
        }
    }
    else
    {
        $stateFormat = "";
    }

    if(gettype($stateGuide["title"]) === "array")
    {
        switch($stateGuide["title"]["if"])
        {
            case("user"):
                if($actionUser === $userID)
                {
                    $stateGuide["title"] = $stateGuide["title"]["true"];
                }
                else
                {
                    $stateGuide["title"] = $stateGuide["title"]["false"];
                }
                break;
        }
    }

    if(gettype($stateGuide["contents"]) === "array")
    {
        switch($stateGuide["contents"]["if"])
        {
            case("user"):
                if($actionUser === $userID)
                {
                    $stateGuide["contents"] = $stateGuide["contents"]["true"];
                }
                else
                {
                    $stateGuide["contents"] = $stateGuide["contents"]["false"];
                }
                break;
        }
    }

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
            $spannedContents = "";

            foreach(json_decode($entry["contents"]) as $entryContent)
            {
                $spannedContents .= "<span>" . $entryContent . "</span>";
            }
        }
        else
        {
            $spannedContents = $entry["contents"];
        }

        $newEntry["contents"] = '<span class="entrySecret' . $stateFormat . '">' . $spannedContents . '</span>';
    }
    else
    {
        $newEntry["contents"] = '<span class="entrySecret' . $stateFormat . '">' . $stateGuide["contents"] . '</span>';
    }

    $newEntry["access"] = ($stateGuide["access"]["enabled"]) ?
                            'Access: <button class="accessButton" data-enabled="true" data-cost=' . $entry["access"] . ' data-id=' . $entry["id"] . ' onclick="takeAction(this)">' . $entry["access"] . ' Tag' . ((intval($entry["access"]) === 1) ? '' : 's') . '</button>' :
                            'Access: <button class="accessButton" data-enabled="false" disabled="">N/A</button>';

    $newEntry["modify"] = ($stateGuide["modify"]["enabled"]) ?
                            'Modify: <button class="modifyButton" data-enabled="true" data-cost=' . $entry["modify"] . ' data-id=' . $entry["id"] . ' onclick="takeAction(this)">' . $entry["modify"] . ' Tag' . ((intval($entry["modify"]) === 1) ? '' : 's') . '</button>' :
                            'Modify: <button class="modifyButton" data-enabled="false" disabled="">N/A</button>';
}

echo json_encode($newEntry);