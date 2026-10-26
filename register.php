
<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Metode permintaan tidak diizinkan.'
    ]);
    exit;
}

require_once __DIR__ . '/../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Data permintaan tidak valid.'
    ]);
    exit;
}

$nama = trim($data['nama'] ?? '');
$email = strtolower(trim($data['email'] ?? ''));
$password = $data['password'] ?? '';
$role = $data['role'] ?? '';

if (mb_strlen($nama) < 3 || mb_strlen($nama) > 100) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Nama harus terdiri dari 3–100 karakter.'
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) ||
    strlen($email) > 150) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Format email tidak valid.'
    ]);
    exit;
}

if (
    !is_string($password) ||
    strlen($password) < 8 ||
    !preg_match('/[A-Za-z]/', $password) ||
    !preg_match('/[0-9]/', $password)
) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Password harus minimal 8 karakter dan mengandung huruf serta angka.'
    ]);
    exit;
}

if (!in_array($role, ['franchisee', 'franchisor'], true)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Jenis akun tidak valid.'
    ]);
    exit;
}

$status = $role === 'franchisor' ? 'pending' : 'aktif';

try {
    $cek = $pdo->prepare(
        'SELECT id FROM users WHERE email = ? LIMIT 1'
    );
    $cek->execute([$email]);

    if ($cek->fetch()) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'Email sudah terdaftar. Silakan gunakan email lain.'
        ]);
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare(
        'INSERT INTO users (name, email, password, role, status)
         VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->execute([$nama, $email, $hash, $role, $status]);

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Pendaftaran berhasil.',
        'user' => [
            'id' => (int) $pdo->lastInsertId(),
            'nama' => $nama,
            'email' => $email,
            'role' => $role,
            'status' => $status
        ]
    ]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'Email sudah terdaftar.'
        ]);
    } else {
        error_log($e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Terjadi kesalahan pada server.'
        ]);
    }
}
