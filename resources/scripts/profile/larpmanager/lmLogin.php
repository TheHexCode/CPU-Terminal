<?php

$lmEmail = $_POST["lmEmail"];
$lmPass = $_POST["lmPass"];

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

##################################################################################

curl_setopt($curlHandle,CURLOPT_URL,"http://larpmanager.cpularp.com/test/1/character/list/");

curl_setopt($curlHandle,CURLOPT_HTTPGET,1);

$charListDOM = new DOMDocument();
@$charListDOM->loadHtml(curl_exec($curlHandle), LIBXML_NOWARNING);

$charList = $charListDOM->getElementById("characters")
                        ->getElementsByTagName("tbody")
                        ->item(0)
                        ->getElementsByTagName("tr");

$charReturn = array();

foreach($charList as $char)
{
    $charData = $char->getElementsByTagName("td");
    array_push($charReturn, array(
        "charID" => $charData[0]->nodeValue,
        "charName" => $charData[2]->nodeValue
    ));
}

echo json_encode($charReturn);