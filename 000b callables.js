// out-of-use
// 02a paragraphs.gs
function callAddMarkupBasedOnStucture() {
  var body = DocumentApp.getActiveDocument().getBody();
  addMarkupBasedOnStucture(body);
}

// submenu_09_translate_full uses (commented out)
function whoami() {
  var email = Session.getActiveUser().getEmail();
  alert(email);
};