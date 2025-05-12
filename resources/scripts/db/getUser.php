<?php

require('dbConnect.php');

$userCode = $_POST["userCode"];
$termID = $_POST["termID"];

###############################################################################################################################

$activeQuery = "SELECT simCode,jobCode
                FROM {$dbName}.activeJob";

$activeStatement = $pdo->prepare($activeQuery);
$activeStatement->execute();
$activeCodes = $activeStatement->fetch(PDO::FETCH_ASSOC);

$userQuery = "  SELECT id,charName
                FROM {$dbName}.users
                WHERE userCode = :userCode";

$userStatement = $pdo->prepare($userQuery);
$userStatement->execute([':userCode' => $userCode]);
$userResponse = $userStatement->fetch(PDO::FETCH_ASSOC);

if($userResponse === false)
{
    echo json_encode(array());
}
else
{
    /*
    $functionQuery = "  SELECT DISTINCT functions.name,
                                        SUM(ml_functions.rank) AS 'rank',
                                        functions.type,
                                        functions.hacking_cat
                        FROM {$dbName}.user_functions
                        INNER JOIN {$dbName}.ml_functions ON ml_functions.id=user_functions.mlFunction_id
                        INNER JOIN {$dbName}.functions ON ml_functions.function_id=functions.id
                        WHERE user_id = :userID
                            AND functions.hacking_cat IS NOT NULL
                        GROUP BY functions.name,
                                functions.type,
                                functions.hacking_cat";
    */
    $functionQuery = "  SELECT DISTINCT functions.name,
                                        SUM(ml_functions.rank) AS 'rank',
                                        functions.type,
                                        functions.hacking_cat
                        FROM {$dbName}.user_selfreport
                        INNER JOIN {$dbName}.ml_functions ON ml_functions.id=user_selfreport.mlFunction_id
                        INNER JOIN {$dbName}.functions ON ml_functions.function_id=functions.id
                        WHERE user_id = :userID
                            AND functions.hacking_cat IS NOT NULL
                        GROUP BY functions.name,
                                functions.type,
                                functions.hacking_cat";

    $functionStatement = $pdo->prepare($functionQuery);
    $functionStatement->execute([':userID' => $userResponse["id"]]);
    $functionResponse = $functionStatement->fetchAll(PDO::FETCH_ASSOC);

    /*
    $roleQuery = "  SELECT DISTINCT roles.name
                    FROM {$dbName}.ml_functions
                    INNER JOIN {$dbName}.user_functions ON ml_functions.id=user_functions.mlFunction_id
                    INNER JOIN {$dbName}.roles ON ml_functions.role_id=roles.id
                    WHERE user_id = :userID";
    */

    $roleQuery = "  SELECT DISTINCT roles.name
                    FROM {$dbName}.ml_functions
                    INNER JOIN {$dbName}.user_selfreport ON ml_functions.id=user_selfreport.mlFunction_id
                    INNER JOIN {$dbName}.roles ON ml_functions.role_id=roles.id
                    WHERE user_id = :userID";

    $roleStatement = $pdo->prepare($roleQuery);
    $roleStatement->execute([':userID' => $userResponse["id"]]);
    $roleResponse = $roleStatement->fetchAll(PDO::FETCH_COLUMN);

    $itemQuery = "  SELECT item_id, items.name, items.tier, items.type
                    FROM {$dbName}.user_items
                    INNER JOIN {$dbName}.items ON user_items.item_id=items.id
                    WHERE user_id = :userID";

    $itemStatement = $pdo->prepare($itemQuery);
    $itemStatement->execute([':userID' => $userResponse["id"]]);
    $itemResponse = $itemStatement->fetchAll(PDO::FETCH_ASSOC);

    $effectQuery = "    SELECT id, charges, per_type, use_loc, effect
                        FROM {$dbName}.item_effects
                        WHERE item_id = :itemID";

    $effectStatement = $pdo->prepare($effectQuery);

    $simUseQuery = "SELECT COUNT(*)
                    FROM {$dbName}.item_uses
                    WHERE 	user_id = :userID
                        AND effect_id = :effectID
                        AND simCode = :simCode";

    $simUseStatement = $pdo->prepare($simUseQuery);

    $sceneUseQuery = "  SELECT COUNT(*)
                        FROM {$dbName}.item_uses
                        WHERE 	user_id = :userID
                            AND effect_id = :effectID
                            AND jobCode = :jobCode
                            AND simCode = :simCode";

    $sceneUseStatement = $pdo->prepare($sceneUseQuery);

    $newItems = array();

    foreach($itemResponse as $item)
    {
        $effectStatement->execute([':itemID' => $item["item_id"]]);
        $effectResponse = $effectStatement->fetchAll(PDO::FETCH_ASSOC);

        $newEffects = array();

        foreach($effectResponse as $effect)
        {
            switch($effect["per_type"])
            {
                case ("sim"):
                    $simUseStatement->execute([
                            ':userID' => $userResponse["id"],
                            ':effectID' => $effect["id"],
                            ':simCode' => $activeCodes["simCode"]
                        ]);
                    $useResponse = $simUseStatement->fetch(PDO::FETCH_COLUMN);
                    break;
                case ("scene"):
                    $sceneUseStatement->execute([
                            ':userID' => $userResponse["id"],
                            ':effectID' => $effect["id"],
                            ':jobCode' => $activeCodes["jobCode"],
                            ':simCode' => $activeCodes["simCode"]
                        ]);
                    $useResponse = $sceneUseStatement->fetch(PDO::FETCH_COLUMN);
                    break;
                default:
                    $useResponse = 0;
                    break;
            }

            $effect["uses"] = $useResponse;

            $termUseQuery = "   SELECT COUNT(*)
                                FROM {$dbName}.item_uses
                                WHERE 	user_id = :userID
                                    AND effect_id = :effectID
                                    AND jobCode = :jobCode
                                    AND simCode = :simCode
                                    AND terminal_id = :termID";

            $termUseStatement = $pdo->prepare($termUseQuery);
            $termUseStatement->execute([
                    ':userID' => $userResponse["id"],
                    ':effectID' => $effect["id"],
                    ':jobCode' => $activeCodes["jobCode"],
                    ':simCode' => $activeCodes["simCode"],
                    ':termID' => $termID
                ]);
            $termUseResponse = $termUseStatement->fetch(PDO::FETCH_COLUMN);

            $effect["termUses"] = $termUseResponse;
            array_push($newEffects, $effect);
        }

        $item["effects"] = $newEffects;
        array_push($newItems, $item);
    }

    //////////////////////////////////////////////////////////////////////////////

    $accessQuery = "SELECT COUNT(user_id) FROM {$dbName}.accessLogs
                    WHERE user_id=:userID
                        AND terminal_id=:termID";

    $accessStatement = $pdo->prepare($accessQuery);
    $accessStatement->execute([':userID' => $userResponse["id"], ':termID' => $termID]);
    $hasAccessed = intval($accessStatement->fetch(PDO::FETCH_COLUMN)) > 0;

    $actionQuery = "SELECT entries.id, user_id, entries.path, entries.icon, action, newState FROM {$dbName}.user_actions
                    INNER JOIN {$dbName}.entries ON target_id=entries.id
                    WHERE entries.terminal_id=:termID
                        AND (user_id=:userID
                            OR global=true)
                        AND target_type='entry'
                    ORDER BY time ASC";

    $actionStatement = $pdo->prepare($actionQuery);
    $actionStatement->execute([':userID' => $userResponse["id"], ':termID' => $termID]);

    $actionResponse = $actionStatement->fetchAll(PDO::FETCH_ASSOC);

    $copyQuery = "  SELECT DISTINCT action FROM (
                        SELECT action FROM {$dbName}.user_actions AS UA1
                            INNER JOIN {$dbName}.entries ON UA1.target_id=entries.id
                            WHERE UA1.user_id=:userID
                                AND entries.terminal_id=:termID
                       UNION
                        SELECT action FROM {$dbName}.user_actions AS UA2
                            INNER JOIN {$dbName}.accessLogs ON UA2.target_id=accessLogs.id
                            WHERE UA2.user_id=:userID
                                AND accessLogs.terminal_id=:termID
                    ) AS UA";

    $copyStatement = $pdo->prepare($copyQuery);
    $copyStatement->execute([':userID' => $userResponse["id"], ':termID' => $termID]);

    $copyResponse = $copyStatement->fetchAll(PDO::FETCH_COLUMN);

    $remTagsQuery = "   SELECT SUM(tags) AS remTags FROM (
                                SELECT tags FROM {$dbName}.accessLogs
                                    WHERE user_id=:userID
                                   UNION 
                                SELECT SUM(sumCost * -1) FROM (
                                    SELECT SUM(cost) AS sumCost
                                    FROM {$dbName}.user_actions AS UA_Entries
                                    INNER JOIN {$dbName}.entries ON UA_Entries.target_id=entries.id
                                    WHERE UA_Entries.target_type='entry'
                                        AND entries.terminal_id=:termID
                                        AND UA_Entries.user_id=:userID
                                   UNION
                                    SELECT SUM(cost) AS sumCost
                                    FROM {$dbName}.user_actions AS UA_Logs
                                    INNER JOIN {$dbName}.accessLogs ON UA_Logs.target_id=accessLogs.id
                                    WHERE UA_Logs.target_type='log'
                                        AND accessLogs.terminal_id=:termID
                                        AND UA_Logs.user_id=:userID
                                   UNION
                                    SELECT SUM(cost) AS sumCost
                                    FROM {$dbName}.user_actions AS UA_Term
                                    WHERE UA_Term.target_type='terminal'
                                        AND UA_Term.target_id=:termID
                                        AND UA_Term.user_id=:userID
                                   UNION
                                    SELECT SUM(cost) AS sumCost FROM {$dbName}.user_actions AS UA_Items
                                    INNER JOIN (
                                        SELECT user_id, user_items.item_id, item_effects.id AS effect_id FROM {$dbName}.user_items
                                            INNER JOIN {$dbName}.item_effects ON user_items.item_id=item_effects.item_id
                                            WHERE user_id=:userID
                                    ) AS user_effects ON target_id=user_effects.effect_id
                                    WHERE UA_Items.target_type='item'
                                        AND UA_Items.newState=:termID
                                        AND UA_Items.user_id=:userID
                                ) AS tC
                            ) AS rT";

    $remTagsStatement = $pdo->prepare($remTagsQuery);
    $remTagsStatement->execute([':userID' => $userResponse["id"], ':termID' => $termID]);

    $remTagsResponse = intval($remTagsStatement->fetch(PDO::FETCH_COLUMN));

    echo json_encode(array(  "id" => $userResponse["id"],
                                    "name" => $userResponse["charName"],
                                    "userCode" => $userCode,
                                    "functions" => $functionResponse,
                                    "roles" => $roleResponse,
                                    "items" => $newItems,
                                    "hasAccessed" => $hasAccessed,
                                    "prevActions" => $actionResponse,
                                    "copyables" => $copyResponse,
                                    "remTags" => max($remTagsResponse,0)
                                ));
}