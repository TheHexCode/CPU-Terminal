<?php
declare(strict_types=1);
include __DIR__ . '/../interface/items.php';

enum Customization implements Items {

    case Copycat;
    case CorpProtocols;
    case PocketHacker;
    case DriveMe;

    public function getOwningGroup(): string {

        $group = match($this){

            Customization::Copycat,
            Customization::PocketHacker => "Golden Triangle",
            Customization::CorpProtocols => "The Union, Cascadia Plexes",
            Customization::DriveMe => "Fugi Krupp Dynamics",
            default => '',

        };

        return $group;

    }

    public function getType(): string {

        $type = match($this){

            Customization::Copycat,
            Customization::DriveMe => "Cyberdeck Software Customization",
            Customization::PocketHacker => "Armor/Shield/Weapon Body Customization",
            Customization::CorpProtocols => "Cyberdeck Customization",
            default => '',

        };

        return $type;

    }

    public function getFlavorText(): string {

        $flavor = match($this){

            Customization::Copycat => "It turns out that when fighting the man, sometimes speed is important.",
            Customization::DriveMe => "This software series specializes in remote control of drones and vehicles, but turned out pretty handy in controlling almost any device remotely.",
            Customization::PocketHacker => "Hate it when people tell you no? Take passwords as a challenge? Be equipped to handle all of life's nuisances.",
            Customization::CorpProtocols => "Using a corporation's bullshit rules against them is surprisingly effective.",
            default => '',

        };

        return $flavor;

    }

}
