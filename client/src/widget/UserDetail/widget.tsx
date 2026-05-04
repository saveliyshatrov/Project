import { UserDetail as view, type Props } from '@components/UserDetail';
import { createWidgetShell } from '@widget';
import { controller, CollectionData, ControllerData } from '@widget/UserDetail/controller';
import { Skeleton as skeleton } from '@widget/UserDetail/skeleton';

export default createWidgetShell<Props, ControllerData, CollectionData>({
    name: 'UserDetailWidget',
    view,
    controller,
    skeleton,
});
