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

if (isset($input['firstName']) && isset($input['lastName']) && isset($input['email']) &&
    isset($input['password']) && isset($input['birthDate'])) {

    // Ensure email is not already in use
    $existingUser = $usersCollection->findOne(['email' => $input['email']]);
    if ($existingUser) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Email already exists'
        ]);
        exit();
    }

    // Prep db variables
    $date = new DateTime('now', new DateTimeZone('UTC'));
    $formattedDate = $date->format('Y-m-d\TH:i:s.v\Z');
    $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
    $token = bin2hex(random_bytes(16));

    // Insert user data into db
    $result = $usersCollection->insertOne([
        'createdAt' => $formattedDate,
        'firstName' => $input['firstName'],
        'lastName' => $input['lastName'],
        'email' => $input['email'],
        'passwordHash' => $hashedPassword,
        'birthDate' => $input['birthDate'],
        'confirmationToken' => $token,
        'isEmailConfirmed' => false
    ]);

    $confirmationLink = "http://localhost:3000/confirm-email?token=$token";
    $emailBody = "Please confirm your account by clicking this link: <a href=\"$confirmationLink\">Confirm Email</a>";

    $emailSent = sendConfirmationEmail($bungoEmail, $bungoEmailPassword, $input['email'], 'Account Confirmation', $emailBody);

    if ($emailSent) {
        $response = [
            'status' => 'success',
            'message' => 'Account created successfully! Please check your email to confirm your account.',
            'data' => [
                'firstName' => $input['firstName'],
                'lastName' => $input['lastName'],
                'email' => $input['email'],
                'birthDate' => $input['birthDate'],
                'passwordHash' => $hashedPassword,
            ]
        ];
    } else {
        $response = [
            'status' => 'error',
            'message' => 'Account created, but failed to send confirmation email.'
        ];
    }

    echo json_encode($response);
} else {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid input data. All fields are required.'
    ]);
}
