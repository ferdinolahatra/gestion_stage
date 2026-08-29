import Navbar from "./Navbar";

function ProtectedLayout({ children }) {
  return (
    <div className="protected-layout">

      <Navbar />

      <main className="protected-content">
        {children}
      </main>

    </div>
  );
}

export default ProtectedLayout;