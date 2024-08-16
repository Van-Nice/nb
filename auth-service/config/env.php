<?php

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