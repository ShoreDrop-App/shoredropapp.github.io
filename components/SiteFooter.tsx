import { Instagram, Linkedin, Facebook } from "lucide-react";
import { FaTiktok } from "react-icons/fa";

const SiteFooter = () => {
  return (
    <footer className="bg-gray-100 py-16">
      <div className="container mx-auto px--0">
        <div className="grid md:grid-cols-4 gap-50">
          <div className="space-y-5 flex-1">
            <div className="flex items-center space-x-3">
              <img
                src="/lovable-uploads/dbf79a37-c86d-49c9-af90-9fe7b44058fc.jpg"
                alt="ShoreDrop logo"
                className="w-12 h-12"
              />
              <h3 className="text-lg font-medium text-ocean-deep">ShoreDrop</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium and Affordable Beach Experiences Delivered with Care and Precision.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-ocean-deep mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="/#services" className="hover:text-ocean-deep transition-colors">Book gear</a></li>
              <li><a href="/food" className="hover:text-ocean-deep transition-colors">Food & Drinks</a></li>
              <li><a href="/private-events" className="hover:text-ocean-deep transition-colors">Private Events</a></li>
              <li><a href="/mission" className="hover:text-ocean-deep transition-colors">Our mission</a></li>
              <li><a href="/blog" className="hover:text-ocean-deep transition-colors">Blog</a></li>
              <li><a href="/app" className="hover:text-ocean-deep transition-colors">Mobile app</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-ocean-deep mb-4">Support</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="/support" className="hover:text-ocean-deep transition-colors">Help Center</a></li>
              <li><a href="/support" className="hover:text-ocean-deep transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-ocean-deep transition-colors">Partners</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-ocean-deep mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="/privacy" className="hover:text-ocean-deep transition-colors">Privacy</a></li>
              <li><a href="/sms" className="hover:text-ocean-deep transition-colors">SMS consent</a></li>
              <li><a href="/delete-account" className="hover:text-ocean-deep transition-colors">Delete account</a></li>
              <li><a href="/terms" className="hover:text-ocean-deep transition-colors">Terms</a></li>
              <li><a href="/cancellation" className="hover:text-ocean-deep transition-colors">Cancellation</a></li>
              <li><a href="/rental-policy" className="hover:text-ocean-deep transition-colors">Rental policy</a></li>
              <li><a href="/liability-waiver" className="hover:text-ocean-deep transition-colors">Liability waiver</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">2026 ShoreDrop. All rights reserved.</p>

            <div className="flex items-center space-x-6">
              <span className="text-sm font-medium text-ocean-deep">Follow Us</span>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/shoredropapp" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-ocean-deep transition-colors" aria-label="ShoreDrop on Instagram">
                  <Instagram size={20} />
                </a>
                <a href="https://www.facebook.com/share/1HH6Ak5ptN/?mibextid=LQQJ4d" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-ocean-deep transition-colors" aria-label="ShoreDrop on Facebook">
                  <Facebook size={20} />
                </a>
                <a href="https://www.tiktok.com/@shoredrop?_r=1&_t=ZT-945pDzsERR8" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-ocean-deep transition-colors" aria-label="ShoreDrop on TikTok">
                  <FaTiktok size={20} />
                </a>
                <a href="https://www.linkedin.com/company/shoredrop/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-ocean-deep transition-colors" aria-label="ShoreDrop on LinkedIn">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
