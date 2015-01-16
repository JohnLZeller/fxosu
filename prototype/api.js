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

function MozIsNowGood () {
    // Battery Stats
    var battery = window.navigator.battery;
    document.getElementById('batteryLevel').innerHTML = battery.level * 100;
    document.getElementById('batteryCharging').innerHTML = battery.charging; // takes about 5 seconds to populate

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
    var statsData = MozNetworkStatsData;
    alert("");

    //document.getElementById('recentSince').innerHTML = config.start.toString());
    //document.getElementById('recentRx').innerHTML = (total.receive * 1000).toFixed(2);
    //document.getElementById('recentTx').innerHTML = (total.send * 1000).toFixed(2);
    document.getElementById('latencyNetworkInfo').innerHTML = "";
}