<?php
declare(strict_types=1);
namespace Items\Classes;

use Items\Enums\ItemAttributes;

class ItemFetcher {

            private array $items;
            private array $rawitems = [];
            private array $rawtier = [];
            private static ItemFetcher $fetcher;
        
        private function __construct(

            private array $useritems){
            $this->useritems = [ // test array
                1 => [
                    'itemname' => 'PocketHacker',
                    'tierlevel' => 'Tier0',
                    'test' => 'testing'
                ],
                2 => [
                    'itemname' => 'PocketHacker',
                    'tierlevel' => 'Tier1',
                ],
                3 => [
                    'itemname' => 'CMMCocoon',
                    'tierlevel' => 'Tier2',
                ]
            ];

        }

    public static function fetchStart(array $useritems = []): ItemFetcher {

        self::$fetcher = new self($useritems)
            ->sortData()
            ->compile();

        return self::$fetcher;

    }

    public function getItems(): array {

        return $this->items;

    }

    private function sortData(): ItemFetcher {
        
        foreach($this->useritems as $key => &$item){
            $this->rawitems[$key] = $item['itemname'];
            $this->rawtier[$key] = $item['tierlevel'];
            unset($this->useritems[$key]['itemname'], $this->useritems[$key]['tierlevel']);
        }

        unset($item);

        return $this;

    }

    private function compile(): ItemFetcher {

        $item = [];

        foreach($this->rawitems as $key => &$itemname){
            $tierlevel = $this->getNamespace(ItemAttributes::{$itemname}, $this->rawtier[$key]);
            $tiernum = \preg_replace("/[a-zA-Z]{4}/", 'T', $this->rawtier[$key]);
            $finalname = ItemAttributes::{$itemname}->getName();

            $item["{$itemname}_{$tiernum}"] = [
                'runfunc' => $itemname,
                'name' => "{$finalname} [{$tiernum}]",
                'type' => ItemAttributes::{$itemname}->getType(),
                'group' => ItemAttributes::{$itemname}->getOwningGroup(),
                'flavor' => ItemAttributes::{$itemname}->getFlavorText(),
                'category' => ItemAttributes::{$itemname}->getCategory(),
                'benefits' => $tierlevel::{$itemname}->getBenefits(),
            ] + $this->useritems[$key];
        }

        unset($itemname);

        $this->items = $item;

        return $this;

    }

    private function getNamespace(ItemAttributes $itemname, string $tierlevel): string {

        $classname = \get_class($itemname);
        $namespace = \explode("\\", $classname);
        \array_pop($namespace);
        $namespace = \implode("\\", $namespace);

        return "{$namespace}\\{$tierlevel}";

    }

}
