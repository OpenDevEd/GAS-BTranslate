// ---- Get selected paragraphs --------

// translateSelectionAndAppendL uses the function
// If a selection is made, this function gets the paragraphs that include the selection (i.e. more than the section)
// If no selection is made AND onePara=true, the paragraph in which the cursor is, is returned.
// If no selection is made AND onePara=false, all paragraphs are returned.
function getParagraphs(onePara) {
  return getParagraphsInBodyAndFootnotes(onePara, false);
};

// getParagraphs uses the function 
function getParagraphsInBodyAndFootnotes(onePara, getFootnoteParas) {
  return getParagraphsInBodyAndFootnotesExtended(onePara, true, getFootnoteParas);
};

function paragraphsFromTableCell(element) {
  const paragraphs = [];
  var cellParagraphs = element.getNumChildren();
  for (var m = 0; m < cellParagraphs; m++) {
    var child = element.getChild(m);
    if (child.getType() === DocumentApp.ElementType.PARAGRAPH) {
      paragraphs.push(child);
    }
  }
  return paragraphs;
}

function paragraphsFromTableRow(element) {
  const paragraphs = [];
  var cells = element.getNumCells();
  for (var k = 0; k < cells; k++) {
    var cell = element.getCell(k);
    paragraphs.push(...paragraphsFromTableCell(cell));
  }
  return paragraphs;
}

function paragraphsFromTable(element) {
  const paragraphs = [];
  var rows = element.getNumRows();
  for (var k = 0; k < rows; k++) {
    var row = element.getRow(k);
    paragraphs.push(...paragraphsFromTableRow(row));
  }
  return paragraphs;
}

/*
// Example: 
getParagraphsInBodyAndFootnotesExtended(onePara,getBodyParas,getFootnoteParas)

// We want to be sure that only selected (or in-cursor) paragraphs are returned, and we only want body paras
getParagraphsInBodyAndFootnotesExtended(true,true,false);
*/
// mergeParasInDocumentB, getParagraphsInBodyAndFootnotes use the function
function getParagraphsInBodyAndFootnotesExtended(onePara, getBodyParas, getFootnoteParas) {
  var paraout = [];
  var selection = DocumentApp.getActiveDocument().getSelection();
  if (selection) {
    // If there's a selection, getBodyParas is ignored.
    var elements = selection.getRangeElements();
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      // Only modify elements that can be edited as text; skip images and other non-text elements.
      if (element.getElement().editAsText) {
        var elem = element.getElement();
        // var text = elem.editAsText();
        if (elem.getType() == DocumentApp.ElementType.TEXT) {
          elem = elem.getParent();
        }
        if (elem.getType() == DocumentApp.ElementType.PARAGRAPH) {
          var paragraph = elem.asParagraph();
          paraout.push(paragraph);
        } else if (elem.getType() == DocumentApp.ElementType.LIST_ITEM) {
          var paragraph = elem.asListItem();
          paraout.push(paragraph);
        } else if (elem.getType() == DocumentApp.ElementType.TABLE_CELL) {
          var paragraphs = paragraphsFromTableCell(elem);
          paraout.push(...paragraphs);
        }else if (elem.getType() == DocumentApp.ElementType.TABLE_ROW){
          var paragraphs = paragraphsFromTableRow(elem);
          paraout.push(...paragraphs);
        }else if (elem.getType() == DocumentApp.ElementType.TABLE){
          var paragraphs = paragraphsFromTable(elem);
          paraout.push(...paragraphs);
        } else {
          DocumentApp.getUi().alert("Cursor is in object that is not paragraph, table, table row, table cell or list item:" + element.getElement().getType());
        }
      }
    }
  } else {
    if (onePara) {
      // if onePara is true, ignore getBodyParas
      var cursor = DocumentApp.getActiveDocument().getCursor();
      var element = cursor.getElement();
      var paragraph;
      if (element.getParent().getType() == DocumentApp.ElementType.PARAGRAPH) {
        paragraph = element.getParent().asParagraph();
        paraout.push(paragraph);
      } else if (element.getType() == DocumentApp.ElementType.PARAGRAPH) {
        paragraph = element.asParagraph();
        paraout.push(paragraph);
      } else if (element.getParent().getType() == DocumentApp.ElementType.LIST_ITEM) {
        paragraph = element.getParent().asListItem();
        paraout.push(paragraph);
      } else if (element.getType() == DocumentApp.ElementType.LIST_ITEM) {
        paragraph = element.asListItem();
        paraout.push(paragraph);
      } else {
        DocumentApp.getUi().alert("Cursor is in object that is not paragraph or list item: " + element.getParent().getType() + ", parent of " + element.getType());
      }
    } else {
      var doc = DocumentApp.getActiveDocument();
      var paraout = [];
      if (getBodyParas) {
        try {
          var body = doc.getBody();
          paraout = doc.getParagraphs();
        } catch (e) {
          alert("Error in getParagraphsInBodyAndFootnotesExtended: " + e);
        };
      };
      if (getFootnoteParas) {
        var footnote = doc.getFootnotes();
        if (footnote) {
          // alert("Getting fn: "+footnote.length);
          for (var i in footnote) {
            if (footnote[i].getFootnoteContents()) {
              var paragraphs = footnote[i].getFootnoteContents().getParagraphs();
              if (paragraphs) {
                //alert("Getting paras: "+paragraphs.length);
                for (var i = 0; i < paragraphs.length; i++) {
                  var element = paragraphs[i];
                  paraout.push(element);
                };
              };
            } else {
              var j = i + 1;
              alert("Footnote has no contents. Footnote number= " + j + ". This appears to be a GDocs bug that happens if the footnote is suggested text only.");
            };
          }
        } else {
          alert("There are no footnotes.");
        };
      }
    };
  };
  // DocumentApp.getUi().alert(paraout.length);
  // alert(paraout.length);
  return paraout;
}

// enterDeepLAPIkey, use the function
function getValueFromUser(title, text, defaultOK, defaultCancel, defaultClose) {
  text = text || "Please enter a value.";
  defaultOK = defaultOK || "";
  defaultCancel = defaultCancel || null;
  defaultClose = defaultClose || null;
  if (!text) {
    //text = text || title;
    title = text;
    title = "BUtils";
  };
  var result = DocumentApp.getUi().prompt(title, text, DocumentApp.getUi().ButtonSet.OK_CANCEL);
  // Process the user's response:
  if (result.getSelectedButton() == DocumentApp.getUi().Button.OK) {
    var res = result.getResponseText();
    // DocumentApp.getUi().alert('Result: '+res);
    if (res == "" && defaultOK) {
      return defaultOK;
    } else {
      return res;
    };
  } else if (result.getSelectedButton() == DocumentApp.getUi().Button.CANCEL) {
    //DocumentApp.getUi().alert('The user didn\'t want to provide a value.');
    return defaultCancel;
  } else if (result.getSelectedButton() == DocumentApp.getUi().Button.CLOSE) {
    //DocumentApp.getUi().alert('The user clicked the close button in the dialog\'s title bar.');
    return defaultClose;
  }
  DocumentApp.getUi().alert('Unknown action.');
  return null;
}

function setBothTextColors(target, backgroundColor, foregroundColor) {
  // If no search parameter was provided, ask for one
  if (arguments.length == 0) {
    var ui = DocumentApp.getUi();
    var result = ui.prompt('Text Highlighter',
      'Enter text to highlight:', ui.ButtonSet.OK_CANCEL);
    // Exit if user hit Cancel.
    if (result.getSelectedButton() !== ui.Button.OK) return;
    // else
    target = result.getResponseText();
  }
  var backgroundColor = backgroundColor || '#F3E2A9';  // default color is light orangish.
  var doc = DocumentApp.getActiveDocument();
  var bodyElement = DocumentApp.getActiveDocument().getBody();
  var searchResult = bodyElement.findText(target);

  while (searchResult !== null) {
    var thisElement = searchResult.getElement();
    var thisElementText = thisElement.asText();

    //Logger.log(url);
    if (backgroundColor) {
      thisElementText.setBackgroundColor(searchResult.getStartOffset(), searchResult.getEndOffsetInclusive(), backgroundColor);
    };
    if (foregroundColor) {
      thisElementText.setForegroundColor(searchResult.getStartOffset(), searchResult.getEndOffsetInclusive(), foregroundColor);
    };
    // search for next match
    searchResult = bodyElement.findText(target, searchResult);
  }
}

function getConfirmationFromUser(text) {
  // Display a dialog box with a message and "Yes" and "No" buttons.
  var ui = DocumentApp.getUi();
  var response = ui.alert(text, ui.ButtonSet.OK_CANCEL);
  // Process the user's response.
  if (response == ui.Button.OK) {
    return true;
  } else {
    return false;
  }
}

// Many functions use the function 
function alert(text) {
  DocumentApp.getUi().alert(text);
};