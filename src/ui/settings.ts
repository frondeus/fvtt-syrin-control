import { Context } from '@/services/context';

export async function onSettings(ctx: Context, window: JQuery<Element>) {
  const syrinTab = window.find('.tab.category[data-category="fvtt-syrin-control"]');
  const authTokenField = syrinTab.find('[name="fvtt-syrin-control.authToken"]');

  const parent = authTokenField.parent();
  authTokenField.attr('type', 'password');
}