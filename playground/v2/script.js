'use strict'

const screen = document.getElementById('screen'),
    container = document.getElementById('container'),
    context = screen.getContext('2d'),
    elementSize = 150,
    playerSize = 250,
    characters = ["alien-1.svg", "alien.svg", "asian-1.svg", "asian-2.svg", "asian-3.svg", "asian.svg", "basketball-game.player.svg", "boxer.svg", "boy-1.svg", "boy-10.svg", "boy-11.svg", "boy-12.svg", "boy-2.svg", "boy-3.svg", "boy-4.svg", "boy-5.svg", "boy-6.svg", "boy-7.svg", "boy-8.svg", "boy-9.svg", "boy.svg", "businessman-1.svg", "businessman-2.svg", "businessman-3.svg", "businessman.svg", "characters.svg", "chef.svg", "chemist-1.svg", "chemist.svg", "chicken.svg", "child.svg", "cleaner.svg", "cool-1.svg", "cool.svg", "doctor.svg", "duck.svg", "farmer-1.svg", "farmer.svg", "freak.svg", "gardener.svg", "grandfather-1.svg", "grandfather.svg", "guitar-game.player-1.svg", "guitar-game.player.svg", "hipster.svg", "hitman-1.svg", "hitman-2.svg", "hitman-3.svg", "hitman-4.svg", "hitman.svg", "man-1.svg", "man-2.svg", "man-3.svg", "man-4.svg", "man-5.svg", "man-6.svg", "man.svg", "martial-arts.svg", "nerd-1.svg", "nerd.svg", "painter.svg", "plumber-1.svg", "plumber.svg", "policeman.svg", "priest.svg", "prisioner.svg", "professor.svg", "psycho-1.svg", "psycho-2.svg", "psycho.svg", "rapper.svg", "robot.svg", "smoker.svg", "student.svg", "superheroe-1.svg", "superheroe-10.svg", "superheroe-11.svg", "superheroe-12.svg", "superheroe-13.svg", "superheroe-14.svg", "superheroe-2.svg", "superheroe-3.svg", "superheroe-4.svg", "superheroe-5.svg", "superheroe-6.svg", "superheroe-7.svg", "superheroe-8.svg", "superheroe-9.svg", "superheroe.svg", "supervillain.svg", "supervillian.svg", "teacher.svg", "trumpeter.svg", "villian.svg", "warrior.svg", "wrestler.svg"],
    elements = {
        good: ['sun-umbrella.svg', 'sun.svg', 'sunscreen.svg'],
        bad: ['flame.svg']
    }

const buttons = {
    start: document.getElementById('startGame'),
    pause: document.getElementById('pauseGame'),
    stop: document.getElementById('stopGame'),
    changeCharacter: document.getElementById('changeCharacter')
}

const state = {
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
}

class Game {

    status = 'stopped'

    createPeriod = 4000

    fallSpeed = 1

    numberOfMistakes = 10

    creatingElement = false

    commandsAccepted = {
        'p': (_) => {
            if (game.status == 'playing')
                game.pause()
            else
                game.start()
        },
        'a': (command) => {
            game.movePlayerWithKey(command, 'left')
        },
        'd': (command) => {
            game.movePlayerWithKey(command, 'right')
        },
        'ArrowLeft': (command) => {
            game.movePlayerWithKey(command, 'left')
        },
        'ArrowRight': (command) => {
            game.movePlayerWithKey(command, 'right')
        }
    }

    movePlayer(command) {

        if (game.status != 'playing')
            return

        const player = state.players[command.playerId]

        let positionX

        if (command.direction) {
            positionX = player.x + (command.direction === 'left' ? -(screen.width / 40) : (screen.width / 40))
        } else {
            positionX = command.positionX

            positionX = ((screen.width * (positionX)) / (screen.offsetWidth - 20)) - (playerSize / 2)
        }

        const max = screen.width - playerSize

        if (positionX < 0)
            positionX = 0

        else if (positionX > max)
            positionX = max

        player.x = positionX

        game.checkPlayersHits()
    }

    changeCharacter(playerId) {
        state.players[playerId].character = `../characters/${characters[parseInt(Math.random() * characters.length) + '']}`
    }

    createElement(repeat, start) {

        if (start && game.creatingElement === true)
            return

        if (game.status != 'playing') {
            game.creatingElement = false
            return
        }

        game.creatingElement = true

        const property = (Math.floor((Math.random() * 10) + 1) > 7) ? 'bad' : 'good'
            // let iconPath
            // if (property == 'good')
            // 	iconPath = good[parseInt(Math.random() * good.length) + '']
            // const icon = `../elements/${property}/${[property][parseInt(Math.random() * characters.length) + '']}`

        state.elements[generateGuid()] = {
            x: (screen.width - elementSize) * Math.random(),
            y: 0,
            property: property,
            image: `../elements/${property}/${elements[property][parseInt(Math.random() * elements[property].length) + '']}`,
            fallSpeed: game.fallSpeed
        }

        if (repeat)
            awaitThis(game.createPeriod).then(() => { game.createElement(true) })
    }

    fallElement() {

        if (game.status != 'playing')
            return

        for (const elementId in state.elements) {
            const element = state.elements[elementId]

            element.y += element.fallSpeed

            if (element.y > screen.height - elementSize + 10) {
                delete state.elements[elementId]
                if (element.property == 'good')
                    game.point('mistakes')
                else
                    game.point('hits')
            }
        }

        game.checkPlayersHits()
        awaitThis(1).then(() => { game.fallElement() })
    }

    checkPlayersHits() {
        for (const playerId in state.players) {
            const player = state.players[playerId]

            for (const elementId in state.elements) {
                const element = state.elements[elementId]

                const hitHeight = (element.y > screen.height - (playerSize * 1.6))
                const hitWidth = (player.x < element.x + elementSize) && (element.x < player.x + playerSize)

                if (hitHeight && hitWidth)
                    game.hit(playerId, elementId)
            }
        }
    }

    hit(playerId, elementId) {
        const element = state.elements[elementId]
        delete state.elements[elementId]

        if (element.property === 'good')
            game.point('hits')
        else
            game.point('mistakes')
    }

    point(property) {
        state.points[property]++
            if (property === 'hits') {
                if (game.createPeriod > 300)
                    game.createPeriod -= 125
                if ((state.points.hits % 5 == 0) && game.fallSpeed < 6)
                    game.fallSpeed += 1
            }
        if (property === 'mistakes' && state.points.mistakes >= game.numberOfMistakes)
            game.stop()
    }

    movePlayerWithKey(command, direction) {
        game.movePlayer({ playerId: command.playerId, direction: direction })
    }

    commands(command) {
        const keyPressed = command.keyPressed
        const keyFunction = game.commandsAccepted[keyPressed]
        if (keyFunction)
            keyFunction(command)
    }

    start() {
        game.status = 'playing'
        buttons.pause.disabled = false
        buttons.start.disabled = true
        buttons.stop.disabled = false
        game.createPeriod = 4000
        game.fallSpeed = 1
        game.fallElement()
        game.createElement(true, true)
        state.points = {
            hits: 0,
            mistakes: 0
        }
    }

    pause() {
        game.status = 'paused'
        buttons.pause.disabled = true
        buttons.start.disabled = false
        buttons.stop.disabled = false
    }

    stop() {
        game.status = 'stopped'
        buttons.start.disabled = false
        buttons.pause.disabled = true
        buttons.stop.disabled = true
        for (const playerId in state.players) {
            const player = state.players[playerId]
            player.x = 0
        }
        for (const elementId in state.elements) {
            delete state.elements[elementId]
        }
    }
}

let game = new Game()
game.changeCharacter('player1')

function renderScreen() {

    screen.width = (screen.height * container.offsetWidth) / container.offsetHeight

    context.fillStyle = 'white'
    context.clearRect(0, 0, screen.width, screen.height)

    for (const playerId in state.players) {
        const player = state.players[playerId]
        let image = new Image()
        image.src = player.character
        context.drawImage(image, player.x, screen.height - playerSize, playerSize, playerSize);
    }

    for (const elementId in state.elements) {
        const element = state.elements[elementId]
        let image = new Image()
        image.src = element.image
        context.drawImage(image, element.x, element.y, elementSize, elementSize);
        // context.fillStyle = (element.property === 'good' ? 'green' : 'red')
        // context.fillRect(element.x, element.y, elementSize, elementSize)
    }

    context.fillStyle = 'black'
    context.font = "50px Arial";
    context.fillText(`Hits: ${state.points.hits}`, 10, 60);
    context.fillText(`Mistakes: ${state.points.mistakes}`, 10, 120);
    context.fillText(`Creation period: ${game.createPeriod}ms`, 10, 180);
    context.fillText(`Fall speed: ${game.fallSpeed}px/ms`, 10, 240);

    requestAnimationFrame(renderScreen)
}

renderScreen()

const keyboardListener = createKeyboardListener()
keyboardListener.subscribe(game.commands)

function createKeyboardListener() {
    const state = {
        observers: []
    }

    function subscribe(observerFunction) {
        state.observers.push(observerFunction)
    }

    function notifyAll(command) {
        for (const observerFunction of state.observers) {
            observerFunction(command)
        }
    }

    document.addEventListener('keydown', handleKeydown)

    function handleKeydown(e) {
        const keyPressed = e.key

        const command = {
            playerId: 'player1',
            keyPressed
        }

        notifyAll(command)
    }

    return {
        subscribe
    }
}

const mouseListener = createMouseListener()
mouseListener.subscribe(game.movePlayer)

function createMouseListener() {
    const state = {
        observers: []
    }

    function subscribe(observerFunction) {
        state.observers.push(observerFunction)
    }

    function notifyAll(command) {
        for (const observerFunction of state.observers) {
            observerFunction(command)
        }
    }

    screen.addEventListener('mousemove', handleMouseMove)

    function handleMouseMove(e) {
        if (is_touch_device())
            return
        const positionX = e.offsetX

        const command = {
            playerId: 'player1',
            positionX
        }

        notifyAll(command)
    }

    return {
        subscribe
    }
}

// function startMove(ev) {
//     game.startTouch = ev.targetTouches[0].clientX
//     game.startPlayerMove = game.player.left
// }

// function handleTouchMove(ev) {
//     if (!game.on)
//         return
//     ev.preventDefault()
//     game.player.moveTouch(game.startPlayerMove, ev.targetTouches[0].clientX - game.startTouch)
// }

function is_touch_device() {
    try {
        document.createEvent("TouchEvent")
        return true
    } catch (e) {
        return false
    }
}

function awaitThis(n) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, n)
    })
}

function generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}