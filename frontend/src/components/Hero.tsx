import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-brand-light/20 rounded-full blur-3xl mix-blend-multiply animate-pulse" />
                <div className="absolute top-40 -left-20 w-[400px] h-[400px] bg-accent/20 rounded-full blur-3xl mix-blend-multiply animate-pulse delay-700" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-light/10 text-brand-dark text-sm font-medium mb-6 animate-fade-in">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                    </span>
                    Now Available Online
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary mb-6 animate-slide-up">
                    Quality Products, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light">
                        Trusted Service
                    </span>
                </h1>

                <p className="text-xl text-primary-500 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    Discover our premium collection of goods and services. Real Bright Trading brings you the best quality inventory with seamless service.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <Link
                        href="#products"
                        className="w-full sm:w-auto px-8 py-4 bg-brand text-white rounded-full font-semibold hover:bg-brand-dark transition-all shadow-lg hover:shadow-brand/25 hover:-translate-y-1 flex items-center justify-center gap-2"
                    >
                        Browse Collection
                        <ArrowRight size={20} />
                    </Link>
                    <Link
                        href="#contact"
                        className="w-full sm:w-auto px-8 py-4 bg-white text-primary rounded-full font-semibold border border-primary-200 hover:border-primary-300 hover:bg-primary-50 transition-all flex items-center justify-center"
                    >
                        Contact Us
                    </Link>
                </div>
            </div>
        </section>
    );
}
