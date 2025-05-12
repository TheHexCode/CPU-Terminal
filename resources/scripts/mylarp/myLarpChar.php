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
                WHERE charName = :charName;";

$dbCharStatement = $pdo->prepare($dbCharQuery);
$dbCharStatement->execute([':charName' => $mlCharResponse->name]);

$dbCharResponse = $dbCharStatement->fetch(PDO::FETCH_ASSOC);

$mlFuncArray = array_column($mlCharResponse->skills,"name");

if($dbCharResponse === false)
{
    $userCode = generateCode($pdo, $dbName);

    addUser($pdo,$dbName,$userCode,$mlCharResponse->name,$mlFuncArray);

    $dbCharStatement = $pdo->prepare($dbCharQuery);
    $dbCharStatement->execute([':charName' => $mlCharResponse->name]);

    $dbCharResponse = $dbCharStatement->fetch(PDO::FETCH_ASSOC);
}
else
{    
    $userCode = $dbCharResponse["userCode"];

    updateUser($pdo,$dbName,$dbCharResponse["id"],$mlFuncArray);
}

$functionQuery = "  SELECT DISTINCT functions.name,
                                    SUM(ml_functions.rank) AS 'rank',
                                    functions.type,
                                    functions.hacking_cat
                    FROM {$dbName}.ml_functions
                    INNER JOIN {$dbName}.functions ON ml_functions.function_id=functions.id
                    WHERE ml_name IN ( ?" . str_repeat(', ?', count($mlFuncArray)-1) . " )
                        AND functions.hacking_cat IS NOT NULL
                    GROUP BY functions.name,
                                functions.type,
                                functions.hacking_cat;";

$functionStatement = $pdo->prepare($functionQuery);
$functionStatement->execute($mlFuncArray);
$functionResponse = $functionStatement->fetchAll(PDO::FETCH_ASSOC);

$roleQuery = "  SELECT DISTINCT roles.name
                FROM {$dbName}.ml_functions
                INNER JOIN {$dbName}.roles ON ml_functions.role_id=roles.id
                WHERE ml_name IN ( ?" . str_repeat(', ?', count($mlFuncArray)-1) . " )";

$roleStatement = $pdo->prepare($roleQuery);
$roleStatement->execute($mlFuncArray);
$roleResponse = $roleStatement->fetchAll(PDO::FETCH_COLUMN);

///////////////////////////////////////////////////////////////////////////////

$selfReportQuery = "SELECT ml_functions.id, roles.name AS role_name FROM {$dbName}.ml_functions
                    INNER JOIN {$dbName}.roles ON role_id=roles.id
                    INNER JOIN {$dbName}.user_selfreport ON ml_functions.id=user_selfreport.mlFunction_id
                    WHERE user_selfreport.user_id=:userID";

$selfReportStatement = $pdo->prepare($selfReportQuery);
$selfReportStatement->execute([':userID' => $dbCharResponse["id"]]);
$selfReportResponse = $selfReportStatement->fetchAll(PDO::FETCH_ASSOC);

///////////////////////////////////////////////////////////////////////////////

$itemQuery = "  SELECT item_id
                FROM {$dbName}.user_items
                WHERE user_id = :userID";

$itemStatement = $pdo->prepare($itemQuery);
$itemStatement->execute([':userID' => $dbCharResponse["id"]]);
$itemResponse = $itemStatement->fetchAll(PDO::FETCH_COLUMN);

echo json_encode(array(  "id" => $dbCharResponse["id"],
                                "name" => $mlCharResponse->name,
                                "userCode" => $userCode,
                                "functions" => $functionResponse,
                                "roles" => $roleResponse,
                                "selfReport" => $selfReportResponse,
                                "items" => $itemResponse ));