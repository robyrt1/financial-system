import type { Config } from 'tailwindcss';

export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f0fdf4',
                    500: '#22c55e',
                    600: '#16a34a',
                    900: '#14532d',
                },
            },
        },
    },
    plugins: [],
} satisfies Config;