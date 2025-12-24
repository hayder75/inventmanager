import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, ShoppingBag } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-primary-900 text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Info */}
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="bg-brand text-white p-2 rounded-xl">
                                <ShoppingBag size={24} />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">
                                Real<span className="text-brand-light">Bright</span>
                            </span>
                        </Link>
                        <p className="text-primary-300 mb-6">
                            Your trusted partner for quality goods and services. We bring excellence to your doorstep with our premium inventory system.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 bg-primary-800 rounded-full hover:bg-brand transition-colors">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="p-2 bg-primary-800 rounded-full hover:bg-brand transition-colors">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="p-2 bg-primary-800 rounded-full hover:bg-brand transition-colors">
                                <Instagram size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Quick Links</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/" className="text-primary-300 hover:text-brand-light transition-colors">Home</Link>
                            </li>
                            <li>
                                <Link href="#about" className="text-primary-300 hover:text-brand-light transition-colors">About Us</Link>
                            </li>
                            <li>
                                <Link href="#products" className="text-primary-300 hover:text-brand-light transition-colors">Goods & Services</Link>
                            </li>
                            <li>
                                <Link href="#contact" className="text-primary-300 hover:text-brand-light transition-colors">Contact</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-primary-300">
                                <MapPin size={20} className="text-brand-light shrink-0" />
                                <span>123 Business Avenue, Tech District, City, Country</span>
                            </li>
                            <li className="flex items-center gap-3 text-primary-300">
                                <Phone size={20} className="text-brand-light shrink-0" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-3 text-primary-300">
                                <Mail size={20} className="text-brand-light shrink-0" />
                                <span>info@realbright.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Newsletter</h3>
                        <p className="text-primary-300 mb-4">Subscribe to get the latest updates and offers.</p>
                        <form className="flex flex-col gap-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="px-4 py-3 bg-primary-800 border border-primary-700 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:border-brand transition-colors"
                            />
                            <button className="px-4 py-3 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition-colors">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-primary-800 pt-8 text-center text-primary-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} Real Bright Trading. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
