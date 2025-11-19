<?php
    require('dbConnect.php');

    $activeQuery = "SELECT * FROM {$dbName}.sim_active_codes";
    $activeStatement = $pdo->prepare($activeQuery);
    $activeStatement->execute();
    $activeCodes = $activeStatement->fetch(PDO::FETCH_ASSOC);
