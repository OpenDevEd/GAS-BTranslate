function clearFormatSettings() {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('FORMAT_SETTINGS');
  onOpen();
}

function getSettings(tryToRetrieveProperties, defaultSettings, allMenuItemsObj, propertyKey) {
  const resultObj = {
    marker: '',
    style: defaultSettings,
    menuText: allMenuItemsObj[defaultSettings]['menuText']
  };
  if (tryToRetrieveProperties === true) {
    try {
      const savedSettings = PropertiesService.getUserProperties().getProperty(propertyKey);
      if (savedSettings != null && allMenuItemsObj.hasOwnProperty(savedSettings)) {
        resultObj['style'] = savedSettings;
        resultObj['menuText'] = allMenuItemsObj[savedSettings]['menuText'];
      }
      resultObj['marker'] = '✅';
    }
    catch (error) {
      // Logger.log('Needs to activate!!! ' + error);
    }
  }
  return resultObj;
}


function activateFormatStyle(obj) {
  activateSettings(formatStyles, obj, 'FORMAT_SETTINGS');
}

function activateSettings(allMenuItemsObj, targetObj, propertyKey){
  const value = Object.keys(allMenuItemsObj).find(key => allMenuItemsObj[key] === targetObj);
  PropertiesService.getUserProperties().setProperty(propertyKey, value);
  onOpen();
}

// Menu items of format style
const formatStyles = {
  "txt": {
    "menuText": "Format: Sequential in text",
    "run": function () { activateFormatStyle(this); }
  },
  "footnotes": {
    "menuText": "Format: First translation in text, others in footnote",
    "run": function () { activateFormatStyle(this); }
  },
  "table": {
    "menuText": "Format: Original text and translation(s) in table",
    "run": function () { activateFormatStyle(this); }
  },
  /* "comments": {
     "menuText": "Format: Primary language in text, rest in comment (links are preserved)",
     "run": function () { activateFormatStyle(this); }
   } */
}
