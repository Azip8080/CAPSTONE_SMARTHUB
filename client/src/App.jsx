import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import SDGIMG from './assets/438-4388580_un-sustainable-development-goals-circle-hd-png-download-removebg-preview.png'
import Button from './components/Button.jsx'
import './App.css'
import style from './components/Button.module.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className='navBar'> 
          <div className='logo-div'>
            <img src={SDGIMG} className='sdgLogo'></img>
          </div>

          <div className='sdg-title'>
            <p className='sdgTitle'>SUSTAINABLE DEVELOPMENT CITY OF MANILA</p>
          </div>

          <div className='navbar-middle'>
            <Button className={style.sdgButton}>17 SGDS</Button>
            <Button className={style.sdgAnalytics}>ANALYTICS</Button>
            <Button className={style.sdgHighlights}>SDG HIGHLIGHTS</Button>
            <Button className={style.sdgEvents}>EVENTS</Button>
            <Button className={style.sdgHub}>KNOWLEDGE HUB</Button>
          </div>

          <div className='navbar-right'>
            <Button className={style.signIn}>Sign In</Button>
            <Button className={style.signUp}>Sign Up</Button>
          </div>
        </div>
      </section>
    </>
  )
}

export default App
