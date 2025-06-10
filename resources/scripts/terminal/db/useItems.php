<?php
require('dbConnect.php');

$userID = $_POST["userID"];
$effects = $_POST["effects"];
$termID = $_POST["termID"];

if($effects !== null)
{
    if(!is_array($effects))
    {
        $effects = array($effects);
    }

    $activeQuery = "SELECT * FROM {$dbName}.sim_active_codes";
    $activeStatement = $pdo->prepare($activeQuery);
    $activeStatement->execute();
    $activeCodes = $activeStatement->fetch(PDO::FETCH_ASSOC);

    foreach($effects as $effect)
    {
        $perQuery = "   SELECT per_type
                        FROM {$dbName}.item_effects
                        WHERE abbr = :effectAbbr";
        
        $perStatement = $pdo->prepare($perQuery);
        $perStatement->execute([':effectAbbr' => $effect]);

        $perType = $perStatement->fetch(PDO::FETCH_COLUMN);

        if($perType === "item")
        {
            $itemQuery = "  SELECT items.abbr
                            FROM {$dbName}.items
                            INNER JOIN {$dbName}.items_to_effects ON items_to_effects.item_abbr = items.abbr
                            INNER JOIN {$dbName}.item_effects ON item_effects.abbr = items_to_effects.effect_abbr
                            WHERE item_effects.abbr = :effectAbbr";

            $itemStatement = $pdo->prepare($itemQuery);
            $itemStatement->execute([':effectAbbr' => $effect]);

            $itemAbbrs = $itemStatement->fetchAll(PDO::FETCH_COLUMN);

            foreach($itemAbbrs as $itemAbbr)
            {

                $usesQuery = "  SELECT count FROM {$dbName}.user_items
                                WHERE user_id = :userID
                                    AND item_abbr = :itemAbbr";

                $usesStatement = $pdo->prepare($usesQuery);
                $usesStatement->execute([':userID' => $userID, ':itemAbbr' => $itemAbbr]);

                $usesLeft = $usesStatement->fetch(PDO::FETCH_COLUMN);

                $usesLeft = max(intval($usesLeft) - 1, 0);

                $minusQuery = " UPDATE {$dbName}.user_items
                                SET count = :usesLeft
                                WHERE user_id = :userID
                                    AND item_abbr = :itemAbbr";

                $minusStatement = $pdo->prepare($minusQuery);
                $minusStatement->execute([':usesLeft' => $usesLeft, ':userID' => $userID, ':itemAbbr' => $itemAbbr]);
            }
        }

        $itemUseQuery = "   INSERT INTO {$dbName}.item_uses
                                        (user_id, effect_abbr, simCode, jobCode, terminal_id)
                            VALUES ( :userID, :effectAbbr, :simCode, :jobCode, :termID )";

        $itemUseStatement = $pdo->prepare($itemUseQuery);
        $itemUseStatement->execute([':userID' => $userID, ':effectAbbr' => $effect, ':simCode' => $activeCodes["simCode"], ':jobCode' => $activeCodes["jobCode"], ':termID' => $termID]);
    }
}

echo json_encode("Success!");