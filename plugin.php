<?php

/**
 * Plugin Name: Explories Custom Map
 * Plugin URI: https://explori.es
 * Description: Explories Custom Map. More info at [https://matkailukartta.fi].
 * Author: Locationews Ltd.
 * Author URI: https://explori.es
 * Requires: PHP >= 5.6, Wordpress >= 5.0
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: ecm
 * Domain Path: /languages/
 * Version: 1.1.17
 *
 * @package ExploriesCustomMap
 */

namespace ExploriesCustomMap;

/**
 * Plugin version
 */
if (!defined('EXPLORIES_ECM_VERSION')) {
    define('EXPLORIES_ECM_VERSION', '1.1.17');
}

/**
 * Plugin base URL
 */
if (!defined('EXPLORIES_ECM_BASE')) {
    define('EXPLORIES_ECM_BASE', plugin_dir_url(__FILE__));
}

/**
 * Plugin base dir path
 */
if (!defined('EXPLORIES_ECM_PATH')) {
    define('EXPLORIES_ECM_PATH', plugin_dir_path(__FILE__));
}

/**
 * Allow GPX uploads
 */
if (!defined('ALLOW_UNFILTERED_UPLOADS')) {
    define('ALLOW_UNFILTERED_UPLOADS', true);
}

/**
 * Move everything into an explore (init) function.
 */
function explore()
{
    require_once __DIR__ . '/vendor/cmb2/cmb2/init.php';
    require_once __DIR__ . '/vendor/locationews/GPX/GPX.php';
    require_once __DIR__ . '/vendor/locationews/WP/WP.php';
    require_once __DIR__ . '/vendor/locationews/WP/WPGPX.php';
    require_once __DIR__ . '/inc/ecm.php';
    require_once __DIR__ . '/inc/public/api.php';
    require_once __DIR__ . '/inc/admin/settings.php';
    require_once __DIR__ . '/inc/admin/metabox.php';

    add_action('plugins_loaded', __NAMESPACE__ . '\\bootstrap');
}

// Go explore
explore();
