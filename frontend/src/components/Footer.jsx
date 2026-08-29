function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>MonProjet</h3>
            <p>Votre partenaire de confiance pour vos projets numériques.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="LinkedIn">💼</a>
              <a href="#" aria-label="GitHub">🐙</a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Liens rapides</h4>
            <ul>
              <li><a href="#">Accueil</a></li>
              <li><a href="#">Services</a></li>
              <li><a href="#">À propos</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact</h4>
            <ul>
              <li>📧 contact@monprojet.com</li>
              <li>📞 +33 1 23 45 67 89</li>
              <li>📍 Paris, France</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Newsletter</h4>
            <form onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Votre email" required />
              <button type="submit">S'abonner</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 MonProjet. Tous droits réservés.</p>
          <div className="footer-legal">
            <a href="#">Mentions légales</a>
            <a href="#">Politique de confidentialité</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer