<?php
declare(strict_types=1);

enum Attributes {

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

            Attributes::Copycat => "Copycat",
            Attributes::PocketHacker => "Pocket Hacker",
            Attributes::CorpProtocols => "Corp Protocols",
            Attributes::DriveMe => "DriveMe",
            Attributes::BudgetCyberdeck => "Budget Cyberdeck",
            Attributes::BudgetRAD => "Budget Remote Access Drive",
            Attributes::MMConsole => "MM Console",
            Attributes::DebutantalusReporterBadge => "Debutantalus Reporter Badge",
            Attributes::Shimmerstick => "Shimmerstick",
            Attributes::CipherSyncBeacon => "CipherSync Beacon",
            Attributes::ConnTrustRAD => "ConnTrust Remote Access Drive",
            Attributes::DigiPet => "DigiPet",
            Attributes::FKD_DC17 => "FKD DC-17",
            Attributes::DeputyHat => "",
            Attributes::Vigil => "Vigil",
            Attributes::JohnnySpecialTouch => "Johnny's Special Touch",
            Attributes::PowerGlove => "Power Glove",
            Attributes::InfiltratorModScript => "Infiltrator ModScript",
            Attributes::CMMWidow => "CMM Widow", 
            Attributes::CMMCocoon => "CMM Cocoon",
            Attributes::CRDSpiderCyberdeck => "CRD Spider Cyberdeck",

        };

        return $name;

    }

    public function getFlavorText(): string {

        $text = match($this){

            Attributes::Copycat => "It turns out that when fighting the man, sometimes speed is important.",
            Attributes::PocketHacker => "Hate it when people tell you no? Take passwords as a challenge? Be equipped to handle all of life's nuisances.",
            Attributes::CorpProtocols => "Using a corporation's bullshit rules against them is surprisingly effective.",
            Attributes::DriveMe => "This software series specializes in remote control of drones and vehicles, but turned out pretty handy in controlling almost any device remotely.",
            Attributes::BudgetCyberdeck => "You're clearly someone whose skills will make up for your equipment.",
            Attributes::BudgetRAD => "There's a reason you're not supposed to plug unknown devices into your AR system.",
            Attributes::MMConsole => "CMM reminds you that any illegal use of this cyberdeck will result in arrest and appropriate, including fines, jail, and public humiliation.",
            Attributes::DebutantalusReporterBadge => "Having a journalist badge and an attitude of, \"I'm supposed to be here,\" can open a lot of doors and get you out of a lot of trouble.",
            Attributes::Shimmerstick => "A favorite of the most fashionable of Contractors, Shimmerstick is both a hot trend and a clever utility. This lipstick contains dormant nanites, which can be activated to form a temporary cyberdeck. Comes in 37 sparkling colors.",
            Attributes::CipherSyncBeacon => "Moggers created this helpful little tool to create fun games and wallpapers. You wouldn't use it for some other reason, would you?",
            Attributes::ConnTrustRAD => "If you can't do the job yourself, there's no shame in calling in a friend you can trust - ConnTrust.",
            Attributes::DigiPet => "As the market demand for digital pets grew, so did their intelligence. Eventually, clever Contractors figured out how to get them to repeat tasks they had taught them.",
            Attributes::FKD_DC17 => "Why risk a dragged out lawsuit, when you can have one of our trusty worker drones handle that dangerous task for you?",
            Attributes::DeputyHat => "Ready to posse up and roll out, keyboard cowboy! This hat will take you for a ride and make you a proper keyboard kiddy to help out the sheriff on his ride.",
            Attributes::Vigil => "Originally designed by LAVI doctors to help their patients recover from ocular implant surgery, it took on new life when acquired by ReMed researchers. They have since altered the drug, and instead of simply helping a patient to re-learn how to focus with their new eyes, it helps patients focus even better than they could before. With some side effects, including fatigue and temporary memory loss.",
            Attributes::JohnnySpecialTouch => "This makes weird noises, has strange lights, and is generally just odd. It may have other unexpected functions.",
            Attributes::PowerGlove => "This is one of the first widely-available cybernetic body part replacements, rumored to be developed by the feuding SinRus monarchies. While looked down upon as crude and ugly by most corporate drones, many Contractors have found it invaluable.",
            Attributes::InfiltratorModScript => "Stolen from a decommissioned research facility, this is definitely safe code.",
            Attributes::CMMWidow => "This tiny firearm is largely meant for support and defensive measures, helping the user get the job done and get away.", 
            Attributes::CMMCocoon => "Light and durable with the best tech available, this shield was specially-designed for elite CMM operatives.",
            Attributes::CRDSpiderCyberdeck => "Immoral corporation? Check. Ominous name? Check. Suspicious user? Check. Up to no good? Definitely.",

        };

        return $text;
        
    }

    public function getOwningGroup(): string {

        $group = match($this){

            Attributes::Copycat,
            Attributes::ConnTrustRAD,
            Attributes::DigiPet,
            Attributes::PocketHacker => "Golden Triangle",
            Attributes::CorpProtocols => "The Union, Cascadia Plexes",
            Attributes::FKD_DC17,
            Attributes::DriveMe => "Fugi Krupp Dynamics",
            Attributes::BudgetCyberdeck,
            Attributes::BudgetRAD,
            Attributes::PowerGlove,
            Attributes::CMMWidow, 
            Attributes::CMMCocoon,
            Attributes::CRDSpiderCyberdeck,
            Attributes::MMConsole => "Cybernet Matrix Media",
            Attributes::DebutantalusReporterBadge,
            Attributes::Shimmerstick => "Debutantalus",
            Attributes::CipherSyncBeacon => "Moggers",
            Attributes::DeputyHat => "The Union, TRI-C.I.",
            Attributes::Vigil => "LAVI",
            Attributes::JohnnySpecialTouch => "The Union",
            Attributes::InfiltratorModScript => "--",

        };

        return $group;
        
    }

    public function getCategory(): string {

        $category = match($this){

            Attributes::Copycat,
            Attributes::PocketHacker,
            Attributes::CorpProtocols,
            Attributes::DriveMe => "customization",
            Attributes::BudgetCyberdeck,
            Attributes::BudgetRAD,
            Attributes::MMConsole,
            Attributes::DebutantalusReporterBadge,
            Attributes::Shimmerstick,
            Attributes::CipherSyncBeacon,
            Attributes::ConnTrustRAD,
            Attributes::DigiPet,
            Attributes::FKD_DC17,
            Attributes::DeputyHat,
            Attributes::Vigil,
            Attributes::JohnnySpecialTouch,
            Attributes::PowerGlove,
            Attributes::InfiltratorModScript,
            Attributes::CRDSpiderCyberdeck => "utility",
            Attributes::CMMWidow => "weapon", 
            Attributes::CMMCocoon => "shield",

        };

        return $category;
        
    }

    public function getType(){

        $type = match($this){
            
            Attributes::BudgetCyberdeck,
            Attributes::FKD_DC17,
            Attributes::JohnnySpecialTouch,
            Attributes::MMConsole,
            Attributes::CRDSpiderCyberdeck => "Cyberdeck",
            Attributes::DebutantalusReporterBadge,
            Attributes::DigiPet,
            Attributes::DeputyHat,
            Attributes::ConnTrustRAD,
            Attributes::BudgetRAD => "Utility",
            Attributes::Copycat,
            Attributes::DriveMe => "Cyberdeck Software Customization",
            Attributes::PocketHacker => "Armor/Shield/Weapon Body Customization",
            Attributes::CorpProtocols => "Cyberdeck Customization",
            Attributes::CipherSyncBeacon => "Hacking Watch",
            Attributes::Shimmerstick => "Consumable",
            Attributes::Vigil => "Consumable (Drug)",
            Attributes::PowerGlove => "Arm Implant",
            Attributes::InfiltratorModScript => "ModScript",
            Attributes::CMMWidow => "One-Handed Ranged",
            Attributes::CMMCocoon => "Small Shield",

        };

        return $type;
        
    }

}