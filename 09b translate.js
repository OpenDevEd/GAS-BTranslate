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

  Logger.log(deepLArray);
  Logger.log(googleArray);

  apikey = getDeepLAPIkey();
  if (apikey == null) {
    alert('Please enable DeepL by entering API key.');
    return 0;
  }

  let translationLinkText, linkStart, linkEnd, dLlinkText;

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
        // This check is necessary to exclude images, which return a blank
        // text element.
        //  if (elementText && elementText.match(/\w/)) {


        for (let j in googleArray) {
          Logger.log('test g');
          // translate using Google Translate and insert
          var out = translateText(elementText, googleArray[j].origin, googleArray[j].dest);
          Logger.log(out);
          var parent = element.getParent();
          var offset = 0; // offset=0 means new text is inserted before. offset=1 means new text is inserted after original
          var parPosition = parent.getChildIndex(element) + offset;
          var newPara = parent.insertParagraph(parPosition, "《G》" + out);
          var style = element.editAsText().getAttributes();
          newPara.editAsText().setAttributes(style);
          var gtrURL = getgtrURL(elementText, googleArray[j].origin, googleArray[j].dest);
          newPara.editAsText().setLinkUrl(0, 2, gtrURL);
        }

        // translate using DeepL and insert
        // The offset thing and bounaryStart needs to be checked...
        //if (dest != "ar") {
        // DE, EN-GB, EN-US, FR, IT, JA, ES, NL, PL, PT-PT, PT-BR, RU, ZH
        offset = 1; // offset=0 means new text is inserted before / offset=1 means new text is before after Google translate       
        for (let j = 0; j < deepLArray.length; j++) {
          Logger.log('test d');
          out = translateTextDeepL(elementText, deepLArray[j].origin, deepLArray[j].dest, deepLArray[j].formality);
          // if (tranlationDisplay == 'in_text') {}
          Logger.log(out);
          dLlinkText = "《D:" + deepLArray[j].dest + "》";
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
        // }else{
        //   Logger.log('Hm');
        // }
      } else {
        alert('could not edit para');
      };
    };
    highlightTranslationStartEnd();
  } else {
    alert('could not get para');
  };
};