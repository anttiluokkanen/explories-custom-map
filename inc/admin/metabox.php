<?php
/**
 * Explories Custom Map CMB2
 *
 * @package ExploriesCustomMap
 */

namespace ExploriesCustomMap\Metabox;

use ExploriesCustomMap\CMB2;
use Locationews\WP;
use Locationews\WPGPX;
use Locationews\GPX;

/**
 * Handle CMB2 fields
 *
 * @since 0.1
 */
function ecm_meta() {

	global $post;

	/**
	 * Metabox
	 * @var [type]
	 */
	$cmb = new_cmb2_box( [
		'id'           		=> '_ecm_metabox',
		'title'        		=> __( 'Explories Custom Map', 'ecm' ),
		'object_types' 		=> \ExploriesCustomMap\get_ecm_option('post_types'),
		'priority'     		=> 'high',
	] );

	/**
	 * Map ON / OFF
	 */
	$cmb->add_field( [
		'name'      		=> __( 'Explories Custom Map', 'ecm' ),
		'id'        		=> '_ecm_on',
		'type'      		=> 'radio_inline',
		'options'			=> [
			'1'					=> 'ON',
			'0'					=> 'OFF'
		],
		'default'			=> '0',
	] );

	/**
	 * Mode
	 */
	$cmb->add_field( [
		'name'       		=> __( 'Mode', 'ecm' ),
		'id'         		=> '_ecm_mode',
		'type'       		=> 'select',
		'desc'				=> __( 'Create a marker or a route.', 'ecm' ),
		'options'	 		=> [
			'marker'			=> __('Marker', 'ecm' ),
			'route'				=> __('Route', 'ecm' )
		],
		'default'			=> 'marker',
	] );

	/**
	 * Categories
	 */
	$cmb->add_field( [
		'name'           	=> __( 'Categories', 'ecm' ),
		'id'            	=> '_ecm_categories',
		'type'           	=> 'taxonomy_multicheck_inline',
		'desc'           	=> __( 'Select categories.', 'ecm' ),
		'taxonomy'       	=> 'ecm_category',
		'query_args' 		=> [
			'orderby' 			=> 'slug',
			'exclude' 			=> [1],
		],
		'select_all_button' => false,
	] );

	/**
	 * Symbol
	 */
	$cmb->add_field( [
		'name'            	=> __( 'Symbol', 'ecm' ),
		'id'              	=> '_ecm_symbol_select',
		'type'            	=> 'select',
		'desc'				=> __( 'Select a marker symbol.', 'ecm' ),
	] );

	/**
	 * Hidden field to save symbol value
	 */
	$cmb->add_field( [
		'id'              	=> '_ecm_symbol',
		'type'            	=> 'hidden',
	] );

	/**
	 * Layers
	 */
	$cmb->add_field( [
		'name'       		=> __( 'Map Layer', 'ecm' ),
		'id'         		=> '_ecm_layers',
		'type'       		=> 'multicheck_inline',
		'desc'				=> __( 'Select map layers', 'ecm' ),
		'options'	 		=> [
			'summer'			=> __('Summer', 'ecm' ),
			'winter'			=> __('Winter', 'ecm' )
		],
		'default'			=> [ 'summer', 'winter' ],
		'select_all_button' => false
	] );

	/**
	 * Map
	 */
	$cmb->add_field( [
		'name' 				=> __( 'Map', 'ecm' ),
		'desc' 				=> __( 'Select location on map.', 'ecm' ),
		'id' 				=> '_ecm_map',
		'type' 				=> 'ecm_map',
		'split_values' 		=> false,
	] );

	/**
	 * Hidden field to store marker or route
	 */
	$cmb->add_field( [
		'id'           		=> '_ecm_coordinates',
		'type'         		=> 'hidden',
	] );

	/**
	 * Upload route
	 */
	$cmb->add_field( [
		'name'   			=> __( 'GPX-file', 'ecm' ),
		'desc'    			=> __( 'Select GPX-file', 'ecm' ),
		'id'      			=> '_ecm_gpx',
		'type'    			=> 'file',
		'options' 			=> [
			'url' 					=> true,
		],
		'text'    			=> [
			'add_upload_file_text' 	=> __( 'Select GPX-route', 'ecm' ),
		],
		'query_args' 		=> [
			'type' 					=> [
				'application/gpx',
			],
		],
		'preview_size' 		=> 'medium',
		'sanitization_cb' 	=> __NAMESPACE__ . '\\readGPX',
	] );

	/**
	 * Route color
	 */
	$cmb->add_field( [
		'name'       		=> __( 'Route Color', 'ecm' ),
		'id'         		=> '_ecm_color',
		'type'       		=> 'select',
		'desc'				=> __( 'Set route color.', 'ecm' ),
		'options'	 		=> \ExploriesCustomMap\get_ecm_route_colors()
	] );

	/**
	 * Link target
	 */
	$cmb->add_field( [
		'name'       		=> __( 'Link Target', 'ecm' ),
		'id'         		=> '_ecm_target',
		'type'       		=> 'select',
		'options'	 		=> [
			''			=> __('Default', 'ecm' ),
			'_blank'	=> __('New Tab', 'ecm' )
		],
		'default'			=> ''
	] );

	/**
     * Custom fields title
     */
    $cmb->add_field( array(
		'name' => 'Custom fields',
		'desc' => 'Following custom fields only used when not empty.',
        'type' => 'title',
        'id'   => 'custom-fields'
	) );

	/**
	 * Title
	 */
	$cmb->add_field( [
		'name'       		=> __( 'Title', 'ecm' ),
		/*'desc'				=> __( 'Custom title only used when not empty.', 'ecm' ),*/
		'id'         		=> '_ecm_title',
		'type'       		=> 'text',
		'sanitization_cb'	=> __NAMESPACE__ . '\\sanitize_text'
	] );

	/**
	 * Image
	 */
	$cmb->add_field( [
		'name'            	=> __( 'Image', 'ecm' ),
		/*'desc'				=> __( 'Custom image only used when not empty.', 'ecm' ),*/
		'id'              	=> '_ecm_img',
		'type'            	=> 'file',
		'text'				=> [
			'add_upload_file_text'	=> __( 'Select image', 'ecm' ),
		],
		// query_args are passed to wp.media's library query.
		'query_args' 		=> [
			 'type' 			=> [
			 	'image/gif',
			 	'image/jpeg',
			 	'image/png',
			 ]
		],
		'preview_size' 		=> 'medium'
	] );

	/**
	 * URL
	 */
	$cmb->add_field( [
		'name'           	=> __( 'URL', 'ecm' ),
		/*'desc'				=> __( 'Custom URL only used when not empty.', 'ecm' ),*/
		'id'              	=> '_ecm_url',
		'type'            	=> 'text_url',
		'sanitization_cb' 	=> __NAMESPACE__ . '\\sanitize_text',
	] );
}

/**
 * Gets a number of terms and displays them as options
 * @param  CMB2_Field $field
 * @return array An array of options that matches the CMB2 options array
 */
/*
function cmb2_get_term_options( $field ) {
	$args = $field->args( 'get_terms_args' );
	$args = is_array( $args ) ? $args : [];

	$args = wp_parse_args( $args, [ 'taxonomy' => 'category' ] );

	$taxonomy = $args['taxonomy'];

	$terms = (array) cmb2_utils()->wp_at_least( '4.5.0' )
		? get_terms( $args )
		: get_terms( $taxonomy, $args );

	// Initate an empty array
	$term_options = [];
	if ( ! empty( $terms ) ) {
		foreach ( $terms as $term ) {
			$term_options[ $term->term_id ] = $term->name;
		}
	}

	return $term_options;
}
*/

/**
 * Render field.
 */
function render_ecm_map( $field, $field_escaped_value, $field_object_id, $field_object_type, $field_type_object ) {

	$ecm_meta = \ExploriesCustomMap\get_ecm_meta( get_the_ID() );

	echo '<input type="hidden" name="' . $field->args( 'id' ) . '" id="' . $field->args( 'id' ) . '" value="' . esc_attr( $field_escaped_value ). '" />';
	?>
	<div class="ecm-admin-map-container">
      <div id="ecmPacCard" class="ecm-pac-card">
          <div id="ecmPacContainer">
              <input id="ecmPacInput" type="text" class="ecm-admin-pac-input" placeholder="Search for a location">
          </div>
      </div>
      <div id="ecm-map" class="ecm-admin-map"></div>
  	</div>
  	<?php
  	if ( isset( $_GET['debug'] ) ) {
	  	echo '<pre class="ecm-code ecm-debug"><code>ECM Data:' . "\n";
		echo json_encode( $ecm_meta, JSON_PRETTY_PRINT );
		echo "</code></pre>";
	}
}

/**
 * Optionally save the latitude/longitude values into two custom fields.
 */
function sanitize_ecm_map( $override_value, $value, $object_id, $field_args ) {
	if ( isset( $field_args['split_values'] ) && $field_args['split_values'] ) {
		if ( ! empty( $value['latitude'] ) ) {
			update_post_meta( $object_id, $field_args['id'] . '_latitude', $value['latitude'] );
		}
		if ( ! empty( $value['longitude'] ) ) {
			update_post_meta( $object_id, $field_args['id'] . '_longitude', $value['longitude'] );
		}
	}
	return $value;
}

/**
 * Sanitize text value
 */
function sanitize_text( $value ) {
	return trim( $value );
}

/**
 * Save coordinates
 */
function cmb2_override_meta_save_for_field_type( $value, $args, $field_args, $field ) {
	if ( $args['field_id'] == '_ecm_gpx' && ! empty( $args['value'] ) ) {
		update_post_meta( $args['id'], '_ecm_coordinates', json_encode( $args['value'] ) );
		return '';

	} else {
		return $value;
	}
}

/**
 * Read GPX string
 */
function readGPX( $value ) {
	if ( ! empty( $value ) ) {
		return \Locationews\WPGPX::readGPX( $value );
	}
}
