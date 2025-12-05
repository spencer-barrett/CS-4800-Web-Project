import { renderToStaticMarkup } from "react-dom/server";
import * as React from "react";

type ColorChangeProps = {
    targetColor?: string;
    size?: number;
    className?: string;
};

export function ColorChange({ targetColor = "#00662f", size = 80, className = "" }: ColorChangeProps) {
    const id = `color-change-${Math.random().toString(36).substr(2, 9)}`;

    // Function to darken a color by a percentage
    const darkenColor = (hex: string, percent: number): string => {
        // Remove # if present
        hex = hex.replace('#', '');

        if (hex.length === 8) {
            hex = hex.substring(0, 6);
        }

        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        r = Math.floor(r * (1 - percent));
        g = Math.floor(g * (1 - percent));
        b = Math.floor(b * (1 - percent));

        const toHex = (n: number) => {
            const hex = n.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    const darkColor = darkenColor(targetColor, 0.6);

    return (
        <svg
            id="Layer_2"
            data-name="Layer 2"
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 109.37 119.98"
            className={className}
        >
            <defs>
                <style>
                    {`
            .${id}-shadow {
              fill: #686868ff;
            }
            .${id}-dark {
              fill: ${darkColor};
            }
            .${id}-main {
              fill: ${targetColor};
            }
            .${id}-main, .${id}-outline {
              stroke: #231f20;
              stroke-miterlimit: 10;
            }
            .${id}-outline {
              fill: none;
            }
          `}
                </style>
            </defs>
            <g id="Layer_6" data-name="Layer 6">
                <ellipse className={`${id}-shadow`} cx="55.04" cy="104.04" rx="54.33" ry="15.94" />
                <circle className={`${id}-main`} cx="54.33" cy="54.33" r="53.83" />
                <path className={`${id}-dark`} d="M108.02,54.33c0-4.48-.56-8.83-1.59-12.99-.65-1.2-.15-2.3-.76-3.25-5.23,25.09-26.5,44.15-50.87,47.61-30.14,4.29-51.06-17.5-52.75-19.32,0,.53.03,1.06.04,1.6,6.04,23.12,27.07,40.18,52.08,40.18,29.73,0,53.83-24.1,53.83-53.83Z" />
                <circle className={`${id}-outline`} cx="54.33" cy="54.33" r="53.83" />
            </g>
        </svg>
    );
}

export function renderColorChangeSVG(targetColor: string | undefined) {
    return renderToStaticMarkup(<ColorChange targetColor={targetColor} />);
}