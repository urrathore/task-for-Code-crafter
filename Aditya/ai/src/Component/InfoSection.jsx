function InfoSection() {
  return (
    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-8 py-12">
      
      <div
        id="about"
        className="bg-gradient-to-r from-purple-800 via-blue-800 to-indigo-900 shadow-xl p-6 rounded-xl border border-purple-600/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300 scroll-mt-24"
      >
        <h2 className="text-xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 animate-pulse">
          About the Game
        </h2>
        <p className="text-gray-200">
          This game lets you test your knowledge in multiplayer battles...
        </p>
      </div>

      <div
        id="guide"
        className="bg-gradient-to-r from-purple-800 via-blue-800 to-indigo-900 shadow-xl p-6 rounded-xl border border-purple-600/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300 scroll-mt-24"
      >
        <h2 className="text-xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 animate-pulse">
          How to Play
        </h2>
        <p className="text-gray-200">
          Guess the word based on the drawing...
        </p>
      </div>

      <div
        id="developers"
        className="bg-gradient-to-r from-purple-800 via-blue-800 to-indigo-900 shadow-xl p-6 rounded-xl border border-purple-600/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300 scroll-mt-24"
      >
        <h2 className="text-xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 animate-pulse">
          Developers
        </h2>
        <p className="text-gray-200">
          Made with ❤️ by awesome devs!
        </p>
      </div>

      <div
        id="help"
        className="bg-gradient-to-r from-purple-800 via-blue-800 to-indigo-900 shadow-xl p-6 rounded-xl border border-purple-600/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300 scroll-mt-24"
      >
        <h2 className="text-xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 animate-pulse">
          Need Help?
        </h2>
        <p className="text-gray-200">
          Email: <strong>support@gmail.com</strong>
        </p>
      </div>

    </div>
  );
}

export default InfoSection;
