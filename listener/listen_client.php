<?php
use WebSocket;

require 'listener/composer/vendor/autoload.php';

$client = new WebSocket\Client("ws://localhost:8767");

//Add standard middleware
$client->addMiddleware(new WebSocket\Middleware\CloseHandler());
$client->addMiddleware(new WebSocket\Middleware\PingResponder());

//Send a message
$client->text("Hello Websocket!");

//Read response (This is blocking)
$message = $client->receive();
echo "Got message: {$message->getContent()}\n";

$client->close();
