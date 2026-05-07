import { Link, useNavigate } from "react-router-dom";
import { Heart, Search, ShoppingBag, Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useShop } from "@/store/shop";
import { useAuth } from "@/store/useAuth";
import { cn } from "@/lib/utils";
import { CATEGORIES, CATEGORY_META } from "@/data/products";
import logo from "@/assets/dhaga-logo.jpeg";

const primaryLinks = [
  { to: "/", label: "Home" },
  { to: "/new-arrivals", label: "New Arrivals" },
  { to: "/festive", label: "Festive" },
  { to: "/sale", label: "Sale" },
];

export const Navbar = () => {
  const count = useShop((s) => s.cartCount());
  const wish = useShop((s) => s.wishlist.length);
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const navigate = useNavigate();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/new-arrivals?q=${encodeURIComponent(search.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-navbar">
      <div className="container flex items-center justify-between h-16 md:h-20">
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-foreground"
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link to="/" className="flex items-center gap-3 group">
          <span className="relative inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-primary/40 shadow-soft bg-card">
            <img
              src={logo}
              alt="Dhaga logo"
              className="w-full h-full object-cover"
            />
          </span>
          <span className="font-serif text-2xl md:text-3xl font-bold tracking-[0.1em] text-foreground uppercase">
            DHAGA
          </span>
          <span className="hidden lg:inline text-[10px] uppercase tracking-[0.3em] text-primary mt-2">
            est. 2022
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          <Link
            to="/"
            className="text-[13px] uppercase tracking-[0.2em] text-foreground/80 hover:text-primary transition-colors"
          >
            Home
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setShopOpen(true)}
            onMouseLeave={() => setShopOpen(false)}
          >
            <button className="text-[13px] uppercase tracking-[0.2em] text-foreground/80 hover:text-primary transition-colors">
              Shop
            </button>
            <div
              className={cn(
                "absolute left-1/2 -translate-x-1/2 top-full pt-4 transition-all",
                shopOpen ? "opacity-100 visible" : "opacity-0 invisible"
              )}
            >
              <div className="bg-card border border-border shadow-luxe min-w-[260px] py-3">
                {CATEGORIES.map((c) => (
                  <Link
                    key={c}
                    to={CATEGORY_META[c].path}
                    className="block px-5 py-2 text-[12px] uppercase tracking-[0.18em] text-foreground/80 hover:text-primary hover:bg-secondary/50 transition-colors"
                  >
                    {CATEGORY_META[c].label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            to="/new-arrivals"
            className="text-[13px] uppercase tracking-[0.2em] text-foreground/80 hover:text-primary transition-colors"
          >
            New Arrivals
          </Link>
          <Link
            to="/sale"
            className="text-[13px] uppercase tracking-[0.2em] text-foreground/80 hover:text-primary transition-colors"
          >
            Sale
          </Link>
        </nav>

        <div className="flex items-center gap-4 md:gap-5">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-foreground/80 hover:text-primary transition-colors"
            aria-label="Search"
          >
            <Search size={19} />
          </button>
          
          <Link
            to="/wishlist"
            className="relative text-foreground/80 hover:text-primary transition-colors"
            aria-label="Wishlist"
          >
            <Heart size={19} />
            {wish > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {wish}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Hi, {user.name.split(' ')[0]}
                  </span>
                  <Link to="/orders" className="text-[9px] uppercase tracking-[0.2em] text-primary font-bold hover:underline">
                    My Orders
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/atelier" className="text-[9px] uppercase tracking-[0.2em] text-foreground/60 hover:text-primary transition-colors">
                      Atelier Panel
                    </Link>
                  )}
                </div>
                <button 
                  onClick={logout}
                  className="text-foreground/80 hover:text-primary transition-colors"
                  aria-label="Logout"
                >
                  <LogOut size={19} />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="text-foreground/80 hover:text-primary transition-colors"
                aria-label="Login"
              >
                <User size={19} />
              </Link>
            )}
          </div>

          <Link
            to="/cart"
            className="relative text-foreground/80 hover:text-primary transition-colors"
            aria-label="Cart"
          >
            <ShoppingBag size={19} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-500 ease-out border-t border-border/60",
          searchOpen ? "max-h-24" : "max-h-0 border-t-0"
        )}
      >
        <form onSubmit={onSearch} className="container py-4">
          <input
            autoFocus={searchOpen}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for kurtis, ghararas, lehengas…"
            className="w-full bg-transparent border-b border-border focus:border-primary outline-none py-2 font-serif text-xl placeholder:text-muted-foreground/60 transition-colors"
          />
        </form>
      </div>

      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-500 ease-out border-t border-border/60",
          open ? "max-h-[600px]" : "max-h-0 border-t-0"
        )}
      >
        <nav className="container py-6 flex flex-col gap-4">
          {primaryLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="text-sm uppercase tracking-[0.2em] text-foreground/80 hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary mt-4 mb-1">Shop</p>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              to={CATEGORY_META[c].path}
              onClick={() => setOpen(false)}
              className="text-sm uppercase tracking-[0.2em] text-foreground/70 hover:text-primary"
            >
              {CATEGORY_META[c].label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link
              to="/atelier"
              onClick={() => setOpen(false)}
              className="text-xs uppercase tracking-[0.2em] text-primary mt-4 font-bold"
            >
              Atelier Dashboard
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
