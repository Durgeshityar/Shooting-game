const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.height = innerHeight
canvas.width = innerWidth

const scoreEl = document.querySelector('#scoreEl')
const startGameBtn = document.querySelector('#startGameBtn')
const modalEl = document.querySelector('#modalEl')
const bigScoreEl = document.querySelector('#bigScoreEl')

class Player {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

const frinction = 0.98

class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.alpha = 1
  }

  draw() {
    c.save()
    c.globalAlpha = this.alpha
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.restore()
  }

  update() {
    this.draw()
    this.velocity.x *= frinction
    this.velocity.y *= frinction
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
    this.alpha -= 0.01
  }
}

const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 10, 'white')
let projectiles = []
let enemies = []
let particles = []

function init() {
  player = new Player(x, y, 10, 'white')
  projectiles = []
  enemies = []
  particles = []
  score = 0
  scoreEl.innerHTML = score
  bigScoreEl.innerHTML = score
}
function spawnEnemies() {
  setInterval(() => {
    const radius = Math.random() * (30 - 8) + 8

    let x
    let y

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
      y = Math.random() * canvas.height
    } else {
      x = Math.random() * canvas.width
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
    }

    const color = `hsl(${Math.random() * 360},50%,50%)`

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    }

    enemies.push(new Enemy(x, y, radius, color, velocity))
  }, 1000)
}

let animationId
let score = 0

function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0,0,0,0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  player.draw()

  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1)
    } else {
      particle.update()
    }
  })

  projectiles.forEach((projectile, i) => {
    projectile.update()

    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radiu > canvas.width ||
      projectile.y + projectile.radiu < 0 ||
      projectile.y - projectile.radiu > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(i, 1)
      }, 0)
    }
  })

  enemies.forEach((enemy, i) => {
    enemy.update()

    //end game
    const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y)
    if (distance - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId)
      modalEl.style.display = 'flex'
      bigScoreEl.innerHTML = score
    }

    //shooting projectiles
    projectiles.forEach((projectile, porjectileIndex) => {
      const distance = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      )

      // when projectiles touch enemy
      if (distance - enemy.radius - projectile.radius < 1) {
        //increase score
        score += 100
        scoreEl.innerHTML = score

        //creates exolosion
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6),
              }
            )
          )
        }

        if (enemy.radius - 10 > 5) {
          //increase score
          score += 100
          scoreEl.innerHTML = score

          gsap.to(enemy, {
            radius: enemy.radius - 10,
          })

          setTimeout(() => {
            projectiles.splice(porjectileIndex, 1)
          }, 0)
        } else {
          //remove from scene altogether
          //increase score
          score += 250
          scoreEl.innerHTML = score

          setTimeout(() => {
            enemies.splice(i, 1)
            projectiles.splice(porjectileIndex, 1)
          }, 0)
        }
      }
    })
  })
}

addEventListener('click', (e) => {
  const angle = Math.atan2(
    e.clientY - canvas.height / 2,
    e.clientX - canvas.width / 2
  )

  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  }

  projectiles.push(new Projectile(x, y, 5, 'white', velocity))
})

startGameBtn.addEventListener('click', () => {
  init()
  animate()
  spawnEnemies()
  modalEl.style.display = 'none'
})
