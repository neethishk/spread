import { useEffect } from 'react'
import { useStore } from './store'
import { useShallow } from 'zustand/react/shallow'
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import Templates from './pages/Templates'
import Auth from './pages/Auth'
import Projects from './pages/Projects'
import CsvUpload from './pages/CsvUpload'
import Editor from './pages/editor/index'

export default function App() {
  const { screen, initAuth } = useStore(useShallow((s) => ({ screen: s.screen, initAuth: s.initAuth })))

  useEffect(() => { initAuth() }, [initAuth])

  if (screen === 'upload') return <Home />
  if (screen === 'pricing') return <Pricing />
  if (screen === 'templates') return <Templates />
  if (screen === 'signin' || screen === 'signup') return <Auth />
  if (screen === 'projects') return <Projects />
  if (screen === 'csvUpload') return <CsvUpload />
  if (screen === 'editor') return <Editor />
  return <Home />
}
