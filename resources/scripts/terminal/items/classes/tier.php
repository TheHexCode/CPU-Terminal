<?php
declare(strict_types=1);

class Tier {

            private array $tieritems = [];
            private static Tier $tier;
        
        private function __construct(

            private TierLevel $tierlevel){

        }

    public static function setTierItems(TierLevel $tierlevel): Tier {

        self::$tier = new self($tierlevel)->buildItem();

        return self::$tier;

    }

    public function getTierItems(): array {

        return $this->tieritems;

    }

    private function buildItem(): Tier {

        $tier = [];
        $cases = $this->tierlevel->name::cases();

        foreach($cases as &$case){
            $tier[$case->name] = [
                'name' => TierAttributes::{$case->name}->getName(),
                'type' => TierAttributes::{$case->name}->getType(),
                'group' => TierAttributes::{$case->name}->getOwningGroup(),
                'flavor' => TierAttributes::{$case->name}->getFlavorText(),
                'category' => TierAttributes::{$case->name}->getCategory(),
                //'benefits' => $case->getBenefits(),
            ];
        }

        unset($case);

        $this->tieritems = $tier;

        return $this;

    }

}
