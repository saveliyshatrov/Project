import { UserList as view, type Props } from '@components/UserList';
import { createWidgetShell } from '@widget';
import { controller, ControllerData, CollectionData } from '@widget/UserList/controller';
import { Skeleton as skeleton } from '@widget/UserList/skeleton';

export default createWidgetShell<Props, ControllerData, CollectionData>({
    name: 'UserListWidget',
    view,
    controller,
    skeleton,
});
