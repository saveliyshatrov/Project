import type { RootState } from '@store';
import { WidgetData } from '@store/widget';
import { useWidgetId } from '@utils/global/widget/context';
import { useSelector } from 'react-redux';

export const useWidgetSelector = (selector: (arg: WidgetData) => unknown) => {
    const widgetId = useWidgetId();
    return useSelector((state: RootState) => {
        if (widgetId) {
            const data = state.widget[widgetId] ?? {};
            return selector(data);
        }
        return {};
    });
};
