function insertTranslationTable(deepLArray, googleArray, openAIArray, anthropicArray, deepLApiKey, chatGPTApiKey, anthropicApiKey, ltrLang, ltrLangReverse, preserveFormatting, appendReverseTranslation) {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  const selection = doc.getSelection();
  const cursor = doc.getCursor();
  let paraout = [];
  const elementCustomTypesArray = [];
  let elementCustomType, text, parent, grandparent, elements, selectedTable;

  if (selection) {
    elements = selection.getRangeElements().map(element => element.getElement());
  } else if (cursor) {
    const element = cursor.getElement();
    elements = [element];
  } else {
    wrongSelectionAlert('You selected neither paragraphs nor tables.');
    return 0;
  }

  elements.forEach(element => {
    el = element;
    const elType = el.getType();
    if (el.getType() === DocumentApp.ElementType.TEXT) {
      text = el.getText();
      // Logger.log('1. %s %s %s', el.getParent().getType(), el.getParent().getParent().getType(), text);
      parent = el.getParent();
      grandparent = parent.getParent();
      elementCustomType = elementTypeChecker(text, grandparent);
      elementCustomTypesArray.push(elementCustomType);
      paraout.push({ el: parent, type: parent.getType(), text: text });
      if (elementCustomType === 3 || elementCustomType === 4) {
        if (selectedTable == null) {
          selectedTable = grandparent.getParent().getParent();
        }
      }
    } else if (el.getType() === DocumentApp.ElementType.LIST_ITEM || el.getType() === DocumentApp.ElementType.PARAGRAPH) {
      text = el.asText().getText();
      // Logger.log('2. %s %s %s', el.getParent().getType(), '_' + text + '_', el.getType());
      parent = el.getParent();
      elementCustomType = elementTypeChecker(text, parent);
      elementCustomTypesArray.push(elementCustomType);
      paraout.push({ el: el, type: elType, text: text });
      if (elementCustomType === 3 || elementCustomType === 4) {
        if (selectedTable == null) {
          selectedTable = parent.getParent().getParent();
        }
      }
    } else if (el.getType() === DocumentApp.ElementType.TABLE_CELL) {
      // Logger.log('5.TABLE_CELL');
      elementCustomTypesArray.push(5);
      if (selectedTable == null) {
        selectedTable = el.getParent().getParent();
      }
    } else if (el.getType() === DocumentApp.ElementType.TABLE_ROW) {
      // Logger.log('6.TABLE_ROW');
      elementCustomTypesArray.push(6);
      if (selectedTable == null) {
        selectedTable = el.getParent();
      }
    } else if (el.getType() === DocumentApp.ElementType.TABLE) {
      // Logger.log('7.TABLE');
      elementCustomTypesArray.push(7);
      if (selectedTable == null) {
        selectedTable = el;
      }
    }
  });

  let newTranslationTableFlag = false;
  const uniqueCustomTypesArray = [...new Set(elementCustomTypesArray)];

  if (uniqueCustomTypesArray.length === 1) {
    if (uniqueCustomTypesArray[0] === 2) {
      wrongSelectionAlert('You selected only empty paragraphs outside a table.');
      return 0;
    } else if (uniqueCustomTypesArray[0] === 1) {
      newTranslationTableFlag = true;
    }
  } else {
    const arrayWithoutEmptyParagraphs = uniqueCustomTypesArray.filter(element => element !== 2);
    if (arrayWithoutEmptyParagraphs.includes(1)) {
      if (arrayWithoutEmptyParagraphs.length > 1) {
        wrongSelectionAlert('You selected paragraphs outside and inside a table.');
        return 0;
      } else {
        newTranslationTableFlag = true;
      }
    }
  }

  // Remove elements of the array corresponding to empty paragraphs.
  for (let i = 0; i < paraout.length; i++) {
    if (paraout[i].text.length === 0) {
      paraout.splice(i, 1);
      i--;
    }
  }
  // End. Remove elements of the array corresponding to empty paragraphs.


  // Paragraphs into table or existing table
  let translationTable;
  if (newTranslationTableFlag === true) {
    translationTable = translationTableStart(body, paraout, preserveFormatting);
  } else {
    paraout = [];
    const { status } = translationTableContinuation(selectedTable, preserveFormatting, paraout);
    if (status != 'ok') return 0;
    translationTable = selectedTable;
  }
  // End. Paragraphs into table or existing table


  // Table header
  const tableHeaderArray = formTableHeader(deepLArray, googleArray, openAIArray, anthropicArray, appendReverseTranslation);
  const headerRow = translationTable.getRow(0);
  tableHeaderArray.forEach(el => {
    headerRow.appendTableCell(el).setBackgroundColor('#EFEFEF');
  });
  // End. Table header

  // Translation and row adding
  let rowNum = 1;
  paraout.forEach(element => {
    let reverseTranslationFlag = false;
    let translationsArray = [];
    let translationsToInsert = [];

    const row = translationTable.getRow(rowNum);
    if (element.text.trim().length > 0) {
      callAllTranslators(translationsArray, translationsToInsert, element.html, element.text, deepLArray, googleArray, openAIArray, anthropicArray, deepLApiKey, chatGPTApiKey, anthropicApiKey, ltrLang, ltrLangReverse, preserveFormatting, appendReverseTranslation, reverseTranslationFlag);

      const trObj = convertArrayToObject(translationsToInsert);

      const bgFlag = translationsToInsert.length < tableHeaderArray.length ? true : false;

      let textToInsert, allStylesArray;
      const addedTextsArray = [];

      tableHeaderArray.forEach(el => {
        let trObjEl = trObj[el] == null? '-' :trObj[el].out;
        let ltrLang = trObj[el] == null? true :trObj[el].ltrLang;
        if (preserveFormatting === true) {
          if (appendReverseTranslation) trObjEl = removeLastSymbolIfArrow(trObjEl);
          const { stylesArray, textString } = htmlToStyle(trObjEl);
          textToInsert = textString;
          allStylesArray = stylesArray;
        } else {
          textToInsert = trObjEl;
        }
        const cell = row.appendTableCell(textToInsert);

        if (bgFlag) {
          if (addedTextsArray.includes(trObjEl)) {
            cell.setBackgroundColor('#f4f4f4');
          } else {
            addedTextsArray.push(trObjEl);
          }
        }

        const newPara = cell.getChild(0);
        newPara.setLeftToRight(ltrLang);

        if (preserveFormatting) {
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
            newPara.editAsText().setAttributes(style.start, style.end - 1, docStyles);
          });
        }
      });
    } else {
      tableHeaderArray.forEach(el => {
        row.appendTableCell('');
      });
    }
    rowNum++;
  });
  // End. Translation and row adding

  // Applies dark green font colour to 《translationOf:
  const styleTranslationOf = {};
  styleTranslationOf[DocumentApp.Attribute.FOREGROUND_COLOR] = '#015610';
  const trOfPar = translationTable.getCell(0, 0).getChild(0);
  trOfPar.editAsText().setAttributes(styleTranslationOf);
  // End. Applies dark green font colour to 《translationOf:
}

// Removes the last symbol 》 in the reverse translation
function removeLastSymbolIfArrow(str) {
  if (typeof str !== 'string' || str.length === 0) {
    return str;
  }
  if (str.charAt(str.length - 1) === '》') {
    return str.slice(0, -1);
  }
  return str;
}

// Converts translationsToInsert array into object with translator names as keys
function convertArrayToObject(inputArray) {
  const result = {};

  inputArray.forEach(item => {
    const { translators, out, ltrLang } = item;

    translators.forEach(translator => {
      const { linkText } = translator;
      result[linkText] = { out: out, ltrLang: ltrLang };
    });
  });

  return result;
}

function formTableHeader(deepLArray, googleArray, openAIArray, anthropicArray, appendReverseTranslation) {
  const tableHeaderArray = [];
  deepLArray.forEach(element => {
    let formality;
    if (element.formality == 'default') {
      formality = '';
    } else {
      formality = element.formality == 'less' ? ' informal' : ' formal';
    }
    tableHeaderArray.push('《D:' + element.dest + formality + '》');
    if (appendReverseTranslation) {
      tableHeaderArray.push('《D:' + element.origin + ' reverse-translated:');
    }
  });
  googleArray.forEach(element => {
    tableHeaderArray.push('《G:' + element.dest + '》');
    if (appendReverseTranslation) {
      tableHeaderArray.push('《G:' + element.origin + ' reverse-translated:');
    }
  });
  openAIArray.forEach(element => {
    tableHeaderArray.push('《' + element.settings.name + ':' + element.dest + '》');
    if (appendReverseTranslation) {
      tableHeaderArray.push('《' + element.settings.name + ':' + element.origin + ' reverse-translated:');
    }
  });
  anthropicArray.forEach(element => {
    tableHeaderArray.push('《' + element.settings.name + ':' + element.dest + '》');
    if (appendReverseTranslation) {
      tableHeaderArray.push('《' + element.settings.name + ':' + element.origin + ' reverse-translated:');
    }
  });
  return tableHeaderArray;
}

function wrongSelectionAlert(starter) {
  alert(`${starter}
Please select non empty paragraph(s) outside a table 
or 
place cursor inside a table that already contains texts to translate. 
  `);
}

function elementTypeChecker(text, parentOrGrandparent) {
  text = text.trim();
  const parentOrGrandparentType = parentOrGrandparent.getType();
  if (text.length > 0 && parentOrGrandparentType !== DocumentApp.ElementType.TABLE_CELL) {
    // Non empty paragraph outside table
    return 1;
  } else if (text.length === 0 && parentOrGrandparentType !== DocumentApp.ElementType.TABLE_CELL) {
    // Empty paragraph outside table
    return 2;
  } else if (text.length > 0 && parentOrGrandparentType === DocumentApp.ElementType.TABLE_CELL) {
    // Non empty paragraph inside table
    return 3;
  } else if (text.length === 0 && parentOrGrandparentType === DocumentApp.ElementType.TABLE_CELL) {
    // Empty paragraph inside table
    return 4;
  }
}
