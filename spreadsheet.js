var baseUrl = 'https://proxy.royaleapi.dev';
var apiToken = 'YOUR-API-TOKEN-HERE';

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
  .addItem('Reload Last Race', 'ReloadLastRiverRace')
  .addToUi()
}

function LoadClan() {
  var tag = getClanTag();
  //tag = "2CY02GRJ";
  var thisWeekSheetName = getThisWeekSheetName();
  var clan = fetchClan(tag);
  fillClanData(clan, thisWeekSheetName);
  //var currentWar = getCurrentClanWar(tag);
  //fillWarData(currentWar, thisWeekSheetName);
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

function compileYear2019()
{
  iterateThroughSundays(2019);
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
        var newDataRange = sheet.getRange(sheet.getMaxRows()+1,1,1,6);
        newDataRange.setValues([[data.tag,  data.name, data.expLevel, data.trophies, data.donations, data.role]]);
      }
    }
    
  }
  

}
