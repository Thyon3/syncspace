function UsersLoadingSkeleton() {
    return (
        <div className="p-3 space-y-2">
            {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                <div key={item} className="glass rounded-xl p-3 animate-pulse">
                    <div className="flex items-center gap-3">
                        {/* Avatar skeleton */}
                        <div className="relative">
                            <div className="w-12 h-12 bg-slate-700/50 rounded-full border border-slate-600/30"></div>
                            {/* Online indicator skeleton */}
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-slate-600/50 rounded-full border-2 border-slate-900"></div>
                        </div>

                        {/* User info skeleton */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="h-4 bg-slate-700/50 rounded w-1/3"></div>
                                <div className="h-3 bg-slate-700/30 rounded w-12"></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-slate-600/50 rounded-full"></div>
                                <div className="h-3 bg-slate-700/30 rounded w-16"></div>
                            </div>
                        </div>

                        {/* Action button skeleton */}
                        <div className="w-8 h-8 bg-slate-700/30 rounded-lg"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default UsersLoadingSkeleton;