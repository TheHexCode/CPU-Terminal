<?php

require('../db/dbConnect.php');
require('../db/setUser.php');

$lmEmail = $_POST["lmEmail"];
$lmPass = $_POST["lmPass"];
$lmCharID = $_POST["lmCharID"];
$lmCharName = $_POST["lmCharName"];

$dbCharQuery = "SELECT * FROM {$dbName}.users
                WHERE lm_id = :lmID;";

$dbCharStatement = $pdo->prepare($dbCharQuery);
$dbCharStatement->execute([':lmID' => $lmCharID]);

$dbCharResponse = $dbCharStatement->fetch(PDO::FETCH_ASSOC);

if($dbCharResponse === false)
{
    /*
    $userCode = generateCode($pdo, $dbName);

    addUser($pdo,$dbName,$mlCharID, $userCode,$mlCharName);

    $dbCharStatement = $pdo->prepare($dbCharQuery);
    $dbCharStatement->execute([':mlID' => $mlCharID]);

    $dbCharResponse = $dbCharStatement->fetch(PDO::FETCH_ASSOC);
    */
}
else
{    
    $userCode = $dbCharResponse["userCode"];

    //updateUser($pdo,$dbName,$dbCharResponse["ml_id"],$mlCharName);
}

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
/*
curl_setopt($curlHandle,CURLOPT_URL,"http://larpmanager.cpularp.com/api/test/1/character/$lmCharID/");
curl_setopt($curlHandle,CURLOPT_HTTPGET,1);
$lmCharacter = json_decode(curl_exec($curlHandle));
*/
$lmCharacter = json_decode('{ "id": 30, "name": "TestPuck", "abilities": [ { "id": 4, "name": "Roles", "abilities": [ { "id": 7, "name": "Standard Role" } ] }, { "id": 5, "name": "Something Else", "abilities": [ { "id": 2, "name": "Test" }, { "id": 3, "name": "Test 2" } ] }, { "id": 10, "name": "Something New", "abilities": [ { "id": 5, "name": "Test 3" } ] } ] }', true);

// ROLES / FUNCTIONS
$lmRoleIDs =  array_column(array_filter($lmCharacter["abilities"], function ($ability) {
    return $ability["id"] === 4;
})[0]["abilities"],"id");

$lmFunctionIDs = array_column(array_merge(...array_column(array_filter($lmCharacter["abilities"], function ($ability) {
    return $ability["id"] !== 4;
}),"abilities")),"id");

$abilityQuery = "SELECT * FROM {$dbName}.cpu_abilities
                WHERE lm_id = :lmID;";

$abilityStatement = $pdo->prepare($abilityQuery);
$abilityStatement->execute([':lmID' => $lmCharID]);

$abilityResponse = $abilityStatement->fetch(PDO::FETCH_ASSOC);

// ITEMS
/*
curl_setopt($curlHandle,CURLOPT_URL,"http://larpmanager.cpularp.com/api/test/1/character/list/");
curl_setopt($curlHandle,CURLOPT_HTTPGET,1);
$functions = curl_exec($curlHandle);
*/


echo json_encode(array(  "id" => $dbCharResponse["lm_id"],
                                "name" => $lmCharName,
                                "userCode" => $userCode,
                                "roles" => $roleIDs,
                                "functions" => $functionIDs,
                                /*"items" => $itemResponse*/ ));