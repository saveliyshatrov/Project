import React, {useEffect, useMemo, useState} from "react";
import {CollectionState, updateCollection} from "@store/collectionsSlice";
import {useDispatch} from "react-redux";
import {JSX} from "react/jsx-runtime";
import IntrinsicAttributes = JSX.IntrinsicAttributes;

type Controller<ComponentProps, DataProps, collectionsProps = CollectionState> =
    (componentProps: DataProps) => Promise<{
        data: ComponentProps & DataProps,
        collections: collectionsProps
    } | null>

type WidgetParams
    <ComponentProps, DataProps, collectionsProps = CollectionState> = {
    view: React.ComponentType<ComponentProps>;
    controller: (componentProps: DataProps) => Promise<{
        data?: ComponentProps,
        collections?: collectionsProps
    } | null>,
    skeleton?: React.ComponentType<{}>
};

type IncomingProps<ComponentProps, DataProps, collectionsProps = CollectionState> =
    Parameters<Controller<ComponentProps, DataProps, collectionsProps>>[0]

export const createWidget = <ComponentProps, DataProps, collectionsProps = CollectionState>
({ view: View, skeleton: Skeleton, controller }: WidgetParams<ComponentProps, DataProps, collectionsProps>) => {
    return ((props: IncomingProps<ComponentProps, DataProps, collectionsProps>) => {
        const [showSkeleton, setShowSkeleton] = useState(true);
        const [showNothing, setShowNothing] = useState(false);
        const dispatch = useDispatch();
        const [componentControllerProps, setComponentControllerProps] = useState({})
        useEffect(() => {
            controller(props)
                .then((result) => {
                    console.log({
                        result
                    })
                    if (!result) {
                        setShowNothing(true);
                        return;
                    }
                    const { data, collections } = result;
                    data && setComponentControllerProps(data);
                    collections && dispatch(updateCollection(collections));
                    setShowSkeleton(false);
                })
                .catch((error) => {
                    console.log({
                        error
                    })
                    setShowSkeleton(false);
                    setShowNothing(true);
                })
        }, []);

        if (showNothing) {
            return null;
        }

        if (Skeleton && showSkeleton) {
            return <Skeleton />
        }

        return (
            <View
                { ...(componentControllerProps as React.ComponentProps<typeof View> & IntrinsicAttributes) }
            />
        )
    })
}