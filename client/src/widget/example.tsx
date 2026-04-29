import React from "react";
import {createWidget} from "./index";
import { resolverExample } from 'shared/resolver';
import { AUTHOR } from 'shared/constants';

type ViewProps = {
    name: string,
    example: number
}

const View: React.FC<ViewProps> = ({ name, example }) => {
    return <div>name:{name} | example:{example}</div>
}

export const ViewExample = createWidget({
    view: View,
    controller: async ({ example }: { example: number }) => {
        const name = await new Promise(res => setTimeout(() => res('Test name'), 5000)) as string;
        const userCollection = await resolverExample({ collectionName: 'users' });
        console.log({
            userCollection
        })
        return {
            data: {
                example,
                name,
            },
            collections: {
                userCollection,
                someCollection: {
                    name: 'NAME',
                    age: 999
                }
            }
        }
    },
    skeleton: () => (<div>--[{ AUTHOR }]--</div>),
})