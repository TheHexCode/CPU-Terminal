<?php
include('E:/Personal/Projects/CPU/dbConfig/dbConfig.php');
include('resources/scripts/classes/terminal.php');

$idSlug = $_GET["id"];
//$activeJob = "ABC1234";

$pdo = new PDO('sqlsrv:Server='.DBHOST.',1433;Database='.DBNAME, DBUSER,DBPWD);

$term_query = $pdo->query("SELECT id,name,access,state
                            FROM CPU_Terminal.dbo.terminals
                            INNER JOIN CPU_Terminal.dbo.activeJob ON terminals.job_code=activeJob.job_code
                            WHERE terminals.slug='$idSlug' ");
$termResponse = $term_query->fetch(PDO::FETCH_ASSOC);

$entry_query = $pdo->query("SELECT id,icon,path,type,access,modify,title,contents,state
                            FROM CPU_Terminal.dbo.entries
                            WHERE entries.terminal_id={$termResponse['id']} ");
$entryResponse = $entry_query->fetchAll(PDO::FETCH_ASSOC);

$log_query = $pdo->query("SELECT id,user_id,true_name,mask,reassignee,state
                            FROM CPU_Terminal.dbo.accessLogs
                            WHERE terminal_id={$termResponse['id']} ");
$logResponse = $log_query->fetchAll(PDO::FETCH_ASSOC);

$termResponse['entries'] = $entryResponse;
$termResponse['logEntries'] = $logResponse;

$terminal = new Terminal($termResponse);