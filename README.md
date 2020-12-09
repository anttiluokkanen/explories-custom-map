# Explories Custom Map

## Description

Explories Custom Map is a geolocation-based map and feed functionality for i.e. outdoor and travel use.

A Google Maps API key is needed with the following libraries: `places,drawing`.

Request an unique theme and a theme key from info@locationews.com to use all functionalities.

More info at [Matkailukartta.fi](https://matkailukartta.fi).

## Installation

1. Upload the plugin files to the `/wp-content/plugins/explories-custom-map` directory or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. Use the Explories Custom Map screen to configure the plugin.
    1. Select post types where you want to use the plugin.
    2. Set Google Maps API key.
    3. Set default location (lat.itude,lon.gitude).
    4. Set default map zoom.
    5. Select default mode.
    6. Select theme or set custom theme key.
    7. Set different route colors.
    8. Set map div offset from top of the page.
    9. Set the page slug where the map shortcode is embedded.
4. Flush permalinks.

## Usage

When writing an article (post, page or map article), the plugin has the following information to adjust:
##### Explories Custom Map
ON/OFF - determines whether the article is added to ECM or not
##### Mode 
Marker/Route, selects the type of the entry you add to the map
##### Categories
Allows you to pick one or more categories for the article. You can edit these categories
at Map Articles -> Explories Custom Map Categories or plugin settings -> Edit categories.

**NOTE: You need to select at least one category for the article to become available on the map.**
##### Symbol
Select the symbol you want to show on the map.
##### Map Layer
Choose Map Layers that should display your article. For example, if you article is only relevant during
winter you can choose only that layer to display it.
##### Map
Pick a location for the marker or draw the route.
##### Link target
Determines how the article should open from the map.
##### Title
Allows showing a different title on the map. Uses the article's title if left empty.
##### Image
Allows showing a different image on the map. Uses the article's image if left empty.
##### URL
Allows using a different URL on the map. Uses the article's URL if left empty.

##### NOTE: If you're using the Polylang plugin, you need to add ECM categories and Map Articles to localizations

## Frequently Asked Questions

### How to embed the map?

Use the shortcode ```[ecm-map]```.

### How to embed the map with feed enabled?

Use the shortcode ```[ecm-map feed="1"]```.

## Changelog
### 1.1.5 (2020-11-09)
- Updated `explories-custom-map` application.
### 1.1.4 (2020-11-09)
- Updated `explories-custom-map` application.
### 1.1.3 (2020-10-08)
- Updated `explories-custom-map` application.
### 1.1.2 (2020-09-13)
- Changes to publishing and caching to make the plugin more reliable.
- Updated `explories-custom-map` application.

### 1.1.1 (2020-05-21)
Include `explories-custom-map` application.

### 1.1.0 (2020-03-03)

### 1.0.0 (2019-08-14)
* NEW:    Release the plugin for public use.

