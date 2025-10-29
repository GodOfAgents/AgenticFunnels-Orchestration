import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link as WaspRouterLink, routes } from '@src/lib/router';
import { AuthPageLayout } from "./AuthPageLayout";

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement real auth
    // For now, just navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="your@email.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
      >
        Log In
      </button>
    </form>
  );
}

export default function Login() {
  return (
    <AuthPageLayout>
      <LoginForm />
      <br />
      <span className="text-sm font-medium text-gray-900 dark:text-gray-900">
        Don't have an account yet?{" "}
        <WaspRouterLink to={routes.LandingPageRoute.to} className="underline">
          go to home
        </WaspRouterLink>
        .
      </span>
    </AuthPageLayout>
  );
}
