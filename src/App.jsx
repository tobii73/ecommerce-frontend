import { AppRouter } from './routes/AppRouter'
import { AppNavbar } from './components/AppNavbar'
import { AppFooter } from './components/AppFooter'
import { BrowserRouter } from 'react-router-dom'

function App() {


  return (
    <BrowserRouter>
        <div className="app-shell">
            <AppNavbar />
            <div className="app-shell__content">
                <AppRouter />
            </div>
            <AppFooter />
        </div>
    </BrowserRouter>
  )
}

export default App
