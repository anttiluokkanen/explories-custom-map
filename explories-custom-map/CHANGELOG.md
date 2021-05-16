# Change Log
This is the changelog for [Explories Custom Map](https://ecm.explories.net/explories-custom-map/documentation/).

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.3.15] - 2021-05-16
### Added
- Route descriptions to convertLocationsDB2ECM function

## [1.3.14] - 2021-05-05
### Added
- Highlight routes on mouse hover
- Alternative default images to be configured in theme. Max one per category.
- Support localized articles from Locationews/Explories API

### Fixed
- Allow opening articles from Locations DB
- Prevent opening articles with no text. Info window retains some data from previous display so it would try to open articles that should not be opened.

## [1.3.13] - 2021-03-17
### Added
- Display alert if ECM has no permission to access location

## [1.3.12] - 2021-02-01
### Added
- {lan} placeholder conversion in articleApiUrl like in url
- Converts all links in article body to `target="_blank"`

## [1.3.11] - 2021-01-31
### Added
- excludeIds property to convertLN2ECM function that can be managed from theme config

## [1.3.10] - 2020-12-13
### Added
- Support for `BOOL allowTranslate` property for external sources to prevent translating content
- Extra event when info window changes content to fire automatic translation (if available)

## [1.3.9] - 2020-12-11
### Added
- Allow {lan} placeholder for language shortcode in external sources

## [1.3.8] - 2020-12-09
### Added
- Download GPX button to content with `hasGpx == true`. Works only with convertLocationsDB2ECM function and uses the Locations API for downloading.
- images/icon-download.svg

### Fixed
- Routes would show even if the category (filter) is not selected

## [1.3.7] - 2020-11-09
### Changed
- convertLocationsDB2ECM to treat routes as a two-dimensional array
- convertLocationsDB2ECM to add description to marker object

### Fixed
- Unnecessary external icon in some infowindows
- Display any article as clickable if it has an articleApiUrl

## [1.3.6] - 2020-10-06
### Added
- Conversion function convertLocationsDB2ECM.
- Class "notranslate" to div#ecmSettings.
- Filters null check to setMarkers.

### Fixed
- Fixed ECMAdminMap to update metadata when marker is created

## [1.3.5] - 2020-09-11
### Fixed
- Duplicate article content.
- Fixed ECMAdminMap for WP.

## [1.3.4] - 2020-01-08
### Changed
- Follow user set to false by default.
- Clicking the user location button again after user location is showed, the map is centered by user location.
- Article card external icon is not shown if the article opens in overlay.
- js/ECM.js
- js/ECM.min.js

## [1.3.3] - 2019-11-22
### Added
- Properties "icon", "latitude" and "longitude" to routes data and documentation.
- Map markers for routes.

### Changed
- js/ECM.js
- js/ECM.min.js
- routes.json

## [1.3.2] - 2019-10-08
### Added
- Support for non-external articles to be opened in ECM article view.
- Routing support with History API (requires server config also, mod_rewrite or similar) for non-external markers (set with config properties routing, ecmUrl and ecmTitle and marker properties articleApiUrl and slug).

### Changed
- documentation/examples/markers.json
- js/ECM.js
- js/ECM.min.js

### Fixed
- Card tag icons on documentation examples.

## [1.3.1] - 2019-10-07
### Added
- Config option "markerClustererOptions".

### Changed
- Removed border from range slider styles.
- Documentation updated.
- css/ecm.css
- css/ecm.min.css
- js/ECM.js
- js/ECM.min.js

## [1.3.0] - 2019-09-17
### Added
- Dark version of default theme.
- Config option "baseTheme" (default theme is light, option for dark theme).
- Config option "themeName" for setting theme images dir for themes loaded based on theme key.
- Config option "tagFiltersIcons" (to show icons in tag filters or not).
- Map controls user location button loader when getting user location.
- images/loading-16-dark.gif
- images/loading-32-dark.gif
- themes/dark/
- themes/default/images/markers/retkipaikka.png

### Changed
- Map type select and map layers checkboxes combined to one select menu.
- Settings panel is now opened on init on mobile as well.
- Settings button behavior (separate close button).
- Moderate style changes (new default themes).
- css/ecm.css
- css/ecm.min.css
- documentation/examples/markers.json (changed icon paths)
- documentation/examples/routes.json (changed icon paths)
- js/ECM.js
- js/ECM.min.js

### Fixed
- Marker icons are now always loaded from the theme images/markers/ directory instead of the local default theme directory.

## [1.2.8] - 2019-08-23
### Added
- Support to open articles via any API in ECM article view.
- Div element data attribute "data-article-api-url".
- Geolocation enbaleHighAccuracy set to true.
- Map scale control.
- Alert if MarkerClusterer fails to load (probably due to private browsing mode).
- Routing support with History API (requires server config also, mod_rewrite or similar) for externalMarkers (set with config properties routing, ecmUrl and ecmTitle).

### Changed
- Minor style changes.
- Documentation updated.
- css/ecm.css
- css/ecm.min.css
- js/ECM.js
- js/ECM.min.js

### Fixed
- Horizontal scroll in settings panel when show user location button is clicked and loading.
- User location animation misplacement.

## [1.2.7] - 2019-08-14
### Fixed
- Issue with filters saving to localStorage as string "null".

### Changed
- css/ecm-admin.css
- css/ecm-admin.min.css
- js/ECM.js
- js/ECM.min.js

## [1.2.6] - 2019-08-06
### Added
- Type, tag and badge filters are now saved in localStorage.
- External markers and map layers settings are now saved in localStorage.
- Map layers can be set on by default in config.
- Updated documentation.

### Changed
- js/ECM.js
- js/ECM.min.js

## [1.2.5] - 2019-07-18
### Added
- Colors for Retkipaikka route difficulty levels.
- Author name and publish date and time in article view.
- Map location and zoom level are now saved in localStorage.

### Changed
- External markers reload based on lat/lng/radius uses now map center instead of config.initLocation.
- css/ecm.css
- css/ecm.min.css
- js/ECM.js
- js/ECM.min.js

## [1.2.4] - 2019-06-28
### Changed
- External markers not marked as external if articleViewUrl is defined and the link is opened in article view.
- Added property external for external markers.
- Minor style changes
- css/ecm.css
- css/ecm.min.css
- js/ECM.js
- js/ECM.min.js

## [1.2.3] - 2019-06-27
### Changed
- js/ECM.js
- js/ECM.min.js

### Fixed
- External markers checkboxes loader not showing on init load.
- Some Retkipaikka articles and places multiple times on the map.

## [1.2.2] - 2019-06-26
### Changed
- Force https on Retkipaikka database images.
- Minor style changes (added partial scoped normalize.css).
- css/ecm.css
- css/ecm.min.css
- js/ECM.js
- js/ECM.min.js

### Fixed
- Minified version errors caused by invalid pluginPath.
- External sources toggle all not checked when checking all boxes manually.
- Route without waypoints breaking everything.

## [1.2.1] - 2019-06-25
### Changed
- Active requests for external markers are now aborted before new request for the same type.
- js/ECM.js
- js/ECM.min.js

### Fixed
- External routes not disappearing on uncheck.

## [1.2.0] - 2019-06-25
### Changed
- Support for multiple externalMarkers fieldsets. Config property "externalMarkersSets" required if using external markers.
- css/ecm.css
- css/ecm.min.css
- js/ECM.js
- js/ECM.min.js

### Fixed
- Minified version errors caused by invalid dirPath.

## [1.1.0] - 2019-06-18
### Added
- Config options showModeButtons, showTypeFilters and showBadgeFilters.
- Support for external source Retkipaikka places database.

### Changed
- Append external stylesheets to body instead of head.
- Cards with no link are no longer shown in feed view.
- Settings panel is shown by default if viewport width > 768px.
- Minor adjustments in article view styles.
- css/ecm.css
- css/ecm.min.css
- js/ECM.js
- js/ECM.min.js

### Fixed
- URL validation for double slash urls (for example //path.to/foo).

## [1.0.1] - 2019-06-13
### Added
- Social media share links in article view.
- Default image for cards in feed and cluster view.
- images/icon-facebook.svg
- images/icon-linkedin.svg
- images/icon-twitter.svg
- themes/default/images/default-img.jpg

### Changed
- css/ecm.css
- css/ecm.css.min
- js/ECM.js
- js/ECM.min.js

## [1.0.0-fix] - 2019-06-07
### Fixed
- Renamed themes/default/images/map-cluster.svg

## [1.0.0] - 2019-06-07
- First release.
