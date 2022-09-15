function showTranslationSettingsDialog() {
  var htmlTemplate = HtmlService.createTemplateFromFile('Html Page v1');
  var htmlOutput = htmlTemplate.evaluate();

  DocumentApp.getUi().showModalDialog(htmlOutput, 'Translation settings')
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getTranslationSettings() {
  let resultObj = new Object();
  try {
    var userProperties = PropertiesService.getUserProperties();
    var translationSettings = userProperties.getProperty('TRANSLATION_SETTINGS');
    if (translationSettings != null) {
      resultObj = JSON.parse(translationSettings);
    }
  }
  catch (error) {
    Logger.log('Needs to activate!!!');
  }
  Logger.log(resultObj);
  return resultObj;
}

function clearTranslationSettings() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('TRANSLATION_SETTINGS');
  onOpen();
}

function saveLanguage(finalSettings) {
  const translationSettings = getTranslationSettings();
  let newKey;
  if (finalSettings.source.google) {
    newKey = finalSettings.source.google;
  } else {
    newKey = finalSettings.source.deepL;
  }
  for (let i in finalSettings.targets) {
    if (finalSettings.targets[i].google) {
      newKey += finalSettings.targets[i].google;
    } else {
      newKey += finalSettings.targets[i].deepL;
    }
  }

  translationSettings[newKey] = finalSettings;

  if (translationSettings.hasOwnProperty('menuOrder') === false) {
    translationSettings['menuOrder'] = [];
  }
  translationSettings['menuOrder'].push(newKey);
  console.log(translationSettings);

  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('TRANSLATION_SETTINGS', JSON.stringify(translationSettings));

  var result = {
    status: 'ok'
  };
  console.log(finalSettings);
  onOpen();
  return result;
}


function retrieveSlot(slot) {
  const translationSettings = getTranslationSettings();
  const langCodes = translationSettings.menuOrder[slot.slotNumber];
  //alert(slot.slotNumber);

  Logger.log(translationSettings[langCodes]);

  translateSelectionAndAppendL(translationSettings[langCodes]);
}

const translationSlots = {
  "s1": {
    "slotNumber": 0,
    "run": function () { retrieveSlot(this); }
  },
  "s2": {
    "slotNumber": 1,
    "run": function () { retrieveSlot(this); }
  },
  "s3": {
    "slotNumber": 2,
    "run": function () { retrieveSlot(this); }
  },
  "s4": {
    "slotNumber": 3,
    "run": function () { retrieveSlot(this); }
  },
  "s5": {
    "slotNumber": 4,
    "run": function () { retrieveSlot(this); }
  }
  ,
  "s6": {
    "slotNumber": 5,
    "run": function () { retrieveSlot(this); }
  }
  ,
  "s7": {
    "slotNumber": 6,
    "run": function () { retrieveSlot(this); }
  }
};
