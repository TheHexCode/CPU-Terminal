<?php
use WebSocket;

require 'composer/vendor/autoload.php';

$client = new WebSocket\Client("ws://localhost:8767");

$client->addMiddleware(new WebSocket\Middleware\CloseHandler());
$client->addMiddleware(new WebSocket\Middleware\PingResponder());

$message = $client->receive();
echo $message->getContent();

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