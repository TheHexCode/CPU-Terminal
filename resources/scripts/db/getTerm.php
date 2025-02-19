<?php
    include('E:\Personal\Projects\CPU\dbConfig\dbConfig.php');

    $idSlug = $_GET["id"];
    //$activeJob = "ABC1234";

    $pdo = new PDO('sqlsrv:Server='.DBHOST.',1433;Database='.DBNAME, DBUSER,DBPWD);

    $job_query = $pdo->query("SELECT * FROM CPU_Terminal.dbo.activeJob");
    $activeJob = $job_query->fetch(PDO::FETCH_ASSOC);
    
    $term_query = $pdo->query("SELECT * FROM CPU_Terminal.dbo.terminals WHERE CONVERT(varchar,slug) = '$idSlug' AND CONVERT(varchar,job) = '{$activeJob['jobCode']}'");
    $terminal = $term_query->fetch(PDO::FETCH_ASSOC);

    $entry_query = $pdo->query("SELECT * FROM CPU_Terminal.dbo.entries WHERE terminal_id={$terminal['id']}");
    $entries = $entry_query->fetchAll(PDO::FETCH_ASSOC);

    $terminal['entries'] = $entries;

    echo json_encode($terminal);