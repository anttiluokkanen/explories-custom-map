<?php
namespace Locationews;
use Locationews\GPX;

class WPGPX
{
    /**
     * Just for debugging and to see that the library has been loaded correctly.
     * $response = \Locationews\WP\debug('foobar');
     *
     * @param  string $string [description]
     * @return [type]         [description]
     */
    public static function debug( $string = '' )
    {
        return [ 'Locationews\WPGPX' => $string ];
    }

    /**
     * Read GPX file and pass it to the GPX library
     * $response = \Locationews\WPGPX::readGPX( $url );
     *
     * @param  [type] $url [description]
     * @return [type]        [description]
     */
    public static function readGPX( $url )
    {
        $response = wp_remote_get( $url );

        if ( ! isset( $response['response']['code'] ) || $response['response']['code'] !== 200 )
        {
            return false;
        }

        $gpx = wp_remote_retrieve_body( $response );

        if ( $gpx )
        {
            $attachment_id = attachment_url_to_postid( $url );

            if ( $attachment_id )
            {
                wp_delete_attachment( $attachment_id, false );
            }

            return \Locationews\GPX::parseGpxToEcmRouteWaypoints( $gpx );
        }

        return false;
    }

}
