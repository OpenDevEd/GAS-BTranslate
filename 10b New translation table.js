function translationTableStart(body, paraout, preserveFormatting) {
  const childIndexLastPar = body.getChildIndex(paraout[paraout.length - 1].el);

  const table = body.insertTable(childIndexLastPar + 1, [['《translationOf:']]);

  const styleTranslationOf = {};
  styleTranslationOf[DocumentApp.Attribute.BOLD] = false;
  styleTranslationOf[DocumentApp.Attribute.ITALIC] = false;

  const cell0x0 = table.getCell(0, 0);
  cell0x0.setBackgroundColor('#EFEFEF');
  const trOfPar = cell0x0.getChild(0);
  trOfPar.editAsText().setAttributes(styleTranslationOf);

  for (let i = 0; i < paraout.length; i++) {
    const element = paraout[i];
    const row = table.appendTableRow();
    const cell = row.appendTableCell();
    // Logger.log(element.type + ' ' + element.text);
    const parOrListItemCopy = element.el.copy();
    if (element.type === DocumentApp.ElementType.PARAGRAPH) {
      cell.appendParagraph(parOrListItemCopy);
    } else if (element.type === DocumentApp.ElementType.LIST_ITEM) {
      cell.appendListItem(parOrListItemCopy);
    }
    cell.getChild(0).removeFromParent();
    element.html = preserveFormatting === true ? convertToHtml(element.el, element.text) : element.text;
    body.removeChild(element.el);
  }
  return table;
}
