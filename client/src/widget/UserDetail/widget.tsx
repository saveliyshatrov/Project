import { UserDetail as view, type Props } from '@components/UserDetail';
import { createWidgetShell } from '@utils/global/widget';
import { controller, CollectionData, ControllerData, UserDetailParams } from '@widget/UserDetail/controller';
import { Skeleton as skeleton } from '@widget/UserDetail/skeleton';

export default createWidgetShell<Props, ControllerData, CollectionData, UserDetailParams>({
    name: 'UserDetailWidget',
    view,
    controller,
    skeleton,
});
