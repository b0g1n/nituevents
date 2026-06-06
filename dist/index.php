<?php
/**
 * The main template file for Nitu Events theme
 * This serves the built React SPA for WordPress
 */
get_header(); ?>
<div id="root"></div>
<script type="module" crossorigin src="<?php echo get_template_directory_uri(); ?>/assets/index.js"></script>
<?php get_footer(); ?>
