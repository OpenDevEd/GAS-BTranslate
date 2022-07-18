function translateSelectionAndAppendL(origin, dest) {
  // This will use the selection or the paragraph.
  var p = getParagraphs(true); 
  if (p) {
    for (var i=0; i < p.length; i++) {
      var element = p[i];      
      var boundaryStart = "";
      var boundaryEnd = "";
      if (i==0) {
        boundaryStart = "《translationSTARTS》";
      };
      if (i==p.length-1) {
        boundaryEnd = "《translationENDS》";
      };
      if (element.editAsText) {
        var elementText = element.asText().getText();
        // This check is necessary to exclude images, which return a blank
        // text element.
        if (elementText && elementText.match(/\w/)) {
          // translate using Google Translate and insert
          var out = translateText(elementText, origin, dest);
          var parent = element.getParent(); 
          var offset = 0; // offset=0 means new text is inserted before. offset=1 means new text is inserted after original
          var parPosition = parent.getChildIndex(element)+offset;
          var newPara = parent.insertParagraph(parPosition, "《G》"+out);
          var style = element.editAsText().getAttributes();
          newPara.editAsText().setAttributes(style);
          var gtrURL = getgtrURL(elementText, origin, dest);
          newPara.editAsText().setLinkUrl(0,2,gtrURL);
          // translate using DeepL and insert
          // The offset thing and bounaryStart needs to be checked...
          if (dest != "ar") {
            // DE, EN-GB, EN-US, FR, IT, JA, ES, NL, PL, PT-PT, PT-BR, RU, ZH
            offset = 1; // offset=0 means new text is inserted before / offset=1 means new text is before after Google translate          
            out = translateTextDeepL(elementText, origin, dest);
            // if (tranlationDisplay == 'in_text') {}
            newPara = parent.insertParagraph(parPosition, boundaryStart+"《D》"+out);
            newPara.editAsText().setAttributes(style);
            var DeepLURL = getDeepLURL(elementText, origin, dest);
            newPara.editAsText().setLinkUrl(boundaryStart.length+0,boundaryStart.length+2,DeepLURL);
          // } elsif (tranlationDisplay == 'footnote') {
            // higher priority
          // } elsif (tranlationDisplay == 'comment') {
            // THis is harder because we need to preserve links... 
            // low priority
          // }          
          }
          // Give the source paragraph a different colour:
          style = {};
          style[DocumentApp.Attribute.BACKGROUND_COLOR] = '#EFEFEF';
          style[DocumentApp.Attribute.FOREGROUND_COLOR] = '#015610'; // null
          element.editAsText().insertText(0,"《translationOf: ");
          element.editAsText().insertText(element.editAsText().getText().toString().length,"》"+boundaryEnd);
          element.editAsText().setAttributes(0,15,style);
        }
      } else {
        alert('could not edit para');
      };
    };    
    highlightTranslationStartEnd();
  } else {
    alert('could not get para');
  };
};