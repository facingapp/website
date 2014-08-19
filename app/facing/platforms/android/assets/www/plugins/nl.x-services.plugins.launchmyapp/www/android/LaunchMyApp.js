cordova.define("nl.x-services.plugins.launchmyapp.LaunchMyApp", function(require, exports, module) { (function () {
    "use strict";
    
    function triggerOpenURL() {
          cordova.exec(
              (typeof handleOpenURL == "function" ? handleOpenURL : null),
              null,
              "LaunchMyApp",
              "checkIntent",
              []);
    }

  document.addEventListener("deviceready", triggerOpenURL, false);
}());

});
