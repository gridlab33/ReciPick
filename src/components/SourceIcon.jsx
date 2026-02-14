import { Youtube, Instagram, Music, Globe, Link } from 'lucide-react';

export function SourceIcon({ source, size = 16, className }) {
    const props = {
        size,
        className,
        strokeWidth: 2
    };

    switch (source?.toLowerCase()) {
        case 'youtube':
            return <Youtube {...props} />;
        case 'instagram':
            return <Instagram {...props} />;
        case 'tiktok':
            return <Music {...props} />; // TikTok doesn't have a direct Lucide icon, using Music as closest match
        case 'naver':
            return <Globe {...props} />;
        default:
            return <Link {...props} />;
    }
}
