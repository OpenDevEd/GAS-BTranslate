const LEGACY_OPENAI = 'GPT3.5-TURBO';

const LEGACY_OPENAI_MODEL = {
  "model": "gpt-3.5-turbo",
  "temperature": 0.3,
  "maxTokens": 4096,
  "customPrompt": "Translate to <T>",
  "name": "openAI",
  "useDefaultPrompt": false
};

function getApiKey(translator) {
  const translatorName = PROPERTY_NAMES[translator]['textName'];
  const propertyApiKeyName = PROPERTY_NAMES[translator]['propertyApiKeyName'];

  const activeDeeplApiKeySettings = getDeeplApiKeySettings(true, translator).settings;
  // Logger.log(activeDeeplApiKeySettings);

  let deeplApiKeyUser = getDeepLAPIkey('user', propertyApiKeyName);
  let deeplApiKeyDoc = getDeepLAPIkey('doc', propertyApiKeyName);

  let useDeeplApiKeyUser, useDeeplApiKeyDoc, confirmationResult, selectedStorage, keyResult;
  // Always ask
  if (activeDeeplApiKeySettings == 'ask') {
    if (deeplApiKeyUser != null && deeplApiKeyDoc != null) {
      confirmationResult = getConfirmationFromUser(`If you want to use ${translatorName} API key stored in user properties, click OK.\nIf you want to use ${translatorName} API key stored in document properties, click CANCEL`);
      if (confirmationResult === true) {
        selectedStorage = 'user';
      } else {
        selectedStorage = 'doc';
      }
    } else if (deeplApiKeyUser == null && deeplApiKeyDoc == null) {
      alert(`Please enable ${translatorName} by entering API key.`);
      return { status: 'error' };
    } else if (deeplApiKeyUser != null && deeplApiKeyDoc == null) {
      confirmationResult = getConfirmationFromUser(`If you want to use ${translatorName} API key stored in user properties, click OK.\nIf you want to add ${translatorName} API key for document, click CANCEL`);
      if (confirmationResult === true) {
        selectedStorage = 'user';
      } else {
        selectedStorage = 'doc';
        keyResult = enterDeepLAPIkey('doc', translator);
        if (keyResult.status == 'ok') {
          deeplApiKeyDoc = keyResult.apiKey;
        } else if (keyResult.status == 'error') {
          return { status: 'error' };
        }
      }
    } else if (deeplApiKeyUser == null && deeplApiKeyDoc != null) {
      confirmationResult = getConfirmationFromUser(`If you want to use ${translatorName} API key stored in doc properties, click OK.\nIf you want to add ${translatorName} API key for user/all documents, click CANCEL`);
      if (confirmationResult === true) {
        selectedStorage = 'doc';
      } else {
        selectedStorage = 'user';
        keyResult = enterDeepLAPIkey('user', translator);
        if (keyResult.status == 'ok') {
          deeplApiKeyUser = keyResult.apiKey;
        } else if (keyResult.status == 'error') {
          return { status: 'error' };
        }
      }
    }
    apiKey = selectedStorage === 'user' ? deeplApiKeyUser : deeplApiKeyDoc;
  }
  // End. Always ask

  // Default to document API key / Default to user API key
  else if (activeDeeplApiKeySettings == 'doc' || activeDeeplApiKeySettings == 'user') {
    if ((activeDeeplApiKeySettings == 'doc' && deeplApiKeyDoc == null) || (activeDeeplApiKeySettings == 'user' && deeplApiKeyUser == null)) {
      keyResult = enterDeepLAPIkey(activeDeeplApiKeySettings, translator);
      if (keyResult.status == 'ok') {
        apiKey = keyResult.apiKey;
      } else if (keyResult.status == 'error') {
        return { status: 'error' };
      }
    } else if ((activeDeeplApiKeySettings == 'doc' && deeplApiKeyDoc != null) || (activeDeeplApiKeySettings == 'user' && deeplApiKeyUser != null)) {
      apiKey = activeDeeplApiKeySettings == 'user' ? deeplApiKeyUser : deeplApiKeyDoc;
    }
  }
  // End. Default to document API key / Default to user API key
  return { apiKey: apiKey, status: 'ok' };
}



// retrieveSlot uses the function
function translateSelectionAndAppendL(settings) {
  try {

    const llmTranslators = extractTranslatorNamesLLM();

    if (!llmTranslators.allModelsByNames.hasOwnProperty('openAI')) {
      llmTranslators.allModelsByNames['openAI'] = LEGACY_OPENAI_MODEL;
      llmTranslators.OpenAI.push('openAI');
    }

    const deepLArray = [];
    const googleArray = [];
    const openAIArray = [];
    const anthropicArray = [];
    let translationsArray = [];
    let translationsToInsert = [];
    let destLang;
    for (let i in settings.targets) {
      const keys = Object.keys(settings.targets[i]);
      if (settings.targets[i].deepL) {
        deepLArray.push({ origin: settings.source.deepL, dest: settings.targets[i].deepL, formality: settings.targets[i].form });
        destLang = settings.targets[i].deepL;
      } else if (settings.targets[i].google) {
        googleArray.push({ origin: settings.source.google, dest: settings.targets[i].google });
        destLang = settings.targets[i].google;
      } else {
        for (let j in keys) {
          if (llmTranslators.OpenAI.includes(keys[j])) {
            openAIArray.push({ origin: settings.source[keys[j]], dest: settings.targets[i].name, settings: llmTranslators.allModelsByNames[keys[j]] });
            destLang = settings.targets[i].name;
          }
          if (llmTranslators.Anthropic.includes(keys[j])) {
            anthropicArray.push({ origin: settings.source[keys[j]], dest: settings.targets[i].name, settings: llmTranslators.allModelsByNames[keys[j]] });
            destLang = settings.targets[i].name;
          }
        }
      }
    }

    const ltrLang = checkLtr(destLang);

    // Logger.log(deepLArray);
    // Logger.log(googleArray);
    // Logger.log(openAIArray);
    // Logger.log(anthropicArray);

    // Translation settings contain DeepL
    let deepLApiKey;
    if (deepLArray.length > 0) {
      const deepLKeyResult = getApiKey('DEEPL');
      if (deepLKeyResult.status !== 'ok') return 0;
      deepLApiKey = deepLKeyResult.apiKey;
    }
    // End. Translation settings contain DeepL

    // Translation settings contain ChatGPT
    let chatGPTApiKey;
    if (openAIArray.length > 0) {
      const chatGPTKeyResult = getApiKey('CHATGPT');
      if (chatGPTKeyResult.status !== 'ok') return 0;
      chatGPTApiKey = chatGPTKeyResult.apiKey;
    }
    // End. Translation settings contain ChatGPT

    // Translation settings contain Anthropic
    let anthropicApiKey;
    if (anthropicArray.length > 0) {
      const anthropicKeyResult = getApiKey('Anthropic');
      if (anthropicKeyResult.status !== 'ok') return 0;
      anthropicApiKey = anthropicKeyResult.apiKey;
    }
    // End. Translation settings contain Anthropic

    let dLlinkText;

    let { style: preserveFormatting } = getSettings(true, 'no', preserveFormattingStyles, 'PRESERVE_FORMATTING_SETTINGS');
    preserveFormatting = preserveFormatting === 'yes' ? true : false;
    const format = getSettings(true, 'txt', formatStyles, 'FORMAT_SETTINGS');

    if (format.style == 'footnotes') {
      appendFootnotes(deepLArray, googleArray, openAIArray, anthropicArray, deepLApiKey, chatGPTApiKey, anthropicApiKey, ltrLang, preserveFormatting);
    } else if (format.style == 'txt') {

      // This will use the selection or the paragraph.
      const p = getParagraphs(true);
      if (p) {
        for (let i = 0; i < p.length; i++) {
          translationsArray = [];
          translationsToInsert = [];

          const element = p[i];
          let boundaryStart = "";
          let boundaryEnd = "";
          if (i == 0) {
            boundaryStart = "《translationSTARTS》";
          };
          if (i == p.length - 1) {
            boundaryEnd = "《translationENDS》";
          };
          if (element.editAsText()) {
            let elementText = element.asText().getText();
            const elementTextWithoutHtml = elementText;
            // This check is necessary to exclude images, which return a blank text element.
            if (elementText.length > 0) {
              // Preserve formatting
              if (preserveFormatting === true) {
                elementText = convertToHtml(element, elementText);
              }
              // End. Preserve formatting


              const parent = element.getParent();
              const offset = 0; // offset=0 means new text is inserted before. offset=1 means new text is inserted after original
              const parPosition = parent.getChildIndex(element) + offset;

              // Logger.log(deepLArray);
              // Logger.log(googleArray);

              // translate using OpenAI API and insert
              for (let j in openAIArray) {
                const out = translateTextOpenAI(elementText, openAIArray[j].origin, openAIArray[j].dest, chatGPTApiKey, openAIArray[j].settings, preserveFormatting);
                const trName = openAIArray[j].settings.name === 'openAI' ? LEGACY_OPENAI : openAIArray[j].settings.name;
                const openAILinkText = "《" + trName + ":" + openAIArray[j].dest + "》";
                const openAIURL = getOpenAIURL(elementText, openAIArray[j].origin, openAIArray[j].dest);
                collectTranslations(translationsArray, translationsToInsert, out, openAILinkText, openAIURL);
              }

              // translate using Anthropic API and insert
              for (let j in anthropicArray) {
                const out = translateTextAnthropic(elementText, anthropicArray[j].origin, anthropicArray[j].dest, anthropicApiKey, anthropicArray[j].settings, preserveFormatting);
                const trName = anthropicArray[j].settings.name;
                const anthropicLinkText = "《" + trName + ":" + anthropicArray[j].dest + "》";
                const anthropicURL = 'https://claude.ai/chats';
                collectTranslations(translationsArray, translationsToInsert, out, anthropicLinkText, anthropicURL);
              }

              // translate using Google Translate and insert
              for (let j in googleArray) {
                out = translateText(elementText, googleArray[j].origin, googleArray[j].dest);
                const glinkText = "《G:" + googleArray[j].dest + "》";
                const gtrURL = getgtrURL(elementTextWithoutHtml, googleArray[j].origin, googleArray[j].dest);
                collectTranslations(translationsArray, translationsToInsert, out, glinkText, gtrURL);
              }

              // translate using DeepL and insert    
              for (let j = 0; j < deepLArray.length; j++) {
                out = translateTextDeepL(elementText, deepLArray[j].origin, deepLArray[j].dest, deepLArray[j].formality, deepLApiKey, preserveFormatting);
                if (deepLArray[j].formality == 'default') {
                  formality = '';
                } else {
                  formality = deepLArray[j].formality == 'less' ? ' informal' : ' formal';
                }
                dLlinkText = "《D:" + deepLArray[j].dest + formality + "》";
                const DeepLURL = getDeepLURL(elementTextWithoutHtml, deepLArray[j].origin, deepLArray[j].dest);
                collectTranslations(translationsArray, translationsToInsert, out, dLlinkText, DeepLURL);
              }

              //Logger.log(translationsToInsert);
              const style = element.editAsText().getAttributes();
              for (let m = 0; m < translationsToInsert.length; m++) {
                insertTranslations(translationsToInsert[m], parent, style, parPosition, ltrLang, preserveFormatting);
              }

              if (i == 0) {
                newPara = parent.insertParagraph(parPosition, boundaryStart);
              }

              // Give the source paragraph a different colour:
              const styleTranslationOf = {};
              styleTranslationOf[DocumentApp.Attribute.BACKGROUND_COLOR] = '#EFEFEF';
              styleTranslationOf[DocumentApp.Attribute.FOREGROUND_COLOR] = '#015610';
              element.editAsText().insertText(0, "《translationOf: ");
              const elLength = element.editAsText().getText().toString().length;
              element.editAsText().insertText(elLength, "》" + boundaryEnd);
              element.editAsText().setAttributes(0, 15, styleTranslationOf);
              element.editAsText().setAttributes(elLength, elLength, styleTranslationOf);
            } else {
              //Logger.log('A blank text element');
              if (i == 0) {
                element.editAsText().insertText(0, boundaryStart);
              }
              if (p.length - 1 == i) {
                element.editAsText().insertText(0, boundaryEnd);
              }
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
  catch (error) {
    alert(error);
  }
}

function appendFootnotes(deepLArray, googleArray, openAIArray, anthropicArray, deepLApiKey, chatGPTApiKey, anthropicApiKey, ltrLang, preserveFormatting) {
  const doc = DocumentApp.getActiveDocument();
  const documentId = doc.getId();

  const namedRanges = [];
  let translationsArray = [], translationsToInsert = [];
  const footnotesInfo = new Object();

  let element, elementText, elementTextWithoutHtml, offset, parent, parPosition, style, formality, linkText, linkUrl, rangeName, newPara;

  const p = getParagraphs(true);
  if (p) {
    for (let i = 0; i < p.length; i++) {
      mainTranslationAdded = false;
      translationsArray = [];
      translationsToInsert = [];
      element = p[i];

      if (element.editAsText) {
        elementText = element.asText().getText();
        elementTextWithoutHtml = elementText;
        // This check is necessary to exclude images, which return a blank text element.
        if (elementText.length > 0) {
          offset = 0; // offset=0 means new text is inserted before. offset=1 means new text is inserted after original
          parent = element.getParent();
          parPosition = parent.getChildIndex(element) + offset;
          style = element.editAsText().getAttributes();
          if (preserveFormatting === true) {
            elementText = convertToHtml(element, elementText);
          }
          // Translates using DeepL
          for (let j = 0; j < deepLArray.length; j++) {
            out = translateTextDeepL(elementText, deepLArray[j].origin, deepLArray[j].dest, deepLArray[j].formality, deepLApiKey, preserveFormatting);
            if (deepLArray[j].formality == 'default') {
              formality = '';
            } else {
              formality = deepLArray[j].formality == 'less' ? ' informal' : ' formal';
            }
            linkText = "《D:" + deepLArray[j].dest + formality + "》";
            linkUrl = getDeepLURL(elementTextWithoutHtml, deepLArray[j].origin, deepLArray[j].dest);
            collectTranslations(translationsArray, translationsToInsert, out, linkText, linkUrl);
          }
          // End. Translates using DeepL

          // Translates using Google Translate
          for (let j in googleArray) {
            out = translateText(elementText, googleArray[j].origin, googleArray[j].dest);

            linkText = "《G:" + googleArray[j].dest + "》";
            linkUrl = getgtrURL(elementTextWithoutHtml, googleArray[j].origin, googleArray[j].dest);
            collectTranslations(translationsArray, translationsToInsert, out, linkText, linkUrl);
          }
          // End. Translates using Google Translate

          // Translate using OpenAI API
          for (let j in openAIArray) {
            //out = translateTextOpenAI(elementText, openAIArray[j].dest, chatGPTApiKey);
            out = translateTextOpenAI(elementText, openAIArray[j].origin, openAIArray[j].dest, chatGPTApiKey, openAIArray[j].settings, preserveFormatting);
            //const openAILinkText = "《GPT:" + openAIArray[j].dest + "》";
            const trName = openAIArray[j].settings.name === 'openAI' ? LEGACY_OPENAI : openAIArray[j].settings.name;
            const openAILinkText = "《" + trName + ":" + openAIArray[j].dest + "》";
            const openAIURL = getOpenAIURL(elementText, openAIArray[j].origin, openAIArray[j].dest);
            collectTranslations(translationsArray, translationsToInsert, out, openAILinkText, openAIURL);
          }
          // End. Translate using OpenAI API

          // translate using Anthropic API and insert
          for (let j in anthropicArray) {
            const out = translateTextAnthropic(elementText, anthropicArray[j].origin, anthropicArray[j].dest, anthropicApiKey, anthropicArray[j].settings, preserveFormatting);
            const trName = anthropicArray[j].settings.name;
            const anthropicLinkText = "《" + trName + ":" + anthropicArray[j].dest + "》";
            const anthropicURL = 'https://claude.ai/chats';
            collectTranslations(translationsArray, translationsToInsert, out, anthropicLinkText, anthropicURL);
          }

          // rangeName = insertMainTranslation(doc, style, parent, parPosition, elementText, translationsToInsert[0], namedRanges, footnotesInfo);

          // Inserts the main translation
          newPara = insertTranslations(translationsToInsert[0], parent, style, parPosition, ltrLang, preserveFormatting);
          rangeName = markFootnotePlace(doc, newPara, namedRanges, footnotesInfo);
          footnotesInfo[rangeName].elementText = elementTextWithoutHtml;
          footnotesInfo[rangeName].elementFormatting = [];
          // End. Inserts the main translation


          for (let m = 1; m < translationsToInsert.length; m++) {
            linkUrl = translationsToInsert[m].translators[0].url;
            linkText = translationsToInsert[m].translators[0].linkText;
            //footnotesInfo[rangeName].tr.push({ out: translationsToInsert[m].out, linkText: linkText, url: linkUrl });
            footnotesInfo[rangeName].tr.push(translationsToInsert[m]);
          }

          // Get formatting
          numChildren = element.getNumChildren();
          for (let m = 0; m < numChildren; m++) {
            child = element.getChild(m);

            indices = child.getTextAttributeIndices();
            for (let g = 0; g < indices.length; g++) {
              partAttributes = child.getAttributes(indices[g]);
              partAttributes['start'] = indices[g];
              if (g == indices.length - 1) {
                partAttributes['end'] = elementTextWithoutHtml.length;
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
        } else {
          // Logger.log('A blank text element');
          if (i == 0) {
            element.editAsText().insertText(0, '《translationSTARTS》');
          }
          if (p.length - 1 == i) {
            parent.insertParagraph(parPosition + 2, '《translationENDS》');
          }
        }
      } else {
        alert('could not edit para');
      };
    }
    highlightTranslationStartEnd();
  } else {
    alert('could not get para');
  };

  doc.saveAndClose();

  //Logger.log(translationsToInsert);

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

    if (bodyElements[i].table) {
      bodyElements[i].table.tableRows.forEach(function (row) {
        row.tableCells.forEach(function (cell) {
          cell.content.forEach(function (content) {
            if (content?.paragraph?.elements) {
              content.paragraph.elements.forEach(function (item) {
                if (item.footnoteReference) {
                  if (footnotesStartIndexes.hasOwnProperty(item.startIndex)) {
                    footnoteId = item.footnoteReference.footnoteId;
                    footnotesInfo[footnotesStartIndexes[item.startIndex]].footnoteId = footnoteId;
                  }
                }
              });
            }
          });
        });
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
  let footnoteText, linksHelper, elementFormatting, formattingObj, translationOfStart, textToInsert;
  for (let rangeName in footnotesInfo) {
    footnoteText = '';
    linksHelper = [];


    //Logger.log(footnotesInfo);

    // Concatenates all translations of the footnote
    for (let i in footnotesInfo[rangeName].tr) {

      translatorsLinks = '';
      startEndArray = [];
      for (let k = 0; k < footnotesInfo[rangeName].tr[i].translators.length; k++) {
        linkText = footnotesInfo[rangeName].tr[i].translators[k].linkText;
        startEndArray.push({ start: translatorsLinks.length, url: footnotesInfo[rangeName].tr[i].translators[k].url });
        translatorsLinks += linkText + ' ';
        startEndArray[startEndArray.length - 1]['end'] = translatorsLinks.length - 2;
      }


      //dLlinkText = footnotesInfo[rangeName].tr[i].linkText;
      //linksHelper.push({ startIndex: footnoteText.length, endIndex: footnoteText.length + dLlinkText.length, url: footnotesInfo[rangeName].tr[i].url });

      //footnoteText += translatorsLinks + ' ' + footnotesInfo[rangeName].tr[i].out + '\n';

      // if (preserveFormatting === true) {
      //   Logger.log(footnotesInfo[rangeName].tr[i].out);
      //   const { stylesArray, textString } = htmlToStyle(footnotesInfo[rangeName].tr[i].out);
      //   textToInsert = translatorsLinks + textString;
      //   allStylesArray = stylesArray;
      //   Logger.log(stylesArray);
      // } else {
      textToInsert = translatorsLinks + footnotesInfo[rangeName].tr[i].out;
      //}
      footnoteText += textToInsert + '\n';
    }
    // End. Concatenates all translations of the footnote



    let stylesArrayFootnoteText = [];
    let textStringFootnoteText = '';
    if (preserveFormatting === true) {
      const { stylesArray, textString } = htmlToStyle(footnoteText);
      stylesArrayFootnoteText = stylesArray;
      textStringFootnoteText = textString;
      // Logger.log(textStringFootnoteText);
      // Logger.log(stylesArrayFootnoteText);
    } else {
      textStringFootnoteText = footnoteText;
    }

    // Original text
    footnoteElementPart = '《translationOf:' + footnotesInfo[rangeName].elementText + '》';

    // Concatenates translations and original text
    footnoteText = textStringFootnoteText + footnoteElementPart;

    // Position where "《translationOf:" ends
    translationOfStart = textStringFootnoteText.length + 15;

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
      },
      {
        updateTextStyle: {
          range: {
            startIndex: footnoteText.length - 1,
            endIndex: footnoteText.length,
            segmentId: footnotesInfo[rangeName].footnoteId,
          },
          text_style: textStyle_TRANSLATION_OF,
          fields: formFieldsString(textStyle_TRANSLATION_OF)
        }
      }
    );

    // Applies preserved formatting
    for (let i in stylesArrayFootnoteText) {
      let italic = bold = link = null;
      for (let j in stylesArrayFootnoteText[i].tags) {
        const tag = stylesArrayFootnoteText[i].tags[j].tag;
        if (tag === 'i') {
          italic = true;
        } else if (tag === 'b') {
          bold = true;
        } else if (tag === 'a') {
          link = stylesArrayFootnoteText[i].tags[j].link;
        }
      }
      formattingObj = createFormatObject(null, null, bold, italic, null, null, link);
      if (formattingObj != null) {
        requests2.push(
          {
            updateTextStyle: {
              range: {
                startIndex: stylesArrayFootnoteText[i].start,
                endIndex: stylesArrayFootnoteText[i].end,
                segmentId: footnotesInfo[rangeName].footnoteId,
              },
              text_style: formattingObj,
              fields: formFieldsString(formattingObj)
            }
          }
        );
      }
    }
    // End. Applies preserved formatting

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

// Detects identical translations
// appendFootnotes, translateSelectionAndAppendL use the function
function collectTranslations(translationsArray, translationsToInsert, out, linkText, url) {
  const index = translationsArray.indexOf(out);
  if (index == -1) {
    //Logger.log('New: ' + out + ' ' + linkText + ' ' + JSON.stringify(translationsArray));
    translationsArray.push(out);
    translationsToInsert.push({ out: out, translators: [{ linkText: linkText, url: url }] });
  } else {
    //Logger.log('Already added: index = ' + index + ' ' + out + ' ' + linkText + ' ' + JSON.stringify(translationsArray));
    translationsToInsert[index].translators.unshift({ linkText: linkText, url: url });
  }
}

// 1. Inserts translations and original for 'text' workflow
// 2. Inserts the main translation for 'footnote' workflow
// translateSelectionAndAppendL, appendFootnotes use the function
function insertTranslations(translationToInsert, parent, style, parPosition, ltrLang, preserveFormatting) {
  let translatorsLinks = textToInsert = '';
  let allStylesArray;
  startEndArray = [];
  for (let k = 0; k < translationToInsert.translators.length; k++) {
    linkText = translationToInsert.translators[k].linkText;
    startEndArray.push({ start: translatorsLinks.length, url: translationToInsert.translators[k].url });
    translatorsLinks += linkText + ' ';
    startEndArray[startEndArray.length - 1]['end'] = translatorsLinks.length - 2;
  }

  if (preserveFormatting === true) {
    const { stylesArray, textString } = htmlToStyle(translationToInsert.out);
    textToInsert = translatorsLinks + textString;
    allStylesArray = stylesArray;
  } else {
    textToInsert = translatorsLinks + translationToInsert.out;
  }


  newPara = parent.insertParagraph(parPosition, textToInsert);
  newPara.editAsText().setAttributes(style);

  //Logger.log(allStylesArray);
  const translatorsLinksLength = translatorsLinks.length;

  if (preserveFormatting === true) {
    allStylesArray.forEach(style => {
      const docStyles = {};
      style.tags.forEach(tag => {
        if (tag.tag === 'b') {
          docStyles[DocumentApp.Attribute.BOLD] = true;
        } else if (tag.tag === 'i') {
          docStyles[DocumentApp.Attribute.ITALIC] = true;
        } else if (tag.tag === 'a') {
          docStyles[DocumentApp.Attribute.LINK_URL] = tag.link;
        }
      });
      //Logger.log(docStyles);
      newPara.editAsText().setAttributes(style.start + translatorsLinksLength, style.end + translatorsLinksLength - 1, docStyles);
    });
  }

  for (let l = 0; l < startEndArray.length; l++) {
    newPara.editAsText().setLinkUrl(startEndArray[l].start, startEndArray[l].end, startEndArray[l].url);
    newPara.editAsText().setUnderline(startEndArray[l].start, startEndArray[l].end, false);
  }
  newPara.setLeftToRight(ltrLang);
  return newPara;
}

function checkLtr(targetLang) {
  if (['ar', 'AR', 'Arabic', 'Hebrew', 'he', 'Persian', 'fa'].includes(targetLang)) {
    return false;
  } else {
    return true;
  }
}


function convertToHtml(element, elementText) {
  const htmlTextArray = [];
  // const elementType = String(element.getType());
  // Logger.log(elementType);
  // if (elementType === 'PARAGRAPH') {

  const numChildren = element.getNumChildren();
  for (let j = 0; j < numChildren; j++) {

    const paragraphText = element.getChild(j);
    const indices = paragraphText.getTextAttributeIndices();
    // Logger.log('indices=' + indices);

    for (let k = 0; k < indices.length; k++) {
      const partAttributes = paragraphText.getAttributes(indices[k]);
      // Logger.log(partAttributes);
      if (indices.length === 1) {
        end = elementText.length;
      } else if (k == indices.length - 1) {
        end = elementText.length - 1;
      } else {
        end = indices[k + 1];
      }
      let pieceOfText = elementText.slice(indices[k], end);
      // Logger.log('pieceOfText=' + pieceOfText);
      if (partAttributes.LINK_URL) {
        pieceOfText = `<a href=${partAttributes.LINK_URL}>${pieceOfText}</a>`;
      }
      if (partAttributes.BOLD) {
        pieceOfText = `<b>${pieceOfText}</b>`;
      }
      if (partAttributes.ITALIC) {
        pieceOfText = `<i>${pieceOfText}</i>`;
      }
      htmlTextArray.push(pieceOfText);
    }
  }

  elementText = htmlTextArray.join('');
  // Logger.log(elementText);
  return elementText;
  //  }
}