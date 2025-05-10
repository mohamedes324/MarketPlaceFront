import './Alert.css';

const Alert = ({ onClose , children}) => {
  

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('alert-overlay')) {
      onClose(); // يقفل لما تدوس على الخلفية
    }
  };

  return (
    <div className="alert-overlay" onClick={handleOverlayClick}>
      <div className="alert-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
};

export default Alert;
