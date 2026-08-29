import { useState } from "react";
import { NavLink } from "react-router-dom";

function Header({ darkMode, setDarkMode }) {


  const [isMenuOpen, setIsMenuOpen] = useState(false);



  // ==========================
  // COMPTEUR LIKE
  // ==========================

  const [likes, setLikes] = useState(

    Number(localStorage.getItem("likes")) || 0

  );



  const ajouterLike = () => {


    const nouveauNombre = likes + 1;


    setLikes(nouveauNombre);


    localStorage.setItem(
      "likes",
      nouveauNombre
    );


  };





  const closeMenu = () => {
    setIsMenuOpen(false);
  };



  return (
    <header className="header">
      <div className="container header-container">



        {/* Logo */}
        <div className="logo">
          <NavLink to="/" onClick={closeMenu}>
           
            <span className="logo-text">
              ⚛️React Learning Hub
            </span>
          </NavLink>
        </div>





        {/* Navigation */}
        <nav className={`nav ${isMenuOpen ? "open" : ""}`}>
          <ul className="nav-list">



            <li>
              <NavLink 
                to="/" 
                className="nav-link" 
                onClick={closeMenu}
              >
                🏠 Accueil
              </NavLink>
            </li>



            <li>
              <NavLink 
                to="/" 
                className="nav-link" 
                onClick={closeMenu}
              >
                📚 Ressources
              </NavLink>
            </li>



            <li>
              <NavLink 
                to="/" 
                className="nav-link" 
                onClick={closeMenu}
              >
                💼 Portfolio
              </NavLink>
            </li>



            <li>
              <NavLink 
                to="/" 
                className="nav-link" 
                onClick={closeMenu}
              >
                📞 Contact
              </NavLink>
            </li>


          </ul>
        </nav>






        {/* Boutons */}
        <div className="header-actions">



          {/* AJOUT LIKE */}

          <button

            className="like-button"

            onClick={ajouterLike}

          >

            👍 Like {likes}

          </button>






          {/* Toggle Mode */}

          <button

            className={`theme-toggle ${darkMode ? "active" : ""}`}

            onClick={() => setDarkMode(!darkMode)}

          >

            <span className="toggle-circle">

              {darkMode ? "🌙" : "☀️"}

            </span>

          </button>







          <button className="btn btn-outline">

            📖 Documentation

          </button>




          <button className="btn btn-primary">

            ⚛️ React

          </button>




        </div>






        {/* Menu Burger */}
        <button
          className={`menu-toggle ${isMenuOpen ? "active" : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >

          <span></span>

          <span></span>

          <span></span>

        </button>




      </div>
    </header>
  );
}

export default Header;