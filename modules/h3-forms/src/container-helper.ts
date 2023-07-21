


import { ContainerLike } from './container-like';

export class ContainerHelper {

    static find(key: string, inSheet: boolean, root: ContainerLike, parent?: ContainerLike) {
        if (key.indexOf('.') === -1) {
            // if (inSheet && parent) {
            //     return parent.findChild(key);
            // } else {
                return root.findChild(key);
            // }
        } else {
            const ids = key.split('.');
            if (inSheet && parent) {
                return parent.findChild(ids[1]);
            } else {
                return root.findChild(ids[0]);
            }
        }
    }

}