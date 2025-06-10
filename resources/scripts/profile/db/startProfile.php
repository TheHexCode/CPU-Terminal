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

$itemQuery = "  SELECT DISTINCT items.abbr,name,tier,category,radio,
                    CASE
                        WHEN item_effects.per_type = 'item'
                        THEN item_effects.charges
                        ELSE NULL
                    END AS max_charges
                FROM {$dbName}.items
                LEFT JOIN {$dbName}.items_to_effects ON items_to_effects.item_abbr = items.abbr
		        LEFT JOIN {$dbName}.item_effects ON item_effects.abbr = items_to_effects.effect_abbr";

$itemStatement = $pdo->prepare($itemQuery);
$itemStatement->execute();

$itemResponse = $itemStatement->fetchAll(PDO::FETCH_ASSOC);

foreach($itemResponse as $item)
{
    $itemPush = array(
        "abbr" => $item["abbr"],
        "name" => $item["name"] . ($item["tier"] !== null ? " [T" . $item["tier"] . "]" : ""),
        "radio" => ($item["radio"] !== null ? "radio-" . $item["radio"] : null),
        "max_charges" => $item["max_charges"]
    );

    array_push($itemArray[$item["category"]]["items"],$itemPush);
}

$itemString = "";

foreach($itemArray as $itemCat)
{
    $itemString .=  "<section class='itemSection'>" .
                        "<h2>" . $itemCat["title"] . "</h2>";

    foreach($itemCat["items"] as $item)
    {
        $itemString .=  "<div class='itemSelect " . ($item["radio"] !== null ? "radio" : "check") . "'>" .
                            "<input type='" . ($item["radio"] !== null ? "radio" : "checkbox") . "' id='item_" . $item["abbr"] . "' " . ($item["radio"] !== null ? "name='" . $item["radio"] . "' " : "") . "data-abbr='" . $item["abbr"] . "' form='itemForm' onclick='toggleRadio(this)'>" .
                            "<label for='item_" . $item["abbr"] . "'>" . $item["name"] . "</label>";

        if($item["max_charges"] > 1)
        {
            $itemString .=  "<div class='itemCount' data-abbr='" . $item["abbr"] . "' data-charges='" . $item["max_charges"] . "'>" .
                                "<div class='itemCountHeader'>" .
                                    "<span>USES LEFT: <span class='countSum'>" . $item["max_charges"] . "</span>/" . $item["max_charges"] . "</span>" .
                                "</div>" .
                                "<div class='itemCountRow'>" .
                                    "<button onclick='changeItemCharges(\"" . $item["abbr"] . "\", -1)'><b>&lt;&nbsp;&minus;</b></button>" . 
                                    "<span class='itemImgBox'>";
            
            for($i = 1; $i <= $item["max_charges"]; $i++)
            {
                $itemString .=          "<img src='resources/images/actions/itemopen.png' />";
            }
                                    
            $itemString .=          "</span>" .
                                    "<button onclick='changeItemCharges(\"" . $item["abbr"] . "\", 1)'>&plus;&nbsp;<b>&gt;</b></button>" .
                                "</div>" .
                            "</div>";
        }

        $itemString .= "</div>";
    }

    $itemString .= "</section>";
}

function getItemsTab()
{
    global $itemString;

    return $itemString;
}