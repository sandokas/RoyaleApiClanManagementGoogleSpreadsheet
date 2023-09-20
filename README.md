RoyaleApiClanManagementGoogleSpreadsheet

This is a javascript Google spreadsheet that downloads weekly information about a Clash Royale clan. It supports donations and clan wars. 
That information can then be worked in the google spreadsheet as tools for clan management.

To use it you have to ask a key on developer.clashroyale.com for IP 45.79.218.79

This is because google spreadsheet will use different outgoing ips ranges and the key is IP bound.
To overcome this ip whitelist this code points to RoyaleAPI proxy.

In alternative in no-proxy mode the script will try and check what are the current IPs used by google and try to register those in your developer account.
This obviously does not work 100% of the time, but it can make the script still usable without a proxy.

LoadClan -> Load/Update Clan (creates a sheet per week recommend to run at least Sundays before Midnight UTC)

LoadRiverRace -> Update Clan with current RiverRace points

ReloadLastRiverRace -> Use Mondays after 10AM UTC to Update Last weeks final clan points.
