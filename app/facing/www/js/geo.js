/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy representation conversion functions                       (c) Chris Veness 2002-2014  */
/*   - www.movable-type.co.uk/scripts/latlong.html                                                */
/*                                                                                                */
/*  Sample usage:                                                                                 */
/*    var lat = Geo.parseDMS('51° 28′ 40.12″ N');                                                 */
/*    var lon = Geo.parseDMS('000° 00′ 05.31″ W');                                                */
/*    var p1 = new LatLon(lat, lon);                                                              */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/* jshint node:true *//* global define */
'use strict';


/**
 * Tools for converting between numeric degrees and degrees / minutes / seconds.
 *
 * @namespace
 */
var Geo = {};


// note Unicode Degree = U+00B0. Prime = U+2032, Double prime = U+2033


/**
 * Parses string representing degrees/minutes/seconds into numeric degrees.
 *
 * This is very flexible on formats, allowing signed decimal degrees, or deg-min-sec optionally
 * suffixed by compass direction (NSEW). A variety of separators are accepted (eg 3° 37′ 09″W).
 * Seconds and minutes may be omitted.
 *
 * @param   {string|number} dmsStr - Degrees or deg/min/sec in variety of formats.
 * @returns {number} Degrees as decimal number.
 */
Geo.parseDMS = function(dmsStr) {
	// check for signed decimal degrees without NSEW, if so return it directly
	if (typeof dmsStr == 'number' && isFinite(dmsStr)) return Number(dmsStr);

	// strip off any sign or compass dir'n & split out separate d/m/s
	var dms = String(dmsStr).trim().replace(/^-/,'').replace(/[NSEW]$/i,'').split(/[^0-9.,]+/);
	if (dms[dms.length-1]=='') dms.splice(dms.length-1);  // from trailing symbol

	if (dms == '') return NaN;

	// and convert to decimal degrees...
	var deg;
	switch (dms.length) {
		case 3:  // interpret 3-part result as d/m/s
			deg = dms[0]/1 + dms[1]/60 + dms[2]/3600;
			break;
		case 2:  // interpret 2-part result as d/m
			deg = dms[0]/1 + dms[1]/60;
			break;
		case 1:  // just d (possibly decimal) or non-separated dddmmss
			deg = dms[0];
			// check for fixed-width unseparated format eg 0033709W
			//if (/[NS]/i.test(dmsStr)) deg = '0' + deg;  // - normalise N/S to 3-digit degrees
			//if (/[0-9]{7}/.test(deg)) deg = deg.slice(0,3)/1 + deg.slice(3,5)/60 + deg.slice(5)/3600;
			break;
		default:
			return NaN;
	}
	if (/^-|[WS]$/i.test(dmsStr.trim())) deg = -deg; // take '-', west and south as -ve

	return Number(deg);
};


/**
 * Converts decimal degrees to deg/min/sec format
 *  - degree, prime, double-prime symbols are added, but sign is discarded, though no compass
 *    direction is added.
 *
 * @private
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Geo.toDMS = function(deg, format, dp) {
	if (isNaN(deg)) return null;  // give up here if we can't make a number from deg

	// default values
	if (typeof format == 'undefined') format = 'dms';
	if (typeof dp == 'undefined') {
		switch (format) {
			case 'd':   dp = 4; break;
			case 'dm':  dp = 2; break;
			case 'dms': dp = 0; break;
			default:    format = 'dms'; dp = 0;  // be forgiving on invalid format
		}
	}

	deg = Math.abs(deg);  // (unsigned result ready for appending compass dir'n)

	var dms, d, m, s;
	switch (format) {
		default: // invalid format spec!
		case 'd':
			d = deg.toFixed(dp);     // round degrees
			if (d<100) d = '0' + d;  // pad with leading zeros
			if (d<10) d = '0' + d;
			dms = d + '°';
			break;
		case 'dm':
			var min = (deg*60).toFixed(dp);  // convert degrees to minutes & round
			d = Math.floor(min / 60);    // get component deg/min
			m = (min % 60).toFixed(dp);  // pad with trailing zeros
			if (d<100) d = '0' + d;          // pad with leading zeros
			if (d<10) d = '0' + d;
			if (m<10) m = '0' + m;
			dms = d + '°' + m + '′';
			break;
		case 'dms':
			var sec = (deg*3600).toFixed(dp);  // convert degrees to seconds & round
			d = Math.floor(sec / 3600);    // get component deg/min/sec
			m = Math.floor(sec/60) % 60;
			s = (sec % 60).toFixed(dp);    // pad with trailing zeros
			if (d<100) d = '0' + d;            // pad with leading zeros
			if (d<10) d = '0' + d;
			if (m<10) m = '0' + m;
			if (s<10) s = '0' + s;
			dms = d + '°' + m + '′' + s + '″';
			break;
	}

	return dms;
};


/**
 * Converts numeric degrees to deg/min/sec latitude (2-digit degrees, suffixed with N/S).
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Geo.toLat = function(deg, format, dp) {
	var lat = Geo.toDMS(deg, format, dp);
	return lat===null ? '–' : lat.slice(1) + (deg<0 ? 'S' : 'N');  // knock off initial '0' for lat!
};


/**
 * Convert numeric degrees to deg/min/sec longitude (3-digit degrees, suffixed with E/W)
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Geo.toLon = function(deg, format, dp) {
	var lon = Geo.toDMS(deg, format, dp);
	return lon===null ? '–' : lon + (deg<0 ? 'W' : 'E');
};


/**
 * Converts numeric degrees to deg/min/sec as a bearing (0°..360°)
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Geo.toBrng = function(deg, format, dp) {
	deg = (Number(deg)+360) % 360;  // normalise -ve values to 180°..360°
	var brng =  Geo.toDMS(deg, format, dp);
	return brng===null ? '–' : brng.replace('360', '0');  // just in case rounding took us up to 360°!
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/** Extend Number object with method to  trim whitespace from string
 *  (q.v. blog.stevenlevithan.com/archives/faster-trim-javascript) */
if (typeof String.prototype.trim == 'undefined') {
	String.prototype.trim = function() {
		return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	};
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = Geo; // CommonJS
if (typeof define == 'function' && define.amd) define([], function() { return Geo; }); // AMD

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Latitude/longitude spherical geodesy formulae & scripts           (c) Chris Veness 2002-2014  */
/*   - www.movable-type.co.uk/scripts/latlong.html                                                */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/* jshint node:true *//* global define */
'use strict';
if (typeof module!='undefined' && module.exports) var Geo = require('./geo'); // CommonJS (Node.js)


/**
 * Creates a LatLon point on the earth's surface at the specified latitude / longitude.
 *
 * @classdesc Tools for geodetic calculations
 * @requires Geo
 *
 * @constructor
 * @param {number} lat - Latitude in degrees.
 * @param {number} lon - Longitude in degrees.
 * @param {number} [height=0] - Height above mean-sea-level in kilometres.
 * @param {number} [radius=6371] - (Mean) radius of earth in kilometres.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119);
 */
function LatLon(lat, lon, height, radius) {
	// allow instantiation without 'new'
	if (!(this instanceof LatLon)) return new LatLon(lat, lon, height, radius);

	if (typeof height == 'undefined') height = 0;
	if (typeof radius == 'undefined') radius = 6371;
	radius = Math.min(Math.max(radius, 6353), 6384);

	this.lat    = Number(lat);
	this.lon    = Number(lon);
	this.height = Number(height);
	this.radius = Number(radius);
}


/**
 * Returns the distance from 'this' point to destination point (using haversine formula).
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number} Distance between this point and destination point, in km (on sphere of 'this' radius).
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119), p2 = new LatLon(48.857, 2.351);
 *     var d = p1.distanceTo(p2); // d.toPrecision(4): 404.3
 */
LatLon.prototype.distanceTo = function(point) {
	var R = this.radius;
	var φ1 = this.lat.toRadians(),  λ1 = this.lon.toRadians();
	var φ2 = point.lat.toRadians(), λ2 = point.lon.toRadians();
	var Δφ = φ2 - φ1;
	var Δλ = λ2 - λ1;

	var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
		Math.cos(φ1) * Math.cos(φ2) *
		Math.sin(Δλ/2) * Math.sin(Δλ/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var d = R * c;

	return d;
};


/**
 * Returns the (initial) bearing from 'this' point to destination point.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number} Initial bearing in degrees from north.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119), p2 = new LatLon(48.857, 2.351);
 *     var b1 = p1.bearingTo(p2); // b1.toFixed(1): 156.2
 */
LatLon.prototype.bearingTo = function(point) {
	var φ1 = this.lat.toRadians(), φ2 = point.lat.toRadians();
	var Δλ = (point.lon-this.lon).toRadians();

	// see http://mathforum.org/library/drmath/view/55417.html
	var y = Math.sin(Δλ) * Math.cos(φ2);
	var x = Math.cos(φ1)*Math.sin(φ2) -
		Math.sin(φ1)*Math.cos(φ2)*Math.cos(Δλ);
	var θ = Math.atan2(y, x);

	return (θ.toDegrees()+360) % 360;
};


/**
 * Returns final bearing arriving at destination destination point from 'this' point; the final bearing
 * will differ from the initial bearing by varying degrees according to distance and latitude.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number} Final bearing in degrees from north.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119), p2 = new LatLon(48.857, 2.351);
 *     var b2 = p1.finalBearingTo(p2); // p2.toFixed(1): 157.9
 */
LatLon.prototype.finalBearingTo = function(point) {
	// get initial bearing from destination point to this point & reverse it by adding 180°
	return ( point.bearingTo(this)+180 ) % 360;
};


/**
 * Returns the midpoint between 'this' point and the supplied point.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {LatLon} Midpoint between this point and the supplied point.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119), p2 = new LatLon(48.857, 2.351);
 *     var pMid = p1.midpointTo(p2); // pMid.toString(): 50.5363°N, 001.2746°E
 */
LatLon.prototype.midpointTo = function(point) {
	// see http://mathforum.org/library/drmath/view/51822.html for derivation

	var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
	var φ2 = point.lat.toRadians();
	var Δλ = (point.lon-this.lon).toRadians();

	var Bx = Math.cos(φ2) * Math.cos(Δλ);
	var By = Math.cos(φ2) * Math.sin(Δλ);

	var φ3 = Math.atan2(Math.sin(φ1)+Math.sin(φ2),
		Math.sqrt( (Math.cos(φ1)+Bx)*(Math.cos(φ1)+Bx) + By*By) );
	var λ3 = λ1 + Math.atan2(By, Math.cos(φ1) + Bx);
	λ3 = (λ3+3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180º

	return new LatLon(φ3.toDegrees(), λ3.toDegrees());
};


/**
 * Returns the destination point from 'this' point having travelled the given distance on the
 * given initial bearing (bearing normally varies around path followed).
 *
 * @param   {number} brng - Initial bearing in degrees.
 * @param   {number} dist - Distance in km (on sphere of 'this' radius).
 * @returns {LatLon} Destination point.
 *
 * @example
 *     var p1 = new LatLon(51.4778, -0.0015);
 *     var p2 = p1.destinationPoint(300.7, 7.794); // p2.toString(): 51.5135°N, 000.0983°W
 */
LatLon.prototype.destinationPoint = function(brng, dist) {
	// see http://williams.best.vwh.net/avform.htm#LL

	var θ = Number(brng).toRadians();
	var δ = Number(dist) / this.radius; // angular distance in radians

	var φ1 = this.lat.toRadians();
	var λ1 = this.lon.toRadians();

	var φ2 = Math.asin( Math.sin(φ1)*Math.cos(δ) +
		Math.cos(φ1)*Math.sin(δ)*Math.cos(θ) );
	var λ2 = λ1 + Math.atan2(Math.sin(θ)*Math.sin(δ)*Math.cos(φ1),
			Math.cos(δ)-Math.sin(φ1)*Math.sin(φ2));
	λ2 = (λ2+3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180º

	return new LatLon(φ2.toDegrees(), λ2.toDegrees());
};


/**
 * Returns the point of intersection of two paths defined by point and bearing.
 *
 * @param   {LatLon} p1 - First point.
 * @param   {number} brng1 - Initial bearing from first point.
 * @param   {LatLon} p2 - Second point.
 * @param   {number} brng2 - Initial bearing from second point.
 * @returns {LatLon} Destination point (null if no unique intersection defined).
 *
 * @example
 *     var p1 = LatLon(51.8853, 0.2545), brng1 = 108.547;
 *     var p2 = LatLon(49.0034, 2.5735), brng2 =  32.435;
 *     var pInt = LatLon.intersection(p1, brng1, p2, brng2); // pInt.toString(): 50.9076°N, 004.5084°E
 */
LatLon.intersection = function(p1, brng1, p2, brng2) {
	// see http://williams.best.vwh.net/avform.htm#Intersection

	var φ1 = p1.lat.toRadians(), λ1 = p1.lon.toRadians();
	var φ2 = p2.lat.toRadians(), λ2 = p2.lon.toRadians();
	var θ13 = Number(brng1).toRadians(), θ23 = Number(brng2).toRadians();
	var Δφ = φ2-φ1, Δλ = λ2-λ1;

	var δ12 = 2*Math.asin( Math.sqrt( Math.sin(Δφ/2)*Math.sin(Δφ/2) +
		Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)*Math.sin(Δλ/2) ) );
	if (δ12 == 0) return null;

	// initial/final bearings between points
	var θ1 = Math.acos( ( Math.sin(φ2) - Math.sin(φ1)*Math.cos(δ12) ) /
		( Math.sin(δ12)*Math.cos(φ1) ) );
	if (isNaN(θ1)) θ1 = 0; // protect against rounding
	var θ2 = Math.acos( ( Math.sin(φ1) - Math.sin(φ2)*Math.cos(δ12) ) /
		( Math.sin(δ12)*Math.cos(φ2) ) );

	var θ12, θ21;
	if (Math.sin(λ2-λ1) > 0) {
		θ12 = θ1;
		θ21 = 2*Math.PI - θ2;
	} else {
		θ12 = 2*Math.PI - θ1;
		θ21 = θ2;
	}

	var α1 = (θ13 - θ12 + Math.PI) % (2*Math.PI) - Math.PI; // angle 2-1-3
	var α2 = (θ21 - θ23 + Math.PI) % (2*Math.PI) - Math.PI; // angle 1-2-3

	if (Math.sin(α1)==0 && Math.sin(α2)==0) return null; // infinite intersections
	if (Math.sin(α1)*Math.sin(α2) < 0) return null;      // ambiguous intersection

	//α1 = Math.abs(α1);
	//α2 = Math.abs(α2);
	// ... Ed Williams takes abs of α1/α2, but seems to break calculation?

	var α3 = Math.acos( -Math.cos(α1)*Math.cos(α2) +
		Math.sin(α1)*Math.sin(α2)*Math.cos(δ12) );
	var δ13 = Math.atan2( Math.sin(δ12)*Math.sin(α1)*Math.sin(α2),
			Math.cos(α2)+Math.cos(α1)*Math.cos(α3) );
	var φ3 = Math.asin( Math.sin(φ1)*Math.cos(δ13) +
		Math.cos(φ1)*Math.sin(δ13)*Math.cos(θ13) );
	var Δλ13 = Math.atan2( Math.sin(θ13)*Math.sin(δ13)*Math.cos(φ1),
			Math.cos(δ13)-Math.sin(φ1)*Math.sin(φ3) );
	var λ3 = λ1 + Δλ13;
	λ3 = (λ3+3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180º

	return new LatLon(φ3.toDegrees(), λ3.toDegrees());
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/**
 * Returns the distance travelling from 'this' point to destination point along a rhumb line.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number} Distance in km between this point and destination point (on sphere of 'this' radius).
 *
 * @example
 *     var p1 = new LatLon(51.127, 1.338), p2 = new LatLon(50.964, 1.853);
 *     var d = p1.distanceTo(p2); // d.toPrecision(4): 40.31
 */
LatLon.prototype.rhumbDistanceTo = function(point) {
	// see http://williams.best.vwh.net/avform.htm#Rhumb

	var R = this.radius;
	var φ1 = this.lat.toRadians(), φ2 = point.lat.toRadians();
	var Δφ = φ2 - φ1;
	var Δλ = Math.abs(point.lon-this.lon).toRadians();
	// if dLon over 180° take shorter rhumb line across the anti-meridian:
	if (Math.abs(Δλ) > Math.PI) Δλ = Δλ>0 ? -(2*Math.PI-Δλ) : (2*Math.PI+Δλ);

	// on Mercator projection, longitude distances shrink by latitude; q is the 'stretch factor'
	// q becomes ill-conditioned along E-W line (0/0); use empirical tolerance to avoid it
	var Δψ = Math.log(Math.tan(φ2/2+Math.PI/4)/Math.tan(φ1/2+Math.PI/4));
	var q = Math.abs(Δψ) > 10e-12 ? Δφ/Δψ : Math.cos(φ1);

	// distance is pythagoras on 'stretched' Mercator projection
	var δ = Math.sqrt(Δφ*Δφ + q*q*Δλ*Δλ); // angular distance in radians
	var dist = δ * R;

	return dist;
};


/**
 * Returns the bearing from 'this' point to destination point along a rhumb line.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number} Bearing in degrees from north.
 *
 * @example
 *     var p1 = new LatLon(51.127, 1.338), p2 = new LatLon(50.964, 1.853);
 *     var d = p1.rhumbBearingTo(p2); // d.toFixed(1): 116.7
 */
LatLon.prototype.rhumbBearingTo = function(point) {
	var φ1 = this.lat.toRadians(), φ2 = point.lat.toRadians();
	var Δλ = (point.lon-this.lon).toRadians();
	// if dLon over 180° take shorter rhumb line across the anti-meridian:
	if (Math.abs(Δλ) > Math.PI) Δλ = Δλ>0 ? -(2*Math.PI-Δλ) : (2*Math.PI+Δλ);

	var Δψ = Math.log(Math.tan(φ2/2+Math.PI/4)/Math.tan(φ1/2+Math.PI/4));

	var θ = Math.atan2(Δλ, Δψ);

	return (θ.toDegrees()+360) % 360;
};


/**
 * Returns the destination point having travelled along a rhumb line from 'this' point the given
 * distance on the  given bearing.
 *
 * @param   {number} brng - Bearing in degrees from north.
 * @param   {number} dist - Distance in km (on sphere of 'this' radius).
 * @returns {LatLon} Destination point.
 *
 * @example
 *     var p1 = new LatLon(51.127, 1.338);
 *     var p2 = p1.rhumbDestinationPoint(116.7, 40.31); // p2.toString(): 50.9641°N, 001.8531°E
 */
LatLon.prototype.rhumbDestinationPoint = function(brng, dist) {
	var δ = Number(dist) / this.radius; // angular distance in radians
	var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
	var θ = Number(brng).toRadians();

	var Δφ = δ * Math.cos(θ);

	var φ2 = φ1 + Δφ;
	// check for some daft bugger going past the pole, normalise latitude if so
	if (Math.abs(φ2) > Math.PI/2) φ2 = φ2>0 ? Math.PI-φ2 : -Math.PI-φ2;

	var Δψ = Math.log(Math.tan(φ2/2+Math.PI/4)/Math.tan(φ1/2+Math.PI/4));
	var q = Math.abs(Δψ) > 10e-12 ? Δφ / Δψ : Math.cos(φ1); // E-W course becomes ill-conditioned with 0/0

	var Δλ = δ*Math.sin(θ)/q;

	var λ2 = λ1 + Δλ;

	λ2 = (λ2 + 3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180º

	return new LatLon(φ2.toDegrees(), λ2.toDegrees());
};


/**
 * Returns the loxodromic midpoint (along a rhumb line) between 'this' point and second point.
 *
 * @param   {LatLon} point - Latitude/longitude of second point.
 * @returns {LatLon} Midpoint between this point and second point.
 *
 * @example
 *     var p1 = new LatLon(51.127, 1.338), p2 = new LatLon(50.964, 1.853);
 *     var p2 = p1.rhumbMidpointTo(p2); // p2.toString(): 51.0455°N, 001.5957°E
 */
LatLon.prototype.rhumbMidpointTo = function(point) {
	// http://mathforum.org/kb/message.jspa?messageID=148837

	var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
	var φ2 = point.lat.toRadians(), λ2 = point.lon.toRadians();

	if (Math.abs(λ2-λ1) > Math.PI) λ1 += 2*Math.PI; // crossing anti-meridian

	var φ3 = (φ1+φ2)/2;
	var f1 = Math.tan(Math.PI/4 + φ1/2);
	var f2 = Math.tan(Math.PI/4 + φ2/2);
	var f3 = Math.tan(Math.PI/4 + φ3/2);
	var λ3 = ( (λ2-λ1)*Math.log(f3) + λ1*Math.log(f2) - λ2*Math.log(f1) ) / Math.log(f2/f1);

	if (!isFinite(λ3)) λ3 = (λ1+λ2)/2; // parallel of latitude

	λ3 = (λ3 + 3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180º

	return new LatLon(φ3.toDegrees(), λ3.toDegrees());
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/**
 * Returns a string representation of 'this' point, formatted as degrees, degrees+minutes, or
 * degrees+minutes+seconds.
 *
 * @param   {string} [format=dms] - Format point as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use - default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Comma-separated latitude/longitude.
 */
LatLon.prototype.toString = function(format, dp) {
	if (typeof format == 'undefined') format = 'dms';

	return Geo.toLat(this.lat, format, dp) + ', ' + Geo.toLon(this.lon, format, dp);
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/** Extend Number object with method to convert numeric degrees to radians */
if (typeof Number.prototype.toRadians == 'undefined') {
	Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}


/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (typeof Number.prototype.toDegrees == 'undefined') {
	Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = LatLon; // CommonJS
if (typeof define == 'function' && define.amd) define(['Geo'], function() { return LatLon; }); // AMD