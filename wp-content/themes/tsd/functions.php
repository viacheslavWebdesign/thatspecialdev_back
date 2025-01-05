<?php

add_filter( 'block_categories_all', 'custom_blocks_category' );

function custom_blocks_category( $cats ) {
	$new = array(
		'reorderedblocks' => array(
			'slug' => 'custom-blocks',
		   'title' => 'Custom Blocks'
		)
	);

	$position = 0;

	$cats = array_slice( $cats, 0, $position, true ) + $new + array_slice( $cats, $position, null, true );

	$cats = array_values( $cats );

	return $cats;
}

function add_translations_to_api_response($data, $post, $context) {
	if (function_exists('pll_get_post_translations')) {
		 $translations = pll_get_post_translations($post->ID);
		 $translations_data = [];

		 foreach ($translations as $lang => $translated_post_id) {
			  $translations_data[$lang] = [
					'url' => get_permalink($translated_post_id),
					'post_id' => $translated_post_id,
			  ];
		 }

		 $data->data['translations'] = $translations_data;
	}

	return $data;
}

add_filter('rest_prepare_post', 'add_translations_to_api_response', 10, 3);
add_filter('rest_prepare_page', 'add_translations_to_api_response', 10, 3);