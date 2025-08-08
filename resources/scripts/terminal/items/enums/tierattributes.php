<?php
declare(strict_types=1);

enum TierAttributes {

    case Copycat;
    case CorpProtocols;
    case PocketHacker;
    case DriveMe;
    case BudgetCyberdeck;
    case BudgetRAD;
    case CipherSyncBeacon;
    case ConnTrustRAD;
    case DebutantalusReporterBadge;
    case DeputyHat;
    case DigiPet;
    case FKD_DC17;
    case MMConsole;
    case Shimmerstick;
    case Vigil;
    case CRDSpiderCyberdeck;
    case InfiltratorModScript;
    case JohnnySpecialTouch;
    case PowerGlove;
    case Vigil;
    case CMMWidow;
    case CMMCocoon;

    public function getName(): string {

        $name = match($this){

            TierAttributes::Copycat => "Copycat",
            TierAttributes::PocketHacker => "Pocket Hacker",
            TierAttributes::CorpProtocols => "Corp Protocols",
            TierAttributes::DriveMe => "DriveMe",
            TierAttributes::BudgetCyberdeck => "Budget Cyberdeck",
            TierAttributes::BudgetRAD => "Budget Remote Access Drive",
            TierAttributes::MMConsole => "MM Console",
            TierAttributes::DebutantalusReporterBadge => "Debutantalus Reporter Badge",
            TierAttributes::Shimmerstick => "Shimmerstick",
            TierAttributes::CipherSyncBeacon => "CipherSync Beacon",
            TierAttributes::ConnTrustRAD => "ConnTrust Remote Access Drive",
            TierAttributes::DigiPet => "DigiPet",
            TierAttributes::FKD_DC17 => "FKD DC-17",
            TierAttributes::DeputyHat => "",
            TierAttributes::Vigil => "Vigil",
            TierAttributes::JohnnySpecialTouch => "Johnny's Special Touch",
            TierAttributes::PowerGlove => "Power Glove",
            TierAttributes::InfiltratorModScript => "Infiltrator ModScript",
            TierAttributes::CMMWidow => "CMM Widow", 
            TierAttributes::CMMCocoon => "CMM Cocoon",
            TierAttributes::CRDSpiderCyberdeck => "CRD Spider Cyberdeck",

        };

        return $name;

    }

    public function getFlavorText(): string {

        $text = match($this){

            TierAttributes::Copycat => "It turns out that when fighting the man, sometimes speed is important.",
            TierAttributes::PocketHacker => "Hate it when people tell you no? Take passwords as a challenge? Be equipped to handle all of life's nuisances.",
            TierAttributes::CorpProtocols => "Using a corporation's bullshit rules against them is surprisingly effective.",
            TierAttributes::DriveMe => "This software series specializes in remote control of drones and vehicles, but turned out pretty handy in controlling almost any device remotely.",
            TierAttributes::BudgetCyberdeck => "You're clearly someone whose skills will make up for your equipment.",
            TierAttributes::BudgetRAD => "There's a reason you're not supposed to plug unknown devices into your AR system.",
            TierAttributes::MMConsole => "CMM reminds you that any illegal use of this cyberdeck will result in arrest and appropriate, including fines, jail, and public humiliation.",
            TierAttributes::DebutantalusReporterBadge => "Having a journalist badge and an attitude of, \"I'm supposed to be here,\" can open a lot of doors and get you out of a lot of trouble.",
            TierAttributes::Shimmerstick => "A favorite of the most fashionable of Contractors, Shimmerstick is both a hot trend and a clever utility. This lipstick contains dormant nanites, which can be activated to form a temporary cyberdeck. Comes in 37 sparkling colors.",
            TierAttributes::CipherSyncBeacon => "Moggers created this helpful little tool to create fun games and wallpapers. You wouldn't use it for some other reason, would you?",
            TierAttributes::ConnTrustRAD => "If you can't do the job yourself, there's no shame in calling in a friend you can trust - ConnTrust.",
            TierAttributes::DigiPet => "As the market demand for digital pets grew, so did their intelligence. Eventually, clever Contractors figured out how to get them to repeat tasks they had taught them.",
            TierAttributes::FKD_DC17 => "Why risk a dragged out lawsuit, when you can have one of our trusty worker drones handle that dangerous task for you?",
            TierAttributes::DeputyHat => "Ready to posse up and roll out, keyboard cowboy! This hat will take you for a ride and make you a proper keyboard kiddy to help out the sheriff on his ride.",
            TierAttributes::Vigil => "Originally designed by LAVI doctors to help their patients recover from ocular implant surgery, it took on new life when acquired by ReMed researchers. They have since altered the drug, and instead of simply helping a patient to re-learn how to focus with their new eyes, it helps patients focus even better than they could before. With some side effects, including fatigue and temporary memory loss.",
            TierAttributes::JohnnySpecialTouch => "This makes weird noises, has strange lights, and is generally just odd. It may have other unexpected functions.",
            TierAttributes::PowerGlove => "This is one of the first widely-available cybernetic body part replacements, rumored to be developed by the feuding SinRus monarchies. While looked down upon as crude and ugly by most corporate drones, many Contractors have found it invaluable.",
            TierAttributes::InfiltratorModScript => "Stolen from a decommissioned research facility, this is definitely safe code.",
            TierAttributes::CMMWidow => "This tiny firearm is largely meant for support and defensive measures, helping the user get the job done and get away.", 
            TierAttributes::CMMCocoon => "Light and durable with the best tech available, this shield was specially-designed for elite CMM operatives.",
            TierAttributes::CRDSpiderCyberdeck => "Immoral corporation? Check. Ominous name? Check. Suspicious user? Check. Up to no good? Definitely.",

        };

        return $text;
        
    }

    public function getOwningGroup(): string {

        $group = match($this){

            TierAttributes::Copycat,
            TierAttributes::ConnTrustRAD,
            TierAttributes::DigiPet,
            TierAttributes::PocketHacker => "Golden Triangle",
            TierAttributes::CorpProtocols => "The Union, Cascadia Plexes",
            TierAttributes::FKD_DC17,
            TierAttributes::DriveMe => "Fugi Krupp Dynamics",
            TierAttributes::BudgetCyberdeck,
            TierAttributes::BudgetRAD,
            TierAttributes::PowerGlove,
            TierAttributes::CMMWidow, 
            TierAttributes::CMMCocoon,
            TierAttributes::CRDSpiderCyberdeck,
            TierAttributes::MMConsole => "Cybernet Matrix Media",
            TierAttributes::DebutantalusReporterBadge,
            TierAttributes::Shimmerstick => "Debutantalus",
            TierAttributes::CipherSyncBeacon => "Moggers",
            TierAttributes::DeputyHat => "The Union, TRI-C.I.",
            TierAttributes::Vigil => "LAVI",
            TierAttributes::JohnnySpecialTouch => "The Union",
            TierAttributes::InfiltratorModScript => "--",

        };

        return $group;
        
    }

    public function getCategory(): string {

        $category = match($this){

            TierAttributes::Copycat,
            TierAttributes::PocketHacker,
            TierAttributes::CorpProtocols,
            TierAttributes::DriveMe => "customization",
            TierAttributes::BudgetCyberdeck,
            TierAttributes::BudgetRAD,
            TierAttributes::MMConsole,
            TierAttributes::DebutantalusReporterBadge,
            TierAttributes::Shimmerstick,
            TierAttributes::CipherSyncBeacon,
            TierAttributes::ConnTrustRAD,
            TierAttributes::DigiPet,
            TierAttributes::FKD_DC17,
            TierAttributes::DeputyHat,
            TierAttributes::Vigil,
            TierAttributes::JohnnySpecialTouch,
            TierAttributes::PowerGlove,
            TierAttributes::InfiltratorModScript,
            TierAttributes::CRDSpiderCyberdeck => "utility",
            TierAttributes::CMMWidow => "weapon", 
            TierAttributes::CMMCocoon => "shield",

        };

        return $category;
        
    }

    public function getType(){

        $type = match($this){
            
            TierAttributes::BudgetCyberdeck,
            TierAttributes::FKD_DC17,
            TierAttributes::JohnnySpecialTouch,
            TierAttributes::MMConsole,
            TierAttributes::CRDSpiderCyberdeck => "Cyberdeck",
            TierAttributes::DebutantalusReporterBadge,
            TierAttributes::DigiPet,
            TierAttributes::DeputyHat,
            TierAttributes::ConnTrustRAD,
            TierAttributes::BudgetRAD => "Utility",
            TierAttributes::Copycat,
            TierAttributes::DriveMe => "Cyberdeck Software Customization",
            TierAttributes::PocketHacker => "Armor/Shield/Weapon Body Customization",
            TierAttributes::CorpProtocols => "Cyberdeck Customization",
            TierAttributes::CipherSyncBeacon => "Hacking Watch",
            TierAttributes::Shimmerstick => "Consumable",
            TierAttributes::Vigil => "Consumable (Drug)",
            TierAttributes::PowerGlove => "Arm Implant",
            TierAttributes::InfiltratorModScript => "ModScript",
            TierAttributes::CMMWidow => "One-Handed Ranged",
            TierAttributes::CMMCocoon => "Small Shield",

        };

        return $type;
        
    }

}