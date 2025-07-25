class Item
{
    // CATEGORIES
    static ARMS = "arms";
    static CUST = "customization";
    static UTILITY = "utility";

    // TYPES
    static RANGED_1H = "ranged_1h";
    static SHIELD_SMALL = "shield_small";
    static CUST_CYBERDECK_SOFTWARE = "customization_cyberdeck_software";
    static CUST_CYBERDECK = "customization_cyberdeck";
    static CUST_ASW_BODY = "customization_armorshieldweapon_body";

    // TAGS
    static UNIQUE = {
        CUST_ASW_BODY: "customization_armorshieldweapon_body",
        HACKING_WATCH: "hacking_watch",
        CYBERDECK: "cyberdeck"
    };
    static HACKING_SCRIPT = "hacking_script";
    static LIMITED = "limited";

    ////////////////////////////////////

    static Budget_Cyberdeck_T0 = new Item({
        name: "Budget Cyberdeck",
        tier: 0,
        category: Item.UTILITY,
        type: Item.CYBERDECK,
        flavor: "You're clearly someone whose skills will make up for your equipment.",
        tags: [
            Item.UNIQUE.CYBERDECK
        ],
        benefits: [
            new Benefit()
        ]
    });
    static Budget_Remote_Access_Drive_T0 = new Item("Budget Remote Access Drive",0);
    static Canopic_Jar_Magsweep_T0       = new Item("Budget Cyberdeck",0);
    static Budget_Cyberdeck_T0 = new Item("Budget Cyberdeck",0);
    static Budget_Cyberdeck_T0 = new Item("Budget Cyberdeck",0);
    static Budget_Cyberdeck_T0 = new Item("Budget Cyberdeck",0);
    static Budget_Cyberdeck_T0 = new Item("Budget Cyberdeck",0);
    static Budget_Cyberdeck_T0 = new Item("Budget Cyberdeck",0);
    static Budget_Cyberdeck_T0 = new Item("Budget Cyberdeck",0);
    static Budget_Cyberdeck_T0 = new Item("Budget Cyberdeck",0);
    static Budget_Cyberdeck_T0 = new Item("Budget Cyberdeck",0);
    static Budget_Cyberdeck_T0 = new Item("Budget Cyberdeck",0);
    static Budget_Cyberdeck_T0 = new Item("Budget Cyberdeck",0);



    constructor({name,tier}={})
    {
        console.log(name);
        console.log(tier);
    }
}