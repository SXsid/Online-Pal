
const SquareLoader = () => {
  
  const squares = Array(7).fill(null);

 
  const style = document.createElement('style');
  style.textContent = `
    @keyframes square-animation {
      0%, 10.5% { left: 0; top: 0; }
      12.5%, 23% { left: 32px; top: 0; }
      25%, 35.5% { left: 64px; top: 0; }
      37.5%, 48% { left: 64px; top: 32px; }
      50%, 60.5% { left: 32px; top: 32px; }
      62.5%, 73% { left: 32px; top: 64px; }
      75%, 85.5% { left: 0; top: 64px; }
      87.5%, 98% { left: 0; top: 32px; }
      100% { left: 0; top: 0; }
    }
  `;
  document.head.appendChild(style);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="relative w-24 h-24 rotate-45">
        {squares.map((_, index) => (
          <div
            key={index}
            className="absolute w-7 h-7 m-0.5 bg-white"
            style={{
              animation: 'square-animation 10s ease-in-out infinite both',
              animationDelay: `${-1.4285714286 * index}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SquareLoader;