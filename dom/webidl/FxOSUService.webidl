/* -*- Mode: IDL; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

dictionary SuccessRateObject
{
  double rate = 0;
  double successes = 0;
  double attempted = 0;
};

dictionary LatencyObject 
{
  double navigation_type = 0;
  double navigation_redirectCount = 0;
  double prep = 0;
  double redirect = 0;
  double unload = 0;
  double r_to_f = 0;
  double fetch = 0;
  double dnslookup = 0;
  double d_to_c = 0;
  double connection = 0;
  double c_to_req = 0;
  double request = 0;
  double response = 0;
  double res_to_dom = 0;
  double domLoading = 0;
  double domInteractive = 0;
  double domContentLoaded = 0;
  double domComplete = 0;
  double dom_to_onload = 0;
  double loadEvent = 0;
  double networkLatency = 0;
  double pageLoadingTime = 0;
  double totalTimeElapsed = 0;
};

[JSImplementation="@mozilla.org/fxosuService;1",
 NavigatorProperty="mozFxOSUService"]
interface FxOSUService {
  DOMString batteryLevel();
  DOMString batteryCharging();
  DOMRequest recentRxTx();
  DOMString receivedBytes();
  SuccessRateObject successRate();
  LatencyObject latencyInfo();
  DOMString memoryManager(); 
  boolean isConnectionStable();
  DOMString connectionType();
  DOMString connectionUp();
  DOMString connectionQuality();
  DOMString mozIsNowGood();
};
