<?php

$itemFilepath = "./resources/schemas/items.json";
$itemFile = fopen($itemFilepath,"r");
$itemSchema = json_decode(fread($itemFile,filesize($itemFilepath)),true);
fclose($itemFile);

######################################################################

$itemArray = array(
    "utility" => array(
        "heading" => "UTILITY",
        "types" => array(
            "cyberdeck" => array(
                "heading" => "CYBERDECK",
                "items" => array()
            ),
            "hacking_watch" => array(
                "heading" => "HACKING WATCH",
                "items" => array()
            ),
            "modscript" => array(
                "heading" => "MODSCRIPT",
                "items" => array()
            ),
            "implant_arm" => array(
                "heading" => "IMPLANT, ARM",
                "items" => array()
            ),
            "consumable" => array(
                "heading" => "CONSUMABLE",
                "items" => array()
            ),
            "consumable_drug" => array(
                "heading" => "CONSUMABLE (DRUG)",
                "items" => array()
            ),
            "utility" => array(
                "heading" => "MISC UTILITY",
                "items" => array()
            )
        )
    ),
    "customization" => array(
        "heading" => "CUSTOMIZATIONS",
        "types" => array(
            "cyberdeck" => array(
                "heading" => "CYBERDECK CUSTOMIZATIONS",
                "items" => array()
            ),
            "cyberdeck_software" => array(
                "heading" => "CYBERDECK SOFTWARE",
                "items" => array()
            ),
            "asw_body" => array(
                "heading" => "ARMOR/SHIELD/WEAPON BODY",
                "items" => array()
            )
        )
    ),
    "arms" => array(
        "heading" => "WEAPONS/ARMOR",
        "types" => array(
            "ranged_1h" => array(
                "heading" => "RANGED, 1H",
                "items" => array()
            ),
            "shield_small" => array(
                "heading" => "SHIELD, SMALL",
                "items" => array()
            )
        )
    ),
    "resource" => array(
        "heading" => "RESOURCES",
        "types" => array(
            "secret" => array(
                "heading" => "SECRETS",
                "items" => array()
            )
        )
    )
);

foreach($itemSchema as $item)
{
    array_push($itemArray[$item["category"]]["types"][$item["type"]]["items"],$item);
}

$itemString = "";

foreach($itemArray as $itemCat)
{
    $itemString .=  "<section class='itemSection'>" .
                        "<h2>" . $itemCat["heading"] . "</h2>";

    foreach($itemCat["types"] as $itemType)
    {
        $itemString .=  "<div class='itemType'>" .
                            "<h3>" . $itemType["heading"] . "</h3>";

        foreach($itemType["items"] as $item)
        {
            $itemString .=  "<div class='itemContainer'>";

            foreach($item["tiers"] as $tier)
            {
                $itemName = strtolower($item["name"]) . "_t" . $tier["tier"];
                $tagUnique = count(array_filter($item["tags"], function($tag)
                {
                    return $tag["tag"] === "unique";
                })) > 0;

                $itemString .=  "<div class='itemSelect " . ($tagUnique ? "radio" : "check") . "'>" .
                                    "<input type='" . ($tagUnique ? "radio" : "checkbox") . "' id='" . $itemName . "' form='itemForm'" . ($tagUnique ? " name='" . $item["category"] . "_" . $item["type"]. "' onclick='toggleRadio(this)'" : "") . " >" .
                                    "<label for='" . $itemName . "'>" . $item["name"] . " [T" . $tier["tier"] . "]</label>";
                $itemString .=  "</div>"; //itemSelect
            }

            $itemString .= "</div>"; //itemContainer
        }

        /*$itemString .=  "<div class='itemSelect " . ($item["radio"] !== null ? "radio" : "check") . "'>" .
                            "<input type='" . ($item["radio"] !== null ? "radio" : "checkbox") . "' id='item_" . $item["abbr"] . "' " . ($item["radio"] !== null ? "name='" . $item["radio"] . "' " : "") . "data-abbr='" . $item["abbr"] . "' form='itemForm' onclick='toggleRadio(this)'>" .
                            "<label for='item_" . $item["abbr"] . "'>" . $item["name"] . "</label>";

        if($item["max_charges"] ?? 0 > 1)
        {
            $itemString .=  "<div class='itemCount' data-abbr='" . $item["abbr"] . "' data-charges='" . $item["max_charges"] . "'>" .
                                "<div class='itemCountHeader'>" .
                                    "<span>USES LEFT: <span class='countSum'>" . $item["max_charges"] . "</span>/" . $item["max_charges"] . "</span>" .
                                "</div>" .
                                "<div class='itemCountRow'>" .
                                    "<button onclick='changeItemCharges(\"" . $item["abbr"] . "\", -1)'><b>&lt;</b>&nbsp;&#x2501;</button>" .
                                    "<span class='itemImgBox'>";

            for($i = 1; $i <= $item["max_charges"]; $i++)
            {
                $itemString .=          "<img src='resources/images/actions/itemopen.png' />";
            }

            $itemString .=          "</span>" .
                                    "<button onclick='changeItemCharges(\"" . $item["abbr"] . "\", 1)'>&#x271A;&nbsp;<b>&gt;</b></button>" .
                                "</div>" .
                            "</div>";
        }
        */

        $itemString .= "</div>"; //itemType
    }

    $itemString .= "</section>"; //itemSection
}

function getItemsTab()
{
    global $itemString;

    return $itemString;
}