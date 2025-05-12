<?php

require('dbConnect.php');
include('resources/scripts/classes/terminal.php');

$termSlug = $_GET["id"];

$termQuery = "  SELECT  SQL_NO_CACHE id,displayName,access,state,stateData
                FROM {$dbName}.terminals
                INNER JOIN {$dbName}.activeJob
                    ON terminals.jobCode=activeJob.jobCode
                WHERE terminals.slug=:termSlug";

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
        $user_query = $pdo->query(" SELECT  SQL_NO_CACHE charName
                                    FROM {$dbName}.users
                                    WHERE id={$termResponse['id']};");

        $termResponse['stateData'] = $user_query->fetch(PDO::FETCH_ASSOC)['charName'];
    }

    $entry_query = $pdo->query("SELECT  SQL_NO_CACHE id,icon,path,type,access,modify,title,contents,state
                                FROM {$dbName}.entries
                                WHERE entries.terminal_id={$termResponse['id']} ");
    $entryResponse = $entry_query->fetchAll(PDO::FETCH_ASSOC);

    $log_query = $pdo->query("  SELECT SQL_NO_CACHE accessLogs.id,user_id,users.charName,mask,reassignee,state
                                FROM {$dbName}.accessLogs
                                LEFT JOIN {$dbName}.users
                                    ON accessLogs.user_id=users.id
                                WHERE terminal_id={$termResponse['id']}");
    $logResponse = $log_query->fetchAll(PDO::FETCH_ASSOC);

    $termResponse['entries'] = $entryResponse;
    $termResponse['logEntries'] = $logResponse;

    $terminal = new Terminal($termResponse);
}