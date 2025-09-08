import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";

import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "AI RESUME ANALYSER" },
        { name: "description", content: "Smart Feedback About Resume" },
    ];
}

export default function Home() {
    const { auth, kv } = usePuterStore();
    const navigate = useNavigate();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loadingResumes, setLoadingResumes] = useState(false);

    // Protect page on first load
    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate("/auth?next=/", { replace: true });
        }
        // run only once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const loadResumes = async () => {
            setLoadingResumes(true);
            const resumes = (await kv.list("resume:*", true)) as KVItem[];
            const parsedResumes = resumes?.map(
                (resume) => JSON.parse(resume.value) as Resume
            );
            console.log("parsedResumes", parsedResumes);
            setResumes(parsedResumes || []);
            setLoadingResumes(false);
        };
        loadResumes();
    }, []);

    const handleLogout = () => {
        if (auth.signOut) {
            auth.signOut();
        }
        navigate("/auth", { replace: true });
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />
            {/* Logout button top-right */}
            {auth.isAuthenticated && (
                <div className="absolute top-4 right-4">
                    <button
                        onClick={handleLogout}
                        className="primary-button w-fit text-sm font-semibold"
                    >
                        Log Out
                    </button>
                </div>
            )}

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Track Your Applications & Resume Ratings</h1>
                    {!loadingResumes && resumes?.length === 0 ? (
                        <h2>No resumes found. Upload your first Resume to get feedback</h2>
                    ) : (
                        <h2>Review Your Submissions And Check AI-powered feedback</h2>
                    )}
                </div>
                {loadingResumes && (
                    <div className="flex flex-col items-center justify-center ">
                        <img src="/images/resume-scan-2.gif" className="w-[200px]" />
                    </div>
                )}
                {!loadingResumes && resumes.length > 0 && (
                    <div className="resumes-section">
                        {resumes.map((resume) => (
                            <ResumeCard key={resume.id} resume={resume} />
                        ))}
                    </div>
                )}
                {!loadingResumes && resumes?.length === 0 && (
                    <div className="flex flex-col items-center justify-center mt-10 gap-4">
                        <Link
                            to="/upload"
                            className="primary-button w-fit text-xl font-semibold "
                        >
                            Upload Resume
                        </Link>
                    </div>
                )}
            </section>
        </main>
    );
}
