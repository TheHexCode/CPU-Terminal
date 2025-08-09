<?php
declare(strict_types=1);
namespace Items\Classes;

use ReflectionEnumUnitCase;
use Items\Enums\ItemAttributes;

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
            [$ItemAttributes, $TierLevel] = $this->setValues($itemname, $key);
            $tiernum = \preg_replace("/[a-zA-Z]{4}/", 'T', $this->rawtier[$key]);
            $displayname = "{$ItemAttributes->getName()} [{$tiernum}]";

            $item["{$itemname}_{$tiernum}"] = [
                'runfunc' => $itemname,
                'displayname' => $displayname,
                'type' => $ItemAttributes->getType(),
                'group' => $ItemAttributes->getOwningGroup(),
                'flavor' => $ItemAttributes->getFlavorText(),
                'category' => $ItemAttributes->getCategory(),
                'benefits' => $TierLevel->getBenefits(),
            ] + $this->useritems[$key];
        }

        unset($itemname);

        $this->items = $item;

        return $this;

    }

    private function setValues(string $itemname, int $key): array {

        $namespace = $this->getNamespace(ItemAttributes::class, $this->rawtier[$key]);
        $ItemAttributes = $this->getEnum(ItemAttributes::class, $itemname);
        $TierLevel = $this->getEnum($namespace, $itemname);

        return [$ItemAttributes, $TierLevel];

    }

    private function getEnum(object|string $enum, string $case){

        $enum = new ReflectionEnumUnitCase($enum, $case);

        return $enum->getValue();

    }

    private function getNamespace(string $itemattributes, string $tierlevel): string {

        $namespace = \explode("\\", $itemattributes);
        \array_pop($namespace);
        $namespace = \implode("\\", $namespace);

        return "{$namespace}\\{$tierlevel}";

    }

}
