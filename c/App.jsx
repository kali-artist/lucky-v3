import { useEffect, useState } from 'react'
import { MODULES, useLotteryData } from './data'
import LotteryApp from './components/LotteryApp'
import Admin from './components/Admin'

export default function App() {
  const { data, updateModule } = useLotteryData()
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  if (path.startsWith('/admin')) {
    return <Admin modules={MODULES} data={data} updateModule={updateModule} />
  }

  return <LotteryApp modules={MODULES} data={data} />
}
