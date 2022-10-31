var paraMarker = "《!!!》";
var inlineMarker = "《+》";

// Menu item 'spp split off selected text, then paras [select text]'
function splitOffSelectedText_thenSplitParas() {
  splitOffSelectedText();
  splitParasInDocumentB();
};

// Menu item 'spt split off selected text [select text]'
// splitOffSelectedText_thenSplitParas uses the function
function splitOffSelectedText() {
  var selection = DocumentApp.getActiveDocument().getSelection();
  if (selection) {
    var elements = selection.getRangeElements();
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];      
      // Only modify elements that can be edited as text; skip images and other non-text elements.
      if (element.getElement().editAsText) {
        var text = element.getElement().editAsText();        
        var lastPos = element.getElement().getText().length-1;
        // Bold the selected part of the element, or the full element if it's completely selected.
        if (element.isPartial()) {
          //alert(element.getStartOffset() + "-" + element.getEndOffsetInclusive() + "; lastChar="+lastPos);          
          // text.setBold(element.getStartOffset(), element.getEndOffsetInclusive(), true);
          splitElementIntoParas(element.getElement().getParent(),element.getStartOffset(),element.getEndOffsetInclusive());
        } else {
          // nothing to do here - text is already in a paragraph
          // text.setBold(true);
        }
      }
    }
  }
};

// splitOffSelectedText uses the function
function splitElementIntoParas(element,startOffset,endOffsetInclusive) {
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  var lastPos = element.getText().length-1;
  var parent = element.getParent(); 
  //alert(element.getType());
  //alert(parent.getType());
  var elePosition = parent.getChildIndex(element);
  var prePara;
  var postPara;
  var pushBy = 0;
  if (startOffset > 0) {
    prePara = parent.insertParagraph(elePosition, inlineMarker);
    prePara = parent.insertParagraph(elePosition, element.copy());
    prePara.editAsText().deleteText(startOffset,lastPos);
    element.editAsText().deleteText(0,startOffset-1);
    pushBy+=2;
  };
  if (endOffsetInclusive < lastPos) {
    postPara = parent.insertParagraph(elePosition+1+pushBy, element.copy());
    postPara.editAsText().deleteText(0,endOffsetInclusive-startOffset);
    element.editAsText().deleteText(endOffsetInclusive-startOffset+1,lastPos-startOffset);
    postPara = parent.insertParagraph(elePosition+1+pushBy, inlineMarker);
  };
};

// Menu item 'sps split paragraphs to sentences [select paragraphs or place cursor in para] pts'
// splitOffSelectedText_thenSplitParas uses the function
function splitParasInDocumentB() {  
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  // var paras = body.getParagraphs();
  var paras = getParagraphsInBodyAndFootnotesExtended(true,true,false);
  for(var i in paras) {
    // Get the para and get para text:
    var para = paras[i];
    var text = para.editAsText();
    var ptext = para.getText();
    // Do the split to get sentences
    var searchStr = ". ";
    // Note: This searchStr may also match right at the end of the para, in whcih case the code below generates an empty para.
    var searchStrLength =  searchStr.length; 
    var sentenceArray = ptext.split(searchStr);

    /*
    Note: this regexp would be better: /\. [A-Z][a-z ]/
    However, then we cannot use split...
    We could do split by /\. / and then cycle through the items to make a new sentence array?
    */
    var newArray = [];
    var newindex = 0;
    sentenceArray.forEach(function (sentence, index) {
      
      if (index == 0) {
        newArray.push(sentence+searchStr);
        newindex = 0;
      } else {
        // if (sentence.match(/[A-Z][a-z ]/)) { // It doesn't work for non Latin alphabet
        if (/[^\s]/.test(sentence)) {
          newindex++;
          newArray.push(sentence+searchStr);          
        } else {
          newArray[newindex] += sentence+searchStr;          
        };
      };
    });
    alert(newArray);
    sentenceArray = newArray;
    if (sentenceArray.length > 1) {
      sentenceArray.forEach(function (sentence, index) {
        if (index < sentenceArray.length-1) {        
          // make a copy of the paragraph and insert before:
          var parent = para.getParent(); 
          var parPosition = parent.getChildIndex(para);
          var newPara = parent.insertParagraph(parPosition, para.copy());
          // Now work out splits:
          var startPos = 0;
          var midPos = sentence.length; //  + searchStrLength;
          var endPos = para.getText().length;
          // Now delete to remove duplicates:
          if (midPos <= endPos-1) {
            newPara.editAsText().deleteText(midPos, endPos-1);
          } else {
            // alert(midPos +"<="+ endPos-1);
          };
          //alert(startPos +"<="+ midPos+ "/"+endPos);
          para.editAsText().deleteText(startPos, midPos-1);
        };
      });
    };    
    // Insert marker - marker could be a blank para.
    var parent = para.getParent(); 
    var parPosition = parent.getChildIndex(para);
    var newPara = parent.insertParagraph(parPosition+1, paraMarker);    
    // Para itself is empty is the last characters of para range were ". " [see comment above]
    if (para.getText() == "") {
      para.removeFromParent();
    } else {
    };
  };
};

// Menu item 'mps merge sentences to paragraphs [select paragraphs] stp'
function mergeParasInDocumentB() {
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  // var paras= body.getParagraphs();
  var paras = getParagraphsInBodyAndFootnotesExtended(true,true,false);
  var pbreak=0;
  if (paras.length == 1) {
    alert('Please select more than one paragraph.');
  } else {
    for(var i in paras) {
      // Get the para and get para text:
      if (i>0) {
        var para = paras[i];
        var text = para.editAsText();
        var ptext = para.getText();
        if (ptext == paraMarker) {
          if (para.isAtDocumentEnd()) {
          } else {
            para.removeFromParent();
          }
          pbreak=1;
        } else {
          if (pbreak == 0) {
            para.merge();
          };
          pbreak=0;
        };
      };
    };
  };
};
