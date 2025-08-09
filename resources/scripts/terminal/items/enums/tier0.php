<?php
declare(strict_types=1);
namespace Items\Enums;

enum Tier0 {

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

    public function getBenefits(): array {

        $benefit = match($this){

            Tier0::PocketHacker => ['tier zero benefit'],

        };
        
        return $benefit;

    }

}
