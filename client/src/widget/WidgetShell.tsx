import { CollectionState, updateCollection } from '@store/collectionsSlice';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useParams, useSearchParams } from 'react-router';

export type WidgetCtx = {
    page: {
        pathname: string;
        search: string;
        searchParams: URLSearchParams;
        params: Readonly<Partial<Record<string, string | undefined>>>;
    };
};

export type ControllerFunction<ControllerData, ViewProps, Collections> = (
    ctx: { ctx: WidgetCtx } & ControllerData
) => Promise<{
    data?: Partial<ViewProps>;
    collections?: Collections;
} | null>;

type WidgetShellConfig<ViewProps, ControllerData, Collections extends CollectionState = CollectionState> = {
    view: React.ComponentType<ViewProps>;
    controller: (ctx: { ctx: WidgetCtx } & ControllerData) => Promise<{
        data?: Partial<ViewProps>;
        collections?: Collections;
    } | null>;
    skeleton?: React.ComponentType;
};

export function createWidgetShell<
    ViewProps,
    ControllerData = Record<string, unknown>,
    Collections extends CollectionState = CollectionState,
>(config: WidgetShellConfig<ViewProps, ControllerData, Collections>): React.ComponentType<ControllerData> {
    const { view: View, controller, skeleton: Skeleton } = config;

    const WidgetShell = (props: ControllerData) => {
        const [showSkeleton, setShowSkeleton] = React.useState(true);
        const [showNothing, setShowNothing] = React.useState(false);
        const dispatch = useDispatch();
        const [controllerData, setControllerData] = React.useState<Partial<ViewProps>>({});
        const params = useParams();
        const location = useLocation();
        const [searchParams] = useSearchParams();

        const ctx: WidgetCtx = {
            page: {
                pathname: location.pathname,
                search: location.search,
                searchParams,
                params,
            },
        };

        const controllerDataInfo: { ctx: WidgetCtx } & ControllerData = {
            ...props,
            ctx,
        };

        React.useEffect(() => {
            controller(controllerDataInfo)
                .then((result) => {
                    if (!result) {
                        setShowNothing(true);
                        return;
                    }
                    const { data, collections } = result;

                    if (data) {
                        setControllerData(data);
                    }

                    if (collections) {
                        dispatch(updateCollection(collections));
                    }
                    setShowSkeleton(false);
                })
                .catch(() => {
                    setShowSkeleton(false);
                    setShowNothing(true);
                });
        }, [location.pathname]);

        if (showNothing) {
            return null;
        }

        if (Skeleton && showSkeleton) {
            return <Skeleton />;
        }

        return <View {...(controllerData as ViewProps & JSX.IntrinsicAttributes)} />;
    };

    WidgetShell.displayName = `widget-${View.displayName || View.name}`;

    return WidgetShell;
}
