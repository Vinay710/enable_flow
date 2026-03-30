<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  echo json_encode(["success" => true]);
  exit;
}

function json_error($message, $code = 400) {
  http_response_code($code);
  echo json_encode(["success" => false, "error" => $message]);
  exit;
}

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);
if (!is_array($data)) {
  json_error("Invalid JSON payload", 400);
}

$name = trim($data["name"] ?? "");
$email = trim($data["email"] ?? "");
$tool = trim($data["tool"] ?? "");
$type = trim($data["type"] ?? "");
$request_tool = trim($data["request_tool"] ?? "");
$message = trim($data["message"] ?? "");
$page_url = trim($data["page_url"] ?? "");
$user_agent = trim($data["user_agent"] ?? "");

if ($name === "" || $email === "" || $message === "" || $tool === "" || $type === "") {
  json_error("Missing required fields", 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  json_error("Invalid email address", 400);
}
if (!in_array($type, ["feedback", "feature"])) {
  json_error("Invalid type", 400);
}

$DB_HOST = getenv("DB_HOST") ?: "localhost";
$DB_USER = getenv("DB_USER") ?: "root";
$DB_PASSWORD = getenv("DB_PASSWORD") ?: "";
$DB_NAME = getenv("DB_NAME") ?: "enableflow";
$DB_PORT = intval(getenv("DB_PORT") ?: "3306");

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
  // Bootstrap: create database if not exists
  $bootstrap = new mysqli($DB_HOST, $DB_USER, $DB_PASSWORD, "", $DB_PORT);
  $bootstrap->query("CREATE DATABASE IF NOT EXISTS `$DB_NAME`");
  $bootstrap->close();

  // Connect to DB
  $conn = new mysqli($DB_HOST, $DB_USER, $DB_PASSWORD, $DB_NAME, $DB_PORT);
  $conn->set_charset("utf8mb4");

  // Create table if not exists
  $createTableSQL = "
    CREATE TABLE IF NOT EXISTS feedback (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL,
      tool VARCHAR(100) NOT NULL,
      type ENUM('feedback','feature') NOT NULL,
      request_tool VARCHAR(150) DEFAULT '',
      message TEXT NOT NULL,
      page_url VARCHAR(255) DEFAULT '',
      user_agent VARCHAR(255) DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  ";
  $conn->query($createTableSQL);

  // Insert
  $stmt = $conn->prepare("
    INSERT INTO feedback (name, email, tool, type, request_tool, message, page_url, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ");
  $stmt->bind_param("ssssssss", $name, $email, $tool, $type, $request_tool, $message, $page_url, $user_agent);
  $stmt->execute();
  $stmt->close();
  $conn->close();

  echo json_encode(["success" => true]);
} catch (mysqli_sql_exception $e) {
  json_error("Database error", 500);
}

