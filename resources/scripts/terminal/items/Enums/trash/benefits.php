<?php
declare(strict_types=1);

enum Benefits {

    case Charges;
    case Unique;
    case HackingScript;
    case Fragile;
    case Exhausting;
    case Limited;

    public function getValue(int $number = 0, string $item = ""): string {

        $value = match($this){

            Benefits::Charges => "This item has {$number} charge(s). It may be recharged with 30 seconds of roleplay and spending 1 {$item}.",
            Benefits::Unique => "You may only gain the unique benefits from one item of this type per Simulation (such as one Cyberdeck, one Medkit, etc). You can benefit from Unique items of different types, such as using a Cyberdeck and a Medkit in the same Simulation. If it is a consumable, you may only benefit from one tiem of the same name per Simulation",
            Benefits::HackingScript => "You must have Hacking to use a Hacking Script. While using a Hacking Script, your Ranks in Hacking are temporarily decreased by its cost. This does not affect the Hacking Scripts you can run.",
            Benefits::Fragile => "You cannot make Resist calls against calls targeting this item.",
            Benefits::Exhausting => "When you use this item, you are Exhausted at the end of the Scene.",
            Benefits::Limited => "When you use this item, you may only benefit from higher Tier versions of this item for the rest of the Simulation.",

        };

        return $value;

    }
}