<?php

require('dbConnect.php');
include('resources/scripts/terminal/classes/terminal.php');

$termSlug = $_GET["id"];
$local = $_GET["loc"] ?? false;

$termQuery = "  SELECT id,displayName,access,state,stateData
                FROM {$dbName}.sim_terminals
                INNER JOIN {$dbName}.sim_active_codes
                    ON sim_terminals.jobCode=sim_active_codes.jobCode
                WHERE sim_terminals.slug=:termSlug";

$termStatement = $pdo->prepare($termQuery);
$termStatement->execute([':termSlug' => $termSlug]);
$termResponse = $termStatement->fetch(PDO::FETCH_ASSOC);

if($termResponse === false)
{
    echo "<h1>HTTP ERROR 404: FILE NOT FOUND</h1>";

    $terminal = new Terminal($termResponse);
}
else
{
    echo $local === "";

    if($termResponse['state'] === "bricked")
    {
        $userQuery = "  SELECT charName
                        FROM {$dbName}.users
                        WHERE ml_id=:stateData";

        $userStatement = $pdo->prepare($userQuery);
        $userStatement->execute([':stateData' => $termResponse["stateData"]]);

        $termResponse['stateData'] = $userStatement->fetch(PDO::FETCH_COLUMN);
    }

    ###########################################################################################################

    $entryQuery = " SELECT id,icon,path,type,access,modify,title,contents,state
                    FROM {$dbName}.sim_entries
                    WHERE terminal_id=:termID";

    $entryStatement = $pdo->prepare($entryQuery);
    $entryStatement->execute([':termID' => $termResponse["id"]]);
    $entryResponse = $entryStatement->fetchAll(PDO::FETCH_ASSOC);

    ###########################################################################################################

    $puzzleQuery = "SELECT id,puzzle_type,cost,`repeat`,know_reqs,reward_type,reward
                    FROM {$dbName}.sim_puzzles
                    WHERE terminal_id=:termID";

    $puzzleStatement = $pdo->prepare($puzzleQuery);
    $puzzleStatement->execute([':termID' => $termResponse["id"]]);

    $puzzleResponse = $puzzleStatement->fetchAll(PDO::FETCH_ASSOC);

    ###########################################################################################################

    $logQuery = "   SELECT sim_access_logs.id,user_id,users.charName,mask,reassignee,state
                    FROM {$dbName}.sim_access_logs
                    LEFT JOIN {$dbName}.users
                        ON sim_access_logs.user_id=users.ml_id
                    WHERE terminal_id=:termID";

    $logStatement = $pdo->prepare($logQuery);
    $logStatement->execute([':termID' => $termResponse["id"]]);

    $logResponse = $logStatement->fetchAll(PDO::FETCH_ASSOC);

    ###########################################################################################################

    $iceQuery = "   SELECT ice_tiers.type, ice_tiers.tier, effect
                    FROM {$dbName}.ice_effects
                    INNER JOIN ice_tiers ON ice_tiers.id = ice_effects.tier_id
                    WHERE tier_id = ice_tiers.id";
    $iceStatement = $pdo->prepare($iceQuery);
    $iceStatement->execute();
    $iceResults = $iceStatement->fetchAll(PDO::FETCH_ASSOC);

    $iceArray = array();

    array_map(function($ice) use (&$iceArray) {
        if((!(array_key_exists($ice["type"], $iceArray))) || (!(array_key_exists($ice["tier"], $iceArray[$ice["type"]]))))
        {
            $iceArray[$ice["type"]][$ice["tier"]] = array($ice["effect"]);
        }
        else
        {
            array_push($iceArray[$ice["type"]][$ice["tier"]],$ice["effect"]);
        }
    }, $iceResults);

    ###########################################################################################################

    $termResponse['entries'] = $entryResponse;
    $termResponse['puzzles'] = $puzzleResponse;
    $termResponse['logEntries'] = $logResponse;
    $termResponse['iceSchema'] = $iceArray;

    $terminal = new Terminal($termResponse);
}