import { useEffect } from 'react';
import { useReducer } from 'react';
import Header from './Header';
import Main from './Main';
import Loader from './Loader';
import Error from './Error';
import StartScreen from './StartScreen';
import Question from './Question';
import NextButton from './NextButton';
import Progress from './Progress';
import FinishScreen from './FinishScreen';
import Footer from './Footer';
import Timer from './Timer';

const SECS_PER_QUESTION = 30;

const initialState = {
  questions: [],
  status: 'loading', //status can be: loading, error, ready, active, finished
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
  secondsRemaining: null,
};

const reducer = (currentState, action) => {
  switch (action.type) {
    case 'dataReceived':
      return { ...currentState, status: 'ready', questions: action.payload };
    case 'dataFailed':
      return { ...currentState, status: 'error' };
    case 'start':
      return {
        ...currentState,
        status: 'active',
        secondsRemaining: currentState.questions.length * SECS_PER_QUESTION,
      };
    case 'newAnswer':
      const question = currentState.questions.at(currentState.index);
      return {
        ...currentState,
        answer: action.payload,
        points:
          question.correctOption === action.payload
            ? currentState.points + question.points
            : currentState.points,
      };
    case 'nextQuestion':
      return { ...currentState, answer: null, index: currentState.index + 1 };
    case 'finish':
      return {
        ...currentState,
        status: 'finished',
        highscore:
          currentState.points > currentState.highscore
            ? currentState.points
            : currentState.highscore,
      };
    case 'restart':
      return {
        ...initialState,
        questions: currentState.questions,
        status: 'ready',
      };
    case 'tick':
      return {
        ...currentState,
        secondsRemaining: currentState.secondsRemaining - 1,
        status:
          currentState.secondsRemaining === 0
            ? 'finished'
            : currentState.status,
      };
    default:
      throw new Error('Unknown Action');
  }
};

const App = () => {
  const [
    { questions, status, index, answer, points, highscore, secondsRemaining },
    dispatch,
  ] = useReducer(reducer, initialState);

  const numQuestions = questions.length;
  const maxPossiblePoints = questions.reduce(
    (accumulator, currValue) => accumulator + currValue.points,
    0
  );
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
        {status === 'active' && (
          <>
            <Progress
              index={index}
              numQuestions={numQuestions}
              points={points}
              maxPossiblePoints={maxPossiblePoints}
              answer={answer}
            />
            <Question
              question={questions[index]}
              dispatch={dispatch}
              answer={answer}
            />
            <Footer>
              <NextButton
                index={index}
                numQuestions={numQuestions}
                dispatch={dispatch}
                answer={answer}
              />
              <Timer dispatch={dispatch} secondsRemaining={secondsRemaining} />
            </Footer>
          </>
        )}
        {status === 'finished' && (
          <FinishScreen
            points={points}
            maxPossiblePoints={maxPossiblePoints}
            highscore={highscore}
            dispatch={dispatch}
          />
        )}
      </Main>
    </div>
  );
};

export default App;
