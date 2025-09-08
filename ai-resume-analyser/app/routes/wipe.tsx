
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const Wipe = () => {
    console.log("⚡ Wipe component function executed (should be in browser console)");

    useEffect(() => {
        console.log(" Wipe mounted on client");
    }, []);


    const { auth, isLoading, error, clearError, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [files, setFiles] = useState<FSItem[]>([]);

    const loadFiles = async () => {
        try {
            const res = (await fs.readDir("./")) as FSItem[];
            console.log("Loaded files:", res);
            setFiles(res);
        } catch (err) {
            console.error("Failed to load files:", err);
        }
    };

    useEffect(() => {
        loadFiles();
    }, []);

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            console.log("Not authenticated, redirecting...");
            navigate("/auth?next=/wipe");
        }
    }, [isLoading, auth, navigate]);

    const handleDelete = async () => {
        try {
            console.log("Deleting files:", files);

            // Make sure we wait for all deletions
            await Promise.all(files.map((file) => fs.delete(file.path)));

            console.log("Flushing KV store...");
            await kv.flush();

            console.log("Reloading file list...");
            await loadFiles();

            console.log("Wipe complete ");
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return (
            <div>
                Error: {error}{" "}
                <button
                    onClick={() => clearError()}
                    className="ml-2 text-blue-500 underline"
                >
                    clear
                </button>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div>Authenticated as: {auth.user?.username}</div>

            <div className="mt-4">Existing files:</div>
            <div className="flex flex-col gap-2 mt-2">
                {files.length === 0 && <p className="text-gray-500">No files found.</p>}
                {files.map((file) => (
                    <div key={file.id ?? file.name} className="flex flex-row gap-4">
                        <p>{file.name}</p>
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-600"
                    onClick={handleDelete}
                >
                    Wipe App Data
                </button>
            </div>
        </div>
    );
};

export default Wipe;
