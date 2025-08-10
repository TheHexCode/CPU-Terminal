<?php
declare(strict_types=1);
include __DIR__ . '/../interface/items.php';

enum Weapon: string implements Items {

    case CMMWidow = "CMM Widow";

    public function getOwningGroup(): string {

        $group = match($this){

        };

        return $group;

    }

    public function getType(): string {

        $type = match($this){

        };

        return $type;

    }

    public function getFlavorText(): string {

        $flavor = match($this){

        };

        return $flavor;
        
    }

}