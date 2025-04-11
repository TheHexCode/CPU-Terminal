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

#####################################################################################################################################################

$profile_query = $pdo->query("SELECT DISTINCT functions.name,
                                              SUM(ml_functions.rank) AS 'rank'
                              FROM [dbo].[ml_functions]
                              JOIN functions ON function_id=functions.id
                              WHERE ml_name IN ('Alarm Sense -DT1-',
                                                'Craft (Choose one) -OT1-',
                                                'Escape Binds I -DT1-',
                                                'Hacking I -DT1-',
                                                'Hacking I -DT2-',
                                                'Knowledge (choose one)',
                                                'Knowledge (choose one) -T1St-',
                                                'Pick Locks I',
                                                'Repair I',
                                                'Repeat I',
                                                'Resist',
                                                'Scavenge I -DT1-',
                                                'Strength I',
                                                'Weapon Prof (all)&Armor Prof (all)',
                                                'Wipe Your Tracks -DT3-' )
                                    AND functions.is_hacking=1
                              GROUP BY functions.name;");
$profileResponse = $profile_query->fetchAll(PDO::FETCH_ASSOC);