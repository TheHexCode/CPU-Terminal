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

$dbCharQuery = "SELECT * FROM CPU_Terminal.dbo.users
                WHERE charName = :charName";

$dbCharStatement = $pdo->prepare($dbCharQuery);
$dbCharStatement->execute([':charName' => $mlCharResponse->name]);

$dbCharResponse = $dbCharStatement->fetch(PDO::FETCH_ASSOC);

#'Alarm Sense -DT1-', 'Craft (Choose one) -OT1-', 'Escape Binds I -DT1-', 'Hacking I -DT1-', 'Hacking I -DT2-', 'Knowledge (choose one)', 'Knowledge (choose one) -T1St-', 'Pick Locks I', 'Repair I', 'Repeat I', 'Resist', 'Scavenge I -DT1-', 'Strength I', 'Weapon Prof (all)&Armor Prof (all)', 'Wipe Your Tracks -DT3-'
$mlFuncArray = array_column($mlCharResponse->skills,"name");

if($dbCharResponse === false)
{
    $userCode = generateCode($pdo);

    addUser($pdo,$userCode,$mlCharResponse->name,$mlFuncArray);
}
else
{    
    $userCode = $dbCharResponse["userCode"];

    updateUser($pdo,$dbCharResponse["id"],$mlFuncArray);
}

$functionQuery = "  SELECT DISTINCT functions.name,
                                    SUM(ml_functions.rank) AS 'rank',
                                    functions.type,
                                    functions.hacking_cat
                    FROM CPU_Terminal.dbo.ml_functions
                    INNER JOIN CPU_Terminal.dbo.functions ON ml_functions.function_id=functions.id
                    WHERE ml_name IN ( ?" . str_repeat(', ?', count($mlFuncArray)-1) . " )
                        AND functions.hacking_cat IS NOT NULL
                    GROUP BY functions.name,
                                functions.type,
                                functions.hacking_cat;";

$functionStatement = $pdo->prepare($functionQuery);
$functionStatement->execute($mlFuncArray);
$functionResponse = $functionStatement->fetchAll(PDO::FETCH_ASSOC);

$roleQuery = "  SELECT DISTINCT roles.name
                FROM CPU_Terminal.dbo.ml_functions
                INNER JOIN CPU_Terminal.dbo.roles ON ml_functions.role_id=roles.id
                WHERE ml_name IN ( ?" . str_repeat(', ?', count($mlFuncArray)-1) . " )";

$roleStatement = $pdo->prepare($roleQuery);
$roleStatement->execute($mlFuncArray);
$roleResponse = $roleStatement->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(array(  "name" => $mlCharResponse->name,
                                "userCode" => $userCode,
                                "functions" => $functionResponse,
                                "roles" => $roleResponse ));