import LoginForm from './components/LoginForm';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          SW Task Manager
        </h1>
        <p className="text-gray-600 mb-8">
          Система управления задачами
        </p>
        <LoginForm />
      </div>
    </div>
  );
}

export default App;