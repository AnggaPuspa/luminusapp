import useSWR, { mutate as globalMutate } from "swr";

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) throw new Error("Fetch failed");
    return res.json();
});

// ===== Global mutate helpers =====
// Call after purchase, subscribe, or any action that changes user data
export function invalidateDashboard() {
    globalMutate("/api/student/overview");
    globalMutate("/api/student/courses");
    globalMutate("/api/student/transactions");
}

export function invalidateProfile() {
    globalMutate("/api/student/profile");
}

// ===== Dashboard overview: shared by sidebar, dashboard page, ai-mentor page =====
export function useDashboardOverview() {
    const { data, error, isLoading, mutate } = useSWR("/api/student/overview", fetcher, {
        revalidateOnFocus: true,
        dedupingInterval: 30000, // 30s dedup
    });

    return {
        stats: data || null,
        isLoading,
        isError: !!error,
        mutate,
    };
}

// ===== Student courses: used by dashboard/courses page =====
export function useStudentCourses() {
    const { data, error, isLoading, mutate } = useSWR("/api/student/courses", fetcher, {
        revalidateOnFocus: true,
        dedupingInterval: 30000,
    });

    return {
        courses: data || [],
        isLoading,
        isError: !!error,
        mutate,
    };
}

// ===== Student transactions: used by dashboard/transactions page =====
export function useStudentTransactions() {
    const { data, error, isLoading, mutate } = useSWR("/api/student/transactions", fetcher, {
        revalidateOnFocus: true,
        dedupingInterval: 30000,
    });

    return {
        transactions: data || [],
        isLoading,
        isError: !!error,
        mutate,
    };
}

// ===== Student profile: used by dashboard/settings page =====
export function useStudentProfile() {
    const { data, error, isLoading, mutate } = useSWR("/api/student/profile", fetcher, {
        revalidateOnFocus: false, // profile rarely changes externally
        dedupingInterval: 60000,
    });

    return {
        profile: data || null,
        isLoading,
        isError: !!error,
        mutate,
    };
}

// ===== Pricing plans: used by pricing page =====
export function usePricingPlans() {
    const { data, error, isLoading } = useSWR("/api/pricing", fetcher, {
        revalidateOnFocus: false, // plans change via admin, not user actions
        dedupingInterval: 300000, // 5min
    });

    return {
        plans: data || [],
        isLoading,
        isError: !!error,
    };
}
