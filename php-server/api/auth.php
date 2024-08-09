<?php

require_once __DIR__ . '/../config/db.php';

$database = require_once __DIR__ . '/../config/db.php';
$usersCollection = $database->selectCollection('users');

$input = json_decode(file_get_contents('php://input'), true);

if (isset($input['email']) && isset($input['password'])) {
    $email = $input['email'];
    $password = $input['password'];

    $storedHashedPassword = '$2y$10$e0NRBkjLrI1IxV0gRbLZxevPUMOHTzkJkLsE.yDpChisK5uDqUHSa'; // Example hash

    if ($email === 'example@example.com' && $password === 'SecurePassword123') {
        $response = [
            'status' => 'success',
            'message' => 'Authentication successful!',
            'data' => [
                'email' => $email,
            ]
        ];

        echo json_encode($response);
    } else {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid email or password'
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Email and password are required'
    ]);
}