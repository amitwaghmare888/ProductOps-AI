export function Topbar() {
  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-gutter py-4 bg-background/80 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center gap-12">
        <div className="text-headline-md font-headline-md font-bold text-primary/80">ProductOps AI</div>
        <nav className="hidden md:flex items-center gap-8 ml-8">
          <a className="text-primary border-b-2 border-primary pb-1 font-body-md text-body-md" href="#">Pipeline</a>
          <a className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md" href="#">Agents</a>
          <a className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md" href="#">Roadmap</a>
          <a className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md" href="#">Metrics</a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden lg:block">
          <input className="bg-white/5 border border-white/10 rounded-full px-5 py-2 w-64 text-sm focus:outline-none focus:border-primary transition-all" placeholder="Search system..." type="text" />
        </div>
        <button className="p-2 text-on-surface-variant hover:text-primary transition-all">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
          <img alt="User avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4CuMYGIcC_LZ2grnFhS9gfUNg78Ves92UCZR47cbyeYJeoQCTb6EuL5mhLugenIf7qfEel4glRbv766C2F61iwKqtjCZfk615ixbXR8M4BjN_uA10iPr76iwy1cq8ORl75dAVIoTxN0YdISqcapBPn11TjVlasuIMln4GWUKJvnNGgkpG5E5IPN7CL3l6yaH320zIDoEKb2CHIiKvjIdkdwaIen8Lby4NMp0EVpEAZL8wzckN0f1H" />
        </div>
      </div>
    </header>
  );
}
