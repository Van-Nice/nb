<?php

require_once __DIR__ . '/../config/db.php';

$database = require_once __DIR__ . '/../config/db.php';
$usersCollection = $database->selectCollection('users');

$input = json_decode(file_get_contents('php://input'), true);

if (isset($input['email']) && isset($input['password'])) {
    $email = $input['email'];
    $password = $input['password'];

    // Fetch user from the database using email
    $user = $usersCollection->findOne(['email' => $email]);

    if ($user) {
        $storedHashedPassword = $user['passwordHash'];
        // Verify the password
        if (password_verify($password, $storedHashedPassword)) {
            // Check if the email is confirmed
            if (isset($user['emailConfirmed']) && $user['emailConfirmed'] === true) {
                $response = [
                    'status' => 'success',
                    'message' => 'Authentication successful!',
                    'data' => [
                        'email' => $email,
                    ]
                ];

                echo json_encode($response);
            } else {
                http_response_code(403);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Email not confirmed'
                ]);
            }
        } else {
            http_response_code(401);
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid email or password'
            ]);
        }
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