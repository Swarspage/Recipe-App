const Footer = () => {
  return (
    <footer className="border-t border-accent/10 bg-background py-12 px-6">
      <div className="max-w-container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="md:col-span-2">
          <h2 className="font-poiret text-2xl font-bold tracking-widest mb-4">RECIPE<span className="text-accent">AI</span></h2>
          <p className="text-accent/60 max-w-xs leading-relaxed">
            Revolutionizing how you cook with localized AI insights and ingredient-first discovery. Premium recipes for the modern kitchen.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-accent">Explore</h4>
          <ul className="space-y-2 text-sm text-accent/60">
            <li><a href="#" className="hover:text-primary transition-colors">All Recipes</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">AI Wizard</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Trending</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-accent">Support</h4>
          <ul className="space-y-2 text-sm text-accent/60">
            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-container mx-auto pt-8 border-t border-accent/5 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-[0.2em] text-accent/40">
        <p>&copy; 2026 recipeai. All rights reserved.</p>
        <p>Premium Culinary Experience</p>
      </div>
    </footer>
  );
};

export default Footer;
