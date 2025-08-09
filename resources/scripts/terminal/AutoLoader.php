<?php 
declare(strict_types=1);

class AutoLoader {

    public static function Load(): void {

        \spl_autoload_register(function (string $class) {
            
            $path = \str_replace('\\', '/', $class);
            $file =  __DIR__ . "/{$path}.php"; 

            if(\file_exists($file)){
                require $file;
            }
            
        });

    }

}

AutoLoader::Load();
