<?php
declare(strict_types=1);
namespace Items\Enums;

enum ItemAttributes {

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
    case CRDSpiderCyberdeck;
    case InfiltratorModScript;
    case JohnnySpecialTouch;
    case PowerGlove;
    case Vigil;
    case CMMWidow;
    case CMMCocoon;

    public function getName(): string {

        $name = match($this){

            ItemAttributes::Copycat => "Copycat",
            ItemAttributes::PocketHacker => "Pocket Hacker",
            ItemAttributes::CorpProtocols => "Corp Protocols",
            ItemAttributes::DriveMe => "DriveMe",
            ItemAttributes::BudgetCyberdeck => "Budget Cyberdeck",
            ItemAttributes::BudgetRAD => "Budget Remote Access Drive",
            ItemAttributes::MMConsole => "MM Console",
            ItemAttributes::DebutantalusReporterBadge => "Debutantalus Reporter Badge",
            ItemAttributes::Shimmerstick => "Shimmerstick",
            ItemAttributes::CipherSyncBeacon => "CipherSync Beacon",
            ItemAttributes::ConnTrustRAD => "ConnTrust Remote Access Drive",
            ItemAttributes::DigiPet => "DigiPet",
            ItemAttributes::FKD_DC17 => "FKD DC-17",
            ItemAttributes::DeputyHat => "Deputy's Hat",
            ItemAttributes::Vigil => "Vigil",
            ItemAttributes::JohnnySpecialTouch => "Johnny's Special Touch",
            ItemAttributes::PowerGlove => "Power Glove",
            ItemAttributes::InfiltratorModScript => "Infiltrator ModScript",
            ItemAttributes::CMMWidow => "CMM Widow", 
            ItemAttributes::CMMCocoon => "CMM Cocoon",
            ItemAttributes::CRDSpiderCyberdeck => "CRD Spider Cyberdeck",
            default => '',
            
        };

        return $name;

    }

    public function getFlavorText(): string {

        $text = match($this){

            ItemAttributes::Copycat => "It turns out that when fighting the man, sometimes speed is important.",
            ItemAttributes::PocketHacker => "Hate it when people tell you no? Take passwords as a challenge? Be equipped to handle all of life's nuisances.",
            ItemAttributes::CorpProtocols => "Using a corporation's bullshit rules against them is surprisingly effective.",
            ItemAttributes::DriveMe => "This software series specializes in remote control of drones and vehicles, but turned out pretty handy in controlling almost any device remotely.",
            ItemAttributes::BudgetCyberdeck => "You're clearly someone whose skills will make up for your equipment.",
            ItemAttributes::BudgetRAD => "There's a reason you're not supposed to plug unknown devices into your AR system.",
            ItemAttributes::MMConsole => "CMM reminds you that any illegal use of this cyberdeck will result in arrest and appropriate, including fines, jail, and public humiliation.",
            ItemAttributes::DebutantalusReporterBadge => "Having a journalist badge and an attitude of, \"I'm supposed to be here,\" can open a lot of doors and get you out of a lot of trouble.",
            ItemAttributes::Shimmerstick => "A favorite of the most fashionable of Contractors, Shimmerstick is both a hot trend and a clever utility. This lipstick contains dormant nanites, which can be activated to form a temporary cyberdeck. Comes in 37 sparkling colors.",
            ItemAttributes::CipherSyncBeacon => "Moggers created this helpful little tool to create fun games and wallpapers. You wouldn't use it for some other reason, would you?",
            ItemAttributes::ConnTrustRAD => "If you can't do the job yourself, there's no shame in calling in a friend you can trust - ConnTrust.",
            ItemAttributes::DigiPet => "As the market demand for digital pets grew, so did their intelligence. Eventually, clever Contractors figured out how to get them to repeat tasks they had taught them.",
            ItemAttributes::FKD_DC17 => "Why risk a dragged out lawsuit, when you can have one of our trusty worker drones handle that dangerous task for you?",
            ItemAttributes::DeputyHat => "Ready to posse up and roll out, keyboard cowboy! This hat will take you for a ride and make you a proper keyboard kiddy to help out the sheriff on his ride.",
            ItemAttributes::Vigil => "Originally designed by LAVI doctors to help their patients recover from ocular implant surgery, it took on new life when acquired by ReMed researchers. They have since altered the drug, and instead of simply helping a patient to re-learn how to focus with their new eyes, it helps patients focus even better than they could before. With some side effects, including fatigue and temporary memory loss.",
            ItemAttributes::JohnnySpecialTouch => "This makes weird noises, has strange lights, and is generally just odd. It may have other unexpected functions.",
            ItemAttributes::PowerGlove => "This is one of the first widely-available cybernetic body part replacements, rumored to be developed by the feuding SinRus monarchies. While looked down upon as crude and ugly by most corporate drones, many Contractors have found it invaluable.",
            ItemAttributes::InfiltratorModScript => "Stolen from a decommissioned research facility, this is definitely safe code.",
            ItemAttributes::CMMWidow => "This tiny firearm is largely meant for support and defensive measures, helping the user get the job done and get away.", 
            ItemAttributes::CMMCocoon => "Light and durable with the best tech available, this shield was specially-designed for elite CMM operatives.",
            ItemAttributes::CRDSpiderCyberdeck => "Immoral corporation? Check. Ominous name? Check. Suspicious user? Check. Up to no good? Definitely.",
            default => '',

        };

        return $text;
        
    }

    public function getOwningGroup(): string {

        $group = match($this){

            ItemAttributes::Copycat,
            ItemAttributes::ConnTrustRAD,
            ItemAttributes::DigiPet,
            ItemAttributes::PocketHacker => "Golden Triangle",
            ItemAttributes::FKD_DC17,
            ItemAttributes::DriveMe => "Fugi Krupp Dynamics",
            ItemAttributes::BudgetCyberdeck,
            ItemAttributes::BudgetRAD,
            ItemAttributes::PowerGlove,
            ItemAttributes::CMMWidow, 
            ItemAttributes::CMMCocoon,
            ItemAttributes::CRDSpiderCyberdeck,
            ItemAttributes::MMConsole => "Cybernet Matrix Media",
            ItemAttributes::DebutantalusReporterBadge,
            ItemAttributes::Shimmerstick => "Debutantalus",
            ItemAttributes::CorpProtocols => "The Union, Cascadia Plexes",
            ItemAttributes::CipherSyncBeacon => "Moggers",
            ItemAttributes::DeputyHat => "The Union, TRI-C.I.",
            ItemAttributes::Vigil => "LAVI",
            ItemAttributes::JohnnySpecialTouch => "The Union",
            ItemAttributes::InfiltratorModScript => "--",
            default => '',

        };

        return $group;
        
    }

    public function getCategory(): string {

        $category = match($this){

            ItemAttributes::Copycat,
            ItemAttributes::PocketHacker,
            ItemAttributes::CorpProtocols,
            ItemAttributes::DriveMe => "customization",
            ItemAttributes::BudgetCyberdeck,
            ItemAttributes::BudgetRAD,
            ItemAttributes::MMConsole,
            ItemAttributes::DebutantalusReporterBadge,
            ItemAttributes::Shimmerstick,
            ItemAttributes::CipherSyncBeacon,
            ItemAttributes::ConnTrustRAD,
            ItemAttributes::DigiPet,
            ItemAttributes::FKD_DC17,
            ItemAttributes::DeputyHat,
            ItemAttributes::Vigil,
            ItemAttributes::JohnnySpecialTouch,
            ItemAttributes::PowerGlove,
            ItemAttributes::InfiltratorModScript,
            ItemAttributes::CRDSpiderCyberdeck => "utility",
            ItemAttributes::CMMWidow => "weapon", 
            ItemAttributes::CMMCocoon => "shield",
            default => '',
            
        };

        return $category;
        
    }

    public function getType(){

        $type = match($this){
            
            ItemAttributes::BudgetCyberdeck,
            ItemAttributes::FKD_DC17,
            ItemAttributes::JohnnySpecialTouch,
            ItemAttributes::MMConsole,
            ItemAttributes::CRDSpiderCyberdeck => "Cyberdeck",
            ItemAttributes::DebutantalusReporterBadge,
            ItemAttributes::DigiPet,
            ItemAttributes::DeputyHat,
            ItemAttributes::ConnTrustRAD,
            ItemAttributes::BudgetRAD => "Utility",
            ItemAttributes::Copycat,
            ItemAttributes::DriveMe => "Cyberdeck Software Customization",
            ItemAttributes::PocketHacker => "Armor/Shield/Weapon Body Customization",
            ItemAttributes::CorpProtocols => "Cyberdeck Customization",
            ItemAttributes::CipherSyncBeacon => "Hacking Watch",
            ItemAttributes::Shimmerstick => "Consumable",
            ItemAttributes::Vigil => "Consumable (Drug)",
            ItemAttributes::PowerGlove => "Arm Implant",
            ItemAttributes::InfiltratorModScript => "ModScript",
            ItemAttributes::CMMWidow => "One-Handed Ranged",
            ItemAttributes::CMMCocoon => "Small Shield",
            default => '',
            
        };

        return $type;
        
    }

}
