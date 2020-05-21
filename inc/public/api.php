<?php
/**
 * ExploriesCustomMap API
 *
 * @package ExploriesCustomMap
 */

namespace ExploriesCustomMap\API;

use ExploriesCustomMap\CMB2;
/*
add_action('rest_api_init', function () {
    $defaultLanguage = pll_default_language();
    $languages = pll_languages_list();
    //$requestLanguage = filter_input(INPUT_GET, 'lang', FILTER_SANITIZE_STRING);
    $requestLanguage = 'fi';
    $language = in_array($requestLanguage, $languages) ? $requestLanguage : $defaultLanguage;

    PLL()->curlang = PLL()->model->get_language($language);
});
*/

function register_rest_routes() {

    register_rest_route( 'ecm/v1', '/get-routes(?:/(?P<lan>[a-zA-Z0-9-]+))?', [
        'methods' => 'GET',
        'callback' => __NAMESPACE__ . '\\get_routes',
    ] );

    register_rest_route( 'ecm/v1', '/get-markers(?:/(?P<lan>[a-zA-Z0-9-]+))?', [
        'methods' => 'GET',
        'callback' => __NAMESPACE__ . '\\get_markers',
    ] );

    register_rest_route( 'ecm/v1', '/id(?:/(?P<id>[0-9]+))?', [
        'methods' => 'GET',
        'callback' => __NAMESPACE__ . '\\get_one',
    ] );

    register_rest_route( 'ecm/v1', '/get-config(?:/(?P<lan>[a-zA-Z0-9-]+))?', [
        'methods' => 'GET',
        'callback' => __NAMESPACE__ . '\\get_config',
    ] );

}


function get_routes( \WP_REST_Request $request ) {

    $meta_add['lang'] = [];

    $lan = $request->get_param( 'lan' );
    if ( ! $lan ) {
        $lan = substr( get_locale(), 0, 2 );
    }

    $transient_field = '_ecm_routes_' . $lan;

    if ( function_exists( 'pll_current_language' ) ) {
        $meta_add['lang'] = $lan;
        //$meta_add['suppress_filters'] = false;
    } else {
        /*
        global $sitepress;
        if ( is_object( $sitepress ) ) {
            $sitepress->switch_lang( $lan );
        } else {
        }
        */
    }

    $transient_age = YEAR_IN_SECONDS;

    if ( false === ( $routes = get_transient( $transient_field ) ) ) {

        $routes = [];

        $args = [
            'post_type' => \ExploriesCustomMap\get_ecm_option('post_types'),
            'post_status' => 'publish',
            'posts_per_page' => 10000,
            'meta_query' => [
                'relation' => 'AND',
                [
                    'key' => '_ecm_on',
                    'value' => '1',
                    'compare' => '='
                ],
                [
                    'key' => '_ecm_mode',
                    'value' => 'route',
                    'compare' => '='
                ]
            ]
        ];

        $args = array_merge( $args, $meta_add );

        $posts = get_posts( $args );

        foreach ( $posts as $post ) {

            $ecm = \ExploriesCustomMap\get_ecm_meta( $post->ID );
            if ( null !== $ecm ) {
                $routes[] = set_route_data( $post->ID, $ecm );
            }

        }

        set_transient( $transient_field, $routes, $transient_age );
    }

    return $routes;
}

function get_markers( \WP_REST_Request $request ) {

    $meta_add['lang'] = [];

    $lan = $request->get_param( 'lan' );
    if ( ! $lan ) {
        $lan = substr( get_locale(), 0, 2 );
    }

    $transient_field = '_ecm_markers_' . $lan;

    if ( function_exists( 'pll_current_language' ) ) {
        $meta_add['lang'] = $lan;
        //$meta_add['suppress_filters'] = false;
    } else {
        /*
        global $sitepress;
        if ( is_object( $sitepress ) ) {
            $sitepress->switch_lang( $lan );
        } else {
        }
        */
    }

    //$transient_field = '_ecm_markers';
    $transient_age = YEAR_IN_SECONDS;

    if ( false === ( $markers = get_transient( $transient_field ) ) ) {

        $markers = [];

        $args = [
            'post_type' => \ExploriesCustomMap\get_ecm_option('post_types'),
            'post_status' => 'publish',
            'posts_per_page' => 10000,
            'meta_query' => [
                'relation' => 'AND',
                [
                    'key' => '_ecm_on',
                    'value' => '1',
                    'compare' => '='
                ],
                [
                    'key' => '_ecm_mode',
                    'value' => 'marker',
                    'compare' => '='
                ]
            ]
        ];

        $args = array_merge( $args, $meta_add );

        $posts = get_posts( $args );

        foreach ( $posts as $post ) {

            $ecm = \ExploriesCustomMap\get_ecm_meta( $post->ID );
            if ( null !== $ecm ) {
                $markers[] = set_marker_data( $post->ID, $ecm );
            }

        }

        set_transient( $transient_field, $markers, $transient_age );
    }

    return $markers;
}

function get_one( \WP_REST_Request $request ) {
    $id = $request->get_param( 'id' );
    $ecm = \ExploriesCustomMap\get_ecm_meta( $id );

    if ( $id && $ecm ) {
        if ( $ecm['mode'] == 'marker' ) {
            $response = set_marker_data( $id, $ecm );
        } elseif ( $ecm['mode'] == 'route' ) {
            $response = set_route_data( $id, $ecm );
        }

        if ( $response ) {
            $img = wp_get_attachment_image_src( get_post_meta( $id, '_ecm_img_id', true ), 'full' );
            $response['image'] = ! empty( $img ) ? $img : ( get_the_post_thumbnail_url( $id ) ? get_the_post_thumbnail_url( $id, 'full' ) : null );
            $response['content'] = apply_filters('the_content', get_post_field( 'post_content', $id ) );
            return $response;
        }

    }

    return [];

}

function get_config( \WP_REST_Request $request ) {

    $id = $request->get_param( 'id' );
    $ecm = \ExploriesCustomMap\get_ecm_meta( $id );


    $config = [
        'markers_url'   => get_rest_url() . 'ecm/v1/get-markers/' . ( ! empty( $id ) ? $id : '' ),
        'routes_url'    => get_rest_url() . 'ecm/v1/get-routes/' . ( ! empty( $id ) ? $id : '' ),
        'maptype'       => 'terrain',
        'initmode'      => (date("m") >= 11 && date("m") <= 3 ) ? 'winter' : 'summer',
    ];

    list( $config['lat'], $config['lng'] ) = explode(',', \ExploriesCustomMap\get_ecm_default_location() );

    if ( ! empty( $id ) ) {
        $meta = \ExploriesCustomMap\get_ecm_meta( $id );
        if ( ! empty( $meta['lat'] ) && ! empty( $meta['lng'] ) ) {
            $config['lat'] = $meta['lat'];
            $config['lng'] = $meta['lng'];
        }
    }

    $config['lat'] = trim( $config['lat'] );
    $config['lng'] = trim( $config['lng'] );

    $config['page_slug'] = cmb2_get_option('ecm_options', 'page_slug', null );

    return $config;
}

function set_route_data( $id = false, $ecm = [] ) {
    if ( $id && is_array( $ecm ) ) {

        return [
            'id'            => absint( $id ),
            'title'         => ! empty( $ecm['title'] ) ? $ecm['title'] : get_the_title( $id ),
            'description'   => apply_filters( 'the_excerpt', get_post_field( 'post_excerpt', $id ) ),
            'image'         => ! empty( $ecm['img'] ) ? $ecm['img'] : ( get_the_post_thumbnail_url( $id ) ? get_the_post_thumbnail_url( $id, 'medium_large' ) : null ),
            'url'           => ! empty( $ecm['url'] ) ? $ecm['url'] : get_permalink( $id ),
            'articleApiUrl' => get_rest_url(null, 'ecm/v1/id/' . absint( $id ) ),
            'slug'          => ! empty( $ecm['url'] ) ? null : get_post_field( 'post_name', $id ),
            'target'        => ! empty( $ecm['target'] ) ? $ecm['target'] : '',
            'polylineOptions' => [
                'strokeColor'   => ! empty( $ecm['color'] ) ? $ecm['color'] : '#cd37c1',
                'strokeOpacity' => 1,
                'strokeWeight'  => 5
            ],
            'tags'          => $ecm['tags'],
            'badges'        => null,
            'modes'         => isset( $ecm['layers'][0] ) ? $ecm['layers'][0] : [],
            'waypoints'     => $ecm['coordinates'],
            'icon'          => get_term_meta( $ecm['symbol'], 'symbol', true ),
            'latitude'      => floatval( $ecm['lat'] ),
            'longitude'     => floatval( $ecm['lng'] )
        ];
    }
    return null;
}

function set_marker_data( $id = false, $ecm = [] ) {
    if ( $id && is_array( $ecm ) ) {
        return [
            'id'            => absint( $id ),
            'title'         => ! empty( $ecm['title'] ) ? $ecm['title'] : get_the_title( $id ),
            'description'   => apply_filters( 'the_excerpt', get_post_field( 'post_excerpt', $id ) ),
            'image'         => ! empty( $ecm['img'] ) ? $ecm['img'] : ( get_the_post_thumbnail_url( $id ) ? get_the_post_thumbnail_url( $id, 'medium_large' ) : null ),
            'latitude'      => floatval( $ecm['lat'] ),
            'longitude'     => floatval( $ecm['lng'] ),
            'url'           => ! empty  ( $ecm['url'] ) ? $ecm['url'] : get_permalink( $id ),
            'articleApiUrl' => get_rest_url(null, 'ecm/v1/id/' . absint( $id ) ),
            'slug'          => ! empty( $ecm['url'] ) ? null : get_post_field( 'post_name', $id ),
            'target'        => ! empty( $ecm['target'] ) ? $ecm['target'] : '',
            'icon'          => get_term_meta( $ecm['symbol'], 'symbol', true ),
            'modes'         => isset( $ecm['layers'][0] ) ? $ecm['layers'][0] : [],
            'tags'          => $ecm['tags'],
        ];
    }
    return null;
}

function clear_ecm_transients( $id ) {

    if ( defined('DOING_AUTOSAVE') && DOING_AUTOSAVE )  {
        return $id;
    }

    if ( function_exists('pll_get_post_language') ) {
        $lan = pll_get_post_language( $id );
    } else {
        $lan = substr( get_locale(), 0, 2 );
    }

    if ( get_post_meta( $id, '_ecm_mode', true ) == 'marker' ) {
        delete_transient( '_ecm_markers_' . $lan );
    } elseif ( get_post_meta( $id, '_ecm_mode', true ) == 'route' ) {
        delete_transient( '_ecm_routes_' . $lan );
    }

    return $id;

}

function customize_rest_cors() {
    remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
    add_filter( 'rest_pre_serve_request', function( $value ) {
        header( 'Access-Control-Allow-Origin: *' );
        header( 'Access-Control-Allow-Methods: GET' );
        header( 'Access-Control-Allow-Credentials: true' );
        header( 'Access-Control-Expose-Headers: Link', false );
        return $value;
    } );
}
