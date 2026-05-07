import { createWidgetShell } from '@utils/global/widget';
import { controller } from '@widget/NotFound/controller';
import { View as view } from '@widget/NotFound/view';

export default createWidgetShell({
    name: 'NotFoundWidget',
    view,
    controller,
});
