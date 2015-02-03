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
      connectionType: connectionType()
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
    window.onload = function(){
      setTimeout(function(){
        var t = window.performance.timing;
        timeInfo = {};
        timeInfo.navigation_type = window.performance.navigation.type;
        timeInfo.navigation_redirectCount = window.performance.navigation.redirectCount;
        timeInfo.prep = t.redirectStart - t.navigationStart;
        timeInfo.redirect = t.redirectEnd - t.redirectStart;
        timeInfo.unload = t.unloadEventEnd - t.unloadEventStart;
        timeInfo.r_to_f = t.fetchStart - t.redirectEnd;
        timeInfo.fetch = t.domainLookupStart - t.fetchStart;
        timeInfo.dnslookup = t.domainLookupEnd - t.domainLookupStart;
        timeInfo.d_to_c = t.connectStart - t.domainLookupEnd;
        timeInfo.connection = t.connectEnd - t.connectStart;
        timeInfo.c_to_req = t.requestStart - t.connectEnd;
        timeInfo.request = t.responseStart - t.requestStart;
        timeInfo.response = t.responseEnd - t.responseStart;
        timeInfo.res_to_dom = t.domLoading - t.responseEnd;
        timeInfo.domLoading = t.domInteractive - t.domLoading;
        timeInfo.domInteractive = t.domContentLoadedEventStart - t.domInteractive;
        timeInfo.domContentLoaded = t.domContentLoadedEventEnd - t.domContentLoadedEventStart;
        timeInfo.domComplete = t.domComplete - t.domContentLoadedEventEnd;
        timeInfo.dom_to_onload = t.loadEventStart - t.domComplete;
        timeInfo.loadEvent = t.loadEventEnd - t.loadEventStart;
        timeInfo.networkLatency = t.responseEnd - t.fetchStart;
        timeInfo.pageLoadingTime = t.loadEventEnd - t.responseEnd;
        timeInfo.totalTimeElapsed = t.loadEventEnd - t.navigationStart;
      }, 0);
    }
    return timeInfo;
  }

  // Non-Requirement functionality
  function connectionType() {
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection.type;
  }

  function connectionQuality() {
    // Possibly Useful
      // navigator.connection.bandwidth;
      // navigator.connection.metered; // pay-per-use
      
    switch (connectionType()) {
      case 'wifi':
      case 'cellular':
      default:
    }
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
