import { Control } from "./control";

export interface ContainerLike {
  children: { [key: string]: Control } | Control[];

  findChild(key: string | number, rowIndex?: number): Control | undefined;
}
