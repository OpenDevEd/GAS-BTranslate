
function singleReplace(re,str,isRegExp,useJS,flags) {
  singleReplacePartial(re,str,isRegExp,useJS,flags,true,true);
};
  
function singleReplacePartial(re,str,isRegExp,useJS,flags,bodyFlag,fnFlag) {
  // isRegExp: Is the string passed in a regexp or a literal string?
  // useJS: 
  // Seems that the find function doesn't take a regexp, but just a string...
  // https://developers.google.com/apps-script/reference/document/text#replaceText(String,String)
  // Therefore, you can switch on useJS, to use the JS engine. Because this operates on text, you would lose formatting.
  // Hence, the expressing is 'padded', see repad below, and only the matching text is retained. Then GAS replace is used.
  // useJS may have unexpected side effects and should only be used if you require features that are not in re2 but are in JS (suchas '$1')
  if (!isRegExp) {
    re = re.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
    //    re = re.replace(/[\|\\\{\}\(\)\[\]^$\+\*\?\.]/g, '\\$&');
  };
  //var reg = new RegExp(re);
  // string - for use in findtext and replacetext
  var regu = re;
  // regexp - for use in replace
  var regexp = null;
  // why this?
  // var repad = ".*?(?:"+re+").$";
  var repad = re;
  if (flags) { 
    regexp = new RegExp(repad, flags);
  } else {
    regexp = new RegExp(repad);
  };
  // DocumentApp.getUi().alert("Search: " + regu.toString() );
/*
  var bodyElement = DocumentApp.getActiveDocument().getBody();
*/  
  var p;
  try {
    p = getParagraphsInBodyAndFootnotesExtended(false, bodyFlag, fnFlag);
  } catch (e) {
    alert('Error in singleReplacePartial calling getParagraphsInBodyAndFootnotesExtended: ' + e);
  };
  if (p) {
    for (var i=0; i < p.length; i++) {
      var bodyElement = p[i];
      var rangeElement = bodyElement.findText(regu);
      var replacement;
      while (rangeElement !== null) {
        //DocumentApp.getUi().alert("Found" );
        var thisElement = rangeElement.getElement();
        //var thisElementText = thisElement.asText();
        // work-around to be able to use JS regexp engine
        // https://stackoverflow.com/questions/30968419/replacetext-regex-not-followed-by/33528920#33528920 
        if (useJS) {
          
           alert("useJS not working");
          /*
                  // Determine the input text:
          var mytext =  rangeElement.getElement().getText();
          var elem = rangeElement.getElement().copy().editAsText();
          var elemlength = elem.getText().length;
          if (rangeElement.isPartial()) {
            if (rangeElement.getEndOffsetInclusive()+1 < elemlength-1) {
              elem.deleteText(rangeElement.getEndOffsetInclusive()+1,elemlength-1);
            }
            if (rangeElement.getStartOffset()-1>0) {
              elem.deleteText(0,rangeElement.getStartOffset()-1);
            };
            elemlength = elem.getText().length;
          };
          var url = null;
          // var text = elem.getText();                                        
          alert(regexp+ "\n" + str + "\n" + thisElement.getText() + "\n" + elem.getText());
          replacement = thisElement.getText().replace(regexp,str);
          
          var eat = rangeElement.getElement().editAsText();
          eat.deleteText(rangeElement.getStartOffset(),rangeElement.getEndOffsetInclusive());
          eat.insertText(rangeElement.getStartOffset(),replacement);      
          */
          
          alert(regexp+ "\n" + str + "\n" + thisElement.getText());
          replacement = thisElement.getText().replace(regexp,str);
        } else {
          replacement = str;
        }
        thisElement = thisElement.replaceText(regu, replacement);
        //.setBackgroundColor(searchResult.getStartOffset(), searchResult.getEndOffsetInclusive(),backgroundColor);
        // search for next match
        rangeElement = bodyElement.findText(regu, rangeElement);
      };
    };
  } else {
    alert("singleReplacePartial: No paragraphs found.");
  };
};