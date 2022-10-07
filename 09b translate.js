// translateSelectionAndAppend12, translateSelectionAndAppend21 etc. use the function
//function translateSelectionAndAppendL(origin, dest) {
function translateSelectionAndAppendL(settings) {
  Logger.log(settings);
  const deepLArray = [];
  const googleArray = [];
  for (let i in settings.targets) {
    if (settings.targets[i].deepL) {
      deepLArray.push({ origin: settings.source.deepL, dest: settings.targets[i].deepL, formality: settings.targets[i].form });
    } else {
      googleArray.push({ origin: settings.source.google, dest: settings.targets[i].google });
    }
  }

  // Logger.log(deepLArray);
  // Logger.log(googleArray);

  if (deepLArray.length > 0) {
    // DeepL API key
    const activeDeeplApiKeySettings = getDeeplApiKeySettings(true).settings;
    let deeplApiKeyUser = getDeepLAPIkey('user');
    let deeplApiKeyDoc = getDeepLAPIkey('doc');

    let useDeeplApiKeyUser, useDeeplApiKeyDoc, confirmationResult, selectedStorage, keyResult;
    // Always ask
    if (activeDeeplApiKeySettings == 'ask') {
      if (deeplApiKeyUser != null && deeplApiKeyDoc != null) {
        confirmationResult = getConfirmationFromUser('If you want to use DeepL API key stored in user properties, click OK.\nIf you want to use DeepL API key stored in document properties, click CANCEL');
        if (confirmationResult === true) {
          selectedStorage = 'user';
        } else {
          selectedStorage = 'doc';
        }
      } else if (deeplApiKeyUser == null && deeplApiKeyDoc == null) {
        alert('Please enable DeepL by entering API key.');
        return 0;
      } else if (deeplApiKeyUser != null && deeplApiKeyDoc == null) {
        confirmationResult = getConfirmationFromUser('If you want to use DeepL API key stored in user properties, click OK.\nIf you want to add DeepL API key for document, click CANCEL');
        if (confirmationResult === true) {
          selectedStorage = 'user';
        } else {
          selectedStorage = 'doc';
          keyResult = enterDeepLAPIkey('doc');
          if (keyResult.status == 'ok') {
            deeplApiKeyDoc = keyResult.apiKey;
          } else if (keyResult.status == 'error') {
            return 0;
          }
        }
      } else if (deeplApiKeyUser == null && deeplApiKeyDoc != null) {
        confirmationResult = getConfirmationFromUser('If you want to use DeepL API key stored in doc properties, click OK.\nIf you want to add DeepL API key for user/all documents, click CANCEL');
        if (confirmationResult === true) {
          selectedStorage = 'doc';
        } else {
          selectedStorage = 'user';
          keyResult = enterDeepLAPIkey('user');
          if (keyResult.status == 'ok') {
            deeplApiKeyUser = keyResult.apiKey;
          } else if (keyResult.status == 'error') {
            return 0;
          }
        }
      }
      apiKey = selectedStorage == 'user' ? deeplApiKeyUser : deeplApiKeyDoc;
      Logger.log('apiKey=' + apiKey);
    }
    // End. Always ask

    // Default to document API key / Default to user API key
    if (activeDeeplApiKeySettings == 'doc' || activeDeeplApiKeySettings == 'user') {
      if ((activeDeeplApiKeySettings == 'doc' && deeplApiKeyDoc == null) || (activeDeeplApiKeySettings == 'user' && deeplApiKeyUser == null)) {
        keyResult = enterDeepLAPIkey(activeDeeplApiKeySettings);
        if (keyResult.status == 'ok') {
          //deeplApiKeyDoc = keyResult.apiKey;
          apiKey = keyResult.apiKey;
        } else if (keyResult.status == 'error') {
          return 0;
        }
      } else if ((activeDeeplApiKeySettings == 'doc' && deeplApiKeyDoc != null) || (activeDeeplApiKeySettings == 'user' && deeplApiKeyUser != null)) {
        apiKey = activeDeeplApiKeySettings == 'user' ? deeplApiKeyUser : deeplApiKeyDoc;
      }
    }
    // End. Default to document API key / Default to user API key
    // End. DeepL API key
  }


  let translationLinkText, linkStart, linkEnd, dLlinkText;

  const format = getFormatSettings(true);
  if (format.style == 'footnotes') {
    Logger.log('footnotes');
    appendFootnotes(deepLArray, googleArray);
  } else if (format.style == 'txt') {

    // This will use the selection or the paragraph.
    var p = getParagraphs(true);
    if (p) {
      for (var i = 0; i < p.length; i++) {
        var element = p[i];
        var boundaryStart = "";
        var boundaryEnd = "";
        if (i == 0) {
          boundaryStart = "《translationSTARTS》";
        };
        if (i == p.length - 1) {
          boundaryEnd = "《translationENDS》";
        };
        if (element.editAsText) {
          var elementText = element.asText().getText();
          Logger.log('elementText' + elementText);
          // This check is necessary to exclude images, which return a blank text element.
          if (elementText.length > 0) {
            //if (elementText && elementText.match(/\w/)) {

            var parent = element.getParent();
            var offset = 0; // offset=0 means new text is inserted before. offset=1 means new text is inserted after original
            var parPosition = parent.getChildIndex(element) + offset;

            for (let j in googleArray) {
              Logger.log('test g');
              // translate using Google Translate and insert
              var out = translateText(elementText, googleArray[j].origin, googleArray[j].dest);
              Logger.log(out);
              var glinkText = "《G:" + googleArray[j].dest + "》";
              var newPara = parent.insertParagraph(parPosition, glinkText + out);
              var style = element.editAsText().getAttributes();
              newPara.editAsText().setAttributes(style);
              var gtrURL = getgtrURL(elementText, googleArray[j].origin, googleArray[j].dest);
              newPara.editAsText().setLinkUrl(0, glinkText.length - 1, gtrURL);
            }

            // translate using DeepL and insert
            // The offset thing and bounaryStart needs to be checked...
            //if (dest != "ar") {
            // DE, EN-GB, EN-US, FR, IT, JA, ES, NL, PL, PT-PT, PT-BR, RU, ZH
            // offset = 1; // offset=0 means new text is inserted before / offset=1 means new text is before after Google translate       
            for (let j = 0; j < deepLArray.length; j++) {
              Logger.log('test d');
              out = translateTextDeepL(elementText, deepLArray[j].origin, deepLArray[j].dest, deepLArray[j].formality);
              // if (tranlationDisplay == 'in_text') {}
              Logger.log(out);
              //dLlinkText = "《D:" + deepLArray[j].dest + "》";
              if (deepLArray[j].formality == 'default') {
                formality = '';
              } else {
                formality = deepLArray[j].formality == 'less' ? ' informal' : ' formal';
              }
              dLlinkText = "《D:" + deepLArray[j].dest + formality + "》";
              // if (j != 0) {
              //   translationLinkText = boundaryStart + dLlinkText + out;
              //   linkStart = boundaryStart.length + 0;
              //   linkEnd = boundaryStart.length + dLlinkText.length;
              // } else {
              translationLinkText = dLlinkText + out;
              linkStart = 0;
              linkEnd = dLlinkText.length - 1;
              // }
              //newPara = parent.insertParagraph(parPosition, boundaryStart + "《D》" + out);
              newPara = parent.insertParagraph(parPosition, translationLinkText);
              newPara.editAsText().setAttributes(style);
              var DeepLURL = getDeepLURL(elementText, deepLArray[j].origin, deepLArray[j].dest);
              //newPara.editAsText().setLinkUrl(boundaryStart.length + 0, boundaryStart.length + 2, DeepLURL);
              newPara.editAsText().setLinkUrl(linkStart, linkEnd, DeepLURL);
            }
            if (i == 0) {
              var newPara = parent.insertParagraph(parPosition, boundaryStart);
            }
            // } elsif (tranlationDisplay == 'footnote') {
            // higher priority
            // } elsif (tranlationDisplay == 'comment') {
            // THis is harder because we need to preserve links... 
            // low priority
            // }          
            //}
            // Give the source paragraph a different colour:
            style = {};
            style[DocumentApp.Attribute.BACKGROUND_COLOR] = '#EFEFEF';
            style[DocumentApp.Attribute.FOREGROUND_COLOR] = '#015610'; // null
            element.editAsText().insertText(0, "《translationOf: ");
            element.editAsText().insertText(element.editAsText().getText().toString().length, "》" + boundaryEnd);
            element.editAsText().setAttributes(0, 15, style);
          } else {
            Logger.log('A blank text element');
          }
        } else {
          alert('could not edit para');
        };
      };
      highlightTranslationStartEnd();
    } else {
      alert('could not get para');
    };
  }else{
    alert('Error. Unexpected format style.');
  }
}

function appendFootnotes(deepLArray, googleArray) {
  const doc = DocumentApp.getActiveDocument();
  const documentId = doc.getId();

  const namedRanges = [];
  const footnotesInfo = new Object();
  Logger.log(deepLArray);
  Logger.log(googleArray);

  let mainTranslationAdded, footnotePlace;

  var p = getParagraphs(true);
  if (p) {
    for (var i = 0; i < p.length; i++) {
      mainTranslationAdded = false;
      var element = p[i];

      Logger.log('AtDocumentEnd?' + element.isAtDocumentEnd());
      if (element.isAtDocumentEnd() === true) {
        doc.getBody().appendParagraph(' ');
        Logger.log('AtDocumentEnd');
      } else {
        Logger.log('Not AtDocumentEnd');
      }

      var boundaryStart = "";
      var boundaryEnd = "";
      if (i == 0) {
        boundaryStart = "《translationSTARTS》";
      };
      if (i == p.length - 1) {
        boundaryEnd = "《translationENDS》";
      };
      if (element.editAsText) {
        var elementText = element.asText().getText();
        Logger.log('elementText' + elementText);
        // This check is necessary to exclude images, which return a blank text element.
        if (elementText.length > 0) {
          // if (elementText && elementText.match(/\w/)) {

          var offset = 0; // offset=0 means new text is inserted before. offset=1 means new text is inserted after original
          var parent = element.getParent();
          var parPosition = parent.getChildIndex(element) + offset;
          var style = element.editAsText().getAttributes();
          for (let j = 0; j < deepLArray.length; j++) {
            Logger.log('test d');
            out = translateTextDeepL(elementText, deepLArray[j].origin, deepLArray[j].dest, deepLArray[j].formality);
            Logger.log(out);
            if (deepLArray[j].formality == 'default') {
              formality = '';
            } else {
              formality = deepLArray[j].formality == 'less' ? ' informal' : ' formal';
            }
            dLlinkText = "《D:" + deepLArray[j].dest + formality + "》";
            translationLinkText = dLlinkText + out;
            linkStart = 0;
            linkEnd = dLlinkText.length - 1;
            var DeepLURL = getDeepLURL(elementText, deepLArray[j].origin, deepLArray[j].dest);

            if (mainTranslationAdded === false) {
              newPara = parent.insertParagraph(parPosition, translationLinkText);
              newPara.editAsText().setAttributes(style);
              newPara.editAsText().setLinkUrl(linkStart, linkEnd, DeepLURL);

              rangeName = markFootnotePlace(doc, newPara, namedRanges, footnotesInfo);
              footnotesInfo[rangeName].elementText = elementText;
              mainTranslationAdded = true;
            } else {
              footnotesInfo[rangeName].tr.push({ out: out, linkText: dLlinkText, url: DeepLURL });
            }
          }

          for (let j in googleArray) {
            Logger.log('test g');
            // translate using Google Translate and insert
            var out = translateText(elementText, googleArray[j].origin, googleArray[j].dest);
            Logger.log(out);

            glinkText = "《G:" + googleArray[j].dest + "》";
            var gtrURL = getgtrURL(elementText, googleArray[j].origin, googleArray[j].dest);

            if (mainTranslationAdded === false) {
              var newPara = parent.insertParagraph(parPosition, glinkText + out);

              newPara.editAsText().setAttributes(style);
              newPara.editAsText().setLinkUrl(0, glinkText.length - 1, gtrURL);
              rangeName = markFootnotePlace(doc, newPara, namedRanges, footnotesInfo);
              footnotesInfo[rangeName].elementText = elementText;
              mainTranslationAdded = true;
            } else {
              footnotesInfo[rangeName].tr.push({ out: out, linkText: glinkText, url: gtrURL });
            }
          }


          offset = 1; // offset=0 means new text is inserted before / offset=1 means new text is before after Google translate       

          // if (i == 0) {
          //   var newPara = parent.insertParagraph(parPosition, boundaryStart);
          // }

          // Give the source paragraph a different colour:
          /* style = {};
           style[DocumentApp.Attribute.BACKGROUND_COLOR] = '#EFEFEF';
           style[DocumentApp.Attribute.FOREGROUND_COLOR] = '#015610'; // null
           element.editAsText().insertText(0, "《translationOf: ");
           element.editAsText().insertText(element.editAsText().getText().toString().length, "》" + boundaryEnd);
           element.editAsText().setAttributes(0, 15, style); */
          if (p.length - 1 == i) {
            doc.getBody().appendParagraph(' ');
          }
          element.removeFromParent();
        } else {
          Logger.log('A blank text element');
        }
      } else {
        alert('could not edit para');
      };
    };
    highlightTranslationStartEnd();
  } else {
    alert('could not get para');
  };

  Logger.log(namedRanges);

  Logger.log(footnotesInfo);

  /*
    for (let i in namedRanges) {
      range = doc.getBody().findText(namedRanges[i]);
      Logger.log(range);
      if (range != null) {
        var rangeBuilder = doc.newRange();
        rangeBuilder.addElement(range.getElement());
        doc.addNamedRange(namedRanges[i], rangeBuilder.build());
      }
    }
  */


  doc.saveAndClose();
  let document = Docs.Documents.get(documentId);
  let startIndex;
  let endIndex;
  const requests = [];

  const footnotesStartIndexes = new Object();

  //if (document.namedRanges) {

  Logger.log(document.namedRanges);
  for (let i = namedRanges.length; i >= 0; i--) {
    selectedNamedRange = namedRanges[i];
    if (document.namedRanges[selectedNamedRange]) {
      startIndex = document.namedRanges[selectedNamedRange].namedRanges[0].ranges[0].startIndex;
      endIndex = document.namedRanges[selectedNamedRange].namedRanges[0].ranges[0].endIndex;
      Logger.log(startIndex + ' ' + endIndex);
      footnotesInfo[selectedNamedRange].startIndex = startIndex;
      footnotesInfo[selectedNamedRange].endIndex = endIndex;
      footnotesStartIndexes[startIndex] = selectedNamedRange;
      requests.push(
        {
          deleteNamedRange: {
            name: selectedNamedRange
          }
        },
        {
          deleteContentRange: {
            range: {
              startIndex: startIndex,
              endIndex: endIndex,
            }
          }
        },
        {
          'createFootnote': {
            location: {
              index: startIndex
            }
          }
        },

      );
    }
  }
  //}
  Docs.Documents.batchUpdate({
    requests: requests
  }, documentId);

  document = Docs.Documents.get(documentId);
  // Gets footnotes
  let bodyElements = document.body.content;
  for (let i in bodyElements) {
    if (bodyElements[i].paragraph) {
      bodyElements[i].paragraph.elements.forEach(function (item) {
        if (item.footnoteReference) {
          Logger.log(item);
          Logger.log(item.footnoteReference);
          // if (item.endIndex == insertStartIndex) {
          //   footnoteId = item.footnoteReference.footnoteId;
          //   Logger.log('our footnoteId = ' + footnoteId);
          //   Logger.log('!!!! ' + JSON.stringify(document.footnotes[footnoteId]));
          // }
          if (footnotesStartIndexes.hasOwnProperty(item.startIndex)) {
            footnoteId = item.footnoteReference.footnoteId;
            footnotesInfo[footnotesStartIndexes[item.startIndex]].footnoteId = footnoteId;
          } else {
            Logger.log('wrong footnote index');
          }

        } else {
          Logger.log('no footnoteReference');
        }

      });
    }
  }
  // End. Gets footnotes
  Logger.log(footnotesInfo);


  // Adds texts to footnotes
  const requests2 = [];
  let footnoteText, linksHelper;
  for (let rangeName in footnotesInfo) {
    footnoteText = '';
    linksHelper = [];
    for (let i in footnotesInfo[rangeName].tr) {
      dLlinkText = footnotesInfo[rangeName].tr[i].linkText;
      linksHelper.push({ startIndex: footnoteText.length, endIndex: footnoteText.length + dLlinkText.length, url: footnotesInfo[rangeName].tr[i].url });

      footnoteText += dLlinkText + ' ' + footnotesInfo[rangeName].tr[i].out + '\n';
    }
    footnoteElementPart = '《translationOf:' + footnotesInfo[rangeName].elementText + '》';
    footnoteText += footnoteElementPart;
    requests2.push(
      {
        insertText: {
          text: footnoteText,
          location: {
            segmentId: footnotesInfo[rangeName].footnoteId,
            index: 0
          }
        }
      },
      {
        updateTextStyle: {
          range: {
            startIndex: footnoteText.length - footnoteElementPart.length,
            endIndex: footnoteText.length - footnoteElementPart.length + 15,
            segmentId: footnotesInfo[rangeName].footnoteId,
          },
          text_style: textStyle_FIGURE_PART_1,
          fields: formFieldsString(textStyle_FIGURE_PART_1)
        }
      }
    );


    for (let i in linksHelper) {
      requests2.push(
        {
          updateTextStyle: {
            range: {
              startIndex: linksHelper[i].startIndex,
              endIndex: linksHelper[i].endIndex,
              segmentId: footnotesInfo[rangeName].footnoteId,
            },
            text_style: { link: { url: linksHelper[i].url } },
            fields: 'link'
            // text_style: textStyle_FIGURE_PART_1,
            // fields: formFieldsString(textStyle_FIGURE_PART_1)
          }
        }
      );
    }


  }
  Docs.Documents.batchUpdate({
    requests: requests2
  }, documentId);


  Logger.log(formFieldsString(textStyle_FIGURE_PART_1));
  // End. Adds texts to footnotes
}

// Get object that describe styling
// Return string "fields" for batchUpdate requests
// All functions that use Docs.Documents.batchUpdate use the function
function formFieldsString(object) {
  let string = '';
  let commaFlag = false;
  for (let key in object) {
    if (commaFlag === false) {
      commaFlag = true;
    } else {
      string += ',';
    }
    string += key;
  }
  if (string == '') string = '*';
  return string;
}

const textStyle_FIGURE_PART_1 = {
  foregroundColor: {
    color: {
      rgbColor: hexToRGB('#015610')
    }
  },
  backgroundColor: {
    color: {
      rgbColor: hexToRGB('#eeeeee')
    }
  },
  fontSize: {
    magnitude: 11,
    unit: 'PT'
  },
  /* bold: true,
   italic: false,
   weightedFontFamily: {
     fontFamily: "Open Sans",
     weight: 400
   }*/
};

// The function below was adapted from https://css-tricks.com/converting-color-spaces-in-javascript/#hex-to-rgb
// Convert Hex to RGB
function hexToRGB(h) {
  let r = 0, g = 0, b = 0;

  // 3 digits
  if (h.length == 4) {
    r = "0x" + h[1] + h[1];
    g = "0x" + h[2] + h[2];
    b = "0x" + h[3] + h[3];

    // 6 digits
  } else if (h.length == 7) {
    r = "0x" + h[1] + h[2];
    g = "0x" + h[3] + h[4];
    b = "0x" + h[5] + h[6];
  }

  return { red: +(r / 255), green: +(g / 255), blue: +(b / 255) };
}

function markFootnotePlace(doc, newPara, namedRanges, footnotesInfo) {
  newParaText = newPara.getText();
  style = {};
  style[DocumentApp.Attribute.BACKGROUND_COLOR] = '#EFEFEF';
  style[DocumentApp.Attribute.FOREGROUND_COLOR] = '#015610';

  const rangeBuilder = doc.newRange();
  rangeName = 'namedRange' + new Date().getTime() + namedRanges.length;
  footnotePlace = newPara.insertText(1, '~');
  //newPara.editAsText().setAttributes(newParaText.length, newParaText.length + rangeName.length - 1, style);
  //footnotePlace.setAttributes(style);
  rangeBuilder.addElement(footnotePlace);
  doc.addNamedRange(rangeName, rangeBuilder.build());
  namedRanges.push(rangeName);
  footnotesInfo[rangeName] = { tr: [], elementText: '' };
  return rangeName;
}


function getNamedRanges() {
  const doc = DocumentApp.getActiveDocument();
  const documentId = doc.getId();
  let document = Docs.Documents.get(documentId);
  let startIndex;
  let endIndex;

  if (document.namedRanges) {
    Logger.log(document.namedRanges);
  } else {
    Logger.log(document.namedRanges);
  }
}

function clearNamedRanges() {
  const doc = DocumentApp.getActiveDocument();
  namedRanges = doc.getNamedRanges();
  for (let i in namedRanges) {
    Logger.log(namedRanges[i].getName());
    namedRanges[i].remove();
  }
}

function testRanges() {
  var doc = DocumentApp.getActiveDocument();
  var rangeBuilder = doc.newRange();
  var tables = doc.getBody().getTables();
  for (var i = 0; i < tables.length; i++) {
    rangeBuilder.addElement(tables[i]);
  }
  doc.addNamedRange('myUniquePrefix-tables', rangeBuilder.build());
}

function checkDocumentJson() {
  const doc = DocumentApp.getActiveDocument();
  const documentId = doc.getId();
  let document = Docs.Documents.get(documentId);
  let startIndex;
  let endIndex;
  if (document.namedRanges) {

  }

  Logger.log(document.body);

  // Gets footnotes
  for (let key in document) {
    Logger.log(key);
    if (key == 'footnotes') {
      Logger.log(document.footnotes);
      for (let ftn in document.footnotes) {
        Logger.log('ftn ' + ftn);
      }
    }
    // if (key == 'body'){
    //   for (let bd in document.body){
    //     Logger.log('bd ' + bd);
    //   }
    // }  
  }
  // End. Gets footnotes

}