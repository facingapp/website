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

    geolocation: null,
    acceleration: null,

    geoSettings: { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true },
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
        navigator.geolocation.clearWatch(app.geolocation);
        navigator.accelerometer.clearWatch(app.acceleration);

        console.log('Stopped Watching');
    },
    startWatchers: function()
    {
        app.watchGeolocation();
        app.watchAcceleration();
    },
    watchGeolocation: function()
    {
        app.geolocation = navigator.geolocation.watchPosition(app.geoSuccess, app.geoError, app.geoSettings);

        console.log('Started Watching Geolocation');
    },
    watchAcceleration: function()
    {
        app.acceleration = navigator.accelerometer.watchAcceleration(app.accSuccess, app.accError, app.accSettings);

        console.log('Started Watching Acceleration');
    },
    geoSuccess: function(position)
    {
        var htmlList = '' +
            '<li><b>Latitude</b>: ' + position.coords.latitude + '</li>' +
            '<li><b>Longitude</b>: ' + position.coords.longitude + '</li>' +
            '<li><b>Altitude</b>: ' + position.coords.altitude + '</li>' +
            '<li><b>Accuracy</b>: ' + position.coords.accuracy + '</li>' +
            '<li><b>Altitude Accuracy</b>: ' + position.coords.altitudeAccuracy + '</li>' +
            '<li><b>Heading</b>: ' + position.coords.heading + '</li>' +
            '<li><b>Speed</b>: ' + position.coords.speed + '</li>';

        $('#geolocation ul').html(htmlList);

       //console.table(position.coords);
    },
    geoError: function(error)
    {
        alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
    },
    accSuccess: function(acceleration)
    {
        var htmlList = '' +
            '<li><b>Acceleration X</b>: ' + acceleration.x + '</li>' +
            '<li><b>Acceleration X</b>: ' + acceleration.y + '</li>' +
            '<li><b>Acceleration X</b>: ' + acceleration.z + '</li>' +
            '<li><b>Timestamp</b>: ' + acceleration.timestamp + '</li>';

        $('#acceleration ul').html(htmlList);

        console.table(acceleration);
    },
    accError: function(error)
    {
        alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
    }
};