<?php

$lmEmail = $_POST["lmEmail"];
$lmPass = $_POST["lmPass"];

#$curlHandle = curl_init("https://cpularp.mylarp.dev/scripts/User.login.asp");
$curlHandle = curl_init("https://larpmanager.cpularp.com/login");

$curlOptions = array(
    CURLOPT_COOKIEFILE => "",
    CURLOPT_RETURNTRANSFER => true
);

curl_setopt_array($curlHandle, $curlOptions);
curl_setopt($curlHandle,CURLOPT_SSL_OPTIONS,CURLSSLOPT_NATIVE_CA);

$loginCapture = curl_exec($curlHandle);

echo var_dump($loginCapture);