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

// Get db connection
$database = require_once __DIR__ . '/../config/db.php';
$usersCollection = $database->selectCollection('users');

// Routing based on the request URI
$requestUri = $_SERVER['REQUEST_URI'];

// Handle the /create-account endpoint
if ($requestUri === '/create-account') {
    // Ensure only POST requests are allowed
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Process account creation
        $input = json_decode(file_get_contents('php://input'), true);

        if (isset($input['firstName']) && isset($input['lastName']) && isset($input['email']) &&
            isset($input['password']) && isset($input['birthDate'])) {

            // Hash the password using password_hash()
            $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);

            // Insert user data into db
            $result = $usersCollection->insertOne([
                'firstName' => $input['firstName'],
                'lastName' => $input['lastName'],
                'email' => $input['email'],
                'passwordHash' => $hashedPassword,
                'birthDate' => $input['birthDate']
            ]);

            $response = [
                'status' => 'success',
                'message' => 'Account created successfully!',
                'data' => [
                    'firstName' => $input['firstName'],
                    'lastName' => $input['lastName'],
                    'email' => $input['email'],
                    'birthDate' => $input['birthDate'],
                    'passwordHash' => $hashedPassword,
                ]
            ];

            echo json_encode($response);
        } else {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid input data. All fields are required.'
            ]);
        }
    } else {
        http_response_code(405);
        echo json_encode([
            'status' => 'error',
            'message' => 'Only POST requests are allowed'
        ]);
    }

// Handle the /auth endpoint
} elseif ($requestUri === '/auth') {
    // Ensure only POST requests are allowed
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Process authentication
        $input = json_decode(file_get_contents('php://input'), true);

        if (isset($input['email']) && isset($input['password'])) {
            $email = $input['email'];
            $password = $input['password'];

            // Here you would fetch the hashed password from your database based on the provided email
            // For demonstration, we'll simulate a stored hash
            $storedHashedPassword = '$2y$10$e0NRBkjLrI1IxV0gRbLZxevPUMOHTzkJkLsE.yDpChisK5uDqUHSa'; // Example hash


            // Here you would check the credentials against your database
            // For example purposes, we'll assume the credentials are valid
            if ($email === 'example@example.com' && $password === 'SecurePassword123') {
                $response = [
                    'status' => 'success',
                    'message' => 'Authentication successful!',
                    'data' => [
                        'email' => $email,
                        // Typically, you'd return a token or session info here
                    ]
                ];

                echo json_encode($response);
            } else { // Handle invalid credentials
                http_response_code(401);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Invalid email or password'
                ]);
            }
        } else { // Handle empty input
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Email and password are required'
            ]);
        }
    } else { // Handle not post request
        http_response_code(405);
        echo json_encode([
            'status' => 'error',
            'message' => 'Only POST requests are allowed'
        ]);
    }

// Handle any other endpoints
} else {
    http_response_code(404);
    echo json_encode([
        'status' => 'error',
        'message' => 'Endpoint not found'
    ]);
}
