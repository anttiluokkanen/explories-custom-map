# Change Log
This is the changelog for [Explories Custom Map](https://ecm.explories.net/explories-custom-map/documentation/).

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

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
