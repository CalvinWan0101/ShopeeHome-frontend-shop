import './App.scss'
import LogIn from './LogIn'
import Seller from './Seller'
import Header from './Header'
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='' element={<Header />}>
            <Route path='/login' element={<LogIn />}></Route>
            <Route path='/Seller/:id' element={<Seller />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
