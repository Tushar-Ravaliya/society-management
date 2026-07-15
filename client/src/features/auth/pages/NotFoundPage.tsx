import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-aura p-4">
      <div className="text-center max-w-md">
        <h1 className="font-display text-8xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-charcoal mb-2">Page Not Found</h2>
        <p className="text-charcoal-muted mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button variant="primary" onClick={() => navigate('/dashboard')} className="w-full sm:w-auto">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
