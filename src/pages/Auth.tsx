import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "@/lib/api";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isForgot) {
        await api.post("/auth/forgotpassword", { email });
        toast.success("Recovery email sent! Please check your inbox.");
        setIsForgot(false);
      } else if (isLogin) {
        await login(email, password);
        toast.success("Welcome back!");
        navigate("/");
      } else {
        await signup(name, email, phone, password);
        toast.success("Account created successfully!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border p-8 w-full max-w-md shadow-luxe"
      >
        <p className="text-[11px] uppercase tracking-[0.4em] text-primary mb-2 text-center">
          The House of DHAGA
        </p>
        <h1 className="font-serif text-3xl mb-8 text-center">
          {isForgot ? "Reset Password" : isLogin ? "Sign In" : "Create Account"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && !isForgot && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Full Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border border-border p-3 text-sm focus:border-primary outline-none transition-colors"
                  placeholder="Aanya Sharma"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Phone Number</label>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent border border-border p-3 text-sm focus:border-primary outline-none transition-colors"
                  placeholder="+91 98765 43210"
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Email Address</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-border p-3 text-sm focus:border-primary outline-none transition-colors"
              placeholder="aanya@example.com"
            />
          </div>
          {!isForgot && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Password</label>
                {isLogin && (
                   <button 
                     type="button" 
                     onClick={() => setIsForgot(true)}
                     className="text-[9px] uppercase tracking-[0.1em] text-primary hover:underline"
                   >
                     Forgot?
                   </button>
                )}
              </div>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-border p-3 text-sm focus:border-primary outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-foreground text-background py-4 text-xs uppercase tracking-[0.2em] hover:bg-primary transition-colors disabled:opacity-50"
          >
            {loading ? "Please wait..." : isForgot ? "Send Reset Link" : isLogin ? "Sign In" : "Register"}
          </button>
          
          {isForgot && (
             <button
               type="button"
               onClick={() => setIsForgot(false)}
               className="w-full text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
             >
               ← Back to Login
             </button>
          )}
        </form>

        {!isForgot && (
          <div className="mt-8 text-center border-t border-border pt-6">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs uppercase tracking-[0.2em] text-primary hover:text-foreground transition-colors font-medium"
            >
              {isLogin ? "New to DHAGA? Create Account →" : "Already have an account? Sign In →"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
