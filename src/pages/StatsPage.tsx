import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Rocket, Award, Users, MapPin, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const marketStats = {
    marketSize: {
      current: "$28.11 billion (2024)",
      projected: "$82.37 billion (2034)",
      growth: "25% CAGR"
    },
    adoption: {
      noCodeApps: "65% of all app development by 2025",
      businessUse: "30% of businesses using no-code platforms",
      successRate: "40% higher success rate vs traditional coding"
    },
    lovableSpecific: {
      arr: "$50M ARR (April 2025)",
      growth: "0 to $10M ARR in 60 days",
      users: "30,000+ paying customers",
      satisfaction: "Higher retention than ChatGPT"
    }
};

const revenueData = [
    { name: '1 month', 'No-Code': 1000, 'Traditional': 0 },
    { name: '3 months', 'No-Code': 15000, 'Traditional': 2000 },
    { name: '6 months', 'No-Code': 40000, 'Traditional': 10000 },
    { name: '12 months', 'No-Code': 100000, 'Traditional': 35000 },
];

const timeToMarketData = [
    { name: 'MVP', 'No-Code': 1, 'Traditional': 6 },
    { name: 'Full App', 'No-Code': 3, 'Traditional': 12 },
    { name: 'Iteration', 'No-Code': 0.25, 'Traditional': 1 },
];

const successRateData = [
    { name: 'Lovable', rate: 75 },
    { name: 'Bubble', rate: 60 },
    { name: 'Webflow', rate: 55 },
    { name: 'Other', rate: 45 },
];

const geoData = [
    { name: 'North America', businesses: 4500 },
    { name: 'Europe', businesses: 3200 },
    { name: 'Asia', businesses: 1800 },
    { name: 'South America', businesses: 800 },
    { name: 'Africa', businesses: 400 },
    { name: 'Oceania', businesses: 300 },
];

const inspirationData = {
    opportunityWindow: "The Golden Age of No-Code is NOW",
    barriers: "Lowest barriers to entry in history",
    competition: "Traditional devs stuck in old paradigms",
    timing: "First-mover advantage still available",
    tools: "AI-powered tools like Lovable = 20x productivity"
};

const StatsPage = () => {
  // A simple animated counter component
  const AnimatedCounter = ({ value, label }: { value: string; label: string }) => (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-brand">{value}</div>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-background to-secondary text-center">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-extrabold mb-4">The No-Code Revolution</h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
                    Why NOW is Your Time to Build. While others debate, you can build.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <AnimatedCounter value="$28B+" label="Market Size" />
                    <AnimatedCounter value="65%" label="App Dev by 2025" />
                    <AnimatedCounter value="40%" label="Higher Success Rate" />
                    <AnimatedCounter value="30k+" label="Lovable Customers" />
                </div>
            </div>
        </section>

        {/* Market Reality Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Market Reality Check</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-card/80 backdrop-blur-sm border-border/20">
                <CardHeader>
                  <CardTitle className="flex items-center"><TrendingUp className="mr-2 h-6 w-6 text-brand" /> Market Size</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-muted-foreground">
                  <p>Current: <span className="font-semibold text-primary">{marketStats.marketSize.current}</span></p>
                  <p>Projected (2034): <span className="font-semibold text-primary">{marketStats.marketSize.projected}</span></p>
                  <p>Growth Rate: <span className="font-semibold text-primary">{marketStats.marketSize.growth}</span></p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur-sm border-border/20">
                <CardHeader>
                  <CardTitle className="flex items-center"><Rocket className="mr-2 h-6 w-6 text-brand" /> Platform Adoption</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-muted-foreground">
                  <p>No-Code Apps: <span className="font-semibold text-primary">{marketStats.adoption.noCodeApps}</span></p>
                  <p>Business Use: <span className="font-semibold text-primary">{marketStats.adoption.businessUse}</span></p>
                  <p>Success Rate: <span className="font-semibold text-primary">{marketStats.adoption.successRate}</span></p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur-sm border-border/20">
                <CardHeader>
                  <CardTitle className="flex items-center"><Award className="mr-2 h-6 w-6 text-brand" /> Lovable's Rise</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-muted-foreground">
                  <p>ARR: <span className="font-semibold text-primary">{marketStats.lovableSpecific.arr}</span></p>
                  <p>Hyper-Growth: <span className="font-semibold text-primary">{marketStats.lovableSpecific.growth}</span></p>
                  <p>Users: <span className="font-semibold text-primary">{marketStats.lovableSpecific.users}</span></p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Interactive Charts */}
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Inspirational Insights</h2>
                <div className="grid lg:grid-cols-2 gap-12">
                    <Card className="bg-card/80 backdrop-blur-sm border-border/20">
                        <CardHeader><CardTitle>Revenue Potential (First Year)</CardTitle></CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={revenueData}>
                                    <defs>
                                      <linearGradient id="gradientCyber" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="hsl(var(--primary-electric))" />
                                        <stop offset="100%" stopColor="hsl(var(--primary-cyber))" />
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" />
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                                    <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} stroke="hsl(var(--muted-foreground))"/>
                                    <Tooltip
                                        formatter={(value) => `$${Number(value).toLocaleString()}`}
                                        contentStyle={{ backgroundColor: 'hsl(var(--background) / 0.8)', border: '1px solid hsl(var(--border) / 0.2)' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="No-Code" stroke="url(#gradientCyber)" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="Traditional" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/80 backdrop-blur-sm border-border/20">
                        <CardHeader><CardTitle>Time to Market (Months)</CardTitle></CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={timeToMarketData}>
                                    <defs>
                                      <linearGradient id="gradientMatrix" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="hsl(var(--primary-matrix))" />
                                        <stop offset="100%" stopColor="hsl(var(--primary-electric))" />
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" />
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))"/>
                                    <YAxis stroke="hsl(var(--muted-foreground))"/>
                                    <Tooltip 
                                        formatter={(value) => `${value} months`}
                                        contentStyle={{ backgroundColor: 'hsl(var(--background) / 0.8)', border: '1px solid hsl(var(--border) / 0.2)' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="No-Code" fill="url(#gradientMatrix)" />
                                    <Bar dataKey="Traditional" fill="hsl(var(--muted-foreground))" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                     <Card className="bg-card/80 backdrop-blur-sm border-border/20">
                        <CardHeader><CardTitle>Platform Success Rate (%)</CardTitle></CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={successRateData} layout="vertical">
                                     <defs>
                                      <linearGradient id="gradientNeural" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="hsl(var(--primary-neural))" />
                                        <stop offset="100%" stopColor="hsl(var(--primary-cyber))" />
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)"/>
                                    <XAxis type="number" stroke="hsl(var(--muted-foreground))"/>
                                    <YAxis type="category" dataKey="name" width={80} stroke="hsl(var(--muted-foreground))"/>
                                    <Tooltip 
                                        formatter={(value) => `${value}%`}
                                        contentStyle={{ backgroundColor: 'hsl(var(--background) / 0.8)', border: '1px solid hsl(var(--border) / 0.2)' }}
                                    />
                                    <Bar dataKey="rate" fill="url(#gradientNeural)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/80 backdrop-blur-sm border-border/20">
                        <CardHeader><CardTitle>Geographic Success Distribution</CardTitle></CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={geoData}>
                                     <defs>
                                      <linearGradient id="gradientElectric" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="hsl(var(--primary-electric))" />
                                        <stop offset="100%" stopColor="hsl(var(--primary-neural))" />
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)"/>
                                    <XAxis dataKey="name" tick={{fontSize: 12}} angle={-25} textAnchor="end" height={60} stroke="hsl(var(--muted-foreground))"/>
                                    <YAxis stroke="hsl(var(--muted-foreground))"/>
                                    <Tooltip 
                                      contentStyle={{ backgroundColor: 'hsl(var(--background) / 0.8)', border: '1px solid hsl(var(--border) / 0.2)' }}
                                    />
                                    <Bar dataKey="businesses" fill="url(#gradientElectric)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

        {/* Inspiration & Motivation */}
        <section className="py-16 md:py-24 bg-muted/40">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Opportunity Window</h2>
                 <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">{inspirationData.opportunityWindow}</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
                    <div className="bg-background p-6 rounded-lg shadow">
                        <Users className="h-8 w-8 text-brand mb-3" />
                        <h4 className="font-bold mb-2">Beat Competition</h4>
                        <p className="text-sm text-muted-foreground">{inspirationData.competition}</p>
                    </div>
                    <div className="bg-background p-6 rounded-lg shadow">
                        <Target className="h-8 w-8 text-brand mb-3" />
                        <h4 className="font-bold mb-2">First Mover Advantage</h4>
                        <p className="text-sm text-muted-foreground">{inspirationData.timing}</p>
                    </div>
                    <div className="bg-background p-6 rounded-lg shadow">
                        <Rocket className="h-8 w-8 text-brand mb-3" />
                        <h4 className="font-bold mb-2">20x Productivity</h4>
                        <p className="text-sm text-muted-foreground">{inspirationData.tools}</p>
                    </div>
                    <div className="bg-background p-6 rounded-lg shadow">
                        <MapPin className="h-8 w-8 text-brand mb-3" />
                        <h4 className="font-bold mb-2">Low Barriers</h4>
                        <p className="text-sm text-muted-foreground">{inspirationData.barriers}</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Call To Action */}
        <section className="py-20 bg-brand text-brand-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join the No-Code Revolution
            </h2>
            <p className="text-lg md:text-xl opacity-90 mb-10 max-w-3xl mx-auto">
              The opportunity is NOW. While others debate, you can build. Start your CodeSense journey today and turn your ideas into reality.
            </p>
            <Button asChild variant="secondary" size="lg" className="bg-white text-brand hover:bg-gray-100 px-10 py-4 text-lg font-semibold">
              <Link to="/auth">Get Started for Free</Link>
            </Button>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default StatsPage;
