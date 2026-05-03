import { CollectionState, updateCollection } from '@store/collectionsSlice';
import React, { useEffect, useState } from 'react';
import { JSX } from 'react/jsx-runtime';
import { useDispatch } from 'react-redux';
import { useLocation, useParams, useSearchParams } from 'react-router';

import { registerWidget } from './registry';

import IntrinsicAttributes = JSX.IntrinsicAttributes;

export type WidgetCtx = {
    page: {
        pathname: string;
        search: string;
        searchParams: URLSearchParams;
        params: Readonly<Partial<Record<string, string | undefined>>>;
    };
};

type Ctx = {
    ctx: WidgetCtx;
};

type WidgetParams<ComponentProps, DataProps, collectionsProps = CollectionState> = {
    view: React.ComponentType<ComponentProps>;
    controller: (componentProps: DataProps & Ctx) => Promise<{
        data?: ComponentProps;
        collections?: collectionsProps;
    } | null>;
    skeleton?: React.ComponentType<unknown>;
    name?: string;
};

export const createWidget = <ComponentProps, DataProps = Record<string, unknown>, collectionsProps = CollectionState>({
    view: View,
    skeleton: Skeleton,
    controller,
    name,
}: WidgetParams<ComponentProps, DataProps, collectionsProps>) => {
    const Component = (props: DataProps) => {
        const [showSkeleton, setShowSkeleton] = useState(true);
        const [showNothing, setShowNothing] = useState(false);
        const dispatch = useDispatch();
        const [componentControllerProps, setComponentControllerProps] = useState({});
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

        useEffect(() => {
            controller({ ...props, ctx } as DataProps & Ctx)
                .then((result) => {
                    if (!result) {
                        setShowNothing(true);
                        return;
                    }
                    const { data, collections } = result;

                    if (data) {
                        setComponentControllerProps(data);
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

        return <View {...(componentControllerProps as React.ComponentProps<typeof View> & IntrinsicAttributes)} />;
    };

    Component.displayName = `widget-${View.displayName}`;

    if (name) {
        registerWidget(name, {
            component: Component as React.ComponentType<Record<string, unknown>>,
            displayName: Component.displayName ?? name,
        });
    }

    return Component;
};
