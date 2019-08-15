<?php
namespace Locationews;
use SimpleXMLElement;

class GPX
{
    /**
     * Just for debugging and to see that the library has been loaded correctly.
     * $response = \Locationews\GPX\debug('foobar');
     *
     * @param  string $string [description]
     * @return [type]         [description]
     */
    public static function debug( $string = '' )
    {
        return [ 'Locationews\GPX' => $string ];
    }

    /**
     * Parse GPX file contents to route waypoints
     * $response = \Locationews\GPX::parseGpxToEcmRouteWaypoints( $gpx_string );
     *
     * @param  [type]  $gpx_string          [description]
     * @param  boolean $with_waypoints_json [description]
     * @return [type]                       [description]
     */
    public static function parseGpxToEcmRouteWaypoints( $gpx_string, $with_waypoints_json = false )
    {

        $gpx = new SimpleXMLElement( $gpx_string );

        $waypoints = [];

        if ( $gpx->trk )
        {
            foreach ($gpx->trk as $track)
            {
                foreach ($track->trkseg as $segment)
                {
                    foreach ($segment->trkpt as $point)
                    {
                        $waypoints[] = [ "lat" => (double) $point['lat'], "lng" => (double) $point['lon'] ];
                    }
                }
            }
        }
        if ( $with_waypoints_json )
        {
            return json_encode( [ "waypoints" => $waypoints ] );
        }

        return $waypoints;
    }

    /**
     * Parse GPX file contents to routes and waypoints
     * $response = \Locationews\GPX::parseGpxToEcmRoutesAndWaypoints( $gpx_string );
     *
     * @param  [type]  $gpx_string          [description]
     * @param  boolean $with_waypoints_json [description]
     * @return [type]                       [description]
     */
    public static function parseGpxToEcmRoutesAndWaypoints( $gpx_string, $with_waypoints_json = false )
    {

        $gpx = new SimpleXMLElement( $gpx_string );

        $routes = [];

        if ( $gpx->trk )
        {
            foreach ($gpx->trk as $track)
            {
                $trackCoordinates = [];

                // Flatten track segments (<trkseg>) to same level
                foreach ($track->trkseg as $segment)
                {
                    foreach ($segment->trkpt as $point)
                    {
                        $trackCoordinates[] = ["lat" => (double) $point['lat'], "lng" => (double) $point['lon']];
                    }
                }

                // Store each track (<trk>) as distinct element in array
                // Format: array(0 => '"waypoints": [{"lat":12,"lng":12}, {"lat":22,"lng":22}]', 1 => '"waypoints": [{"lat":12,"lng":12}, {"lat":22,"lng":22}]')
                if ( $with_waypoints_json )
                {
                    $routes[] = json_encode( [ "waypoints" => $trackCoordinates ] );
                }
                else
                {
                    $routes[] = $trackCoordinates;
                }

            }
        }

        return $routes;
    }

}
