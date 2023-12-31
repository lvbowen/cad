import { Activity } from '../typings/workflow';

export namespace LINE {
  export interface point {
    x: number,
    y: number
  }

  // eslint-disable-next-line no-shadow
  export enum popupTypes {
    expression = 'EXPRESSION',
    function = 'FUNCTION',
  }

  export interface config {
    ID: number,
    text?: string,
    startActivity: Activity | undefined,
    endActivity: Activity | undefined,
    startPoint: point,
    endPoint: point | undefined,
    startDirection?: number,
    endDirection?: number,
    crossPoints?: Array<point>,
    points?: Array<point>,
    offsetToStartActivity?: point,
    offsetToEndActivity?: point,
    // Path?: string,
    // Arrow?: string,
    // isSelected: boolean,
    // needRedraw: boolean,
    // fixedPoint: boolean,
    code?: string,
    formula?: string,
    utilizeElse?: boolean,
    popupType?: popupTypes,
  }

  export interface props {
    ID?: number,
    text?: string,
    startPoint?: point,
    endPoint?: point,
    startActivity?: Activity,
    endActivity?: Activity,
    startDirection?: number,
    endDirection?: number,
    needRedraw?: boolean,
    points?: Array<point>,
  }

  // eslint-disable-next-line no-shadow
  export enum ArrowDirection {
    Unspecified = 0,
    down = 1,
    up = -1,
    left = 2,
    right = -2
  }

  // eslint-disable-next-line no-shadow
  export enum HandlerDirection {
    Unspecified = 0,
    Vertical = 1,
    Horizontal = 2
  }

  export interface crossPoint {
    x: number,
    y: number,
    verticalLineId: number
  }

  export interface crossOffsetX {
    start: number,
    end: number
  }

  export interface handlerPoint {
    x: number,
    y: number,
    Activity: Activity | undefined,
    Direction: HandlerDirection
  }
}
