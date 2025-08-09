<?php
declare(strict_types=1);
namespace Items\Classes;

use ReflectionEnumUnitCase;
use Items\Enums\{
    ItemAttributes,
    Tier0,
    Tier1,
    Tier2,
};

class ItemFetcher {

            private array $items = [];
            private array $rawitems = [];
            private array $rawtier = [];
            private static ItemFetcher $fetcher;
        
        private function __construct(

            private array $useritems){
            $this->useritems = [ // test array
                1 => [
                    'itemname' => 'PocketHacker',
                    'tierlevel' => 'Tier0',
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

        self::$fetcher = new self($useritems);
        self::$fetcher->sortData();
        self::$fetcher->compile();

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
            [$ItemAttributes, $tiernum, $displayname, $tierlevel] = $this->setValues($itemname, $key);

            $item["{$itemname}_{$tiernum}"] = [
                'runfunc' => $itemname,
                'displayname' => $displayname,
                'type' => $ItemAttributes->getType(),
                'group' => $ItemAttributes->getOwningGroup(),
                'flavor' => $ItemAttributes->getFlavorText(),
                'category' => $ItemAttributes->getCategory(),
                'benefits' => $tierlevel->getValue()->getBenefits(),
            ] + $this->useritems[$key];
        }

        unset($itemname);

        $this->items = $item;

        return $this;

    }

    private function setValues(string $itemname, int $key): array {

        $ItemAttributes = \constant(ItemAttributes::class . "::$itemname");
        $tiernum = \preg_replace("/[a-zA-Z]{4}/", 'T', $this->rawtier[$key]);
        $displayname = "{$ItemAttributes->getName()} [{$tiernum}]";
        $namespace = $this->getNamespace($ItemAttributes, $this->rawtier[$key]);
        $tierlevel = new ReflectionEnumUnitCase($namespace, $itemname);

        return [$ItemAttributes, $tiernum, $displayname, $tierlevel];

    }

    private function getNamespace(ItemAttributes $itemname, string $tierlevel): string {

        $classname = \get_class($itemname);
        $namespace = \explode("\\", $classname);
        \array_pop($namespace);
        $namespace = \implode("\\", $namespace);

        return "{$namespace}\\{$tierlevel}";

    }

}
