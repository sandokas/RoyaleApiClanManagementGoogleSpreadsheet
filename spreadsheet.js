var apiUrl = 'https://api.clashroyale.com';
var proxyUrl = 'https://proxy.royaleapi.dev';
var baseUrl = '';
var apiToken = '';
var useProxy = true;

var options = {
    method : 'get',
    muteHttpExceptions: true,
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + apiToken
    }
};

function CheckAndSetProxy() {
  if (useProxy){
    baseUrl = proxyUrl;
  } else {
    baseUrl = apiUrl;
    var token = GetToken();
    if (token == '')
      return;
    apiToken = token;
    options = {
        method : 'get',
        muteHttpExceptions: true,
        contentType: 'application/json',
        headers: {
          'Authorization': 'Bearer ' + apiToken
        }
    };
  }
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Clash Royale')
  .addItem('Update Clan', 'LoadClan')
  .addItem('Update Current RiverRace', 'LoadRiverRace')
  .addItem('Reload Last RiverRace', 'ReloadLastRiverRace')
  .addToUi()
}

function LoadClanAndRiverRace() {
  LoadClan();
  LoadRiverRace();
}

function LoadClan() {
  CheckAndSetProxy();
  var tag = getClanTag();
  var thisWeekSheetName = getThisWeekSheetName();
  var clan = fetchClan(tag);
  fillClanData(clan, thisWeekSheetName);
}

function LoadRiverRace() {
  CheckAndSetProxy();
  var tag = getClanTag();
  var thisWeekSheetName = getThisWeekSheetName();
  var currentRiverRace = getCurrentRiverRace(tag);
  fillCurrentRiverRace(currentRiverRace, thisWeekSheetName);
}

function ReloadLastRiverRace()
{
  CheckAndSetProxy();
  var tag = getClanTag();
  var lastWeekSheetName = getLastWeekSheetName();
  var lastRiverRace = getLastRiverRace(tag);
  fillCurrentRiverRace(lastRiverRace, lastWeekSheetName);
}

function getLastWeekSheetName()
{
  var today = new Date();
  var sunday = getLastSunday(today);
  
  var sundayDay = sunday.getDate();
  var sundayMonth = sunday.getMonth() + 1;
  var sundayYear = sunday.getFullYear();

  var thisWeekSheetName =  sundayYear + '-' + sundayMonth + '-' + sundayDay;
  var thisWeekSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(thisWeekSheetName);
  if (thisWeekSheet === null)
  {
    var template = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("template");
    thisWeekSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(thisWeekSheetName,0, {template: template});
    thisWeekSheet.activate();
    var columnNames = ["ID","Name","Level","Trophies","Donations","Role"];
    var dataRange = thisWeekSheet.getRange(1,1,1,6);
    dataRange.setValues([columnNames]);
  }
  return thisWeekSheetName;
}

function fillCurrentRiverRace(currentRiverRace, sheetName)
{
  var dataSet = currentRiverRace.clan;

  //if (dataSet == null)
  //  dataSet = currentRiverRace;
  //var finishTime = dataSet.finishTime;

  //find if the sheet is already filled.
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var dataRange = sheet.getRange(2,1,sheet.getMaxRows(),17);
  var today = new Date();
  var weekDay = today.getDay();
  var fameColumnIndex = 7;
  var decksUsedColumnIndex = 8;

  //if the sheet is filled only update it
  for (i = 0; i < dataSet.participants.length; i++) {
    data = dataSet.participants[i];
    var foundMember = false;
    for (n = 1; n <= dataRange.getNumRows(); n++) {
      if (dataRange.getCell(n, 1).getValue() == data.tag) {
        dataRange.getCell(n,fameColumnIndex).setValue(data.fame);
        dataRange.getCell(n,decksUsedColumnIndex).setValue(data.decksUsed);
        foundMember = true;
        break;
      }
    }
    if (!foundMember)
    {
      //this should not happen
    }
  }
}

function getCurrentRiverRace(tag)
{
  var uri = baseUrl + '/v1/clans/' + encodeURIComponent(tag) + '/currentriverrace';
  var response = UrlFetchApp.fetch(uri, options);
  Logger.log(response.getContentText()); 
  var dataAll = JSON.parse(response.getContentText());
  return dataAll;
}

function getLastRiverRace(tag)
{
  var uri = baseUrl + '/v1/clans/' + encodeURIComponent(tag) + '/riverracelog?limit=1';
  var response = UrlFetchApp.fetch(uri, options);
  Logger.log(response.getContentText()); 
  var dataAll = JSON.parse(response.getContentText());
  var _items = dataAll.items;
  if (undefined == _items)
  {
    throw dataAll.reason + ':' + dataAll.message;
  }
  for (var i = 0; i < dataAll.items.length; i++)
  {
    var _standings = dataAll.items[i].standings;
    for (var f = 0; f < dataAll.items[i].standings.length; f++)
    {
      var _clan = dataAll.items[i].standings[f].clan;
      if (dataAll.items[i].standings[f].clan.tag == tag)
        data = dataAll.items[0].standings[f];
    }
  }
  return data;
}

function getClanTag(){
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var statusSheet = ss.getSheetByName("MetaInfo")
  var statusRange = statusSheet.getRange('ClanTag');
  var tag = statusRange.getValue();
  
  if(!tag || tag === ''){
    tag = SpreadsheetApp.getUi().prompt('Enter your clan tag:').getResponseText();
    statusRange.setValue(tag);
  }
  
  if(!tag.match('^#'))
    tag = '#' + tag;
  
  tag = tag.toUpperCase();
  return tag;
}

function fetchClan(tag){
  var uri = baseUrl + '/v1/clans/' + encodeURIComponent(tag) + '/members';
  var response = UrlFetchApp.fetch(uri, options);
  Logger.log(response.getContentText()); 
  var dataAll = JSON.parse(response.getContentText());
  return dataAll;
}

function getNextSunday(date)
{
  var today = date;
  var todayWeekday = today.getDay();
  var sunday = new Date(date.getTime());
  if (todayWeekday === 0) 
  {
    sunday = today;
  }
  else 
  {
    sunday.setDate(today.getDate() - todayWeekday + 7);
  }
  return sunday;
}

function getLastSunday(date)
{
  var today = date;
  var todayWeekday = today.getDay();
  var sunday = new Date(date.getTime());
  if (todayWeekday === 0) 
  {
    sunday.setDate(today.getDate() - 7)
  }
  else 
  {
    sunday.setDate(today.getDate() - todayWeekday);
  }
  return sunday;
}

function getTodayLastSunday()
{
  var d = getLastSunday(new Date());
  var sundayDay = d.getDate();
  var sundayMonth = d.getMonth() + 1;
  var sundayYear = d.getFullYear();
  var originWeekSheetName =  sundayYear + '-' + sundayMonth + '-' + sundayDay;
  return originWeekSheetName;
}

function iterateThroughSundays(year)
{
  //start with January
  var d = new Date(year, 0, 1);
  for (var i = 0; i < 52; i++)
  {
    d = getNextSunday(d);
    
    var sundayDay = d.getDate();
    var sundayMonth = d.getMonth() + 1;
    var sundayYear = d.getFullYear();
    var originWeekSheetName =  sundayYear + '-' + sundayMonth + '-' + sundayDay;
    
    copySheetToSheet(originWeekSheetName,year);
    
    d.setDate(d.getDate()+7);
  }
}

function copySheetToSheet(originName, destinationName)
{
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var source_sheet = ss.getSheetByName(originName);
  var target_sheet = ss.getSheetByName(destinationName);
  var target_sheet_maxRows = target_sheet.getMaxRows();
  var source_sheet_maxRows = source_sheet.getMaxRows();
  target_sheet.insertRowsAfter(target_sheet_maxRows,source_sheet_maxRows - 1);
  var source_range = source_sheet.getRange("A2:P"+source_sheet_maxRows);
  var target_range = target_sheet.getRange("A"+(target_sheet_maxRows+1)+":P"+(target_sheet_maxRows+source_sheet_maxRows+1));
  var target_SourceNameRange = target_sheet.getRange("Q"+(target_sheet_maxRows+1)+":Q"+(target_sheet_maxRows+source_sheet_maxRows+1));
  source_range.copyTo(target_range,SpreadsheetApp.CopyPasteType.PASTE_VALUES);
  for (var i = 1; i <= target_SourceNameRange.getNumRows(); i++)
  {
    target_SourceNameRange.getCell(i,1).setValue(originName);
  }
}

function compileYear2023()
{
  iterateThroughSundays(2023);
}

function getThisWeekSheetName() {
  var today = new Date();
  
  var sunday = getNextSunday(today);
  
  var sundayDay = sunday.getDate();
  var sundayMonth = sunday.getMonth() + 1;
  var sundayYear = sunday.getFullYear();

  var thisWeekSheetName =  sundayYear + '-' + sundayMonth + '-' + sundayDay;
  var thisWeekSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(thisWeekSheetName);
  if (thisWeekSheet === null)
  {
    var template = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("template");
    thisWeekSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(thisWeekSheetName,0, {template: template});
    thisWeekSheet.activate();
    var columnNames = ["ID","Name","Level","Trophies","Donations","Role"];
    var dataRange = thisWeekSheet.getRange(1,1,1,6);
    dataRange.setValues([columnNames]);

    // update S1 with sunday date for checking promotions and half-run participation
    var sundayName = [thisWeekSheetName];
    thisWeekSheet.getRange(1,19,1,1).setValues([sundayName]);
  }
  return thisWeekSheetName;
}

function updateJoinedDates(targetSheetName, originSheetName)
{
    var targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(targetSheetName);
    if (targetSheet === null)
      return;
    var originSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(originSheetName);
    if (originSheet === null)
      return;
    var targetDataRange = targetSheet.getRange(2,1,targetSheet.getMaxRows(),9);
    if (targetDataRange.getValue() == "")
      return;
    var originDataRange = originSheet.getRange(2,1,originSheet.getMaxRows(),9);
    if (originDataRange.getValue() == "")
      return;    
    for (i = 0; i < targetDataRange.getNumRows()-1; i++) 
    {
      var joined = targetDataRange.getCell(i+1,9);
      if (joined.getValue() == "")
      {
        var userId = targetDataRange.getCell(i+1,1).getValue();
        for (f = 0; f < originDataRange.getNumRows(); f++)
        {
          var originUserId = originDataRange.getCell(f+1,1).getValue();
          if (userId == originUserId)
          {
            var originJoined = originDataRange.getCell(f+1,9).getValue();
            joined.setValue(originJoined);
            break;
          }
        }
      }
    }
}

function testUpdateJoinedDates() 
{
  updateJoinedDates("2024-5-19","2024-4-21");
}

function fillClanData(clan, sheetName) {
  var dataSet = clan;

  //find if the sheet is already filled.
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var dataRange = sheet.getRange(2,1,sheet.getMaxRows(),6);
 
  if (dataRange.getValue() == "")
  {
    //if the sheet is not filled just fill it no worries.
    var rows = [],
        data;
    
    for (i = 0; i < dataSet.items.length; i++) {
      data = dataSet.items[i];
      rows.push([data.tag,  data.name, data.expLevel, data.trophies, data.donations, data.role]);
    }
    dataRange = sheet.getRange(2, 1, rows.length, 6); //6 denotes total number of entities
    dataRange.setValues(rows);
    if (rows.length < 50)
    {
      //row.length+2 - 1 for the header, another to start deleting on the empty row
      sheet.deleteRows(rows.length+2, 50 - rows.length);
    }
    //update joined dates
    var today = new Date();
    var lastSunday = getLastSunday(today);
    var lastSundayDay = lastSunday.getDate();
    var lastSundayMonth = lastSunday.getMonth() + 1;
    var lastSundayYear = lastSunday.getFullYear();

    var lastWeekSheetName =  lastSundayYear + '-' + lastSundayMonth + '-' + lastSundayDay;    
    updateJoinedDates(sheetName,lastWeekSheetName);
  }
  else 
  {
    //if the sheet is filled only update it
    for (i = 0; i < dataSet.items.length; i++) {
      data = dataSet.items[i];
      var foundMember = false;
      for (n = 1; n <= dataRange.getNumRows(); n++) {
        if (dataRange.getCell(n, 1).getValue() == data.tag) {
            dataRange.getCell(n,2).setValue(data.name);
            dataRange.getCell(n,3).setValue(data.expLevel);
            dataRange.getCell(n,4).setValue(data.trophies);
            dataRange.getCell(n,5).setValue(data.donations);
            dataRange.getCell(n,6).setValue(data.role);
          foundMember = true;
          break;
        }
      }
      if (!foundMember)
      {
        var currentRow = sheet.getMaxRows()+1;
        var newDataRange = sheet.getRange(currentRow,1,1,6);
        newDataRange.setValues([[data.tag,  data.name, data.expLevel, data.trophies, data.donations, data.role]]);
        var addDateRange = sheet.getRange(currentRow,9,1,1);
        addDateRange.setValues([[getTodayString()]]);
      }
    }
    
  }
  

}

function getTodayString()
{
    var today = new Date();
    var todayDay = today.getDate();
    var todayMonth = today.getMonth() + 1;
    var todayYear = today.getFullYear();
    var addedOn =  todayYear + '-' + todayMonth + '-' + todayDay;        
    return addedOn;
}

function sheetName() {
  return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
}

function GetToken()
{
  var ips = GetIps();
  if (ips.length == 0)
    return '';
  var cookie = LoginAtClashRoyaleDeveloper();
  var name = 'AutoGenerated';
  var list = ListTokensAtClashRoyaleDeveloper(cookie);
  for (var i = 0; i < list.keys.length; i++)
  {
    if (list.keys[i].name == name) {
      RevokeTokenAtClashRoyaleDeveloper(list.keys[i].id,cookie);
    }
  }
  CreateTokenAtClashRoyaleDeveloper(ips, name, cookie);
  list = ListTokensAtClashRoyaleDeveloper(cookie);
  LogoutAtClashRoyaleDeveloper(cookie);
  var token = (list.keys.find(key => key.name == name)).key;
  Logger.log(token);
  return token;
}

function GetIps()
{
  baseUrl = apiUrl;
  var uri = baseUrl + '/v1/clans/';
  var ips = [];

  for (var i = 0; i < 10; i++)
  {
    if (ips.length > 4) {
      break;
    }
    var response = UrlFetchApp.fetch(uri, options);
    Logger.log(response.getContentText()); 
    var dataAll = JSON.parse(response.getContentText());
    if (dataAll.reason == 'accessDenied.invalidIp') {
      var ip = dataAll.message.substr(dataAll.message.lastIndexOf('IP ')+3);
      if (!ips.includes(ip))
        ips.push(ip);
    } else if (dataAll.reason = 'badRequest') {
      //no need, ip addresses are still good
      return [];
    }
  }
  return ips;
}

function LoginAtClashRoyaleDeveloper()
{
  var uri = 'https://developer.clashroyale.com/api/login';
  var username = '';
  var password = '';
  var loginData = { 'email' : username,
    'password': password
  };
  var optionlogin = {
    method : 'post',
    muteHttpExceptions: true,
    contentType: 'application/json',
    payload: JSON.stringify(loginData)
  };
  var response = UrlFetchApp.fetch(uri, optionlogin);
  var cookie = response.getAllHeaders()['Set-Cookie'];
  Logger.log(response);
  return cookie;
}

function LogoutAtClashRoyaleDeveloper(cookie)
{
  var uri = 'https://developer.clashroyale.com/api/logout'
  var optionlogin = {
    method : 'post',
    muteHttpExceptions: true,
    contentType: 'application/json',
    headers: {
      cookie
    }
  };
  var response = UrlFetchApp.fetch(uri, optionlogin);
  Logger.log(response);
}

function ListTokensAtClashRoyaleDeveloper(cookie)
{
  var uri = 'https://developer.clashroyale.com/api/apikey/list'
  var optionlogin = {
    method : 'post',
    muteHttpExceptions: true,
    contentType: 'application/json',
    headers: {
      cookie
    }
  };
  var response = UrlFetchApp.fetch(uri, optionlogin);
  Logger.log(response);
  return JSON.parse(response.getContentText());
}

function CreateTokenAtClashRoyaleDeveloper(ips, name, cookie)
{
  var uri = 'https://developer.clashroyale.com/api/apikey/create';
  var request = {
    'cidrRanges' : ips,
    'description': 'created by appScript Royale Api Clan Management Google Spreadsheet',
    'name': name,
    'scopes':['royale']
  }
  var optionlogin = {
    method : 'post',
    muteHttpExceptions: true,
    contentType: 'application/json',
    headers: {
      cookie
    },
    payload : JSON.stringify(request)
  };
  var response = UrlFetchApp.fetch(uri, optionlogin);
  Logger.log(response);
}

function RevokeTokenAtClashRoyaleDeveloper(id, cookie)
{
  var uri = 'https://developer.clashroyale.com/api/apikey/revoke';
  var request = {
    'id' : id
  }
  var optionlogin = {
    method : 'post',
    muteHttpExceptions: true,
    contentType: 'application/json',
    headers: {
      cookie
    },
    payload : JSON.stringify(request)
  };
  var response = UrlFetchApp.fetch(uri, optionlogin);
  Logger.log(response);
}
