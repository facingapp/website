/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

    compass: null,
    geolocation: null,
    acceleration: null,

    compassSettings: { frequency: 3000 },
    geolocationSettings: { maximumAge: 3000, timeout: 30000, enableHighAccuracy: true },
    accSettings: { frequency: 3000 },

    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');

        setTimeout(function() {
            navigator.splashscreen.hide();
        }, 2000);
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {

        if(id == 'deviceready')
        {
            app.startWatchers();
        }

        console.log('Received Event: ' + id);
    },
    clearWatchers: function()
    {
        navigator.compass.clearWatch(app.compass);
        navigator.geolocation.clearWatch(app.geolocation);
        navigator.accelerometer.clearWatch(app.acceleration);

        app.compass = null;
        app.geolocation = null;
        app.acceleration = null;

        console.log('Stopped Watching');
    },
    startWatchers: function()
    {
        app.watchGeolocation();
        app.watchCompass();
        app.watchAcceleration();
    },
    watchCompass: function()
    {
        app.geolocation = navigator.compass.watchHeading(app.compassSuccess, app.compassError, app.compassSettings);

        console.log('Started Watching Compass');
    },
    watchGeolocation: function()
    {
        app.geolocation = navigator.geolocation.watchPosition(app.geolocationSuccess, app.geolocationError, app.geolocationSettings);

        console.log('Started Watching Geolocation');
    },
    watchAcceleration: function()
    {
        app.acceleration = navigator.accelerometer.watchAcceleration(app.accelerationSuccess, app.accelerationError, app.accelerationSettings);

        console.log('Started Watching Acceleration');
    },
    compassSuccess: function(heading)
    {
        var htmlList = '' +
            '<li><strong>Direction</strong>:&nbsp; ' + app.compassGetDirection(heading.magneticHeading) + '</li>' +
            '<li><strong>Magnetic Heading</strong>:&nbsp; ' + heading.magneticHeading + ' &deg;</li>';

        $('#compass ul').html(htmlList);
    },
    compassError: function(error)
    {
        console.error('Compass Error: ' + error.message);
        $('#compass ul').html('<li class="error">'+ error.message +'</li>');
    },
    compassGetDirection: function(headingDegrees)
    {
        if (headingDegrees < 0 || headingDegrees > 360 || isNaN(headingDegrees) )
        {
            return "--";
        }
        else if (headingDegrees >= 0 && headingDegrees <= 11.25)
        {
            return "N";
        }
        else if (headingDegrees > 348.75 && headingDegrees <= 360)
        {
            return "N";
        }
        else if (headingDegrees > 11.25 && headingDegrees <= 33.75)
        {
            return "NNE";
        }
        else if (headingDegrees > 33.75 && headingDegrees <= 56.25)
        {
            return "NE";
        }
        else if (headingDegrees > 56.25 && headingDegrees <= 78.75)
        {
            return "ENE";
        }
        else if (headingDegrees > 78.75 && headingDegrees <= 101.25)
        {
            return "E";
        }
        else if (headingDegrees > 101.25 && headingDegrees <= 123.75)
        {
            return "ESE";
        }
        else if (headingDegrees > 123.75 && headingDegrees <= 146.25)
        {
            return "SE";
        }
        else if (headingDegrees > 146.25 && headingDegrees <= 168.75)
        {
            return "SSE";
        }
        else if (headingDegrees > 168.75 && headingDegrees <= 191.25)
        {
            return "S";
        }
        else if (headingDegrees > 191.25 && headingDegrees <= 213.75)
        {
            return "SSW";
        }
        else if (headingDegrees > 213.75 && headingDegrees <= 236.25)
        {
            return "SW";
        }
        else if (headingDegrees > 236.25 && headingDegrees <= 258.75)
        {
            return "WSW";
        }
        else if (headingDegrees > 258.75 && headingDegrees <= 281.25)
        {
            return "W";
        }
        else if (headingDegrees > 281.25 && headingDegrees <= 303.75)
        {
            return "WNW";
        }
        else if (headingDegrees > 303.75 && headingDegrees <= 326.25)
        {
            return "NW";
        }
        else if (headingDegrees > 326.25 && headingDegrees <= 348.75)
        {
            return "NNW";
        }
    },
    geolocationSuccess: function(position)
    {
        var htmlList = '' +
            '<li><strong>Latitude</strong>:&nbsp; ' + position.coords.latitude + ' &deg;</li>' +
            '<li><strong>Longitude</strong>:&nbsp; ' + position.coords.longitude + ' &deg;</li>' +
            '<li><strong>Altitude</strong>:&nbsp; ' + app.geolocationDistance( position.coords.altitude ) + '</li>' +
            '<li><strong>Accuracy</strong>:&nbsp; ' + app.geolocationDistance( position.coords.accuracy ) + '</li>' +
            '<li><strong>Heading</strong>:&nbsp; ' + app.compassGetDirection(position.coords.heading) + '</li>' +
            '<li><strong>Speed</strong>:&nbsp; ' + app.geolocationSpeed( position.coords.speed ) + '</li>';

        $('#geolocation ul').html(htmlList);
    },
    geolocationError: function(error)
    {
        console.error('Geolocation Error: ' + error.message);
        $('#geolocation ul').html('<li class="error">'+ error.message +'</li>');
    },
    geolocationDistance: function(value, use_metric)
    {
        var measure = (use_metric) ? +(Math.round(value + "e+2")  + "e-2") : Math.round( value * 3 );
        var unit = (use_metric) ? 'Meters' : 'Feet';

        if(measure < 0)
        {
            measure = 0;
        }

        return measure + ' ' + unit;
    },
    geolocationSpeed: function(value, use_metric)
    {
        var measure = (use_metric) ? Math.round(value) : Math.round( value * 2.23694 );
        var unit = (use_metric) ? 'mps' : 'MPH';

        if(measure < 0)
        {
            measure = 0;
        }

        return measure + ' ' + unit;
    },
    accelerationSuccess: function(acceleration)
    {
        var htmlList = '' +
            '<li><strong>X</strong>:&nbsp; ' + acceleration.x + '</li>' +
            '<li><strong>Y</strong>:&nbsp; ' + acceleration.y + '</li>' +
            '<li><strong>Z</strong>:&nbsp; ' + acceleration.z + '</li>';

        $('#acceleration ul').html(htmlList);
    },
    accelerationError: function()
    {
        console.error('Failed to use acceleration');
        $('#acceleration ul').html('<li class="error">Failed to use acceleration</li>');
    }
};