'use client';

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import { Package, Truck, ShieldCheck, Clock } from 'lucide-react';

export default function HomePage() {

  const features = [
    {
      icon: <Package className="w-8 h-8 text-brand" />,
      title: "Premium Quality",
      description: "We source only the finest products to ensure satisfaction."
    },
    {
      icon: <Truck className="w-8 h-8 text-brand" />,
      title: "Fast Delivery",
      description: "Efficient logistics network to get your goods on time."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-brand" />,
      title: "Secure Trading",
      description: "Trusted business practices and secure transactions."
    },
    {
      icon: <Clock className="w-8 h-8 text-brand" />,
      title: "24/7 Support",
      description: "Round-the-clock assistance for all your inquiries."
    }
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      <main>
        <Hero />

        {/* Featured Categories Section */}
        <section className="py-24 bg-background-subtle">
          <div className="max-w-[1600px] mx-auto px-8 sm:px-10 lg:px-16">
            <div className="text-center mb-20">
              <h2 className="text-brand font-bold tracking-wider uppercase mb-2">Browse by Category</h2>
              <h3 className="text-3xl font-bold text-primary-900">Featured Collections</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
              {[
                { 
                  name: 'Machinery', 
                  image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=1000', 
                  description: 'High-quality machinery and equipment' 
                },
                { 
                  name: 'Computer Accessory', 
                  image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=1000', 
                  description: 'Essential computer accessories and components' 
                },
                { 
                  name: 'Network Accessory', 
                  image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1000', 
                  description: 'Networking solutions and accessories' 
                },
                { 
                  name: 'Stationary Item', 
                  image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=1000', 
                  description: 'Office supplies and stationary items' 
                },
              ].map((category, index) => (
                <a
                  key={index}
                  href="/catalog"
                  className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-3"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent group-hover:from-black/90 transition-colors" />
                  <div className="absolute bottom-0 left-0 p-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                    <p className="text-white/90 text-base">{category.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="p-6 rounded-2xl bg-primary-50 hover:bg-white hover:shadow-card transition-all duration-300 border border-transparent hover:border-primary-100">
                  <div className="mb-4 bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-sm">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-primary-900 mb-2">{feature.title}</h3>
                  <p className="text-primary-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="py-20 bg-primary-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-brand/10 blur-3xl rounded-full translate-x-1/2" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-brand font-bold tracking-wider uppercase mb-2">About Us</h2>
                <h3 className="text-4xl font-bold mb-6">Building Trust Through Excellence</h3>
                <p className="text-primary-200 mb-6 text-lg leading-relaxed">
                  Real Bright Trading has been a leader in the industry, providing top-tier inventory solutions and goods to businesses worldwide. Our commitment to quality and integrity sets us apart.
                </p>
                <div className="grid grid-cols-2 gap-8 mt-8">
                  <div>
                    <h4 className="text-4xl font-bold text-brand mb-2">10+</h4>
                    <p className="text-primary-300">Years Experience</p>
                  </div>
                  <div>
                    <h4 className="text-4xl font-bold text-brand mb-2">5k+</h4>
                    <p className="text-primary-300">Happy Clients</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden bg-primary-800 border border-primary-700 relative group">
                  <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"
                    alt="Modern Office"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-primary-900/20 group-hover:bg-primary-900/0 transition-colors duration-500" />

                  <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-brand rounded-2xl -z-10" />
                  <div className="absolute -top-6 -right-6 w-48 h-48 bg-accent rounded-full -z-10 opacity-20" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section id="map" className="py-20 bg-gradient-to-b from-background-subtle to-white relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="w-full mx-auto px-2 sm:px-4 lg:px-6 relative z-10">
            <div className="text-center mb-6">
              <h2 className="text-brand font-bold tracking-wider uppercase mb-2">Find Us</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">Our Location</h3>
              <p className="text-primary-500 max-w-2xl mx-auto text-lg">
                Visit us at our location in Hawassa, Ethiopia
              </p>
            </div>
            
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-primary-100 hover:shadow-3xl transition-shadow duration-300 max-w-[98%] mx-auto">
              <div className="w-full h-[450px] md:h-[500px] relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent pointer-events-none z-10" />
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src="https://www.openstreetmap.org/export/embed.html?bbox=38.45%2C7.03%2C38.52%2C7.08&layer=mapnik&marker=7.055%2C38.485"
                  style={{ border: 0 }}
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              <div className="bg-gradient-to-r from-primary-50 to-white py-6 px-6 border-t border-primary-100">
                <div className="flex flex-col md:flex-row items-center justify-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-brand rounded-full animate-pulse" />
                    <p className="text-primary-900 text-lg font-bold">
                      Hawassa, Ethiopia
                    </p>
                  </div>
                  <span className="hidden md:block text-primary-300">•</span>
                  <p className="text-primary-600 text-sm">
                    Visit us at our location
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 bg-primary-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-primary-900 mb-8">Ready to Get Started?</h2>
            <p className="text-primary-500 mb-10 text-lg">
              Contact us today to learn more about our products and how we can help your business grow.
            </p>
            <button className="px-8 py-4 bg-brand text-white rounded-full font-bold hover:bg-brand-dark transition-all shadow-lg hover:shadow-brand/25 hover:-translate-y-1">
              Contact Support
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
