<?php
require './composer/vendor/autoload.php';
use WebSocket;

$client = new Websocket\Client("ws://localhost:8767");

$client->addMiddleware(new WebSocket\Middleware\CloseHandler());
$client->addMiddleware(new WebSocket\Middleware\PingResponder());

$client->setTimeout(5);

try
{
	$client->ping();

    $pong = $client->receive(); // Blocking; Timeout: 5s
	echo $pong->getContent();
}
catch(Exception $error)
{
	switch(get_class($error))
	{
        // SERVER DOWN
		case("WebSocket\\Exception\\ClientException"):
			header($_SERVER["SERVER_PROTOCOL"] . " 537 SERVER DOWN");
			echo "Error connecting to listen server. Please contact Staff to correct issue.";
			break;
        default:
            echo get_class($error);
    }
}

$client->close();