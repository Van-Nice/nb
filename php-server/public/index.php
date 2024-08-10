<?php

// Function to set CORS headers
function setCorsHeaders(): void
{
    header('Access-Control-Allow-Origin: http://localhost:3000');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

// Set CORS headers
setCorsHeaders();

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // Send a 200 OK response for preflight
    exit(); // No need to process further
}

// Set the content type to JSON
header('Content-Type: application/json');

// Routing based on the request URI
$requestUri = $_SERVER['REQUEST_URI'];

// TODO: (bug) getting error when trying to react /confirm-email endpoint
// TODO: (FIX) set the link url to be frontend /email-confirmation instead of backend /email-confirmation
// TODO:  When user logs in route them to login instead and don't let them log in until their email has been confirmed

if ($requestUri === '/create-account') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        require_once __DIR__ . '/../api/createAccount.php';
    } else {
        http_response_code(405);
        echo json_encode([
            'status' => 'error',
            'message' => 'Only POST requests are allowed'
        ]);
    }
} elseif ($requestUri === '/auth') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        require_once __DIR__ . '/../api/auth.php';
    } else {
        http_response_code(405);
        echo json_encode([
            'status' => 'error',
            'message' => 'Only POST requests are allowed'
        ]);
    }
} elseif ($requestUri === '/confirm-email') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        require_once __DIR__ . '/../api/confirmEmail.php';
    } else {
        http_response_code(405);
        echo json_encode([
            'status' => 'error',
            'message' => 'Only GET requests are allowed'
        ]);
    }
} else {
    http_response_code(404);
    echo json_encode([
        'status' => 'error',
        'message' => 'Endpoint not found'
    ]);
}

