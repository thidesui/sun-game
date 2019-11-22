//@ts-check
'use strict'

const container = document.getElementById('container')

let game = new Game()

function handleCursorMove(ev) {
    if (is_touch_device())
        return
    if (!game.on)
        return
    checkPoint()
    game.player.moveMouse(ev.layerX)
}

function startMove(ev) {
    game.startTouch = ev.targetTouches[0].clientX
    game.startPlayerMove = game.player.left
}

function handleTouchMove(ev) {
    if (!game.on)
        return
    ev.preventDefault()
    game.player.moveTouch(game.startPlayerMove, ev.targetTouches[0].clientX - game.startTouch)
}

/**
 * @param {PointElement} element
 * @param {boolean} [end]
 */
async function fallElement(element, end) {

    await timeOut(element.fallTime)

    if (element.dead)
        return

    if (end) {
        element.miss()
        return
    }

    if (!game.on) {
        fallElement(element)
        return
    }

    if (element.top <= (container.offsetHeight - element.width - 4)) {
        element.setTop(element.top + 1)
        fallElement(element)
    } else {
        element.setTop(container.offsetHeight - element.width - 4)
        fallElement(element, true)
    }
    checkPoint()
}


async function elementsController() {

    if (game.dead)
        return

    if (game.on)
        fallElement(game.falls.newElement(container))

    await timeOut(game.createTime)

    elementsController()
}

function timeOut(n) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, n)
    })
}

window.onload = () => {
    game.init()
}

function checkPoint() {

    for (let i = 0; i < game.falls.elements.length; i++) {
        const element = game.falls.elements[i]

        if ((container.offsetHeight - element.top - element.height - game.player.height < 0) && (game.player.left < element.left + element.width - 20) && (element.left < game.player.left + game.player.width - 20))
            element.hit()

    }
}

function is_touch_device() {
    try {
        document.createEvent("TouchEvent")
        return true
    } catch (e) {
        return false
    }
}