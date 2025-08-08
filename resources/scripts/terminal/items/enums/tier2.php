<?php
declare(strict_types=1);

enum Tier2 {

    case CMMWidow;
    case CMMCocoon;
    case CRDSpiderCyberdeck;

    public function getBenefits(): array {

        $group = match($this){
            
            Tier2::CMMWidow => [
                Benefits::Fragile->getValue(),
                "1x Recharge (any Ranged defensive command)",
                "The first time you gain Tags in a Scene, Refresh a use of Slip",
                "The first time you use Slip in a Scene, gain +1 Tag on the next device you hack.",
            ],
            Tier2::CMMCocoon => [
                "2x Recharge (any Ranged defensive command)",
                "The first time you gain Tags in a Scene, gain a Nix(Ranged).",
                "The first time you use Slip in a Scene, gain +2 Tags on the next device you hack",
            ],
            Tier2::CRDSpiderCyberdeck => [
                "Charges (Common Circuit)",
                Benefits::Unique->getValue(),
                "1/Simulation: When you activate Hacking, gain two extra Tags.",
            ],
            default => [],

        };

        return $group;

    }

}