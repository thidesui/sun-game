type ElementProperty = 'bad' | 'good';
export type Direction = 'left' | 'right';

export interface StateListener { observers: ((command: any) => void)[]; }

export interface Command {
    playerId: string;
    touch?: {
        start: number;
        end: number;
    };
    direction?: Direction;
    positionX?: number;
    keyPressed?: string;
}

export interface State {
    players: Record<string, { x: number; character?: string; }>;
    elements: Record<string, {
        x: number;
        y: number;
        property: ElementProperty;
        image: string;
        fallSpeed: number;
    }>;
    points: {
        hits: number;
        mistakes: number;
    };
}

export type CommandFunction = (command: Command) => void;
export type CommandsAccepted = Record<string, CommandFunction>;