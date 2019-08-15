/**
 * ECMAdminMap.js
 * @copyright   2019 Fakiirimedia Oy
 * @author      Hape Haavikko <hape.haavikko@fakiirimedia.com>
 * @version     x.x.x
 */

var ECMAdminMap = (function()
{
    'use strict';

    var config = {
        initLocation: {lat: parseFloat(ecmWP_AdminMap.lat), lng: parseFloat(ecmWP_AdminMap.lng)},
        mapElId: 'ecm-map',
        mapTypeId: 'roadmap',
        mapInitZoom: parseInt(ecmWP_AdminMap.zoom),
        mode: ecmWP_AdminMap.mode,
        route: null
    };

    var map;
    var mapEl;
    var mapOptions;
    var marker;
    var waypoints;
    var overlay = null;
    var mapPolyline;
    var mapPolylineBorder;
    var pacInput;

    var init = function()
    {
        mapEl = document.getElementById(config.mapElId);

        mapOptions = {
            center: config.initLocation,
            zoom: config.mapInitZoom,
            mapTypeId: config.mapTypeId,
            streetViewControl: false,
            fullscreenControl: false,
            mapTypeControl: false,
            gestureHandling: "greedy",
            disableDoubleClickZoom : true
        };

        map = new google.maps.Map(
            mapEl,
            mapOptions
        );

        $(window).keydown( function( event ) {
            if ( event.keyCode == 13 ) {
                event.preventDefault();
                return false;
            }
        });

        if (config.mode == 'marker')
        {
            if ( typeof ecmWP_AdminMap.ecm !== "undefined" && ecmWP_AdminMap.ecm !== null)
            {
                if (typeof ecmWP_AdminMap.ecm.lat !== "undefined" && typeof ecmWP_AdminMap.ecm.lng !== "undefined")
                {
                    placeMarker({lat: parseFloat(ecmWP_AdminMap.ecm.lat), lng: parseFloat(ecmWP_AdminMap.ecm.lng)});

                    if (typeof ecmWP_AdminMap.ecm.coordinates !== "undefined")
                    {
                        // Set current coordinates to hidden input
                        $("#_ecm_coordinates").val(getMarkerLocation());
                        $("#_ecm_map_placeholder code").text(getMarkerLocation());
                    }
                }
            }

            google.maps.event.addListener(map, 'click', function(event) {
                placeMarker(event.latLng);
            });

            google.maps.event.addListener(map, 'dblclick', function (event) {
                placeMarker(event.latLng);
            });

        }
        else if (config.mode == 'route')
        {
            if ( typeof ecmWP_AdminMap.ecm !== "undefined" && ecmWP_AdminMap.ecm !== null)
            {
                if (typeof ecmWP_AdminMap.ecm.mode !== "undefined" && typeof ecmWP_AdminMap.ecm.coordinates !== "undefined")
                {
                    ECMAdminMap.setConfig({
                        mode: 'route',
                        route: {
                            "polylineOptions": {
                                "strokeColor": "#0099ff",
                                "strokeOpacity": 1,
                                "strokeWeight": 5
                            },
                            "waypoints": ecmWP_AdminMap.ecm.coordinates
                        }
                    });

                    $("#_ecm_coordinates").val(JSON.stringify(ecmWP_AdminMap.ecm.coordinates,null, 0));
                    $("#_ecm_map_placeholder code").text(JSON.stringify(ecmWP_AdminMap.ecm.coordinates,null, 2));
                }
            }

            if (config.route != null)
            {
                renderPolylines(config.route);
            }

            var drawingManager = new google.maps.drawing.DrawingManager({
              drawingMode: google.maps.drawing.OverlayType.POLYLINE,
              drawingControl: true,
              drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_LEFT,
                drawingModes: ['polyline']
              }
            });

            drawingManager.addListener('overlaycomplete', function(e) {

                // Clear old overlay if exists
                if (overlay != null)
                {
                    console.log('should clear overlay');
                    overlay.setMap(null);
                    overlay = null;
                }

                overlay = e.overlay;
            });

            drawingManager.addListener('polylinecomplete', function(polyline) {

                var path = polyline.getPath().getArray();
                waypoints = [];

                for (var i in path)
                {
                    var latLng = path[i];

                    waypoints.push({
                        "lat": latLng.lat(),
                        "lng": latLng.lng()
                    });
                }

                $("#_ecm_coordinates").val(JSON.stringify(waypoints,null, 0));
                $("#_ecm_map_placeholder code").text(JSON.stringify(waypoints,null, 2));
            });

            drawingManager.setMap(map);

        }
        else
        {
            throw new Error('Invalid config.mode value. Valid values are "marker" or "route".');
        }

        setPacSearch();
    };

    var placeMarker = function(location)
    {
        if (marker)
        {
            marker.setPosition(location);
            // Set current coordinates to hidden input
            $("#_ecm_coordinates").val(getMarkerLocation());
            $("#_ecm_map_placeholder code").text(getMarkerLocation());
        }
        else
        {
            marker = new google.maps.Marker({
                position: location,
                map: map,
                draggable:true
            });
        }

        google.maps.event.addListener(marker, 'drag', function( event ) {
            $("#_ecm_coordinates").val(getMarkerLocation());
            $("#_ecm_map_placeholder code").text(getMarkerLocation());
        });
        google.maps.event.addListener(marker, 'dragend', function( event ) {
            $("#_ecm_coordinates").val(getMarkerLocation());
            $("#_ecm_map_placeholder code").text(getMarkerLocation());
        });

    };

    var renderPolylines = function(route)
    {
        var outline = new google.maps.Polyline({
          path: route.waypoints,
          geodesic: true,
          strokeColor: "#ffffff",
          strokeOpacity: 1,
          strokeWeight: 8
        });

        var polyline = new google.maps.Polyline({
          path: route.waypoints,
          geodesic: true,
          strokeColor: route.polylineOptions.strokeColor,
          strokeOpacity: route.polylineOptions.strokeOpacity,
          strokeWeight: route.polylineOptions.strokeWeight
        });

        outline.setMap(map);
        mapPolylineBorder = outline;

        polyline.setMap(map);
        mapPolyline = polyline;
    };

    /**
     * @returns {string}
     */
    var getMarkerLocation = function()
    {
        if (marker)
        {
            //console.log(marker.getPosition().lat() + ',' + marker.getPosition().lng());
            return marker.getPosition().lat() + ',' + marker.getPosition().lng();
        }
        return null;
    };

    /**
     * @returns {array}
     */
    var getRouteWaypoints = function()
    {
        return waypoints;
    };

    var setPacSearch = function()
    {
        if (document.getElementById('ecmPacInput'))
        {
            pacInput = document.getElementById('ecmPacInput');
            pacInput.value = '';
        }
        else
        {
            return;
        }

        var autocomplete = new google.maps.places.Autocomplete(pacInput);

        // A bit hackish yea, but so far the only working solution to select the first on enter
        (function pacSelectFirst(input)
        {
            // store the original event binding function
            var _addEventListener = (input.addEventListener) ? input.addEventListener : input.attachEvent;

            function addEventListenerWrapper(type, listener)
            {
                // Simulate a 'down arrow' keypress on hitting 'return' when no pac suggestion
                // is selected, and then trigger the original listener.
                if (type == "keydown")
                {
                    var orig_listener = listener;
                    listener = function (event)
                    {
                        var suggestion_selected = $(".pac-item-selected").length > 0;
                        if (event.which == 13 && !suggestion_selected)
                        {
                            var simulated_downarrow = $.Event("keydown", {keyCode:40, which:40})
                            orig_listener.apply(input, [simulated_downarrow]);
                        }

                        orig_listener.apply(input, [event]);
                    };
                }

                // add the modified listener
                _addEventListener.apply(input, [type, listener]);
            }

            if (input.addEventListener)
            {
                input.addEventListener = addEventListenerWrapper;
            }
            else if (input.attachEvent)
            {
                input.attachEvent = addEventListenerWrapper;
            }

        })(pacInput);

        autocomplete.addListener('place_changed', function() {

            var place = autocomplete.getPlace();

            if (! place.geometry)
            {
               // User entered the name of a Place that was not suggested and
               // pressed the Enter key, or the Place Details request failed.
               console.error("No details available for input: '" + place.name + "'");
               return;
            }

            map.setCenter(place.geometry.location);

            if (config.mode == 'marker')
            {
                placeMarker(place.geometry.location);
            }
      });
    };

    var setConfig = function(options)
    {
        for (var prop in options)
        {
            if (options.hasOwnProperty(prop))
            {
                config[prop] = options[prop];
            }
        }
    };

    var setMode = function(mode)
    {
        config.mode = mode;

        if (marker)
        {
          marker.setMap(null);
          marker = null;
        }

        init();
    };

    // Return public vars and methods
    return {
        init: init,
        getMarkerLocation: getMarkerLocation,
        getRouteWaypoints: getRouteWaypoints,
        setConfig: setConfig,
        setMode: setMode
    };

})();
