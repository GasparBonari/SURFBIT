import Image from "next/image";
import type { ProductArt as Illustration, ProductImage } from "@/commerce/types";
import styles from "./ProductArt.module.css";

export function ProductArt({ image }: { image: ProductImage }) {
  return (
    <div className={styles.frame}>
      {image.src ? (
        <Image src={image.src} alt={image.alt} fill unoptimized className={styles.photo} />
      ) : (
        <svg viewBox="0 0 160 160" role="img" aria-label={image.alt} className={styles.illustration}>
          <path d="M16 130h128" stroke="var(--sb-sand-dark)" strokeWidth="2" />
          <g fill={image.art.color} stroke="var(--sb-navy-dark)" strokeWidth="3" strokeLinejoin="round">
            <ProductShape {...image.art} />
          </g>
        </svg>
      )}
    </div>
  );
}

function ProductShape({ kind, accent }: Illustration) {
  switch (kind) {
    case "board":
      return <>
        <path d="M80 12C63 21 56 51 57 78c1 22 7 41 14 50h18c7-9 13-28 14-50 1-27-6-57-23-66Z" />
        <path d="M58 67h44v14H58z" fill={accent} />
        <path d="M80 17v45m0 23v39" stroke={accent} strokeWidth="2" />
      </>;
    case "tee":
      return <>
        <path d="m54 34 13-6c3 9 23 9 26 0l13 6 24 22-17 20-12-9v51H59V67l-12 9-17-20Z" />
        <path d="M70 64h20v11H70z" fill={accent} />
      </>;
    case "hoodie":
      return <>
        <path d="m60 48 5-23 15-9 15 9 5 23 19 17 10 50-17 4-11-39v45H59V80l-11 39-17-4 10-50Z" />
        <path d="m65 45 15-15 15 15-15 11Zm5 50h20l6 13H64Z" fill={accent} />
      </>;
    case "shorts":
      return <>
        <path d="M43 48h74l12 62-36 5-13-31-13 31-36-5Z" />
        <path d="M43 48h74l2 13H41Z" fill={accent} />
        <path d="m78 60-6 10m9-10 6 10M45 99l21 3m28 0 21-3" fill="none" stroke={accent} />
      </>;
    case "swim":
      return <>
        <path d="m51 28 12 1c3 24 31 24 34 0l12-1c-5 19-4 39 5 66-9 5-18 18-24 28H70c-6-10-15-23-24-28 9-27 10-47 5-66Z" />
        <path d="M54 67h52l3 11H51Z" fill={accent} />
      </>;
    case "fins":
      return <>
        <path d="M28 109c11-23 16-47 44-56-9 17-12 37-4 56Zm56 0c11-27 15-54 46-67-9 21-15 45-5 67Z" />
        <path d="M28 109h40v9H28zm56 0h41v9H84z" fill={accent} />
      </>;
    case "leash":
      return <>
        <path d="M57 47c-42 10-38 70 3 70 36 0 40-54 6-54-27 0-29 39-4 39 15 0 20-21 8-24" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" />
        <path d="M99 64c5-8 10-12 17-11" fill="none" stroke={accent} strokeWidth="6" />
        <rect x="50" y="26" width="49" height="25" rx="5" />
        <path d="M99 58h25v31H99z" />
        <path d="M59 39h31m18 28h7v13h-7z" stroke={accent} fill={accent} />
      </>;
    case "pad":
      return <>
        <path d="m40 46 22-10v83l-18-7-7-13Zm31-12h18v87H71Zm27 2 22 10 3 53-7 13-18 7Z" />
        <path d="m46 59 8-4m-8 19 8-4m-8 19 8-4m22-31h8m-8 15h8m-8 15h8m-8 15h8m22-44 8 4m-8 11 8 4m-8 11 8 4" stroke={accent} />
      </>;
    case "bag":
      return <>
        <path d="M80 13c-15 0-26 32-26 61s7 54 26 54 26-25 26-54-11-61-26-61Z" />
        <path d="M80 20c-12 0-20 30-20 54s5 45 20 47" fill="none" stroke={accent} strokeWidth="2" />
        <path d="M103 60h9v25h-9zM58 82h44l-2 11H60Z" fill={accent} />
      </>;
    case "wax":
      return <>
        <rect x="60" y="39" width="68" height="43" rx="5" />
        <rect x="45" y="55" width="68" height="43" rx="5" />
        <rect x="30" y="72" width="68" height="43" rx="5" />
        <path d="M30 88h68v14H30z" fill={accent} />
      </>;
    case "wetsuit":
      return <>
        <path d="m58 32 11-4 11 6 11-6 11 4 24 22-14 17-10-7 10 53-25 5-7-26-7 26-25-5 10-53-10 7-14-17Z" />
        <path d="m57 41 14 10h18l14-10 8 8-19 13H68L49 49Z" fill={accent} />
        <path d="M80 68v18" stroke={accent} />
      </>;
  }
}
