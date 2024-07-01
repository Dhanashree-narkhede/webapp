import {Routes, Route, Link} from 'react-router-dom'
import Lobby from './screens/Lobby';
import Room from './screens/Room';
import GenerateLink from './screens/GenerateLink';
import {Toaster} from 'react-hot-toast'
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<GenerateLink/>} />
        <Route path='/room/:roomId' element={<Room/>}/>
        <Route path='/looby' element={<Lobby/>}/>
        
      </Routes>
      <Toaster position='top-center'/>
    </div>
  );
}

export default App;
