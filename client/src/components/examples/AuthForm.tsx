import AuthForm from '../AuthForm';
import actionImage from '@assets/generated_images/Football_celebration_action_shot_663c6e0e.png';

export default function AuthFormExample() {
  return (
    <div 
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${actionImage})` }}
    >
      <div className="absolute inset-0 bg-background/80" />
      <div className="relative z-10">
        <AuthForm
          onLogin={(email, password) => console.log('Login:', email, password)}
          onRegister={(email, password) => console.log('Register:', email, password)}
        />
      </div>
    </div>
  );
}
