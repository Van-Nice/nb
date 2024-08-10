<?php
require_once __DIR__ . '/../utils/email.php';
use Dotenv\Dotenv;

try {
    $dotenv = Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->load();
} catch (Exception $e) {
    echo 'Failed to load .env file: ',  $e->getMessage();
    exit;
}

$bungoEmail = $_ENV['BUNGO_EMAIL'];
$bungoEmailPassword = $_ENV['BUNGO_EMAIL_PASSWORD'];

if (!$bungoEmail || !$bungoEmailPassword) {
    echo 'Failed to load .env variables';
}

$database = require_once __DIR__ . '/../config/db.php';
$usersCollection = $database->selectCollection('users');

$input = json_decode(file_get_contents('php://input'), true);
$token = $input['token'] ?? '';
// Ensure user with the token exists in db
if ($token) {
    // fetch user from db using token
    $user = $usersCollection->findOne(['confirmationToken' => $token]);

    if ($user) {
        // Generate a new token
        $newToken = bin2hex(random_bytes(16));

        // Update the user's document in the database
        $usersCollection->updateOne(
            ['_id' => $user['_id']],
            ['$set' => ['confirmationToken' => $newToken]]
        );

        // Send the confirmation email with the new token
        $confirmationLink = "http://localhost:3000/confirm-email?token=$newToken";
        $emailBody = "Please confirm your account by clicking this link: <a href=\"$confirmationLink\">Confirm Email</a>";
        $emailSent = sendConfirmationEmail($bungoEmail, $bungoEmailPassword, $user['email'], 'Account Confirmation', $emailBody);

        if ($emailSent) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Confirmation email resent successfully'
            ]);
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to resend confirmation email'
            ]);
        }    } else {
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



