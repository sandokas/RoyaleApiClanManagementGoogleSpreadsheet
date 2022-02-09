var baseUrl = 'https://api.clashroyale.com';
var ipcanhazip = 'http://ipv4.ipcanhazip.com';
var apiToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjE1N2FkNDNhLWFhMmEtNDRhOC1iOTQ1LTFkMGJmNGRiNzk2YyIsImlhdCI6MTY0NDQxMDc4NCwic3ViIjoiZGV2ZWxvcGVyL2NhYzdmZTAwLWI5NWMtZGFhOC0xNTczLTdhMmQ0ZGY3NDdhMSIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyIzNC4xMTYuMjIuMTgiLCIzNS4xODcuMTMyLjIzOSIsIjEwNy4xNzguMTkyLjUwIiwiMzQuMTE2LjIyLjE2IiwiMTA3LjE3OC4xOTIuNDgiXSwidHlwZSI6ImNsaWVudCJ9XX0.AR7fji76MxkKv4RWmwtcTMTLPN_7vLUtfkoc2fIcR37c-9nv2wfUwvTryLcQJFw37jxCkMr1C8TsT6SVriBryQ';

var options = {
    method : 'get',
    muteHttpExceptions: true,
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + apiToken
    }
};

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Clash Royale')
  .addItem('Update Clan', 'LoadClan')
  .addItem('Update Current RiverRace', 'LoadRiverRace')
  .addItem('Reload Last RiverRace', 'ReloadLastRiverRace')
  .addToUi()
}

function LoadClan() {
  var tag = getClanTag();
  var thisWeekSheetName = getThisWeekSheetName();
  var clan = fetchClan(tag);
  fillClanData(clan, thisWeekSheetName);
}

function LoadRiverRace() {
  var tag = getClanTag();
  var thisWeekSheetName = getThisWeekSheetName();
  var currentRiverRace = getCurrentRiverRace(tag);
  fillCurrentRiverRace(currentRiverRace, thisWeekSheetName);
}

function ReloadLastRiverRace()
{
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
  var repairPointsColumnIndex = 8;

  //if the sheet is filled only update it
  for (i = 0; i < dataSet.participants.length; i++) {
    data = dataSet.participants[i];
    var foundMember = false;
    for (n = 1; n <= dataRange.getNumRows(); n++) {
      if (dataRange.getCell(n, 1).getValue() == data.tag) {
        dataRange.getCell(n,fameColumnIndex).setValue(data.fame);
        dataRange.getCell(n,repairPointsColumnIndex).setValue(data.repairPoints);
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

function compileYear2021()
{
  iterateThroughSundays(2021);
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
  }
  return thisWeekSheetName;
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

function whatIsMyIP() {
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ip');
  var range = spreadSheet.getRange('A:A');
  var uri = 'https://ipv4.icanhazip.com/';
  for (var i = 0; i<1000; i++) {
    var response = UrlFetchApp.fetch(uri);
    Logger.log(response); 
    range.getCell(i+1,1).setValue(response);
  }
}
