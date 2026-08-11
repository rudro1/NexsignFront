import React, { useState } from 'react';
import { Twitter, Linkedin, Github, Facebook, Instagram, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './ui/Logo';
import { api } from '@/api/apiClient'; 
import { useAuth } from '@/lib/AuthContext'; 
import { useToast } from "@/components/ui/use-toast";
export function FooterSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [email, setEmail] = useState('');
  const [review, setReview] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLink, setActiveLink] = useState("");
    const navigate = useNavigate();

  // Scroll to section
const scrollToSection = (id) => {
  if (location.pathname !== "/") {
   navigate ("/", { state: { scrollTo: id } });

    // wait for navigation then scroll
    setTimeout(() => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  } else {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  }

  setActiveLink(id);
};


const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !rating) {
      return toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide both your email and a star rating.",
      });
    }

    setIsSubmitting(true);

    try {
      await api.post('/feedback/send-feedback', {
        email,
        name: user?.full_name || 'Valued User',
        stars: rating,
        review: review
      });

      // ✅ সফল হলে shadcn টোস্ট
     toast({
  title: "Feedback Submitted Successfully",
  description: "Thank you for your contribution. A formal acknowledgment has been sent to your email.",
});
      
      // ফর্ম রিসেট
      setEmail('');
      setReview('');
      setRating(0);
    } catch (error) {
      console.error("Feedback error:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "We couldn't process your feedback. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="container mx-auto px-4 md:px-6 space-y-2">

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-sky-600 to-sky-500 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-sky-900/20">
          <div className="max-w-xl space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Ready to Simplify Your Document Signing?
            </h2>
            <p className="text-sky-100 text-base md:text-lg">
              Join thousands of businesses who trust NeXsign for secure document workflows.
            </p>
          </div>
          <Link
            to="/login"
            className="bg-white text-sky-500 btn hover:bg-sky-50 border-none shadow-lg whitespace-nowrap px-4 py-3 rounded-xl font-bold"
          >
            Start Free Trial
          </Link>
        </div>

        {/* Footer Main: 3 columns */}
        <div className="flex flex-col md:flex-row justify-between  gap-10 border-t border-b border-slate-800 px-10 py-3">

          {/* Left: Logo */}
          <div className="flex flex-col justify-center items-start gap-3 ">
            <Logo />
            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-xs ">
              Secure, fast, and legally binding digital signatures for modern businesses.
            </p>
          </div>

          {/* Center: Links */}
          <div className="flex flex-col justify-center items-center gap-2">
            <h3 className="text-white font-semibold text-lg text-center">Product</h3>
            <ul className="flex flex-col md:flex-row gap-6 text-sky-400 text-center font-medium">
              <li>
                <button
              onClick={() => scrollToSection("features")}
              className={`hover:text-sky-500 ${activeLink === "features" ? "text-sky-500 font-bold border-0" : ""}`}
            >
              Features
            </button>
              </li>
              <li>
                    <button
              onClick={() => scrollToSection("how-it-works")}
              className={`hover:text-sky-500 ${activeLink === "how-it-works" ? "text-sky-500 font-bold" : ""}`}
            >
              How It Works
            </button>
               
              </li>
              <li>
                <Link to="/pricing" className="hover:text-sky-600 transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Right: Email + Review */}
          <div className="flex flex-col gap-1 max-w-xs w-full">
            <h3 className="text-white font-semibold text-lg">Give Feedback</h3>
            <p className="text-slate-400 text-sm md:text-base">
              Submit your email and a quick review.
            </p>
            <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Your email"
                className="w-full p-2 md:p-3 rounded-lg border-none focus:outline-none text-slate-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <textarea
                placeholder="Write your review..."
                className="w-full p-2 md:p-3 rounded-lg border-none focus:outline-none text-slate-900 h-20"
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 cursor-pointer ${
                        rating >= star ? 'text-yellow-400' : 'text-slate-500'
                      }`}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors font-semibold disabled:opacity-50"
                  disabled={!email || !rating}
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-6">
          <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">
            <Facebook className="h-6 w-6" />
          </a>
          <a href="#" className="text-slate-400 hover:text-pink-500 transition-colors">
            <Instagram className="h-6 w-6" />
          </a>
          <a href="#" className="text-slate-400 hover:text-white transition-colors">
            <Twitter className="h-6 w-6" />
          </a>
          <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
            <Linkedin className="h-6 w-6" />
          </a>
          <a href="#" className="text-slate-400 hover:text-gray-500 transition-colors">
            <Github className="h-6 w-6" />
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm md:text-base text-slate-400">
          &copy; {new Date().getFullYear()} NeXsign. Secure and simple digital document signing.
        </div>
      </div>
    </footer>
  );
}