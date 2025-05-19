<?php
use WebSocket;

require 'composer/vendor/autoload.php';

$client = new WebSocket\Client("ws://localhost:8767");

$client->addMiddleware(new WebSocket\Middleware\CloseHandler());
$client->addMiddleware(new WebSocket\Middleware\PingResponder());

$client->setTimeout(60);

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

/*
$client->onHandshake(function (WebSocket\Client $client,
										WebSocket\Connection $connection,
										Psr\Http\Message\RequestInterface $request,
										Psr\Http\Message\ResponseInterface $response)
	{
		$connection->text(json_encode($request));
	});

$client->onText(function (WebSocket\Client $client, WebSocket\Connection $connection, WebSocket\Message\Message $message)
	{
		/*
			{
				"actionType": enum("entry","log","brick","rig","root","rooted")
				"entryID": int,
				"userID": int,
				"newData": String
			}
		*//*
		$client->send($message);
	});

$client->start();
*/