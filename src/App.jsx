import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronRight, Plus, Zap } from 'lucide-react'

const colors = [
  { name: 'Volt', value: '#e5d414', dark: '#b3a300' },
  { name: 'Carbon', value: '#333a3b', dark: '#222727' },
  { name: 'Chalk', value: '#e7e6dd', dark: '#bebdb4' },
]

const features = [
  { id: '01', title: 'Power, on demand.', detail: 'A 750 W rear hub motor gets you up to speed before the light turns green.', position: { left: '33%', top: '59%' } },
  { id: '02', title: 'A battery that goes.', detail: 'The seamless 672 Wh pack is good for up to 80 miles between charges.', position: { left: '55%', top: '43%' } },
  { id: '03', title: 'Grip the city.', detail: 'Hydraulic disc brakes and 2.4” all-road tires. Ready for the road after the road.', position: { left: '78%', top: '76%' } },
]

function makeBike(scene, frameHex) {
  const bike = new THREE.Group()
  const frameMat = new THREE.MeshStandardMaterial({ color: frameHex, metalness: 0.52, roughness: 0.32 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x202627, metalness: 0.28, roughness: 0.53 })
  const rubberMat = new THREE.MeshStandardMaterial({ color: 0x1d2223, roughness: 0.9 })
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xb9b9b2, metalness: 0.72, roughness: 0.3 })
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x707675, metalness: 0.63, roughness: 0.42 })
  const lampMat = new THREE.MeshStandardMaterial({ color: 0xfbf8d8, emissive: 0xffe75e, emissiveIntensity: 1.3, roughness: 0.25 })
  const rear = new THREE.Vector3(-1.47, 0.75, 0)
  const crank = new THREE.Vector3(-0.32, 0.75, 0)
  const seat = new THREE.Vector3(-0.71, 1.61, 0)
  const head = new THREE.Vector3(0.69, 1.7, 0)
  const front = new THREE.Vector3(1.46, 0.75, 0)

  const tube = (start, end, radius, material = frameMat, radialSegments = 12) => {
    const direction = new THREE.Vector3().subVectors(end, start)
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), radialSegments), material)
    mesh.position.copy(start).add(end).multiplyScalar(0.5)
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
    mesh.castShadow = true
    bike.add(mesh)
  }
  const sphere = (point, radius, material) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 12), material)
    mesh.position.copy(point)
    bike.add(mesh)
  }
  const wheel = (x) => {
    const center = new THREE.Vector3(x, 0.75, 0)
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.073, 16, 72), rubberMat)
    tire.position.copy(center)
    tire.castShadow = true
    bike.add(tire)
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.57, 0.017, 8, 64), rimMat)
    rim.position.copy(center)
    bike.add(rim)
    for (let index = 0; index < 12; index += 1) {
      const angle = (Math.PI * 2 * index) / 12
      tube(new THREE.Vector3(x + Math.cos(angle) * 0.055, 0.75 + Math.sin(angle) * 0.055, 0), new THREE.Vector3(x + Math.cos(angle) * 0.55, 0.75 + Math.sin(angle) * 0.55, 0), 0.006, wireMat, 5)
    }
    sphere(center, 0.07, darkMat)
  }

  wheel(rear.x)
  wheel(front.x)
  tube(rear, crank, 0.032, wireMat)
  tube(rear, seat, 0.032)
  tube(crank, seat, 0.044)
  tube(seat, head, 0.04)
  tube(crank, head, 0.055)
  tube(head, front, 0.04, darkMat)
  tube(head, new THREE.Vector3(0.76, 2.12, 0), 0.054, darkMat)
  tube(new THREE.Vector3(0.76, 2.12, 0), new THREE.Vector3(1.05, 2.13, 0), 0.037, darkMat)
  tube(new THREE.Vector3(0.76, 2.12, 0), new THREE.Vector3(0.47, 2.13, 0), 0.037, darkMat)
  tube(new THREE.Vector3(-0.77, 1.59, 0), new THREE.Vector3(-0.83, 1.95, 0), 0.029, darkMat)
  tube(new THREE.Vector3(-1.05, 1.95, 0), new THREE.Vector3(-0.6, 1.95, 0), 0.042, darkMat)
  tube(new THREE.Vector3(0.70, 1.73, 0), new THREE.Vector3(1.07, 0.79, 0), 0.024, darkMat)
  tube(new THREE.Vector3(0.78, 1.73, 0), new THREE.Vector3(1.51, 0.8, 0), 0.024, darkMat)
  tube(new THREE.Vector3(-0.56, 1.52, 0.06), new THREE.Vector3(0.54, 1.67, 0.06), 0.073, darkMat)
  const crankRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.017, 8, 40), wireMat)
  crankRing.position.copy(crank).setZ(0.08)
  bike.add(crankRing)
  const chain = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.47, 0.88, 0.07), new THREE.Vector3(-1.45, 0.61, 0.07),
    new THREE.Vector3(-0.32, 0.56, 0.07), new THREE.Vector3(-0.32, 0.94, 0.07),
  ], true)
  bike.add(new THREE.Mesh(new THREE.TubeGeometry(chain, 72, 0.012, 5, true), wireMat))
  sphere(crank, 0.18, darkMat)
  const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.085, 20, 12), lampMat)
  headlight.position.set(1.08, 2.02, 0)
  bike.add(headlight)
  scene.add(bike)
  return { bike, frameMat }
}

function BikeScene({ color, hotspots = false, onHotspot }) {
  const canvasHost = useRef(null)
  const bikeRef = useRef(null)
  const pointerRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const host = canvasHost.current
    if (!host) return undefined
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80)
    camera.position.set(0, 2.22, 7.3)
    camera.lookAt(0, 1.15, 0)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.12
    host.appendChild(renderer.domElement)
    scene.add(new THREE.HemisphereLight(0xffffff, 0x929086, 2.1))
    const key = new THREE.DirectionalLight(0xffffff, 3.2)
    key.position.set(-3, 5, 6)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xffdf72, 1.1)
    fill.position.set(4, 3, -3)
    scene.add(fill)
    const { bike, frameMat } = makeBike(scene, color.value)
    bike.rotation.y = -0.12
    bikeRef.current = { bike, frameMat }
    const resize = () => {
      const width = host.clientWidth
      const height = host.clientHeight
      if (!width || !height) return
      camera.aspect = width / height
      camera.position.z = width < 580 ? 9.3 : 7.3
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    resize()
    let frame
    const render = () => {
      const pointer = pointerRef.current
      bike.rotation.y += ((-0.12 + pointer.x * 0.28) - bike.rotation.y) * 0.055
      bike.rotation.x += ((pointer.y * -0.1) - bike.rotation.x) * 0.055
      renderer.render(scene, camera)
      frame = requestAnimationFrame(render)
    }
    render()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => material.dispose())
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
      bikeRef.current = null
    }
  }, [])

  useEffect(() => {
    if (bikeRef.current) bikeRef.current.frameMat.color.set(color.value)
  }, [color])

  const handlePointerMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    pointerRef.current = { x: (event.clientX - bounds.left) / bounds.width - 0.5, y: (event.clientY - bounds.top) / bounds.height - 0.5 }
  }

  return (
    <div className="bike-stage" onPointerMove={handlePointerMove} onPointerLeave={() => { pointerRef.current = { x: 0, y: 0 } }}>
      <div className="bike-canvas" ref={canvasHost} aria-label="Interactive 3D rendering of the Velocity One electric bike" role="img" />
      {hotspots && features.map((feature) => <button className="hotspot" key={feature.id} style={feature.position} onClick={() => onHotspot(feature)} aria-label={`View feature: ${feature.title}`}><Plus size={15} strokeWidth={2.5} /></button>)}
    </div>
  )
}

function Speedometer() {
  const [speed, setSpeed] = useState(0)
  useEffect(() => {
    let frame
    const start = performance.now()
    const animate = (now) => {
      const progress = Math.min((now - start) / 1400, 1)
      setSpeed(Math.round(28 * (1 - (1 - progress) ** 3)))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])
  return (
    <div className="speedometer" aria-label={`${speed} miles per hour, maximum assisted speed`}>
      <div className="speedometer-top"><span>CLASS 3</span><Zap size={15} fill="currentColor" /></div>
      <div className="speed-readout"><span>{speed}</span><small>MPH</small></div>
      <svg className="speed-arc" viewBox="0 0 148 46" aria-hidden="true"><path className="speed-track" d="M7 42 A67 67 0 0 1 141 42" /><path className="speed-progress" d="M7 42 A67 67 0 0 1 141 42" /></svg>
      <div className="speed-footer"><span>0</span><span>THROTTLE / PEDAL ASSIST</span><span>28</span></div>
    </div>
  )
}

function App() {
  const [color, setColor] = useState(colors[0])
  const [activeFeature, setActiveFeature] = useState(null)
  const [formState, setFormState] = useState('idle')
  const [formMessage, setFormMessage] = useState('')
  const [drawing, setDrawing] = useState(false)
  const formRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setDrawing(true)
        observer.disconnect()
      }
    }, { threshold: 0.25 })
    const target = document.querySelector('.spec-route')
    if (target) observer.observe(target)
    return () => observer.disconnect()
  }, [])

  const chooseColor = (nextColor) => {
    setColor(nextColor)
    if (formRef.current) formRef.current.elements.color.value = nextColor.name
  }

  const submitPreorder = async (event) => {
    event.preventDefault()
    setFormState('submitting')
    setFormMessage('')
    const form = event.currentTarget
    const payload = Object.fromEntries(new FormData(form).entries())
    try {
      const response = await fetch('/api/preorders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Something went wrong. Please try again.')
      setFormState('success')
      setFormMessage(result.message)
      form.elements.name.value = ''
      form.elements.email.value = ''
    } catch (error) {
      setFormState('error')
      setFormMessage(error.message === 'Failed to fetch' ? 'Connect MongoDB to open pre-orders.' : error.message)
    }
  }

  return <>
    <header className="site-header">
      <a href="#top" className="wordmark" aria-label="Velocity home">V<span>.</span></a>
      <nav className="main-nav" aria-label="Main navigation"><a href="#details">The details</a><a href="#colors">Colors</a><a href="#compare">Compare</a></nav>
      <a className="header-cta" href="#reserve">Reserve yours <ArrowUpRight size={15} /></a>
    </header>
    <main>
      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> MADE FOR THE IN-BETWEEN</div>
          <h1>Take the<br /><span>long way.</span></h1>
          <p className="hero-subtitle">The city opens up when you stop watching the clock.</p>
          <div className="hero-actions"><a className="button button-dark" href="#reserve">Meet your next ride <ArrowRight size={16} /></a><a className="text-link" href="#details">Explore the bike <ArrowDown size={14} /></a></div>
          <div className="hero-footnote"><span>01 / 03</span><span className="footnote-line" /><span>THE VELOCITY ONE</span></div>
        </div>
        <div className="hero-visual">
          <div className="hero-visual-top"><span>BUILT FOR THE CITY</span><span>2025 / SERIES 01</span></div>
          <div className="bike-shadow" aria-hidden="true" />
          <BikeScene color={color} hotspots onHotspot={setActiveFeature} />
          {activeFeature && <div className="feature-popover" role="status"><button type="button" className="popover-close" onClick={() => setActiveFeature(null)} aria-label="Close feature"><span /></button><small>VELOCITY DETAIL / {activeFeature.id}</small><strong>{activeFeature.title}</strong><p>{activeFeature.detail}</p></div>}
          <Speedometer />
          <div className="hero-visual-bottom"><span>CLICK A DETAIL TO EXPLORE</span><span>SCROLL TO GET CLOSER ↓</span></div>
        </div>
        <div className="hero-aside" aria-hidden="true"><span>URBAN ELECTRIC / 2025</span><span>MOVE AT YOUR OWN PACE</span></div>
      </section>
      <section className="ticker" aria-label="Velocity product highlights"><span>THE NEW CITY STANDARD</span><i /><span>80 MILE RANGE</span><i /><span>750 W MOTOR</span><i /><span>ZERO BORING COMMUTES</span><i /><span>THE NEW CITY STANDARD</span></section>
      <section className="details-section" id="details">
        <div className="section-label"><span>01</span><span>ENGINEERED TO FEEL EASY</span><span className="label-rule" /></div>
        <div className="details-heading"><h2>More city.<br /><span>Less effort.</span></h2><p>Thoughtful engineering you feel in the ride, not the learning curve. Every component has one job: get you out there more often.</p></div>
        <div className={`spec-route ${drawing ? 'is-drawn' : ''}`}>
          <svg viewBox="0 0 1100 240" preserveAspectRatio="none" aria-hidden="true"><path d="M12 136 C140 136 100 43 238 43 S358 196 486 171 S636 57 740 93 S844 216 954 152 S1037 82 1088 82" /></svg>
          <div className="spec-node spec-node-one"><span>01</span></div><div className="spec-node spec-node-two"><span>02</span></div><div className="spec-node spec-node-three"><span>03</span></div><div className="spec-node spec-node-four"><span>04</span></div><div className="spec-node spec-node-five"><span>05</span></div>
        </div>
        <div className="spec-grid">
          <article className="spec-item"><span className="spec-number">01 / RANGE</span><strong>80 <em>mi</em></strong><p>Leave the charger at home. Get back when you feel like it.</p></article>
          <article className="spec-item"><span className="spec-number">02 / MOTOR</span><strong>750 <em>W</em></strong><p>A little help goes a long way. Especially uphill.</p></article>
          <article className="spec-item"><span className="spec-number">03 / SPEED</span><strong>28 <em>mph</em></strong><p>Class 3 pedal assist for keeping up, not catching up.</p></article>
          <article className="spec-item"><span className="spec-number">04 / CHARGE</span><strong>4.5 <em>hr</em></strong><p>From empty to full while you reset for tomorrow.</p></article>
          <article className="spec-item"><span className="spec-number">05 / WEIGHT</span><strong>55 <em>lb</em></strong><p>Built tough, balanced right. Easy to live with.</p></article>
        </div>
      </section>
      <section className="color-section" id="colors">
        <div className="color-copy">
          <div className="section-label section-label-light"><span>02</span><span>YOUR CITY, YOUR COLOR</span></div>
          <h2>Same ride.<br /><span>New mood.</span></h2>
          <p>Three finishes, all made to look better after a few miles of real life.</p>
          <div className="swatch-picker" role="group" aria-label="Choose a frame color">{colors.map((option) => <button key={option.name} className={`swatch ${color.name === option.name ? 'is-selected' : ''}`} style={{ '--swatch-color': option.value, '--swatch-border': option.dark }} onClick={() => chooseColor(option)} aria-label={`${option.name} frame color`} aria-pressed={color.name === option.name}>{color.name === option.name && <Check size={14} />}</button>)}</div>
          <div className="selected-color"><span>FRAME FINISH</span><strong>{color.name}<i style={{ background: color.value }} /></strong></div>
        </div>
        <div className="color-visual"><div className="color-edition"><span>VELOCITY ONE</span><span>FINISH 0{colors.indexOf(color) + 1}</span></div><BikeScene color={color} /><div className="color-caption"><span>Designed for the daily detour.</span><span>01 — 03</span></div></div>
      </section>
      <section className="compare-section" id="compare">
        <div className="section-label"><span>03</span><span>A BETTER WAY TO GET THERE</span><span className="label-rule" /></div>
        <div className="compare-heading"><h2>Do the math.<br /><span>Then do you.</span></h2><p>City trips add up. Here’s how a Velocity ride compares over one year of daily commuting.</p></div>
        <div className="comparison-table" role="table" aria-label="Annual commuting cost comparison">
          <div className="comparison-row table-heading" role="row"><span role="columnheader">YOUR DAILY RIDE</span><span role="columnheader">YEARLY COST¹</span><span role="columnheader">TIME BACK</span><span role="columnheader">GOOD FOR THE PLANET</span></div>
          <div className="comparison-row velocity-row" role="row"><span className="ride-label" role="cell"><b className="ride-marker marker-yellow" />Velocity One</span><span role="cell">$540</span><span className="positive" role="cell">+ 5.2 days</span><span className="positive" role="cell"><Check size={16} /> Yes</span></div>
          <div className="comparison-row" role="row"><span className="ride-label" role="cell"><b className="ride-marker marker-gray" />Car commute</span><span role="cell">$6,480</span><span role="cell">− 5.2 days</span><span role="cell">Not quite</span></div>
          <div className="comparison-row" role="row"><span className="ride-label" role="cell"><b className="ride-marker marker-white" />Ride share</span><span role="cell">$3,840</span><span role="cell">− 2.8 days</span><span role="cell">Sometimes</span></div>
        </div>
        <p className="table-note">¹ Based on a 10-mile round-trip commute, 5 days a week. Transit, parking and charging costs are estimates.</p>
      </section>
      <section className="reserve-section" id="reserve">
        <div className="reserve-art" aria-hidden="true"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><span className="orbit orbit-three" /><span className="reserve-number">V<span>.</span></span><span className="reserve-caption">DESIGNED TO GET LOST</span></div>
        <div className="reserve-content">
          <div className="section-label section-label-light"><span>04</span><span>YOUR NEXT CHAPTER STARTS HERE</span></div>
          <h2>Make room<br />for <span>more.</span></h2>
          <p className="reserve-intro">Get the first ride, first look, and first word when Velocity One is ready.</p>
          <form className="preorder-form" onSubmit={submitPreorder} ref={formRef}>
            <label htmlFor="name">YOUR NAME</label><input id="name" name="name" placeholder="Alex Morgan" required maxLength="100" autoComplete="name" />
            <label htmlFor="email">EMAIL ADDRESS</label><input id="email" name="email" type="email" placeholder="alex@example.com" required maxLength="254" autoComplete="email" />
            <input type="hidden" name="color" value={color.name} readOnly />
            <button className="button button-yellow" type="submit" disabled={formState === 'submitting'}>{formState === 'submitting' ? 'Saving your spot…' : 'Get on the list'} <ArrowRight size={16} /></button>
            <p className={`form-message ${formState}`} aria-live="polite">{formMessage || 'No spam. Just good news and the occasional detour.'}</p>
          </form>
        </div>
      </section>
    </main>
    <footer className="site-footer"><a href="#top" className="wordmark footer-mark">V<span>.</span></a><span>TAKE THE LONG WAY HOME.</span><span>© VELOCITY 2025</span><a href="#top" className="back-top" aria-label="Back to top">BACK TO TOP <ChevronRight size={13} className="back-icon" /></a></footer>
  </>
}

export default App
