var options = {
    method : 'get',
    muteHttpExceptions: true,
    headers: {
      auth: 'YOUR-ROYALEAPI-KEY-HERE'
    }
};

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Clash Royale')
  .addItem('Update Clan', 'LoadClan')
  .addToUi()
}

function LoadClan() {
  var tag = getClanTag();
  //tag = "2CY02GRJ";
  var thisWeekSheetName = getThisWeekSheetName();
  var clan = fetchClan(tag);
  fillClanData(clan, thisWeekSheetName);
  var currentWar = getCurrentClanWar(tag);
  fillWarData(currentWar, thisWeekSheetName)
}

function fillWarData(currentWar, sheetName)
{
  var dataSet = currentWar;

  //find if the sheet is already filled.
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var dataRange = sheet.getRange(2,1,sheet.getMaxRows(),17);
  var today = new Date();
  var weekDay = today.getDay();
  var warColumnIndex = 17;
  
  if (weekDay === 2 || weekDay === 3)
  {
    warColumnIndex = 7;
  }
  else if (weekDay === 4 || weekDay === 5)
  {
    warColumnIndex = 9;
  }
  else if (weekDay === 6 || weekDay === 0)
  {
    warColumnIndex = 11;
  }
  else
  {
    //there should be no wars fought on monday
  }
    
  if (dataRange.getValue() == "" || dataSet.state == "notInWar")
  {
    //this should not happen
    //added check if clan not currently in war
  }
  else 
  {
    //if the sheet is filled only update it
    for (i = 0; i < dataSet.participants.length; i++) {
      data = dataSet.participants[i];
      var foundMember = false;
      for (n = 1; n <= dataRange.getNumRows(); n++) {
        if (dataRange.getCell(n, 1).getValue() == data.tag) {
            dataRange.getCell(n,warColumnIndex).setValue(data.cardsEarned);
            if (data.battlesPlayed != 0 && (weekDay === 3 || weekDay === 5 || weekDay === 0))
            {
                dataRange.getCell(n,warColumnIndex+1).setValue(data.wins);
            }
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

}

function getCurrentClanWar(tag)
{
  var response = UrlFetchApp.fetch('https://api.royaleapi.com/clan/' + tag.replace('#', '').toUpperCase() + '/war', options);
  Logger.log(response.getContentText()); 
  var dataAll = JSON.parse(response.getContentText());
  return dataAll;
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
  return tag;
}

function fetchClan(tag){
  var response = UrlFetchApp.fetch('http://api.royaleapi.com/clan/' + tag.replace('#', '').toUpperCase(), options);
  Logger.log(response.getContentText()); 
  var dataAll = JSON.parse(response.getContentText());
  return dataAll;
}

function getThisWeekSheetName() {
  var today = new Date();
  var todayWeekday = today.getDay();
  var sunday = new Date();
  if (todayWeekday === 0) 
  {
    sunday = today;
  }
  else 
  {
    sunday.setDate(today.getDate() - todayWeekday + 7);
  }
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
    
    for (i = 0; i < dataSet.members.length; i++) {
      data = dataSet.members[i];
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
    for (i = 0; i < dataSet.members.length; i++) {
      data = dataSet.members[i];
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

function test()
{
  var today, sunday;
  today = sunday = new Date();
  
  sunday.setDate(today.getDate()-1);
  
  var whatDay = today.getDate(); 
}
function test2()
{
    var today = sunday = new Date();
  var todayWeekday = today.getDay();
  if (todayWeekday !== 0) 
  {
    var sunday = new Date();
    sunday.setDate(today.getDate() - todayWeekday + 7);
  }
  var sundayDay = sunday.getDate();
  var sundayMonth = sunday.getMonth() + 1;
  var sundayYear = sunday.getFullYear();

  var thisWeekSheetName =  sundayYear + '-' + sundayMonth + '-' + sundayDay;

  return thisWeekSheetName;
}

// INSTEAD OF COUNTPLAYERWAR probably it will be better to:
// 1. download all clanWar battles: type, utcTime, playerTag
// 2. write these battles into a separate spreadsheet
// 3. compile the values using excel 

function legacyCountPlayerWar(warData) {
  var collectionDay = 0;
  var warDay = -1;
  var data;
  for (var i = 0; i < warData.length; i++) 
  {
    var battleDate = new Date();
    var compareDate = new Date();
    compareDate.setDate(compareDate.getDate() - 2);
    data = warData[i];
    if (data.type == 'clanWarCollectionDay')
    {
      battleDate = battleDate.setTime(data.utcTime*1000);
      if (battleDate > compareDate)
      {
        collectionDay++;
      }
    }
    else if (data.type == 'clanWarWarDay')
    {
      battleDate = battleDate.setTime(data.utcTime*1000);
      if (battleDate > compareDate)
      {
        if (data.winner > 0)
        {
          warDay = 1;
        }
        else 
        {
          warDay = 0;
        }
      }
    }
    else 
    {
      //ignore this fight
    }
  }
  var result = [{"collectionDay": collectionDay, "warDay": warDay},];
  return result;
}

function getPlayerBattles(playerTag) {

  var dataAll = JSON.parse(UrlFetchApp.fetch('http://api.royaleapi.com/player/' + playerTag.replace('#', '').toUpperCase() + '/battles', options).getContentText());

  return dataAll;
}
                
function getPlayerDataTest()
{
  var result = getPlayerBattles('YJQQGPUU');
  result = countPlayerWar(result);
  Logger.log(result);
}

function refillPastClanWars()
{
  var tag = getClanTag();
  var dataAll = getPastClanWars(tag);
  var weekDate = '2019-11-24';
  loadPastClanWar(dataAll, 11, 0,weekDate);
  loadPastClanWar(dataAll, 9, 1,weekDate);
  loadPastClanWar(dataAll, 7, 2,weekDate);
}

function midWeekMadness()
{
  var tag = getClanTag();
  var dataAll = getPastClanWars(tag);
  var weekDate = '2019-11-24';
  //loadPastClanWar(dataAll, 11, 0,weekDate);
  //loadPastClanWar(dataAll, 9, 0,weekDate);
  loadPastClanWar(dataAll, 7, 0,weekDate);
}
               
function getPastClanWars(tag)
{
  var dataAll = JSON.parse(UrlFetchApp.fetch('http://api.royaleapi.com/clan/' + tag.replace('#', '').toUpperCase() + '/warlog', options).getContentText());
  return dataAll;
}
                
function loadPastClanWar(dataAll, warColumnIndex, warIndex, sheetName)
{
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var dataRange = sheet.getRange(2,1,sheet.getMaxRows(),17);
    for (i = 0; i < dataAll[warIndex].participants.length; i++) {
      data = dataAll[warIndex].participants[i];
      var foundMember = false;
      for (n = 1; n <= dataRange.getNumRows(); n++) {
        if (dataRange.getCell(n, 1).getValue() == data.tag) {
            dataRange.getCell(n,warColumnIndex).setValue(data.cardsEarned);
            if (data.battlesPlayed != 0)
            {
                dataRange.getCell(n,warColumnIndex+1).setValue(data.wins);
            }
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
