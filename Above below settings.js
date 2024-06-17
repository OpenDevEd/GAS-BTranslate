function clearAboveBelowSettings() {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('ABOVE_BELOW_SETTINGS');
  onOpen();
}
function testAboveBelowSettings() {
  Logger.log(PropertiesService.getUserProperties().getProperty('ABOVE_BELOW_SETTINGS'));
}

function activateAboveBelowSettings(obj) {
  activateSettings(aboveBelowStyles, obj, 'ABOVE_BELOW_SETTINGS');
}

const aboveBelowStyles = {
  "above": {
    "menuText": "Translation above selected text",
    "run": function () { activateAboveBelowSettings(this); }
  },
  "below": {
    "menuText": "Translation below selected text",
    "run": function () { activateAboveBelowSettings(this); }
  }
}