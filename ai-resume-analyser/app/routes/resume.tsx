// pages/resume.tsx
import { useParams } from "react-router-dom";
import {Link, useNavigate} from "react-router";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

export const meta=()=>(
    [
        {title:'Resumind |Review'},
        {name:'description',content:'Detailed overview of your resume'},
    ]
)

export default function Resume() {
    const{auth,isLoading,fs,kv}=usePuterStore();
    const { id } = useParams();
    const[imageUrl,setImageUrl]=useState('');
    const[resumeUrl,setResumeUrl]=useState('');
    const[feedback,setFeedback]=useState<Feedback | null>(null);
    const navigate=useNavigate();
    useEffect(()=>{
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);

    },[isLoading]);
    useEffect(() => {
        let resumeObjectUrl: string | null = null;
        let imageObjectUrl: string | null = null;

        const loadResume = async () => {
            try {
                if (!id) return;
                const resume = await kv.get(`resume:${id}`);
                if (!resume) return;

                const data = JSON.parse(resume);

                // Read PDF
                const resumeBlobData = await fs.read(data.resumePath);
                if (resumeBlobData) {
                    const pdfBlob = new Blob([resumeBlobData], { type: "application/pdf" });
                    resumeObjectUrl = URL.createObjectURL(pdfBlob);
                    setResumeUrl(resumeObjectUrl);
                }

                // Read image
                const imageBlobData = await fs.read(data.imagePath);
                if (imageBlobData) {
                    const imgBlob = new Blob([imageBlobData], { type: "image/png" });
                    imageObjectUrl = URL.createObjectURL(imgBlob);
                    setImageUrl(imageObjectUrl);
                }

                setFeedback(data.feedback || "");
                console.log({ resumeUrl: resumeObjectUrl, imageUrl: imageObjectUrl, feedback: data.feedback });
            } catch (e) {
                console.error("Failed to load resume:", e);
            }
        };

        // Call it once; no recursion
        loadResume();

        // Cleanup object URLs
        return () => {
            if (resumeObjectUrl) URL.revokeObjectURL(resumeObjectUrl);
            if (imageObjectUrl) URL.revokeObjectURL(imageObjectUrl);
        };
    }, [id, kv, fs]);
    return (
        <main className="!pt-0">
            <nav className="resume-nav fixed top-0 left-0 right-0 z-50">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>

            {/* spacer equal to navbar height (adjust as needed) */}
            <div className="h-16" />

            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                {/* remove sticky so it won’t pin under nav; or use sticky top-16 if required */}
                <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover min-h-[100vh] items-center justify-center">
                    {imageUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border mx-auto max-w-6xl -translate-y-6 md:-translate-y-10 lg:-translate-y-68">
                            <a href={resumeUrl || '#'} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full max-h-[100vh] object-cover rounded-2xl"
                                    title="Resume"
                                    alt="Resume preview"
                                />
                            </a>
                        </div>
                    )}

                </section>
                <section className="feedback-section">
                    <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
                    {
                        feedback ? (
                            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                           <Summary feedback={feedback}/>
                                <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || [] }/>
                                <Details feedback={feedback}/>
                            </div>
                        ):(
                            <img src="/images/resume-scan-2.gif" className="w-full"/>
                        )
                    }

                </section>
            </div>
        </main>
    );

}
