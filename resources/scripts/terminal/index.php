<?php
include 'AutoLoader.php';

use Items\Classes\ItemFetcher;

$fetcher = ItemFetcher::fetchStart();
$items = $fetcher->getItems();

echo "<pre>";
var_dump($items);
echo "</pre>";
