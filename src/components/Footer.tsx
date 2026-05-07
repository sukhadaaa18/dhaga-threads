import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import { CATEGORIES, CATEGORY_META } from "@/data/products";
import logo from "@/assets/dhaga-logo.jpeg";
import { BRAND_CONFIG } from "@/config/brand";

export const Footer = () => {
  return (
    <footer className="mt-20 bg-secondary/40 border-t border-border/60 relative overflow-hidden">
      <div className="absolute inset-0 motif-bg opacity-40" />
      <div className="container relative py-14 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border border-primary/40 bg-card">
              <img src={logo} alt="Dhaga" className="w-full h-full object-cover" />
            </span>
            <h3 className="font-serif text-3xl font-bold uppercase tracking-wider">DHAGA</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Elegance woven in every thread. Handcrafted Indian wear for the modern soul.
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-primary mb-4">Shop</h4>
          <ul className="space-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c}>
                <Link to={CATEGORY_META[c].path} className="hover:text-primary transition-colors">
                  {CATEGORY_META[c].label}
                </Link>
              </li>
            ))}
            <li><Link to="/new-arrivals" className="hover:text-primary transition-colors">New Arrivals</Link></li>
            <li><Link to="/sale" className="hover:text-primary transition-colors">Sale</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-primary mb-4">House of DHAGA</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Our Artisans</a></li>
            <li className="pt-2">
              <p className="text-[10px] uppercase tracking-widest text-primary mb-1">Visit Our Atelier</p>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                {BRAND_CONFIG.contact.address}
              </p>
            </li>

          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-primary mb-4">Stay in touch</h4>
          <p className="text-sm text-muted-foreground mb-4">Receive seasonal lookbooks and private previews.</p>
          <form className="flex border-b border-border focus-within:border-primary transition-colors">
            <input
              type="email"
              placeholder="your@email.com"
              className="bg-transparent flex-1 py-2 outline-none text-sm placeholder:text-muted-foreground/60"
            />
            <button className="text-xs uppercase tracking-[0.2em] text-primary">Join</button>
          </form>
          <div className="mt-8">
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-primary mb-4 font-bold">Connect With Us</h4>
            <div className="flex gap-4 text-foreground/70">
              {BRAND_CONFIG.social.instagram && (
                <a 
                  href={BRAND_CONFIG.social.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Instagram" 
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-all duration-300 bg-card/50"
                >
                  <Instagram size={18} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 relative">
        <div className="container py-5 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} DHAGA Atelier. Handwoven with love.</p>
          <p className="font-serif italic">Elegance Woven in Every Thread</p>
        </div>
      </div>
    </footer>
  );
};
