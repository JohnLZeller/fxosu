/* -*- Mode: IDL; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0.00. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0.00/.
 */

dictionary SuccessRateObject
{
  float rate = 0.00;
  float successes = 0.00;
  float attempted = 0.00;
};

dictionary LatencyObject 
{
  float navigation_type = 0.00;
  float navigation_redirectCount = 0.00;
  float prep = 0.00;
  float redirect = 0.00;
  float unload = 0.00;
  float r_to_f = 0.00;
  float fetch = 0.00;
  float dnslookup = 0.00;
  float d_to_c = 0.00;
  float connection = 0.00;
  float c_to_req = 0.00;
  float request = 0.00;
  float response = 0.00;
  float res_to_dom = 0.00;
  float domLoading = 0.00;
  float domInteractive = 0.00;
  float domContentLoaded = 0.00;
  float domComplete = 0.00;
  float dom_to_onload = 0.00;
  float loadEvent = 0.00;
  float networkLatency = 0.00;
  float pageLoadingTime = 0.00;
  float totalTimeElapsed = 0.00;
};

dictionary MemoryObject
{
  float explicit = 0.00;
  float resident = 0.00;
};

[JSImplementation="@mozilla.org/fxosuService;1",
 NavigatorProperty="mozFxOSUService"]
interface FxOSUService {
  boolean batteryLevel();
  boolean batteryCharging();
  DOMRequest recentRxTx();
  float receivedBytes(optional float lastMillisecs);
  SuccessRateObject successRate(optional float lastMillisecs);
  LatencyObject latencyInfo();
  boolean isConnectionStable(optional float lastMillisecs);
  MemoryObject memoryManager(); 
  float connectionType();
  boolean connectionUp();
  float connectionQuality();
  boolean mozIsNowGood(optional float level);
};
