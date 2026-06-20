import { useEffect } from 'react'
import { useStore } from './store'
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import Auth from './pages/Auth'
import Projects from './pages/Projects'
import Processing from './pages/Processing'
import Editor from './pages/editor/index'

export default function App() {
  const screen = useStore((s) => s.screen)
  const initAuth = useStore((s) => s.initAuth)

  useEffect(() => { initAuth() }, [initAuth])

  if (screen === 'upload') return <Home />
  if (screen === 'pricing') return <Pricing />
  if (screen === 'signin' || screen === 'signup') return <Auth />
  if (screen === 'projects') return <Projects />
  if (screen === 'processing') return <Processing />
  if (screen === 'editor') return <Editor />
  return <Home />
}
