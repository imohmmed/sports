import { useLocation } from "wouter";
import AuthForm from "@/components/AuthForm";
import actionImage from "@assets/generated_images/Football_celebration_action_shot_663c6e0e.png";

export default function Auth() {
  const [, setLocation] = useLocation();

  const handleLogin = (email: string, password: string) => {
    console.log('Login:', email, password);
    setLocation('/dashboard');
  };

  const handleRegister = (email: string, password: string) => {
    console.log('Register:', email, password);
    setLocation('/dashboard');
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${actionImage})` }}
    >
      <div className="absolute inset-0 bg-background/80" />
      <div className="relative z-10">
        <AuthForm
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      </div>
    </div>
  );
}
