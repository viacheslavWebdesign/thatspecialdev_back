<?php
/**
 * Plugin Name:       TSD Custom Blocks
 * Description:       Collection of custom Gutenberg blocks for back.thatspecial.dev.
 * Requires at least: 6.6
 * Requires PHP:      7.2
 * Version:           6.6.6
 * Author:            thatspecial.dev
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       tsd-custom-blocks
 *
 * @package CreateBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function create_block_tsd_custom_blocks_block_init() {
	foreach( ['intro', 'services', 'experience', 'technologies', 'projects', 'contacts', 'errorpage'] as $block ){     register_block_type( __DIR__ . '/build/'.$block ); }
}
add_action( 'init', 'create_block_tsd_custom_blocks_block_init' );

function enqueue_custom_block_assets() {
	wp_enqueue_style(
		 'custom-editor-style',
		 plugin_dir_url( __FILE__ ) . 'style.css',
		 array( 'wp-edit-blocks' ),
		 filemtime( plugin_dir_path( __FILE__ ) . 'style.css' )
	);
}
add_action( 'enqueue_block_assets', 'enqueue_custom_block_assets' );

function add_gutenberg_blocks_to_rest( $response, $post, $context ) {
	if ( 'page' === $post->post_type ) {
		 $blocks = parse_blocks( $post->post_content );
		 $response->data['gutenberg_blocks'] = $blocks;
	}
	return $response;
}

add_filter( 'rest_prepare_page', 'add_gutenberg_blocks_to_rest', 10, 3 );