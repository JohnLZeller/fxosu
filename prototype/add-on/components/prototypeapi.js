// FxOSU: Intelligent Network Requests

// Web API Interfaces:         https://developer.mozilla.org/en-US/docs/Web/API

// Needs to
//    Battery Level:           https://developer.mozilla.org/en-US/docs/Web/API/BatteryManager.level
//    Charging State:          https://developer.mozilla.org/en-US/docs/Web/API/BatteryManager.charging
//    Recent RX/RX Data:       https://developer.mozilla.org/en-US/docs/Web/API/MozNetworkStatsData
//            https://developer.mozilla.org/en-US/docs/Web/API/Network_Stats_API
//    Latency network info: 
//        maybe?               https://developer.mozilla.org/en-US/docs/Web/API/Performance.timing

// Also
//    be Developer configurable
//    function without error on Desktop, Android and OS

// Other Interesting:
//    Wifi:                    https://developer.mozilla.org/en-US/docs/Web/API/MozWifiConnectionInfoEvent
//    MobileNetworkInfo:       https://developer.mozilla.org/en-US/docs/Web/API/MozMobileNetworkInfo
//    CellInfo:                https://developer.mozilla.org/en-US/docs/Web/API/MozMobileCellInfo
//    MobileConnection:        https://developer.mozilla.org/en-US/docs/Web/API/MozMobileConnectionInfo
//    NetworkStats:            https://developer.mozilla.org/en-US/docs/Web/API/MozNetworkStats
//    NetworkStatsManager:     https://developer.mozilla.org/en-US/docs/Web/API/MozNetworkStatsManager

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function MozIsNowGood() {
  //this.wrappedJSObject = this;

  // Battery Stats
  //var battery = window.navigator.battery;
  //document.getElementById('batteryLevel').innerHTML = battery.level * 100;
  //document.getElementById('batteryCharging').innerHTML = battery.charging; // takes about 5 seconds to populate

  // Network Stats
  /*
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
  }*/
  //var statsData = MozNetworkStatsData;
  //alert("");

  //document.getElementById('recentSince').innerHTML = config.start.toString());
  //document.getElementById('recentRx').innerHTML = (total.receive * 1000).toFixed(2);
  //document.getElementById('recentTx').innerHTML = (total.send * 1000).toFixed(2);
  //document.getElementById('latencyNetworkInfo').innerHTML = "";
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
