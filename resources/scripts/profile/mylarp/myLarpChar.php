<?php
require('../db/dbConnect.php');
require('../db/setUser.php');

$mlEmail = $_POST["mlEmail"];
$mlPass = $_POST["mlPass"];
$mlCharID = $_POST["mlCharID"];

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

#####################################################################################################################################################

$dbCharQuery = "SELECT * FROM {$dbName}.users
                WHERE ml_id = :mlID;";

$dbCharStatement = $pdo->prepare($dbCharQuery);
$dbCharStatement->execute([':mlID' => $mlCharID]);

$dbCharResponse = $dbCharStatement->fetch(PDO::FETCH_ASSOC);

$mlFuncArray = $mlCharResponse->skills;

if($dbCharResponse === false)
{
    $userCode = generateCode($pdo, $dbName);

    addUser($pdo,$dbName,$mlCharID, $userCode,$mlCharResponse->name,$mlFuncArray);

    $dbCharStatement = $pdo->prepare($dbCharQuery);
    $dbCharStatement->execute([':mlID' => $mlCharID]);

    $dbCharResponse = $dbCharStatement->fetch(PDO::FETCH_ASSOC);
}
else
{    
    $userCode = $dbCharResponse["userCode"];

    updateUser($pdo,$dbName,$dbCharResponse["ml_id"],$mlCharResponse->name, $mlFuncArray);
}

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

$itemQuery = "  SELECT item_abbr, count
                FROM {$dbName}.user_items
                WHERE user_id = :userID";

$itemStatement = $pdo->prepare($itemQuery);
$itemStatement->execute([':userID' => $dbCharResponse["ml_id"]]);
$itemResponse = $itemStatement->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(array(  "id" => $dbCharResponse["ml_id"],
                                "name" => $mlCharResponse->name,
                                "userCode" => $userCode,
                                "functions" => $functionResponse,
                                "roles" => $roleResponse,
                                "items" => $itemResponse ));