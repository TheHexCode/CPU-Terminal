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
        $perQuery = "   SELECT per_type
                        FROM {$dbName}.item_effects
                        WHERE id = :effectID";
        
        $perStatement = $pdo->prepare($perQuery);
        $perStatement->execute([':effectID' => intval($effectID)]);

        $perType = $perStatement->fetch(PDO::FETCH_COLUMN);

        if($perType === "item")
        {
            $itemQuery = "  SELECT items.id
                            FROM {$dbName}.items
                            INNER JOIN {$dbName}.item_effects ON item_effects.item_id = items.id
                            WHERE item_effects.id = :effectID";

            $itemStatement = $pdo->prepare($itemQuery);
            $itemStatement->execute([':effectID' =>intval($effectID)]);

            $itemID = $itemStatement->fetch(PDO::FETCH_COLUMN);


            $usesQuery = "  SELECT count FROM {$dbName}.user_items
                            WHERE user_id = :userID
                                AND item_id = :itemID";

            $usesStatement = $pdo->prepare($usesQuery);
            $usesStatement->execute([':userID' => $userID, ':itemID' => intval($itemID)]);

            $usesLeft = $usesStatement->fetch(PDO::FETCH_COLUMN);

            $usesLeft = max(intval($usesLeft) - 1, 0);

            $minusQuery = " UPDATE {$dbName}.user_items
                            SET count = :usesLeft
                            WHERE user_id = :userID
                                AND item_id = :itemID";

            $minusStatement = $pdo->prepare($minusQuery);
            $minusStatement->execute([':usesLeft' => $usesLeft, ':userID' => $userID, ':itemID' => intval($itemID)]);
        }

        $itemUseQuery = "   INSERT INTO {$dbName}.item_uses
                                        (user_id, effect_id, simCode, jobCode, terminal_id)
                            VALUES ( :userID, :effectID, :simCode, :jobCode, :termID )";

        $itemUseStatement = $pdo->prepare($itemUseQuery);
        $itemUseStatement->execute([':userID' => $userID, ':effectID' => intval($effectID), ':simCode' => $activeCodes["simCode"], ':jobCode' => $activeCodes["jobCode"], ':termID' => $termID]);
    }
}

echo json_encode("Success!");