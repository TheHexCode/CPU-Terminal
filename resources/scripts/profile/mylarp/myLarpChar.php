<?php
require('../db/dbConnect.php');
require('../db/setUser.php');

$mlEmail = $_POST["mlEmail"];
$mlPass = $_POST["mlPass"];
$mlCharID = $_POST["mlCharID"];
$mlCharName = $_POST["mlCharName"];

/*
$curlHandle = curl_init("https://cpularp.mylarp.dev/scripts/User.login.asp");

$curlOptions = array(
    CURLOPT_COOKIEFILE => "",
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query(array(
        "email" => $mlEmail,
        "pword" => $mlPass
    )),
    CURLOPT_RETURNTRANSFER => true
);

curl_setopt_array($curlHandle, $curlOptions);
curl_setopt($curlHandle,CURLOPT_SSL_OPTIONS,CURLSSLOPT_NATIVE_CA);

$loginResponse = curl_exec($curlHandle);

curl_reset($curlHandle);

$curlCharOptions = array(
    CURLOPT_URL => "https://cpularp.mylarp.dev/api/1.0/Character/skillcard.asp?id=" . $mlCharID,
    CURLOPT_RETURNTRANSFER => true
);

curl_setopt_array($curlHandle,$curlCharOptions);
curl_setopt($curlHandle,CURLOPT_SSL_OPTIONS,CURLSSLOPT_NATIVE_CA);

$mlCharResponse = json_decode(curl_exec($curlHandle));

curl_close($curlHandle);
*/
#####################################################################################################################################################

$dbCharQuery = "SELECT * FROM {$dbName}.users
                WHERE ml_id = :mlID;";

$dbCharStatement = $pdo->prepare($dbCharQuery);
$dbCharStatement->execute([':mlID' => $mlCharID]);

$dbCharResponse = $dbCharStatement->fetch(PDO::FETCH_ASSOC);

//$mlFuncArray = $mlCharResponse->skills;

if($dbCharResponse === false)
{
    $userCode = generateCode($pdo, $dbName);

    addUser($pdo,$dbName,$mlCharID, $userCode,$mlCharName);

    $dbCharStatement = $pdo->prepare($dbCharQuery);
    $dbCharStatement->execute([':mlID' => $mlCharID]);

    $dbCharResponse = $dbCharStatement->fetch(PDO::FETCH_ASSOC);
}
else
{    
    $userCode = $dbCharResponse["userCode"];

    updateUser($pdo,$dbName,$dbCharResponse["ml_id"],$mlCharName);
}

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
                    FROM {$dbName}.sr_entry_functions
                    INNER JOIN {$dbName}.user_functions ON user_functions.function_id = sr_entry_functions.id
                    INNER JOIN {$dbName}.sr_functions ON sr_functions.id = sr_entry_functions.func_id
                    WHERE
                        user_functions.user_id = :userID
                    GROUP BY sr_functions.name,
                            sr_functions.type,
                            sr_functions.hacking_cat";

$functionStatement = $pdo->prepare($functionQuery);
$functionStatement->execute([':userID' => $dbCharResponse["ml_id"]]);
$functionResponse = $functionStatement->fetchAll(PDO::FETCH_ASSOC);

$roleQuery = "  SELECT DISTINCT sr_roles.name
                FROM user_functions
                INNER JOIN sr_entry_functions ON sr_entry_functions.id = user_functions.function_id
                INNER JOIN sr_entries ON sr_entries.id = sr_entry_functions.entry_id
                INNER JOIN sr_roles ON sr_roles.id = sr_entries.role_id
                WHERE user_functions.user_id = :userID";

$roleStatement = $pdo->prepare($roleQuery);
$roleStatement->execute([':userID' => $dbCharResponse["ml_id"]]);
$roleResponse = $roleStatement->fetchAll(PDO::FETCH_COLUMN);

$discoQuery = " SELECT * FROM {$dbName}.user_discoveries
                WHERE user_id = :userID";

$discoStatement = $pdo->prepare($discoQuery);
$discoStatement->execute([':userID' => $dbCharResponse["ml_id"]]);
$discoResponse = $discoStatement->fetchAll(PDO::FETCH_ASSOC);

/*
$functionQuery = "  SELECT DISTINCT	cpu_functions.name,
                                    SUM(ml_functions.rank) AS 'rank',
                                    cpu_functions.type,
                                    GROUP_CONCAT(
                                        CASE
                                            WHEN ml_functions.cav_type = 'bound'
                                                THEN (SELECT cpu_caviats.displayName FROM cpu_caviats WHERE cpu_caviats.id = ml_functions.cav_id)
                                            WHEN ml_functions.cav_type = 'choice'
                                                THEN (SELECT cpu_caviats.displayName FROM cpu_caviats WHERE cpu_caviats.id = user_functions.cav_id)
                                            ELSE NULL
                                        END
                                        SEPARATOR ';'
                                    ) AS caviats,
                                    cpu_functions.hacking_cat
                    FROM {$dbName}.ml_functions
                    INNER JOIN {$dbName}.user_functions ON user_functions.mlFunction_id = ml_functions.id
                    INNER JOIN {$dbName}.cpu_functions ON cpu_functions.id = ml_functions.function_id
                    WHERE
                        user_functions.user_id = :userID
                        AND cpu_functions.hacking_cat IS NOT NULL
                    GROUP BY cpu_functions.name,
                            cpu_functions.type,
                            cpu_functions.hacking_cat";

$functionStatement = $pdo->prepare($functionQuery);
$functionStatement->execute([':userID' => $mlCharID]);
$functionResponse = $functionStatement->fetchAll(PDO::FETCH_ASSOC);

$roleQuery = "  SELECT DISTINCT cpu_roles.name
                FROM {$dbName}.ml_functions
                INNER JOIN {$dbName}.cpu_roles ON ml_functions.role_id=cpu_roles.id
                WHERE ml_name IN ( ?" . str_repeat(', ?', count($mlFuncArray)-1) . " )";

$roleStatement = $pdo->prepare($roleQuery);
$roleStatement->execute(array_column($mlFuncArray,"name"));
$roleResponse = $roleStatement->fetchAll(PDO::FETCH_COLUMN);
*/

$itemQuery = "  SELECT item_abbr, count
                FROM {$dbName}.user_items
                WHERE user_id = :userID";

$itemStatement = $pdo->prepare($itemQuery);
$itemStatement->execute([':userID' => $dbCharResponse["ml_id"]]);
$itemResponse = $itemStatement->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(array(  "id" => $dbCharResponse["ml_id"],
                                "name" => $mlCharName,
                                "userCode" => $userCode,
                                "origin" => $dbCharResponse["origin"],
                                "functions" => $functionResponse,
                                "discoveries" => $discoResponse,
                                "roles" => $roleResponse,
                                "items" => $itemResponse ));