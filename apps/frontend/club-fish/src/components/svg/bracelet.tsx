import { renderToStaticMarkup } from "react-dom/server";
import * as React from "react";

type BraceletProps = {
  braceletColor?: string;
  size?: number;
  className?: string;
};

export function Bracelet({ braceletColor = "#00a774", size = 15, className = "" }: BraceletProps) {
  const braceletId = `bracelet-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      id="Layer_2"
      data-name="Layer 2"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 28.77 22.16"
      className={className}
    >
      <defs>
        <style>
          {`
            .${braceletId}-main {
              fill: ${braceletColor};
              stroke: #231f20;
              stroke-miterlimit: 10;
            }
          `}
        </style>
      </defs>
      <g id="Layer_7" data-name="Layer 7">
        <path className={`${braceletId}-main`} d="M28.07,6.94c-2.91.27-8.86,1.21-14.97,5.28-5.52,3.68-6.3,6.62-7.74,9.11L.62,16.5c1.44-2.49,4.49-7,10.01-10.68C16.74,1.74,22.69.8,25.6.53l2.47,6.41Z"/>
      </g>
    </svg>
  );
}

export function renderBraceletSVG(braceletColor: string | undefined) {
  return renderToStaticMarkup(<Bracelet braceletColor={braceletColor} />);
}