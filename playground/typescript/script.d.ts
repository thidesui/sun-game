type ElementProperty = 'bad' | 'good';
type Direction = 'left' | 'right';
interface StateListener {
    observers: ((command: any) => void)[];
}
interface Command {
    playerId: string;
    touch?: {
        start: number;
        end: number;
    };
    direction?: Direction;
    positionX?: number;
    keyPressed?: string;
}
interface State {
    players: Record<string, {
        x: number;
        character?: string;
    }>;
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
type CommandFunction = (command: Command) => void;
type CommandsAccepted = Record<string, CommandFunction>;
declare const canvas: HTMLCanvasElement, container: HTMLDivElement, context: CanvasRenderingContext2D, elementSize = 150, playerSize = 250, characters: string[], elements: {
    good: string[];
    bad: string[];
};
declare const buttons: {
    start: HTMLButtonElement;
    pause: HTMLButtonElement;
    stop: HTMLButtonElement;
    changeCharacter: HTMLButtonElement;
};
declare const state: State;
declare class Game {
    status: string;
    createPeriod: number;
    fallSpeed: number;
    maxMistakes: number;
    creatingElement: boolean;
    commandsAccepted: CommandsAccepted;
    movePlayer(command: Command): void;
    changeCharacter(playerId: string): void;
    createElement(repeat?: boolean, start?: boolean): void;
    fallElement(): void;
    checkPlayersHits(): void;
    hit(_playerId: string, elementId: string): void;
    point(property: keyof State['points']): void;
    movePlayerWithKey(command: Command, direction: Direction): void;
    commands(command: Command): void;
    start(): void;
    pause(): void;
    stop(): void;
}
declare let game: Game;
declare function renderScreen(): void;
declare const keyboardListener: {
    subscribe: (observerFunction: (command: Command) => void) => void;
};
declare function createKeyboardListener(): {
    subscribe: (observerFunction: (command: Command) => void) => void;
};
declare const mouseListener: {
    subscribe: (observerFunction: CommandFunction) => void;
};
declare function createMouseListener(): {
    subscribe: (observerFunction: CommandFunction) => void;
};
declare const touchListener: {
    subscribe: (observerFunction: CommandFunction) => void;
};
declare function createTouchListener(): {
    subscribe: (observerFunction: CommandFunction) => void;
};
declare function is_touch_device(): boolean;
declare function awaitThis(n: number): Promise<unknown>;
declare function generateGuid(): string;