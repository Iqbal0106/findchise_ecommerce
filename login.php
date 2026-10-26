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

$email = strtolower(trim($data['email'] ?? ''));
$password = $data['password'] ?? '';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Format email tidak valid.'
    ]);
    exit;
}

if (!is_string($password) || $password === '') {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Password wajib diisi.'
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare(
        'SELECT id, name, email, password, role, status, created_at
         FROM users WHERE email = ? LIMIT 1'
    );
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    /* Verifikasi dengan password_verify karena hash dibuat oleh password_hash(). */
    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Email atau password salah.'
        ]);
        exit;
    }

    if ($user['status'] === 'nonaktif') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Akun ini sedang dinonaktifkan. Hubungi admin Findchisee.'
        ]);
        exit;
    }

    /* Franchisor masih menunggu verifikasi admin: belum boleh masuk dashboard. */
    if ($user['status'] === 'pending') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Akun Anda masih menunggu verifikasi admin. Silakan coba lagi setelah disetujui.'
        ]);
        exit;
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Login berhasil.',
        'user' => [
            'id' => (int) $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'status' => $user['status'],
            'created_at' => $user['created_at']
                ? date(DATE_ATOM, strtotime($user['created_at']))
                : null
        ]
    ]);
} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan pada server.'
    ]);
}
