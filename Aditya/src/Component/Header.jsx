function Header() {
  const navItems = ["About", "Guide", "Developers", "Help"];

  return (
    <>
      {/* Logo / Title */}
      <header className="text-center py-6">
        <h1 className="text-5xl md:text-6xl font-bold tracking-wide flex gap-1 justify-center flex-wrap">
          {"Doodle ".split("").map((char, index) => (
            <span
              key={index}
              className="neon-letter"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {char}
            </span>
          ))}
          {"Rush".split("").map((char, index) => (
            <span
              key={index + 100}
              className="neon-letter-rush"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {char}
            </span>
          ))}
        </h1>
      </header>

      {/* Navbar */}
      <nav className="backdrop-blur-md bg-white/70 shadow-lg sticky top-0 z-50 border-b border-white/30">
        <ul className="flex flex-wrap justify-center gap-4 md:gap-8 py-4 text-base md:text-lg font-semibold">
          {navItems.map((item, index) => (
            <li key={index}>
              <a
                href={`#${item.toLowerCase()}`}
                className="relative px-2 text-gray-700 transition duration-300 ease-in-out hover:text-blue-600 group"
              >
                {item}
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 group-hover:w-full"></span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <hr />
    </>
  );
}

export default Header;
