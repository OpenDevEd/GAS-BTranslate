// retrieveSlot uses the function
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

  // Translation settings contain DeepL
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
  // End. Translation settings contain DeepL

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
          // This check is necessary to exclude images, which return a blank text element.
          if (elementText.length > 0) {

            var parent = element.getParent();
            var offset = 0; // offset=0 means new text is inserted before. offset=1 means new text is inserted after original
            var parPosition = parent.getChildIndex(element) + offset;

            // translate using Google Translate and insert
            for (let j in googleArray) {
              var out = translateText(elementText, googleArray[j].origin, googleArray[j].dest);
              var glinkText = "《G:" + googleArray[j].dest + "》";
              var newPara = parent.insertParagraph(parPosition, glinkText + out);
              var style = element.editAsText().getAttributes();
              newPara.editAsText().setAttributes(style);
              var gtrURL = getgtrURL(elementText, googleArray[j].origin, googleArray[j].dest);
              newPara.editAsText().setLinkUrl(0, glinkText.length - 1, gtrURL);
            }

            // translate using DeepL and insert    
            for (let j = 0; j < deepLArray.length; j++) {
              out = translateTextDeepL(elementText, deepLArray[j].origin, deepLArray[j].dest, deepLArray[j].formality);
              if (deepLArray[j].formality == 'default') {
                formality = '';
              } else {
                formality = deepLArray[j].formality == 'less' ? ' informal' : ' formal';
              }
              dLlinkText = "《D:" + deepLArray[j].dest + formality + "》";
              translationLinkText = dLlinkText + out;
              linkStart = 0;
              linkEnd = dLlinkText.length - 1;
              newPara = parent.insertParagraph(parPosition, translationLinkText);
              newPara.editAsText().setAttributes(style);
              var DeepLURL = getDeepLURL(elementText, deepLArray[j].origin, deepLArray[j].dest);
              newPara.editAsText().setLinkUrl(linkStart, linkEnd, DeepLURL);
            }
            if (i == 0) {
              newPara = parent.insertParagraph(parPosition, boundaryStart);
            }

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
  } else {
    alert('Error. Unexpected format style.');
  }
}

function appendFootnotes(deepLArray, googleArray) {
  const doc = DocumentApp.getActiveDocument();
  const documentId = doc.getId();

  const namedRanges = [];
  const footnotesInfo = new Object();

  let mainTranslationAdded, element, elementText, offset, parent, parPosition, style, formality, linkText, linkUrl, rangeName;

  const p = getParagraphs(true);
  if (p) {
    for (let i = 0; i < p.length; i++) {
      mainTranslationAdded = false;
      element = p[i];

      if (element.editAsText) {
        elementText = element.asText().getText();
        // This check is necessary to exclude images, which return a blank text element.
        if (elementText.length > 0) {
          offset = 0; // offset=0 means new text is inserted before. offset=1 means new text is inserted after original
          parent = element.getParent();
          parPosition = parent.getChildIndex(element) + offset;
          style = element.editAsText().getAttributes();

          // Translates using DeepL
          for (let j = 0; j < deepLArray.length; j++) {
            out = translateTextDeepL(elementText, deepLArray[j].origin, deepLArray[j].dest, deepLArray[j].formality);
            if (deepLArray[j].formality == 'default') {
              formality = '';
            } else {
              formality = deepLArray[j].formality == 'less' ? ' informal' : ' formal';
            }
            linkText = "《D:" + deepLArray[j].dest + formality + "》";
            linkUrl = getDeepLURL(elementText, deepLArray[j].origin, deepLArray[j].dest);

            if (mainTranslationAdded === false) {
              rangeName = insertMainTranslation(doc, style, parent, parPosition, elementText, linkText, out, linkUrl, namedRanges, footnotesInfo);
              mainTranslationAdded = true;
            } else {
              footnotesInfo[rangeName].tr.push({ out: out, linkText: linkText, url: linkUrl });
            }
          }
          // End. Translates using DeepL

          // Translates using Google Translate
          for (let j in googleArray) {
            out = translateText(elementText, googleArray[j].origin, googleArray[j].dest);

            linkText = "《G:" + googleArray[j].dest + "》";
            linkUrl = getgtrURL(elementText, googleArray[j].origin, googleArray[j].dest);

            if (mainTranslationAdded === false) {
              rangeName = insertMainTranslation(doc, style, parent, parPosition, elementText, linkText, out, linkUrl, namedRanges, footnotesInfo);
              mainTranslationAdded = true;
            } else {
              footnotesInfo[rangeName].tr.push({ out: out, linkText: linkText, url: linkUrl });
            }
          }
          // End. Translates using Google Translate

          // Get formatting
          numChildren = element.getNumChildren();
          for (let m = 0; m < numChildren; m++) {
            child = element.getChild(m);

            indices = child.getTextAttributeIndices();
            for (let g = 0; g < indices.length; g++) {
              partAttributes = child.getAttributes(indices[g]);

              partAttributes['start'] = indices[g];
              if (g == indices.length - 1) {
                partAttributes['end'] = elementText.length;
              } else {
                partAttributes['end'] = indices[g + 1];
              }
              footnotesInfo[rangeName].elementFormatting.push(partAttributes);
            }
          }
          // End. Get formatting

          if (p.length - 1 == i) {
            parent.insertParagraph(parPosition + 2, '《translationENDS》');
          }

          if (i == 0) {
            parent.insertParagraph(parPosition, '《translationSTARTS》');
          }

          element.removeFromParent();
        } /* else {
          Logger.log('A blank text element');
        } */
      } else {
        alert('could not edit para');
      };
    }
    highlightTranslationStartEnd();
  } else {
    alert('could not get para');
  };

  doc.saveAndClose();

  let document = Docs.Documents.get(documentId);
  let startIndex, endIndex;
  const requests = [];
  const footnotesStartIndexes = new Object();

  for (let i = namedRanges.length; i >= 0; i--) {
    selectedNamedRange = namedRanges[i];
    if (document.namedRanges[selectedNamedRange]) {
      startIndex = document.namedRanges[selectedNamedRange].namedRanges[0].ranges[0].startIndex;
      endIndex = document.namedRanges[selectedNamedRange].namedRanges[0].ranges[0].endIndex;
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
          createFootnote: {
            location: {
              index: startIndex
            }
          }
        }
      );
    }
  }

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
          if (footnotesStartIndexes.hasOwnProperty(item.startIndex)) {
            footnoteId = item.footnoteReference.footnoteId;
            footnotesInfo[footnotesStartIndexes[item.startIndex]].footnoteId = footnoteId;
          }/* else {
            Logger.log('wrong footnote index');
          } */

        } /* else {
          Logger.log('no footnoteReference');
        }*/
      });
    }
  }
  // End. Gets footnotes

  // Inserts texts in footnotes, applies original formatting to text that was translated 
  const textStyle_TRANSLATION_OF = {
    foregroundColor: {
      color: {
        rgbColor: hexToRGB('#015610')
      }
    },
    backgroundColor: {
      color: {
        rgbColor: hexToRGB('#eeeeee')
      }
    }
  };

  const requests2 = [];
  let footnoteText, linksHelper, elementFormatting, formattingObj, translationOfStart;
  for (let rangeName in footnotesInfo) {
    footnoteText = '';
    linksHelper = [];

    // Concatenates all translations of the footnote
    for (let i in footnotesInfo[rangeName].tr) {
      dLlinkText = footnotesInfo[rangeName].tr[i].linkText;
      linksHelper.push({ startIndex: footnoteText.length, endIndex: footnoteText.length + dLlinkText.length, url: footnotesInfo[rangeName].tr[i].url });

      footnoteText += dLlinkText + ' ' + footnotesInfo[rangeName].tr[i].out + '\n';
    }
    // End. Concatenates all translations of the footnote

    // Original text
    footnoteElementPart = '《translationOf:' + footnotesInfo[rangeName].elementText + '》';

    // Position where "《translationOf:" ends
    translationOfStart = footnoteText.length + 15;

    // Concatenates translations and original text
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
          text_style: textStyle_TRANSLATION_OF,
          fields: formFieldsString(textStyle_TRANSLATION_OF)
        }
      }
    );

    // Applies formatting to original text
    for (let i in footnotesInfo[rangeName].elementFormatting) {
      elementFormatting = footnotesInfo[rangeName].elementFormatting[i];

      formattingObj = createFormatObject(elementFormatting.FOREGROUND_COLOR, elementFormatting.BACKGROUND_COLOR, elementFormatting.BOLD, elementFormatting.ITALIC, elementFormatting.UNDERLINE, elementFormatting.STRIKETHROUGH, elementFormatting.LINK_URL);
      if (formattingObj != null) {
        requests2.push(
          {
            updateTextStyle: {
              range: {
                startIndex: footnotesInfo[rangeName].elementFormatting[i].start + translationOfStart,
                endIndex: footnotesInfo[rangeName].elementFormatting[i].end + translationOfStart,
                segmentId: footnotesInfo[rangeName].footnoteId,
              },
              text_style: formattingObj,
              fields: formFieldsString(formattingObj)
            }
          }
        );
      }
    }
    // End. Applies formatting to original text

    // Creates links to translate engines (for example, 《D:EN-GB》, 《G:en》 etc.)
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
          }
        }
      );
    }
    // End. Creates links to translate engines (for example, 《D:EN-GB》, 《G:en》 etc.)

  }
  Docs.Documents.batchUpdate({
    requests: requests2
  }, documentId);

  // End. Inserts texts in footnotes, applies original formatting to text that was translated 
}

function insertMainTranslation(doc, style, parent, parPosition, elementText, linkText, out, url, namedRanges, footnotesInfo) {
  const newPara = parent.insertParagraph(parPosition, linkText + out);
  newPara.editAsText().setAttributes(style);
  newPara.editAsText().setLinkUrl(0, linkText.length - 1, url);
  const rangeName = markFootnotePlace(doc, newPara, namedRanges, footnotesInfo);
  footnotesInfo[rangeName].elementText = elementText;
  footnotesInfo[rangeName].elementFormatting = [];
  return rangeName;
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

// Creates object for updateTextStyle request of Doc API
// appendFootnotes uses the function
function createFormatObject(foregroundColor, backgroundColor, bold, italic, underline, strikethrough, link) {
  if (foregroundColor != null || backgroundColor != null || bold != null || italic != null || underline != null || strikethrough != null || link != null) {
    const formatObj = new Object();
    if (link != null) {
      formatObj.link = { url: link };
    }

    if (foregroundColor != null) {
      formatObj.foregroundColor = {
        color: {
          rgbColor: hexToRGB(foregroundColor)
        }
      };
    }

    if (backgroundColor != null) {
      formatObj.backgroundColor = {
        color: {
          rgbColor: hexToRGB(backgroundColor)
        }
      };
    }

    if (bold != null) {
      formatObj.bold = true;
    }

    if (italic != null) {
      formatObj.italic = true;
    }

    if (underline != null) {
      formatObj.underline = true;
    }

    if (strikethrough != null) {
      formatObj.strikethrough = true;
    }
    return formatObj;
  } else {
    return null;
  }
}

// The function below was adapted from https://css-tricks.com/converting-color-spaces-in-javascript/#hex-to-rgb
// Convert Hex to RGB
// createFormatObject uses the function
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

// Inserts symbol ~ at the end of paragraph where footnote will be added, creates named range
// appendFootnotes uses the function
function markFootnotePlace(doc, newPara, namedRanges, footnotesInfo) {
  const rangeBuilder = doc.newRange();
  const rangeName = 'namedRange' + new Date().getTime() + namedRanges.length;
  const footnotePlace = newPara.insertText(1, '~');
  rangeBuilder.addElement(footnotePlace);
  doc.addNamedRange(rangeName, rangeBuilder.build());
  namedRanges.push(rangeName);
  footnotesInfo[rangeName] = { tr: [], elementText: '' };
  return rangeName;
}