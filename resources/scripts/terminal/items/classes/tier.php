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
                'name' => ItemAttributes::{$case->name}->getName(),
                'type' => ItemAttributes::{$case->name}->getType(),
                'group' => ItemAttributes::{$case->name}->getOwningGroup(),
                'flavor' => ItemAttributes::{$case->name}->getFlavorText(),
                'category' => ItemAttributes::{$case->name}->getCategory(),
                //'benefits' => $case->getBenefits(),
            ];
        }

        unset($case);

        $this->tieritems = $tier;

        return $this;

    }

}
