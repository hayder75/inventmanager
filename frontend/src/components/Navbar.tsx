'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingBag, User } from 'lucide-react';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Goods & Services', href: '/catalog' },
        { name: 'New Updates', href: '/new' },
        { name: 'Find Us', href: '/#map' },
        { name: 'Contact', href: '/#contact' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white/80 backdrop-blur-md shadow-soft py-4'
                : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-brand text-white p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                            <ShoppingBag size={24} />
                        </div>
                        <span className={`text-2xl font-bold tracking-tight ${isScrolled ? 'text-primary' : 'text-primary'}`}>
                            Real<span className="text-brand">Bright</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-primary-600 hover:text-brand transition-colors relative group"
                            >
                                {link.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand transition-all duration-300 group-hover:w-full" />
                            </Link>
                        ))}
                        <Link
                            href="/login"
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            <User size={18} />
                            Staff Login
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg animate-fade-in">
                    <div className="flex flex-col p-4 gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="px-4 py-3 text-primary-600 hover:bg-primary-50 hover:text-brand rounded-lg font-medium transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="h-px bg-gray-100 my-2" />
                        <Link
                            href="/login"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-800 transition-colors"
                        >
                            <User size={18} />
                            Staff Login
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
