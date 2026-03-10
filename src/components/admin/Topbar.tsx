import { Sun, Moon, Globe, Bell, Mail, SlidersHorizontal, ChevronDown } from "lucide-react";

export default function Topbar() {
    return (
        <div className="px-6 md:px-8 pt-6 md:pt-8 bg-gray-50 w-full z-10">
            <header className="h-[84px] bg-white rounded-[20px] shadow-sm flex items-center justify-between px-7 mx-auto max-w-[1600px] border border-gray-100/50">
                {/* Left Section: Title */}
                <div>
                    <h1 className="text-[17px] font-extrabold text-[#1a1a1a]">Dashboard</h1>
                    <p className="text-[12px] font-medium text-gray-400 mt-0.5">The database update process runs in the background</p>
                </div>

                {/* Right Section: Tools & Profile */}
                <div className="flex items-center gap-7">

                    {/* Theme Toggle */}
                    <div className="flex items-center gap-2.5">
                        <Sun className="w-4 h-4 text-[#4F46E5]" strokeWidth={2.5} />
                        <button className="w-10 h-[22px] bg-gray-100 rounded-full flex items-center p-0.5 transition-colors cursor-pointer border border-gray-200">
                            <div className="w-[18px] h-[18px] rounded-full bg-[#4F46E5] shadow-sm"></div>
                        </button>
                        <Moon className="w-4 h-4 text-gray-400" strokeWidth={2.5} />
                    </div>

                    {/* Vertical Divider */}
                    <div className="w-px h-8 bg-gray-100"></div>

                    {/* Action Icons */}
                    <div className="flex items-center gap-5">
                        <button className="text-gray-400 hover:text-gray-700 transition-colors">
                            <Globe className="w-5 h-5" strokeWidth={2} />
                        </button>

                        <div className="relative">
                            <button className="text-gray-400 hover:text-gray-700 transition-colors pt-1">
                                <Bell className="w-5 h-5" strokeWidth={2} />
                            </button>
                            {/* Notification Badge */}
                            <span className="absolute -top-1.5 -right-2 w-[18px] h-[18px] flex items-center justify-center bg-[#bbf72f] text-[#1a1a1a] text-[10px] font-extrabold rounded-full ring-2 ring-white">
                                12
                            </span>
                        </div>

                        <button className="text-gray-400 hover:text-gray-700 transition-colors">
                            <Mail className="w-5 h-5" strokeWidth={2} />
                        </button>

                        <button className="text-gray-400 hover:text-gray-700 transition-colors">
                            <SlidersHorizontal className="w-5 h-5" strokeWidth={2} />
                        </button>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 cursor-pointer ml-2 group">
                        <div className="w-[42px] h-[42px] rounded-full bg-[#8B5CF6] flex items-center justify-center overflow-hidden border border-gray-50 shadow-sm relative">
                            {/* Placeholder for the illustration - Using Dicebear as standard replacement for dummy avatars */}
                            <img
                                src="https://api.dicebear.com/7.x/notionists/svg?seed=Patricia&backgroundColor=transparent"
                                alt="Patricia Peter"
                                className="w-12 h-12 object-cover translate-y-1.5"
                            />
                        </div>
                        <div className="flex flex-col text-left mr-1">
                            <span className="text-[14px] font-extrabold text-[#1a1a1a] leading-tight">
                                Patricia Peter
                            </span>
                            <span className="text-[12px] font-medium text-gray-400 mt-0.5">Super Admin</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" strokeWidth={2} />
                    </div>

                </div>
            </header>
        </div>
    );
}
