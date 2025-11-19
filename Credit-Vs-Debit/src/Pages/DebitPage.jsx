import React from 'react';
import { useNavigate } from 'react-router-dom';
import meals from '../images/meals.png';
import gas from '../images/Gasoline.png';
import Music from '../images/Music.png';
import movies from '../images/Movies.png';
import '../App.css';

const DebitPage = () => {
  const floatingAnimation = `
        @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px) rotate(-15deg); }
            50% { transform: translateY(-30px) translateX(10px) rotate(-10deg); }
        }
        
        @keyframes float2 {
            0%, 100% { transform: translateY(0px) translateX(0px) rotate(10deg); }
            50% { transform: translateY(-25px) translateX(-10px) rotate(15deg); }
        }
        
        @keyframes float3 {
            0%, 100% { transform: translateY(0px) translateX(0px) rotate(5deg); }
            50% { transform: translateY(-35px) translateX(10px) rotate(0deg); }
        }
        
        @keyframes float4 {
            0%, 100% { transform: translateY(0px) translateX(0px) rotate(-8deg); }
            50% { transform: translateY(-28px) translateX(-10px) rotate(-3deg); }
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 0.9; }
        }
        
        @keyframes pulse2 {
            0%, 100% { opacity: 0.65; }
            50% { opacity: 0.95; }
        }
        
        @keyframes pulse3 {
            0%, 100% { opacity: 0.55; }
            50% { opacity: 0.85; }
        }
        
        @keyframes pulse4 {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 0.8; }
        }
    `;
  const navigate = useNavigate();
  return (

<div style={{
      padding: 0,
      minHeight: '100vh',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
    }}>
                {/* Add CSS animations */}
                <style>{floatingAnimation}</style>


                <div style={{
                    position: 'fixed',
                    top: '150px',
                    left: '20px',
                    zIndex: 1,
                    animation: 'float 6s ease-in-out infinite, pulse 4s ease-in-out infinite',
                    display: window.innerWidth > 768 ? 'block' : 'none',
                }}>
                    <img src={meals} alt="meals" style={{
                        width: '250px',
                        height: '250px',
                        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
                        objectFit: 'contain',
                    }} />
                </div>


                <div style={{
                    position: 'fixed',
                    top: '120px',
                    right: '20px',
                    zIndex: 1,
                    animation: 'float2 7s ease-in-out infinite, pulse2 5s ease-in-out infinite',
                    display: window.innerWidth > 768 ? 'block' : 'none',
                }}>
                    <img src={gas} alt="gas" style={{
                        width: '250px',
                        height: '250px',
                        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
                        objectFit: 'contain',
                    }} />
                </div>


                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    zIndex: 1,
                    animation: 'float3 8s ease-in-out infinite, pulse3 6s ease-in-out infinite',
                    display: window.innerWidth > 768 ? 'block' : 'none',
                }}>
                    <img src={movies} alt="movies" style={{
                        width: '250px',
                        height: '250px',
                        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
                        objectFit: 'contain',
                    }} />
                </div>

  
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 1,
                    animation: 'float4 9s ease-in-out infinite, pulse4 5.5s ease-in-out infinite',
                    display: window.innerWidth > 768 ? 'block' : 'none',
                    opacity: 0.7,
                }}>
                    <img src={Music} alt="Music" style={{
                        width: '220px',
                        height: '220px',
                        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
                        objectFit: 'contain',
                    }} />
                </div>



      <div className="container">
        <div className="containter-info-1">
          <h1 className="h1">Debit Cards</h1>
          <h2 className="h2">Debit cards are linked to your bank account and allow you to spend money directly from your account.</h2>
          <h2 className="h2">They are a great way to pay for things and can be used anywhere.</h2>
          <h2 className="h2">They are also a great way to track your spending and your balance.</h2>
        </div>


        <div className="containter-info-2">
          <h2 className="h2">But they are not as safe as credit cards.</h2>
          <h2 className="h2">If you lose your debit card, you could lose all your money.</h2>
          <h2 className="h2">So be careful with your debit card and always keep it safe.</h2>
          <h2 className="h2">And if you do lose it, report it to your bank immediately.</h2>
        </div>


        <div className="containter-list-items">
          <h1 className="h1">When should you use a debit card?</h1>
          <div>
            <p className="container-list-items">meals</p>
            <p className="container-list-items">gas</p>
            <p className="container-list-items">groceries</p>
            <p className="container-list-items">movies</p>
            <p className="container-list-items">books</p>
            <p className="container-list-items">music</p>
            <p className="container-list-items">games</p>
            <p className="container-list-items">other</p>
          </div>
        </div>

      
        <button className="button" onClick={() => navigate('/credit')}>Next!</button>
      </div>
  </div>
);


};

export default DebitPage;