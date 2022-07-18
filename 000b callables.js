// 02a paragraphs.gs
function callAddMarkupBasedOnStucture() {
  var body = DocumentApp.getActiveDocument().getBody();
  addMarkupBasedOnStucture(body);
}

function whoami() {
 
  var email = Session.getActiveUser().getEmail();
  alert(email);
  
};