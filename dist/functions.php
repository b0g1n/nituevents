<?php
/**
 * Nitu Events Theme functions and definitions
 */

// Enqueue styles and scripts
function nitu_events_enqueue_scripts() {
    wp_enqueue_style('nitu-events-style', get_template_directory_uri() . '/assets/index.css', array(), '1.0.0');
}
add_action('wp_enqueue_scripts', 'nitu_events_enqueue_scripts');

// Add theme supports
function nitu_events_theme_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
}
add_action('after_setup_theme', 'nitu_events_theme_setup');
