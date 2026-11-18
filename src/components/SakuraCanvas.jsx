import { useEffect, useRef } from 'react'

export default function SakuraCanvas({ active = true, density = 35 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    // Sakura petal class
    class Petal {
      constructor() {
        this.reset(true)
      }

      reset(initial = false) {
        this.x = Math.random() * width
        this.y = initial ? Math.random() * height : -20
        this.size = Math.random() * 9 + 6
        this.speedX = Math.random() * 1.5 - 0.5 + 0.3 // slight wind to right
        this.speedY = Math.random() * 1.2 + 0.8
        this.rotation = Math.random() * Math.PI * 2
        this.rotationSpeed = (Math.random() - 0.5) * 0.03
        this.swing = Math.random() * 2 * Math.PI
        this.swingSpeed = Math.random() * 0.02 + 0.01
        this.swingAmp = Math.random() * 1.5 + 0.5
        this.opacity = Math.random() * 0.5 + 0.45
        // Pink / rose gradient shades
        this.colorIndex = Math.floor(Math.random() * 3)
      }

      update() {
        this.swing += this.swingSpeed
        this.x += this.speedX + Math.sin(this.swing) * this.swingAmp
        this.y += this.speedY
        this.rotation += this.rotationSpeed

        if (this.y > height + 20 || this.x > width + 40 || this.x < -40) {
          this.reset(false)
        }
      }

      draw(context) {
        context.save()
        context.translate(this.x, this.y)
        context.rotate(this.rotation)
        context.globalAlpha = this.opacity

        // Draw soft petal shape
        context.beginPath()
        context.moveTo(0, 0)
        context.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size, this.size / 3, 0, this.size)
        context.bezierCurveTo(this.size, this.size / 3, this.size / 2, -this.size / 2, 0, 0)
        context.closePath()

        const colors = [
          'rgba(255, 183, 213, 0.85)',
          'rgba(254, 205, 226, 0.9)',
          'rgba(251, 143, 185, 0.75)'
        ]
        context.fillStyle = colors[this.colorIndex]
        context.fill()

        context.restore()
      }
    }

    const petals = Array.from({ length: density }, () => new Petal())

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      for (let i = 0; i < petals.length; i++) {
        petals[i].update()
        petals[i].draw(ctx)
      }
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [active, density])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="sakura-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2
      }}
    />
  )
}
