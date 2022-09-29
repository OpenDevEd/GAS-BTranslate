function showTranslationSettingsDialog() {
  const translationSettings = getTranslationSettings();

  if (translationSettings.hasOwnProperty('menuOrder')) {
    if (translationSettings.menuOrder.length >= 30) {
      alert('You\'ve already added 30 translation settings.');
      return 0;
    }
  }
  
  const htmlTemplate = HtmlService.createTemplateFromFile('Html Page v1');
  const htmlOutput = htmlTemplate.evaluate();
  DocumentApp.getUi().showModalDialog(htmlOutput, 'Translation settings');
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
  Logger.log(JSON.stringify(resultObj));
  return resultObj;
}

function clearTranslationSettings() {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('TRANSLATION_SETTINGS');
  onOpen();
}

function saveLanguage(finalSettings) {
  Logger.log('finalSettings=' + finalSettings);
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

  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('TRANSLATION_SETTINGS', JSON.stringify(translationSettings));

  const result = {
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
  },
  "s6": {
    "slotNumber": 5,
    "run": function () { retrieveSlot(this); }
  },
  "s7": {
    "slotNumber": 6,
    "run": function () { retrieveSlot(this); }
  },
  "s8": {
    "slotNumber": 7,
    "run": function () { retrieveSlot(this); }
  },
  "s9": {
    "slotNumber": 8,
    "run": function () { retrieveSlot(this); }
  },
  "s10": {
    "slotNumber": 9,
    "run": function () { retrieveSlot(this); }
  },
  "s11": {
    "slotNumber": 10,
    "run": function () { retrieveSlot(this); }
  },
  "s12": {
    "slotNumber": 11,
    "run": function () { retrieveSlot(this); }
  },
  "s13": {
    "slotNumber": 12,
    "run": function () { retrieveSlot(this); }
  },
  "s14": {
    "slotNumber": 13,
    "run": function () { retrieveSlot(this); }
  },
  "s15": {
    "slotNumber": 14,
    "run": function () { retrieveSlot(this); }
  },
  "s16": {
    "slotNumber": 15,
    "run": function () { retrieveSlot(this); }
  },
  "s17": {
    "slotNumber": 16,
    "run": function () { retrieveSlot(this); }
  },
  "s18": {
    "slotNumber": 17,
    "run": function () { retrieveSlot(this); }
  },
  "s19": {
    "slotNumber": 18,
    "run": function () { retrieveSlot(this); }
  },
  "s20": {
    "slotNumber": 19,
    "run": function () { retrieveSlot(this); }
  },
  "s21": {
    "slotNumber": 19,
    "run": function () { retrieveSlot(this); }
  },
  "s22": {
    "slotNumber": 19,
    "run": function () { retrieveSlot(this); }
  },
  "s23": {
    "slotNumber": 19,
    "run": function () { retrieveSlot(this); }
  },
  "s24": {
    "slotNumber": 19,
    "run": function () { retrieveSlot(this); }
  },
  "s25": {
    "slotNumber": 19,
    "run": function () { retrieveSlot(this); }
  },
  "s26": {
    "slotNumber": 19,
    "run": function () { retrieveSlot(this); }
  },
  "s27": {
    "slotNumber": 19,
    "run": function () { retrieveSlot(this); }
  },
  "s28": {
    "slotNumber": 19,
    "run": function () { retrieveSlot(this); }
  },
  "s29": {
    "slotNumber": 19,
    "run": function () { retrieveSlot(this); }
  },
  "s30": {
    "slotNumber": 19,
    "run": function () { retrieveSlot(this); }
  }
};
