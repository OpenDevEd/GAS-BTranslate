///////////// 000 Menu.gs

var userMode = getUserMode();

function onInstall(e) {
  onOpen(e);
}

function onOpen(e) {
  buildMenu(userMode);
};

function buildMenu(userMode) {
  userMode = userMode || userModeDefault;
  submenu_09_translate_basic().addToUi();
}

function changeVersion() {
  var userProperties = PropertiesService.getUserProperties();
  var key = getValueFromUser("Please enter the developer key");
  if (key == "CalvinHobbes") {
    userProperties.setProperty('USER_MODE', 'dev');
    alert("dev");
  } else {
    userProperties.setProperty('USER_MODE', 'user');
    alert("user");
  };
}

function showUserMode() {
  var userMode = "<empty>";
  try {
    var userProperties = PropertiesService.getUserProperties();
    userMode = userProperties.getProperty('USER_MODE');
  } catch (e) {
    userMode = "unknown/error";
  };
  if (userMode == "dev") {
    buildMenu(userMode);
  } else {
    alert("mode=" + userMode);
  };
}

function getUserMode() {
  var userMode = "";
  try {
    var userProperties = PropertiesService.getUserProperties();
    userMode = userProperties.getProperty('USER_MODE');
    if (!userMode) {
      userMode = userModeDefault;
    };
  } catch (e) {
    userMode = userModeDefault;
  };
  return userMode;
}
