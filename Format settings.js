function clearFormatSettings() {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('FORMAT_SETTINGS');
  onOpen();
}

function getFormatSettings() {
  const DEFAULT_FORMAT_STYLE = 'txt';
  let resultObj = {
    marker: '',
    style: DEFAULT_FORMAT_STYLE,
    menuText: formatStyles[DEFAULT_FORMAT_STYLE]['menuText']
  };
  try {
    var userProperties = PropertiesService.getUserProperties();
    var formatStyle = userProperties.getProperty('FORMAT_SETTINGS');
    if (formatStyle != null && formatStyles.hasOwnProperty(formatStyle)) {
      resultObj['style'] = formatStyle;
      resultObj['menuText'] = formatStyles[formatStyle]['menuText'];
    }
    resultObj['marker'] = '✅';
  }
  catch (error) {
    Logger.log('Needs to activate!!! ' + error);
  }
  Logger.log(resultObj);
  return resultObj;
}


function activateFormatStyle(obj) {
  // Finds key in formatStyles where value equals obj
  const formatStyle = Object.keys(formatStyles).find(key => formatStyles[key] === obj);
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('FORMAT_SETTINGS', formatStyle);
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
 /* "comments": {
    "menuText": "Format: Primary language in text, rest in comment (links are preserved)",
    "run": function () { activateFormatStyle(this); }
  } */
}
