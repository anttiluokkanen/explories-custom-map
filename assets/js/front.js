ECM.setConfig({
    usePlugin: true,
    markersUrl: ecmWP_front.markers_url,
    routesUrl: ecmWP_front.routes_url,
    lan: ecmWP_front.lan,
    mapInitZoom: parseInt(ecmWP_front.zoom),
    initMode: ecmWP_front.initmode,
    initLocation: {lat: parseFloat(ecmWP_front.lat), lng: parseFloat(ecmWP_front.lng)},
    ecmUrl: ecmWP_front.ecmUrl
});
