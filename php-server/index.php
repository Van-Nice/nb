<?php

require 'db.php';

// TODO: debug /create-account endpoint

// Set headers for CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Get req method
$method = $_SERVER['REQUEST_METHOD'];

// Parse request URI
$reqURI = $_SERVER['REQUEST_URI'];
$uriSegments = explode('/', trim($reqURI, '/'));

// Get the endpoint
$subroute = $uriSegments[0] ?? '';

switch ($subroute) {
    case 'auth':
        handleAuthRequest($method, $uriSegments);
        break;
    case 'create-account':
        handleCreateAccountRequest($method, $uriSegments);
        break;
    default:
        echo json_encode(['error' => 'Invalid endpoint']);
        break;
}

function handleAuthRequest($method, $uriSegments) {
    switch ($method) {
        case 'POST':
            // TODO: check mongo db to see if user credentials are there

    }
}

function handleCreateAccountRequest($method, $uriSegments): void
{
    switch ($method) {
        case 'POST':
            // TODO: create account on mongo db and respond with user id
            $input = json_decode(file_get_contents('php://input'), true);
            $email = $input['email'] ?? '';
            $password = $input['password'] ?? '';

            if (empty($email) || empty($password)) {
                echo json_encode(['error' => 'Email and password are required']);
                http_response_code(400);
                return;
            }

            try {
                $client = getMongoClient();
                $collection = $client->nbdb->users;
                $result = $collection->insertOne([
                    'email' => $email,
                    'password' => password_hash($password, PASSWORD_BCRYPT),
                ]);

                echo json_encode(['userId' => $result->getInsertedId()]);
                http_response_code(201);
            } catch (Exception $e) {
                json_encode(['error' => 'failed to create account']);
                http_response_code(500);
            }
        break;
    }
}

