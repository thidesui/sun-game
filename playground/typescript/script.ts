import { Command, CommandFunction, CommandsAccepted, Direction, StateListener, State } from './interfaces';

const canvas = <HTMLCanvasElement>document.getElementById('screen'),
    container = <HTMLDivElement>document.getElementById('container'),
    context = <CanvasRenderingContext2D>canvas.getContext('2d'),
    elementSize = 150,
    playerSize = 250,
    characters = ["alien-1.svg", "alien.svg", "asian-1.svg", "asian-2.svg", "asian-3.svg", "asian.svg", "basketball-game.player.svg", "boxer.svg", "boy-1.svg", "boy-10.svg", "boy-11.svg", "boy-12.svg", "boy-2.svg", "boy-3.svg", "boy-4.svg", "boy-5.svg", "boy-6.svg", "boy-7.svg", "boy-8.svg", "boy-9.svg", "boy.svg", "businessman-1.svg", "businessman-2.svg", "businessman-3.svg", "businessman.svg", "characters.svg", "chef.svg", "chemist-1.svg", "chemist.svg", "chicken.svg", "child.svg", "cleaner.svg", "cool-1.svg", "cool.svg", "doctor.svg", "duck.svg", "farmer-1.svg", "farmer.svg", "freak.svg", "gardener.svg", "grandfather-1.svg", "grandfather.svg", "guitar-player-1.svg", "guitar-player.svg", "hipster.svg", "hitman-1.svg", "hitman-2.svg", "hitman-3.svg", "hitman-4.svg", "hitman.svg", "man-1.svg", "man-2.svg", "man-3.svg", "man-4.svg", "man-5.svg", "man-6.svg", "man.svg", "martial-arts.svg", "nerd-1.svg", "nerd.svg", "painter.svg", "plumber-1.svg", "plumber.svg", "policeman.svg", "priest.svg", "prisioner.svg", "professor.svg", "psycho-1.svg", "psycho-2.svg", "psycho.svg", "rapper.svg", "robot.svg", "smoker.svg", "student.svg", "superheroe-1.svg", "superheroe-10.svg", "superheroe-11.svg", "superheroe-12.svg", "superheroe-13.svg", "superheroe-14.svg", "superheroe-2.svg", "superheroe-3.svg", "superheroe-4.svg", "superheroe-5.svg", "superheroe-6.svg", "superheroe-7.svg", "superheroe-8.svg", "superheroe-9.svg", "superheroe.svg", "supervillain.svg", "supervillian.svg", "teacher.svg", "trumpeter.svg", "villian.svg", "warrior.svg", "wrestler.svg"],
    elements = {
        good: ['sun-umbrella.svg', 'sun.svg', 'sunscreen.svg'],
        bad: ['flame.svg']
    };

const buttons = {
    start: <HTMLButtonElement>document.getElementById('startGame'),
    pause: <HTMLButtonElement>document.getElementById('pauseGame'),
    stop: <HTMLButtonElement>document.getElementById('stopGame'),
    changeCharacter: <HTMLButtonElement>document.getElementById('changeCharacter')
};

const state: State = {
    players: {
        'player1': {
            x: 0
        }
    },
    elements: {},
    points: {
        hits: 0,
        mistakes: 0
    }
};

class Game {
    status = 'stopped';

    createPeriod = 4000;

    fallSpeed = 1;

    maxMistakes = 10;

    creatingElement = false;

    commandsAccepted: CommandsAccepted = {
        'p': () => {
            if (game.status == 'playing')
                game.pause();
            else
                game.start();
        },
        'a': (command: Command) => {
            game.movePlayerWithKey(command, 'left');
        },
        'd': (command: Command) => {
            game.movePlayerWithKey(command, 'right');
        },
        'ArrowLeft': (command: Command) => {
            game.movePlayerWithKey(command, 'left');
        },
        'ArrowRight': (command: Command) => {
            game.movePlayerWithKey(command, 'right');
        }
    };

    movePlayer(command: Command) {
        if (game.status != 'playing')
            return;

        const player = state.players[command.playerId],
            max = canvas.width - playerSize;

        let positionX;

        if (command.touch) {
            positionX = command.touch.start + (command.touch.end * (canvas.width / canvas.offsetWidth));
        } else if (command.direction) {
            positionX = player.x + (command.direction === 'left' ? -(canvas.width / 40) : (canvas.width / 40));
        } else if (command.positionX) {
            positionX = command.positionX;
            positionX = ((canvas.width * (positionX)) / (canvas.offsetWidth - 20)) - (playerSize / 2);

            if (positionX < 0)
                positionX = 0;

            else if (positionX > max)
                positionX = max;

            player.x = positionX;
        }

        game.checkPlayersHits();
    }

    changeCharacter(playerId: string) {
        state.players[playerId].character = `./playground/characters/${characters[Math.random() * characters.length | 0]}`;
    }

    createElement(repeat?: boolean, start?: boolean) {
        if (start && game.creatingElement === true)
            return;

        if (game.status != 'playing') {
            game.creatingElement = false;
            return;
        }

        game.creatingElement = true;

        const property = ((Math.random() * 10 | 0) > 5) ? 'bad' : 'good';

        state.elements[generateGuid()] = {
            x: (canvas.width - elementSize) * Math.random(),
            y: 0,
            property,
            image: `./playground/elements/${property}/${elements[property][Math.random() * elements[property].length | 0]}`,
            fallSpeed: game.fallSpeed
        };

        if (repeat)
            awaitThis(game.createPeriod).then(() => { game.createElement(true); });
    }

    fallElement() {
        if (game.status != 'playing')
            return;

        for (const elementId in state.elements) {
            if (Object.prototype.hasOwnProperty.call(state.elements, elementId)) {
                const element = state.elements[elementId];

                element.y += element.fallSpeed;

                if (element.y > canvas.height - elementSize + 10) {
                    if (element.property == 'good') game.point('mistakes');
                    else game.point('hits');

                    delete state.elements[elementId];
                }

            }
        }

        game.checkPlayersHits();
        awaitThis(1).then(() => { game.fallElement(); });
    }

    checkPlayersHits() {
        for (const playerId in state.players) {
            if (Object.prototype.hasOwnProperty.call(state.players, playerId)) {
                const player = state.players[playerId];

                for (const elementId in state.elements) {
                    if (Object.prototype.hasOwnProperty.call(state.elements, elementId)) {
                        const element = state.elements[elementId];

                        const hitHeight = (element.y > canvas.height - (playerSize * 1.6));
                        const hitWidth = (player.x < element.x + elementSize) && (element.x < player.x + playerSize);

                        if (hitHeight && hitWidth)
                            game.hit(playerId, elementId);
                    }
                }
            }
        }
    }

    hit(_playerId: string, elementId: string) {
        const element = state.elements[elementId];

        if (element.property === 'good') game.point('hits');
        else game.point('mistakes');

        delete state.elements[elementId];
    }

    point(property: keyof State['points']) {
        state.points[property]++;
        if (property === 'hits') {
            if (game.createPeriod > 300)
                game.createPeriod -= 125;
            if ((state.points.hits % 5 == 0) && game.fallSpeed < 6)
                game.fallSpeed += 1;
        }
        if (property === 'mistakes' && state.points.mistakes >= game.maxMistakes)
            game.stop();
    }

    movePlayerWithKey(command: Command, direction: Direction) {
        game.movePlayer({ playerId: command.playerId, direction });
    }

    commands(command: Command) {
        const { keyPressed } = command;

        if (keyPressed) {
            const keyFunction = game.commandsAccepted[keyPressed];

            if (keyFunction) keyFunction(command);
        }
    }

    start() {
        if (game.status === 'stopped') {
            game.createPeriod = 4000;
            game.fallSpeed = 1;
            state.points = {
                hits: 0,
                mistakes: 0
            };
        }
        game.status = 'playing';
        buttons.pause.disabled = false;
        buttons.start.disabled = true;
        buttons.stop.disabled = false;
        game.createElement(true, true);
        game.fallElement();
    }

    pause() {
        game.status = 'paused';
        buttons.pause.disabled = true;
        buttons.start.disabled = false;
        buttons.stop.disabled = false;
    }

    stop() {
        game.status = 'stopped';
        buttons.start.disabled = false;
        buttons.pause.disabled = true;
        buttons.stop.disabled = true;

        for (const playerId in state.players) {
            if (Object.prototype.hasOwnProperty.call(state.players, playerId)) {
                state.players[playerId].x = 0;
            }
        }

        for (const elementId in state.elements) {
            if (Object.prototype.hasOwnProperty.call(state.elements, elementId)) {
                delete state.elements[elementId];
            }
        }
    }
}

let game = new Game();
game.changeCharacter('player1');

function renderScreen() {
    canvas.width = (canvas.height * container.offsetWidth) / container.offsetHeight;

    context.fillStyle = 'white';
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (const playerId in state.players) {
        if (Object.prototype.hasOwnProperty.call(state.players, playerId)) {
            const player = state.players[playerId];
            let image = new Image();
            image.src = player.character || '';
            context.drawImage(image, player.x, canvas.height - playerSize, playerSize, playerSize);
        }
    }

    for (const elementId in state.elements) {
        if (Object.prototype.hasOwnProperty.call(state.elements, elementId)) {
            const element = state.elements[elementId];
            let image = new Image();
            image.src = element.image;
            context.drawImage(image, element.x, element.y, elementSize, elementSize);
        }
    }

    context.fillStyle = 'black';
    context.font = "50px Arial";
    context.fillText(`Hits: ${state.points.hits}`, 10, 60);
    context.fillText(`Mistakes: ${state.points.mistakes} / 10`, 10, 120);
    // context.fillText(`Creation period: ${game.createPeriod}ms`, 10, 180);
    // context.fillText(`Fall speed: ${game.fallSpeed}px/ms`, 10, 240);

    requestAnimationFrame(renderScreen);
}

renderScreen();

const keyboardListener = createKeyboardListener();
keyboardListener.subscribe(game.commands);

function createKeyboardListener() {
    const stateListener: StateListener = {
        observers: []
    };

    function subscribe(observerFunction: (command: Command) => void) {
        stateListener.observers.push(observerFunction);
    }

    function notifyAll(command: Command) {
        for (const observerFunction of stateListener.observers) {
            observerFunction(command);
        }
    }

    document.addEventListener('keydown', handleKeydown);

    function handleKeydown(e: KeyboardEvent) {
        const keyPressed = e.key;

        const command = {
            playerId: 'player1',
            keyPressed
        };

        notifyAll(command);
    }

    return {
        subscribe
    };
}

const mouseListener = createMouseListener();
mouseListener.subscribe(game.movePlayer);

function createMouseListener() {
    const stateListener: StateListener = {
        observers: []
    };

    function subscribe(observerFunction: CommandFunction) {
        stateListener.observers.push(observerFunction);
    }

    function notifyAll(command: Command) {
        for (const observerFunction of stateListener.observers) {
            observerFunction(command);
        }
    }

    function handleMouseMove(e: MouseEvent) {
        if (is_touch_device())
            return;
        const positionX = e.offsetX;

        const command = {
            playerId: 'player1',
            positionX
        };

        notifyAll(command);
    }

    canvas.addEventListener('mousemove', handleMouseMove);

    return {
        subscribe
    };
}

const touchListener = createTouchListener();
touchListener.subscribe(game.movePlayer);

function createTouchListener() {
    const stateListener: StateListener = {
        observers: []
    };

    let startTouch: number;
    let startPlayer: number;

    function subscribe(observerFunction: CommandFunction) {
        stateListener.observers.push(observerFunction);
    }

    function notifyAll(command: Command) {
        for (const observerFunction of stateListener.observers) {
            observerFunction(command);
        }
    }

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);

    function handleTouchStart(e: TouchEvent) {
        startTouch = e.targetTouches[0].clientX;
        startPlayer = state.players.player1.x;
    }

    function handleTouchMove(e: TouchEvent) {
        const command = {
            playerId: 'player1',
            touch: {
                start: startPlayer,
                end: e.targetTouches[0].clientX - startTouch
            }
        };

        notifyAll(command);
    }

    return {
        subscribe
    };
}

function is_touch_device() {
    try {
        document.createEvent("TouchEvent");
        return true;
    } catch (e) {
        return false;
    }
}

function awaitThis(n: number) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(true);
        }, n);
    });
}

function generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}