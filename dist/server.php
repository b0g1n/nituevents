<?php
/**
 * Nitu Events - Shared Hosting Entry Point
 * Handles SPA routing and serves the React app
 */

// Determine the correct index file
$indexPath = __DIR__ . '/index.html';

// Read and serve the index.html for all routes
if (file_exists($indexPath)) {
    $content = file_get_contents($indexPath);
    // Adjust paths if needed for subdirectory installation
    echo $content;
} else {
    // Fallback if index.html doesn't exist
    http_response_code(404);
    echo '<!DOCTYPE html><html><head><title>Not Found</title></head><body><h1>404 - Not Found</h1></body></html>';
}
?>
