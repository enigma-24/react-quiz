import { useEffect } from 'react';
import Header from './Header';
import Main from './Main';
import { useReducer } from 'react';

const initialState = {
  questions: [],
  status: 'loading', //status can be: loading, error, ready, active, finished
};

const reducer = (currentState, action) => {
  switch (action.type) {
    case 'dataReceived':
      return { ...currentState, status: 'ready', questions: action.payload };
    case 'dataFailed':
      return { ...currentState, status: 'error' };
    default:
      throw new Error('Unknown Action');
  }
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    fetch('http://localhost:8000/questions')
      .then((response) => response.json())
      .then((data) => dispatch({ type: 'dataReceived', payload: data }))
      .catch((error) => dispatch({ type: 'dataFailed' }));
  }, []);

  return (
    <div className='app'>
      <Header />
      <Main>
        <p>1/15</p>
        <p>Question?</p>
      </Main>
    </div>
  );
};

export default App;
