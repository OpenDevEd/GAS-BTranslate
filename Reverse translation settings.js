function clearReverseTranslationSettings() {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('REVERSE_TRANSLATION_SETTINGS');
  onOpen();
}

function testReverseTranslationSettings() {
  Logger.log(PropertiesService.getUserProperties().getProperty('REVERSE_TRANSLATION_SETTINGS'));
}

function activateReverseTranslationSettings(obj) {
  activateSettings(reverseTranslationStyles, obj, 'REVERSE_TRANSLATION_SETTINGS');
}

const reverseTranslationStyles = {
  "yes": {
    "menuText": "Append reverse translation",
    "run": function () { activateReverseTranslationSettings(this); }
  },
  "no": {
    "menuText": "Don\'t append reverse translation",
    "run": function () { activateReverseTranslationSettings(this); }
  }
}