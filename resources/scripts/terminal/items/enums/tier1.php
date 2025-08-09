<?php
declare(strict_types=1);
namespace Items\Enums;

enum Tier1 {

    case PocketHacker;
    case CipherSyncBeacon;
    case CRDSpiderCyberdeck;
    case DebutantalusReporterBadge;
    case FKD_DC17;
    case InfiltratorModScript;
    case JohnnySpecialTouch;
    case PowerGlove;
    case Shimmerstick;
    case Vigil;

    public function getBenefits(): array {

        $benefit = match($this){

            Tier1::PocketHacker => [
                'tier one benefit',
                'some other thing',
            ],

        };
        
        return $benefit;

    }

}
