import { useEffect, useRef, useState } from 'react';
import { Loader2, ExternalLink } from 'lucide-react';

export function TikTokEmbed({ url, videoId }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const retryCount = useRef(0);

    useEffect(() => {
        if (!url || !videoId) return;

        // Function to process embeds with retry
        const checkEmbed = () => {
            if (window.tiktok?.embed?.check) {
                window.tiktok.embed.check();
                // Check if iframe was actually created after a short delay
                setTimeout(() => {
                    const iframe = document.querySelector(`iframe[data-video-id="${videoId}"]`) ||
                        document.querySelector(`iframe[src*="${videoId}"]`);
                    if (iframe) setIsLoaded(true);
                }, 1000);
            }
        };

        // Retry mechanism
        const intervalId = setInterval(() => {
            checkEmbed();
            retryCount.current += 1;
            if (retryCount.current > 10) clearInterval(intervalId); // Stop after 5 seconds
        }, 500);

        // Load Script if not present
        const scriptId = 'tiktok-embed-script';
        let script = document.getElementById(scriptId);

        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://www.tiktok.com/embed.js';
            script.async = true;
            script.onload = checkEmbed;
            document.body.appendChild(script);
        } else {
            checkEmbed();
        }

        return () => clearInterval(intervalId);
    }, [url, videoId]);

    if (!url || !videoId) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', background: '#f0f0f0', borderRadius: '8px' }}>
                <p>동영상 정보를 불러올 수 없습니다.</p>
                <code style={{ fontSize: '0.8rem', display: 'block', marginTop: '5px' }}>
                    ID: {videoId || 'null'} / URL: {url ? 'Present' : 'Missing'}
                </code>
            </div>
        );
    }

    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start', // Align to top
                background: '#f8f8f8',
                // borderRadius: 'var(--radius-md)', // Removed radius for full width
                overflow: 'hidden',
                height: '520px', // Fixed height to crop bottom info
                position: 'relative',
                borderBottom: '1px solid var(--color-border)',
            }}
        >
            {/* Fallback / Loading State */}
            {!isLoaded && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 0,
                    color: 'var(--color-text-muted)',
                    gap: '12px'
                }}>
                    <Loader2 className="animate-spin" size={24} />
                    <p>TikTok 영상 불러오는 중...</p>
                    <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: 'var(--color-primary)',
                            fontSize: '0.9rem',
                            marginTop: '8px',
                            textDecoration: 'underline'
                        }}
                    >
                        앱에서 보기 <ExternalLink size={14} />
                    </a>
                </div>
            )}

            {/* Force TikTok blockquote to have no external margins and align top */}
            <style>{`
                blockquote.tiktok-embed {
                    margin: 0 !important;
                    min-width: unset !important;
                    max-width: unset !important;
                    width: 100% !important;
                }
                iframe {
                    margin: 0 !important;
                }
            `}</style>

            <blockquote
                className="tiktok-embed"
                cite={url}
                data-video-id={videoId}
                style={{
                    maxWidth: '100%',
                    margin: 0,
                    zIndex: 1,
                    width: '100%'
                }}
            >
                <section>
                    <a target="_blank" href={url} rel="noreferrer">
                        {/* Empty link text to avoid ugly flash */}
                    </a>
                </section>
            </blockquote>
        </div>
    );
}
