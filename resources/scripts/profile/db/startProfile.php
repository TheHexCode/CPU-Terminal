<?php
require('dbConnect.php');

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
                "heading" => "IMPLANT (ARM)",
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
            $tagMultiple = count(array_filter($item["tags"], function($tag)
            {
                return $tag["tag"] === "multiple";
            })) > 0;

            if($tagMultiple)
            {
                // instanced multiple
                //  e.g. corp_protocols, digisec_secrets

                if(array_key_exists("instance",$item))
                {
                    $instanceSelects = array();

                    foreach($item["instance"] as $index => $instance)
                    {
                        $exPath = explode(":",$instance["options"]["path"]);

                        switch($exPath[0])
                        {
                            case("db"):
                            {
                                $tableName = $exPath[1];

                                $instanceQuery = "  SELECT  {$instance['options']['value']} as value,
                                                            {$instance['options']['label']} as label
                                                    FROM {$dbName}.{$tableName}";
                                $instanceStatement = $pdo->prepare($instanceQuery);
                                $instanceStatement->execute();
                                $instanceOptions = $instanceStatement->fetchAll(PDO::FETCH_ASSOC);

                                $label_column = array_column($instanceOptions,"label");
                                array_multisort($label_column, SORT_ASC, SORT_STRING, $instanceOptions);

                                array_push($instanceSelects,array(
                                    "index" => $index,
                                    "name" => $instance["name"],
                                    "displayName" => $instance["displayName"],
                                    "options" => $instanceOptions
                                ));
                                break;
                            }
                        }
                    }
                    /*
                        <div class="itemSelect">
                            <div class="itemSelectName">CORP PROTOCOLS [T0]:</div>
                            <div class="itemSelectGrid">
                                <div class="itemSelectHeaderRow">
                                    <span data-col="2" style="grid-column:2;">CORP</span>
                                </div>
                                <div class="itemSelectRow" data-row="2" style="grid-row:2;">
                                    <!--<span class="itemSelectRowButton" onpointerup="delItemSelectRow(this)" data-row="2">&#xf1398;</span>-->
                                    <select name="corp protocols_t0_1" data-col="2" style="grid-column:2;">
                                        <option value="1">CORP 1</option>
                                    </select>
                                </div>
                                <div class="itemSelectRow" data-row="3" style="grid-column:3;">
                                    <span class="itemSelectRowButton" onpointerUp="addItemSelectRow(this)" data-row="3">&#x271A;</span>
                                </div>
                            </div>
                        </div>
                    */

                    $headers = "<div class='itemSelectHeaderRow'>";
                    $selectString = "";

                    foreach($instanceSelects as $selectIndex => $select)
                    {
                        $headers .= "<span class='itemSelectHeader' data-col='" . ($select["index"] + 3) . "' style='grid-column:" . ($select["index"] + 3) . ";'>" . $select["displayName"] . "</span>";

                        $optionString = "<option value='null' selected>--</option>";

                        foreach($select["options"] as $option)
                        {
                            $optionString .= "<option value='" . $option["value"] . "'>" . $option["label"] . "</option>";
                        }

                        $selectString .=    "<select class='itemSelectInput' name='!itemName!_!ROW!_" . $selectIndex . "' data-item='" . $item["name"] . "' data-tier='!TIER!' data-key='" . $select["name"] . "' data-col='" . ($selectIndex + 3) . "' style='grid-column:" . ($selectIndex + 3) . ";'>" .
                                                $optionString .
                                            "</select>";
                    }

                    $headers .= "</div>"; // itemSelectHeaderRow

                    $itemString .= "<div class='itemSelect'>";

                    foreach($item["tiers"] as $tier)
                    {
                        $itemName = strtolower($item["name"]) . "_t" . $tier["tier"];

                        $itemString .=  "<div class='itemSelectName'>" . $item["name"] . " [" . ($tier["tierName"] ?? ("T" . $tier["tier"])) . "]:</div>" .
                                        "<div class='itemSelectGrid' data-item='" . $itemName . "'>" .
                                            $headers .
                                            "<div class='itemSelectPrototype'>" .
                                                "<span class='itemSelectRowButton' onpointerup='delItemSelectRow(this)' data-row='!ROW!'>&#xf1398;</span>" . str_replace("!TIER!",$tier["tier"],str_replace("!itemName!",$itemName,$selectString)) .
                                            "</div>" .
                                            "<div class='itemSelectHRBox' data-row='2' style='grid-row:2;' >" .
                                                "<div class='itemSelectHRBG'></div>" .
                                                "<hr class='itemSelectHR'/>" .
                                                "<div class='itemSelectHRBlur'></div>" .
                                            "</div>" . //itemSelectHRBox
                                            "<div class='itemSelectRow' data-row='3' style='grid-row:3;'>" .
                                                "<span class='itemSelectRowButton' onpointerup='addItemSelectRow(this)' data-row='3'>&#x271A;</span>" .
                                            "</div>" . // itemSelectRow
                                        "</div>"; // itemSelectGrid
                    }

                    $itemString .= "</div>"; // itemSelect
                }
                else
                {
                    //non-instanced multiple
                    // e.g. shimmerstick; vigil
                }
            }
            else
            {
                // non-multiple items

                /*
                    <div class="itemContainer">
                        <div class="itemSelect check">
                            <input type="checkbox" id="copycat_t0" data-item="copycat" data-tier="0" form="itemForm">
                            <label for="copycat_t0">Copycat [T0]</label>
                        </div>
                    </div>
                */

                if(array_key_exists("instance",$item))
                {
                    // Add selection dropdown under main item
                    //  e.g. digipet
                }

                $itemString .=  "<div class='itemContainer'>";

                foreach($item["tiers"] as $tier)
                {
                    $itemName = strtolower($item["name"]) . "_t" . $tier["tier"];
                    $tagUnique = count(array_filter($item["tags"], function($tag)
                    {
                        return $tag["tag"] === "unique";
                    })) > 0;

                    $itemString .=  "<div class='itemInput " . ($tagUnique ? "radio" : "check") . "'>" .
                                        "<input type='" . ($tagUnique ? "radio" : "checkbox") . "' " .
                                            "id='" . $itemName . "' " .
                                            "data-item='" . strtolower($item["name"]) . "' " .
                                            "data-tier='" . $tier["tier"] . "' " .
                                            "form='itemForm' " .
                                            ($tagUnique ? "name='" . $item["category"] . "_" . $item["type"]. "' onclick='toggleRadio(this)' " : " ") .
                                        ">" .
                                        "<label for='" . $itemName . "'>" . $item["name"] . " [" . ($tier["tierName"] ?? ("T" . $tier["tier"])) . "]</label>";
                    $itemString .=  "</div>"; //itemInput
                }

                $itemString .= "</div>"; //itemContainer
            }
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