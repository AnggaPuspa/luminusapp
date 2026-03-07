import { Search, Bell, User } from "lucide-react";

export default function Topbar() {
    return (
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 lg:px-8 shadow-sm z-10">
            <div className="flex items-center flex-1">
                {/* Mobile menu button (placeholder) */}
                <button className="md:hidden mr-4 text-gray-500 hover:text-gray-900">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Global Search */}
                <div className="hidden md:flex relative max-w-md w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                        placeholder="Search courses, users, or orders..."
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    <Bell className="w-5 h-5" />
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-3 border-l pl-4 ml-2">
                    <div className="hidden md:flex flex-col text-right">
                        <span className="text-sm font-medium text-gray-900">Admin User</span>
                        <span className="text-xs text-gray-500">Superadmin</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-sm">
                        <User className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </header>
    );
}
