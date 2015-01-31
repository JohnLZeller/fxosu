var { Class } = require('sdk/core/heritage');
var { Unknown, Factory } = require('sdk/platform/xpcom');
var { Cc, Ci, Cu } = require('chrome');
var { XPCOMUtils } = Cu.import("resource://gre/modules/XPCOMUtils.jsm");
var { Battery } = Cu.import("resource://gre/modules/Battery.jsm");

//
var webapiname = 'mozisnowgood',
    contractId = '@me.org/' + webapiname;

// Define a component
var NetworkRequestInfo = Class({
  extends: Unknown,

  // XPCOM goop
  get wrappedJSObject() {
    return this;
  },
  QueryInterface: XPCOMUtils.generateQI([
    Ci.nsIDOMGlobalPropertyInitializer,
    Ci.nsIObserver,
    Ci.nsISupportsWeakReference
  ]),

  // Logic of NetworkRequestInfo XPCOM compontent
  batteryLevel: function() { // This will be false when device is 100%, more than likely
    return Battery.level;
  },

  batteryCharging: function() {
    return Battery.charging;
  },

  recentRxTx: function() {
    return false
  },

  latencyInfo: function() {
    return false
  },

  // Non-Requirement functionality
  connectionType: function() {
    return false
  },

  connectionQuality: function() {
    // Possibly Useful
      // navigator.connection.bandwidth;
      // navigator.connection.metered; // pay-per-use
      
    switch (connectionType()) {
      case 'wifi':
      case 'cellular':
      default:
    }
  },

  mozIsNowGood: function(level) {
    level = typeof level !== 'undefined' ? level : 2;
    // Levels of certainty
      // 1 - High
      // 2 - Moderate
      // 3 - Low

    // Logic - Currently placeholder logic
    switch(level) {
      case 1:
        if (this.batteryLevel() > 0.90) {
          return true;
        } else {
          return false;
        }
      case 2:
        if (this.batteryLevel() > 0.60) {
          return true;
        } else {
          return false;
        }
      case 3:
        if (this.batteryLevel() > 0.30) {
          return true;
        } else {
          return false;
        }
      default:
        return true; // so we don't block
    }
  }
});

// Create and register the factory
var factory = Factory({
  contract: contractId,
  Component: NetworkRequestInfo
});

// XPCOM clients can retrieve and use this new component in the normal way
var wrapper = Cc[contractId].createInstance(Ci.nsISupports);
var networkRequestInfo = wrapper.wrappedJSObject;

// Test the xpcom component
console.log("Battery Level: " + networkRequestInfo.batteryLevel());
console.log("Charging: " + networkRequestInfo.batteryCharging());

console.log("mozIsNowGood: " + networkRequestInfo.mozIsNowGood());

// TODO: Register as a new navigator api - not working
/*var Cm = Cc["@mozilla.org/categorymanager;1"].
         getService(Ci.nsICategoryManager);

Cm.addCategoryEntry("JavaScript-navigator-property",
                    webapiname, contractId, false, true);
*/

// TODO: Test the navigator api it adds - not working
/*var pageMod = require("sdk/page-mod");
pageMod.PageMod({
  include: "*",
  contentScript: 'console.log("Testing...", navigator.' + webapiname + ');'
});
*/
