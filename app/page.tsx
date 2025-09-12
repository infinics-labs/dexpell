import { LandingPage } from '@/components/landing-page';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

export default function Page() {
  return (
    <div className="relative">
      {/* Admin Panel Access Button */}
      <div className="absolute top-4 right-4 z-10">
        <Link href="/admin">
          <Button variant="outline" className="bg-background/80 backdrop-blur-sm">
            <Shield className="mr-2 h-4 w-4" />
            Admin Panel
          </Button>
        </Link>
      </div>
      
      <LandingPage />
    </div>
  );
}
