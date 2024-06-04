function clearPreserveFormattingSettings() {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('PRESERVE_FORMATTING_SETTINGS');
  onOpen();
}
function testPreserveFormattingSettings() {
  Logger.log(PropertiesService.getUserProperties().getProperty('PRESERVE_FORMATTING_SETTINGS'));
}

function activatePreserveFormattingSettings(obj) {
  activateSettings(preserveFormattingStyles, obj, 'PRESERVE_FORMATTING_SETTINGS');
}

// Menu items of preserve formatting settings
const preserveFormattingStyles = {
  "yes": {
    "menuText": "Preserve formatting for translation results",
    "run": function () { activatePreserveFormattingSettings(this); }
  },
  "no": {
    "menuText": "Don\'t preserve formatting for translation results",
    "run": function () { activatePreserveFormattingSettings(this); }
  }
}

