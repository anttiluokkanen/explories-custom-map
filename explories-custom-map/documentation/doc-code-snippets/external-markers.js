externalMarkersSets: [
    {
        id: 'articles',
        showToggleAll: true
    }
],
externalMarkers: {
    myArticles: {
        url: 'https://explori.es/api/news?latitude={lat}&longitude={lng}&radius=50&publicationId=8',
        set: 'articles',
        iconW: 48,
        iconH: 68,
        checked: true,
        reloadOnBoundsChange: true,
        callbackName: 'convertLN2ECM',
        articleViewUrl: 'https://path/to/map/{id}/{slug}',
        external: false
    }
}
