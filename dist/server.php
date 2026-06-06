<?php
/**
 * Nitu Events - cPanel Shared Hosting Entry Point
 * Handles SPA routing, subdirectory installations, and static file serving
 * Works with or without .htaccess
 */

// Configuration
$subdirectory = ''; // e.g., '/nituevents' if installed in subdirectory

// Determine the request path
$requestUri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
$requestPath = parse_url($requestUri, PHP_URL_PATH);

// Remove subdirectory prefix if present
if ($subdirectory && strpos($requestPath, $subdirectory) === 0) {
    $requestPath = substr($requestPath, strlen($subdirectory));
}
$requestPath = ltrim($requestPath, '/');

// Paths
$baseDir = __DIR__;
$indexFile = $baseDir . '/index.html';

// Handle static files directly (for hosts where .htaccess doesn't work)
if ($requestPath && $requestPath !== 'index.html' && $requestPath !== 'server.php') {
    $filePath = $baseDir . '/' . $requestPath;
    
    // Security: prevent directory traversal
    $realFilePath = realpath($filePath);
    $realBaseDir = realpath($baseDir);
    
    if ($realFilePath && strpos($realFilePath, $realBaseDir) === 0 && is_file($realFilePath)) {
        // Serve static file with proper headers
        $ext = pathinfo($realFilePath, PATHINFO_EXTENSION);
        $mimeTypes = [
            'html' => 'text/html',
            'css' => 'text/css',
            'js' => 'application/javascript',
            'json' => 'application/json',
            'png' => 'image/png',
            'svg' => 'image/svg+xml',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'webp' => 'image/webp',
            'ico' => 'image/x-icon',
        ];
        
        if (isset($mimeTypes[$ext])) {
            header('Content-Type: ' . $mimeTypes[$ext]);
        }
        
        // Cache static assets
        if (in_array($ext, ['png', 'svg', 'jpg', 'jpeg', 'webp', 'ico', 'css', 'js'])) {
            header('Cache-Control: public, max-age=31536000'); // 1 year
        }
        
        readfile($realFilePath);
        exit;
    }
}

// Serve the SPA index.html for all other routes
if (file_exists($indexFile)) {
    $content = file_get_contents($indexFile);
    
    // Fix paths for subdirectory if needed
    if ($subdirectory) {
        $content = str_replace(
            ['href="/', 'src="/', 'url("/'],
            ['href="' . $subdirectory . '/', 'src="' . $subdirectory . '/', 'url("' . $subdirectory . '/'],
            $content
        );
    }
    
    // Add base tag for subdirectory support
    if ($subdirectory) {
        $content = str_replace('<head>', '<head><base href="' . $subdirectory . '/">', $content);
    }
    
    // Security headers (if not already sent by Apache)
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('X-XSS-Protection: 1; mode=block');
    
    echo $content;
} else {
    http_response_code(404);
    echo '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>404 - Not Found</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;"><h1>404 - Site Not Configured</h1><p>index.html not found. Please run <code>npm run build</code> and upload the <code>dist/</code> folder contents.</p></body></html>';
}
