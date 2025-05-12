<?php
require('dbConnect.php');

$userID = $_POST["userID"];
$effectIDs = $_POST["effectIDs"];
$termID = $_POST["termID"];

if($effectIDs !== null)
{
    if(!is_array($effectIDs))
    {
        $effectIDs = array($effectIDs);
    }

    $activeQuery = "SELECT * FROM {$dbName}.sim_active_codes";
    $activeStatement = $pdo->prepare($activeQuery);
    $activeStatement->execute();
    $activeCodes = $activeStatement->fetch(PDO::FETCH_ASSOC);

    foreach($effectIDs as $effectID)
    {
        $itemUseQuery = "   INSERT INTO {$dbName}.item_uses
                                        (user_id, effect_id, simCode, jobCode, terminal_id)
                            VALUES ( :userID, :effectID, :simCode, :jobCode, :termID )";

        $itemUseStatement = $pdo->prepare($itemUseQuery);
        $itemUseStatement->execute([':userID' => $userID, ':effectID' => intval($effectID), ':simCode' => $activeCodes["simCode"], ':jobCode' => $activeCodes["jobCode"], ':termID' => $termID]);
    }
}

echo json_encode("Success!");