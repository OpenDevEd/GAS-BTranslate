// Help.gs
/**
 * Shows a custom HTML user interface in a sidebar in the Google Docs editor.
 */
// out-of-use
function showHelpSidebar() {
  DocumentApp.getUi().showSidebar(
      HtmlService
.createHtmlOutput(
'<h1>Help</h1><p>Most menu entries have a short character sequence at the start of the entry. This is meant for use with alt-/. Entries followed by a star are closely aligned with existing Google Docs menu functions, and the main purpose is to offer a short word for use with alt-/. Generally speaking, e.g., colours and text size changes are available through alt-/ anyway, but you may find the shortcuts offered by the script easier to use. Note that options prefixed by * are not implemented yet.</p>'
+'<h2>Heading and paragraph numbering</h2><p>Note that the numbering approach used here works better than what is available in other apps scripts: It preserves colours and comments.</p>'
+'<h2>Paragraph formatting</h2><p>Functions that affect paragraph formating, including indentation and spacing. Also includes a function to remove / add empty paragraphs.</p>'
+'<h2>Selection and paragraph: Text size and text colour</h2><p></p>'
+'<h3>Selection vs. paragraph</h3><p>Note that the text colour and text size commands have paragraph and selection versions. If there is no selection, they both work the same: They highlight the paragraph. If there is a selection, then the section-command works on the selection (same as the existing e.g. highlight dropdown would), while the pargraph command works on all paragraphs touched by the selection. Note that if a selection exists, the selection-command is exactly the same as the usual dropdown, except that in some cases it performs several actions at once.</p>' 
+'<h2>Table</h2><p>Functions for table formatting.</p>'
+'<h2>Regexp</h2><p>Regexp-based formatting.</p>'
+'<h2>Page</h2><p>Page margins.</p>'
+'<h2>Word count</h2><p>Word counts</p>'
          )
          .setTitle('Help for BUtils')
          .setWidth(350 /* pixels */));
}

// out-of-use
function showCheckSidebar() {
  DocumentApp.getUi().showSidebar(
      HtmlService
          .createHtmlOutput(
            '<p><form><textarea>Enter text here...</textarea></form></p>'
                           )
          .setTitle('An input box')
          .setWidth(350 /* pixels */));
}

// out-of-use
function sorryNotImplementedYet() {
    DocumentApp.getUi().alert("Sorry, this feature hasn't been implemented yet.");
}
