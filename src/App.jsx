import './App.css'
import Loader from './components/Loader'
import { useAuth } from './context/AuthContext'
import { WorkspaceProvider } from './context/WorkspaceContext'
import Index from './pages/Routes'

const App = () => {
  const { isAppLoading } = useAuth()
  return (
    <>
      {isAppLoading ? (
        <Loader />
      ) : (
        <WorkspaceProvider>
          <Index />
        </WorkspaceProvider>
      )}
    </>
  )
}

export default App
