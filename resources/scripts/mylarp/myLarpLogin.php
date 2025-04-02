<?php

$mlEmail = $_POST["mlEmail"];
$mlPass = $_POST["mlPass"];

$curlHandle = curl_init("https://cpularp.mylarp.dev/scripts/User.login.asp");

$curlOptions = array(
    CURLOPT_COOKIESESSION => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => array(
        "email" => $mlEmail,
        "pword" => $mlPass
    ),
    CURLOPT_RETURNTRANSFER => true
);

curl_setopt_array($curlHandle, $curlOptions);
curl_setopt($curlHandle,CURLOPT_SSL_OPTIONS,CURLSSLOPT_NATIVE_CA);

$response = curl_exec($curlHandle);

var_dump(curl_version());
var_dump($response);
var_dump(curl_error($curlHandle));
var_dump(curl_getinfo($curlHandle, CURLINFO_HTTP_CODE));

curl_close($curlHandle);

return $response;