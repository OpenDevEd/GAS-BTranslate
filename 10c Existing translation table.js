function translationTableContinuation(selectedTable, preserveFormatting, paraout) {
  const newLine = `
`;
  const translationTable = contentFromTable(selectedTable);

  if (translationTable[0].length > 1) {
    alert('To begin the translation, ensure the table contains a single column. The selected table has ' + translationTable[0].length + ' columns.');
    return 0;
  }

  let startRow = 0;
  if (selectedTable.getCell(0, 0).getText() === '《translationOf:') {
    startRow = 1;
  } else {
    const headerRow = selectedTable.insertTableRow(0);
    headerRow.appendTableCell('《translationOf:').setBackgroundColor('#f4f4f4');
  }
  for (let i = startRow; i < translationTable.length; i++) {
    const htmlArray = [], textArray = [];
    for (let j = 0; j < translationTable[i][0].length; j++) {
      const paragraph = translationTable[i][0][j];
      const paragraphText = translationTable[i][0][j].getText();
      const html = preserveFormatting === true ? convertToHtml(paragraph, paragraphText) : paragraphText;
      htmlArray.push(html);
      textArray.push(paragraphText);
    }
    const cellHtml = htmlArray.join(newLine);
    const cellText = textArray.join(newLine);

    paraout.push({ text: cellText, html: cellHtml });

  }
  return { status: 'ok' };
}

function contentFromTableCell(element) {
  const paragraphs = [];
  const cellParagraphs = element.getNumChildren();
  for (let m = 0; m < cellParagraphs; m++) {
    const child = element.getChild(m);
    if (child.getType() === DocumentApp.ElementType.PARAGRAPH || child.getType() === DocumentApp.ElementType.LIST_ITEM) {
      paragraphs.push(child);
    }
  }
  return paragraphs;
}

function contentFromTableRow(element) {
  const rowContent = [];
  const cells = element.getNumCells();
  for (let k = 0; k < cells; k++) {
    const cell = element.getCell(k);
    // paragraphs.push(...paragraphsFromTableCell(cell));
    rowContent.push(contentFromTableCell(cell));
  }
  return rowContent;
}

function contentFromTable(element) {
  const tableContent = [];
  const rows = element.getNumRows();
  for (let k = 0; k < rows; k++) {
    const row = element.getRow(k);
    tableContent.push(contentFromTableRow(row));
  }
  return tableContent;
}