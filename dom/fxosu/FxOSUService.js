/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const DEBUG = true;
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

    // Setup Observers
    Services.obs.addObserver(FxOSUService, "xpcom-shutdown", false);
    Services.obs.addObserver(FxOSUService, "memory-pressure", false);
  },

  observe: function(aSubject, aTopic, aData) 
  {
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
    return [memoryReportManager.explicit, memoryReportManager.resident];
  },
 
  receivedBytes: function(start, end) {
    // TODO: Does NOT account for the fact that a response will not be had if the connection is broken?
    // start and end are expected to be unix time integers
    start = typeof start !== 'undefined' ? new Date(start) : new Date(0);
    end = typeof end !== 'undefined' ? new Date(end) : new Date();
    
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
  
  successRate: function(start, end) {
    // TODO: Check
    // start and end are expected to be unix time integers
    start = typeof start !== 'undefined' ? new Date(start) : new Date(0);
    end = typeof end !== 'undefined' ? new Date(end) : new Date();
    
    var successes = 0;
    for (var i = 0; i < responseStats.length; i++) {
      if (responseStats[i].date >= start && responseStats[i].date <= end) {
        if (responseStats[i].requestSucceeded) {
          successes += 1;
        }
      }
    }
    return {rate: successes / responseStats.length,
            successes: successes,
            attempted: responseStats.length};
  },
 
  isConnectionStable: function(start, end) {
    // start and end are expected to be unix time integers
    start = typeof start !== 'undefined' ? new Date(start) : new Date(0);
    end = typeof end !== 'undefined' ? new Date(end) : new Date();
    
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

  mozIsNowGood: function(level, mustCharge) {
    level = typeof level !== 'undefined' ? level : 2;
    // Levels of certainty
      // 1 - High
      // 2 - Moderate
      // 3 - Low
    var batLev = this.batteryLevel();
    var batCha = this.batteryCharging();
    var conUp = this.connectionUp();
    var conQual = this.connectionQuality();

    // Need internet connection
    if (!conUp) {
      return false;
    }
    if(mustCharge && !batCha){
      return false;
    }

    // Certainty level differences
    switch(parseInt(level)) {
      case 1:
        this.window.console.log("Level parsed as 1");
        // if battery is > 90%, go
        // elif battery is >70% and < 90%, but is charging, go
        // else, nogo
        if (batLev > 0.9) {
          if (conQual > 0.5) {
            return true;
          } else {
            return false;
          }
        } else if ((0.7 < batLev < 0.9) && batCha) {
          if (conQual > 0.5) {
            return true;
          } else {
            return false;
          }
          return true;
        } else {
          if (conQual > 0.7) {
            return true;
          } else if ((conQual > 0.5) && batCha) {
            return true;
          } else {
            return false;
          }
        }
        break;
      case 2:
        this.window.console.log("Level parsed as 2");
        // if battery is > 60%, go
        // elif battery is >30% and < 60%, but is charging, go
        // else, nogo
        if (batLev > 0.6) {
          if (conQual > 0.3) {
            return true;
          } else {
            return false;
          }
        } else if ((0.3 < batLev < 0.6) && batCha) {
          if (conQual > 0.3) {
            return true;
          } else {
            return false;
          }
          return true;
        } else {
          if (conQual > 0.5) {
            return true;
          } else if ((conQual > 0.3) && batCha) {
            return true;
          } else {
            return false;
          }
        }
        break;
      case 3:
        this.window.console.log("Level parsed as 3");
        // if battery is >30%, go
        // elif battery is >10% and < 30%, but is charging, go
        // else, nogo
        if (batLev > 0.3) {
          if (conQual > 0.3) {
            return true;
          } else {
            return false;
          }
        } else if ((0.1 < batLev < 0.3) && batCha) {
          if (conQual > 0.3) {
            return true;
          } else {
            return false;
          }
          return true;
        } else {
          if (conQual > 0.5) {
            return true;
          } else if ((conQual > 0.3) && batCha) {
            return true;
          } else {
            return false;
          }
        }
        break;
      default:
        return true; // so we don't block
    }
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
