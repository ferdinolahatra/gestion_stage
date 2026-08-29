import { useNavigate } from "react-router-dom";

function Card({ icon, title, description, color, tech, path }) {

  const navigate = useNavigate();

  return (
    <div
      className="card clickable"
      style={{ "--card-color": color }}
      onClick={() => navigate(path)}
    >
      <div className="card-icon">{icon}</div>

      <h3 className="card-title">{title}</h3>

      <p className="card-tech">{tech}</p>

      <p className="card-description">
        {description}
      </p>

    </div>
  );
}

export default Card;