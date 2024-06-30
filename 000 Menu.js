function onInstall(e) {
  onOpen(e);
}

function onOpen(e) {
  buildMenu(e);
};

function buildMenu(e) {
  submenu_09_translate_basic(e).addToUi();
}