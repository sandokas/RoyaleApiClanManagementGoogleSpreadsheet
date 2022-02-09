# RoyaleApiClanManagementGoogleSpreadsheet
RoyaleApiClanManagementGoogleSpreadsheet

This is a javascript Google spreadsheet that downloads weekly information about a Clash Royale clan. It supports donations and clan wars. 
That information can then be worked in the google spreadsheet as tools for clan management.

To use it you have to ask a key on developer.clashroyale.com.
Google spreadsheet will use different outgoing ips ranges and the key is IP bound.

2022-02-09: Unless you're able to setup a reverse proxy and ask an IP address to that proxy outgoing address, as now the known way to use this code is to take note of the first 5 addresses google is using to connect, quickly whitelist those 5 ip addresses (clashroyale limits to 5 ip addresses per key, no ranges allowed) and submit the request a couple of times until it gets lucky to select one of those 5 ip addresses.

If anyone knows a better solution please send me a message.
