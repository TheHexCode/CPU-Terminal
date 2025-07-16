<?php

require('dbConnect.php');

$userCode = $_POST["userCode"];
$termID = $_POST["termID"];

###############################################################################################################################

$activeQuery = "SELECT simCode,jobCode
                FROM {$dbName}.sim_active_codes";

$activeStatement = $pdo->prepare($activeQuery);
$activeStatement->execute();
$activeCodes = $activeStatement->fetch(PDO::FETCH_ASSOC);

$userQuery = "  SELECT ml_id,charName
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
    
    $functionQuery = "  SELECT DISTINCT	sr_functions.name,
                                        SUM(sr_entry_functions.rank) AS 'rank',
                                        sr_functions.type,
                                        sr_functions.hacking_cat,
                                        GROUP_CONCAT(
                                            CASE
                                                WHEN user_functions.keyword_type = 'knowledge'
                                                    THEN (SELECT sr_knowledges.name FROM sr_knowledges WHERE sr_knowledges.id = user_functions.keyword_id)
                                                WHEN user_functions.keyword_type = 'proficiency'
                                                    THEN (SELECT sr_proficiencies.name FROM sr_proficiencies WHERE sr_proficiencies.id = user_functions.keyword_id)
                                                WHEN user_functions.keyword_type = 'keyword'
                                                    THEN (SELECT sr_keywords.name FROM sr_keywords WHERE sr_keywords.id = user_functions.keyword_id)
                                                ELSE NULL
                                            END
                                            SEPARATOR ';'
                                        ) AS keywords
                        FROM sr_entry_functions
                        INNER JOIN user_functions ON user_functions.function_id = sr_entry_functions.id
                        INNER JOIN sr_functions ON sr_functions.id = sr_entry_functions.func_id
                        WHERE user_functions.user_id = :userID
                        GROUP BY sr_functions.name,
                                 sr_functions.type,
                                 sr_functions.hacking_cat";
    
    $functionStatement = $pdo->prepare($functionQuery);
    $functionStatement->execute([':userID' => $userResponse["ml_id"]]);
    $functionResponse = $functionStatement->fetchAll(PDO::FETCH_ASSOC);

    $roleQuery = "  SELECT DISTINCT sr_roles.name
                    FROM user_functions
                    INNER JOIN sr_entry_functions ON sr_entry_functions.id = user_functions.function_id
                    INNER JOIN sr_entries ON sr_entries.id = sr_entry_functions.entry_id
                    INNER JOIN sr_roles ON sr_roles.id = sr_entries.role_id
                    WHERE user_functions.user_id = :userID";

    $roleStatement = $pdo->prepare($roleQuery);
    $roleStatement->execute([':userID' => $userResponse["ml_id"]]);
    $roleResponse = $roleStatement->fetchAll(PDO::FETCH_COLUMN);

    $itemQuery = "  SELECT items.abbr, items.name, items.tier, items.category, items.radio
                    FROM {$dbName}.user_items
                    INNER JOIN {$dbName}.items ON user_items.item_abbr=items.abbr
                    WHERE user_id = :userID";

    $itemStatement = $pdo->prepare($itemQuery);
    $itemStatement->execute([':userID' => $userResponse["ml_id"]]);
    $itemResponse = $itemStatement->fetchAll(PDO::FETCH_ASSOC);

    $effectQuery = "    SELECT item_effects.abbr, charges, per_type, use_loc, req_type, requirement
                        FROM {$dbName}.item_effects
                        INNER JOIN {$dbName}.items_to_effects ON items_to_effects.effect_abbr = item_effects.abbr
                        INNER JOIN {$dbName}.items ON items.abbr = items_to_effects.item_abbr
                        WHERE item_abbr = :itemAbbr";

    $effectStatement = $pdo->prepare($effectQuery);

    $simUseQuery = "SELECT COUNT(*)
                    FROM {$dbName}.item_uses
                    WHERE 	user_id = :userID
                        AND effect_abbr = :effectAbbr
                        AND simCode = :simCode";

    $simUseStatement = $pdo->prepare($simUseQuery);

    $sceneUseQuery = "  SELECT COUNT(*)
                        FROM {$dbName}.item_uses
                        WHERE 	user_id = :userID
                            AND effect_abbr = :effectAbbr
                            AND jobCode = :jobCode
                            AND simCode = :simCode";

    $sceneUseStatement = $pdo->prepare($sceneUseQuery);

    $itemUseQuery = "   SELECT SUM(item_effects.charges - user_items.count)
                        FROM user_items
                        INNER JOIN {$dbName}.items_to_effects ON items_to_effects.item_abbr = user_items.item_abbr
                        INNER JOIN {$dbName}.item_effects ON item_effects.abbr = items_to_effects.effect_abbr
                        WHERE 	user_id = :userID
                            AND user_items.item_abbr = :itemAbbr";

    $itemUseStatement = $pdo->prepare($itemUseQuery);

    $newItems = array();

    foreach($itemResponse as $item)
    {
        $effectStatement->execute([':itemAbbr' => $item["abbr"]]);
        $effectResponse = $effectStatement->fetchAll(PDO::FETCH_ASSOC);

        $newEffects = array();

        foreach($effectResponse as $effect)
        {
            switch($effect["per_type"])
            {
                case ("sim"):
                    $simUseStatement->execute([
                            ':userID' => $userResponse["ml_id"],
                            ':effectAbbr' => $effect["abbr"],
                            ':simCode' => $activeCodes["simCode"]
                        ]);
                    $useResponse = $simUseStatement->fetch(PDO::FETCH_COLUMN);
                    break;
                case ("scene"):
                    $sceneUseStatement->execute([
                            ':userID' => $userResponse["ml_id"],
                            ':effectAbbr' => $effect["abbr"],
                            ':jobCode' => $activeCodes["jobCode"],
                            ':simCode' => $activeCodes["simCode"]
                        ]);
                    $useResponse = $sceneUseStatement->fetch(PDO::FETCH_COLUMN);
                    break;
                case ("item"):
                    $itemUseStatement->execute([
                            ':userID' => $userResponse["ml_id"],
                            ':itemAbbr' => $item["abbr"]
                        ]);
                    $useResponse = $itemUseStatement->fetch(PDO::FETCH_COLUMN);
                    break;
                default:
                    $useResponse = 0;
                    break;
            }

            $effect["uses"] = intval($useResponse);

            $termUseQuery = "   SELECT COUNT(*)
                                FROM {$dbName}.item_uses
                                WHERE 	user_id = :userID
                                    AND effect_abbr = :effectAbbr
                                    AND jobCode = :jobCode
                                    AND simCode = :simCode
                                    AND terminal_id = :termID";

            $termUseStatement = $pdo->prepare($termUseQuery);
            $termUseStatement->execute([
                    ':userID' => $userResponse["ml_id"],
                    ':effectAbbr' => $effect["abbr"],
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

    $accessQuery = "SELECT COUNT(user_id)
                    FROM {$dbName}.sim_access_logs
                    WHERE user_id=:userID
                        AND terminal_id=:termID";

    $accessStatement = $pdo->prepare($accessQuery);
    $accessStatement->execute([':userID' => $userResponse["ml_id"], ':termID' => $termID]);
    $hasAccessed = intval($accessStatement->fetch(PDO::FETCH_COLUMN)) > 0;

    $actionQuery = "SELECT sim_entries.id, user_id, sim_entries.path, sim_entries.icon, action, newState
                    FROM {$dbName}.sim_user_actions
                    INNER JOIN {$dbName}.sim_entries ON target_id = sim_entries.id
                    WHERE sim_entries.terminal_id=:termID
                        AND (user_id=:userID
                            OR global=true)
                        AND target_type='entry'
                    ORDER BY time ASC";

    $actionStatement = $pdo->prepare($actionQuery);
    $actionStatement->execute([':userID' => $userResponse["ml_id"], ':termID' => $termID]);

    $actionResponse = $actionStatement->fetchAll(PDO::FETCH_ASSOC);

    $puzzleQuery = "SELECT DISTINCT sim_puzzles.id, sim_puzzles.repeat, SUM(newState) as uses
                    FROM sim_user_actions
                    INNER JOIN sim_puzzles ON target_id=sim_puzzles.id
                    WHERE sim_puzzles.terminal_id=:termID
                        AND (user_id=:userID
                            OR sim_user_actions.global=true)
                        AND target_type='puzzle'
                        AND (sim_puzzles.repeat > 0
                            OR sim_puzzles.repeat IS NULL)
                    GROUP BY sim_puzzles.id, sim_puzzles.repeat";

    $puzzleStatement = $pdo->prepare($puzzleQuery);
    $puzzleStatement->execute([':userID' => $userResponse["ml_id"], ':termID' => $termID]);

    $puzzleResponse = $puzzleStatement->fetchAll(PDO::FETCH_ASSOC);

    $masherQuery = "SELECT newState AS id, users.charName AS name, cost AS 'rank'
                    FROM {$dbName}.sim_user_actions
                    INNER JOIN {$dbName}.users ON users.ml_id = sim_user_actions.newState
                    WHERE target_id = :termID
                        AND user_id = :userID
                        AND action = 'Masher'";

    $masherStatement = $pdo->prepare($masherQuery);
    $masherStatement->execute([':termID' => $termID, ':userID' => $userResponse["ml_id"]]);

    $masherData = $masherStatement->fetch(PDO::FETCH_ASSOC);

    $copyQuery = "  SELECT DISTINCT action FROM (
                        SELECT action FROM {$dbName}.sim_user_actions AS UA1
                            INNER JOIN {$dbName}.sim_entries ON UA1.target_id=sim_entries.id
                            WHERE UA1.user_id=:userID
                                AND sim_entries.terminal_id=:termID
                       UNION
                        SELECT action FROM {$dbName}.sim_user_actions AS UA2
                            INNER JOIN {$dbName}.sim_access_logs ON UA2.target_id=sim_access_logs.id
                            WHERE UA2.user_id=:userID
                                AND sim_access_logs.terminal_id=:termID
                    ) AS UA";

    $copyStatement = $pdo->prepare($copyQuery);
    $copyStatement->execute([':userID' => $userResponse["ml_id"], ':termID' => $termID]);

    $copyResponse = $copyStatement->fetchAll(PDO::FETCH_COLUMN);

    $remTagsQuery = "   SELECT SUM(tags) AS remTags FROM (
                                SELECT tags FROM {$dbName}.sim_access_logs
                                    WHERE user_id=:userID
                                        AND terminal_id=:termID
                                   UNION 
                                SELECT SUM(sumCost * -1) FROM (
                                    SELECT SUM(cost) AS sumCost
                                    FROM {$dbName}.sim_user_actions AS UA_Entries
                                    INNER JOIN {$dbName}.sim_entries ON UA_Entries.target_id=sim_entries.id
                                    WHERE UA_Entries.target_type='entry'
                                        AND sim_entries.terminal_id=:termID
                                        AND UA_Entries.user_id=:userID
                                   UNION
                                    SELECT SUM(cost) AS sumCost
                                    FROM {$dbName}.sim_user_actions AS UA_Logs
                                    INNER JOIN {$dbName}.sim_access_logs ON UA_Logs.target_id=sim_access_logs.id
                                    WHERE UA_Logs.target_type='log'
                                        AND sim_access_logs.terminal_id=:termID
                                        AND UA_Logs.user_id=:userID
                                   UNION
                                    SELECT SUM(cost) AS sumCost
                                    FROM {$dbName}.sim_user_actions AS UA_Term
                                    WHERE UA_Term.target_type='terminal'
                                        AND UA_Term.target_id=:termID
                                        AND UA_Term.user_id=:userID
                                   UNION
                                    SELECT SUM(cost) AS sumCost
                                    FROM {$dbName}.sim_user_actions AS UA_Items
                                    /* THIS SECTION ONLY SELECTS ITEMS THE PLAYER CURRENTLY HAS EQUIPPED. */
                                    /* CURRENTLY WE WANT ALL ITEMS TO BE COUNTED, BUT BECAUSE CERTAIN ABILITIES ALLOW PLAYERS TO SWAP CUSTOMIZATIONS AND STUFF IN GAME, MIGHT NEED THIS LATER */
                                    /*INNER JOIN (
                                        SELECT user_id, user_items.item_abbr, item_effects.abbr AS effect_abbr
                                        FROM {$dbName}.user_items
                                        INNER JOIN {$dbName}.items_to_effects ON items_to_effects.item_abbr = user_items.item_abbr
                                        INNER JOIN {$dbName}.item_effects ON item_effects.abbr = items_to_effects.effect_abbr
                                        WHERE user_id=:userID
                                    ) AS user_effects ON target_id=user_effects.effect_abbr*/
                                    WHERE UA_Items.target_type='item'
                                        AND UA_Items.newState=:termID
                                        AND UA_Items.user_id=:userID
                                   UNION
                                    SELECT SUM(UA_Puzz_Cost.cost) AS sumCost
                                    FROM {$dbName}.sim_user_actions AS UA_Puzz_Cost
                                    INNER JOIN sim_puzzles ON UA_Puzz_Cost.target_id=sim_puzzles.id
                                    WHERE UA_Puzz_Cost.target_type='puzzle'
                                        AND sim_puzzles.terminal_id=:termID
                                        AND UA_Puzz_Cost.user_id=:userID
                                   UNION
                                    SELECT (SUM(reward) * -1) AS sumCost
                                    FROM {$dbName}.sim_user_actions AS UA_Puzz_Reward
                                    INNER JOIN sim_puzzles ON UA_Puzz_Reward.target_id=sim_puzzles.id
                                    WHERE UA_Puzz_Reward.target_type='puzzle'
                                        AND sim_puzzles.terminal_id=:termID
                                        AND sim_puzzles.reward_type='tags'
                                        AND UA_Puzz_Reward.user_id=:userID
                                ) AS tC
                            ) AS rT";

    $remTagsStatement = $pdo->prepare($remTagsQuery);
    $remTagsStatement->execute([':userID' => $userResponse["ml_id"], ':termID' => $termID]);

    $remTagsResponse = intval($remTagsStatement->fetch(PDO::FETCH_COLUMN));

    echo json_encode(array(  "id" => $userResponse["ml_id"],
                                    "name" => $userResponse["charName"],
                                    "userCode" => $userCode,
                                    "functions" => $functionResponse,
                                    "roles" => $roleResponse,
                                    "items" => $newItems,
                                    "hasAccessed" => $hasAccessed,
                                    "prevActions" => $actionResponse,
                                    "puzzActions" => $puzzleResponse,
                                    "masherData" => ($masherData ? array(
                                                        "id" => intval($masherData["id"]),
                                                        "name" => $masherData["name"],
                                                        "rank" => intval($masherData["rank"]) * -1
                                                    ) : null),
                                    "copyables" => $copyResponse,
                                    "remTags" => max($remTagsResponse,0)
                                ));
}