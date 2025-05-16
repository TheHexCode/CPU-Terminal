<?php
use WebSocket;

require '/home/customer/www/term.cpularp.com/listener/composer/vendor/autoload.php';

$server = new WebSocket\Server(8767);

//Add standard middleware
$server->addMiddleware(new WebSocket\Middleware\CloseHandler());
$server->addMiddleware(new WebSocket\Middleware\PingResponder());

//Listen to incoming Text messages
$server->onText(function (WebSocket\Server $server, WebSocket\Connection $connection, WebSocket\Message\Message $message)
{
	//Act on incoming message
	echo "Got message: {$message->getContent()}\n";

	//Possibly respond to client
	$connection->text("I got your message");
});

$server->start();
