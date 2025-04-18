<?php

require('dbConnect.php');
include('resources/scripts/classes/terminal.php');

$idSlug = $_GET["id"];
//$activeJob = "ABC1234";

$term_query = $pdo->query(" SELECT id,displayName,access,state
                            FROM CPU_Terminal.dbo.terminals
                            INNER JOIN CPU_Terminal.dbo.activeJob
                                ON terminals.jobCode=activeJob.jobCode
                            WHERE terminals.slug='$idSlug' ");
$termResponse = $term_query->fetch(PDO::FETCH_ASSOC);

$entry_query = $pdo->query("SELECT id,icon,path,type,access,modify,title,contents,state
                            FROM CPU_Terminal.dbo.entries
                            WHERE entries.terminal_id={$termResponse['id']} ");
$entryResponse = $entry_query->fetchAll(PDO::FETCH_ASSOC);

$log_query = $pdo->query("  SELECT accessLogs.id,user_id,users.charName,mask,reassignee,state
                            FROM CPU_Terminal.dbo.accessLogs
                            LEFT JOIN CPU_Terminal.dbo.users
                                ON accessLogs.user_id=users.id
                            WHERE terminal_id={$termResponse['id']}");
$logResponse = $log_query->fetchAll(PDO::FETCH_ASSOC);

$termResponse['entries'] = $entryResponse;
$termResponse['logEntries'] = $logResponse;

$terminal = new Terminal($termResponse);