import Header from "./Component/Header";
import Footer from "./Component/Footer";
import HomeButtons from "./Component/HomeButtons";
import InfoSection from "./Component/InfoSection";
import './index.css';

function App() {
  return (
    <div>
      {/* Stars */}
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          
          className="star"
          style={{
            top: `${Math.random() * 100}vh`,
            left: `${Math.random() * 100}vw`,
            '--i': Math.random() * 5
          }}
        ></div>
      ))}

      {/* Neon Streaks */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="streak"
          style={{
            left: `${Math.random() * 100}vw`,
            animationDuration: `${3 + Math.random() * 5}s`,
            animationDelay: `${Math.random() * 5}s`
          }}
        ></div>
      ))}

      <Header />
      <HomeButtons />
      <InfoSection />
      <Footer />
    </div>
  );
}

export default App;
