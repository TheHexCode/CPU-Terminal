<?php

require('../db/dbConnect.php');
require('./dbUser.php');

$lmEmail = $_POST["lmEmail"];
$lmPass = $_POST["lmPass"];
$lmChar = $_POST["lmChar"];

# FOR TESTING:
# $lmChar = json_decode('[{"uuid": "f3b1e2a3-2c38-4fd7-b838-e4e702bc057c", "name": "Puck"}]');
# $lmChar = json_decode('[{"uuid": "f5458be4-9373-442a-be68-1b845c9dfb48", "name": "Azula Roseblood IV"}]');
##################################################################################################

$curlHandle = curl_init("https://larpmanager.cpularp.com/login/");

$curlOptions = array(
    CURLOPT_COOKIEFILE => "",
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => array(
        "Host: larpmanager.cpularp.com",
        "Origin: https://larpmanager.cpularp.com"
    )
);

curl_setopt_array($curlHandle, $curlOptions);
curl_setopt($curlHandle, CURLOPT_SSL_VERIFYPEER, false);
#curl_setopt($curlHandle,CURLOPT_SSL_OPTIONS,CURLSSLOPT_NATIVE_CA);
#curl_setopt($curlHandle,CURLOPT_USE_SSL,CURLUSESSL_NONE);

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

curl_setopt($curlHandle,CURLOPT_URL,"http://larpmanager.cpularp.com/test/character/" . $lmChar["uuid"] . "/abilities/json/");
curl_setopt($curlHandle,CURLOPT_HTTPGET,1);
$lmCharacter = json_decode(curl_exec($curlHandle), true);

#echo json_encode($lmCharacter);
/*
$lmCharacter = json_decode(
    {
        "uuid":"f3b1e2a3-2c38-4fd7-b838-e4e702bc057c",
        "name":"Puck",
        "abilities":
        {
            "5963a866-c784-454a-98b5-9812b49c1978":
            {
                "type_name":"Roles",
                "type_abilities": [
                    {
                        "458dfd34-76a7-4038-8f8a-dde63391bd5c":"Dissimulator"
                    }
                ]
            },
            "2a9fe298-6519-4db6-9db8-f2e480f421aa":
            {
                "type_name":"Base Role",
                "type_abilities": [
                    {
                        "d00a9187-effb-45bf-931f-ee62533a023a":"Standard Role"
                    }
                ]
            },
            "97bebf6d-1ce8-40cb-8ccd-36e7d735abf4":
            {
                "type_name":"SimRAM Chips",
                "type_abilities": [
                    {
                        "4947754d-23fc-456d-b7d7-3938188575ba":"T0 Experimental SimRAM-F Chip"
                    }
                ]
            },
            "e2f1bfe9-b78a-45a5-b1df-1b886e7d01bf":
            {
                "type_name":"Dissimulator",
                "type_abilities": [
                    {
                        "9c905331-296b-4f1e-92a7-88e3d5d4d120":"(T1 Dissimulator) 1ST Scavenge I"
                    },
                    {
                        "c0e74791-c647-4f28-bb53-2df30023438e":"(T1 Dissimulator) Alarm Sense"
                    },
                    {
                        "385107a7-c3a6-4215-bf73-a10940624dbd":"(T1 Dissimulator) Hacking I"
                    },
                    {
                        "566a8a33-bd09-493d-90a5-e92e879c8a79":"(T2 Dissimulator) Hacking I"
                    },
                    {
                        "9a6b6aa8-c432-4e8d-b39d-6fc5612c8013":"(T2 Dissimulator) Ping"
                    },
                    {
                        "3e6bb347-4c53-4316-aee1-8819c16967e2":"(T2 Dissimulator) Repeat"
                    },
                    {
                        "94b1ec6c-1e72-4301-9856-64e58081358c":"(T3 Dissimulator) Wipe Your Tracks"
                    }
                ]
            },
            "3197113a-886d-4c5b-bec3-be5e77d026ac":{"type_name":"Standard Role","type_abilities":[{"f58e6910-9540-4f30-b421-6d92d3dd2620":"(T1 Standard Role) Connections (random)"},{"3cbf36cb-e7ca-4471-86b2-4e170de3a5ce":"(T1 Standard Role) Knowledge (choose one)"},{"5a8be3dc-9ce0-4c89-8e56-ba7d9843ef11":"(T1 Standard Role) Pick Locks I"},{"985a13b9-d77b-4206-8dfc-718a49d34a55":"(T1 Standard Role) Repair I"},{"d24fe995-8874-491f-b5a1-dc6602a6bbe4":"(T1 Standard Role) Resist (free at Character creation)"},{"1b33f6e5-7ae6-45cb-8b74-e2523b37b63f":"(T1 Standard Role) Strength I (free at Character creation)"},{"a3b4421a-d6cd-401a-bf10-e7cfa7966b06":"(T1 Standard Role) Weapon Proficiency (all) & Shield Proficiency (all) (free at Character creation)"},{"28826467-56a1-485e-85a3-b2044aa1450a":"(T2 Standard Role) Craft (choose one)"},{"04a45d5b-0d2f-4eb8-b8d5-e02aa061808f":"(T2 Standard Role) Knowledge (choose one)"},{"7f3dcce3-3169-4e17-93e3-0876936632bf":"(T3 Standard Role) Tight-Lipped"}]}}})
*/

# Roles        >> 5963a866-c784-454a-98b5-9812b49c1978
# Base Role    >> 2a9fe298-6519-4db6-9db8-f2e480f421aa
# Protocols    >> a9104e1f-44fe-4c7e-87b7-16ed179d8898
# Infamy       >> 3dac1ebd-bc4e-4fbc-83dc-38cde5ed00cc
# SimRAM Chips >> 97bebf6d-1ce8-40cb-8ccd-36e7d735abf4

$non_roles = [
    "5963a866-c784-454a-98b5-9812b49c1978",
    "2a9fe298-6519-4db6-9db8-f2e480f421aa",
    "a9104e1f-44fe-4c7e-87b7-16ed179d8898",
    "3dac1ebd-bc4e-4fbc-83dc-38cde5ed00cc",
    "97bebf6d-1ce8-40cb-8ccd-36e7d735abf4"
];

$lmRoleIDs = array_values(array_filter(array_keys($lmCharacter["abilities"]), function($array_key) use ($non_roles) {
    return !in_array($array_key, $non_roles);
}));

$lmAbilityIDs = array_keys( # Get the keys for that large dict
                    array_merge( # Merge all of the dict values into one large dict
                        ...array_merge( # Merge all of those dicts ({ ability_uuid: ability_name }) into one dict for each type
                            ...array_column( # For each of those, grab the values of the "type_abilities" key
                                array_intersect_key($lmCharacter["abilities"], array_flip($lmRoleIDs)) # Get all ability_types not in non_roles (i.e. actually get abilities under Standard, not the "Standard Role" ability under the "Roles" type)
                                ,"type_abilities")
                            )
                        )
                    );

# ["9c905331-296b-4f1e-92a7-88e3d5d4d120","c0e74791-c647-4f28-bb53-2df30023438e","385107a7-c3a6-4215-bf73-a10940624dbd","566a8a33-bd09-493d-90a5-e92e879c8a79","9a6b6aa8-c432-4e8d-b39d-6fc5612c8013","3e6bb347-4c53-4316-aee1-8819c16967e2","94b1ec6c-1e72-4301-9856-64e58081358c","f58e6910-9540-4f30-b421-6d92d3dd2620","3cbf36cb-e7ca-4471-86b2-4e170de3a5ce","5a8be3dc-9ce0-4c89-8e56-ba7d9843ef11","985a13b9-d77b-4206-8dfc-718a49d34a55","d24fe995-8874-491f-b5a1-dc6602a6bbe4","1b33f6e5-7ae6-45cb-8b74-e2523b37b63f","a3b4421a-d6cd-401a-bf10-e7cfa7966b06","28826467-56a1-485e-85a3-b2044aa1450a","04a45d5b-0d2f-4eb8-b8d5-e02aa061808f","7f3dcce3-3169-4e17-93e3-0876936632bf"]
#echo json_encode($lmAbilityIDs);

##################################################################################################

##################################################################################################

$dbCharQuery = "SELECT * FROM {$dbName}.users
                WHERE lm_id = :lmID;";

$dbCharStatement = $pdo->prepare($dbCharQuery);
$dbCharStatement->execute([':lmID' => $lmChar["uuid"]]);

$dbCharResponse = $dbCharStatement->fetch(PDO::FETCH_ASSOC);

if($dbCharResponse === false)
{
    $userCode = generateCode($pdo, $dbName);

    addDBUser($pdo,$dbName,$lmChar["uuid"],$userCode,$lmChar["name"],$lmAbilityIDs);

    $dbCharStatement = $pdo->prepare($dbCharQuery);
    $dbCharStatement->execute([':lmID' => $lmChar["uuid"]]);

    $dbCharResponse = $dbCharStatement->fetch(PDO::FETCH_ASSOC);
}
else
{
    $userCode = $dbCharResponse["userCode"];

    updateDBUser($pdo,$dbName,$dbCharResponse["lm_id"],$lmChar["name"], $lmAbilityIDs);
}

##################################################################################################

// ROLES / FUNCTIONS

#$roleQuery = "  SELECT DISTINCT cpu_roles.name
#                FROM {$dbName}.cpu_roles
#                WHERE cpu_roles.lm_id IN ( ?" . str_repeat(", ?",count($lmRoleIDs)-1) . " )
#                GROUP BY cpu_roles.name";

#$roleStatement = $pdo->prepare($roleQuery);
#$roleStatement->execute($lmRoleIDs);

#$roleResponse = $roleStatement->fetchAll(PDO::FETCH_COLUMN);

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

echo json_encode(array( "id" => $dbCharResponse["lm_id"],
                        "name" => $lmChar["name"],
                        "userCode" => $userCode,
                        //"roles" => $roleResponse,
                        "functions" => $functionResponse,
                        "items" => $itemResponse ));