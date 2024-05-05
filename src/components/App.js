import { useEffect } from 'react';
import { useReducer } from 'react';
import Header from './Header';
import Main from './Main';
import Loader from './Loader';
import Error from './Error';
import StartScreen from './StartScreen';
import Question from './Question';

const initialState = {
  questions: [],
  status: 'loading', //status can be: loading, error, ready, active, finished
  index: 0,
};

const reducer = (currentState, action) => {
  switch (action.type) {
    case 'dataReceived':
      return { ...currentState, status: 'ready', questions: action.payload };
    case 'dataFailed':
      return { ...currentState, status: 'error' };
    case 'start':
      return { ...currentState, status: 'active' };
    default:
      throw new Error('Unknown Action');
  }
};

const App = () => {
  const [{ questions, status, index }, dispatch] = useReducer(reducer, initialState);

  const numQuestions = questions.length;

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
        {status === 'loading' && <Loader />}
        {status === 'error' && <Error />}
        {status === 'ready' && (
          <StartScreen numQuestions={numQuestions} dispatch={dispatch} />
        )}
        {status === 'active' && <Question question={questions[index]} />}
      </Main>
    </div>
  );
};

export default App;
