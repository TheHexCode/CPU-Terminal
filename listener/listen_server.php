<?php
use WebSocket;

require '/home/customer/www/term.cpularp.com/listener/composer/vendor/autoload.php';

$server = new WebSocket\Server(8767);

$server->addMiddleware(new WebSocket\Middleware\CloseHandler());
$server->addMiddleware(new WebSocket\Middleware\PingResponder());

$server->onHandshake(function (WebSocket\Server $server,
										WebSocket\Connection $connection,
										Psr\Http\Message\ServerRequestInterface $request,
										Psr\Http\Message\ResponseInterface $response)
	{
		echo "New Connection!\n";
	});

$server->onDisconnect(function (WebSocket\Server $server,
										WebSocket\Connection $connection)
	{
		echo "Connection Disconnected :C\n";
	});

$server->onText(function (WebSocket\Server $server, WebSocket\Connection $connection, WebSocket\Message\Message $message)
	{
		/*
			{
				"actionType": enum("entry","log","brick","rig","root","rooted")
				"entryID": int,
				"userID": int,
				"newData": String
			}
		*/
		$server->send($message);

		echo var_dump($message);
	});

$server->start();
