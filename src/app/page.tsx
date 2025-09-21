import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tractor, Truck, Store, User, Leaf, LogIn } from 'lucide-react';
import { placeholderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = placeholderImages.find(p => p.id === 'farm-hero');

  const roles = [
    {
      name: 'Farmer',
      icon: <Tractor className="h-12 w-12 text-primary" />,
      description: 'Manage your products, orders, and finances.',
      href: '/farmer',
    },
    {
      name: 'Distributor',
      icon: <Truck className="h-12 w-12 text-primary" />,
      description: 'Source from verified farmers and manage logistics.',
      href: '/distributor',
    },
    {
      name: 'Retailer',
      icon: <Store className="h-12 w-12 text-primary" />,
      description: 'Procure traceable products for your customers.',
      href: '/retailer',
    },
    {
      name: 'Consumer',
      icon: <User className="h-12 w-12 text-primary" />,
      description: 'Trace your food, connect with farmers.',
      href: '/consumer',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white font-headline">
                FarmSamridhi
            </h1>
        </div>
        <Button asChild>
            <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login / Sign Up
            </Link>
        </Button>
      </header>

      <main className="flex-grow">
        <section className="relative h-[60vh] flex items-center justify-center text-white">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 text-center p-4 mt-16">
            <h2 className="text-5xl md:text-7xl font-bold font-headline">
              Empowering Agriculture, Connecting Communities
            </h2>
            <p className="text-lg md:text-2xl mt-4 max-w-3xl mx-auto">
              A transparent ecosystem for farmers, distributors, retailers, and consumers, building trust from farm to table.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
              Who are you?
            </h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
                Select your role to access a dashboard tailored to your needs. FarmSamridhi provides unique tools and insights for every member of the agricultural supply chain.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {roles.map((role) => (
                <Link href="/login" key={role.name} className="block transform hover:-translate-y-2 transition-transform duration-300">
                    <Card className="h-full text-center hover:shadow-2xl hover:border-primary transition-shadow duration-300">
                      <CardHeader className="flex flex-col items-center">
                        {role.icon}
                        <CardTitle className="mt-4 text-2xl font-headline">
                          {role.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-6">{role.description}</p>
                         <Button variant="outline" tabIndex={-1}>
                          Go to Dashboard <span aria-hidden="true" className="ml-2">→</span>
                        </Button>
                      </CardContent>
                    </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-secondary text-secondary-foreground py-6">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} FarmSamridhi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
