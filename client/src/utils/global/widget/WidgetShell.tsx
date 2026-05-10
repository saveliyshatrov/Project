import { RootState } from '@store';
import { CollectionState, updateCollection } from '@store/collections';
import { updateWidgetData } from '@store/widget';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams, useSearchParams } from 'react-router';

import { useWidgetId } from './context';

type ParamsType = Record<string, string | undefined>;

type Ctx<ControllerData, Params extends ParamsType = ParamsType> = { ctx: WidgetCtx<Params> } & ControllerData;

export type WidgetCtx<Params extends ParamsType = ParamsType> = {
    page: {
        pathname: string;
        search: string;
        searchParams: URLSearchParams;
        params: Readonly<Params>;
    };
};

export type ControllerFunction<ControllerData, ViewProps, Collections, Params extends ParamsType = ParamsType> = (
    ctx: Ctx<ControllerData, Params>
) => Promise<{
    data?: Partial<ViewProps>;
    collections?: Collections;
} | null>;

type WidgetShellConfig<
    ViewProps,
    ControllerData,
    Collections extends CollectionState,
    Params extends ParamsType = ParamsType,
> = {
    name: string;
    view: React.ComponentType<ViewProps>;
    controller: (ctx: { ctx: WidgetCtx<Params> } & ControllerData) => Promise<{
        data?: Partial<ViewProps>;
        collections?: Collections;
    } | null>;
    skeleton?: React.ComponentType;
};

export function createWidgetShell<
    ViewProps,
    ControllerData = Record<string, unknown>,
    Collections extends CollectionState = CollectionState,
    Params extends ParamsType = ParamsType,
>(config: WidgetShellConfig<ViewProps, ControllerData, Collections, Params>): React.ComponentType<ControllerData> {
    const { name, view: View, controller, skeleton: Skeleton } = config;

    const WidgetShell = (props: ControllerData) => {
        const [showSkeleton, setShowSkeleton] = React.useState(true);
        const [showNothing, setShowNothing] = React.useState(false);
        const dispatch = useDispatch();
        const [controllerData, setControllerData] = React.useState<Partial<ViewProps>>({});
        const params = useParams();
        const location = useLocation();
        const [searchParams] = useSearchParams();
        const widgetId = useWidgetId();
        const rerenderVersion = useSelector((state: RootState) => state.widgets.rerenderVersions[name] ?? 0);

        const ctx: WidgetCtx<Params> = {
            page: {
                pathname: location.pathname,
                search: location.search,
                searchParams,
                params: params as Readonly<Params>,
            },
        };

        const controllerDataInfo = { ...props, ctx };

        const controllerRef = React.useRef(controller);
        controllerRef.current = controller;

        /* eslint-disable react-hooks/exhaustive-deps */
        React.useEffect(() => {
            setShowSkeleton(true);
            setShowNothing(false);
            controllerRef
                .current(controllerDataInfo)
                .then((result) => {
                    if (!result) {
                        setShowNothing(true);
                        return;
                    }
                    const { data, collections } = result;

                    if (data) {
                        setControllerData(data);
                        if (widgetId) {
                            dispatch(updateWidgetData({ id: widgetId, data: data as Record<string, unknown> }));
                        }
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
        }, [location.pathname, rerenderVersion]);
        /* eslint-enable react-hooks/exhaustive-deps */

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
