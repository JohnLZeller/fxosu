// FxOSU: Intelligent Network Requests

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function MozIsNowGood(level) {
  level = typeof level !== 'undefined' ? level : 2;
  // Levels of certainty
    // 1 - High
    // 2 - Moderate
    // 3 - Low

  //this.wrappedJSObject = this;

  function batteryLevel() {
    var battery = window.navigator.battery;
    return battery.level;
  }

  function chargingState() {
    var battery = window.navigator.battery;
    return battery.charging; // takes about 5 seconds to populate
  }

  function recentRxTx() {
    // Code below from an example
    var rate = navigator.mozNetworkStats.sampleRate;
    var max  = navigator.mozNetworkStats.maxStorageSample;

    var config = {
      start: new Date() - (rate * max), // This allows to get all the available data chunks.
      end  : new Date(),
      connectionType: 'wifi'
    };

    var request = navigator.mozNetworkStats.getNetworkStats(config);

    request.onsuccess = function () {
      var total = {
        receive: 0,
        send   : 0
      };

      this.result.forEach(function (chunk) {
        total.receive += chunk.rxBytes;
        total.send    += chunk.txBytes;
      });
    }

    return total.receive, total.send;
  }

  function latencyInfo() {

  }

  // Non-Requirement functionality
  function connectionType() {

  }

  function connectionQuality() {

  }

  // Logic - Currently placeholder logic
  switch(level) {
    case 1:
      if (batteryLevel() > 0.90) {
        return true;
      } else {
        return false;
      }
    case 2:
      if (batteryLevel() > 0.60) {
        return true;
      } else {
        return false;
      }
    case 3:
      if (batteryLevel() > 0.30) {
        return true;
      } else {
        return false;
      }
    default:
      return true; // so we don't block
  }
}
MozIsNowGood.prototype = {

  // this must match whatever is in chrome.manifest!
  classID: Components.ID("{6d8e2f2c-4c86-4ddf-9744-dbb72b5ad9af}"),

  QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsISupports]),

  hello: function() {
    return "Hello World!";
  }
};

// The following line is what XPCOM uses to create components. Each component prototype
// must have a .classID which is used to create it.
const NSGetFactory = XPCOMUtils.generateNSGetFactory([MozIsNowGood]);
