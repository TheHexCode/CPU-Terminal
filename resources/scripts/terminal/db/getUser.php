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

$userQuery = "  SELECT lm_id, charName
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
    $abilityQuery = "   SELECT ability_lmid
                        FROM {$dbName}.user_abilities
                        WHERE user_id = :userID";

    $abilityStatement = $pdo->prepare($abilityQuery);
    $abilityStatement->execute([':userID' => $userResponse["lm_id"]]);
    $abilityList = $abilityStatement->fetchAll(PDO::FETCH_COLUMN);

    $roleQuery = "  SELECT DISTINCT cpu_roles.name
                    FROM {$dbName}.cpu_roles
                    WHERE cpu_roles.lm_id IN ( ?" . str_repeat(", ?",count($abilityList)-1) . " )
                    GROUP BY cpu_roles.name";

    $roleStatement = $pdo->prepare($roleQuery);
    $roleStatement->execute($abilityList);

    $roleResponse = $roleStatement->fetchAll(PDO::FETCH_COLUMN);

    $functionQuery = "  SELECT DISTINCT CONCAT_WS(
                                            ' ',
                                            (SELECT cpu_mods.name AS `mod` WHERE cpu_mods.id = cpu_ability_functions.mod_id),
                                            (SELECT cpu_sources.name AS source WHERE cpu_sources.id = cpu_ability_functions.source_id),
                                            cpu_functions.name,
                                            CASE
                                                WHEN cpu_functions.type <> 'unique' AND cpu_functions.keyworded
                                                THEN (
                                                    CASE cpu_ability_functions.keyword_type
                                                        WHEN 'keyword'
                                                        THEN ( CONCAT( '(', ( SELECT cpu_keywords.name FROM cpu_keywords WHERE cpu_keywords.id = cpu_ability_functions.keyword_id ), ')' ) )
                                                        WHEN 'proficiency'
                                                        THEN ( CONCAT( '(', ( SELECT cpu_proficiencies.name FROM cpu_proficiencies WHERE cpu_proficiencies.id = cpu_ability_functions.keyword_id), ')' ) )
                                                        WHEN 'knowledge'
                                                        THEN ( CONCAT( '(', ( SELECT cpu_knowledges.name FROM cpu_knowledges WHERE cpu_knowledges.id = cpu_ability_functions.keyword_id), ')' ) )
                                                        ELSE NULL
                                                    END
                                                )
                                                ELSE NULL
                                            END
                                        ) AS name,
                                        SUM(cpu_ability_functions.rank) AS `rank`,
                                        cpu_functions.type,
                                        cpu_functions.hacking_cat,
                                        GROUP_CONCAT(
                                            CASE
                                                WHEN cpu_functions.type = 'unique' AND cpu_functions.keyworded
                                                THEN (
                                                    CASE cpu_ability_functions.keyword_choose
                                                        WHEN TRUE
                                                        THEN ( '[Choice]' )
                                                        ELSE (
                                                            CASE cpu_ability_functions.keyword_type
                                                                WHEN 'keyword'
                                                                THEN ( SELECT cpu_keywords.name FROM cpu_keywords WHERE cpu_keywords.id = cpu_ability_functions.keyword_id )
                                                                WHEN 'proficiency'
                                                                THEN ( SELECT cpu_proficiencies.name FROM cpu_proficiencies WHERE cpu_proficiencies.id = cpu_ability_functions.keyword_id )
                                                                WHEN 'knowledge'
                                                                THEN ( SELECT cpu_knowledges.name FROM cpu_knowledges WHERE cpu_knowledges.id = cpu_ability_functions.keyword_id )
                                                                ELSE NULL
                                                            END
                                                        )
                                                    END
                                                )
                                                ELSE NULL
                                            END
                                        SEPARATOR ';'
                                        ) AS keyword
                        FROM cpu_ability_functions
                        INNER JOIN cpu_abilities ON cpu_abilities.id = cpu_ability_functions.ability_id
                        LEFT JOIN cpu_mods ON cpu_mods.id = cpu_ability_functions.mod_id
                        LEFT JOIN cpu_sources ON cpu_sources.id = cpu_ability_functions.source_id
                        LEFT JOIN cpu_keywords ON cpu_keywords.id = cpu_ability_functions.keyword_id
                        INNER JOIN cpu_functions ON cpu_functions.id = cpu_ability_functions.func_id
                        WHERE cpu_abilities.lm_id IN ( ?" . str_repeat(', ?', count($abilityList)-1) . " )
                        GROUP BY 	cpu_ability_functions.mod_id,
                                    cpu_ability_functions.source_id,
                                    cpu_ability_functions.func_id,
                                    cpu_ability_functions.keyword_id,
                                    cpu_ability_functions.keyword_type";

    $functionStatement = $pdo->prepare($functionQuery);
    $functionStatement->execute($abilityList);

    $functionResponse = $functionStatement->fetchAll(PDO::FETCH_ASSOC);

    $itemQuery = "  SELECT  item AS name,
                            tier,
                            instance_key AS instanceKey,
                            instance_value AS instanceValue
                    FROM {$dbName}.user_items
                    WHERE user_id = :userID";

    $itemStatement = $pdo->prepare($itemQuery);
    $itemStatement->execute([':userID' => $userResponse["lm_id"]]);
    $itemResponse = $itemStatement->fetchAll(PDO::FETCH_ASSOC);

    /*
    $effectQuery = "    SELECT item_effects.abbr, charges, per_type, use_loc, req_type, requirement
                        FROM {$dbName}.item_effects
                        INNER JOIN {$dbName}.items_to_effects ON items_to_effects.effect_abbr = item_effects.abbr
                        INNER JOIN {$dbName}.items ON items.abbr = items_to_effects.item_abbr
                        WHERE item_abbr = :itemAbbr";

    $effectStatement = $pdo->prepare($effectQuery);
    */

    $itemUseQuery = "   SELECT DISTINCT effect,
                                        ( SELECT COUNT(effect)
                                        WHERE user_id = :userID
                                            AND simCode = :simCode
                                        ) AS simUses,
                                        ( SELECT COUNT(effect)
                                        WHERE user_id = :userID
                                            AND jobCode = :jobCode
                                        ) AS jobUses,
                                        ( SELECT COUNT(effect)
                                        WHERE user_id = :userID
                                            AND terminal_id = :termID
                                        ) AS termUses,
                                        ( SELECT COUNT(effect)
                                        WHERE user_id = :userID
                                        ) AS itemUses
                        FROM {$dbName}.item_uses
                        GROUP BY user_id,
                                effect,
                                simCode,
                                jobCode,
                                terminal_id";

    $itemUseStatement = $pdo->prepare($itemUseQuery);
    $itemUseStatement->execute([':userID' => $userResponse["lm_id"],
                                        ':simCode' => $activeCodes["simCode"],
                                        ':jobCode' => $activeCodes["jobCode"],
                                        ':termID' => $termID]);
    $itemUseResponse = $itemUseStatement->fetchAll(PDO::FETCH_ASSOC);

    $effectQuery = "SELECT effect_name, effect_values
                    FROM {$dbName}.sim_payload_effects
                    WHERE user_id = :userID
                       AND ( duration = :simCode
                          OR duration = :jobCode
                          OR duration = :termID )";

    $effectStatement = $pdo->prepare($effectQuery);
    $effectStatement->execute([':userID' => $userResponse["lm_id"],
                                       ':simCode' => $activeCodes["simCode"],
                                       ':jobCode' => $activeCodes["jobCode"],
                                       ':termID' => $termID]);
    $effectArray = $effectStatement->fetchAll(PDO::FETCH_ASSOC);

/*
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
                            ':userID' => $userResponse["lm_id"],
                            ':effectAbbr' => $effect["abbr"],
                            ':simCode' => $activeCodes["simCode"]
                        ]);
                    $useResponse = $simUseStatement->fetch(PDO::FETCH_COLUMN);
                    break;
                case ("scene"):
                    $sceneUseStatement->execute([
                            ':userID' => $userResponse["lm_id"],
                            ':effectAbbr' => $effect["abbr"],
                            ':jobCode' => $activeCodes["jobCode"],
                            ':simCode' => $activeCodes["simCode"]
                        ]);
                    $useResponse = $sceneUseStatement->fetch(PDO::FETCH_COLUMN);
                    break;
                case ("item"):
                    $itemUseStatement->execute([
                            ':userID' => $userResponse["lm_id"],
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
                    ':userID' => $userResponse["lm_id"],
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
*/
    //////////////////////////////////////////////////////////////////////////////

    $accessQuery = "SELECT COUNT(user_id)
                    FROM {$dbName}.sim_access_logs
                    WHERE user_id=:userID
                        AND terminal_id=:termID";

    $accessStatement = $pdo->prepare($accessQuery);
    $accessStatement->execute([':userID' => $userResponse["lm_id"], ':termID' => $termID]);
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
    $actionStatement->execute([':userID' => $userResponse["lm_id"], ':termID' => $termID]);

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
    $puzzleStatement->execute([':userID' => $userResponse["lm_id"], ':termID' => $termID]);

    $puzzleResponse = $puzzleStatement->fetchAll(PDO::FETCH_ASSOC);

    $masherQuery = "SELECT newState AS id, users.charName AS name, cost AS 'rank'
                    FROM {$dbName}.sim_user_actions
                    INNER JOIN {$dbName}.users ON users.lm_id = sim_user_actions.newState
                    WHERE target_id = :termID
                        AND user_id = :userID
                        AND action = 'Masher'";

    $masherStatement = $pdo->prepare($masherQuery);
    $masherStatement->execute([':termID' => $termID, ':userID' => $userResponse["lm_id"]]);

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
    $copyStatement->execute([':userID' => $userResponse["lm_id"], ':termID' => $termID]);

    $copyResponse = $copyStatement->fetchAll(PDO::FETCH_COLUMN);

    $remTagsQuery = "   SELECT SUM(tags) AS remTags FROM (
                                SELECT tags FROM {$dbName}.sim_access_logs
                                    WHERE user_id=:userID
                                        AND terminal_id=:termID
                                   UNION ALL
                                SELECT SUM(sumCost * -1) FROM (
                                    SELECT SUM(cost) AS sumCost
                                    FROM {$dbName}.sim_user_actions AS UA_Entries
                                    INNER JOIN {$dbName}.sim_entries ON UA_Entries.target_id=sim_entries.id
                                    WHERE UA_Entries.target_type='entry'
                                        AND sim_entries.terminal_id=:termID
                                        AND UA_Entries.user_id=:userID
                                   UNION ALL
                                    SELECT SUM(cost) AS sumCost
                                    FROM {$dbName}.sim_user_actions AS UA_Logs
                                    INNER JOIN {$dbName}.sim_access_logs ON UA_Logs.target_id=sim_access_logs.id
                                    WHERE UA_Logs.target_type='log'
                                        AND sim_access_logs.terminal_id=:termID
                                        AND UA_Logs.user_id=:userID
                                   UNION ALL
                                    SELECT SUM(cost) AS sumCost
                                    FROM {$dbName}.sim_user_actions AS UA_Term
                                    WHERE UA_Term.target_type='terminal'
                                        AND UA_Term.target_id=:termID
                                        AND UA_Term.user_id=:userID
                                   UNION ALL
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
                                   UNION ALL
                                    SELECT SUM(UA_Puzz_Cost.cost) AS sumCost
                                    FROM {$dbName}.sim_user_actions AS UA_Puzz_Cost
                                    INNER JOIN sim_puzzles ON UA_Puzz_Cost.target_id=sim_puzzles.id
                                    WHERE UA_Puzz_Cost.target_type='puzzle'
                                        AND sim_puzzles.terminal_id=:termID
                                        AND UA_Puzz_Cost.user_id=:userID
                                   UNION ALL
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
    $remTagsStatement->execute([':userID' => $userResponse["lm_id"], ':termID' => $termID]);

    $remTagsResponse = intval($remTagsStatement->fetch(PDO::FETCH_COLUMN));

    echo json_encode(array(  "id" => $userResponse["lm_id"],
                                    "name" => $userResponse["charName"],
                                    "userCode" => $userCode,
                                    "functions" => $functionResponse,
                                    "roles" => $roleResponse,
                                    "items" => $itemResponse,
                                    "itemUses" => $itemUseResponse,
                                    "effects" => $effectArray,
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