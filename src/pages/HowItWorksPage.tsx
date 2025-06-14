
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Rocket,
  Zap,
  Target,
  Lightbulb,
  Repeat,
  Shield,
  TrendingUp,
  Search,
  Briefcase,
  UserMinus,
  ShieldAlert,
  TrendingDown,
  Clock,
  Trophy,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

const HowItWorksPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        {/* 1. Hero Section Enhancement */}
        <section className="py-20 md:py-32 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-cyber opacity-20" />
          <div className="container mx-auto px-4 text-center relative">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-cyber to-primary-electric">
              How CodeSense + Lovable = <br /> Unstoppable No-Code Development
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto">
              Lovable helps you build faster. CodeSense ensures you build better. Together, they're the complete solution for entrepreneurial success.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16 md:py-24 space-y-24">
          {/* 2. Strategic Partnership Section */}
          <section className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Why Lovable + CodeSense is the Perfect Partnership</h2>
            <p className="text-muted-foreground mb-8">
              Lovable has revolutionized no-code development by making it possible for anyone to build sophisticated applications through AI-powered prompts. Their focus is crystal clear: democratize software creation and turn entrepreneurs' ideas into reality at lightning speed.
            </p>
            <p className="text-muted-foreground mb-12">
              But here's the entrepreneur's dilemma: <span className="font-semibold text-foreground">Speed vs. Quality</span>. While Lovable excels at rapid prototyping and idea execution, the faster you build, the more critical it becomes to ensure your code is production-ready, maintainable, and scalable. This is where CodeSense becomes indispensable.
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <Card className="bg-card/50 border-primary-matrix/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary-matrix/20 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="text-primary-matrix flex items-center gap-2">
                    <Rocket /> Lovable's Mission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Transform ideas into applications</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-primary-electric/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary-electric/20 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="text-primary-electric flex items-center gap-2">
                    <Shield /> CodeSense's Mission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Transform applications into successful businesses</p>
                </CardContent>
              </Card>
            </div>
            <p className="mt-12 text-lg font-semibold">Together, we create the complete entrepreneurial development stack.</p>
          </section>

          {/* 3. Complementary Strengths Section */}
          <section>
            <h2 className="text-3xl font-bold mb-12 text-center">Lovable Builds It. CodeSense Perfects It.</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-primary-matrix mb-4">Lovable Excels At:</h3>
                <ul className="space-y-4">
                  <li className="flex gap-4 items-start">
                    <Rocket className="h-6 w-6 text-primary-matrix mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Rapid Idea Validation</h4>
                      <p className="text-muted-foreground">Turn concepts into working prototypes in hours, not months</p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <Zap className="h-6 w-6 text-primary-matrix mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">AI-Powered Development</h4>
                      <p className="text-muted-foreground">Generate complex functionality through natural language prompts</p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <Target className="h-6 w-6 text-primary-matrix mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Entrepreneurial Focus</h4>
                      <p className="text-muted-foreground">Built specifically for founders who need to move fast</p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <Lightbulb className="h-6 w-6 text-primary-matrix mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Creative Problem Solving</h4>
                      <p className="text-muted-foreground">AI that understands business logic and user experience</p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <Repeat className="h-6 w-6 text-primary-matrix mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Iterative Development</h4>
                      <p className="text-muted-foreground">Quick pivots and feature additions as your vision evolves</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-primary-electric mb-4">CodeSense Ensures:</h3>
                 <ul className="space-y-4">
                  <li className="flex gap-4 items-start">
                    <Shield className="h-6 w-6 text-primary-electric mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Production Readiness</h4>
                      <p className="text-muted-foreground">Code that won't break when real users start using your app</p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <TrendingUp className="h-6 w-6 text-primary-electric mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Scalable Architecture</h4>
                      <p className="text-muted-foreground">Structure that grows with your business success</p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <Search className="h-6 w-6 text-primary-electric mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Hidden Issue Detection</h4>
                      <p className="text-muted-foreground">Find problems before your customers do</p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <Zap className="h-6 w-6 text-primary-electric mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Performance Optimization</h4>
                      <p className="text-muted-foreground">Apps that load fast and run smoothly under pressure</p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <Briefcase className="h-6 w-6 text-primary-electric mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Business Continuity</h4>
                      <p className="text-muted-foreground">Maintainable code that won't become technical debt</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. Entrepreneur's Journey Section */}
          <section className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">The Smart Entrepreneur's Development Strategy</h2>
            <p className="text-muted-foreground mb-12">Successful entrepreneurs understand a fundamental truth: the fastest path to market isn't always the safest path to success.</p>
            <div className="space-y-8 text-left">
              <Card className="transition-all duration-300 hover:shadow-lg hover:border-primary-matrix/50 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="text-lg"><span className="font-bold text-primary-matrix">Phase 1:</span> Idea to MVP (Lovable)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">You have a brilliant idea and need to validate it quickly. Lovable lets you build a functional prototype in days, test with real users, and iterate based on feedback. No six-month development cycles. No expensive development teams. Just pure speed.</p>
                </CardContent>
              </Card>
              <Card className="transition-all duration-300 hover:shadow-lg hover:border-primary-electric/50 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="text-lg"><span className="font-bold text-primary-electric">Phase 2:</span> MVP to Market (CodeSense)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Your idea is validated, users are interested, and now you need to scale. This is where 90% of no-code projects fail - not because the idea was wrong, but because the code wasn't ready for real-world demands.</p>
                  <p className="text-muted-foreground">CodeSense analyzes your Lovable-generated code and identifies:</p>
                  <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                    <li>Performance bottlenecks that will slow your app under load</li>
                    <li>Security vulnerabilities that could compromise user data</li>
                    <li>Architecture issues that will make future features difficult</li>
                    <li>Code patterns that will become expensive technical debt</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="transition-all duration-300 hover:shadow-lg hover:border-primary-neural/50 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="text-lg"><span className="font-bold text-primary-neural">Phase 3:</span> Market to Success (Lovable + CodeSense)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">With CodeSense ensuring your foundation is solid, you can return to Lovable with confidence, adding new features and expanding functionality knowing your code quality remains high.</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 5. Risk Mitigation Section */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center">Why Speed Without Quality is Actually Slower</h2>
            <p className="text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
              Every entrepreneur faces the same temptation: ship fast and fix later. But "later" has a way of becoming "never," and small issues compound into business-threatening problems.
            </p>
            <h3 className="text-xl font-semibold mb-8 text-center">The Hidden Costs of Unvetted Code:</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 border border-destructive/20 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-destructive/20 hover:-translate-y-1">
                <UserMinus className="h-10 w-10 text-destructive mb-4" />
                <h4 className="font-semibold mb-2">Customer Churn</h4>
                <p className="text-sm text-muted-foreground">53% of users abandon apps that take longer than 3 seconds to load</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 border border-destructive/20 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-destructive/20 hover:-translate-y-1">
                <ShieldAlert className="h-10 w-10 text-destructive mb-4" />
                <h4 className="font-semibold mb-2">Security Breaches</h4>
                <p className="text-sm text-muted-foreground">Average cost of a data breach: $4.45 million</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 border border-destructive/20 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-destructive/20 hover:-translate-y-1">
                <TrendingDown className="h-10 w-10 text-destructive mb-4" />
                <h4 className="font-semibold mb-2">Technical Debt</h4>
                <p className="text-sm text-muted-foreground">Bad code becomes 5x more expensive to fix after launch</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 border border-destructive/20 rounded-lg sm:col-start-1 lg:col-start-auto transition-all duration-300 hover:shadow-lg hover:shadow-destructive/20 hover:-translate-y-1">
                <Clock className="h-10 w-10 text-destructive mb-4" />
                <h4 className="font-semibold mb-2">Development Slowdown</h4>
                <p className="text-sm text-muted-foreground">Teams spend 60% of time debugging vs. building new features</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 border border-destructive/20 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-destructive/20 hover:-translate-y-1">
                <Trophy className="h-10 w-10 text-destructive mb-4" />
                <h4 className="font-semibold mb-2">Competitive Disadvantage</h4>
                <p className="text-sm text-muted-foreground">Competitors with better code quality ship features faster</p>
              </div>
            </div>
            <p className="mt-12 text-center font-semibold text-lg">CodeSense Prevents These Costly Mistakes Before They Happen</p>
            <p className="mt-4 text-center text-muted-foreground max-w-2xl mx-auto">
              Think of CodeSense as your technical co-founder - someone who reviews every line of code, catches potential issues, and ensures your application can handle success when it comes.
            </p>
          </section>

          {/* 6. Success Formula Section */}
          <section className="text-center">
            <h2 className="text-3xl font-bold mb-6">The Proven Formula for No-Code Success</h2>
            <Card className="p-8 bg-gradient-to-br from-primary-neural/10 to-transparent">
              <p className="text-xl md:text-2xl font-bold">
                <span className="text-primary-matrix">Lovable's AI Speed</span>
                <span className="text-2xl md:text-4xl mx-2 md:mx-4 text-muted-foreground">+</span>
                <span className="text-primary-electric">CodeSense's Quality Assurance</span>
                <span className="text-2xl md:text-4xl mx-2 md:mx-4 text-muted-foreground">=</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-cyber to-primary-electric">Market-Ready Applications</span>
              </p>
            </Card>
            <div className="grid md:grid-cols-3 gap-8 mt-12 text-left">
              <div>
                <h4 className="font-bold text-lg">SPEED</h4>
                <p className="text-muted-foreground">Lovable gets you to market 10x faster than traditional development</p>
              </div>
              <div>
                <h4 className="font-bold text-lg">QUALITY</h4>
                <p className="text-muted-foreground">CodeSense ensures your code can handle 10x more users</p>
              </div>
              <div>
                <h4 className="font-bold text-lg">RESULT</h4>
                <p className="text-muted-foreground">100x better chance of building a sustainable business</p>
              </div>
            </div>
            <Card className="mt-12 p-6 text-left transition-all duration-300 hover:shadow-lg">
              <p className="font-semibold mb-4">Companies using both rapid development AND quality assurance tools report:</p>
              <ul className="grid sm:grid-cols-2 gap-4">
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-accent-success flex-shrink-0" />40% faster time-to-market</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-accent-success flex-shrink-0" />60% fewer post-launch bugs</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-accent-success flex-shrink-0" />3x higher customer satisfaction scores</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-accent-success flex-shrink-0" />85% lower technical debt accumulation</li>
              </ul>
            </Card>
          </section>

          {/* 7. Workflow Integration Section */}
          <section>
            <h2 className="text-3xl font-bold mb-12 text-center">Seamless Integration: How They Work Together</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Build with Lovable", description: "Create your application using natural language prompts. Focus on features, functionality, and user experience.", step: 1 },
                { title: "Analyze with CodeSense", description: "Connect your GitHub repository to CodeSense. Get instant analysis of code quality, performance, and security.", step: 2 },
                { title: "Optimize and Iterate", description: "Use CodeSense insights to guide your next Lovable prompts. Build new features with confidence in your foundation.", step: 3 },
                { title: "Scale with Certainty", description: "Launch knowing your code can handle growth. Continue rapid development without accumulating technical debt.", step: 4 },
              ].map(item => (
                <Card key={item.step} className="text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary-electric/50">
                  <CardHeader>
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary-electric/20 flex items-center justify-center text-primary-electric font-bold text-xl mb-4">{item.step}</div>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* 8. Competitive Advantage Section */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center">Your Competitive Edge in the No-Code Race</h2>
            <p className="text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
              The no-code market is exploding. By 2025, 65% of all applications will be built with no-code tools. This creates an unprecedented opportunity - but also unprecedented competition. Your advantage isn't just building fast - it's building fast AND building right.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6 border-destructive/30 transition-all duration-300 hover:shadow-lg hover:shadow-destructive/20 hover:-translate-y-1">
                <h4 className="font-semibold text-destructive mb-4">Your competitors struggle with:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex gap-2 items-start"><span>❌</span> Apps that break under user load</li>
                  <li className="flex gap-2 items-start"><span>❌</span> Security vulnerabilities that damage trust</li>
                  <li className="flex gap-2 items-start"><span>❌</span> Performance issues that drive users away</li>
                  <li className="flex gap-2 items-start"><span>❌</span> Code that becomes impossible to maintain</li>
                </ul>
              </Card>
              <Card className="p-6 border-accent-success/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent-success/20 hover:-translate-y-1">
                <h4 className="font-semibold text-accent-success mb-4">You'll have:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex gap-2 items-start"><span>✅</span> Rock-solid applications that scale with your success</li>
                  <li className="flex gap-2 items-start"><span>✅</span> Code quality that impresses technical investors</li>
                  <li className="flex gap-2 items-start"><span>✅</span> Performance that delights users and drives retention</li>
                  <li className="flex gap-2 items-start"><span>✅</span> Architecture that makes new features easy to add</li>
                </ul>
              </Card>
            </div>
             <p className="mt-8 text-center font-semibold">The result? You don't just get to market first - you stay ahead.</p>
          </section>

          {/* 10. Trust Building Elements */}
          <section className="text-center">
            <Card className="p-8 bg-card/50 transition-all duration-300 hover:shadow-xl">
              <blockquote className="text-xl italic">
                "Lovable helped me build my MVP in two weeks. CodeSense helped me scale it to 10,000 users without a single crash. Together, they're unstoppable."
              </blockquote>
              <p className="mt-4 font-semibold">Sarah Chen, Founder of TaskFlow</p>
              <p className="text-sm text-muted-foreground">(now processing $2M annually)</p>
            </Card>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
              <p className="flex items-center justify-center gap-2"><CheckCircle className="h-4 w-4 text-accent-success flex-shrink-0" /> Trusted by 500+ Lovable developers</p>
              <p className="flex items-center justify-center gap-2"><CheckCircle className="h-4 w-4 text-accent-success flex-shrink-0" /> Analyzed 10,000+ no-code applications</p>
              <p className="flex items-center justify-center gap-2"><CheckCircle className="h-4 w-4 text-accent-success flex-shrink-0" /> Prevented $50M+ in technical debt</p>
              <p className="flex items-center justify-center gap-2"><CheckCircle className="h-4 w-4 text-accent-success flex-shrink-0" /> 99.8% issue detection accuracy</p>
            </div>
          </section>

          {/* 9. Call-To-Action Section */}
          <section className="text-center py-16 bg-gradient-to-tr from-primary-electric/10 via-background to-primary-cyber/10 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Ready to Build Your Success Story?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Thousands of entrepreneurs are already using Lovable to turn ideas into reality. But only a few are using CodeSense to turn those realities into lasting successes. Don't let poor code quality be the reason your great idea fails.
            </p>
            <p className="font-semibold mb-8">Start your CodeSense journey today and join the entrepreneurs who build to last.</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button asChild size="lg" className="tech-button px-8 py-3 text-lg">
                <Link to="/auth">Start Free Analysis <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-electric/50 text-primary-electric bg-transparent hover:bg-primary-electric/10 hover:text-primary-electric">
                <Link to="/stats">See Success Stories</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link to="/contact">Book Strategy Call</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
