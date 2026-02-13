import Image from 'next/image';

// ----------------------------------------------------------------------
// UPDATE LOGO HERE
// ----------------------------------------------------------------------
// To change the logo:
// 1. Add your new image file to the 'public' folder.
// 2. Update the path below (e.g., '/my-new-logo.png').
const LOGO_SRC = '/ostack.png';
// ----------------------------------------------------------------------

interface LogoProps {
    className?: string;
    width?: number;
    height?: number;
    priority?: boolean;
}

export default function Logo({
    className,
    width = 120,
    height = 120,
    priority = false
}: LogoProps) {
    return (
        <Image
            src={LOGO_SRC}
            alt="Staqq Logo"
            width={width}
            height={height}
            className={className}
            priority={priority}
        />
    );
}
