<?php

/**
 * ExploriesCustomMap
 *
 * @package ExploriesCustomMap
 */

namespace ExploriesCustomMap;

use ExploriesCustomMap\Settings;
use ExploriesCustomMap\Metabox;
use ExploriesCustomMap\Categories;
use ExploriesCustomMap\CMB2;

/**
 * Bootstrap the plugin.
 *
 * Registers actions and filters required to run the plugin.
 */
function bootstrap()
{
	spl_autoload_register(__NAMESPACE__ . '\\autoload');

	add_action('init', __NAMESPACE__ . '\\ecm_init');
	add_action('init', __NAMESPACE__ . '\\ecm_rewrite', 1);
	add_action('admin_init', __NAMESPACE__ . '\\ecm_admin_init');
	add_action('admin_menu', __NAMESPACE__ . '\\add_ecm_category_menu');
	add_action('rest_api_init', __NAMESPACE__ . '\\API\\customize_rest_cors', 15);
	add_action('rest_api_init',	__NAMESPACE__ . '\\API\\register_rest_routes');
	add_action('save_post', __NAMESPACE__ . '\\API\\clear_ecm_transients', 11, 1);
	add_action('cmb2_init', __NAMESPACE__ . '\\Metabox\\ecm_meta');
	add_action('cmb2_admin_init', __NAMESPACE__ . '\\Settings\\register_settings_page');
	add_action('wp_enqueue_scripts', __NAMESPACE__ . '\\maybe_remove_googlemaps', 999);
	add_filter('script_loader_tag',	__NAMESPACE__ . '\\add_id_to_script', 10, 3);
	add_filter('upload_mimes',	__NAMESPACE__ . '\\add_custom_mime_types');
	add_filter('query_vars',	__NAMESPACE__ . '\\add_query_vars_filter');
	add_filter('redirect_canonical',	__NAMESPACE__ . '\\disable_canonical_redirect_for_front_page');
}

/**
 * Autoload classes for this namespace.
 *
 * @param string $class Class name.
 */
function autoload($class)
{
	if (strpos($class, __NAMESPACE__ . '\\') !== 0) {
		return;
	}

	$relative = strtolower(substr($class, strlen(__NAMESPACE__ . '\\')));
	$parts = explode('\\', $relative);
	$final = array_pop($parts);
	array_push($parts, 'class-' . $final . '.php');
	$path = __DIR__ . '/' . implode('/', $parts);

	require $path;
}

/**
 * Init plugin
 *
 * @return [type] [description]
 */
function ecm_init()
{
	// Register categories
	register_ecm_categories();

	// Register custom post type
	register_ecm_cpt();

	// Register image size for symbols
	register_image_size();
}

/**
 * Admin init
 *
 * @return [type] [description]
 */
function ecm_admin_init()
{
	// Register admin styles
	register_admin_styles();

	// Load admin scripts
	add_action('admin_enqueue_scripts', __NAMESPACE__ . '\\load_admin_scripts', 998);

	// Allow xml file uploads
	add_filter('upload_mimes', __NAMESPACE__ . '\\allow_upload_xml', 1, 1);

	// Filters for custom CMB2 field 'ECM Map'
	add_filter('cmb2_render_ecm_map',	__NAMESPACE__ . '\\Metabox\\render_ecm_map', 10, 5);
	add_filter('cmb2_sanitize_ecm_map', __NAMESPACE__ . '\\Metabox\\sanitize_ecm_map', 10, 4);
	add_filter('cmb2_override_meta_save',	__NAMESPACE__ . '\\Metabox\\cmb2_override_meta_save_for_field_type', 10, 4);
}

/**
 * Rewrite rules for article view
 *
 * @return [type] [description]
 */
function ecm_rewrite()
{

	$legacy_code = false;

	if (true === $legacy_code) {
		// article id / OLD logic
		add_rewrite_tag('%explories%', '([^&]+)');

		// Match the front page and pass item value as a query var.
		$frontpage = get_option('page_on_front');

		if ($frontpage !== 0) {
			add_rewrite_rule('^ecm-view/([^/]*)/?', 'index.php?page_id=' . $frontpage . '&explories=$matches[1]', 'top');
		}

		add_rewrite_rule('^(.*)/ecm-view/([^/]*)/?', 'index.php?pagename=$matches[1]&static=true&explories=$matches[2]', 'top');
	} else {

		// article id / OLD logic
		add_rewrite_tag('%explories%', '([^&]+)');

		// site name slug
		add_rewrite_tag('%explories_site_slug%', '([^&]+)');
		// article id
		add_rewrite_tag('%explories_article_id%', '([^&]+)');
		// article slug
		add_rewrite_tag('%explories_article_slug%', '([^&]+)');

		// Match the front page and pass item value as a query var.
		$frontpage = get_option('page_on_front');

		$map_page = get_option('ecm_options');
		$map_page = !empty($map_page['page_slug']) ? $map_page['page_slug'] : 'kartta';

		if ($frontpage !== 0) {
			add_rewrite_rule('^ecm-view/([^/]*)/?', 'index.php?page_id=' . $frontpage . '&explories=$matches[1]', 'top');
		}

		add_rewrite_rule('^(.*)/ecm-view/([^/]*)/?', 'index.php?pagename=$matches[1]&static=true&explories=$matches[2]', 'top');

		// site-url/map-page-slug/site-name-slug/article-id/article-title/
		add_rewrite_rule("^(.*)/{$map_page}/([^/]*)/([^/]*)/([^/]*)?", 'index.php?pagename=$matches[1]&static=true&explories_site_slug=$matches[2]&explories_article_id=$matches[3]&explories_article_slug=$matches[4]', 'top');
	}
}

/**
 * Disable canonical redirect if ECM shortcode is on front page
 *
 * @param  [type] $redirect [description]
 * @return [type]           [description]
 */
function disable_canonical_redirect_for_front_page($redirect)
{
	if (is_page() && $front_page = get_option('page_on_front')) {
		if (is_page($front_page)) {
			if (has_shortcode(get_post_field('post_content', $front_page), 'ecm-map')) {
				$redirect = false;
			}
		}
	}

	return $redirect;
}

/**
 * Register plugin styles
 *
 * @return [type] [description]
 */
function register_styles()
{
	if (!is_admin()) {
		wp_enqueue_style('ecmStyle', EXPLORIES_ECM_BASE . 'explories-custom-map/css/ecm.min.css', null, filemtime(EXPLORIES_ECM_PATH . 'explories-custom-map/css/ecm.min.css'));
	}
}

/**
 * Register plugin admin styles
 *
 * @return [type] [description]
 */
function register_admin_styles()
{
	wp_enqueue_style('ecmAdminStyle', EXPLORIES_ECM_BASE . 'explories-custom-map/css/ecm-admin.min.css', [], filemtime(EXPLORIES_ECM_PATH . 'explories-custom-map/css/ecm-admin.min.css'));
}

/**
 * Load admin scripts
 *
 * @return [type] [description]
 */
function load_admin_scripts()
{
	$post_types = is_array(get_ecm_option('post_types')) ? get_ecm_option('post_types') : [];
	if (!in_array(get_current_screen()->id, $post_types)) {
		return false;
	}

	// ECM Admin Map
	wp_enqueue_script('ecmAdminScript', EXPLORIES_ECM_BASE . 'explories-custom-map/js/ECMAdminMap.min.js', ['jquery'], filemtime(EXPLORIES_ECM_PATH . 'explories-custom-map/js/ECMAdminMap.min.js'), true);

	$google_api_key = get_ecm_option('google_maps_api_key');

	if ($google_api_key) {

		// Google Map Api with places & drawing + callback function
		// Unregister if another plugin has loaded Google library
		unregister_google_maps('maps.googleapis');

		wp_register_script('ecmGoogleMaps', 'https://maps.googleapis.com/maps/api/js?key=' . $google_api_key . '&libraries=places,drawing&callback=ECMAdminMap.init', ['ecmAdminScript'], null, true);

		wp_enqueue_script('ecmGoogleMaps');
	}

	// ddSlick
	wp_enqueue_script('ddSlick', EXPLORIES_ECM_BASE . 'assets/js/jquery.ddslick.min.js', ['jquery'], filemtime(EXPLORIES_ECM_PATH . 'assets/js/jquery.ddslick.min.js'));

	// Metabox JS
	wp_enqueue_script('ecmMetabox', EXPLORIES_ECM_BASE . 'assets/js/metabox.min.js', ['ecmAdminScript', 'ecmGoogleMaps', 'jquery', 'ddSlick'], filemtime(EXPLORIES_ECM_PATH . 'assets/js/metabox.min.js'), true);

	// Get metabox data for post
	$ecm = get_ecm_meta(get_the_ID());

	// Get available symbols
	$symbols = get_ecm_symbols(isset($ecm['symbol']) ? $ecm['symbol'] : false);

	// Get post types
	$post_types = get_ecm_option('post_types');

	// Get default location
	$default_location = get_ecm_default_location();
	list($default_lat, $default_lng) = explode(',', $default_location);

	// Default map mode marker/route
	$mode = 'marker';

	// Set data for metabox
	wp_localize_script(
		'ecmMetabox',
		'ecmWP_Metabox',
		[
			'mode' => isset($ecm['mode']) ? $ecm['mode'] : $mode,
			'zoom' => 10,
			'post_types' => $post_types,
			'symbols_text' => __('Select symbol', 'ecm'),
			'symbols' => $symbols,
			'lat' => isset($ecm['lat']) ? $ecm['lat'] : $default_lat,
			'lng' => isset($ecm['lng']) ? $ecm['lng'] : $default_lng,
		]
	);

	// Set data for map
	wp_localize_script(
		'ecmAdminScript',
		'ecmWP_AdminMap',
		[
			'lat' => isset($ecm['lat']) ? $ecm['lat'] : $default_lat,
			'lng' => isset($ecm['lng']) ? $ecm['lng'] : $default_lng,
			'mode' => isset($ecm['mode']) ? $ecm['mode'] : $mode,
			'zoom' => 10,
			'ecm' => $ecm,
		]
	);
}

/**
 * Allow xml and gpx file upload
 *
 * @param  [type] $mimes [description]
 * @return [type]        [description]
 */
function allow_upload_xml($mimes = array())
{
	$mimes = array_merge($mimes, [
		'xml' => 'application/xml',
		'gpx' => 'application/gpx'
	]);

	return $mimes;
}

/**
 * Add id to ECM script
 *
 * @param [type] $tag    [description]
 * @param [type] $handle [description]
 * @param [type] $source [description]
 */
function add_id_to_script($tag, $handle, $source)
{
	if (false !== strpos($handle, 'ecmScript')) {
		$tag = str_ireplace('<script', '<script id="ecmScript"', $tag);
	}
	return $tag;
}

/**
 * Add mime typs for XML, GPX and KML files
 *
 * @param array $mimes [description]
 */
function add_custom_mime_types($mimes)
{
	if (!isset($mimes['xml'])) {
		$mimes['xml'] = 'application/xml';
	}
	if (!isset($mimes['gpx'])) {
		$mimes['gpx'] = 'application/gpx+xml';
	}
	if (!isset($mimes['kml'])) {
		$mimes['kml'] = 'application/vnd.google-earth.kml+xml';
	}

	return $mimes;
}

function add_query_vars_filter($vars)
{
	$vars[] = 'ecmid';
	$vars[] = 'explories';
	$vars[] = 'explories_site_slug';
	$vars[] = 'explories_article_id';
	$vars[] = 'explories_article_slug';

	return $vars;
}

/**
 * Register image size for symbols
 *
 * @return [type] [description]
 */
function register_image_size()
{
	add_image_size('ecm-symbol', 64, 64);
}

/**
 * Register shortcode
 */
add_shortcode('ecm-map', __NAMESPACE__ . '\\generate_ecm_map');

/**
 * Generate map via shortcode
 *
 * @param  [type] $atts [description]
 * @return [type]       [description]
 */
function generate_ecm_map($atts)
{
	global $post;

	if (!is_singular()) {
		return '';
	}

	// Register styles
	register_styles();

	// Attributes
	$atts = shortcode_atts(
		[
			'id' 	=> '',
			'layer' => 'summer',
			'feed'	=> ''
		],
		$atts
	);

	list($lat, $lng) = explode(',', get_ecm_default_location());

	if (!empty($atts['id'])) {
		$meta = get_ecm_meta($atts['id']);

		if (!empty($meta['lat']) && !empty($meta['lng'])) {
			$lat = $meta['lat'];
			$lng = $meta['lng'];
		}
	}

	$lan = substr(get_locale(), 0, 2);

	// Frontend ECM js
	wp_enqueue_script('ecmScript', EXPLORIES_ECM_BASE . 'explories-custom-map/js/ECM.min.js', ['jquery'], filemtime(EXPLORIES_ECM_PATH . 'explories-custom-map/js/ECM.min.js'), true);

	// Frontend plugin js
	wp_enqueue_script('ecmFront', EXPLORIES_ECM_BASE . 'assets/js/front.min.js', ['ecmScript'], filemtime(EXPLORIES_ECM_PATH . 'assets/js/front.min.js'), true);

	$front = [
		'usePlugin'	=> true,
		'markers_url' => get_rest_url() . 'ecm/v1/get-markers/{lan}',
		'routes_url' => get_rest_url() . 'ecm/v1/get-routes/{lan}',
		'lan' => $lan,
		'zoom' => get_ecm_option('zoom'),
		'initmode' => get_ecm_option('mode'),
		'lat' => $lat,
		'lng' => $lng,
        'ecmUrl' => get_page_link()
	];

	wp_localize_script('ecmFront', 'ecmWP_front', $front);

	$google_api_key = get_ecm_option('google_maps_api_key');

	if ($google_api_key) {
		// Google Map Api
		// Unregister if another plugin has loaded Google library
		unregister_google_maps('maps.googleapis');

		wp_register_script('ecmGoogleMapsFront', 'https://maps.googleapis.com/maps/api/js?key=' . $google_api_key . '&callback=ECM.init', ['ecmScript'], null, true);

		wp_enqueue_script('ecmGoogleMapsFront');
	}

	$attr = '';

	$custom_theme_key = get_ecm_option('custom_theme_key');
	if (!empty($custom_theme_key)) {
		$attr .= ' data-theme-key="' . $custom_theme_key . '"';
	} else {

		$theme = get_ecm_option('theme');
		if (!empty($theme)) {
			$attr .= ' data-theme="' . $theme . '"';
		} else {
			$attr .= ' data-theme="default"';
		}
	}

	if ($lan) {
		$attr .= ' data-lan="' . $lan . '"';
	}

	$offset_top = get_ecm_option('offset_top');
	if (!empty($offset_top)) {
		$attr .= ' data-offset-top="' . $offset_top . '"';
	}

	if (isset($atts['feed'])  && !empty($atts['feed'])) {
		$attr .= ' data-feed="true"';
	}

	$explories_id = get_query_var('explories');
	if ($explories_id) {
		if (isset($meta) && $meta['target'] != '_blank') {
			$attr .= ' data-article-api-url="' . get_rest_url(null, '/ecm/v1/id/' . $explories_id) . '"';
		} else {
			$attr .= ' data-article="' . $explories_id . '"';
		}
	} else {
		$explories_id = isset($_GET['ch_explories']) ? $_GET['ch_explories'] : false;
		if ($explories_id) {
			if (isset($meta) && $meta['target'] != '_blank') {
				$attr .= ' data-article-api-url="' . get_rest_url(null, '/ecm/v1/id/' . $explories_id) . '"';
			} else {
				$attr .= ' data-article="' . $explories_id . '"';
			}
		}
	}

	return '<div id="ecm"' . $attr . '></div>';
}

/**
 * Unregister Google Maps in case some other plugin or theme has loaded it already
 *
 * @param  string $handle [description]
 * @return boolean
 */
function unregister_google_maps($handle = '')
{

	global $wp_scripts;

	foreach ($wp_scripts->registered as $script) {

		if (strpos($script->src, $handle) !== false) {
			wp_deregister_script($script->handle);
			wp_dequeue_script($script->handle);
		}
	}

	return true;
}

/**
 * Get ECM meta data for post
 *
 * @param  boolean $id Post ID
 * @return null|array
 */
function get_ecm_meta($id = false)
{

	// No id, return null
	if (!$id) {
		return null;
	}

	// If ECM is ON
	$ecm_on = get_post_meta($id, '_ecm_on', true);

	// ECM disabled, return null
	if ((int) $ecm_on !== 1) {
		return null;
	} else {

		$meta_lat = false;
		$meta_lng = false;

		// Get coordinates. Could be lat,lng or route (json collection of coordinates)
		$coordinates = trim(get_post_meta($id, '_ecm_coordinates', true));

		// If it's json, it's a route
		$waypoints = json_decode($coordinates, true);

		if ($waypoints && is_array($waypoints)) {
			$coordinates = $waypoints;
			// It's a route
			// Get first waypoint coordinates for map center
			if (isset($waypoints[0]['lat']) && isset($waypoints[0]['lng'])) {
				$meta_lat = $waypoints[0]['lat'];
				$meta_lng = $waypoints[0]['lng'];
			} else {
				$coordinates = get_ecm_default_location();
				list($meta_lat, $meta_lng) = explode(',', get_ecm_default_location());
			}
		} else {
			// It's a marker
			if (false !== strpos($coordinates, ',')) {
				list($meta_lat, $meta_lng) = explode(',', $coordinates);
			}
			if (!$meta_lat || !$meta_lng) {
				$coordinates = get_ecm_default_location();
				list($meta_lat, $meta_lng) = explode(',', get_ecm_default_location());
			}
		}

		// Categories
		$categories = get_the_terms($id, 'ecm_category');
		$categories_text = null;
		$categories_slug = null;
		$tags = [];
		if (is_array($categories)) {
			$categories_text = [];
			$categories_slug = [];
			foreach ($categories as $cat) {
				$categories_text[] = $cat->name;
				$categories_slug[] = $cat->slug;
				$tags[] = [
					'id' 	=> $cat->term_id,
					'name'	=> $cat->name,
					'icon'	=> get_term_meta($cat->term_id, 'symbol', true),

				];
			}
			$categories_text = implode(', ', $categories_text);
			$categories_slug = implode(', ', $categories_slug);
		}


		$symbol_size_ecm_symbol = wp_get_attachment_image(get_post_meta($id, '_ecm_symbol', true), 'ecm-symbol');
		if (!$symbol_size_ecm_symbol) {
			$symbol_size_ecm_symbol = wp_get_attachment_image(get_post_meta($id, '_ecm_symbol', true), [64, 64]);
		}

		$img = wp_get_attachment_image_src(get_post_meta($id, '_ecm_img_id', true), 'medium_large');

		if (!empty($coordinates)) {
			// ECM data
			return [
				'on' => 1,
				'title' => trim(get_post_meta($id, '_ecm_title', true)),
				'img' => isset($img[0]) ? $img[0] : null,
				'url' => trim(get_post_meta($id, '_ecm_url', true)),
				'target' => get_post_meta($id, '_ecm_target', true),
				'categories' => $categories,
				'categories_txt' => $categories_text,
				'categories_slug'	=> $categories_slug,
				'tags' => $tags,
				'layers' => get_post_meta($id, '_ecm_layers'),
				'mode' => get_post_meta($id, '_ecm_mode', true),
				'lat' => (float) $meta_lat,
				'lng'	=> (float) $meta_lng,
				'coordinates' => $coordinates,
				'color'	=> get_post_meta($id, '_ecm_color', true),
				'symbol' => get_post_meta($id, '_ecm_symbol', true),
				'symbol_64x64' => $symbol_size_ecm_symbol
			];
		}
	}
}

/**
 * Get available symbols
 *
 * @param  boolean $symbol_id [description]
 * @return array
 */
function get_ecm_symbols($symbol_id = false)
{

	$categories = get_terms([
		'taxonomy' => 'ecm_category',
		'hide_empty' => false,
	]);

	$symbols = [];

	if (is_array($categories)) {
		foreach ($categories as $symbol) {

			$symbols[] = [
				'text' => $symbol->name,
				'value' => $symbol->term_id,
				'selected' => $symbol_id == $symbol->term_id ? true : false,
				'imageSrc' => get_term_meta($symbol->term_id, 'symbol', true),
			];
		}
	}
	return $symbols;
}

/**
 * Get available themes
 *
 * @return array
 */
function get_available_themes()
{
	$themes = [];
	$dirs = array_filter(glob(EXPLORIES_ECM_PATH . 'explories-custom-map/themes/*'), 'is_dir');
	foreach ($dirs as $dir) {
		$dirarr = explode('/', $dir);
		$theme = end($dirarr);
		$themes[$theme] = $theme;
	}
	return $themes;
}

/**
 * Get option value
 *
 * @return array
 */
function get_ecm_option($option_name = '')
{
	return cmb2_get_option('ecm_options', $option_name, null);
}

/**
 * Get route colors
 *
 * @return array
 */
function get_ecm_route_colors()
{
	$route_colors = cmb2_get_option('ecm_options', 'route_colors', null);
	if (!$route_colors) {
		$route_colors = "#0099ff:Blue\n#cd37c1:Purple";
	}

	$colors = [];

	$route_colors = explode("\n", $route_colors);

	if (is_array($route_colors)) {
		foreach ($route_colors as $color) {
			list($code, $name) = explode(":", $color);
			$colors[$code] = $name;
		}
	} else {
		$colors['#0099ff'] = 'Default';
	}
	return $colors;
}

/**
 * Get default location from plugin options.
 *
 * @return string
 */
function get_ecm_default_location()
{
	$location = cmb2_get_option('ecm_options', 'location', null);
	list($lat, $lng) = explode(',', $location);

	if (!$lat || !$lng) {
		$location = '';
	}

	return trim($location);
}

/**
 * Register custom category
 *
 * @return [type] [description]
 */
function register_ecm_categories()
{

	$labels = [
		'name' => _x('Explories Custom Map Categories', 'Taxonomy General Name', 'ecm'),
		'singular_name' => _x('Explories Custom Map Category', 'Taxonomy Singular Name', 'ecm'),
		'menu_name' => __('Explories Custom Map Categories', 'ecm'),
		'all_items' => __('All Items', 'ecm'),
		'parent_item' => __('Parent Item', 'ecm'),
		'parent_item_colon' => __('Parent Item:', 'ecm'),
		'new_item_name' => __('New Item Name', 'ecm'),
		'add_new_item' => __('Add New Item', 'ecm'),
		'edit_item' => __('Edit Item', 'ecm'),
		'update_item' => __('Update Item', 'ecm'),
		'view_item' => __('View Item', 'ecm'),
		'separate_items_with_commas' => __('Separate items with commas', 'ecm'),
		'add_or_remove_items' => __('Add or remove items', 'ecm'),
		'choose_from_most_used' => __('Choose from the most used', 'ecm'),
		'popular_items' => __('Popular Items', 'ecm'),
		'search_items' => __('Search Items', 'ecm'),
		'not_found' => __('Not Found', 'ecm'),
		'no_terms' => __('No items', 'ecm'),
		'items_list' => __('Items list', 'ecm'),
		'items_list_navigation' => __('Items list navigation', 'ecm'),
	];
	$args = [
		'labels' => $labels,
		'hierarchical' => false,
		'public' => true,
		'show_ui' => true,
		'show_admin_column' => true,
		'show_in_nav_menus' => true,
		'show_tagcloud' => true,
		'show_in_rest' => true,
	];

	register_taxonomy(
		'ecm_category',
		'ecm',
		$args
	);
}

// Register Custom Post Type
function register_ecm_cpt()
{

	$labels = [
		'name' => _x('Map Articles', 'Post Type General Name', 'ecm'),
		'singular_name' => _x('Map Article', 'Post Type Singular Name', 'ecm'),
		'menu_name' => __('Map Articles', 'ecm'),
		'name_admin_bar' => __('Map Article', 'ecm'),
		'archives' => __('Map Article Archives', 'ecm'),
		'attributes' => __('Map Article Attributes', 'ecm'),
		'parent_item_colon' => __('Parent Item:', 'ecm'),
		'all_items' => __('All Items', 'ecm'),
		'add_new_item' => __('Add New Item', 'ecm'),
		'add_new' => __('Add New', 'ecm'),
		'new_item' => __('New Item', 'ecm'),
		'edit_item' => __('Edit Item', 'ecm'),
		'update_item' => __('Update Item', 'ecm'),
		'view_item' => __('View Item', 'ecm'),
		'view_items' => __('View Items', 'ecm'),
		'search_items' => __('Search Item', 'ecm'),
		'not_found' => __('Not found', 'ecm'),
		'not_found_in_trash' => __('Not found in Trash', 'ecm'),
		'featured_image' => __('Featured Image', 'ecm'),
		'set_featured_image' => __('Set featured image', 'ecm'),
		'remove_featured_image' => __('Remove featured image', 'ecm'),
		'use_featured_image' => __('Use as featured image', 'ecm'),
		'insert_into_item' => __('Insert into item', 'ecm'),
		'uploaded_to_this_item' => __('Uploaded to this item', 'ecm'),
		'items_list' => __('Items list', 'ecm'),
		'items_list_navigation' => __('Items list navigation', 'ecm'),
		'filter_items_list' => __('Filter items list', 'ecm'),
	];
	$args = [
		'label' => __('Map Article', 'ecm'),
		'description' => __('Explories Custom Map', 'ecm'),
		'labels' => $labels,
		'supports' => ['title', 'editor', 'thumbnail', 'comments', 'trackbacks', 'revisions', 'custom-fields', 'page-attributes', 'post-formats'],
		'taxonomies' => ['category', 'post_tag', 'ecm_category'],
		'hierarchical' => false,
		'public' => true,
		'show_ui' => true,
		'show_in_menu' => true,
		'menu_position' => 10,
		'show_in_admin_bar' => true,
		'show_in_nav_menus' => true,
		'can_export' => true,
		'has_archive' => true,
		'exclude_from_search' => false,
		'publicly_queryable' => true,
		'capability_type' => 'post',
		'show_in_rest' => true,
	];

	register_post_type('ecm', $args);
}

/**
 * Register category sub menu
 */
function add_ecm_category_menu()
{

	add_submenu_page(
		'options-general.php',
		__('Explories Custom Map Categories', 'ecm'),
		__('Explories Custom Map Categories', 'ecm'),
		'manage_options',
		'edit-tags.php?taxonomy=ecm_category',
		false
	);
}

function maybe_remove_googlemaps()
{

	global $post;

	$ecm_options = get_option('ecm_options');
	$map_page = !empty($ecm_options['page_slug']) ? $ecm_options['page_slug'] : '';

	if ($map_page != '') {

		$map_page = trim(str_replace('/', '', $map_page));
		if ($map_page == $post->post_name) {
			$google_api_key = $ecm_options['google_maps_api_key'];

			if ($google_api_key) {

				// Google Map Api
				// Unregister if another plugin has loaded Google library
				unregister_google_maps('maps.googleapis');

				wp_register_script('ecmGoogleMapsFront', 'https://maps.googleapis.com/maps/api/js?key=' . $google_api_key . '&callback=ECM.init', ['ecmScript'], null, true);

				wp_enqueue_script('ecmGoogleMapsFront');
			}
		}
	}
}
