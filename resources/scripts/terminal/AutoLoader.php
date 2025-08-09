<?php 
declare(strict_types=1);

class AutoLoader {

    public static function Load(): void {

        \spl_autoload_register(function (string $class) {
            
            $path = \str_replace('\\', '/', $class);
            $file =  __DIR__ . "/{$path}.php"; 
var_dump(phpversion());
            if(\file_exists($file)){
                require $file;
            }
            
        });

    }

}

AutoLoader::Load();
