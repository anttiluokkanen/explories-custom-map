/**
 * ECM.js
 * @copyright   2018 Fakiirimedia Oy
 * @author      Hape Haavikko <hape.haavikko@fakiirimedia.com>
 * @version     1.2.6
 */
var ECM = (function($)
{
    'use strict';

    var scriptEl = document.getElementById('ecmScript');
    var dirPath = scriptEl.src.replace(/js\/(ECM.js|ECM.min.js).*$/, '');
    var pluginPath = scriptEl.src.replace(/explories-custom-map\/js\/(ECM.js|ECM.min.js).*$/, '');
    var ecmEl = document.getElementById('ecm');
    var theme = 'default';
    var themePath = dirPath + 'themes/' + theme + '/';
    var themeCssPath = themePath + theme + '.css';
    var themeConfigPath = themePath + 'config.js';
    var themeMapClusterPath = themePath + 'images/map-cluster.svg';
    var themeDefaultImgPath = themePath + 'images/default-img.jpg';
    var mode;
    var markersJSON;
    var routesJSON;
    var externalMarkersJSON = {};
    var externalRoutesJSON = {};
    var jqxhrExternalMarkers = [];
    var map;
    var mapEl;
    var mapOptions;
    var infoWindow;
    var directionsServices = [];
    var directionsRenderers = [];
    var markers = [];
    var externalMarkers = {};
    var markerClusterer = null;
    var routes = [];
    var mapPolylines = [];
    var mapPolylineBorders = [];
    var mapExternalPolylines = [];
    var mapExternalPolylineBorders = [];
    var layers = [];
    var tags = [];
    var badges = [];
    var filters = null;
    var userPos;
    var userPosTimeout;
    var userMarker;
    var followUser;

    var externalFiles = {
        ecmMarkerClusterer:  {
            id: 'ecmMarkerClusterer',
            file: dirPath + 'vendor/markerclusterer-1.0.1/markerclusterer.min.js',
            elType: 'script',
            loaded: false
        }
    };

    // General configuration. These can be overwritten in theme config.js!
    var config = {
        markersUrl: 'markers.json',
        routesUrl: 'routes.json',
        lan: 'fi',
        initLocation: {
            lat: 60.169872,
            lng: 24.938099
        },
        cardDefaultImg: themeDefaultImgPath,
        externalMarkers: null,
        mapDefaultTravelMode: 'WALKING',
        mapInitZoom: 10,
        mapMinZoom: 0,
        mapMaxZoom: 21,
        mapLayers: null,
        mapTypeId: 'terrain',
        mapTypes: [
            'roadmap',
            'satellite',
            'hybrid',
            'terrain'
        ],
        mapRouteMarkersThreshold: 12,
        modes: null,
        offsetTop: 'auto',
        offsetTopSel: 'header',
        showBadgeFilters: true,
        showMapFeedToggle: true,
        showModeButtons: true,
        showPrint: false,
        showTagFilters: true,
        showTypeFilters: true,
        usePlugin: false,
        userPosInterval: 5000
    };

    var texts = {
        en: {
            badgeFiltersLegend: 'Badges',
            hybrid: 'Hybrid',
            mapLayers: 'Map layers',
            mapType: 'Map type',
            mapZoom: 'Map zoom',
            marker: 'Marker',
            myLocation: 'My location',
            myLocationShow: 'Show my location',
            myLocationCenter: 'Center my location on map',
            roadmap: 'Roadmap',
            route: 'Route',
            satellite: 'Satellite',
            shareArticle: 'Share article',
            tagFiltersLegend: 'Category',
            toggleTags: 'Toggle all',
            typeFiltersLegend: 'Type',
            terrain: 'Terrain'
        },
        fi: {
            badgeFiltersLegend: 'Badges',
            hybrid: 'Hybridi',
            mapLayers: 'Karttatasot',
            mapType: 'Kartan tyyppi',
            mapZoom: 'Kartan zoomaus',
            marker: 'Kohde',
            myLocation: 'Oma sijainti',
            myLocationShow: 'Näytä sijaintini kartalla',
            myLocationCenter: 'Keskitä kartta sijaintini mukaan',
            roadmap: 'Tiekartta',
            route: 'Reitti',
            satellite: 'Satelliitti',
            shareArticle: 'Jaa artikkeli',
            tagFiltersLegend: 'Kategoria',
            toggleTags: 'Valitse kaikki',
            typeFiltersLegend: 'Tyyppi',
            terrain: 'Maastokartta'
        }
    };

    var types = {
        markers: {
            id: 1,
            name: "marker",
            show: true
        },
        routes: {
            id: 2,
            name: "route",
            show: true
        }
    };

    var init = function()
    {
        // Append div for map
        var el = document.createElement('div');
        el.id = 'ecmMap';
        document.getElementById('ecm').appendChild(el);

        // jQuery required
        if (typeof jQuery === 'undefined')
        {
            throw new Error('ECM requires jQuery');
        }

        // Add SVGInjector to external files if not already included
        if (typeof SVGInjector === 'undefined')
        {
            externalFiles.ecmSVGi = {
                id: 'ecmSVGi',
                file: dirPath + 'vendor/svg-injector-1.1.3/dist/svg-injector.min.js',
                elType: 'script',
                loaded: false
            };
        }

        // Set lan from data attribute
        if (ecmEl.getAttribute('data-lan'))
        {
            config.lan = ecmEl.getAttribute('data-lan');
        }

        // Check for custom theme
        if (ecmEl.getAttribute('data-theme'))
        {
            theme = ecmEl.getAttribute('data-theme');
            themePath = dirPath + 'themes/' + theme +  '/';
            themeCssPath =  themePath + theme + '.css';
            themeConfigPath = themePath + 'config.js';
            themeMapClusterPath = themePath + 'images/map-cluster.svg';
        }
        else if (ecmEl.getAttribute('data-theme-key'))
        {
            var themeKey = ecmEl.getAttribute('data-theme-key');
            themePath = 'https://ecm.explories.net/themes/';
            themeCssPath = themePath + '?key=' + themeKey + '&type=css';
            themeConfigPath = themePath + '?key=' + themeKey +  '&type=config';
            themeMapClusterPath = themePath + '?key=' + themeKey +  '&type=mapCluster';
        }

        // Add theme CSS to external files list
        externalFiles.ecmThemeCss = {
            id: 'ecmThemeCss',
            file: themeCssPath,
            elType: 'link',
            loaded: false
        };

        // Add theme config to external files list
        externalFiles.ecmThemeConfig = {
            id: 'ecmThemeConfig',
            file: themeConfigPath,
            elType: 'script',
            loaded: false
        };

        loadExternals();

        // Test
        /*navigator.permissions.query({name:'geolocation'}).then(function(result) {
            if (result.state == 'granted') {

            } else if (result.state == 'prompt') {

            } else if (result.state == 'denied') {

            }
            result.onchange = function() {
                console.log(result.state);
            }
        });*/
        // /Test
    };

    /**
     * Loads external files defined in externalFiles object.
     * Calls setLoaded on each file load complete.
     */
    var loadExternals = function()
    {
        if (Object.keys(externalFiles).length == 0)
        {
            // Nothing to load
            return;
        }

        for (var propName in externalFiles)
        {
            if (externalFiles.hasOwnProperty(propName))
            {
                var loadObj = externalFiles[propName];
                var el;

                // Don't load the same twice...
                if ($("#"+propName).length > 0)
                {
                    continue;
                }

                if (loadObj.elType == 'script')
                {
                    el = document.createElement('script');
                    el.id = propName;
                    el.src = loadObj.file;
                    document.body.appendChild(el);
                }
                else if (loadObj.elType == 'link')
                {
                    el = document.createElement('link');
                    el.id = propName;
                    el.href = loadObj.file;
                    el.rel = 'stylesheet';
                    document.body.appendChild(el);
                }

                el.onload = function() {
                    setLoaded(this.id);
                };
            }
        }
    };

    /**
     * Sets
     */
    var setLoaded = function(loadedId)
    {
        externalFiles[loadedId].loaded = true;

        //console.log(loadedId + ' loaded');

        // Load plugin config after theme config if plugin in use
        if (loadedId == 'ecmThemeConfig' && config.usePlugin == true)
        {
            //console.log('Load ' + pluginPath + 'assets/js/front.js');
            // Add plugin config to external files list
            externalFiles.ecmPluginConfig = {
                id: 'ecmPluginConfig',
                file: pluginPath + 'assets/js/front.js',
                elType: 'script',
                loaded: false
            };
            loadExternals();
        }

        for (var propName in externalFiles)
        {
            if (externalFiles.hasOwnProperty(propName))
            {
                if (! externalFiles[propName].loaded)
                {
                    //console.log(propName + ' not loaded');
                    return false;
                }
            }
        }

        mode = config.initMode;

        // Set offset top from element data attribute if defined
        if (ecmEl.getAttribute('data-offset-top'))
        {
            ecmEl.style.top = ecmEl.getAttribute('data-offset-top');
            config.offsetTop = ecmEl.getAttribute('data-offset-top');
        }
        else if (config.offsetTop == 'auto' && config.offsetTopSel != null)
        {
            autoOffsetTop();

            $(window).resize(function() {
                autoOffsetTop();
            });
        }
        else if (config.offsetTop != null)
        {
            document.getElementById('ecm').style.top = config.offsetTop;
        }

        // All external stuff should be loaded now
        // Set data from localStorage if exists
        if (hasLocalStorage)
        {
            // Set location only if both latitude and longitude exist
            if (localStorage.getItem('lat') && localStorage.getItem('lng'))
            {
                config.initLocation.lat = parseFloat(localStorage.getItem('lat'));
                config.initLocation.lng = parseFloat(localStorage.getItem('lng'));
            }

            // Set map initial zoom level
            if (localStorage.getItem('mapInitZoom'))
            {
                config.mapInitZoom = parseInt(localStorage.getItem('mapInitZoom'));
            }

            // Set types
            if (localStorage.getItem('types'))
            {
                types = JSON.parse(localStorage.getItem('types'));
            }

            // Set map type
            // Satellite and hybrid map type fail on init most of the time :/
            /*if (localStorage.getItem('mapTypeId'))
            {
                config.mapTypeId = localStorage.getItem('mapTypeId');
            }*/
        }

        setMap();
        return true;
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

        if (config.markersUrl)
        {
            config.markersUrl = config.markersUrl.replace('{lan}', config.lan);
        }

        if (config.routesUrl)
        {
            config.routesUrl = config.routesUrl.replace('{lan}', config.lan);
        }
    };

    var setTexts = function(options)
    {
        // Loop through lans in options and merge options[lan] with texts[lan]
        for (var lan in options)
        {
            if (options.hasOwnProperty(lan))
            {
                var propNames = Object.getOwnPropertyNames(options[lan]);

                for (var i = 0; i < propNames.length; i++)
                {
                    texts[lan][propNames[i]] = options[lan][propNames[i]];
                }
            }
        }
    };

    var setMap = function()
    {
        mapEl = document.getElementById('ecmMap');

        mapOptions = {
            center: config.initLocation,
            zoom: config.mapInitZoom,
            minZoom: config.mapMinZoom,
            maxZoom: config.mapMaxZoom,
            zoomControl: false,
            mapTypeId: config.mapTypeId,
            streetViewControl: false,
            fullscreenControl: false,
            mapTypeControl: false,
            gestureHandling: "greedy",
            styles: config.modes[config.initMode].styles
        };

        map = new google.maps.Map(
            mapEl,
            mapOptions
        );

        infoWindow = new google.maps.InfoWindow({
          maxWidth: 320,
          content: ''
        });

        map.addListener('zoom_changed', function() {
            //console.log('ne: ' + map.getBounds().getNorthEast());
            //console.log('sw: ' + map.getBounds().getSouthWest());
            setRouteMarkers();
            $("#zoom").val( map.getZoom() );
            $("#zoomVal").text( map.getZoom() );
            setMapLayersEnabled();
            // Set new zoom to localStorage
            if (hasLocalStorage)
            {
                localStorage.setItem('mapInitZoom', map.getZoom());
            }
        });

        map.addListener('idle', function() {
            // Reload external markers with reloadOnBoundsChange
            for (var key in config.externalMarkers)
            {
                if (config.externalMarkers.hasOwnProperty(key))
                {
                    if (config.externalMarkers[key].reloadOnBoundsChange && $("#" + key).prop("checked"))
                    {
                        $("#" + key).trigger("change");
                    }
                }
            }
            // Set new location to localStorage
            if (hasLocalStorage)
            {
                localStorage.setItem('lat', map.getCenter().lat());
                localStorage.setItem('lng', map.getCenter().lng());
            }
        });

        map.addListener('click', function(e) {
            infoWindow.close();
        });

        // Extend Google Maps LatLng prototype
        google.maps.LatLng.prototype.kmTo = function(a) {
            var e = Math, ra = e.PI/180;
            var b = this.lat() * ra, c = a.lat() * ra, d = b - c;
            var g = this.lng() * ra - a.lng() * ra;
            var f = 2 * e.asin(e.sqrt(e.pow(e.sin(d/2), 2) + e.cos(b) * e.cos
            (c) * e.pow(e.sin(g/2), 2)));
            return f * 6378.137;
        };

        // Extend Google Maps Polyline prototype
        google.maps.Polyline.prototype.getLengthInMeters = function(n) {
            var a = this.getPath(n), len = a.getLength(), dist = 0;
            for (var i=0; i < len-1; i++) {
                dist += a.getAt(i).kmTo(a.getAt(i+1));
            }
            return dist * 1000;
        };

        //getUserLocation();
        // Don't start to load stuff etc. until the map is ready
        // This is because map bounds might be needed in content loading
        google.maps.event.addListenerOnce(map, 'idle', function() {
            createModeButtons();
            loadMarkers();
            loadRoutes();
        });
    };

    /**
     *
     */
    var getUserLocation = function()
    {
        if (! navigator.geolocation)
        {
            console.error('Unable to get user location because geolocation is not supported by browser.');
            return;
        }

        if (userPos)
        {
            console.log('User location set already');
            return;
        }

        $("#myLocationBtn").prop("disabled", true);
        $("#myLocationBtn").addClass("ecm-btn-loading");

        navigator.geolocation.getCurrentPosition(function(position) {
            userPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            //console.log('User pos: ' + userPos.lat + ', ' + userPos.lng);
            //console.log('User in bounds: ' + map.getBounds().contains(userPos));

            userMarker = new google.maps.Marker({
                position: userPos,
                map: map,
                optimized: false,
                icon: {
                    path: 'M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0',
                    fillColor: "#06c",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#ffffff",
                    scale: 0.4
                },
                title: 'Your location'
            });

            // Zoom oout if user is not in bounds
            if (! map.getBounds().contains(userPos))
            {
                zoomUserToBounds();
            }

            $("#followUserCB").parent().show();
            //$("#permissionsCB").parent().show();

            // Timeout for updating user position
            userPosTimeout = setTimeout(updateUserLocation, config.userPosInterval);

            // Hide settings get user location button
            $("#myLocationBtn").removeClass("ecm-btn-loading");
            $("#myLocationBtn").hide();

        }, function() {
            $("#myLocationBtn").removeClass("ecm-btn-loading");
            $("#myLocationBtn").prop("disabled", false);
            console.error('Getting user location failed.');
        });
    };

    /**
     *
     */
    var updateUserLocation = function()
    {
        navigator.geolocation.getCurrentPosition(function(position) {
            userPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            //console.log('User pos updated: ' + userPos.lat + ', ' + userPos.lng);

            // Move marker to new position
            userMarker.setPosition(userPos);

            // Pan map if needed
            if (followUser)
            {
                map.panTo(userPos);
            }

            userPosTimeout = setTimeout(updateUserLocation, config.userPosInterval);
        }, function() {
            console.error('Updating user location failed.');
        });
    };

    /*
     *
     */
    var loadMarkers = function()
    {
        showLoader();

        // No markersUrl set
        if (config.markersUrl === null)
        {
            markersJSON = [];
            if (Array.isArray(routesJSON))
            {
                allLoaded();
            }
            return;
        }

        var jqxhr = $.getJSON(config.markersUrl);

        jqxhr.done(function(data) {
            markersJSON = data;
            setMarkers();
            setFiltersData(markersJSON);
            if (Array.isArray(routesJSON))
            {
                allLoaded();
            }
        });

        jqxhr.fail(function(jqxhr, textStatus, error) {
            console.error("Loading markers failed: " + textStatus + ", " + error);
        });
    };

    /**
     * @param   {string}    name    mapLayer index in config.mapLayers
     */
    var loadExternalMarkers = function(name)
    {
        var $cbGroup = $("#" + name).parent();
        $cbGroup.addClass("loading");

        var bounds = map.getBounds();
        var url = config.externalMarkers[name].url;
        var currentLat = config.initLocation.lat;
        var currentLng = config.initLocation.lat;

        if (map.getCenter().lat())
        {
            currentLat = map.getCenter().lat();
            currentLng = map.getCenter().lng();
        }

        url = url.replace('{lat}', currentLat);
        url = url.replace('{lng}', currentLng);
        url = url.replace('{north}', bounds.getNorthEast().lat());
        url = url.replace('{east}', bounds.getNorthEast().lng());
        url = url.replace('{south}', bounds.getSouthWest().lat());
        url = url.replace('{west}', bounds.getSouthWest().lng());

        // Abort previous request for same type if exists
        if (jqxhrExternalMarkers[name])
        {
            jqxhrExternalMarkers[name].abort();
        }

        jqxhrExternalMarkers[name] = $.getJSON(url);

        jqxhrExternalMarkers[name].done(function(data) {
            $cbGroup.removeClass("loading");
            var callbackName = config.externalMarkers[name].callbackName;
            window['ECM'][callbackName].call(this, data, name);
        });

        jqxhrExternalMarkers[name].fail(function(jqxhr, textStatus, error) {
            if (error != 'abort') {
                console.error("Loading " + name + " failed: " + textStatus + ", " + error);
            }
        });
    };

    var clearExternalMarkers = function(name)
    {
        delete externalMarkersJSON[name];
        externalMarkers[name] = clearMarkers(externalMarkers[name]);
        delete externalMarkers[name];
        setMarkerClusterer();

        delete externalRoutesJSON[name];
        clearExternalRoutes(name);

        if ($(".ecm-feed").length > 0)
        {
            toggleFeed(false);
            toggleFeed(true);
        }
    };

    /*
     *
     */
    var loadRoutes = function()
    {
        showLoader();

        // No routesUrl set
        if (config.routesUrl === null)
        {
            routesJSON = [];
            if (Array.isArray(markersJSON))
            {
                allLoaded();
            }
            return;
        }

        var jqxhr = $.getJSON(config.routesUrl);

        jqxhr.done(function(data) {
            routesJSON = data;
            for (var i in routesJSON)
            {
                if (notEmpty(routesJSON[i]))
                {
                    if (routesJSON[i].travelMode)
                    {
                        var routeOptions = route2RouteOptions(routesJSON[i]);
                        setRouteDirections(i, routeOptions, routesJSON[i].polylineOptions);
                    }
                    else
                    {
                        renderSimplePolylines(i);
                    }
                }
                else
                {
                    // Remove empty route
                    routesJSON.splice(i, 1);
                }
            }

            setFiltersData(routesJSON);
            if (Array.isArray(markersJSON))
            {
                allLoaded();
            }
        });

        jqxhr.fail(function(jqxhr, textStatus, error) {
            console.error("Loading routes failed: " + textStatus + ", " + error);
        });
    };

    /*
     *
     */
    var allLoaded = function()
    {
        setRoutes();
        createMapControls();
        createSettings();
        injectIcons();

        if (ecmEl.getAttribute('data-feed'))
        {
            // Show settings if in feed mode
            $("#ecmSettingsBtn").trigger('click');
            // And switch to feed
            $("#feedCB").trigger('click');
        }
        else if ($(window).width() > 768)
        {
            // Show settings on desktop width
            $("#ecmSettingsBtn").trigger('click');
        }

        if (ecmEl.getAttribute('data-article'))
        {
            openArticle(ecmEl.getAttribute('data-article'));
        }

        removeLoader();
    };

    /**
     * Gets all tags and badges from all markers and routes and sets them to
     * tags and badges arrays for creating filters ui.
     *
     * @param   {Array}     arr
     */
    var setFiltersData = function(arr)
    {
        for (var i = 0; i < arr.length; i++)
        {
            // Tags
            if (arr[i].tags && arr[i].tags != null)
            {
                for (var j = 0; j < arr[i].tags.length; j++)
                {
                    //var checkTagId = obj => obj.id === arr[i].tags[j].id;
                    var checkTagId = function checkTagId(obj) {
                        return obj.id === arr[i].tags[j].id;
                    };
                    // Add to tags only if doesn't exist already
                    if (! tags.some(checkTagId))
                    {
                        tags.push(arr[i].tags[j]);
                    }
                }
            }

            // Badges
            if (arr[i].badges && arr[i].badges != null)
            {
                for (var k = 0; k < arr[i].badges.length; k++)
                {
                    //var checkBadgeId = obj => obj.id === arr[i].badges[k].id;
                    var checkBadgeId = function checkTagId(obj) {
                        return obj.id === arr[i].tags[k].id;
                    };
                    // Add to badges only if doesn't exist already
                    if (! badges.some(checkBadgeId))
                    {
                        badges.push(arr[i].badges[k]);
                    }
                }
            }
        }
    };

    /**
     * Clears map markers in given array and returns empty array.
     *
     * @param   {array}     markers
     *
     * @return  {array}
     */
    /*var clearMarkers = function()
    {
        if (Array.isArray(markers))
        {
            for (var i = 0; i < markers.length; i++)
            {
                markers[i].setMap(null);
            }
        }
        return [];
    };*/
    var clearMarkers = function(arr)
    {
        if (Array.isArray(arr))
        {
            for (var i = 0; i < arr.length; i++)
            {
                arr[i].setMap(null);
            }
        }
        return [];
    };

    var setMarkers = function()
    {
        markers = clearMarkers(markers);

        if (! types.markers.show)
        {
            return;
        }

        for (var i in markersJSON)
        {
            // Check mode first
            if (! hasMode(markersJSON[i]))
            {
                continue;
            }

            if (filters !== null && ! matchesFilters(markersJSON[i]))
            {
                continue;
            }

            var latLng = {
                lat: markersJSON[i].latitude,
                lng: markersJSON[i].longitude
            };

            // Make relative paths absolute
            if (! isURL(markersJSON[i].icon))
            {
                markersJSON[i].icon = dirPath + markersJSON[i].icon;
            }

            var markerIcon = new google.maps.MarkerImage(markersJSON[i].icon, null, null, null, new google.maps.Size(32,32));

            var marker = new google.maps.Marker({
                index: parseInt(i),
                id: markersJSON[i].id,
                position: latLng,
                map: map,
                icon: markerIcon,
                optimized: true
            });

            marker.addListener('click', function() {
                //infoWindow.setContent(parseInfoWindowContent(markersJSON[this.index]));
                infoWindow.setContent(createCard(markersJSON[this.index]));
                infoWindow.open(map, this);

                // TEST
                /*var $iw = $('<div class="ecm-infowindow"></div>');
                $iw.append(createCard(markersJSON[this.index]));
                $("#ecm").append($iw);*/
                // /TEST
            });

            markers.push(marker);
        }

        setMarkerClusterer();
    };

    var setExternalMarkers = function(name)
    {
        externalMarkers[name] = [];

        for (var i = 0; i < externalMarkersJSON[name].length; i++)
        {
            var markerObj = externalMarkersJSON[name][i];
            var iconW = config.externalMarkers[name].iconW;
            var iconH = config.externalMarkers[name].iconH;

            var latLng = {
                lat: markerObj.latitude,
                lng: markerObj.longitude
            };

            var iconSize = new google.maps.Size(iconW, iconH);

            if (typeof iconW === "undefined" || typeof iconH === "undefined" || iconW == null || iconH == null)
            {
                iconSize = null;
            }

            //var markerIcon = new google.maps.MarkerImage(markerObj.icon, null, null, null, new google.maps.Size(iconW, iconH));
            var markerIcon = new google.maps.MarkerImage(markerObj.icon, null, null, null, iconSize);

            var marker = new google.maps.Marker({
                index: parseInt(i),
                external: true,
                id: markerObj.id,
                name: markerObj.name,
                position: latLng,
                map: map,
                icon: markerIcon,
                optimized: true
            });

            marker.addListener('click', function() {
                infoWindow.setContent(createCard(externalMarkersJSON[name][this.index]));
                infoWindow.open(map, this);
            });

            externalMarkers[name].push(marker);
        }

        setMarkerClusterer();

        if ($(".ecm-feed").length > 0)
        {
            toggleFeed(false);
            toggleFeed(true);
        }
    };

    /**
     * Sets up MarkerClusterer for overlapping markers.
     */
    var setMarkerClusterer = function()
    {
        if (markerClusterer !== null)
        {
            markerClusterer.clearMarkers();
        }

        var clusterStyles = [
            {
                textColor: 'white',
                url: themeMapClusterPath,
                width: 32,
                height: 32
            }
        ];

        var markerClustererOptions = {
            gridSize: 56,
            zoomOnClick: false,
            styles: clusterStyles
        };

        var allExternalMarkers = getAllExternalMarkers();

        try
        {
            //markerClusterer = new MarkerClusterer(map, markers, markerClustererOptions);
            markerClusterer = new MarkerClusterer(map, markers.concat(allExternalMarkers), markerClustererOptions);
        }
        catch(e)
        {
            /*Modal.openModal({
                title: 'Error',
                body: 'Unable to load MarkerClusterer. If you are using private browsing please disable it.',
                buttons: []
            });*/

            throw new Error('MarkerClusterer is undefined. Probably caused by private browsing mode.');
        }

        // Cluster click event listener
        google.maps.event.addListener(markerClusterer, 'clusterclick', function(cluster) {
            //console.log('Cluster click');
            openCluster(cluster.getMarkers());
        });
    };

    /**
     * @param   {Array} clusterMarkers
     */
    var openCluster = function(clusterMarkers)
    {
        var $cardsContainer = $('<div class="ecm-cards-container"></div>');

        // Close cluster by clicking the background overlay
        $cardsContainer.click(function() {
            $cardsContainer.remove();
            $("#ecmSettingsBtn").show();
        });

        var $closeBtn = ecmUIButton({
            icon: 'icon-close.svg',
            name: 'close',
            onClick: function() {
                $cardsContainer.remove();
                $("#ecmSettingsBtn").show();
            },
            size: 32
        });

        var $cards = $('<div class="ecm-cards"></div>');

        for (var i = 0; i < clusterMarkers.length; i++)
        {
            var markerIndex = clusterMarkers[i].index;
            var marker = markersJSON[markerIndex];

            // Check if marker is external
            if (clusterMarkers[i].external)
            {
                marker = externalMarkersJSON[clusterMarkers[i].name][markerIndex];
            }

            //console.log(marker);
            $cards.append(createCard(marker));
        }

        // To prevent click on card closing the cluster
        $cards.find(".ecm-card").click(function(e) {
            e.stopPropagation();
        });

        $cardsContainer.append($closeBtn);
        $cardsContainer.append($cards);
        $("#ecm").append($cardsContainer);
        injectIcons();
        $("#ecmSettingsBtn").hide();
    };

    /**
     * Opens an Explories article in ECM article view
     *
     * @param   {int}   articleId
     */
    var openArticle = function(articleId)
    {
        var $articleContainer = $('\
        <div class="ecm-article-container">\
            <div class="ecm-article">\
                <div class="ecm-loader"></div>\
            </div>\
        </div>');

        var $closeBtn = ecmUIButton({
            icon: 'icon-close.svg',
            name: 'close-article',
            size: 48
        });

        $closeBtn.css("top", $("#ecm").css("top"));
        $articleContainer.prepend($closeBtn);

        $articleContainer.click(closeArticle);

        $("#ecm").append($articleContainer);

        injectIcons();

        var jqxhr = $.getJSON('https://explori.es/api/news/' + articleId);

        jqxhr.done(function(article) {
            //console.log(article);
            var $logo = $('<div class="ecm-article-logo"></div>');
            var $img = $('<div class="ecm-article-img"></div>');
            var $caption = $('<div class="ecm-article-img-caption"></div>');
            var $h1 = $('<h1>' + article.title + '</h1>');
            var $body = $('<div class="ecm-article-body">' + article.text + '</div>');

            // Add publication logo if exists
            if (notEmpty(article.publication.image))
            {
                $logo.css("background-image", "url('" + article.publication.image + "')");

                if (notEmpty(article.publication.themeColor))
                {
                    $logo.css("background-color", article.publication.themeColor);
                }

                $(".ecm-article").append($logo);
            }

            // Add caption if exists
            if (notEmpty(article.caption))
            {
                $caption.append('<p>' + article.caption + '</p>');
                $img.append($caption);
            }

            // Add article main image if exists
            if (typeof article.images !== 'undefined' && notEmpty(article.images.large))
            {
                $img.css("background-image", "url('" + article.images.large + "')");
                $(".ecm-article").append($img);
            }
            else if (notEmpty(article.image))
            {
                $img.css("background-image", "url('" + article.image + "')");
                $(".ecm-article").append($img);
            }

            $body.prepend($h1);

            var $articleInfo = $('<div class="ecm-article-info"></div>');
            var authorName = '';

            // Set authors
            if (notEmpty(article.authors))
            {
                authorName = article.authors;
            }
            else if (notEmpty(article.user.name))
            {
                authorName = article.user.name;
            }

            $articleInfo.append('<p class="ecm-article-author">' + authorName + '</p>');
            $articleInfo.append('<p class="ecm-article-datetime">' + formatDateTime(article.published) + '</p>');
            $body.prepend($articleInfo);

            $articleContainer.find(".ecm-article").append($body);

            // To prevent click on article closing it
            $(".ecm-article").click(function(e) {
                e.stopPropagation();
            });

            // Set title?
            // TO DO

            // Add share links
            var $shareUl = $('\
            <ul class="ecm-share">\
                <li><a href="#" class="ecm-icon-facebook" target="_blank"><span class="sr-only">Share on Facebook</span></a></li>\
                <li><a href="#" class="ecm-icon-twitter" target="_blank"><span class="sr-only">Share on Twitter</span></a></li>\
                <li><a href="#" class="ecm-icon-linkedin" target="_blank"><span class="sr-only">Share on LinkedIn</span></a></li>\
            </ul>\
            ');

            var urlEncoded = encodeURIComponent(window.location.href);
            $shareUl.find('.ecm-icon-facebook').attr("href", 'https://www.facebook.com/sharer.php?u=' + urlEncoded);
            $shareUl.find('.ecm-icon-twitter').attr("href", 'https://twitter.com/share?url=' + urlEncoded);
            $shareUl.find('.ecm-icon-linkedin').attr("href", 'https://www.linkedin.com/cws/share?url=' + urlEncoded);

            $articleContainer.find(".ecm-article").append('<h2 class="ecm-share-h">' + texts[config.lan].shareArticle + '</h2>');
            $articleContainer.find(".ecm-article").append($shareUl);

            $articleContainer.find(".ecm-loader").remove();
        });

        jqxhr.fail(function(jqxhr, textStatus, error) {
            console.error("Loading Explories article failed: " + textStatus + ", " + error);
        });
    };

    var closeArticle = function()
    {
        $(".ecm-article-container").remove();

        // Set url
        // TO DO

        // Set title?
        // TO DO
    };

    var toggleFeed = function(toggle)
    {
        if (! toggle)
        {
            $(".ecm-feed").remove();
            return;
        }

        var $cardsContainer = $('<div class="ecm-cards-container ecm-feed ecm-feed-condensed"></div>');
        var $cards = $('<div class="ecm-cards"></div>');

        // Get routes first
        if (types['routes'].show)
        {
            for (var i in routesJSON)
            {
                // Check mode first
                if (! hasMode(routesJSON[i]))
                {
                    continue;
                }

                // Check if filters set and if the routes mathces the filters
                if (filters !== null && ! matchesFilters(routesJSON[i]))
                {
                    continue;
                }

                // Don't show card if it doesn't have a link
                if (notEmpty(routesJSON[i].url))
                {
                    $cards.append(createCard(routesJSON[i]));
                }
            }
        }

        // Then markers
        var allExternalMarkers = getAllExternalMarkers();
        var allMarkers = markers.concat(allExternalMarkers);

        for (var j = 0; j < allMarkers.length; j++)
        {
            var markerIndex = allMarkers[j].index;
            var marker = markersJSON[markerIndex];

            // Check if marker is external
            if (allMarkers[j].external)
            {
                marker = externalMarkersJSON[allMarkers[j].name][markerIndex];
            }

            // Don't show card if it doesn't have a link
            if (notEmpty(marker.url))
            {
                $cards.append(createCard(marker));
            }
        }

        // To prevent click on card closing the cluster
        $cards.find(".ecm-card").click(function(e) {
            e.stopPropagation();
        });

        $cardsContainer.append($cards);
        $("#ecm").append($cardsContainer);
    };

    /**
     *
     *
     */
    var setRouteDirections = function(i, routeOptions, polylineOptions)
    {
        // Add new DirectionsService to directionsServices array
        directionsServices[i] = new google.maps.DirectionsService();

        // Add new directionsRenderer to directionsRenderers array
        directionsRenderers[i] = new google.maps.DirectionsRenderer({
            routeIndex: Date.now(),
            suppressPolylines: true,
            suppressMarkers: (map.getZoom() < config.mapRouteMarkersThreshold),
            suppressInfoWindows: false,
            preserveViewport: true,
            markerOptions: {
                icon: {
                    path: 'M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0',
                    fillColor: polylineOptions.strokeColor,
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#ffffff",
                    scale: 0.4
                }
            }
        });

        // Add renderer to map
        directionsRenderers[i].setMap(map);

        directionsServices[i].route(routeOptions, function(response, status) {
            if (status === 'OK')
            {
                directionsRenderers[i].setDirections(response);
                var route = response.routes[0];

                //console.log('Reitin pituus: ' + getRouteLength(route) + ' m');
                //console.log('Reitin kesto: ' + getRouteDuration(route) + ' min');
                // Add route length and duration to json data
                routesJSON[i].length = getRouteLength(route);
                routesJSON[i].duration = getRouteDuration(route);

                // Put directonsService route response to routes array
                routes[i] = response;

                renderDirectionsPolylines(i, response, polylineOptions);
            }
            else
            {
                console.error('Directions request failed due to ' + status);
            }
        });
    };

    /**
     * Removes all routes from the map.
     */
    var clearRoutes = function()
    {
        for (var i = 0; i < mapPolylines.length; i++)
        {
            if (Array.isArray(mapPolylines[i]))
            {
                // It's a directions renderer route
                for (var j = 0; j < mapPolylines[i].length; j++)
                {
                    mapPolylines[i][j].setMap(null);
                    //mapPolylineBorders[i][j].setMap(null);
                }

                directionsRenderers[i].setMap(null);
            }
            else
            {
                // It's a simple polylines route
                if (mapPolylines[i])
                {
                    mapPolylines[i].setMap(null);
                }

                if (mapPolylineBorders[i])
                {
                    mapPolylineBorders[i].setMap(null);
                }
            }
        }
    };

    var clearExternalRoutes = function(name)
    {
        if (mapExternalPolylines[name])
        {
            for (var i = 0; i < mapExternalPolylines[name].length; i++)
            {
                mapExternalPolylines[name][i].setMap(null);
                mapExternalPolylineBorders[name][i].setMap(null);
            }
        }
    };

    var setRoutes = function()
    {
        clearRoutes();

        if (! types.routes.show)
        {
            return;
        }

        // Loop through all routes
        for (var i = 0; i < routesJSON.length; i++)
        {
            // Check mode first
            if (! hasMode(routesJSON[i]))
            {
                continue;
            }

            // Check if filters set and if the routes mathces the filters
            if (filters !== null && ! matchesFilters(routesJSON[i]))
            {
                continue;
            }

            // Render route on map
            if (routesJSON[i].travelMode)
            {
                // It's a directions renderer route
                renderDirectionsPolylines(i, routes[i], routesJSON[i].polylineOptions);
            }
            else
            {
                // It's a simple polylines route
                renderSimplePolylines(i);
            }
        }

        setRouteMarkers();
    };

    var setRouteMarkers = function()
    {
        // Suppress route markers if below zoom the threshold
        for (var i in directionsRenderers)
        {
            // Make sure the route is actually drawn on the map
            if (mapPolylines[i] !== undefined && mapPolylines[i][0].getMap() !== null)
            {
                directionsRenderers[i].setOptions({suppressMarkers: (map.getZoom() < config.mapRouteMarkersThreshold)});
                directionsRenderers[i].setMap(map);
            }
        }
    };

    var setMapLayersEnabled = function()
    {
        if (config.mapLayers)
        {
            for (var i = 0; i < config.mapLayers.length; i++)
            {
                var mapLayer = config.mapLayers[i];

                if (! mapLayer.minZoom || ! mapLayer.maxZoom)
                {
                    return;
                }

                var disabled = (mapLayer.minZoom > map.getZoom() || mapLayer.maxZoom < map.getZoom());
                $("#ecmFiltersLayers input:eq(" + i + ")").prop("disabled", disabled);
            }
        }
    };

    /**
     * @param   {number}    i       mapLayer index in config.mapLayers
     * @param   {boolean}   show    Hides mapLayer if false
     */
    var setKMLLayer = function(i, show)
    {
        if (show)
        {
            $("#ecmFiltersLayers").addClass("loading");

            var kmlLayer = new google.maps.KmlLayer({
                url: config.mapLayers[i].url,
                map: map,
                preserveViewport: true
            });

            google.maps.event.addListener(kmlLayer, "status_changed", function() {
                //console.log(this.getStatus());
                // Add a slight delay because the KML Layer isn't rendered
                // immediately when it's loaded
                setTimeout(function() {
                    $("#ecmFiltersLayers").removeClass("loading");
                }, 500);
            });

            layers[i] = kmlLayer;
        }
        else
        {
            // Remove layer from the map
            layers[i].setMap(null);
        }
    };

    /**
     * @param   {number}    i       mapLayer index in config.mapLayers
     * @param   {boolean}   show    Hides mapLayer if false
     */
    var setImageMapType = function(i, show)
    {
        var mapLayer = config.mapLayers[i];

        var mapBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(mapLayer.bounds[1], mapLayer.bounds[0]),
            new google.maps.LatLng(mapLayer.bounds[3], mapLayer.bounds[2])
        );

        if (show)
        {
            $("#ecmFiltersLayers").addClass("loading");

            // Uncheck all other chechboxes
            $("#ecmFiltersLayers .ecm-checkbox").each(function() {
                if ($(this).val() != i)
                {
                    $(this).prop("checked", false);
                }
            });

            // Remove existing image layer
            map.overlayMapTypes.setAt(0, null);

            if (config.mapMinZoom < mapLayer.minZoom)
            {
                // Set zoom slider min according to mapLayer.minZoom
                $("#zoom").attr("min", mapLayer.minZoom);
                // Set Google Maps minZoom
                map.setOptions({minZoom: mapLayer.minZoom});
            }

            if (config.mapMaxZoom > mapLayer.maxZoom)
            {
                // Set zoom slider max according to mapLayer.maxZoom
                $("#zoom").attr("max", mapLayer.maxZoom);
                // Set Google Maps maxZoom
                map.setOptions({maxZoom: mapLayer.maxZoom});
            }

            var imageMapType = new google.maps.ImageMapType({
                name: mapLayer.name,
                minZoom: mapLayer.minZoom,
                maxZoom: mapLayer.maxZoom,
                tileSize: new google.maps.Size(256, 256),
                isPng: true,
                opacity: 1.0,
                getTileUrl: function(coord, zoom) {
                    var proj = map.getProjection();
                    var z2 = Math.pow(2, zoom);
                    var tileXSize = 256 / z2;
                    var tileYSize = 256 / z2;
                    var tileBounds = new google.maps.LatLngBounds(
                        proj.fromPointToLatLng(new google.maps.Point(coord.x * tileXSize, (coord.y + 1) * tileYSize)),
                        proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * tileXSize, coord.y * tileYSize))
                    );
                    var x = coord.x >= 0 ? coord.x : z2 + coord.x;
                    var y = coord.y;
                    if (mapBounds.intersects(tileBounds) && zoom >= mapLayer.minZoom && zoom <= mapLayer.maxZoom)
                    {
                        var url = mapLayer.url.replace('{zoom}', zoom);
                        url = url.replace('{x}', x);
                        url = url.replace('{y}', y);
                        return url;
                    }
                }
            });

            imageMapType.addListener("tilesloaded", function() {
                $("#ecmFiltersLayers").removeClass("loading");
            });

            //map.overlayMapTypes.insertAt(i, imageMapType);
            map.overlayMapTypes.insertAt(0, imageMapType);
        }
        else
        {
            // Remove imageMapType from the map
            //map.overlayMapTypes.setAt(i, null);
            map.overlayMapTypes.setAt(0, null);

            // Reset zoom slider max & min
            $("#zoom").attr("min", config.mapMinZoom);
            $("#zoom").attr("max", config.mapMaxZoom);
            // Reset Google Maps minZoom and maxZoom
            map.setOptions({
                minZoom: config.mapMinZoom,
                maxZoom: config.mapMaxZoom
            });
        }

        // Set map layer state to localStorage
        if (hasLocalStorage)
        {
            localStorage.setItem(mapLayer.name, show);
        }
    };

    /**
     * @param   {string}    modeToSet
     */
    var setMode = function(modeToSet)
    {
        if (config.modes[modeToSet] === undefined)
        {
            console.error('Invalid mode');
            return;
        }

        mode = modeToSet;

        // Set map styles
        mapOptions = config.modes[modeToSet].styles;

        map.setOptions({
            styles: mapOptions
        });

        // Reload markers
        // TO DO
        setMarkers();
        setRoutes();
        // Reload routes
        // TO DO
    };

    var setTypes = function()
    {
        $("#ecmFiltersTypes .ecm-checkbox").each(function() {
            var type = $(this).val();
            types[type].show = $(this).is(":checked");
        });

        // No markers to show, clear markerclusterer
        if (! types['markers'].show)
        {
            markerClusterer.clearMarkers();
        }

        // Disable badge filters if routes are hidden
        $("#ecmFiltersBadges").prop("disabled", ! types['routes'].show);
        $("#ecmFiltersBadges .ecm-checkbox").prop("disabled", ! types['routes'].show);

        // Disable tag filters if both markers and routes are hidden
        var tagsDisabled = (! types['markers'].show && ! types['routes'].show);
        $("#ecmFiltersTags").prop("disabled", tagsDisabled);
        $("#ecmFiltersTags .ecm-checkbox").prop("disabled", tagsDisabled);

        // Disable external markers checkboxes if markers are hidden
        //$("#ecmFiltersExternalMarkers").prop("disabled", ! types['markers'].show);
        //$("#ecmFiltersExternalMarkers .ecm-checkbox").prop("disabled", ! types['markers'].show);

        // Set types to localStorage
        if (hasLocalStorage)
        {
            localStorage.setItem('types', JSON.stringify(types));
        }

        setFilters();
    };

    /**
     * Sets filters based on filter checkboxes.
     */
    var setFilters = function()
    {
        filters = {
            tags: [],
            badges: []
        };

        // Tag filters
        $("#ecmFiltersTags .ecm-checkbox:not(.ecm-toggle-all)").each(function() {
            if ($(this).prop("checked"))
            {
                filters.tags.push(parseInt($(this).val()));
            }
            else
            {
                // Uncheck toggle all if one tag cb is unchecked
                $("#toggleTagsCB").prop("checked", false);
            }
        });

        // Badges filters
        $("#ecmFiltersBadges .ecm-checkbox").each(function() {
            if ($(this).prop("checked"))
            {
                filters.badges.push(parseInt($(this).val()));
            }
        });

        // No filters, set filters null
        if (filters.tags.length == 0 && filters.badges.length == 0)
        {
            filters = null;
        }

        // Set filters to localStorage
        if (hasLocalStorage)
        {
            localStorage.setItem('filters', JSON.stringify(filters));
        }

        setMarkers();
        setRoutes();

        if ($(".ecm-feed").length > 0)
        {
            toggleFeed(false);
            toggleFeed(true);
        }
    };

    var matchesFilters = function(obj)
    {
        var match = false;

        if (obj.tags)
        {
            var objTagIds = $.map(obj.tags, function(tag) {
                return tag.id;
            });

            match = findOne(filters.tags, objTagIds);
        }

        if (obj.badges)
        {
            var objBadgeIds = $.map(obj.badges, function(badge) {
                return badge.id;
            });

            // Need to match both tag and badge to show route
            if (match)
            {
                match = findOne(filters.badges, objBadgeIds);
            }
        }

        return match;
    };

    var hasMode = function(obj)
    {
        if (obj.modes)
        {
            return (obj.modes.indexOf(mode) != -1);
        }
        return true;
    };

    /**
     *
     */
    var renderSimplePolylines = function(routeIndex)
    {
        var route = routesJSON[routeIndex];

        if (! Array.isArray(route.waypoints))
        {
            return;
        }

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
        mapPolylineBorders[routeIndex] = outline;

        polyline.setMap(map);
        mapPolylines[routeIndex] = polyline;

        routesJSON[routeIndex].length = polyline.getLengthInMeters();

        google.maps.event.addListener(polyline, 'click', function(e) {
            var route = routesJSON[routeIndex];
            infoWindow.setContent(createCard(route));
            infoWindow.setPosition(e.latLng);
            infoWindow.open(map);
        });
    };

    var renderDirectionsPolylines = function(routeIndex, response, polylineOptions)
    {
        var polylines = [];

        /*for (var i = 0; i < polylines.length; i++)
        {
            polylines[i].setMap(null);
        }*/

        var legs = response.routes[0].legs;

        for (var i = 0; i < legs.length; i++)
        {
            var steps = legs[i].steps;

            for (var j = 0; j < steps.length; j++)
            {
                var nextSegment = steps[j].path;
                var stepPolyline = new google.maps.Polyline(polylineOptions);

                for (var k = 0; k < nextSegment.length; k++)
                {
                    stepPolyline.getPath().push(nextSegment[k]);
                }

                polylines.push(stepPolyline);
                stepPolyline.setMap(map);

                // Route click listener, different one on each step
                google.maps.event.addListener(stepPolyline, 'click', function(e) {
                    //console.log("Click on the route " + e.latLng.toUrlValue(6));
                    //console.log("Click on route " + routeIndex);
                    //console.log(routesJSON[routeIndex]);
                    var route = routesJSON[routeIndex];
                    infoWindow.setContent(createCard(route));
                    infoWindow.setPosition(e.latLng);
                    infoWindow.open(map);
                });
            }
        }

        mapPolylines[routeIndex] = polylines;

    };

    var renderExternalPolylines = function(name, routeIndex)
    {
        var route = externalRoutesJSON[name][routeIndex];

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
        mapExternalPolylineBorders[name][routeIndex] = outline;

        polyline.setMap(map);
        mapExternalPolylines[name][routeIndex] = polyline;

        externalRoutesJSON[name][routeIndex].length = polyline.getLengthInMeters();

        google.maps.event.addListener(polyline, 'click', function(e) {
            var route = externalRoutesJSON[name][routeIndex];
            infoWindow.setContent(createCard(route));
            infoWindow.setPosition(e.latLng);
            infoWindow.open(map);
        });
    };

    var getRouteLength = function(route)
    {
        var totalDistance = 0;

        for (var i = 0; i < route.legs.length; ++i)
        {
            totalDistance += route.legs[i].distance.value;
        }

        return totalDistance;
    };

    var getRouteDuration = function(route)
    {
        var totalDuration = 0;

        for (var i = 0; i < route.legs.length; ++i)
        {
            totalDuration += route.legs[i].duration.value;
        }

        return totalDuration;
    };

    /**
     * Converts our route object to Google Maps route options object.
     *
     * @param   {Array}     route
     * @returns {object}
     */
    var route2RouteOptions = function(route)
    {
        var firstWaypoint = route.waypoints[0];
        var lastWaypoint = route.waypoints[route.waypoints.length - 1];
        var origin = new google.maps.LatLng(firstWaypoint.lat, firstWaypoint.lng);
        var destination = new google.maps.LatLng(lastWaypoint.lat, lastWaypoint.lng);
        var waypoints = [];

        route.waypoints.shift();
        route.waypoints.pop();

        for (var i = 0; i < route.waypoints.length; i++)
        {
            waypoints.push({
                location: new google.maps.LatLng(route.waypoints[i].lat, route.waypoints[i].lng)
            });
        }

        if (typeof route.travelMode === 'undefined')
        {
            route.travelMode = config.mapDefaultTravelMode;
        }

        return {
            origin: origin,
            destination: destination,
            waypoints: waypoints,
            optimizeWaypoints: true,
            travelMode: route.travelMode
        };
    };

    var zoomUserToBounds = function()
    {
        map.setZoom(map.getZoom() - 1);

        google.maps.event.addListenerOnce(map,'idle', function() {
            if (! map.getBounds().contains(userPos))
            {
                zoomUserToBounds();
            }
        });
    };

    var createCard = function(obj)
    {
        var $card = $('<a class="ecm-card"></a>');

        if (obj.external)
        {
            $card.addClass("ecm-card-external");
            $card.append('<div class="ecm-card-external-icon"></div>');

            if (notEmpty(obj.logo))
            {
                var $logo = $('<div class="ecm-card-logo" style="background-image:url(\'' + obj.logo + '\');"></div>');

                if (notEmpty(obj.color))
                {
                    $logo.css("background-color", obj.color);
                }

                $card.append($logo);
            }
        }

        if (obj.url)
        {
            $card.attr("href", obj.url);

            if (obj.target)
            {
                $card.attr("target", obj.target);
            }
        }
        else
        {
            $card.addClass("ecm-card-no-link");
        }

        if (obj.image || notEmpty(config.cardDefaultImg))
        {
            var $imgContainer = $('<div class="ecm-card-img-container"></div>');
            var $img = $('<div class="ecm-card-img"></div>');

            if (obj.image)
            {
                // Make relative paths absolute
                if (! isURL(obj.image))
                {
                    obj.image = dirPath + obj.image;
                }

                $img.css("background-image", "url('" + obj.image + "')");
            }
            else
            {
                // No img, use default image
                $img.css("background-image", "url('" + config.cardDefaultImg + "')");
                $img.addClass("ecm-default-img");
            }

            $imgContainer.append($img);
            $card.append($imgContainer);
        }

        if (obj.badges || obj.length)
        {
            var $info = $('<div class="ecm-card-info"></div>');
        }

        if (obj.badges)
        {
            if (Array.isArray(obj.badges))
            {
                for (var i = 0; i < obj.badges.length; i++)
                {
                    var $badge = $('<span class="ecm-card-badge">' + obj.badges[i].name + '</span>');
                    $badge.addClass("ecm-card-badge-" + obj.badges[i].id);
                    $info.append($badge);
                }
            }
        }

        if (obj.length)
        {
            var $length = $('<span class="ecm-card-length">' + (obj.length / 1000).toFixed(2) + ' km</span>');
            $info.append($length);
        }

        if (obj.badges || obj.length)
        {
            $card.append($info);
        }

        if (obj.title)
        {
            var $h1 = $('<h1>' + obj.title + '</h1>');
            $card.append($h1);
        }

        if (obj.description)
        {
            var $p = $('<p>' + obj.description + '</p>');
            $card.append($p);
        }

        if (obj.tags)
        {
            if (Array.isArray(obj.tags))
            {
                var $tags = $('<div class="ecm-card-tags"></div>');

                for (var j = 0; j < obj.tags.length; j++)
                {
                    // Make relative paths absolute
                    if (! isURL(obj.tags[j].icon))
                    {
                        obj.tags[j].icon = dirPath + obj.tags[j].icon;
                    }

                    var $tagImg = $('<img />');
                    $tagImg.attr("src", obj.tags[j].icon);
                    $tagImg.attr("alt", obj.tags[j].name);
                    $tags.append($tagImg);
                }

                $card.append($tags);
            }
        }

        return $card[0].outerHTML;
    };

    var createModeButtons = function()
    {
        if (config.showModeButtons && config.modes !== undefined && config.modes !== null)
        {
            var $modeButtons = $('<div class="ecm-mode-buttons"></div>');

            for (var key in config.modes)
            {
                if (config.modes.hasOwnProperty(key))
                {
                    var mode = config.modes[key];
                    var $modeBtn = $('<button type="button" class="ecm-btn">' + texts[config.lan][key] + '</button>');
                    $modeBtn.attr("id", 'ecm' + key.charAt(0).toUpperCase() + key.slice(1) + 'Btn');
                    $modeBtn.attr("data-id", mode.id);
                    $modeBtn.attr("data-mode", key);
                    $modeBtn.addClass("ecm-btn-" + key);

                    if (key == config.initMode)
                    {
                        $modeBtn.addClass("ecm-btn-active");
                    }

                    $modeBtn.click(function() {
                        $(".ecm-mode-buttons .ecm-btn").removeClass("ecm-btn-active");
                        $(this).addClass("ecm-btn-active");
                        setMode($(this).attr("data-mode"));
                    });

                    $modeButtons.append($modeBtn);
                }
            }

            $("#ecm").append($modeButtons);
        }
    };

    /**
     *
     */
    var createMapControls = function()
    {
        var $mapControls = $('<div class="ecm-map-controls"></div>');

        // Create print button
        if (config.showPrint)
        {
            var $printBtn = ecmUIButton({
                icon: 'icon-print.svg',
                name: 'print',
                onClick: function() {
                    window.print();
                },
                size: 32
            });

            $mapControls.append($printBtn);
        }


        // Create user location button
        var $locationBtn = ecmUIButton({
            icon: 'icon-location.svg',
            name: 'location',
            onClick: function() {
                getUserLocation();
            },
            size: 32
        });

        // Zoom in button
        var $zoomInBtn = ecmUIButton({
            icon: 'icon-plus.svg',
            name: 'zoom-in',
            onClick: function() {
                map.setZoom(map.getZoom() + 1);
            },
            size: 32
        });

        // Zoom out button
        var $zoomOutBtn = ecmUIButton({
            icon: 'icon-minus.svg',
            name: 'zoom-out',
            onClick: function() {
                map.setZoom(map.getZoom() - 1);
            },
            size: 32
        });

        $mapControls.append($locationBtn);
        $mapControls.append($zoomInBtn);
        $mapControls.append($zoomOutBtn);

        $("#ecm").append($mapControls);
    };

    /**
     *
     */
    var createSettings = function()
    {
        // Create settings button
        var $settingsBtn = ecmUIButton({
            icon: ['icon-settings.svg', 'icon-close.svg'],
            id: 'ecmSettingsBtn',
            name: 'settings',
            onClick: function() {
                $("#ecmSettings").toggleClass("ecm-panel-open");
                $(".ecm-feed").toggleClass("ecm-feed-condensed");
                $(this).find("svg").toggle();
            },
            size: 32
        });

        $("#ecm").append($settingsBtn);

        // Create settings panel
        var $settingsPanel = $('<div id="ecmSettings" class="ecm-panel ecm-panel-settings"></div>');

        if (config.showMapFeedToggle)
        {
            var $feedCb = ecmUICheckbox({
                id: "feedCB",
                class: 'ecm-switch',
                groupClass: 'ecm-switch-group',
                label: 'Feed',
                labelPre: 'Map',
                onChange: function() {
                    //console.log('toggle feed ' + $(this).prop("checked"));
                    toggleFeed($(this).prop("checked"));
                }
            });

            $settingsPanel.append($feedCb);
        }

        // Create fieldset for type filters
        if (config.showTypeFilters)
        {
            var $typeFilters = $('<fieldset id="ecmFiltersTypes" class="ecm-filters"></fieldset>');
            $typeFilters.append('<legend>' + texts[config.lan].typeFiltersLegend + '</legend>');

            // Loop through types and add them to tags filters fieldset
            for (var prop in types)
            {
                if (types.hasOwnProperty(prop))
                {
                    var type = types[prop];
                    var typeChecked = true;

                    // Check if types are stored
                    if (hasLocalStorage && notEmpty(localStorage.getItem('types')))
                    {
                        var storedTypes = JSON.parse(localStorage.getItem('types'));

                        if (storedTypes[prop].show == false)
                        {
                            typeChecked = false;
                        }
                    }

                    var $typeCb = ecmUICheckbox({
                        id: "typeCB_" + type.id,
                        checked: typeChecked,
                        label: texts[config.lan][type.name],
                        onChange: function() {
                            //console.log($(this).val());
                            setTypes();
                        },
                        value: prop
                    });

                    $typeFilters.append($typeCb);
                }
            }

            $settingsPanel.append($typeFilters);
        }

        // Create fieldset for tag filters
        if (config.showTagFilters)
        {
            var $tagFilters = $('<fieldset id="ecmFiltersTags" class="ecm-filters"></fieldset>');
            $tagFilters.append('<legend>' + texts[config.lan].tagFiltersLegend + '</legend>');

            // Toggle all checkbox
            var $toggleTagsCb = ecmUICheckbox({
                id: 'toggleTagsCB',
                class: 'ecm-toggle-all',
                groupClass: 'ecm-toggle-tags-group',
                checked: true,
                label: texts[config.lan].toggleTags,
                onChange: function() {
                    // Chech/uncheck all tag checkboxes
                    $("#ecmFiltersTags .ecm-checkbox").prop("checked", $(this).prop("checked"));
                    setFilters();
                }
            });

            $tagFilters.append($toggleTagsCb);

            // Loop through tags and add them to tags filters fieldset
            for (var i = 0; i < tags.length; i++)
            {
                var tag = tags[i];
                var tagChecked = true;

                // Check if tags are stored
                if (hasLocalStorage && notEmpty(localStorage.getItem('filters')))
                {
                    var storedFilters = JSON.parse(localStorage.getItem('filters'));

                    if (storedFilters.tags.indexOf(tag.id) == -1)
                    {
                        tagChecked = false;
                    }
                }

                var $tagCb = ecmUICheckbox({
                    id: "tagCB_" + tag.id,
                    checked: tagChecked,
                    label: tags[i].name,
                    onChange: setFilters,
                    value: tag.id
                });

                $tagFilters.append($tagCb);
            }

            $settingsPanel.append($tagFilters);
        }

        // External markers
        if (Array.isArray(config.externalMarkersSets) && config.externalMarkersSets.length > 0)
        {
            for (var j = 0; j < config.externalMarkersSets.length; j++)
            {
                var set = config.externalMarkersSets[j];
                var fieldsetId = 'ecmFiltersExternalMarkers' + set.id[0].toUpperCase() + set.id.substring(1);

                var $externalMarkers = $('<fieldset id="' + fieldsetId + '" class="ecm-filters"></fieldset>');
                $externalMarkers.append('<legend>' + texts[config.lan][set.id] + '</legend>');

                // Toggle all for external markers
                if (set.showToggleAll)
                {
                    // Toggle all checkbox
                    var $toggleExternalsCb = ecmUICheckbox({
                        id: 'toggleExternal' + set.id + 'CB',
                        class: 'ecm-toggle-all',
                        groupClass: 'ecm-toggle-tags-group',
                        checked: true,
                        label: texts[config.lan].toggleTags,
                        onChange: function() {
                            // Chech/uncheck all tag checkboxes
                            var fieldset = $(this).parent().parent();
                            $(fieldset).find(".ecm-checkbox:not(.ecm-toggle-all)").prop("checked", $(this).prop("checked"));
                            $(fieldset).find(".ecm-checkbox:not(.ecm-toggle-all)").trigger('change');
                        }
                    });

                    $externalMarkers.append($toggleExternalsCb);
                }

                // Loop through externalMarkers and create checkboxes
                for (var key in config.externalMarkers)
                {
                    if (config.externalMarkers.hasOwnProperty(key))
                    {
                        if (config.externalMarkers[key].set == set.id)
                        {
                            var extMarkersChecked = config.externalMarkers[key].checked;

                            // Check if external markers are stored
                            if (hasLocalStorage && notEmpty(localStorage.getItem(key)))
                            {
                                extMarkersChecked = JSON.parse(localStorage.getItem(key));
                            }

                            var $extMarkersCb = ecmUICheckbox({
                                id: key,
                                label: texts[config.lan][key],
                                checked: extMarkersChecked,
                                onChange: function() {
                                    var fieldset = $(this).parent().parent();
                                    if ($(this).prop("checked"))
                                    {
                                        loadExternalMarkers($(this).attr("id"));
                                        // Check toggle all if all are checked
                                        if ($(fieldset).find(".ecm-checkbox:not(.ecm-toggle-all):checked").length == $(fieldset).find(".ecm-checkbox:not(.ecm-toggle-all)").length) {
                                            $(fieldset).find(".ecm-toggle-all").prop("checked", true);
                                        }
                                    }
                                    else
                                    {
                                        clearExternalMarkers($(this).attr("id"));
                                        // Uncheck toggle all if one external markers cb is unchecked
                                        $(fieldset).find(".ecm-toggle-all").prop("checked", false);
                                    }
                                    // Set external markers state to localStorage
                                    if (hasLocalStorage)
                                    {
                                        localStorage.setItem($(this).attr("id"), $(this).prop("checked"));
                                    }
                                },
                                value: key
                            });

                            // Uncheck toggle all if one of the checkboxes is unchecked by default
                            if (set.showToggleAll && ! config.externalMarkers[key].checked)
                            {
                                $externalMarkers.find(".ecm-toggle-all").prop("checked", false);
                            }

                            $externalMarkers.append($extMarkersCb);

                            /*if (config.externalMarkers[key].checked)
                            {
                                loadExternalMarkers(key);
                            }*/
                        }
                    }

                }

                $settingsPanel.append($externalMarkers);
            }
        }

        // Create fieldset for badge filters
        if (config.showBadgeFilters && badges.length > 0)
        {
            var $badgeFilters = $('<fieldset id="ecmFiltersBadges" class="ecm-filters"></fieldset>');
            $badgeFilters.append('<legend>' + texts[config.lan].badgeFiltersLegend + '</legend>');

            // Loop through badges and add them to badge filters fieldset
            for (var j = 0; j < badges.length; j++)
            {
                var badge = badges[j];
                var badgeChecked = true;

                // Check if badges are stored
                if (hasLocalStorage && notEmpty(localStorage.getItem('filters')))
                {
                    var storedFilters = JSON.parse(localStorage.getItem('filters'));

                    if (storedFilters.badges.indexOf(badge.id) == -1)
                    {
                        badgeChecked = false;
                    }
                }

                var $badgeCb = ecmUICheckbox({
                    id: "badgeCB_" + badge.id,
                    checked: badgeChecked,
                    label: badges[j].name,
                    onChange: setFilters,
                    value: badge.id
                });

                $badgeFilters.append($badgeCb);
            }

            $settingsPanel.append($badgeFilters);
        }

        // Map layers
        if (notEmpty(config.mapLayers))
        {
            var $mapLayers = $('<fieldset id="ecmFiltersLayers" class="ecm-filters"></fieldset>');
            $mapLayers.append('<legend>' + texts[config.lan].mapLayers + '</legend>');

            // Loop through mapLayers and create checkboxes
            for (var k in config.mapLayers)
            {
                if (config.mapLayers.hasOwnProperty(k))
                {
                    var mapLayerChecked = config.mapLayers[k].checked;

                    // Check if map layers are stored
                    if (hasLocalStorage && notEmpty(localStorage.getItem(config.mapLayers[k].name)))
                    {
                        mapLayerChecked = JSON.parse(localStorage.getItem(config.mapLayers[k].name));
                    }

                    var $layerCb = ecmUICheckbox({
                        id: config.mapLayers[k].name,
                        label: texts[config.lan][config.mapLayers[k].name],
                        data: [
                            {
                                name: 'type',
                                value: config.mapLayers[k].type
                            }
                        ],
                        checked: mapLayerChecked,
                        onChange: function() {
                            if ($(this).attr("data-type") == "kml")
                            {
                                setKMLLayer($(this).val(), $(this).prop("checked"));
                            }
                            else if ($(this).attr("data-type") == "imageMapType")
                            {
                                setImageMapType($(this).val(), $(this).prop("checked"));
                            }
                            else
                            {
                                console.error('Ivalid map layer type');
                            }
                        },
                        value: k
                    });

                    $mapLayers.append($layerCb);
                }
            }

            $settingsPanel.append($mapLayers);
        }

        // Map type select
        var $mapTypeGrp = $('<div class="ecm-form-group"></div>');
        $mapTypeGrp.append('<label for="mapType">' + texts[config.lan].mapType + '</label><br />');

        var $mapTypeSelect = $('<select id="mapType"></select>');

        for (var l = 0; l < config.mapTypes.length; l++)
        {
            var mapType = config.mapTypes[l];
            var $mapTypeOption = $('<option></option>');
            $mapTypeOption.attr("value", mapType);
            $mapTypeOption.text(texts[config.lan][mapType]);

            if (config.mapTypeId == mapType)
            {
                $mapTypeOption.prop("selected", true);
            }

            $mapTypeSelect.append($mapTypeOption);
        }

        $mapTypeGrp.append($mapTypeSelect);

        $mapTypeSelect.change(function() {
            map.setOptions({
                mapTypeId: $(this).val()
            });
            // Set new mapTypeId to localStorage
            if (hasLocalStorage)
            {
                localStorage.setItem('mapTypeId', $(this).val());
            }
        });

        $settingsPanel.append($mapTypeGrp);

        // Zoom slider
        var $zoomGrp = $('<div class="ecm-form-group"></div>');
        $zoomGrp.append('<label for="zoom">' + texts[config.lan].mapZoom + '</label><br />');
        $zoomGrp.append('<div class="ecm-range-labels"><span class="pull-left">-</span><span id="zoomVal">' + map.getZoom() + '</span><span class="pull-right">+</span></div>');

        var $zoom = $('<input id="zoom" type="range" step="1" />');
        $zoom.attr("min", config.mapMinZoom);
        $zoom.attr("max", config.mapMaxZoom);

        $zoomGrp.append($zoom);

        $zoom.val( map.getZoom() );

        $zoom.on('input', function() {
            map.setZoom( parseInt( $(this).val() ));
            $("#zoomVal").text( $(this).val() );
        });

        $settingsPanel.append($zoomGrp);

        // My location
        var $myLocation = $('<fieldset id="ecmMyLocation"></fieldset>');
        $myLocation.append('<legend>' + texts[config.lan].myLocation + '</legend>');

        // Create my location button
        var $myLocationBtn = ecmUIButton({
            id: 'myLocationBtn',
            icon: 'icon-location.svg',
            name: 'location',
            class: 'ecm-btn-icon-text ecm-btn-block',
            text: texts[config.lan].myLocationShow,
            onClick: function() {
                getUserLocation();
            }
        });

        var $followUserCb = ecmUICheckbox({
            id: "followUserCB",
            label: texts[config.lan].myLocationCenter,
            onChange: function() {
                followUser = $(this).prop("checked");
                if (followUser)
                {
                    map.panTo(userPos);
                }
            }
        });

        /*var $permissionsCb = ecmUICheckbox({
            id: "permissionsCB",
            checked: true,
            label: 'sdffdssfd sdf',
            onChange: function() {

            }
        });

        $permissionsCb.hide();
        $myLocation.append($permissionsCb);*/

        $followUserCb.hide();
        $myLocation.append($myLocationBtn);
        $myLocation.append($followUserCb);
        $settingsPanel.append($myLocation);

        // Test
        //console.log('Permissions: ' + navigator.permissions);

        /*$settingsPanel.append('<h3>Testing...</h3>');

        var $testBtn = $('<button type="button">Clear routes</button>');
        $testBtn.click(function() {
            clearRoutes();
        });
        $settingsPanel.append($testBtn);

        var $testBtn2 = $('<button type="button">Set routes</button>');
        $testBtn2.click(function() {
            setRoutes();
        });
        $settingsPanel.append($testBtn2);*/
        // /Test

        $("#ecm").append($settingsPanel);

        setFilters();

        // Start external markers load after append so loaders will work on init load
        for (var key in config.externalMarkers)
        {
            if (config.externalMarkers.hasOwnProperty(key))
            {
                if ($("#" + key).prop("checked"))
                {
                    loadExternalMarkers(key);
                }
            }
        }

        // Trigger change on map layer checkboxes to set initial map layer
        $("#ecmFiltersLayers .ecm-checkbox:checked").trigger('change');
    };

    var getAllExternalMarkers = function()
    {
        var allExternals = [];

        for (var key in externalMarkers)
        {
            if (externalMarkers.hasOwnProperty(key))
            {
                for (var i = 0; i < externalMarkers[key].length; i++)
                {
                    allExternals.push(externalMarkers[key][i]);
                }
            }
        }

        return allExternals;
    };

    /**
     * Converts Locationews article data to ECM markers.
     */
    var convertLN2ECM = function(data, name)
    {
        externalMarkersJSON[name] = [];

        for (var i = 0; i < data.length; i++)
        {
            // Use thumbnail if images not defined
            if (! data[i].images)
            {
                data[i].images = {
                    medium: data[i].thumbnail
                };
            }

            var url = 'https://explori.es/fi/Article/' + data[i].id + '/' + data[i].slug;
            var target = '_blank';
            var external = true;

            // Set article view url if defined
            if (config.externalMarkers[name].articleViewUrl)
            {
                url = config.externalMarkers[name].articleViewUrl;
                url = url.replace('{id}', data[i].id);
                url = url.replace('{slug}', data[i].slug);
                target = '_self';
                external = false;
            }

            // External can be overrided with external markers property external
            if (typeof config.externalMarkers[name].external !== 'undefined')
            {
                external = config.externalMarkers[name].external;
            }

            var marker = {
                id: data[i].id,
                name: name,
                title: data[i].title,
                image: data[i].images.medium,
                logo: data[i].publication.image,
                color: data[i].publication.themeColor,
                latitude: parseFloat(data[i].latitude),
                longitude: parseFloat(data[i].longitude),
                url: url,
                "target": target,
                "icon": data[i].publication.marker,
                external: external
            };

            externalMarkersJSON[name].push(marker);
        }

        setExternalMarkers(name);
    };

    /**
     * Converts Retkipaikka api data to ECM markers.
     */
    var convertRetkipaikka2ECM = function(data, name)
    {
        externalMarkersJSON[name] = [];
        externalRoutesJSON[name] = [];
        clearExternalRoutes(name);
        mapExternalPolylines[name] = [];
        mapExternalPolylineBorders[name] = [];

        for (var i = 0; i < data.length; i++)
        {
            var existsAlready = false;

            // Check if marker exists already
            for (var propName in externalMarkersJSON)
            {
                if (externalMarkersJSON.hasOwnProperty(propName) && propName.search('retkipaikka') != -1 && propName != name)
                {
                    existsAlready = externalMarkersJSON[propName].some(function(el) {
                        return el.id === data[i].id
                    });

                    if (existsAlready)
                    {
                        //console.log('Duplicate ' + data[i].id + ': ' + data[i].title);
                        break;
                    }
                }
            }

            // Exists already, skip this one
            if (existsAlready)
            {
                continue;
            }

            // Use thumbnail if images not defined
            if (! data[i].images)
            {
                data[i].images = {
                    medium: data[i].thumbnail
                };
            }

            //var url = 'https://explori.es/fi/Article/' + data[i].id + '/' + data[i].slug;
            var target = '_blank';
            var external = true;
            // Set article view url if defined
            /*if (config.externalMarkers[name].articleViewUrl)
            {
                var url = config.externalMarkers[name].articleViewUrl;
                url = url.replace('{id}', data[i].id);
                url = url.replace('{slug}', data[i].slug);
                target = '_self';
            }*/

            var icon = 'https://kartta.retkipaikka.fi/assets/marker.png';
            var markerLat;
            var markerLng;
            var route;
            var waypoints;

            // Retkipaikka route difficulties
            var badgeIds = {
                esteeton: 0,
                helppo: 1,
                keskivaativa: 2,
                vaativa: 3,
                luokittelematon: 4
            };

            var routeColors = {
                esteeton: "#3c3",
                helppo: "#03c",
                keskivaativa: "#c33",
                vaativa: "#000",
                luokittelematon: "#cc3"
            };

            if (data[i].marker)
            {
                icon = 'https://kartta.retkipaikka.fi/assets/' + data[i].marker;
            }

            // Link points to retkipaikka.fi, always internal
            if (data[i].link != null && data[i].link.search('retkipaikka.fi'))
            {
                external = false;
            }

            // Can be overrided with external markers property external
            if (typeof config.externalMarkers[name].external !== 'undefined')
            {
                external = config.externalMarkers[name].external;
            }

            // Make all img urls https
            if (data[i].images[0])
            {
                data[i].images[0] = data[i].images[0].replace('http://', 'https://');
            }

            if (data[i].geometry.type == 'Point')
            {
                markerLat = parseFloat(data[i].geometry.coordinates[1]);
                markerLng = parseFloat(data[i].geometry.coordinates[0]);
            }
            else if (data[i].geometry.type == 'LineString')
            {
                markerLat = parseFloat(data[i].geometry.coordinates[0][1]);
                markerLng = parseFloat(data[i].geometry.coordinates[0][0]);

                // Convert and add route
                waypoints = convertRetkipaikkaRoute2ECM(data[i].geometry.coordinates);

                route = {
                    id: data[i].id,
                    title: data[i].title,
                    image: data[i].images[0],
                    polylineOptions: {
                        "strokeColor": "#0099ff",
                        "strokeOpacity": 1,
                        "strokeWeight": 5
                    },
                    waypoints: waypoints
                };

                if (notEmpty(data[i].route_difficulty))
                {
                    route.badges = [
                        {
                            id: badgeIds[data[i].route_difficulty],
                            name: data[i].route_difficulty[0].toUpperCase() + data[i].route_difficulty.substring(1)
                        }
                    ];
                    route.polylineOptions.strokeColor = routeColors[data[i].route_difficulty];
                }

                externalRoutesJSON[name].push(route);
                renderExternalPolylines(name, externalRoutesJSON[name].length-1);
            }
            else if (data[i].geometry.type == 'MultiLineString')
            {
                markerLat = parseFloat(data[i].geometry.coordinates[0][0][1]);
                markerLng = parseFloat(data[i].geometry.coordinates[0][0][0]);

                // Convert and add route
                for (var j = 0; j < data[i].geometry.coordinates.length; j++)
                {
                    waypoints = convertRetkipaikkaRoute2ECM(data[i].geometry.coordinates[j]);

                    route = {
                        id: data[i].id,
                        title: data[i].title,
                        image: data[i].images[0],
                        polylineOptions: {
                            "strokeColor": "#0099ff",
                            "strokeOpacity": 1,
                            "strokeWeight": 5
                        },
                        waypoints: waypoints
                    };

                    if (notEmpty(data[i].route_difficulty))
                    {
                        route.badges = [
                            {
                                id: badgeIds[data[i].route_difficulty],
                                name: data[i].route_difficulty[0].toUpperCase() + data[i].route_difficulty.substring(1)
                            }
                        ];
                        route.polylineOptions.strokeColor = routeColors[data[i].route_difficulty];
                    }

                    externalRoutesJSON[name].push(route);
                    renderExternalPolylines(name, externalRoutesJSON[name].length-1);
                }
            }

            var marker = {
                id: data[i].id,
                name: name,
                title: data[i].title,
                image: data[i].images[0],
                logo: null,
                color: null,
                latitude: markerLat,
                longitude: markerLng,
                url: data[i].link,
                "target": target,
                "icon": icon,
                external: external
            };

            externalMarkersJSON[name].push(marker);
        }

        setExternalMarkers(name);
    };

    var convertRetkipaikkaRoute2ECM = function(data)
    {
        var waypoints = [];

        if (Array.isArray(data))
        {
            for (var i = 0; i < data.length; i++)
            {
                waypoints.push({
                    lat: data[i][1],
                    lng: data[i][0]
                });
            }
        }

        return waypoints;
    };

    /**
     *
     */
    var ecmUIButton = function(options)
    {
        var settings = {
            class: null,
            disabled: false,
            icon: null,
            id: null,
            name: null,
            onClick: null,
            size: null,
            text: null,
            tooltip: null
        };

        $.extend(settings, options);

        var $btn = $('<button type="button" class="ecm-btn"></button>');

        if (settings.disabled)
        {
            $btn.prop("disabled", true);
        }

        if (settings.id)
        {
            $btn.attr("id", settings.id);
        }

        if (settings.size)
        {
            $btn.addClass("ecm-btn-" + settings.size);
        }

        if (settings.name)
        {
            $btn.addClass("ecm-btn-" + settings.name);
        }

        if (settings.class)
        {
            $btn.addClass(settings.class);
        }

        if (settings.icon)
        {
            var $svg;

            // If icon is an array of icons output them all
            if (Array.isArray(settings.icon))
            {
                for (var i = 0; i < settings.icon.length; i++)
                {
                    $svg = $('<svg data-src="' + dirPath + 'images/' + settings.icon[i] + '"></svg>');
                    $btn.append($svg);
                }
            }
            else
            {
                $svg = $('<svg data-src="' + dirPath + 'images/' + settings.icon + '"></svg>');
                $btn.append($svg);
            }
        }

        if (settings.text)
        {
            $btn.append(settings.text);
        }

        if (settings.onClick)
        {
            $btn.click(settings.onClick);
        }

        return $btn;
    };

    var ecmUICheckbox = function(options)
    {
        var settings = {
            checked: false,
            class: null,
            data: null,
            groupClass: null,
            id: null,
            label: null,
            labelPre: null,
            name: null,
            onChange: null,
            tooltip: null,
            value: null
        };

        $.extend(settings, options);

        var $cbGrp = $('<div class="ecm-form-group-cb"></div>');

        if (settings.labelPre)
        {
            var $cbLabelPre = $('<label></label>');
            $cbLabelPre.text(settings.labelPre);
            $cbGrp.append($cbLabelPre);
        }

        var $cb = $('<input type="checkbox" class="ecm-checkbox" />');
        $cb.attr("id", settings.id);
        $cb.attr("value", settings.value);

        if (settings.name)
        {
            $cb.attr("name", settings.name);
        }

        if (settings.class)
        {
            $cb.addClass(settings.class);
        }

        if (settings.groupClass)
        {
            $cbGrp.addClass(settings.groupClass);
        }

        // Add data attributes
        if (settings.data)
        {
            for (var i = 0; i < settings.data.length; i++)
            {
                $cb.attr("data-" + settings.data[i].name, settings.data[i].value);
            }
        }

        if (settings.checked)
        {
            $cb.prop("checked", true);
        }

        if (settings.onChange)
        {
            $cb.change(settings.onChange);
        }

        $cbGrp.append($cb);

        if (settings.label)
        {
            var $cbLabel = $('<label></label>');
            $cbLabel.text(settings.label);
            $cbLabel.attr("for", settings.id);
            $cbGrp.append($cbLabel);
        }

        return $cbGrp;
    };

    var ecmUIModal = function(options)
    {
        var settings = {
            title: null,
            class: null,
            buttons: [

            ]
        };

        $.extend(settings, options);

        var $modal = $('<div class="ecm-modal"></div>');

        return $modal;
        // TO DO
    };

    /**
     *
     */
    var injectIcons = function()
    {
        // Elements to inject SVG icons into
        var injectIcons = document.querySelectorAll('svg[data-src]');

        var injectorOptions = {
            evalScripts: false,
            each: function (svg) {
                // Callback after each SVG is injected
                //console.log('SVG injected: ' + svg.getAttribute('id'));
            }
        };

        // Inject SVG icons
        SVGInjector(injectIcons, injectorOptions, function(count) {
            //console.log('Total injections: ' + count);
        });
    };

    var showLoader = function()
    {
        $("#ecm").prepend('<div class="ecm-loader"></div>');
    };

    var removeLoader = function()
    {
        $("#ecm > .ecm-loader").remove();
    };

    var showModalOverlay = function()
    {
        $("#ecm").prepend('<div class="ecm-modal-overlay"></div>');
    };

    var removeModalOverlay = function()
    {
        $("#ecm > .ecm-modal-overlay").remove();
    };

    var autoOffsetTop = function()
    {
        // Set ECM top by config.offsetTopSel height if set to auto
        if ($(config.offsetTopSel).length > 0)
        {
            document.getElementById('ecm').style.top = $(config.offsetTopSel).outerHeight() + "px";
        }
    };

    /**
     * @description                 Determine if an array contains one or more items from another array.
     *
     * @param   {array} haystack    The array to search.
     * @param   {array} arr         The array providing items to check for in the haystack.
     *
     * @return {boolean}            Returns true if haystack contains at least one item from arr.
     */
    var findOne = function (haystack, arr)
    {
        return arr.some(function (v) {
            return haystack.indexOf(v) >= 0;
        });
    };

    var isURL = function(str)
    {
        var pattern = /^((http|https):\/\/)|\/\//;
        return pattern.test(str);
    };

    /**
     * @description  Checks if value is undefined, null or empty string.
     *
     * @param    {*} val
     */
    var notEmpty = function(val)
    {
        return val !== 'undefined' && val !== null && val != '';
    };

   /**
    * @param   {string}    dateTime
    *
    * @returns {string}
    */
    var formatDateTime = function(dateTime)
    {
       if (dateTime == undefined || dateTime == null || dateTime == '')
       {
           return '';
       }

       // The replace thingy is for Safari compatibility
       var date = new Date(dateTime.replace(/-/g, '/'));

       var formattedDate = date.getDate() + '.' + (date.getMonth() + 1) + '.' +  date.getFullYear();
       var formattedTime = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
       return formattedDate + ' ' + formattedTime;
    };

    /**
     * @returns {boolean}
     */
    var hasLocalStorage = function()
    {
        var test = 'test';
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch(e) {
            return false;
        }
    };

    // Return public vars and methods
    return {
        init: init,
        setConfig: setConfig,
        setTexts: setTexts,
        convertLN2ECM: convertLN2ECM,
        convertRetkipaikka2ECM: convertRetkipaikka2ECM
    };

})(jQuery);
