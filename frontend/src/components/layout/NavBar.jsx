import "remixicon/fonts/remixicon.css";
import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import "./NavBar.css";

const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const linksRef = useRef([]);
  const animationRef = useRef(null);

  const toggleNavbar = () => {
    if (mobileDrawerOpen) {
      // Animate closing
      const timeline = gsap.timeline({
        onComplete: () => setMobileDrawerOpen(false),
      });
      timeline.to(drawerRef.current, {
        y: "-100%",
        opacity: 1,
        duration: 0.5,
        ease: "power2.in",
      });
    } else {
      setMobileDrawerOpen(true);
    }
  };

  useEffect(() => {
    if (mobileDrawerOpen) {
      const ctx = gsap.context(() => {
        const timeline = gsap.timeline();

        // Animating nav bar background
        timeline.fromTo(
          drawerRef.current,
          { y: "-100%", opacity: 0 },
          { y: "0%", opacity: 1, duration: 0.5, ease: "power2.out" }
        );

        // Animating each nav links <li>
        timeline.fromTo(
          linksRef.current,
          { y: -20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.3,
            stagger: 0.1,
            ease: "power2.out",
          }
        );

        animationRef.current = ctx;
      });
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.revert();
      }
    };
  }, [mobileDrawerOpen]);

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <div className="logo">
            <Link to="/" className="logo-text">
              FinTrust AI
            </Link>
          </div>

          <ul className="nav-items">
            <li ref={(el) => (linksRef.current[0] = el)}>
              <Link to="/services">Services</Link>
            </li>
            <li ref={(el) => (linksRef.current[1] = el)}>
              <Link to="/howitworks">How It Works</Link>
            </li>
            <li ref={(el) => (linksRef.current[2] = el)}>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>

          <div className="auth-buttons">
            <Link to="/login" className="navbtn navbtn-border">
              Login
            </Link>
            <Link to="/register" className="navbtn navbtn-gradient">
              Create Account
            </Link>
          </div>

          <div className="mobile-menu">
            <button onClick={toggleNavbar}>
              <i className="ri-menu-line"></i>
            </button>
          </div>
        </div>

        {mobileDrawerOpen && (
          <div className="mobile-drawer" ref={drawerRef}>
            <ul>
              <li ref={(el) => (linksRef.current[3] = el)}>
                <Link to="/services">Services</Link>
              </li>
              <li ref={(el) => (linksRef.current[4] = el)}>
                <Link to="/howitworks">How It Works</Link>
              </li>
              <li ref={(el) => (linksRef.current[5] = el)}>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
            <div className="drawer-buttons">
              <Link to="/login" className="navbtn navbtn-border">
                Bank Login
              </Link>
              {/* <Link to="/register" className="navbtn navbtn-gradient">
                Create Account
              </Link> */}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
