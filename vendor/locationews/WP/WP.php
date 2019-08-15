<?php
namespace Locationews;

class WP
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
        return [ 'Locationews\WP' => $string ];
    }

}
