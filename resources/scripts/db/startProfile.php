<?php

require('dbConnect.php');

$itemArray = array(
    "deck" => array(
        "title" => "CYBERDECKS",
        "items" => array()
    ),
    "arms" => array(
        "title" => "WEAPONS/SHIELDS",
        "items" => array()
    ),
    "cust" => array(
        "title" => "CUSTOMIZATIONS",
        "items" => array()
    ),
    "util" => array(
        "title" => "UTILITY ITEMS",
        "items" => array()
    ),
    "impl" => array(
        "title" => "IMPLANTS",
        "items" => array()
    ),
    "cons" => array(
        "title" => "CONSUMABLES",
        "items" => array()
    )
);

$item_query = $pdo->query(" SELECT id,name,tier,type,radio
                                FROM cpu_term.items");

$itemResponse = $item_query->fetchAll(PDO::FETCH_ASSOC);

foreach($itemResponse as $item)
{
    $itemPush = array(
        "id" => $item["id"],
        "name" => $item["name"] . ($item["tier"] !== null ? " [T" . $item["tier"] . "]" : ""),
        "radio" => ($item["radio"] !== null ? "radio-" . $item["radio"] : null)
    );

    array_push($itemArray[$item["type"]]["items"],$itemPush);
}

$itemString = "";

foreach($itemArray as $itemCat)
{
    $itemString .=  "<section class='itemSection'>" .
                        "<h2>" . $itemCat["title"] . "</h2>";

    foreach($itemCat["items"] as $item)
    {
        $itemString .=  "<div class='" . ($item["radio"] !== null ? "radio" : "check") . "'>" .
                            "<input type='" . ($item["radio"] !== null ? "radio" : "checkbox") . "' id='item_" . $item["id"] . "' " . ($item["radio"] !== null ? "name='" . $item["radio"] . "' " : "") . "data-id='" . $item["id"] . "' form='itemForm' onclick='toggleRadio(this)'>" .
                            "<label for='item_" . $item["id"] . "'>" . $item["name"] . "</label>" .
                        "</div>";
    }

    $itemString .= "</section>";
}

echo $itemString;