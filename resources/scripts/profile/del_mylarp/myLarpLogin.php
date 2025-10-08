<?php

$mlEmail = $_POST["mlEmail"];
$mlPass = $_POST["mlPass"];

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

$loginResponse = json_decode(curl_exec($curlHandle),true);

if($loginResponse["result"] !== "pass")
{
    curl_close($curlHandle);

    echo json_encode($loginResponse);
}
else
{
    curl_reset($curlHandle);

    $curlCharOptions = array(
        CURLOPT_URL => "https://cpularp.mylarp.dev/characters",
        CURLOPT_RETURNTRANSFER => true
    );

    curl_setopt_array($curlHandle,$curlCharOptions);
    curl_setopt($curlHandle,CURLOPT_SSL_OPTIONS,CURLSSLOPT_NATIVE_CA);

    $charListResponse = curl_exec($curlHandle);

    curl_close($curlHandle);

    $doc = new DOMDocument();
    @$doc->loadHTML($charListResponse);

    $tiles = $doc->getElementsByTagName("character-tile");

    $characters = array();

    for($i = 0; $i < $tiles->count(); $i++)
    {
        $tile = $tiles->item($i);

        $charName = $tile->nextSibling->nodeValue;

        $charIDNode = $tile->attributes->getNamedItem("data-id");

        if($charIDNode !== null)
        {
            $charID = $charIDNode->nodeValue;

            array_push($characters,array(
                "charID" => $charID,
                "charName" => $charName
            ));
        }
    }

    $loginResponse["charList"] = $characters;

    echo json_encode($loginResponse);
}