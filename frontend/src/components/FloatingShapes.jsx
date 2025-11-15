/**
 * FloatingShapes - Professional gradient orbs and geometric elements
 * Creates depth and modern aesthetic without childish elements
 */
function FloatingShapes() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Large gradient orbs - Professional and subtle */}
      <div className="absolute top-0 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-orange-400/15 to-red-500/10 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute top-1/3 -right-40 w-[700px] h-[700px] bg-gradient-to-br from-yellow-400/12 to-orange-500/8 rounded-full blur-3xl animate-float-slower" />
      <div className="absolute -bottom-40 left-1/4 w-[550px] h-[550px] bg-gradient-to-br from-red-400/15 to-pink-500/10 rounded-full blur-3xl animate-float-medium" />
      
      {/* Medium accent orbs */}
      <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-gradient-to-br from-orange-300/8 to-red-400/6 rounded-full blur-2xl animate-float-fast" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-yellow-300/10 to-orange-400/8 rounded-full blur-2xl animate-float-medium" />
      
      {/* Abstract geometric lines - Minimalist and professional */}
      <div className="absolute top-20 left-20 w-40 h-40 border border-orange-300/15 rounded-lg rotate-12 animate-spin-slow" />
      <div className="absolute top-1/2 right-32 w-32 h-32 border border-red-300/15 rounded-lg -rotate-45 animate-spin-slow" style={{ animationDirection: 'reverse' }} />
      <div className="absolute bottom-32 left-1/2 w-28 h-28 border border-yellow-300/15 rotate-45 animate-spin-slow" />
      
      {/* Subtle accent circles */}
      <div className="absolute top-2/3 right-1/4 w-20 h-20 border border-orange-400/20 rounded-full animate-pulse-slow" />
      <div className="absolute top-1/3 left-1/4 w-16 h-16 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full animate-pulse-slow" />
    </div>
  );
}

export default FloatingShapes;

