//@ts-check

const characters = ["alien-1.svg", "alien.svg", "asian-1.svg", "asian-2.svg", "asian-3.svg", "asian.svg", "basketball-game.player.svg", "boxer.svg", "boy-1.svg", "boy-10.svg", "boy-11.svg", "boy-12.svg", "boy-2.svg", "boy-3.svg", "boy-4.svg", "boy-5.svg", "boy-6.svg", "boy-7.svg", "boy-8.svg", "boy-9.svg", "boy.svg", "businessman-1.svg", "businessman-2.svg", "businessman-3.svg", "businessman.svg", "characters.svg", "chef.svg", "chemist-1.svg", "chemist.svg", "chicken.svg", "child.svg", "cleaner.svg", "cool-1.svg", "cool.svg", "doctor.svg", "duck.svg", "farmer-1.svg", "farmer.svg", "freak.svg", "gardener.svg", "grandfather-1.svg", "grandfather.svg", "guitar-game.player-1.svg", "guitar-game.player.svg", "hipster.svg", "hitman-1.svg", "hitman-2.svg", "hitman-3.svg", "hitman-4.svg", "hitman.svg", "man-1.svg", "man-2.svg", "man-3.svg", "man-4.svg", "man-5.svg", "man-6.svg", "man.svg", "martial-arts.svg", "nerd-1.svg", "nerd.svg", "painter.svg", "plumber-1.svg", "plumber.svg", "policeman.svg", "priest.svg", "prisioner.svg", "professor.svg", "psycho-1.svg", "psycho-2.svg", "psycho.svg", "rapper.svg", "robot.svg", "smoker.svg", "student.svg", "superheroe-1.svg", "superheroe-10.svg", "superheroe-11.svg", "superheroe-12.svg", "superheroe-13.svg", "superheroe-14.svg", "superheroe-2.svg", "superheroe-3.svg", "superheroe-4.svg", "superheroe-5.svg", "superheroe-6.svg", "superheroe-7.svg", "superheroe-8.svg", "superheroe-9.svg", "superheroe.svg", "supervillain.svg", "supervillian.svg", "teacher.svg", "trumpeter.svg", "villian.svg", "warrior.svg", "wrestler.svg"]

const good = [
    'sun-umbrella',
    'sun',
    'sunscreen'
]

const bad = [
    'flame'
]

class Player {
    /** @type {HTMLElement} */
    ref
    /** @type {number} */
    left
    /** @type {number} */
    height
    /** @type {number} */
    width

    /**
     * @param {HTMLElement} container
     */
    constructor(container) {
        // Cria o personagem
        this.ref = new Image()
        this.ref.classList.add('element', 'player')
            // @ts-ignore
        this.ref.src = 'characters/' + characters[parseInt(Math.random() * characters.length + '')]
            // this.ref.style.backgroundImage = 'url(./icons/standing-up-man-.svg)'
        this.ref.id = 'player'
        this.setLeft(0)

        // Insere o personagem na tela
        container.appendChild(this.ref)
        this.height = this.ref.offsetHeight
        this.width = this.ref.offsetWidth
        this.max = container.offsetWidth - (this.width + 4)
            // console.log(this.width, container.offsetWidth, this.max)
    }

    /**
     * @param {number} n
     */
    setLeft(n) {
        this.ref.style.left = n + 'px'
        this.left = n
    }
    moveMouse(n) {
        let position = n - (game.player.width / 2)

        if (position < 0)
            position = 0
        else if (position > this.max)
            position = this.max

        this.setLeft(position)
    }
    moveTouch(start, end) {
        let position = start + end
        if (position < 0)
            position = 0
        else if (position > this.max)
            position = this.max
        this.setLeft(position)
    }
}

class Elements {
    /** @type {PointElement[]} */
    elements = []

    constructor() {}

    /**
     * @param {HTMLElement} container
     */
    newElement(container) {
        let newElement = new PointElement(container)
        this.elements.push(newElement)
        return newElement
    }

    /**
     * @param {PointElement} element
     */
    deleteElement(element) {
        this.elements = this.elements.filter(a => { return a.left != element.left })
    }

    kill() {
        for (let i = 0; i < this.elements.length; i++) {
            this.elements[i].remove()
        }
    }
}

class PointElement {
    /** @type {HTMLElement} */
    ref
    /** @type {number} */
    left
    /** @type {number} */
    top
    /** @type {number} */
    height
    /** @type {number} */
    width
    /** @type {'bad'|'good'} */
    property
    /** @type {boolean} */
    dead = false
        /** @type {number} */
    fallTime

    /**
     * @param {HTMLElement} container
     */
    constructor(container) {
        // Cria o elemento e atribui as respectivas classes
        this.ref = new Image()
        this.property = ((parseInt(Math.random() * 10 + '') % 2) ? 'bad' : 'good')
        this.fallTime = (parseInt(Math.random() * game.fallTime + ''))
        this.ref.classList.add('element', 'point')

        if (this.property == 'bad')
        // @ts-ignore
            this.ref.src = 'icons/' + bad[0] + '.svg'
        else
        // @ts-ignore
            this.ref.src = 'icons/' + good[parseInt(Math.random() * good.length + '')] + '.svg'

        let position = container.offsetWidth * Math.random()
        let max = container.offsetWidth - 54
        if (position > max)
            position = max
        this.setLeft(position)
        this.setTop(0)

        // Insere o elemento na tela
        container.appendChild(this.ref)
        this.height = this.ref.offsetHeight
        this.width = this.ref.offsetWidth
    }

    /**
     * @param {number} n
     */
    setLeft(n) {
            this.ref.style.left = n + 'px'
            this.left = n
        }
        /**
         * @param {number} n
         */
    setTop(n) {
        this.ref.style.top = n + 'px'
        this.top = n
    }
    remove() {
        this.ref.remove()
        this.dead = true
        game.falls.deleteElement(this)
    }
    hit() {
        if (this.property == 'good')
            game.points.hit()
        else
            game.points.miss()
        this.remove()
    }
    miss() {
        if (this.property == 'bad')
            game.points.hit()
        else
            game.points.miss()
        this.remove()
    }

}

class Points {
    /** @type {number} */
    hits
    /** @type {number} */
    mistakes
    constructor() {
        this.hits = 0
        this.mistakes = 0
    }
    hit() {
        this.hits++
            document.getElementById('hits').innerHTML = 'Pontos: ' + this.hits
        if (game.createTime > 1000 && (this.hits % 5 == 0))
            game.createTime = game.createTime - 500
        if (game.fallTime > 3)
            game.fallTime = game.fallTime - 0.2
        console.log(game.createTime, game.fallTime)
    }
    miss() {
        this.mistakes++
            document.getElementById('mistakes').innerHTML = 'Erros: ' + this.mistakes
    }
    kill() {
        this.hits = 0
        this.mistakes = 0
        document.getElementById('hits').innerHTML = 'Pontos: ' + this.hits
        document.getElementById('mistakes').innerHTML = 'Erros: ' + this.mistakes

    }
}

class Game {
    createTime
    fallTime
    on = false
    player = new Player(container)
    falls = new Elements()
    points = new Points()
    startTouch = 0
    startPlayerMove = 0
    dead = false

    constructor() {}

    init() {
        this.createTime = 5000
        this.fallTime = game.createTime / 300
        elementsController()
    }

    play() {
        if (this.dead) {
            this.dead = false
            this.init()
        }
        this.on = true
    }

    pause() {
        this.on = false
    }

    kill() {
        this.dead = true
        this.on = false
        this.points.kill()
        this.falls.kill()
    }

}