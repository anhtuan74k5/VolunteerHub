import React from "react";
import { Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-200 py-4 shadow-inner">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                {/* Bản quyền */}
                <p className="text-sm text-center md:text-left mb-2 md:mb-0">
                    © 2025 Copyright <span className="font-semibold">Tình Nguyện UET</span>. All rights reserved.
                </p>

                {/* Liên kết mạng xã hội */}
                <div className="flex space-x-4">
                    <a
                        href="https://facebook.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 hover:text-blue-500 transition"
                    >
                        <Facebook size={18} />
                        <span className="text-sm">Facebook</span>
                    </a>
                    <a
                        href="https://twitter.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 hover:text-sky-400 transition"
                    >
                        <Twitter size={18} />
                        <span className="text-sm">Twitter</span>
                    </a>
                    <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 hover:text-pink-400 transition"
                    >
                        <Instagram size={18} />
                        <span className="text-sm">Instagram</span>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
