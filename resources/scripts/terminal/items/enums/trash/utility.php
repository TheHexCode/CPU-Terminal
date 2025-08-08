<?php
declare(strict_types=1);
include __DIR__ . '/../interface/items.php';

enum Utility: string implements Attributes {

    case BudgetCyberdeck = "Budget Cyberdeck";
    case BudgetRAD = "Budget Remote Access Drive";
    case CipherSyncBeacon = "CipherSync Beacon";
    case ConnTrustRAD = "ConnTrust Remote Access Drive";
    case CRDSpiderCyberdeck = "CRD Spider Cyberdeck";
    case DebutantalusReporterBadge = "Debutantalus Reporter Badge";
    case DeputyHat = "Deputy's Hat";
    case DigiPet = "DigiPet";
    case FKD_DC17 = "FKD DC-17";
    case InfiltratorModScript = "Infiltrator ModScript";
    case JohnnySpecialTouch = "Johnny's Special Touch";
    case MMConsole = "MM Console";
    case PowerGlove = "Power Glove";
    case Shimmerstick = "Shimmerstick";
    case Vigil = "Vigil";

    public function buildItem(): array {

        $item = [];

        foreach(Utility::cases() as $case){

            $item[$case->name] = [
                'type' => $case->getType(),
                'group' => $case->getOwningGroup(),
                'flavor' => $case->getFlavorText(),
            ];

        }

        return $item;

    }

    public function getOwningGroup(): string {

        $group = match($this){
            
            Utility::BudgetCyberdeck,
            Utility::BudgetRAD,
            Utility::CRDSpiderCyberdeck,
            Utility::MMConsole,
            Utility::PowerGlove => "Cybernet Matrix Media",
            Utility::DebutantalusReporterBadge,
            Utility::Shimmerstick => "Debutantalus",
            Utility::CipherSyncBeacon => "Moggers",
            Utility::ConnTrustRAD,
            Utility::DigiPet => "Golden Triangle",
            Utility::FKD_DC17 => "Fuji Krupp Dynamics",
            Utility::JohnnySpecialTouch => "The Union",
            Utility::DeputyHat => "The Union, TRI-C.I.",
            Utility::Vigil => "LAVI",
            Utility::InfiltratorModScript => "--",
            default => '',

        };

        return $group;

    }

    public function getType(): string {

        $type = match($this){

            Utility::BudgetCyberdeck,
            Utility::BudgetRAD,
            Utility::CRDSpiderCyberdeck,
            Utility::MMConsole,
            Utility::PowerGlove => "Cybernet Matrix Media",
            Utility::DebutantalusReporterBadge,
            Utility::Shimmerstick => "Debutantalus",
            Utility::CipherSyncBeacon => "Moggers",
            Utility::ConnTrustRAD,
            Utility::DigiPet => "Golden Triangle",
            Utility::FKD_DC17 => "Fuji Krupp Dynamics",
            Utility::JohnnySpecialTouch => "The Union",
            Utility::DeputyHat => "The Union, TRI-C.I.",
            Utility::Vigil => "LAVI",
            Utility::InfiltratorModScript => "--",
            default => '',

        };

        return $type;

    }

    public function getFlavorText(): string {

        $flavor = match($this){

            Utility::BudgetCyberdeck,
            Utility::BudgetRAD,
            Utility::CRDSpiderCyberdeck,
            Utility::MMConsole,
            Utility::PowerGlove => "Cybernet Matrix Media",
            Utility::DebutantalusReporterBadge,
            Utility::Shimmerstick => "Debutantalus",
            Utility::CipherSyncBeacon => "Moggers",
            Utility::ConnTrustRAD,
            Utility::DigiPet => "Golden Triangle",
            Utility::FKD_DC17 => "Fuji Krupp Dynamics",
            Utility::JohnnySpecialTouch => "The Union",
            Utility::DeputyHat => "The Union, TRI-C.I.",
            Utility::Vigil => "LAVI",
            Utility::InfiltratorModScript => "--",
            default => '',

        };

        return $flavor;
        
    }

}