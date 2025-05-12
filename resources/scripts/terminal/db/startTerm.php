<?php

require('dbConnect.php');
include('resources/scripts/terminal/classes/terminal.php');

$termSlug = $_GET["id"];

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
}
else
{
    if($termResponse['state'] === "bricked")
    {
        $user_query = $pdo->query(" SELECT charName
                                    FROM {$dbName}.users
                                    WHERE ml_id={$termResponse['id']};");

        $termResponse['stateData'] = $user_query->fetch(PDO::FETCH_ASSOC)['charName'];
    }

    $entry_query = $pdo->query("SELECT id,icon,path,type,access,modify,title,contents,state
                                FROM {$dbName}.sim_entries
                                WHERE sim_entries.terminal_id={$termResponse['id']} ");
    $entryResponse = $entry_query->fetchAll(PDO::FETCH_ASSOC);

    $log_query = $pdo->query("  SELECT sim_access_logs.id,user_id,users.charName,mask,reassignee,state
                                FROM {$dbName}.sim_access_logs
                                LEFT JOIN {$dbName}.users
                                    ON sim_access_logs.user_id=users.ml_id
                                WHERE terminal_id={$termResponse['id']}");
    $logResponse = $log_query->fetchAll(PDO::FETCH_ASSOC);

    $termResponse['entries'] = $entryResponse;
    $termResponse['logEntries'] = $logResponse;

    $terminal = new Terminal($termResponse);
}