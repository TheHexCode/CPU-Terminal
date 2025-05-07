<?php

require('dbConnect.php');

$userCode = $_POST["userCode"];
$termID = $_POST["termID"];

###############################################################################################################################

$activeQuery = "SELECT simCode,jobCode
                FROM cpu_term.activejob";

$activeStatement = $pdo->prepare($activeQuery);
$activeStatement->execute();
$activeCodes = $activeStatement->fetch(PDO::FETCH_ASSOC);

$userQuery = '  SELECT id,charName
                FROM cpu_term.users
                WHERE userCode = :userCode';

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
                        FROM cpu_term.user_functions
                        INNER JOIN cpu_term.ml_functions ON ml_functions.id=user_functions.mlFunction_id
                        INNER JOIN cpu_term.functions ON ml_functions.function_id=functions.id
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
                        FROM cpu_term.user_selfreport
                        INNER JOIN cpu_term.ml_functions ON ml_functions.id=user_selfreport.mlFunction_id
                        INNER JOIN cpu_term.functions ON ml_functions.function_id=functions.id
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
                    FROM cpu_term.ml_functions
                    INNER JOIN cpu_term.user_functions ON ml_functions.id=user_functions.mlFunction_id
                    INNER JOIN cpu_term.roles ON ml_functions.role_id=roles.id
                    WHERE user_id = :userID";
    */

    $roleQuery = "  SELECT DISTINCT roles.name
                    FROM cpu_term.ml_functions
                    INNER JOIN cpu_term.user_selfreport ON ml_functions.id=user_selfreport.mlFunction_id
                    INNER JOIN cpu_term.roles ON ml_functions.role_id=roles.id
                    WHERE user_id = :userID";

    $roleStatement = $pdo->prepare($roleQuery);
    $roleStatement->execute([':userID' => $userResponse["id"]]);
    $roleResponse = $roleStatement->fetchAll(PDO::FETCH_COLUMN);

    $itemQuery = "  SELECT item_id, items.name, items.tier, items.type
                    FROM cpu_term.user_items
                    INNER JOIN cpu_term.items ON user_items.item_id=items.id
                    WHERE user_id = :userID";

    $itemStatement = $pdo->prepare($itemQuery);
    $itemStatement->execute([':userID' => $userResponse["id"]]);
    $itemResponse = $itemStatement->fetchAll(PDO::FETCH_ASSOC);

    $effectQuery = "    SELECT id, charges, per_type, use_loc, effect
                        FROM cpu_term.item_effects
                        WHERE item_id = :itemID";

    $effectStatement = $pdo->prepare($effectQuery);

    $simUseQuery = "SELECT COUNT(*)
                    FROM cpu_term.item_uses
                    WHERE 	user_id = :userID
                        AND effect_id = :effectID
                        AND simCode = :simCode";

    $simUseStatement = $pdo->prepare($simUseQuery);

    $sceneUseQuery = "  SELECT COUNT(*)
                        FROM cpu_term.item_uses
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
                                FROM cpu_term.item_uses
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

    $accessQuery = "SELECT COUNT(user_id) FROM cpu_term.accesslogs
                    WHERE user_id=:userID
                        AND terminal_id=:termID";

    $accessStatement = $pdo->prepare($accessQuery);
    $accessStatement->execute([':userID' => $userResponse["id"], ':termID' => $termID]);
    $hasAccessed = intval($accessStatement->fetch(PDO::FETCH_COLUMN)) > 0;

    $actionQuery = "SELECT entries.id, user_id, entries.path, entries.icon, action, newState FROM cpu_term.user_actions AS UA1
                    INNER JOIN cpu_term.entries ON target_id=entries.id
                    INNER JOIN (
                        SELECT entries.id, MAX(time) as maxTime FROM cpu_term.user_actions
                            INNER JOIN cpu_term.entries ON target_id=entries.id
                            WHERE entries.terminal_id = :termID
                                AND (user_id = :userID
                                    OR global = true)
                                AND target_type = 'entry'
                            GROUP BY entries.id
                    ) AS UA2 ON time=maxTime
                    WHERE entries.terminal_id = :termID
                        AND (user_id = :userID
                            OR global = true)
                        AND target_type = 'entry'";

    $actionStatement = $pdo->prepare($actionQuery);
    $actionStatement->execute([':userID' => $userResponse["id"], ':termID' => $termID]);

    $actionResponse = $actionStatement->fetchAll(PDO::FETCH_ASSOC);

    $remTagsQuery = "   SELECT SUM(tags) AS remTags FROM (
                                SELECT tags FROM cpu_term.accessLogs
                                    WHERE user_id=:userID
                                   UNION 
                                SELECT SUM(sumCost * -1) FROM (
                                    SELECT SUM(cost) AS sumCost
                                    FROM cpu_term.user_actions AS UA_Entries
                                    INNER JOIN cpu_term.entries ON UA_Entries.target_id=entries.id
                                    WHERE UA_Entries.target_type='entry'
                                        AND entries.terminal_id=:termID
                                        AND UA_Entries.user_id=:userID
                                   UNION
                                    SELECT SUM(cost) AS sumCost
                                    FROM cpu_term.user_actions AS UA_Logs
                                    INNER JOIN cpu_term.accesslogs ON UA_Logs.target_id=accesslogs.id
                                    WHERE UA_Logs.target_type='log'
                                        AND accesslogs.terminal_id=:termID
                                        AND UA_Logs.user_id=:userID
                                   UNION
                                    SELECT SUM(cost) AS sumCost
                                    FROM cpu_term.user_actions AS UA_Term
                                    WHERE UA_Term.target_type='terminal'
                                        AND UA_Term.target_id=:termID
                                        AND UA_Term.user_id=:userID
                                   UNION
                                    SELECT SUM(cost) AS sumCost
                                    FROM cpu_term.user_actions AS UA_Items
                                    INNER JOIN cpu_term.accesslogs ON UA_Items.target_id=accesslogs.id
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
                                    "remTags" => max($remTagsResponse,0)
                                ));
}