<?php
declare(strict_types=1);

class Tier {

        private array $tieritems = [];
        private static Tier $tier;
        
        private function __construct(

            private TierLevel $tierlevel){
            $this->buildItem($this->tierlevel->name);

        }

    public static function setTierItems(TierLevel $tierlevel){

        self::$tier = new self($tierlevel);

        return self::$tier;

    }

    private function buildItem(string $tierlevel) {

        $tier = [];
        $cases = $tierlevel::cases();

        foreach($cases as &$case){
            $tier[$case->name] = [
                'name' => Attributes::{$case->name}->getName(),
                'type' => Attributes::{$case->name}->getType(),
                'group' => Attributes::{$case->name}->getOwningGroup(),
                'flavor' => Attributes::{$case->name}->getFlavorText(),
                'category' => Attributes::{$case->name}->getCategory(),
                'benefits' => $case->getBenefits(),
            ];
        }

        unset($case);

        $this->tieritems = $tier;

    }

}
