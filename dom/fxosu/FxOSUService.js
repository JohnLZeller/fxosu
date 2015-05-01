/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const DEBUG = false;
function debug(s) { dump("-*- FxOSUService.js: " + s + "\n"); }

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;
var lastMemEventRes = 0;
var lastMemEventExplicit = 0;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/DOMRequestHelper.jsm");

XPCOMUtils.defineLazyServiceGetter(this, "cpmm",
                                   "@mozilla.org/childprocessmessagemanager;1",
                                   "nsISyncMessageSender");

// Component interface import factory
function importFactory(contractIdentification, interfaceName) {
  try {
    return Cc[contractIdentification].createInstance(interfaceName);
  }
  catch(err) {
    try {
      return Cc[contractIdentification].getService(interfaceName);
    } catch(e) {
      return null;
    }
  }
}

// Import components
var networkLinkService = importFactory("@mozilla.org/network/network-link-service;1", Ci.nsINetworkLinkService);
var memoryReportManager = importFactory("@mozilla.org/memory-reporter-manager;1", Ci.nsIMemoryReporterManager);

const FXOSUSERVICE_CID = "{9c72ce25-06d6-4fb8-ae9c-431652fce848}";
const FXOSUSERVICE_CONTRACTID = "@mozilla.org/fxosuService;1";

// Setup observer receiveMessage function
var requestStats = [];
var responseStats = [];

function receiveMessage(aMessage) {
  switch (aMessage.name) {
    case "NetworkStatsService:Request":
      requestStats.push(aMessage.json);
      break;
    case "NetworkStatsService:Response":
      responseStats.push(aMessage.json);
      dump("RESPONSE: " + aMessage.json.requestSucceeded + " - " + aMessage.json.uri);
      break;
    default:
      if (DEBUG) {
        debug("Wrong message: " + aMessage.name);
      }
  }
}

// Setup listeners
const FXOSU_IPC_MSG_NAMES = ["NetworkStatsService:Request",
                             "NetworkStatsService:Response"];

FXOSU_IPC_MSG_NAMES.forEach(function(aMsgName) {
  cpmm.addMessageListener(aMsgName, receiveMessage);
}, receiveMessage);

function FxOSUService()
{
  if (DEBUG) {
    debug("FxOSUService Constructor");
  }
}

FxOSUService.prototype = {
  __proto__: DOMRequestIpcHelper.prototype,

  debug: function(s) { this.window.console.log("-*- FxOSUService.js: " + s + "\n"); },

  init: function(aWindow) {
    this.window = aWindow;

    // Disabling - Not necessary for testing
    /*
    // Set navigator.mozNetworkStats to null.
    if (!Services.prefs.getBoolPref("dom.mozNetworkStats.enabled")) {
      return null;
    }

    let principal = this.window.document.nodePrincipal;
    let secMan = Services.scriptSecurityManager;
    let perm = principal == secMan.getSystemPrincipal() ?
                 Ci.nsIPermissionManager.ALLOW_ACTION :
                 Services.perms.testExactPermissionFromPrincipal(principal,
                                                                 "networkstats-manage");

    // Only pages with perm set can use the netstats.
    this.hasPrivileges = perm == Ci.nsIPermissionManager.ALLOW_ACTION;

    if (!this.hasPrivileges) {
      Services.perms.addFromPrincipal(principal, "networkstats-manage",
                                    Ci.nsIPermissionManager.ALLOW_ACTION)
    }

    // Init app properties.
    let appsService = Cc["@mozilla.org/AppsService;1"]
                        .getService(Ci.nsIAppsService);

    this.manifestURL = appsService.getManifestURLByLocalId(principal.appId);

    let isApp = !!this.manifestURL.length;
    if (isApp) {
      this.pageURL = principal.URI.spec;
    }
    */

    // Setup Observers
    Services.obs.addObserver(FxOSUService, "xpcom-shutdown", false);
    Services.obs.addObserver(FxOSUService, "memory-pressure", false);
  },

  observe: function(aSubject, aTopic, aData) {
    if (aTopic == "xpcom-shutdown"){
      Services.obs.removeObserver(this, "xpcom-shutdown", false);
      Services.obs.removeObserver(this, "memory-pressure", false);
    }
    else if (aTopic == "memory-pressure"){
      var usage = this.memoryManager();
      var explicit = " Explicit: " + usage[0].toString();
      var resident = " Resident: " + usage[1].toString();
      lastMemEventExplicit = usage[0];
      lastMemEventRes = usage[1];
      this.window.console.log("Memory Pressure Event Happened! " + aData + explicit + resident);
    }
  },  

  //Callable function which displays the current memory usage. Is automatically called when a low-memory event occurs 
  memoryManager: function() {
    this.window.console.log("Resident: " + lastMemEventRes + " Explicit: " + lastMemEventExplicit);
    return {explicit: memoryReportManager.explicit, 
            resident: memoryReportManager.resident};
  },
 
  numRequests: function(lastMillisecs) {
    var end = new Date();
    lastMillisecs = typeof lastMillisecs !== 'undefined' ? lastMillisecs : end.getTime();
    var start = new Date(end - lastMillisecs);

    var sent = 0;

    // Could just return requestStats.length, but we want the option to constrain on time range
    for (var i = 0; i < requestStats.length; i++) {
      if (requestStats[i].date >= start && requestStats[i].date <= end) {
        sent += 1;
      }
    }

    return sent;
  },

  numResponses: function(lastMillisecs) {
    var end = new Date();
    lastMillisecs = typeof lastMillisecs !== 'undefined' ? lastMillisecs : end.getTime();
    var start = new Date(end - lastMillisecs);

    var received = 0;

    // Could just return responseStats.length, but we want the option to constrain on time range
    for (var i = 0; i < responseStats.length; i++) {
      if (responseStats[i].date >= start && responseStats[i].date <= end) {
        received += 1;
      }
    }

    return received;
  },

  receivedBytes: function(lastMillisecs) {
    // TODO: Does NOT account for the fact that a response will not be had if the connection is broken?
    // TODO: Needs bytes attempted

    var end = new Date();
    lastMillisecs = typeof lastMillisecs !== 'undefined' ? lastMillisecs : end.getTime();
    var start = new Date(end - lastMillisecs);
    var recBytes = 0;

    for (var i = 0; i < responseStats.length; i++) {
      if (responseStats[i].date >= start && responseStats[i].date <= end) {
        if (responseStats[i].requestSucceeded) {
          recBytes += responseStats[i].contentLength;
        }
      }
    }
    return recBytes;
  },
  
  /* Returns a dictionary object that holds the rate, # of successes, and number of attempts.
   * In order to ensure that we don't miss counting some, we will assume that all http requests
   * that we witness, MUST be accompanied by an http response (one-to-one). So if everything is 
   * good to go, we should have the same number of each.
   */
  successRate: function(lastMillisecs) {
    // TODO: Check that

    var end = new Date();
    lastMillisecs = typeof lastMillisecs !== 'undefined' ? lastMillisecs : end.getTime();
    var start = new Date(end - lastMillisecs);
    var successes = 0;
    var attempted = this.numRequests(lastMillisecs);
    var rate = 0.00;

    // Count the successful responses
    for (var i = 0; i < responseStats.length; i++) {
      if (responseStats[i].date >= start && responseStats[i].date <= end) {
        if (responseStats[i].requestSucceeded) {
          successes += 1;
        }
      }
    }

   // Make sure that rate stays a float, and not divide-by-zero error
    try {
      rate = successes / attempted;
    } catch(e) {
      rate = 1.00;
    }
    if (attempted === 0) {
      rate = 1.00;
    }

    return {rate: parseFloat(rate),
            successes: parseFloat(successes),
            attempted: parseFloat(attempted)};
  },

  /* Returns the success rate of only the most recent num number of responses.
   * This method may leave out requests that never received a response.
   */
  successRateRecent: function(num) {
    num = typeof num !== 'undefined' ? num : 0;
    
    var successes = 0;
    var rate = 0.00;
    var stats = responseStats.slice(-num); // Clone array

    // Count the successful responses
    for (var i = 0; i < stats.length; i++) {
      if (stats[i].date >= start && stats[i].date <= end) {
        if (stats[i].requestSucceeded) {
          successes += 1;
        }
      }
    }

   // Make sure that rate stays a float, and not divide-by-zero error
    try {
      rate = successes / stats.length;
    } catch(e) {
      rate = 1.00;
    }
    if (stats.length === 0) {
      rate = 1.00;
    }

    return {rate: parseFloat(rate),
            successes: parseFloat(successes),
            attempted: parseFloat(stats.length)};
  },
  
  isConnectionStable: function(lastMillisecs) {
    var end = new Date();
    lastMillisecs = typeof lastMillisecs !== 'undefined' ? lastMillisecs : end.getTime();
    var start = new Date(end - lastMillisecs);
    var stable = true;

    for (var i = 0; i < responseStats.length; i++) {
      if (responseStats[i].date >= start && responseStats[i].date <= end) {
        if (!responseStats[i].requestSucceeded) {
          stable = false;
          break;
        }
      }
    }
    return stable;
  },

  batteryLevel: function() { // This will be false when device is 100%, more than likely
    return this.window.navigator.battery.level;
  },

  batteryCharging: function() {
    return this.window.navigator.battery.charging;
  },

  latencyInfo: function() {
      var t = this.window.performance.timing;
      var timeInfo = {};
      timeInfo.navigation_type = this.window.performance.navigation.type;
      timeInfo.navigation_redirectCount = this.window.performance.navigation.redirectCount;
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
    return timeInfo;
  },

  connectionType: function() {
    // Note: As of Gecko 8.0, all Operating Systems currently return LINK_TYPE_UNKNOWN. 
    //       Android support was backed out due to perceived security concerns, see bug 691054.
    return networkLinkService.linkType; // Returns 0 for UNKNOWN
  },

  connectionUp: function() {
    // Use of networkLinkService.isLinkUp can be unpredictable, which is why you must first 
    // check networkLinkService.linkStatusKnown

    // Want to use this.window.navigator.onLine, but it's not available
    if (networkLinkService.linkStatusKnown) {
      return networkLinkService.isLinkUp;
    } else {
      return true; // so we don't block
    }
  },

  connectionQuality: function() {
    // Return 0 to 1
    // Possibly Useful
      // navigator.connection.bandwidth;
      // navigator.connection.metered; // pay-per-use
      
    switch (this.connectionType()) {
      case networkLinkService.LINK_TYPE_UNKNOWN:
        return 1.00; // so we don't block
      case networkLinkService.LINK_TYPE_ETHERNET:
        break;
      case networkLinkService.LINK_TYPE_USB:
        break;
      case networkLinkService.LINK_TYPE_WIFI:
        break;
      case networkLinkService.LINK_TYPE_WIMAX:
        break;
      case networkLinkService.LINK_TYPE_2G:
        break;
      case networkLinkService.LINK_TYPE_3G:
        break;
      case networkLinkService.LINK_TYPE_4G:
        break;
      default:
        return 1.00; // so we don't block
    }
  },

  // TODO: Add a function that let's you set a global waitSecs variable for mozIsNowGood

  mozIsNowGood: function(level) {
    level = typeof level !== 'undefined' ? level : 2;
    // Levels of certainty
      // 1 - High (requires charging)
      // 2 - Moderate
      // 3 - Low

    var batLev = this.batteryLevel();
    var batCha = this.batteryCharging();
    var waitSecs = 2000; // 2 seconds
    var stable = this.isConnectionStable(waitSecs);
    var success = this.successRate(waitSecs);
    if (DEBUG) {
      dump("Confidence Level: " + level + "\n" +
           "Battery Level: " + batLev + "%\n" +
           "Battery Charging: " + batCha + "\n" +
           "Stable: " + stable + "\n" +
           "Success Rate: " + success.rate.toFixed(2) + "% (" + success.successes + "\\" + success.attempted + ")\n\n");
    }

    // Find reasons to return false only
    switch (level) {
      /* Battery MUST be charging
       * Connection MUST be stable
       * Battery level MUST be greater than 50%
       * Success Rate MUST be 100% within the last waitSecs milliseconds
       */
      case 1:
        if (!batCha ||
            !stable ||
            (batLev < 0.5) ||
            success.rate < 1) { 
          return false; 
        }
        break;

      /* Fails if:
       * Battery is NOT charging, Battery level is LESS than 40%, AND Connection is NOT stable
       * OR
       * Battery is NOT charging, Battery level is LESS than 30%
       * OR
       * Battery level is LESS than 25%
       * OR
       * Success Rate is LESS than 50% within the last waitSecs milliseconds
       */
      case 2:
        if ((!batCha && (batLev < 0.4) && !stable) ||
            (!batCha && (batLev < 0.3)) ||
            (batLev < 0.25) ||
            success.rate < 0.5) { 
          return false; 
        }
        break;

      /* Fails if:
       * Battery level is LESS than 20%, AND Connection is NOT stable
       * OR
       * Battery level is LESS than 10%
       * OR
       * Success Rate is LESS than 5% within the last waitSecs milliseconds
       */
      case 3:
        if (((batLev < 0.2) && !stable) ||
            (batLev < 0.1) ||
            success.rate < 0.05) { 
          return false; 
        }
        break;

      default:
        return true; // Never block
    }

    // Never block
    return true;
  },
 
  classID : Components.ID("{9c72ce25-06d6-4fb8-ae9c-431652fce848}"),
  contractID : "@mozilla.org/fxosuService;1",
  classDescription: "fxOSUService",
  _xpcom_categories: [{ category: "app-startup", service: true }],
  QueryInterface : XPCOMUtils.generateQI([Ci.nsISupports,
                                          Ci.nsIObserver,
                                          Ci.nsIDOMGlobalPropertyInitializer,
                                          Ci.nsISupportsWeakReference]),
}

this.NSGetFactory = XPCOMUtils.generateNSGetFactory([FxOSUService]);
