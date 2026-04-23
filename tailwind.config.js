/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                surface: '#121414',
                primary: '#d2bbff',
                'primary-container': '#7c3aed',
                secondary: '#ffb690',
                error: '#ffb4ab',
                background: '#000000',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['Space Grotesk', 'monospace'],
                display: ['Space Grotesk', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '0px',
                md: '0px',
                lg: '0px',
                xl: '0px',
                '2xl': '0px',
                '3xl': '0px',
                full: '0px',
            }
        },
    },
    plugins: [],
}
