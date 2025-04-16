<?php
require('../db/dbConnect.php');

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

$charResponse = curl_exec($curlHandle);

curl_close($curlHandle);

$character_name = json_decode($charResponse)->name;

$skill_names = "'" . implode( "', '", array_column(json_decode($charResponse)->skills,"name")) . "'";

#####################################################################################################################################################

$char_query = $pdo->query(" SELECT * FROM CPU_Terminal.dbo.users
                            WHERE charName = $character_name");

$characterResponse = $char_query->fetch(PDO::FETCH_ASSOC);

if($characterResponse === false)
{
    //get all userCodes
    //generate new userCode
    //enter new user (id, userCode, charName)
    //insert all functions into user_functions under new id
}
else
{
    //get user id + userCode
    //get all user_functions under that id
    //compare user_functions to what was pulled by the myLarp login
    //if (different):
        // delete all user_functions under that id
        // insert all functions into user_functions under same id
}

#'Alarm Sense -DT1-', 'Craft (Choose one) -OT1-', 'Escape Binds I -DT1-', 'Hacking I -DT1-', 'Hacking I -DT2-', 'Knowledge (choose one)', 'Knowledge (choose one) -T1St-', 'Pick Locks I', 'Repair I', 'Repeat I', 'Resist', 'Scavenge I -DT1-', 'Strength I', 'Weapon Prof (all)&Armor Prof (all)', 'Wipe Your Tracks -DT3-'

$function_query = $pdo->query(" SELECT DISTINCT functions.name,
                                                SUM(ml_functions.rank) AS 'rank',
                                                functions.type,
                                                functions.hacking_cat
                                FROM CPU_Terminal.dbo.ml_functions
                                INNER JOIN CPU_Terminal.dbo.functions ON ml_functions.function_id=functions.id
                                WHERE ml_name IN ( $skill_names )
                                  AND functions.hacking_cat IS NOT NULL
                                GROUP BY functions.name,
                                         functions.type,
                                         functions.hacking_cat;");

$functionResponse = $function_query->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(array(  "name" => $character_name,
                                "functions" => $functionResponse ));