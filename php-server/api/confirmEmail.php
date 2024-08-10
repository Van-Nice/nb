<?php

require_once __DIR__ . '/../config/db.php';

$database = require_once __DIR__ . '/../config/db.php';
$usersCollection = $database->selectCollection('users');

$token = $_GET['token'] ?? '';

if ($token) {
    $user = $usersCollection->findOne(['confirmationToken' => $token]);

    if ($user) {
        $usersCollection->updateOne(
            ['_id' => $user['_id']],
            ['$set' => ['isEmailConfirmed' => true, 'confirmationToken' => null]]
        );

        echo json_encode([
            'status' => 'success',
            'message' => 'Email confirmed successfully'
        ]);
    } else {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid token'
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Token is required'
    ]);
}
