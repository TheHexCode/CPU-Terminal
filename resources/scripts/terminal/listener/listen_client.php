<?php
require './composer/vendor/autoload.php';
use WebSocket;

$client = new WebSocket\Client("ws://localhost:8767");

$client->addMiddleware(new WebSocket\Middleware\CloseHandler());
$client->addMiddleware(new WebSocket\Middleware\PingResponder());

$client->setTimeout(300);

try
{
	$message = $client->receive(); // Blocking; Timeout: 300s
	echo $message->getContent();
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
		// SERVER TIMEOUT
		case("WebSocket\\Exception\\ConnectionTimeoutException"):
			header($_SERVER["SERVER_PROTOCOL"] . " 504 LISTEN TIMEOUT");
			echo "";
			break;
		// SERVER CLOSED
		case("WebSocket\\Exception\\ConnectionClosedException"):
			header($_SERVER["SERVER_PROTOCOL"] . " 537 SERVER CLOSED");
			echo "Listen server closed unexpectedly. Please contact Staff to correct issue.";
			break;
		default:
			echo get_class($error);
	}
}

// Close connection
$client->close();