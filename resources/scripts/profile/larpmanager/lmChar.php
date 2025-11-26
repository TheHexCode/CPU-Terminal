<?php

require('../db/dbConnect.php');
require('./dbUser.php');

$lmEmail = $_POST["lmEmail"];
$lmPass = $_POST["lmPass"];
$lmChar = $_POST["lmChar"];

##################################################################################################

$curlHandle = curl_init("http://larpmanager.cpularp.com/login/");

$curlOptions = array(
    CURLOPT_COOKIEFILE => "",
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => array(
        "Host: larpmanager.cpularp.com",
        "Origin: http://larpmanager.cpularp.com"
    )
);

curl_setopt_array($curlHandle, $curlOptions);
#curl_setopt($curlHandle,CURLOPT_SSL_OPTIONS,CURLSSLOPT_NATIVE_CA);
curl_setopt($curlHandle,CURLOPT_USE_SSL,CURLUSESSL_NONE);

$loginDOM = new DOMDocument();
@$loginDOM->loadHtml(curl_exec($curlHandle), LIBXML_NOWARNING);

$csrfToken = array_filter(iterator_to_array($loginDOM->getElementsByTagName("input")),function ($element)
    {
        return $element->getAttribute("name") === "csrfmiddlewaretoken";
    })[0]->getAttribute("value");

curl_setopt($curlHandle,CURLOPT_POSTFIELDS,http_build_query(array(
        "csrfmiddlewaretoken" => $csrfToken,
        "username" => $lmEmail,
        "password" => $lmPass)));

curl_exec($curlHandle);

##################################################################################################

// ABILITIES

curl_setopt($curlHandle,CURLOPT_URL,"http://larpmanager.cpularp.com/api/test/1/character/" . $lmChar["num"] . "/");
curl_setopt($curlHandle,CURLOPT_HTTPGET,1);
$lmCharacter = json_decode(curl_exec($curlHandle), true);

#echo var_dump($lmCharacter);
/*
$lmCharacter = json_decode('
    {
        "id": 30,
        "name": "Puck",
        "abilities":
        [
            {
                "id": 4,
                "name": "Roles",
                "abilities":
                [
                    {
                        "id": 11,
                        "name": "Standard Role"
                    },
                    {
                        "id": 369,
                        "name": "Slipstream"
                    }
                ]
            },
            {
                "id": 1,
                "name": "Role 1",
                "abilities":
                [
                    {
                        "id": 486,
                        "name": "Test 1"
                    },
                    {
                        "id": 487,
                        "name": "Test 2"
                    }
                ]
            },
            {
                "id": 2,
                "name": "Role 2",
                "abilities":
                [
                    {
                        "id": 488,
                        "name": "Test 3"
                    },
                    {
                        "id": 175,
                        "name": "Test 3"
                    },
                    {
                        "id": 183,
                        "name": "Test 3"
                    },
                    {
                        "id": 404,
                        "name": "Test 3"
                    },
                    {
                        "id": 326,
                        "name": "Test 3"
                    },
                    {
                        "id": 320,
                        "name": "Test 3"
                    },
                    {
                        "id": 305,
                        "name": "Test 3"
                    },
                    {
                        "id": 493,
                        "name": "Test 3"
                    },
                    {
                        "id": 843,
                        "name": "Test 3"
                    },
                    {
                        "id": 59,
                        "name": "Test 3"
                    },
                    {
                        "id": 62,
                        "name": "Test 3"
                    }
                ]
            }
        ]
    }', true);
*/
# 4 = Roles
# 8 = Base Roles (Origins)
# 31 = Protocols
$lmRoleIDs =  array_column(array_merge(...array_column(array_filter($lmCharacter["ability_types"], function ($ability_type) {
    return in_array($ability_type["id"],array(4,8,31));
}), "abilities")), "id");

# 30 = Infamy
# 37 = SimRAM Chips
$lmAbilityIDs = array_column(array_merge(...array_column(array_filter($lmCharacter["ability_types"], function ($ability_type) {
    return !in_array($ability_type["id"],array(4,8,31,30,37));
}),"abilities")),"id");

#echo var_dump($lmRoleIDs);
#echo "---------------------------";
#echo var_dump($lmAbilityIDs);

##################################################################################################

##################################################################################################

$dbCharQuery = "SELECT * FROM {$dbName}.users
                WHERE lm_id = :lmID;";

$dbCharStatement = $pdo->prepare($dbCharQuery);
$dbCharStatement->execute([':lmID' => $lmChar["id"]]);

$dbCharResponse = $dbCharStatement->fetch(PDO::FETCH_ASSOC);

if($dbCharResponse === false)
{
    $userCode = generateCode($pdo, $dbName);

    addDBUser($pdo,$dbName,$lmChar["id"], $userCode,$lmChar["name"],array_merge($lmRoleIDs, $lmAbilityIDs));

    $dbCharStatement = $pdo->prepare($dbCharQuery);
    $dbCharStatement->execute([':lmID' => $lmChar["id"]]);

    $dbCharResponse = $dbCharStatement->fetch(PDO::FETCH_ASSOC);
}
else
{
    $userCode = $dbCharResponse["userCode"];

    updateDBUser($pdo,$dbName,$dbCharResponse["lm_id"],$lmChar["name"], array_merge($lmRoleIDs, $lmAbilityIDs));
}

##################################################################################################

// ROLES / FUNCTIONS

$roleQuery = "  SELECT DISTINCT cpu_roles.name
                FROM {$dbName}.cpu_roles
                WHERE cpu_roles.lm_id IN ( ?" . str_repeat(", ?",count($lmRoleIDs)-1) . " )
                GROUP BY cpu_roles.name";

$roleStatement = $pdo->prepare($roleQuery);
$roleStatement->execute($lmRoleIDs);

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
                    WHERE cpu_abilities.lm_id IN ( ?" . str_repeat(', ?', count($lmAbilityIDs)-1) . " )
                    GROUP BY 	cpu_ability_functions.mod_id,
                                cpu_ability_functions.source_id,
                                cpu_ability_functions.func_id,
                                cpu_ability_functions.keyword_id,
                                cpu_ability_functions.keyword_type";

$functionStatement = $pdo->prepare($functionQuery);
$functionStatement->execute($lmAbilityIDs);

$functionResponse = $functionStatement->fetchAll(PDO::FETCH_ASSOC);

// ITEMS
$itemQuery = "  SELECT  item AS name,
                        tier,
                        instance_key AS instanceKey,
                        instance_value AS instanceValue
                FROM {$dbName}.user_items
                WHERE user_id = :userID";

$itemStatement = $pdo->prepare($itemQuery);
$itemStatement->execute([':userID' => $dbCharResponse["lm_id"]]);
$itemResponse = $itemStatement->fetchAll(PDO::FETCH_ASSOC);

##################################################################################################

echo json_encode(array(  "id" => $dbCharResponse["lm_id"],
                                "name" => $lmChar["name"],
                                "userCode" => $userCode,
                                //"roles" => $roleResponse,
                                "functions" => $functionResponse,
                                "items" => $itemResponse ));