<?php
// Set the content type to JSON
header('Content-Type: application/json');

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

            $response = [
                'status' => 'success',
                'message' => 'Account created successfully!',
                'data' => [
                    'firstName' => $input['firstName'],
                    'lastName' => $input['lastName'],
                    'email' => $input['email'],
                    'birthDate' => $input['birthDate']
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
    } else {
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
