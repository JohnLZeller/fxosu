# FxOSU: Intelligent Network Requests

## API Architecture
The purpose of this API is to give a boolean go/nogo answer about whether a network request should be made right now. This API will be configurable to allow a level of certainty, but the goal is to keep the output as binary as possible.

### Overview
The API will be divided into 3 parts:

1. Core service that monitors network conditions and stores metadata
2. Service for handling requests for that data, or sending notifications about it
3. Web API code that proxies requests from web content to that core service and back

At a macro level, we are going to take into account at least the following data:

* Battery level
* Battery charging state
* rxBytes and txBytes from arbitrary time window
* Network latency
* Type of connection
* Quality of connection

The API will be configurable to 3 level of certainty; high, moderate, and low, signified by 1, 2, and 3, respectively. The API will default to 2.

The flow will be this (We will call the API mozIsNowGood, for the moment):

1. Call is made to window.navigator.mozIsNowGood() from a web app, without passing in configuration level, so defaults to 2.
2. JS called by mozIsNowGood enters a switch/case to set level to 2, or moderate certainty.
3. JS enters logic that takes into account the 6 data points listed above, and comes to a go/nogo answer
  * Needs to be fleshed out
4. JS returns go/nogo answer to the caller of window.navigator.mozIsNowGood()

## Prototype
### add-on-via-sdk
To run, move into this directory and run:
> jpm run

If jpm is not installed, then run:
> npm install -g jpm

### add-on-via-manifest
The prototype works by running JavaScript in a Firefox bootstrapped add-on, thus providing access to APIs that need privileged access to use.
In order to install, you must zip the contents of the prototype directory, renaming it to a .xpi file. From within the prototype directory:
> zip -r prototypeapi.xpi ./*

Next, open Firefox and go to Tools->Add-ons and then select "Install Add-on From File..." from the gear icon dropdown menu. Select the prototypeapi.xpi file from the prototype directory and then follow the Firefox install windows to finish the installation.

## Implementation
Coming soon! :)

## Requirements
### Week 6 (February 9th to 13th)
1. Analyze existing efforts (ie ServiceWorkers, RequestSync) to determine if they can be integrated with our system.
2. The prototype API should be written in JavaScript.
3. The prototype API should be callable by JavaScript executing in a web sandbox.
4. The prototype API should be developer configurable, to provide a level of certainty about network quality.
5. The prototype API should be able to access data on the charging state of the device in order to determine if a task should be executed.
6. The prototype API should be able to access data on the battery level of the device in order to determine if a task should be executed.
7. The prototype API should be able to see if the device has an internet connection to determine if a task should be executed.
8. The prototype API should be able to access latency-related network information to determine if a task should be executed.
9. The prototype API should be able to function without error on Firefox for Desktop.

### Week 10 (March 9th to 13th)
10. The API should be written in C++ and/or JavaScript.
11. The API should integrate with existing efforts wherever possible.
12. The API should be developer configurable, to provide a level of certainty about network quality.
13. The API should passively collect network status information.
14. The API should take into account the type of network connection, whether it be wifi, cellular data, etc.
15. The API should be able to access data about system load on the device in order to determine if the device can handle another task.
16. The API should be able to access data on the battery level of the device in order to determine if a task should be executed.
17. The API should be able to access data about recent tx/rx data.
18. The API should be able to access latency-related network information to determine if a task should be executed.

### Spring Term (May 4th to 8th)
19. The API should be able to access data on the charging state of the device in order to determine if a task should be executed.
20. The API should analyze network data to determine patterns in network reliability
21. The API should be able to function without error on Firefox OS, Firefox for Android, and Firefox for Desktop
22. The test app for the API should benchmark device resource usage, contrasting use with the API and use without the API
23. The test app for the API should be written to function on Firefox OS, Firefox for Android, and Firefox for Desktop
24. Write a Web IDL specification for the API implementation

## Useful Resources
### Documentation
* [MDN Introduction](https://developer.mozilla.org/en-US/docs/Introduction)
* [Adding APIs to navigator object](https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/Adding_APIs_to_the_navigator_object)
* [Example webapi add-on via manifect](https://github.com/autonome/webapi-addon-via-manifest)

### APIs
* [Web API Interfaces](https://developer.mozilla.org/en-US/docs/Web/API)
* [Battery Level](https://developer.mozilla.org/en-US/docs/Web/API/BatteryManager.level)
* [Charging State](https://developer.mozilla.org/en-US/docs/Web/API/BatteryManager.charging)
* [Recent RX/RX Data](https://developer.mozilla.org/en-US/docs/Web/API/MozNetworkStatsData)
* [Network Stats API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Stats_API)
* [Latency network info (maybe?)](https://developer.mozilla.org/en-US/docs/Web/API/Performance.timing)
* [Connection](https://developer.mozilla.org/en-US/docs/Web/API/Connection)
* [Wifi](https://developer.mozilla.org/en-US/docs/Web/API/MozWifiConnectionInfoEvent)
* [MobileNetworkInfo](https://developer.mozilla.org/en-US/docs/Web/API/MozMobileNetworkInfo)
* [CellInfo](https://developer.mozilla.org/en-US/docs/Web/API/MozMobileCellInfo)
* [MobileConnection](https://developer.mozilla.org/en-US/docs/Web/API/MozMobileConnectionInfo)
* [NetworkStats](https://developer.mozilla.org/en-US/docs/Web/API/MozNetworkStats)
* [NetworkStatsManager](https://developer.mozilla.org/en-US/docs/Web/API/MozNetworkStatsManager)

# Contributors
* John Zeller - johnlzeller@gmail.com - IRC: zeller
* Pok Yan Tjiam - tjiamp@onid.oregonstate.edu
* Jonathan McNeil - mcneilj@onid.oregonstate.edu
