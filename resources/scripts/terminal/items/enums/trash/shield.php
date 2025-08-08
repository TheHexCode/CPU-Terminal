<?php
declare(strict_types=1);
include __DIR__ . '/../interface/items.php';

enum Shield implements Items {

    case CMMCocoon;

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