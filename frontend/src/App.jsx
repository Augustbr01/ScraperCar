import Dashboard from './modules/Dashboard'
import './App.css'
import Navbar from './components/Navbar'

function App() {

  return (
    <>
      <div className='bg-[#0A0A0A] min-h-screen overflow-x-hidden relative'>
        <div className='absolute z-0 -top-120 -right-55 w-200 h-200 bg-[#00FFFF]/30 rounded-full blur-[200px]'></div>

        
        <Dashboard />
        
        

      </div>
      
    </>
  )
}

export default App
