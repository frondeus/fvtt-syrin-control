export async function onSettings(window: JQuery<Element>) {
  const syrinTab = window.find('.tab.category[data-category="fvtt-syrin-control"]');
  const authTokenField = syrinTab.find('[name="fvtt-syrin-control.authToken"]');

  authTokenField.attr('type', 'password');
}