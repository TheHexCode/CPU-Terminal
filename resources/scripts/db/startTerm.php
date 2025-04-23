<?php

require('dbConnect.php');
include('resources/scripts/classes/terminal.php');

$idSlug = $_GET["id"];
//$activeJob = "ABC1234";

$term_query = $pdo->query(" SELECT id,displayName,access,state,stateData
                            FROM cpu_term.terminals
                            INNER JOIN cpu_term.activeJob
                                ON terminals.jobCode=activeJob.jobCode
                            WHERE terminals.slug='$idSlug';");
$termResponse = $term_query->fetch(PDO::FETCH_ASSOC);

if($termResponse['state'] === "bricked")
{
    $user_query = $pdo->query(" SELECT charName
                                FROM cpu_term.users
                                WHERE id={$termResponse['id']};");

    $termResponse['stateData'] = $user_query->fetch(PDO::FETCH_ASSOC)['charName'];
}

$entry_query = $pdo->query("SELECT id,icon,path,type,access,modify,title,contents,state
                            FROM cpu_term.entries
                            WHERE entries.terminal_id={$termResponse['id']} ");
$entryResponse = $entry_query->fetchAll(PDO::FETCH_ASSOC);

$log_query = $pdo->query("  SELECT accessLogs.id,user_id,users.charName,mask,reassignee,state
                            FROM cpu_term.accessLogs
                            LEFT JOIN cpu_term.users
                                ON accessLogs.user_id=users.id
                            WHERE terminal_id={$termResponse['id']}");
$logResponse = $log_query->fetchAll(PDO::FETCH_ASSOC);

$termResponse['entries'] = $entryResponse;
$termResponse['logEntries'] = $logResponse;

$terminal = new Terminal($termResponse);