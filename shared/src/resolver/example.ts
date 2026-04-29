import {createResolver} from "./createResolver";
import {normalize} from "./normalize";
import {User} from "../index";

type ExampleParams = {
    collectionName: string;
}


export const resolverExample = createResolver(async (ctx, params: ExampleParams) => {
    const users = await fetch('http://localhost:3001/users', {
        method: 'GET'
    }).then(response => response.json()) as User[];

    return normalize<User>((user) => {
        return user.id
    })(users, params.collectionName);
}, { name: 'resolverExample' });