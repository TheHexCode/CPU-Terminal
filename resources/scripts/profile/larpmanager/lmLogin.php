<?php

$lmEmail = $_POST["lmEmail"];
$lmPass = $_POST["lmPass"];

#$curlHandle = curl_init("https://cpularp.mylarp.dev/scripts/User.login.asp");
$curlHandle = curl_init("http://larpmanager.cpularp.com/login");

$curlOptions = array(
    CURLOPT_COOKIEFILE => "",
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_RETURNTRANSFER => true
);

curl_setopt_array($curlHandle, $curlOptions);
#curl_setopt($curlHandle,CURLOPT_SSL_OPTIONS,CURLSSLOPT_NATIVE_CA);
curl_setopt($curlHandle,CURLOPT_USE_SSL,CURLUSESSL_NONE);

$loginDOM = new DOMDocument();
$loginDOM->loadHtml(curl_exec($curlHandle), LIBXML_NOWARNING);

$csrfToken = array_filter(iterator_to_array($loginDOM->getElementsByTagName("input")),function ($element)
    {
        return $element->getAttribute("name") === "csrfmiddlewaretoken";
    })[0]->getAttribute("value");

curl_close($curlHandle);
curl_reset($curlHandle);

$curlLoginOptions = array(
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query(array(
        "csrfmiddlewaretoken" => $csrfToken,
        "username" => $lmEmail,
        "password" => $lmPass
    )),
    CURLOPT_RETURNTRANSFER => true
);

curl_setopt_array($curlHandle,$curlLoginOptions);
curl_setopt($curlHandle,CURLOPT_USE_SSL,CURLUSESSL_NONE);