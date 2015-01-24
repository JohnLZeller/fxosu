# FxOSU: Intelligent Network Requests

## Prototype
The prototype works by running JavaScript in a Firefox bootstrapped add-on, thus providing access to APIs that need privileged access to use.
In order to install, you must zip the contents of the prototype directory, renaming it to a .xpi file. From within the prototype directory:
> zip -r prototypeapi.xpi ./*
Next, open Firefox and go to Tools->Add-ons and then select "Install Add-on From File..." from the gear icon dropdown menu. Select the prototypeapi.xpi file from the prototype directory and then follow the Firefox install windows to finish the installation.

## Implementation
Coming soon! :)

## Requirements
### Week 6 (February 9th to 13th)
1. Analyze existing efforts (ie ServiceWorkers, RequestSync) to determine if they can be integrated with our system
2. The prototype API should be written in JavaScript
3. The prototype API should be callable by JavaScript executing in a web sandbox.
4. The prototype API should be developer configurable, to provide a level of certainty about network quality
5. The prototype API should be able to access data on the charging state of the device in order to determine if a task should be executed.
6. The prototype API should be able to access data on the battery level of the device in order to determine if a task should be executed.
7. The prototype API should be able to access data about recent tx/rx data to determine if a task should be executed.
8. The prototype API should be able to access latency-related network information to determine if a task should be executed.
9. The prototype API should be able to function without error on Firefox OS, Firefox for Android, and Firefox for Desktop

### Week 10 (March 9th to 13th)
10. The API should be written in C++
11. The API should integrate with existing efforts wherever possible.
12. The API should be developer configurable, to provide a level of certainty about network quality
13. The API should passively collect network status information.
14. The API should take into account the type of network connection, whether it be wifi, cellular data, etc
15. The API should be able to access data about system load on the device in order to determine if the device can handle another task.
16. The API should be able to access data on the battery level of the device in order to determine if a task should be executed.
17. The API should be able to access data about recent tx/rx data
18. The API should be able to access latency-related network information to determine if a task should be executed.

### Spring Term (May 4th to 8th)
The API should be able to access data on the charging state of the device in order to determine if a task should be executed.
The API should analyze network data to determine patterns in network reliability
The API should be able to function without error on Firefox OS, Firefox for Android, and Firefox for Desktop
The test app for the API should benchmark device resource usage, contrasting use with the API and use without the API
The test app for the API should be written to function on Firefox OS, Firefox for Android, and Firefox for Desktop
Write a Web IDL specification for the API implementation

## Useful Resources
### Documentation
[MDN Introduction](https://developer.mozilla.org/en-US/docs/Introduction)
[Adding APIs to navigator object](https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/Adding_APIs_to_the_navigator_object)
[Example webapi add-on via manifect](https://github.com/autonome/webapi-addon-via-manifest)
### APIs
[Web API Interfaces](https://developer.mozilla.org/en-US/docs/Web/API)
[Battery Level](https://developer.mozilla.org/en-US/docs/Web/API/BatteryManager.level)
[Charging State](https://developer.mozilla.org/en-US/docs/Web/API/BatteryManager.charging)
[Recent RX/RX Data](https://developer.mozilla.org/en-US/docs/Web/API/MozNetworkStatsData)
[Network Stats API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Stats_API)
[Latency network info (maybe?)](https://developer.mozilla.org/en-US/docs/Web/API/Performance.timing)
[Wifi](https://developer.mozilla.org/en-US/docs/Web/API/MozWifiConnectionInfoEvent)
[MobileNetworkInfo](https://developer.mozilla.org/en-US/docs/Web/API/MozMobileNetworkInfo)
[CellInfo](https://developer.mozilla.org/en-US/docs/Web/API/MozMobileCellInfo)
[MobileConnection](https://developer.mozilla.org/en-US/docs/Web/API/MozMobileConnectionInfo)
[NetworkStats](https://developer.mozilla.org/en-US/docs/Web/API/MozNetworkStats)
[NetworkStatsManager](https://developer.mozilla.org/en-US/docs/Web/API/MozNetworkStatsManager)

# Contributors
John Zeller - johnlzeller@gmail.com - IRC: zeller
Pok Yan Tjiam - tjiamp@onid.oregonstate.edu
Jonathan McNeil - mcneilj@onid.oregonstate.edu
