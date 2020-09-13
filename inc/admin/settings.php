<?php

/**
 * ExploriesCustomMap Settings
 *
 * @package ExploriesCustomMap
 */

namespace ExploriesCustomMap\Settings;

use ExploriesCustomMap\CMB2;

/**
 * Register plugin settings page
 */
function register_settings_page()
{

    /**
     * Registers options page menu item and form.
     */
    $cmb_options = new_cmb2_box([
        'id' => 'ecm_settings_metabox',
        'title' => esc_html__('Explories Custom Map', 'ecm'),
        'object_types' => ['options-page'],
        'option_key' => 'ecm_options',
        'icon_url' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAQAAABuvaSwAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAAALUAAAC1ATnQzp8AAAAHdElNRQfjAg4BEDMyy/6vAAAB2ElEQVQoz42Tz2sTcRDFP7tNi7sJSNwobRVBUon44+LFiEilUVpBEAOC/hPpoQj9CzwUFql3xYM3iwUhtGjTqx6yXpRIW3MRKipNC9pNxNQ+D9lsd1OEzpxm5n0f3+G9MQhCMMBFiio0c62ksPzkilFhHo8/RoAxAiBkKW3dfTe4ZNRoII5wnuvKf0u/4DH1AAhC6FrbW9S4bBFJW+NaVNvTqDqEQmi0tebKiQG76chVazWAC2V3qm6Mc0B9MX5XO1VlBerX7IIyMbZbuhmrM1qQZtWPLm+tT8RGCT3VKx2K9Sa0ua48min3rHVDDb3RuZ5Vy9KMSWGZJntxBZdtykxzHDPsNlmGgvkr9zECvcozTvKIS5zgPsXIpIafM38nG2EjxTQjPGGEIvOc5gFOONuglTSNrjZAhjNss8ZtarS5g0OKaJiWnwmLH3wgxT0OY1LiKEt8jRBZPvKmIlsX9F2StCvpsy5EJlOSZ1IZww7f/6Qe+Es851PYtxmDCspvhqLYeh2wSruq62EoTUeUBF56brJUZQP4y1u+UGOYYYYY4lT430nSc3g9RupTIpDc0qCO7TNSx6KrB7JoF34Q8//nrMDh7L6zCuWLHyxYvr1iVHjJ+72D/Qdasn0Szax/EgAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxOS0wMi0xNFQwMToxNjo1MS0wNTowMO0n/McAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTktMDItMTRUMDE6MTY6NTEtMDU6MDCcekR7AAAAAElFTkSuQmCC',
        'capability' => 'manage_options',
        'position' => 20,
    ]);

    /*
    * List post types
    */
    $cmb_options->add_field([
        'name' => __('Post Types', 'ecm'),
        'desc' => __('Active post types.', 'ecm'),
        'id' => 'post_types',
        'type' => 'multicheck_inline',
        'options_cb' => __NAMESPACE__ . '\\get_wp_post_types',
        'select_all_button' => false,
        'sanitization_cb' => __NAMESPACE__ . '\\set_categories_for_post_types',
        'default' => 'ecm'
    ]);

    /**
     * Google Maps API key
     */
    $cmb_options->add_field([
        'name' => __('Google Maps API Key', 'ecm'),
        'desc' => __('Set API key here.', 'ecm'),
        'id' => 'google_maps_api_key',
        'type' => 'text',
        'sanitization_cb' => __NAMESPACE__ . '\\sanitize_text',
        'default' => "",
    ]);

    /**
     * Coordinates for default location
     */
    $cmb_options->add_field([
        'name' => __('Default Location', 'ecm'),
        'desc' => __('Set default location (lat.itude,lon.gitude).', 'ecm'),
        'id' => 'location',
        'type' => 'text',
        'sanitization_cb' => __NAMESPACE__ . '\\sanitize_text',
        'default' => '',
    ]);

    /**
     * Default zoom on map
     */
    $cmb_options->add_field([
        'name' => __('Default Zoom', 'ecm'),
        'desc' => __('Set default zoom level.', 'ecm'),
        'id' => 'zoom',
        'type' => 'select',
        'default' => 10,
        'options' => range(0, 20),
    ]);

    /**
     * Default map layer
     */
    $cmb_options->add_field([
        'name' => __('Default Mode', 'ecm'),
        'desc' => __('Set default mode.', 'ecm'),
        'id' => 'mode',
        'type'  => 'select',
        'default' => 'summer',
        'options'  => [
            'summer' => 'summer',
            'winter' => 'winter'
        ]
    ]);

    /**
     * Available themes (only 'default' at the moment)
     */
    $cmb_options->add_field([
        'name' => __('Theme', 'ecm'),
        'id' => 'theme',
        'type' => 'select',
        'options' => \ExploriesCustomMap\get_available_themes(),
        'default' => 'default'
    ]);

    /**
     * Unique theme key
     */
    $cmb_options->add_field([
        'name' => __('Custom Theme Key', 'ecm'),
        'desc' => __('Set custom theme key here.', 'ecm'),
        'id' => 'custom_theme_key',
        'type' => 'text',
    ]);

    /**
     * Use different theme versions
     */
    $cmb_options->add_field([
        'name' => __('Custom Theme Version', 'ecm'),
        'desc' => __('Set theme version here.', 'ecm'),
        'id' => 'custom_theme_version',
        'type' => 'text_small',
        'default' => '1'
    ]);

    /**
     * Route colors
     */
    $cmb_options->add_field([
        'name' => __('Colors', 'ecm'),
        'description' => __('Use Hex color codes like "#000000:Black" each color on their own line.'),
        'id' => 'route_colors',
        'type'  => 'textarea_small',
        'default' => "#0099ff:Blue\n#cd37c1:Purple"
    ]);

    /**
     * Map div offset from top of the page
     */
    $cmb_options->add_field([
        'name' => __('Map Offset Top', 'ecm'),
        'description' => __('Use pixels "00px" or percents "00%".', 'ecm'),
        'id' => 'offset_top',
        'type' => 'text_small',
        'sanitization_cb' => __NAMESPACE__ . '\\sanitize_text',
        'default' => '',
    ]);

    /**
     * The map page slug
     */
    $cmb_options->add_field([
        'name' => __('Map Page Slug', 'ecm'),
        'description' => __('The page slug where the map shorcode is embedded.', 'ecm'),
        'id' => 'page_slug',
        'type' => 'text_small',
        'sanitization_cb' => __NAMESPACE__ . '\\sanitize_text',
        'default' => '',
    ]);

    /**
     * Use map cache
     */
    $cmb_options->add_field([
        'name' => __('Disable Map Cache', 'ecm'),
        'description' => __('Disables caching for routes and markers. Cache shortens load time if there is a lot of content to display.', 'ecm'),
        'id' => 'disable_map_cache',
        'type' => 'checkbox',
        'default' => false,
    ]);

    /**
     * Flushing permalinks is needed
     */
    $cmb_options->add_field(array(
        'name' => 'Flush permalinks',
        'desc' => 'Remember to flush permalinks after saving settings.',
        'type' => 'title',
        'id' => 'flush_permalinks'
    ));

    /**
     * Shortcode info box
     */
    $cmb_options->add_field([
        'name' => __('Map Shortcode', 'ecm'),
        'desc' => '[ecm-map]',
        'type' => 'title',
        'id' => 'shortcode'
    ]);

    /**
     * Shortcode info box if feed is enabled
     */
    $cmb_options->add_field([
        'name' => __('Map Shortcode with Feed Enabled', 'ecm'),
        'desc' => '[ecm-map feed="1"]',
        'type' => 'title',
        'id' => 'shortcode-feed'
    ]);

    /**
     * Categories
     */
    $cmb_options->add_field([
        'name' => __('Categories', 'ecm'),
        'desc' => ('<p><a href="' . admin_url('edit-tags.php?taxonomy=ecm_category') . '">Edit categories</a></p>'),
        'type' => 'title',
        'id' => 'categories'
    ]);

    /**
     * Metabox to add fields to categories and tags
     */
    $ecm_categories = new_cmb2_box([
        'id' => 'ecm_category_edit',
        'title' => esc_html__('ECM Category Metabox', 'ecm'),
        'object_types' => ['term'],
        'option_key' => 'ecm_categories',
        'taxonomies' => ['ecm_category'],
        'parent_slug' => 'ecm_options',
    ]);

    /**
     * Add image field to ECM categories
     */
    $ecm_categories->add_field([
        'name' => __('Symbol', 'ecm'),
        'desc' => __('Load symbol in PNG file format (64x64 pixels)', 'ecm'),
        'id' => 'symbol',
        'type' => 'file',
        'text' => [
            'add_upload_file_text' => __('Select symbol', 'ecm'),
        ],
        'query_args' => [
            'type' => [
                'image/png',
            ]
        ],
        'preview_size' => 'medium'
    ]);
}

/**
 * Get post types
 *
 * @return [type] [description]
 */
function get_wp_post_types()
{

    $post_types = [];

    $post_types['ecm'] = __('Map Articles', 'ecm');

    foreach (get_post_types([
        'public' => true,
        'show_ui' => true,
    ], 'names') as $post_type) {
        if ($post_type != 'attachment' && $post_type != 'ecm') {
            $post_types[$post_type] = ucfirst($post_type);
        }
    }

    return $post_types;
}
