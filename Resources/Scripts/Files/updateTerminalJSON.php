<?php

$suffixID = $_POST["suffixID"];
$path = $_POST["path"];
$newState = $_POST["newState"];
$newPrev = $_POST["newPrev"];

$terminalJSON = JSON_decode(file_get_contents("../../../data/" . $suffixID . "/terminal.json"));

#echo var_dump($terminalJSON);

$splitPath = explode(">",$path);

if($splitPath[0] === "state")
{
    $terminalJSON->state = $newState;
}
else
{
    $termData = $terminalJSON->data;

    $catIndex = array_search($splitPath[0], array_column($termData,"type"));

    $entry = $termData[$catIndex]->entries[$splitPath[1]];

    if(sizeOf($splitPath) > 2)
    {
        for($i = 2; $i < sizeOf($splitPath); $i++)
        {
            $entry = $entry->subEntries[$splitPath[$i]];
        }
    }
    
    $entry->state = $newState;
    $entry->previous = $newPrev;
}

file_put_contents("../../../data/" . $suffixID . "/terminal.json", JSON_encode($terminalJSON));